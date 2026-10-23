"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check, Trophy } from "lucide-react";
import { toast } from "react-toastify";
import { setItemCompleted } from "@/app/actions/journey";
import type { GoalView } from "@/lib/goals";

export default function NextStepBar({ goal }: { goal: GoalView }) {
  const [isPending, startTransition] = useTransition();
  const action = goal.nextAction;

  if (!action) {
    const empty = goal.totalCount === 0;
    return (
      <div className="flex items-center gap-4 border-t border-green-100 bg-green-50 px-6 py-6 sm:px-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
          <Trophy className="h-5 w-5" />
        </span>
        <div>
          <p className="font-heading font-semibold text-stone-900">
            {empty ? "This goal has no steps yet" : "Goal complete"}
          </p>
          <p className="text-sm text-stone-500">
            {empty ? (
              <Link
                href={`/goals/${goal.id}`}
                className="font-semibold text-green-600 hover:underline"
              >
                Add steps to start your journey
              </Link>
            ) : (
              "Every step is finished. Look how far you came."
            )}
          </p>
        </div>
      </div>
    );
  }

  function markFinished() {
    startTransition(async () => {
      try {
        await setItemCompleted(action!.kind, action!.id, true);
        toast.success("Nice. One step closer.");
      } catch {
        toast.error("Couldn't save that. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 border-t border-green-100 bg-green-50 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Your next step
        </p>
        <p className="font-heading mt-2 text-xl font-semibold text-stone-900">
          {action.title}
        </p>
        <p className="mt-1 text-sm text-stone-500">{action.parent}</p>
      </div>

      <button
        type="button"
        onClick={markFinished}
        disabled={isPending}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-60"
      >
        <Check className="h-4 w-4" strokeWidth={3} />
        {isPending ? "Saving..." : "Mark finished"}
      </button>
    </div>
  );
}