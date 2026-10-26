"use client";

import { useState } from "react";
import type { GoalView } from "@/lib/goals";
import type { ProjectView } from "@/lib/projects";
import GoalHero from "./GoalHero";
import JourneyPath from "./JourneyPath";
import ConnectedProjects from "./ConnectedProjects";

type Tab = "path" | "projects";

export default function JourneyPanel({
  goal,
  projects,
}: {
  goal: GoalView;
  projects: ProjectView[];
}) {
  const [tab, setTab] = useState<Tab>("path");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "path", label: "Path", count: goal.steps.length },
    { id: "projects", label: "Projects", count: projects.length },
  ];

  return (
    <section
      id="journey"
      aria-label={`Journey: ${goal.title}`}
      className="mt-8 scroll-mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
    >
      <GoalHero goal={goal} />

      <div
        role="tablist"
        aria-label="Journey sections"
        className="flex gap-2 border-y border-stone-200 bg-stone-50 px-4 sm:px-6"
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls="journey-tabpanel"
              onClick={() => setTab(t.id)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-4 text-sm font-semibold transition ${
                active
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  active ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-500"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="journey-tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="p-6 sm:p-8"
      >
        {tab === "path" ? (
          <JourneyPath
            goalId={goal.id}
            goalTitle={goal.title}
            steps={goal.steps}
          />
        ) : (
          <ConnectedProjects projects={projects} />
        )}
      </div>
    </section>
  );
}