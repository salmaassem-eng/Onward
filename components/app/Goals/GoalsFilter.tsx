"use client";

import { useState } from "react";
import { CATEGORIES, type Category, type GoalView } from "@/lib/goals";
import { categoryStyles } from "./goal-styles";
import GoalCard from "./GoalCard";
import GoalModal from "./GoalModal";

type Filter = "All" | Category;

export default function GoalsBoard({ goals }: { goals: GoalView[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const visible =
    filter === "All" ? goals : goals.filter((g) => g.category === filter);
  const selected = goals.find((g) => g.id === selectedId) ?? null;

  const chipClass = (active: boolean) =>
    `flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition ${
      active
        ? "border-green-600 bg-green-600 text-white"
        : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
    }`;

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setFilter("All")}
          aria-pressed={filter === "All"}
          className={chipClass(filter === "All")}
        >
          All goals
        </button>
        {CATEGORIES.map((c) => {
          const Icon = categoryStyles[c].icon;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={chipClass(filter === c)}
            >
              <Icon className="h-4 w-4" />
              {c}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-stone-400">
          No {filter} goals yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {visible.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onOpen={() => setSelectedId(goal.id)}
            />
          ))}
        </div>
      )}

      <GoalModal goal={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}