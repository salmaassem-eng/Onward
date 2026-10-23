import Link from "next/link";
import type { GoalView } from "@/lib/goals";
import { categoryStyles } from "./goal-styles";

export default function GoalSummary({ goal }: { goal: GoalView }) {
  const style = categoryStyles[goal.category];

  return (
    <Link
      href={`/journey?goal=${goal.id}`}
      className="block rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span
            className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${style.chip}`}
          >
            {goal.category}
          </span>
          <p className="font-heading mt-2 font-semibold text-stone-900">
            {goal.title}
          </p>
        </div>
        <span className="font-heading text-2xl font-bold text-stone-900">
          {goal.progress}%
        </span>
      </div>

      <div className="mt-3 h-2 rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full ${style.bar}`}
          style={{ width: `${goal.progress}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between gap-4 text-sm text-stone-400">
        <span className="truncate">
          {goal.nextAction ? `Next: ${goal.nextAction.title}` : "All steps complete"}        </span>
        <span className="shrink-0">{goal.targetLabel}</span>
      </div>
    </Link>
  );
}