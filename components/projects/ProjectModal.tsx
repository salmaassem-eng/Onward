"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronDown, GitBranch, Globe, Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { deleteProject, setProjectItemCompleted } from "@/app/actions/projects";
import type { ProjectView } from "@/lib/projects";
import { projectColor } from "./project-styles";

type ProjectModalProps = {
  project: ProjectView | null;
  onClose: () => void;
};

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (project && !dialog.open) dialog.showModal();
    if (!project && dialog.open) dialog.close();
  }, [project]);

  useEffect(() => {
    if (!project) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="project-modal-title"
      className="m-auto w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-stone-900/40 backdrop:backdrop-blur-sm"
    >
      {project && <ModalBody key={project.id} project={project} onClose={onClose} />}
    </dialog>
  );
}

function ModalBody({
  project,
  onClose,
}: {
  project: ProjectView;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const color = projectColor(project.id);

  function setDone(kind: "milestone" | "task", id: number, completed: boolean) {
    startTransition(async () => {
      try {
        await setProjectItemCompleted(kind, id, completed);
      } catch {
        toast.error("Couldn't save that. Please try again.");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${project.title}" and all its milestones?`)) return;
    startTransition(async () => {
      try {
        await deleteProject(project.id);
        toast.success("Project deleted.");
        onClose();
      } catch {
        toast.error("Couldn't delete the project.");
      }
    });
  }

  const linkClass =
    "inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50";

  return (
    <div className="max-h-[90vh] overflow-y-auto p-8">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="text-sm text-stone-400">
        {project.goalTitle ? `Goal: ${project.goalTitle}` : "Freelance project"}
      </p>
      <h2
        id="project-modal-title"
        className="font-heading mt-1 pr-12 text-3xl font-bold text-stone-900"
      >
        {project.title}
      </h2>
      {project.description && (
        <p className="mt-2 leading-relaxed text-stone-500">{project.description}</p>
      )}

      <div className="mt-6 flex items-baseline justify-between">
        <span className="text-stone-500">Overall progress</span>
        <span className="font-heading text-3xl font-bold text-stone-900">
          {project.progress}%
        </span>
      </div>
      <div className="mt-2 h-2.5 rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full ${color.bar}`}
          style={{ width: `${project.progress}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-stone-400">
        {project.deadlineLabel === "No deadline"
          ? "No deadline"
          : `Deadline: ${project.deadlineLabel}`}
      </p>

      {/* links */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <GitBranch className="h-4 w-4" />
            GitHub
          </a>
        )}
        {project.deployUrl && (
          <a
            href={project.deployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} border-green-200 bg-green-50 text-green-700 hover:bg-green-100`}
          >
            <Globe className="h-4 w-4" />
            Live site
          </a>
        )}
        {!project.isFinished && (
          <p className="text-sm text-stone-400">
            Finish every milestone to unlock your live link.
          </p>
        )}
        {project.isFinished && !project.deployUrl && (
          <Link
            href={`/projects/${project.id}`}
            className="text-sm font-semibold text-green-600 hover:underline"
          >
            Finished! Add your live link →
          </Link>
        )}
      </div>

      {/* next step */}
      <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-5">
        <p className="text-sm font-semibold text-green-700">
          {project.nextAction ? "Next step" : "Project complete"}
        </p>
        <p className="mt-1 font-medium text-stone-900">
          {project.nextAction?.title ?? "Every milestone is finished. Nice work."}
        </p>
      </div>

      {/* milestones */}
      <h3 className="font-heading mt-8 text-lg font-semibold text-stone-900">
        Milestones
      </h3>
      <ul className={`mt-4 space-y-3 transition ${isPending ? "opacity-70" : ""}`}>
        {project.milestones.map((m) => {
          const hasTasks = m.tasks.length > 0;
          const open = hasTasks && (overrides[m.id] ?? m.status === "current");
          const isCurrent = m.status === "current";
          const isDone = m.status === "done";

          const markerClass = `flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
            isDone
              ? "border-green-500 bg-green-500 text-white"
              : isCurrent
              ? "border-green-400 bg-green-100"
              : "border-stone-200 bg-stone-100"
          }`;

          return (
            <li
              key={m.id}
              className={`rounded-2xl border p-4 ${
                isCurrent
                  ? "border-green-200 bg-green-50"
                  : isDone
                  ? "border-stone-100 bg-stone-50"
                  : "border-stone-100 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {hasTasks ? (
                  <span className={markerClass}>
                    {isDone && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isPending}
                    aria-pressed={m.completed}
                    aria-label={
                      m.completed
                        ? `Mark "${m.title}" as not finished`
                        : `Mark "${m.title}" as finished`
                    }
                    onClick={() => setDone("milestone", m.id, !m.completed)}
                    className={`${markerClass} hover:border-green-500`}
                  >
                    {isDone && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </button>
                )}

                <button
                  type="button"
                  disabled={!hasTasks}
                  aria-expanded={hasTasks ? open : undefined}
                  onClick={() =>
                    setOverrides((prev) => ({
                      ...prev,
                      [m.id]: !(prev[m.id] ?? isCurrent),
                    }))
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                >
                  <span
                    className={`min-w-0 flex-1 truncate font-medium ${
                      isDone
                        ? "text-stone-400 line-through"
                        : isCurrent
                        ? "text-stone-900"
                        : "text-stone-500"
                    }`}
                  >
                    {m.title}
                  </span>
                  {isCurrent && hasTasks && (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                      {m.progress}%
                    </span>
                  )}
                  {hasTasks && (
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-stone-400 transition ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              </div>

              {open && (
                <ul className="mt-3 space-y-1 pl-10">
                  {m.tasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-3 py-1">
                      <button
                        type="button"
                        disabled={isPending}
                        aria-pressed={task.completed}
                        aria-label={
                          task.completed
                            ? `Mark "${task.title}" as not finished`
                            : `Mark "${task.title}" as finished`
                        }
                        onClick={() => setDone("task", task.id, !task.completed)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          task.completed
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-stone-300 bg-white hover:border-green-500"
                        }`}
                      >
                        {task.completed && (
                          <Check className="h-3 w-3" strokeWidth={3} />
                        )}
                      </button>
                      <span
                        className={`text-sm ${
                          task.completed
                            ? "text-stone-400 line-through"
                            : "text-stone-700"
                        }`}
                      >
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {/* actions */}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-6">
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          <Pencil className="h-4 w-4" />
          Edit project
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
}