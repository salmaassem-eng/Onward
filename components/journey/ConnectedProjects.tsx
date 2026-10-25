import Link from "next/link";
import { projectColor } from "@/components/projects/project-styles";
import type { ProjectView } from "@/lib/projects";

export default function ConnectedProjects({ goalId, projects }: { goalId: number; projects: ProjectView[] }) {
  return (
    <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <h2 className="font-heading text-lg font-semibold text-stone-900">Connected projects</h2>
        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-500">
          {projects.length}
        </span>
      </div>
      <p className="mt-1 text-sm text-stone-500">Projects that are helping this goal move forward.</p>

      {projects.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-stone-300 px-5 py-6 text-center text-sm text-stone-500">
          No projects connected yet.{" "}
          <Link href="/projects/new" className="font-semibold text-green-600 hover:underline">
            Create a project
          </Link>{" "}
          and pick this goal.
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
                <p className="font-heading truncate font-semibold text-stone-900">{p.title}</p>
                <span className="font-heading text-lg font-bold text-stone-900">{p.progress}%</span>
              </div>
              <p className="mt-1 text-sm text-stone-400">
                {p.state === "completed" ? "Completed" : p.deadlineLabel === "No deadline" ? "No deadline" : `Due ${p.deadlineLabel}`}
              </p>
              <div className="mt-3 h-2 rounded-full bg-stone-100">
                <div className={`h-full rounded-full ${projectColor(p.id).bar}`} style={{ width: `${p.progress}%` }} />
              </div>
              <p className="mt-3 truncate text-sm text-stone-400">
                {p.nextAction ? `Next: ${p.nextAction.title}` : "Every milestone finished"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}