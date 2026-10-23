import Link from "next/link";
import { Pencil } from "lucide-react";
import type { GoalView } from "@/lib/goals";
import { categoryStyles } from "@/components/app/Goals/goal-styles";
import NextStepBar from "./NextStepBar";

export default function GoalHero({ goal }: { goal: GoalView }) {
  const style = categoryStyles[goal.category];

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${style.chip}`}
            >
              {goal.category} goal
            </span>
            <span className="text-sm text-stone-400">
              {goal.targetLabel === "Ongoing"
                ? "Ongoing"
                : `Target ${goal.targetLabel}`}
            </span>
          </div>
          <Link
            href={`/goals/${goal.id}`}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-stone-500 transition hover:bg-stone-50 hover:text-stone-900"
          >
            <Pencil className="h-4 w-4" />
            Edit goal
          </Link>
        </div>

        <h2 className="font-heading mt-5 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
          {goal.title}
        </h2>
        {goal.description && (
          <p className="mt-3 leading-relaxed text-stone-500">
            {goal.description}
          </p>
        )}

        <div className="mt-6 flex items-baseline gap-3">
          <span className="font-heading text-4xl font-bold text-stone-900">
            {goal.progress}%
          </span>
          <span className="text-stone-400">complete</span>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-stone-100">
          <div
            className={`h-full rounded-full transition-all ${style.bar}`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-stone-400">
          {goal.doneCount} of {goal.totalCount}{" "}
          {goal.totalCount === 1 ? "step" : "steps"} finished
        </p>
      </div>

      <NextStepBar goal={goal} />
    </section>
  );
}