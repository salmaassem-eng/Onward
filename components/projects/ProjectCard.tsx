import type { ProjectView } from "@/lib/projects";
import { projectColor, stateStyles } from "./project-styles";

type ProjectCardProps = {
  project: ProjectView;
  onOpen: () => void;
};

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const color = projectColor(project.id);
  const state = stateStyles[project.state];

  return (
    <article className="flex flex-col rounded-3xl border border-stone-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white ${color.avatar}`}
        >
          {project.initial}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${state.badge}`}
        >
          {state.label}
        </span>
      </div>

      <h3 className="font-heading mt-5 text-xl font-semibold text-stone-900">
        {project.title}
      </h3>
      <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-stone-400">
        {project.description ?? (project.goalTitle ? `Part of: ${project.goalTitle}` : "Freelance project")}
      </p>

      <div className="mt-5 flex items-baseline justify-between text-sm">
        <span className="text-stone-500">Progress</span>
        <span className="font-semibold text-stone-900">{project.progress}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full ${color.bar}`}
          style={{ width: `${project.progress}%` }}
        />
      </div>

      <div className="mt-3 flex gap-1.5" aria-hidden>
        {project.milestones.map((m) => (
          <span
            key={m.id}
            className={`h-1.5 flex-1 rounded-full ${
              m.status === "done"
                ? "bg-green-400"
                : m.status === "current"
                ? "bg-green-200"
                : "bg-stone-100"
            }`}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-100 pt-4 text-sm">
        <span className="text-stone-400">
          {project.doneCount}/{project.totalCount} milestones
        </span>
        <span className="text-stone-400">{project.deadlineLabel}</span>
        <button
          type="button"
          onClick={onOpen}
          className="font-semibold text-green-600 hover:underline"
        >
          View →
        </button>
      </div>
    </article>
  );
}