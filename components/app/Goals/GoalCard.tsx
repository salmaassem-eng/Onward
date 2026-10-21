import type { GoalView } from "@/lib/goals";
import { categoryStyles } from "./goal-styles";

type GoalCardProps = {
  goal: GoalView;
  onOpen: () => void;
};

export default function GoalCard({ goal, onOpen }: GoalCardProps) {
  const style = categoryStyles[goal.category];
  const Icon = style.icon;

  const currentId = goal.steps.find((s) => !s.completed)?.id;
  const chips = goal.steps.slice(0, 3);
  const extra = goal.steps.length - chips.length;

  return (
    <article className="flex flex-col rounded-3xl border border-stone-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.iconBox}`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}
            >
              {goal.category}
            </p>
            <p className="text-sm text-stone-400">{goal.targetLabel}</p>
          </div>
        </div>
        <span className="font-heading text-3xl font-bold text-stone-900">
          {goal.progress}%
        </span>
      </div>

      <h3 className="font-heading mt-5 text-lg font-semibold text-stone-900">
        {goal.title}
      </h3>

      <div className="mt-3 h-2 rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full ${style.bar}`}
          style={{ width: `${goal.progress}%` }}
        />
      </div>

      <div className="mt-4 space-y-1 text-sm">
        {goal.current ? (
          <p className="text-stone-600">
            <span className="font-medium">Current:</span> {goal.current}
          </p>
        ) : (
          <p className="text-stone-600">All steps complete</p>
        )}
        {goal.next && (
          <p className="text-stone-400">
            <span className="font-medium">Next:</span> {goal.next}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((step) => {
          const lit = step.completed || step.id === currentId;
          return (
            <span
              key={step.id}
              className={`max-w-full truncate rounded-full px-3 py-1 text-xs font-medium ${
                lit
                  ? style.chip
                  : "border border-stone-200 text-stone-400"
              }`}
            >
              {step.title}
            </span>
          );
        })}
        {extra > 0 && (
          <span className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-400">
            +{extra} more
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4 mt-5">
        <span className="text-sm text-stone-400">
          {goal.doneCount} of {goal.totalCount}{" "}
          {goal.totalCount === 1 ? "step" : "steps"}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="font-semibold text-green-600 hover:underline"
        >
          View goal →
        </button>
      </div>
    </article>
  );
}