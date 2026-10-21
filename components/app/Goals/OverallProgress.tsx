import type { GoalView } from "@/lib/goals";
import { categoryStyles } from "./goal-styles";

export default function OverallProgress({ goals }: { goals: GoalView[] }) {
  const average = Math.round(
    goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
  );

  return (
    <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-8">
      <h2 className="font-heading text-lg font-semibold text-stone-900">
        Overall Progress
      </h2>

      <ul className="mt-6 space-y-5">
        {goals.map((goal) => {
          const style = categoryStyles[goal.category];
          const Icon = style.icon;
          return (
            <li key={goal.id} className="flex items-center gap-4">
              <Icon className={`h-5 w-5 shrink-0 ${style.text}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="truncate text-stone-800">{goal.title}</span>
                  <span className="text-sm font-semibold text-stone-900">
                    {goal.progress}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-stone-100">
                  <div
                    className={`h-full rounded-full ${style.bar}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 border-t border-stone-100 pt-8 text-center">
        <p className="font-heading text-4xl font-bold text-stone-900">
          {average}%
        </p>
        <p className="mt-1 text-stone-500">Average across all goals</p>
        <p className="mt-1 text-sm text-stone-400">
          {average === 0
            ? "Finish your first step and the bar starts moving."
            : "Keep moving. You're doing great."}
        </p>
      </div>
    </section>
  );
}