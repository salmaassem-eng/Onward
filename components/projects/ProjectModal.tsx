"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronDown, GitBranch, Globe, Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { deleteProject, setProjectItemCompleted } from "@/app/actions/projects";
import type { ProjectView } from "@/lib/projects";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { projectColor } from "./project-styles";

type ProjectModalProps = { project: ProjectView | null; onClose: () => void };

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <Modal open={project !== null} onClose={onClose} labelledBy="project-modal-title" width="max-w-2xl">
      {project && <Body key={project.id} project={project} onClose={onClose} />}
    </Modal>
  );
}

function Body({ project, onClose }: { project: ProjectView; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [confirming, setConfirming] = useState(false);
  const color = projectColor(project.id);

  function setDone(kind: "milestone" | "task", id: number, completed: boolean) {
    startTransition(async () => {
      try {
        await setProjectItemCompleted(kind, id, completed);
        if (completed) toast.success("Nice. Marked as finished.");
        else toast.info("Moved back to to-do.");
      } catch {
        toast.error("Couldn't save that. Please try again.");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        await deleteProject(project.id);
        toast.success("Project deleted.");
        setConfirming(false);
        onClose();
      } catch {
        toast.error("Couldn't delete the project.");
      }
    });
  }

  const linkClass =
    "inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3.5 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50";

  return (
    <>
      {/* header on a tinted background */}
      <div className={`relative shrink-0 px-7 pb-5 pt-6 ${color.tint}`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-600 transition hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs font-medium text-stone-500">
          {project.goalTitle ? `Goal: ${project.goalTitle}` : "Freelance project"}
        </p>
        <h2 id="project-modal-title" className="font-heading mt-1 pr-12 text-2xl font-bold text-stone-900">
          {project.title}
        </h2>
        {project.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{project.description}</p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-white">
            <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${project.progress}%` }} />
          </div>
          <span className="font-heading text-lg font-bold text-stone-900">{project.progress}%</span>
          <span className="hidden text-xs text-stone-500 sm:inline">
            {project.deadlineLabel === "No deadline" ? "No deadline" : `Due ${project.deadlineLabel}`}
          </span>
        </div>
      </div>

      <div className={`min-h-0 flex-1 space-y-4 overflow-y-auto px-7 py-5 transition ${isPending ? "opacity-70" : ""}`}>
        {/* links */}
        <div className="flex flex-wrap items-center gap-2">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
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
            <p className="text-sm text-stone-400">Finish every milestone to unlock your live link.</p>
          )}
          {project.isFinished && !project.deployUrl && (
            <Link href={`/projects/${project.id}`} className="text-sm font-semibold text-green-600 hover:underline">
              Finished! Add your live link →
            </Link>
          )}
        </div>

        {/* next step, one compact line */}
        <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
          <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
          <p className="min-w-0 text-sm">
            <span className="font-semibold text-green-700">
              {project.nextAction ? "Next step: " : "Project complete: "}
            </span>
            <span className="text-stone-800">
              {project.nextAction?.title ?? "every milestone is finished."}
            </span>
          </p>
        </div>

        {/* milestones */}
        <div>
          <h3 className="font-heading font-semibold text-stone-900">Milestones</h3>
          <ul className="mt-3 space-y-2">
            {project.milestones.map((m) => {
              const hasTasks = m.tasks.length > 0;
              const isCurrent = m.status === "current";
              const isDone = m.status === "done";
              const open = hasTasks && (overrides[m.id] ?? isCurrent);

              const marker = `flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                isDone
                  ? "border-green-500 bg-green-500 text-white"
                  : isCurrent
                  ? "border-green-400 bg-green-100"
                  : "border-stone-200 bg-stone-100"
              }`;

              return (
                <li
                  key={m.id}
                  className={`rounded-xl border px-4 py-2.5 ${
                    isCurrent ? "border-green-200 bg-green-50" : isDone ? "border-stone-100 bg-stone-50" : "border-stone-100 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {hasTasks ? (
                      <span className={marker}>{isDone && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        aria-pressed={m.completed}
                        aria-label={m.completed ? `Mark "${m.title}" as not finished` : `Mark "${m.title}" as finished`}
                        onClick={() => setDone("milestone", m.id, !m.completed)}
                        className={`${marker} hover:border-green-500`}
                      >
                        {isDone && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={!hasTasks}
                      aria-expanded={hasTasks ? open : undefined}
                      onClick={() => setOverrides((prev) => ({ ...prev, [m.id]: !(prev[m.id] ?? isCurrent) }))}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                    >
                      <span
                        className={`min-w-0 flex-1 truncate text-sm font-medium ${
                          isDone ? "text-stone-400 line-through" : isCurrent ? "text-stone-900" : "text-stone-500"
                        }`}
                      >
                        {m.title}
                      </span>
                      {hasTasks && (
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-stone-500">
                          {m.tasks.filter((t) => t.completed).length}/{m.tasks.length}
                        </span>
                      )}
                      {hasTasks && (
                        <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition ${open ? "rotate-180" : ""}`} />
                      )}
                    </button>
                  </div>

                  {open && (
                    <ul className="mt-2 space-y-0.5 pl-9">
                      {m.tasks.map((task) => (
                        <li key={task.id} className="flex items-center gap-3 py-1">
                          <button
                            type="button"
                            disabled={isPending}
                            aria-pressed={task.completed}
                            aria-label={task.completed ? `Mark "${task.title}" as not finished` : `Mark "${task.title}" as finished`}
                            onClick={() => setDone("task", task.id, !task.completed)}
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                              task.completed
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-stone-300 bg-white hover:border-green-500"
                            }`}
                          >
                            {task.completed && <Check className="h-3 w-3" strokeWidth={3} />}
                          </button>
                          <span className={`text-sm ${task.completed ? "text-stone-400 line-through" : "text-stone-700"}`}>
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
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t border-stone-100 px-7 py-4">
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          <Pencil className="h-4 w-4" />
          Edit project
        </Link>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <ConfirmModal
        open={confirming}
        title="Delete this project?"
        text={`"${project.title}" and all its milestones and tasks will be deleted. This can't be undone.`}
        loading={isPending}
        onConfirm={remove}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}