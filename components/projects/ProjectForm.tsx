"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CornerDownRight,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/app/actions/projects";
import { swap } from "@/lib/array";
import {
  MAX_MILESTONES,
  MAX_TASKS,
  PROJECT_STATUSES,
  validateProject,
  type ProjectFormErrors,
  type ProjectFormValues,
} from "@/lib/projects";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

type TaskState = { key: string; id?: number; title: string; completed: boolean };
type MilestoneState = {
  key: string;
  id?: number;
  title: string;
  completed: boolean;
  tasks: TaskState[];
};

type ProjectFormProps = {
  projectId?: number;
  goals: { id: number; title: string }[];
  isFinished?: boolean;
  initial?: {
    title: string;
    description: string;
    goalId: string;
    status: string;
    deadline: string;
    githubUrl: string;
    deployUrl: string;
    milestones: {
      id: number;
      title: string;
      completed: boolean;
      tasks: { id: number; title: string; completed: boolean }[];
    }[];
  };
};

const fieldBase =
  "rounded-xl border bg-white text-stone-900 outline-none transition placeholder:text-stone-400 focus:ring-2";
const fieldOk = "border-stone-200 focus:border-green-500 focus:ring-green-500/40";
const fieldBad = "border-red-400 focus:ring-red-400/30";
const iconButton =
  "rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30 disabled:hover:bg-transparent";

export default function ProjectForm({
  projectId,
  goals,
  isFinished = false,
  initial,
}: ProjectFormProps) {
  const router = useRouter();
  const isEdit = projectId !== undefined;

  const nextKey = useRef(1);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [goalId, setGoalId] = useState(initial?.goalId ?? "");
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? "");
  const [deployUrl, setDeployUrl] = useState(initial?.deployUrl ?? "");
  const [milestones, setMilestones] = useState<MilestoneState[]>(() =>
    initial
      ? initial.milestones.map((m) => ({
          key: `m-${m.id}`,
          id: m.id,
          title: m.title,
          completed: m.completed,
          tasks: m.tasks.map((t) => ({
            key: `t-${t.id}`,
            id: t.id,
            title: t.title,
            completed: t.completed,
          })),
        }))
      : [{ key: "new-0", title: "", completed: false, tasks: [] }]
  );
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // the live link unlocks only while every milestone is finished
  // (adding a new milestone or task locks it again)
  const canAddDeploy =
    isEdit &&
    isFinished &&
    milestones.every(
      (m) =>
        m.id !== undefined &&
        (m.tasks.length > 0 ? m.tasks.every((t) => t.completed) : m.completed)
    );

  function clearError(field: keyof ProjectFormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function patchMilestone(key: string, fn: (m: MilestoneState) => MilestoneState) {
    setMilestones((prev) => prev.map((m) => (m.key === key ? fn(m) : m)));
    clearError("milestones");
  }

  function addMilestone() {
    if (milestones.length >= MAX_MILESTONES) return;
    const key = `new-${nextKey.current++}`;
    setMilestones((prev) => [
      ...prev,
      { key, title: "", completed: false, tasks: [] },
    ]);
    setFocusKey(key);
    clearError("milestones");
  }

  function removeMilestone(key: string) {
    setMilestones((prev) =>
      prev.length <= 1 ? prev : prev.filter((m) => m.key !== key)
    );
  }

  function addTask(milestoneKey: string) {
    const key = `task-new-${nextKey.current++}`;
    patchMilestone(milestoneKey, (m) =>
      m.tasks.length >= MAX_TASKS
        ? m
        : { ...m, tasks: [...m.tasks, { key, title: "", completed: false }] }
    );
    setFocusKey(key);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const values: ProjectFormValues = {
      title,
      description,
      goalId,
      status,
      deadline,
      githubUrl,
      deployUrl,
      milestones: milestones.map((m) => ({
        id: m.id,
        title: m.title,
        tasks: m.tasks.map((t) => ({ id: t.id, title: t.title })),
      })),
    };

    const validationErrors = validateProject(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateProject(projectId, values)
        : await createProject(values);

      if (!result.ok) {
        if (result.errors) setErrors(result.errors);
        if (result.message) toast.error(result.message);
        return;
      }

      toast.success(isEdit ? "Project updated!" : "Project created!");
      router.push("/projects");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    if (!confirm("Delete this project, its milestones and tasks?")) return;

    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      toast.success("Project deleted.");
      router.push("/projects");
    } catch {
      toast.error("Couldn't delete the project.");
      setIsDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8"
    >
      {isEdit && (
        <div className="flex items-center justify-between border-b border-stone-100 pb-5">
          <p className="text-sm text-stone-400">Editing this project</p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete project"}
          </button>
        </div>
      )}

      <FormField
        label="Project name"
        id="project-title"
        placeholder="Restaurant App"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          clearError("title");
        }}
        error={errors.title}
      />

      <div>
        <label
          htmlFor="project-description"
          className="mb-2 block text-sm font-medium text-stone-700"
        >
          Description (optional)
        </label>
        <textarea
          id="project-description"
          rows={3}
          placeholder="What are you building?"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError("description");
          }}
          className={`${fieldBase} w-full resize-none px-5 py-3.5 ${
            errors.description ? fieldBad : fieldOk
          }`}
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="project-goal"
          className="mb-2 block text-sm font-medium text-stone-700"
        >
          Connected goal
        </label>
        <select
          id="project-goal"
          value={goalId}
          onChange={(e) => {
            setGoalId(e.target.value);
            clearError("goalId");
          }}
          className={`${fieldBase} w-full px-5 py-3.5 ${
            errors.goalId ? fieldBad : fieldOk
          }`}
        >
          <option value="">Freelance project (no goal)</option>
          {goals.map((g) => (
            <option key={g.id} value={String(g.id)}>
              {g.title}
            </option>
          ))}
        </select>
        {errors.goalId && (
          <p className="mt-1.5 text-sm text-red-500">{errors.goalId}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          label="Deadline (optional)"
          id="project-deadline"
          type="date"
          value={deadline}
          onChange={(e) => {
            setDeadline(e.target.value);
            clearError("deadline");
          }}
          error={errors.deadline}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">Status</p>
          <div className="flex gap-2">
            {PROJECT_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={status === s}
                onClick={() => {
                  setStatus(s);
                  clearError("status");
                }}
                className={`flex-1 rounded-xl border py-3.5 text-sm font-medium capitalize transition ${
                  status === s
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-stone-200 text-stone-500 hover:bg-stone-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-sm text-stone-400">
            It shows as Completed by itself when everything is done.
          </p>
        </div>
      </div>

      {/* links */}
      <div className="space-y-6">
        <FormField
          label="GitHub link (optional)"
          id="project-github"
          placeholder="github.com/you/project"
          autoComplete="off"
          value={githubUrl}
          onChange={(e) => {
            setGithubUrl(e.target.value);
            clearError("githubUrl");
          }}
          error={errors.githubUrl}
        />

        <div>
          <label
            htmlFor="project-deploy"
            className="mb-2 block text-sm font-medium text-stone-700"
          >
            Live link (optional)
          </label>
          <input
            id="project-deploy"
            placeholder="myproject.vercel.app"
            autoComplete="off"
            disabled={!canAddDeploy}
            value={deployUrl}
            onChange={(e) => {
              setDeployUrl(e.target.value);
              clearError("deployUrl");
            }}
            className={`${fieldBase} w-full px-5 py-3.5 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400 ${
              errors.deployUrl ? fieldBad : fieldOk
            }`}
          />
          {errors.deployUrl && (
            <p className="mt-1.5 text-sm text-red-500">{errors.deployUrl}</p>
          )}
          {!canAddDeploy && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-400">
              <Lock className="h-3.5 w-3.5" />
              Finish every milestone first, then add your deployment link here.
            </p>
          )}
        </div>
      </div>

      {/* milestones */}
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-stone-700">Milestones</p>
          <span className="text-xs text-stone-400">
            {milestones.length}/{MAX_MILESTONES}
          </span>
        </div>
        <p className="mb-3 mt-1 text-sm text-stone-400">
          Milestones are the big parts of the project. Add tasks under a
          milestone for the small things to do.
        </p>

        <ul className="space-y-3">
          {milestones.map((m, i) => (
            <li
              key={m.key}
              className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-stone-500">
                  {i + 1}
                </span>
                <input
                  aria-label={`Milestone ${i + 1}`}
                  placeholder="Describe this milestone"
                  value={m.title}
                  autoFocus={m.key === focusKey}
                  onChange={(e) =>
                    patchMilestone(m.key, (x) => ({ ...x, title: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMilestone();
                    }
                  }}
                  className={`${fieldBase} ${fieldOk} min-w-0 flex-1 px-4 py-2.5`}
                />
                {m.completed && m.tasks.length === 0 && (
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                    Done
                  </span>
                )}
                <div className="flex shrink-0">
                  <button
                    type="button"
                    onClick={() => setMilestones((prev) => swap(prev, i, -1))}
                    disabled={i === 0}
                    aria-label={`Move milestone ${i + 1} up`}
                    className={iconButton}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMilestones((prev) => swap(prev, i, 1))}
                    disabled={i === milestones.length - 1}
                    aria-label={`Move milestone ${i + 1} down`}
                    className={iconButton}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMilestone(m.key)}
                    disabled={milestones.length <= 1}
                    aria-label={`Remove milestone ${i + 1}`}
                    className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {m.tasks.length > 0 && (
                <ul className="ml-4 mt-3 space-y-2 border-l-2 border-stone-200 pl-4">
                  {m.tasks.map((task, j) => (
                    <li key={task.key} className="flex items-center gap-1">
                      <input
                        aria-label={`Task ${j + 1} of milestone ${i + 1}`}
                        placeholder="Describe this task"
                        value={task.title}
                        autoFocus={task.key === focusKey}
                        onChange={(e) =>
                          patchMilestone(m.key, (x) => ({
                            ...x,
                            tasks: x.tasks.map((t) =>
                              t.key === task.key
                                ? { ...t, title: e.target.value }
                                : t
                            ),
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTask(m.key);
                          }
                        }}
                        className={`${fieldBase} ${fieldOk} min-w-0 flex-1 px-3 py-2 text-sm`}
                      />
                      {task.completed && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Done
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          patchMilestone(m.key, (x) => ({
                            ...x,
                            tasks: swap(x.tasks, j, -1),
                          }))
                        }
                        disabled={j === 0}
                        aria-label="Move task up"
                        className={iconButton}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          patchMilestone(m.key, (x) => ({
                            ...x,
                            tasks: swap(x.tasks, j, 1),
                          }))
                        }
                        disabled={j === m.tasks.length - 1}
                        aria-label="Move task down"
                        className={iconButton}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          patchMilestone(m.key, (x) => ({
                            ...x,
                            tasks: x.tasks.filter((t) => t.key !== task.key),
                          }))
                        }
                        aria-label="Remove task"
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
                onClick={() => addTask(m.key)}
                disabled={m.tasks.length >= MAX_TASKS}
                className="ml-4 mt-3 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-green-600 disabled:opacity-40"
              >
                <CornerDownRight className="h-4 w-4" />
                Add task
              </button>
            </li>
          ))}
        </ul>

        {errors.milestones && (
          <p className="mt-2 text-sm text-red-500">{errors.milestones}</p>
        )}

        <button
          type="button"
          onClick={addMilestone}
          disabled={milestones.length >= MAX_MILESTONES}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-green-600 hover:underline disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Add milestone
        </button>
      </div>

      <div className="pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save changes →" : "Create project →"}
        </Button>
      </div>
    </form>
  );
}