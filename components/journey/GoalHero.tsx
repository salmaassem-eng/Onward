"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check, Trophy } from "lucide-react";
import { toast } from "react-toastify";
import { setItemCompleted } from "@/app/actions/journey";
import type { GoalView } from "@/lib/goals";
import { categoryStyles } from "@/components/app/Goals/goal-styles";
import GoalActions from "./GoalActions";

export default function GoalHero({ goal }: { goal: GoalView }) {
  const [isPending, startTransition] = useTransition();
  const style = categoryStyles[goal.category];
  const action = goal.nextAction;
  const noSteps = goal.totalCount === 0;
  const complete = !noSteps && !action;

  function finish() {
    if (!action) return;
    startTransition(async () => {
      try {
        await setItemCompleted(action.kind, action.id, true);
        toast.success("Nice. One step closer.");
      } catch {
        toast.error("Couldn't save that. Please try again.");
      }
    });
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${style.chip}`}
          >
            Selected journey
          </span>
          <span className="text-sm text-stone-400">
            {goal.targetLabel === "Ongoing"
              ? "Ongoing"
              : `Target ${goal.targetLabel}`}
          </span>
        </div>
        <GoalActions goalId={goal.id} title={goal.title} />
      </div>

      <div className="mt-5 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h2 className="font-heading text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
            {goal.title}
          </h2>
          {goal.description && (
            <p className="mt-3 leading-relaxed text-stone-500">
              {goal.description}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-heading text-3xl sm:text-4xl font-bold text-stone-900">
            {goal.progress}%
          </p>
          <p className="text-sm text-stone-400">Overall progress</p>
        </div>
      </div>

      <div className="mt-5 h-2.5 rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full transition-all ${style.bar}`}
          style={{ width: `${goal.progress}%` }}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[2fr_3fr]">
        {/* where you are */}
        <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Where you are
          </p>
          <p className="font-heading mt-3 text-lg font-semibold text-stone-900">
            {noSteps ? "No steps yet" : complete ? "Goal complete" : goal.current}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {goal.doneCount} of {goal.totalCount}{" "}
            {goal.totalCount === 1 ? "step" : "steps"} finished
          </p>
        </div>

        {/* next action, with the finish button inside */}
        <div className="flex flex-col rounded-2xl bg-[#1c1917] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Next action
          </p>

          {action ? (
            <>
              <p className="font-heading mt-3 text-lg font-semibold text-white">
                {action.title}
              </p>
              <p className="mt-1 text-sm text-stone-400">{action.parent}</p>
              <button
                type="button"
                onClick={finish}
                disabled={isPending}
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-60"
              >
                <Check className="h-4 w-4" strokeWidth={3} />
                {isPending ? "Saving..." : "Finish this step"}
              </button>
            </>
          ) : noSteps ? (
            <div className="mt-3">
              <p className="font-heading text-lg font-semibold text-white">
                This goal has no steps yet
              </p>
              <Link
                href={`/goals/${goal.id}`}
                className="mt-2 inline-block text-sm font-semibold text-green-400 hover:underline"
              >
                Add steps to start your journey →
              </Link>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-green-400" />
              <p className="text-white/80">
                Every step is finished. Look how far you came.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}