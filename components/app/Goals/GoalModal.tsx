"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import type { GoalView } from "@/lib/goals";
import { categoryStyles } from "./goal-styles";

type GoalModalProps = {
  goal: GoalView | null;
  onClose: () => void;
};

export default function GoalModal({ goal, onClose }: GoalModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (goal && !dialog.open) dialog.showModal();
    if (!goal && dialog.open) dialog.close();
  }, [goal]);

  // stop the page behind from scrolling
  useEffect(() => {
    if (!goal) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [goal]);

  const style = goal ? categoryStyles[goal.category] : null;
  const currentId = goal?.steps.find((s) => !s.completed)?.id;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // a click on the dark backdrop targets the dialog element itself
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="goal-modal-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-stone-900/40 backdrop:backdrop-blur-sm"
    >
      {goal && style && (
        <div className="max-h-[90vh] overflow-y-auto">
          <div className={`relative px-8 pb-8 pt-8 ${style.header}`}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-stone-600 transition hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>

            <p
              className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}
            >
              {goal.category}
            </p>
            <h2
              id="goal-modal-title"
              className="font-heading mt-3 pr-12 text-3xl font-bold text-stone-900"
            >
              {goal.title}
            </h2>
            {goal.description && (
              <p className="mt-3 leading-relaxed text-stone-500">
                {goal.description}
              </p>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="h-2.5 flex-1 rounded-full bg-white">
                <div
                  className={`h-full rounded-full ${style.bar}`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <span className="font-heading text-3xl font-bold text-stone-900">
                {goal.progress}%
              </span>
            </div>
            <p className="mt-3 text-sm text-stone-500">
              Target: {goal.targetLabel}
            </p>
          </div>

          <div className="space-y-6 p-8">
            <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                You&apos;re here
              </p>
              <p className="font-heading mt-3 font-semibold text-stone-900">
                {goal.current ?? "All steps complete"}
              </p>
              {goal.next && (
                <p className="mt-1 text-stone-500">Next: {goal.next}</p>
              )}
            </div>

            <div>
              <h3 className="font-heading font-semibold text-stone-900">
                Steps
              </h3>
              <ol className="mt-4 space-y-3">
                {goal.steps.map((step, i) => {
                  const isCurrent = step.id === currentId;
                  return (
                    <li key={step.id} className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          step.completed
                            ? "border-green-500 bg-green-500 text-white"
                            : isCurrent
                            ? "border-green-400 bg-green-50 text-green-700"
                            : "border-stone-200 text-stone-400"
                        }`}
                      >
                        {step.completed ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span
                        className={
                          step.completed
                            ? "text-stone-400 line-through"
                            : "text-stone-900"
                        }
                      >
                        {step.title}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-stone-50 py-4 text-center">
                <p className="font-heading text-2xl font-bold text-stone-900">
                  {goal.doneCount}
                </p>
                <p className="text-sm text-stone-400">steps completed</p>
              </div>
              <div className="rounded-2xl bg-stone-50 py-4 text-center">
                <p className="font-heading text-2xl font-bold text-stone-900">
                  {goal.totalCount - goal.doneCount}
                </p>
                <p className="text-sm text-stone-400">steps remaining</p>
              </div>
            </div>

            <Link
              href={`/goals/${goal.id}`}
              className="block rounded-xl bg-green-600 py-4 text-center font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              Edit goal →
            </Link>
          </div>
        </div>
      )}
    </dialog>
  );
}