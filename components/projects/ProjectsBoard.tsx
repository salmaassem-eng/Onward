"use client";

import { useState } from "react";
import type { ProjectView } from "@/lib/projects";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";

const filters = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
] as const;

type Filter = (typeof filters)[number]["value"];

export default function ProjectsBoard({ projects }: { projects: ProjectView[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const visible =
    filter === "all" ? projects : projects.filter((p) => p.state === filter);
  const selected = projects.find((p) => p.id === selectedId) ?? null;

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
              filter === f.value
                ? "border-green-600 bg-green-600 text-white"
                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-stone-400">
          No {filter} projects.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => setSelectedId(project.id)}
            />
          ))}
        </div>
      )}

      <ProjectModal project={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}