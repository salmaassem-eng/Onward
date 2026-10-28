import Link from "next/link";
import { projectColor } from "@/components/projects/project-styles";
import type { ProjectView } from "@/lib/projects";

export default function ConnectedProjects({
  projects,
}: {
  projects: ProjectView[];
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Projects that are helping this goal move forward.
        </p>
        <Link
          href="/projects/new"
          className="text-sm font-semibold text-green-600 hover:underline"
        >
          + New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-stone-300 px-5 py-8 text-center text-sm text-stone-500">
          No projects connected yet. Create a project and pick this goal.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects?open=${p.id}`}
              className="rounded-2xl border border-stone-200 p-5 transition hover:border-stone-300"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-heading truncate font-semibold text-stone-900">
                  {p.title}
                </p>
                <span className="font-heading text-lg font-bold text-stone-900">
                  {p.progress}%
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-400">
                {p.state === "completed"
                  ? "Completed"
                  : p.deadlineLabel === "No deadline"
                  ? "No deadline"
                  : `Due ${p.deadlineLabel}`}
              </p>
              <div className="mt-3 h-2 rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full ${projectColor(p.id).bar}`}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
              <p className="mt-3 truncate text-sm text-stone-400">
                {p.nextAction
                  ? `Next: ${p.nextAction.title}`
                  : "Every milestone finished"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}