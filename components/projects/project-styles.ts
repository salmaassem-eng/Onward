import type { ProjectState } from "@/lib/projects";

const palette = [
  { avatar: "bg-green-600", bar: "bg-green-600" },
  { avatar: "bg-violet-600", bar: "bg-violet-600" },
  { avatar: "bg-sky-500", bar: "bg-sky-500" },
  { avatar: "bg-amber-500", bar: "bg-amber-500" },
  { avatar: "bg-rose-500", bar: "bg-rose-500" },
];

// each project keeps the same color, based on its id
export const projectColor = (id: number) => palette[id % palette.length];

export const stateStyles: Record<ProjectState, { label: string; badge: string }> = {
  active: { label: "Active", badge: "bg-green-100 text-green-700" },
  paused: { label: "Paused", badge: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", badge: "bg-sky-100 text-sky-700" },
};