"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ExternalLink, Pencil, Trash2, Trophy } from "lucide-react";
import { toast } from "react-toastify";
import { deleteCourse, setLessonCompleted, touchCourse } from "@/app/actions/courses";
import type { CourseView } from "@/lib/learning";
import ConfirmModal from "@/components/ui/ConfirmModal";
import CourseThumb from "./CourseThump";

export default function CourseDetail({ course }: { course: CourseView }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [confirming, setConfirming] = useState(false);
  const next = course.next;

  function tick(id: number, completed: boolean) {
    startTransition(async () => {
      try {
        await setLessonCompleted(id, completed);
        if (completed) toast.success("Nice. Lesson finished.");
        else toast.info("Moved back to to-do.");
      } catch {
        toast.error("Couldn't save that. Please try again.");
      }
    });
  }

  function onContinue() {
    startTransition(async () => {
      try {
        await touchCourse(course.id);
      } catch {
        // the link still opens, so this is not worth an error
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        await deleteCourse(course.id);
        toast.success("Course deleted.");
        setConfirming(false);
        router.replace("/learning");
      } catch {
        toast.error("Couldn't delete the course.");
      }
    });
  }

  const heroButton =
    "inline-flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white";

  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <CourseThumb src={course.thumbnailUrl} className="h-48 sm:h-56">
        <div className="absolute right-4 top-4 flex gap-2">
          <Link href={`/learning/${course.id}`} className={heroButton}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={`${heroButton} hover:!text-red-600`}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
        <div className="absolute inset-x-6 bottom-5">
          {course.providerLabel && (
            <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
              {course.providerLabel}
            </span>
          )}
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            {course.title}
          </h2>
          <p className="mt-1 text-white/80">{course.subtitle}</p>
        </div>
      </CourseThumb>

      <div className="space-y-5 p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-4">
            <div className="h-2.5 flex-1 rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <span className="font-heading text-2xl font-bold text-stone-900">
              {course.progress}%
            </span>
          </div>
          <p className="mt-2 text-sm text-stone-400">
            {course.lessonsDone} of {course.lessonsTotal} lessons complete
            {course.modulesTotal > 1 &&
              ` · ${course.modulesDone} of ${course.modulesTotal} modules`}
          </p>
        </div>

        {/* continue */}
        {next ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-green-100 bg-green-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Continue where you left off
              </p>
              <p className="font-heading mt-2 text-lg font-semibold text-stone-900">
                {next.title}
              </p>
              <p className="mt-1 truncate text-sm text-stone-500">Module: {next.module}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {next.url && (
                <a
                  href={next.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onContinue}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                >
                  Continue
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => tick(next.id, true)}
                className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-5 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-60"
              >
                <Check className="h-4 w-4" strokeWidth={3} />
                Mark finished
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50 p-5">
            <Trophy className="h-6 w-6 text-green-600" />
            <p className="font-medium text-stone-800">
              Course complete. Look how far you came.
            </p>
          </div>
        )}

        {/* modules */}
        <ul className={`space-y-3 transition ${pending ? "opacity-70" : ""}`}>
          {course.modules.map((m) => {
            const isDone = m.status === "done";
            const isCurrent = m.status === "current";
            const open = overrides[m.id] ?? isCurrent;

            return (
              <li
                key={m.id}
                className={`rounded-2xl border ${
                  isCurrent
                    ? "border-green-200 bg-green-50"
                    : isDone
                    ? "border-stone-100 bg-stone-50/60"
                    : "border-stone-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOverrides((prev) => ({ ...prev, [m.id]: !open }))}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isDone
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "border-2 border-green-500 bg-white"
                        : "border-2 border-stone-200 bg-stone-100"
                    }`}
                  >
                    {isDone && <Check className="h-4 w-4" strokeWidth={3} />}
                    {isCurrent && <span className="h-2.5 w-2.5 rounded-full bg-green-500" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`font-heading block truncate font-semibold ${
                        isDone || m.status === "upcoming" ? "text-stone-600" : "text-stone-900"
                      }`}
                    >
                      {m.title}
                    </span>
                    <span className="block text-sm text-stone-400">
                      {isDone
                        ? `${m.total} ${m.total === 1 ? "lesson" : "lessons"} · completed`
                        : `${m.doneCount}/${m.total} lessons`}
                    </span>
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                      {m.progress}%
                    </span>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-stone-400 transition ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {open && (
                  <ul className="border-t border-stone-200/70 px-4 py-2">
                    {m.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center gap-3 py-2">
                        <button
                          type="button"
                          disabled={pending}
                          aria-pressed={lesson.completed}
                          aria-label={
                            lesson.completed
                              ? `Mark "${lesson.title}" as not finished`
                              : `Mark "${lesson.title}" as finished`
                          }
                          onClick={() => tick(lesson.id, !lesson.completed)}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                            lesson.completed
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-stone-300 bg-white hover:border-green-500"
                          }`}
                        >
                          {lesson.completed && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </button>
                        <span
                          className={`min-w-0 flex-1 text-sm ${
                            lesson.completed
                              ? "text-stone-400 line-through"
                              : lesson.id === next?.id
                              ? "font-semibold text-stone-900"
                              : "text-stone-700"
                          }`}
                        >
                          {lesson.title}
                        </span>
                        {lesson.url && (
                          <a
                            href={lesson.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onContinue}
                            aria-label={`Open "${lesson.title}"`}
                            title="Open this lesson"
                            className="shrink-0 rounded-md p-1.5 text-stone-400 transition hover:bg-white hover:text-green-600"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <ConfirmModal
        open={confirming}
        title="Delete this course?"
        text={`"${course.title}" and all its lessons will be deleted. This can't be undone.`}
        loading={pending}
        onConfirm={remove}
        onClose={() => setConfirming(false)}
      />
    </section>
  );
}