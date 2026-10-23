import Link from "next/link";
import { Plus } from "lucide-react";
import type { GoalView } from "@/lib/goals";
import { categoryStyles } from "@/components/app/Goals/goal-styles";

type GoalListProps = {
  goals: GoalView[];
  selectedId: number;
};

export default function GoalList({ goals, selectedId }: GoalListProps) {
  const active = goals.filter((g) => g.progress < 100).length;

  return (
    <aside className="min-w-0">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="font-heading font-semibold text-stone-900">Your goals</h2>
        <span className="text-sm text-stone-400">{active} active</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {goals.map((goal) => {
          const style = categoryStyles[goal.category];
          const selected = goal.id === selectedId;

          return (
            <Link
              key={goal.id}
              href={`/journey?goal=${goal.id}`}
              scroll={false}
              aria-current={selected ? "true" : undefined}
              className={`block min-w-[13rem] shrink-0 rounded-2xl border bg-white p-4 transition lg:min-w-0 ${
                selected
                  ? "border-green-400 ring-1 ring-green-200"
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
                <span className="text-sm font-semibold text-stone-900">
                  {goal.progress}%
                </span>
              </div>
              <p className="font-heading mt-2 font-semibold leading-snug text-stone-900">
                {goal.title}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full ${
                    selected ? style.bar : "bg-stone-300"
                  }`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </Link>
          );
        })}
         <Link
          href="/goals/new"
          className="flex min-w-[13rem] shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-green-300 bg-green-50/60 py-3.5 font-semibold text-green-700 transition hover:bg-green-50 lg:min-w-0"
        >
          <Plus className="h-4 w-4" />
          New goal
        </Link>
      </div>
    </aside>
  );
}