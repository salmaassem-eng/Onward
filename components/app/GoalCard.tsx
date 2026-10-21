"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteGoal, updateGoalProgress } from "@/app/actions/goals";
import { formatTargetDate, type Category } from "@/lib/goals";
import { categoryStyles } from "./goal-styles";

export type GoalData = {
  id: number;
  title: string;
  category: Category;
  progress: number;
  nextStep: string | null;
  targetDate: string | null;
};

export default function GoalCard({ goal }: { goal: GoalData }) {
  const [progress, setProgress] = useState(goal.progress);
  const [isPending, startTransition] = useTransition();
  const style = categoryStyles[goal.category];

  function saveProgress() {
    if (progress === goal.progress) return;
    startTransition(async () => {
      try {
        await updateGoalProgress(goal.id, progress);
      } catch {
        setProgress(goal.progress);
        toast.error("Couldn't save your progress.");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${goal.title}"?`)) return;
    startTransition(async () => {
      try {
        await deleteGoal(goal.id);
        toast.success("Goal deleted.");
      } catch {
        toast.error("Couldn't delete the goal.");
      }
    });
  }

  return (
    <article
      className={`rounded-2xl border border-stone-200 bg-white p-6 transition ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span
            className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${style.badge}`}
          >
            {goal.category}
          </span>
          <h3 className="font-heading mt-2 text-lg font-semibold text-stone-900">
            {goal.title}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-heading text-2xl font-bold text-stone-900">
            {progress}%
          </span>
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${goal.title}`}
            className="rounded-lg p-2 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative mt-4 h-2 rounded-full bg-stone-100 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-green-500/40">
        <div
          className={`h-full rounded-full transition-all ${style.bar}`}
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          aria-label={`Progress for ${goal.title}`}
          onChange={(e) => setProgress(Number(e.target.value))}
          onPointerUp={saveProgress}
          onKeyUp={saveProgress}
          className="absolute -top-2 left-0 h-6 w-full cursor-pointer opacity-0"
        />
      </div>

      <div className="mt-3 flex justify-between gap-4 text-sm text-stone-400">
        <span className="truncate">
          {goal.nextStep ? `Next: ${goal.nextStep}` : "No next step yet"}
        </span>
        <span className="shrink-0">{formatTargetDate(goal.targetDate)}</span>
      </div>
    </article>
  );
}