"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Plus } from "lucide-react";
import type { GoalView } from "@/lib/goals";
import { categoryStyles } from "@/components/app/Goals/goal-styles";

function scrollToJourney() {
  const el = document.getElementById("journey");
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export default function GoalGrid({
  goals,
  selectedId,
}: {
  goals: GoalView[];
  selectedId: number;
}) {
  const finished = goals.filter((g) => g.progress === 100).length;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold text-stone-900">
            Your goals
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Choose a goal to see its journey.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-400">
            {finished} of {goals.length} finished
          </span> 
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const style = categoryStyles[goal.category];
          const selected = goal.id === selectedId;
          const done = goal.progress === 100;

          return (
            <Link
              key={goal.id}
              href={`/journey?goal=${goal.id}`}
              scroll={false}
              onClick={scrollToJourney}
              aria-current={selected ? "true" : undefined}
              className={`flex flex-col rounded-3xl border bg-white p-6 transition ${
                selected
                  ? "border-green-400 ring-2 ring-green-100"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    selected ? style.text : "text-stone-400"
                  }`}
                >
                  {goal.category}
                </span>
                <span className="font-heading flex items-center gap-1.5 text-2xl font-bold text-stone-900">
                  {done && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {goal.progress}%
                </span>
              </div>

              <h3 className="font-heading mt-5 flex-1 text-lg font-semibold leading-snug text-stone-900">
                {goal.title}
              </h3>
              <p className="mt-2 text-sm text-stone-400">
                {goal.targetLabel === "Ongoing"
                  ? "Ongoing goal"
                  : `Target ${goal.targetLabel}`}
              </p>

              <div className="mt-5 h-2 rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full ${style.bar}`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    selected ? "text-green-700" : "text-stone-400"
                  }`}
                >
                  {selected ? "Viewing journey" : "View journey"}
                </span>
                {!selected && <ArrowRight className="h-4 w-4 text-stone-400" />}
              </div>
            </Link>
          );
        })}

        <Link
          href="/goals/new"
          className="flex min-h-[14rem] flex-col items-center justify-center rounded-3xl border border-dashed border-green-300 bg-green-50/60 p-6 text-center transition hover:bg-green-50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-green-300 bg-white text-green-700">
            <Plus className="h-5 w-5" />
          </span>
          <span className="font-heading mt-4 font-semibold text-green-700">
            Add a new goal
          </span>
          <span className="mt-1 text-sm text-green-600">Create another path</span>
        </Link>
      </div>
    </section>
  );
}