"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, CornerDownRight, Download, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  createCourse,
  deleteCourse,
  importCourse,
  updateCourse,
} from "@/app/actions/courses";
import { swap } from "@/lib/array";
import {
  MAX_LESSONS_TOTAL,
  MAX_MODULES,
  parseLessonList,
  validateCourse,
  type CourseFormErrors,
  type CourseFormValues,
} from "@/lib/learning";
import { reportErrors } from "@/lib/notify";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import CourseThumb from "./CourseThump";

type LessonState = { key: string; id?: number; title: string; url: string; completed: boolean };
type ModuleState = { key: string; id?: number; title: string; lessons: LessonState[] };

type CourseFormProps = {
  courseId?: number;
  goals: { id: number; title: string }[];
  initial?: {
    title: string;
    url: string;
    thumbnailUrl: string;
    goalId: string;
    modules: {
      id: number;
      title: string;
      lessons: { id: number; title: string; url: string; completed: boolean }[];
    }[];
  };
};

const fieldBase =
  "rounded-xl border bg-white text-stone-900 outline-none transition placeholder:text-stone-400 focus:ring-2";
const fieldOk = "border-stone-200 focus:border-green-500 focus:ring-green-500/40";
const fieldBad = "border-red-400 focus:ring-red-400/30";
const iconButton =
  "rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30 disabled:hover:bg-transparent";

export default function CourseForm({ courseId, goals, initial }: CourseFormProps) {
  const router = useRouter();
  const isEdit = courseId !== undefined;

  const nextKey = useRef(1);
  const newKey = (prefix: string) => `${prefix}-new-${nextKey.current++}`;

  const [url, setUrl] = useState(initial?.url ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const [goalId, setGoalId] = useState(initial?.goalId ?? "");
  const [modules, setModules] = useState<ModuleState[]>(() =>
    initial
      ? initial.modules.map((m) => ({
          key: `m-${m.id}`,
          id: m.id,
          title: m.title,
          lessons: m.lessons.map((l) => ({
            key: `l-${l.id}`,
            id: l.id,
            title: l.title,
            url: l.url,
            completed: l.completed,
          })),
        }))
      : [
          {
            key: "m-new-0",
            title: "Lessons",
            lessons: [{ key: "l-new-0", title: "", url: "", completed: false }],
          },
        ]
  );
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [notice, setNotice] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteModule, setPasteModule] = useState("");

  function clearError(field: keyof CourseFormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function patchModule(key: string, fn: (m: ModuleState) => ModuleState) {
    setModules((prev) => prev.map((m) => (m.key === key ? fn(m) : m)));
    clearError("content");
  }

  function addModule() {
    if (modules.length >= MAX_MODULES) return;
    const key = newKey("m");
    setModules((prev) => [...prev, { key, title: "", lessons: [] }]);
    setFocusKey(key);
    clearError("content");
  }

  function addLesson(moduleKey: string) {
    const key = newKey("l");
    patchModule(moduleKey, (m) => ({
      ...m,
      lessons: [...m.lessons, { key, title: "", url: "", completed: false }],
    }));
    setFocusKey(key);
  }

  function addPasted() {
    const lines = parseLessonList(pasteText);
    if (lines.length === 0) {
      toast.error("Paste at least one lesson first.");
      return;
    }
    const isBlank = (m: ModuleState) =>
      m.title.trim() === "" && m.lessons.every((l) => l.title.trim() === "");

    setModules((prev) => [
      ...prev.filter((m) => !isBlank(m)),
      {
        key: newKey("m"),
        title: pasteModule.trim().slice(0, 100) || "Lessons",
        lessons: lines.map((line) => ({
          key: newKey("l"),
          title: line,
          url: "",
          completed: false,
        })),
      },
    ]);
    setPasteText("");
    setPasteModule("");
    clearError("content");
    toast.success(`Added ${lines.length} ${lines.length === 1 ? "lesson" : "lessons"}.`);
  }

  async function runImport() {
    if (!url.trim()) {
      const found = { url: "Paste the course link first." };
      setErrors(found);
      reportErrors(found);
      return;
    }

    setImporting(true);
    setNotice(null);
    try {
      const result = await importCourse(url);

      if (!result.ok) {
        setNotice({ tone: "warn", text: result.message });
        toast.error(result.message);
        return;
      }

      const c = result.course;
      setUrl(c.url);
      if (c.title) setTitle(c.title);
      setThumbnailUrl(c.thumbnailUrl ?? "");
      if (c.modules.length > 0) {
        setModules(
          c.modules.map((m) => ({
            key: newKey("m"),
            title: m.title,
            lessons: m.lessons.map((l) => ({
              key: newKey("l"),
              title: l.title,
              url: l.url ?? "",
              completed: false,
            })),
          }))
        );
      }
      setErrors({});
      setNotice({ tone: result.found > 0 ? "ok" : "warn", text: result.notice });

      if (result.found > 0) {
        toast.success(`Imported ${result.found} ${result.found === 1 ? "lesson" : "lessons"}.`);
      } else {
        toast.info("Got the details. Add the lessons yourself.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setImporting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const values: CourseFormValues = {
      title,
      url,
      thumbnailUrl,
      goalId,
      modules: modules.map((m) => ({
        id: m.id,
        title: m.title,
        lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, url: l.url })),
      })),
    };

    const found = validateCourse(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      reportErrors(found);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateCourse(courseId, values)
        : await createCourse(values);

      if (!result.ok) {
        if (result.errors) {
          setErrors(result.errors);
          reportErrors(result.errors);
        }
        if (result.message) toast.error(result.message);
        return;
      }

      toast.success(isEdit ? "Course updated!" : "Course added!");
      router.push(result.id ? `/learning?course=${result.id}` : "/learning");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    setIsDeleting(true);
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted.");
      router.push("/learning");
    } catch {
      toast.error("Couldn't delete the course.");
      setIsDeleting(false);
      setConfirming(false);
    }
  }

  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8"
      >
        {isEdit && (
          <div className="flex items-center justify-between border-b border-stone-100 pb-5">
            <p className="text-sm text-stone-400">Editing this course</p>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete course
            </button>
          </div>
        )}

        {/* link + import */}
        <div>
          <FormField
            label="Course link (optional)"
            id="course-url"
            placeholder="https://www.youtube.com/playlist?list=..."
            autoComplete="off"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              clearError("url");
            }}
            error={errors.url}
          />
          <p className="mt-1.5 text-sm text-stone-400">
            YouTube, Udemy, Coursera or any website. Leave it empty if the course has no link.
          </p>

          {!isEdit && (
            <button
              type="button"
              onClick={runImport}
              disabled={importing}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {importing ? "Fetching details..." : "Fetch course details"}
            </button>
          )}

          {notice && (
            <p
              role="status"
              className={`mt-3 rounded-xl border px-4 py-3 text-sm ${
                notice.tone === "ok"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {notice.text}
            </p>
          )}
        </div>

        {/* title + image */}
        <div className="flex items-start gap-4">
          {thumbnailUrl && (
            <div className="shrink-0">
              <CourseThumb src={thumbnailUrl} className="h-20 w-32 rounded-xl" />
              <button
                type="button"
                onClick={() => setThumbnailUrl("")}
                className="mt-1.5 text-xs font-semibold text-stone-400 hover:text-red-600"
              >
                Remove image
              </button>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <FormField
              label="Course name"
              id="course-title"
              placeholder="Next.js Complete Course"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearError("title");
              }}
              error={errors.title}
            />
          </div>
        </div>

        {/* goal */}
        <div>
          <label
            htmlFor="course-goal"
            className="mb-2 block text-sm font-medium text-stone-700"
          >
            Connected goal
          </label>
          <select
            id="course-goal"
            value={goalId}
            aria-invalid={!!errors.goalId}
            onChange={(e) => {
              setGoalId(e.target.value);
              clearError("goalId");
            }}
            className={`${fieldBase} w-full px-5 py-3.5 ${errors.goalId ? fieldBad : fieldOk}`}
          >
            <option value="">Not connected to a goal</option>
            {goals.map((g) => (
              <option key={g.id} value={String(g.id)}>
                {g.title}
              </option>
            ))}
          </select>
          {errors.goalId && <p className="mt-1.5 text-sm text-red-500">{errors.goalId}</p>}
        </div>

        {/* content */}
        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-stone-700">Modules and lessons</p>
            <span className="text-xs text-stone-400">
              {lessonCount}/{MAX_LESSONS_TOTAL} lessons
            </span>
          </div>
          <p className="mb-3 mt-1 text-sm text-stone-400">
            A module is a section of the course. Playlists import as one module.
          </p>

          <ul className="space-y-3">
            {modules.map((m, i) => (
              <li key={m.key} className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-stone-500">
                    {i + 1}
                  </span>
                  <input
                    aria-label={`Module ${i + 1}`}
                    placeholder="Module title"
                    value={m.title}
                    autoFocus={m.key === focusKey}
                    onChange={(e) => patchModule(m.key, (x) => ({ ...x, title: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.preventDefault();
                    }}
                    className={`${fieldBase} ${fieldOk} min-w-0 flex-1 px-4 py-2.5 font-medium`}
                  />
                  <div className="flex shrink-0">
                    <button
                      type="button"
                      onClick={() => setModules((prev) => swap(prev, i, -1))}
                      disabled={i === 0}
                      aria-label={`Move module ${i + 1} up`}
                      className={iconButton}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModules((prev) => swap(prev, i, 1))}
                      disabled={i === modules.length - 1}
                      aria-label={`Move module ${i + 1} down`}
                      className={iconButton}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setModules((prev) =>
                          prev.length <= 1 ? prev : prev.filter((x) => x.key !== m.key)
                        )
                      }
                      disabled={modules.length <= 1}
                      aria-label={`Remove module ${i + 1}`}
                      className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {m.lessons.length > 0 && (
                  <ul className="ml-4 mt-3 space-y-2 border-l-2 border-stone-200 pl-4">
                    {m.lessons.map((lesson, j) => (
                      <li key={lesson.key} className="flex items-center gap-1">
                        <input
                          aria-label={`Lesson ${j + 1} of module ${i + 1}`}
                          placeholder="Lesson title"
                          value={lesson.title}
                          autoFocus={lesson.key === focusKey}
                          onChange={(e) =>
                            patchModule(m.key, (x) => ({
                              ...x,
                              lessons: x.lessons.map((l) =>
                                l.key === lesson.key ? { ...l, title: e.target.value } : l
                              ),
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addLesson(m.key);
                            }
                          }}
                          className={`${fieldBase} ${fieldOk} min-w-0 flex-1 px-3 py-2 text-sm`}
                        />
                        {lesson.completed && (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                            Done
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            patchModule(m.key, (x) => ({ ...x, lessons: swap(x.lessons, j, -1) }))
                          }
                          disabled={j === 0}
                          aria-label="Move lesson up"
                          className={iconButton}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            patchModule(m.key, (x) => ({ ...x, lessons: swap(x.lessons, j, 1) }))
                          }
                          disabled={j === m.lessons.length - 1}
                          aria-label="Move lesson down"
                          className={iconButton}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            patchModule(m.key, (x) => ({
                              ...x,
                              lessons: x.lessons.filter((l) => l.key !== lesson.key),
                            }))
                          }
                          aria-label="Remove lesson"
                          className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={() => addLesson(m.key)}
                  className="ml-4 mt-3 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-green-600"
                >
                  <CornerDownRight className="h-4 w-4" />
                  Add lesson
                </button>
              </li>
            ))}
          </ul>

          {errors.content && (
            <p data-form-error className="mt-2 text-sm text-red-500">
              {errors.content}
            </p>
          )}

          <button
            type="button"
            onClick={addModule}
            disabled={modules.length >= MAX_MODULES}
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-green-600 hover:underline disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add module
          </button>

          <details className="mt-5 rounded-2xl border border-stone-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-stone-700">
              Paste a list of lessons
            </summary>
            <p className="mt-2 text-sm text-stone-500">
              Copy the lesson list from the course page and paste it here, one lesson per
              line. Numbers and bullets are removed for you.
            </p>
            <input
              aria-label="Module name for the pasted lessons"
              placeholder="Module name (optional)"
              value={pasteModule}
              onChange={(e) => setPasteModule(e.target.value)}
              className={`${fieldBase} ${fieldOk} mt-3 w-full px-4 py-2.5 text-sm`}
            />
            <textarea
              aria-label="Lessons to paste"
              rows={5}
              placeholder={"1. Introduction\n2. Project setup\n3. Routing"}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className={`${fieldBase} ${fieldOk} mt-3 w-full resize-y px-4 py-3 text-sm`}
            />
            <button
              type="button"
              onClick={addPasted}
              className="mt-3 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              Add these lessons
            </button>
          </details>
        </div>

        <div className="pt-2">
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save changes →" : "Add course →"}
          </Button>
        </div>
      </form>

      <ConfirmModal
        open={confirming}
        title="Delete this course?"
        text="The course and all its lessons will be deleted. This can't be undone."
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}