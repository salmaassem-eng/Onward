"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronDown, Flag } from "lucide-react";
import { toast } from "react-toastify";
import { setItemCompleted } from "@/app/actions/journey";
import type { GoalStepView } from "@/lib/goals";

type JourneyPathProps = {
  goalId: number;
  goalTitle: string;
  steps: GoalStepView[];
};

export default function JourneyPath({
  goalId,
  goalTitle,
  steps,
}: JourneyPathProps) {
  // only what the user toggled by hand; everything else follows the status
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const currentIndex = steps.findIndex((s) => s.status === "current");
  const finished = steps.length > 0 && currentIndex === -1;

  function toggleOpen(step: GoalStepView) {
    setOverrides((prev) => ({
      ...prev,
      [step.id]: !(prev[step.id] ?? step.status === "current"),
    }));
  }

  function setDone(kind: "step" | "substep", id: number, completed: boolean) {
    startTransition(async () => {
      try {
        await setItemCompleted(kind, id, completed);
      } catch {
        toast.error("Couldn't save that. Please try again.");
      }
    });
  }

  return (
    <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="font-heading text-lg font-semibold text-stone-900">
          Your path
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {steps.length === 0
            ? "No steps yet."
            : finished
            ? "Every step is finished."
            : `You're on step ${currentIndex + 1} of ${steps.length}.`}
        </p>
      </div>

      <ol className={`transition ${isPending ? "opacity-70" : ""}`}>
        {steps.map((step, i) => {
          const isCurrent = step.status === "current";
          const isDone = step.status === "done";
          const isUpcoming = step.status === "upcoming";
          const open = overrides[step.id] ?? isCurrent;
          const doneSubs = step.substeps.filter((s) => s.completed).length;
          const nextSubId = isCurrent
            ? step.substeps.find((s) => !s.completed)?.id
            : undefined;

          return (
            <li key={step.id} className="relative flex gap-4 pb-6">
              {/* line down to the next marker */}
              <span
                aria-hidden
                className={`absolute bottom-0 left-5 top-10 w-0.5 -translate-x-1/2 ${
                  isDone ? "bg-green-300" : "bg-stone-200"
                }`}
              />

              {/* marker */}
              <span className="relative z-10 h-10 w-10 shrink-0">
                {isCurrent && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-green-400/30 motion-reduce:animate-none" />
                )}
                <span
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    isDone
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "border-2 border-green-500 bg-white text-green-700"
                      : "border-2 border-stone-200 bg-white text-stone-400"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-5 w-5" strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </span>
              </span>

              {/* card */}
              <div
                className={`min-w-0 flex-1 rounded-2xl border ${
                  isCurrent
                    ? "border-green-200 bg-green-50"
                    : "border-stone-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleOpen(step)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    {isCurrent && (
                      <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-700">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        You are here
                      </p>
                    )}
                    <p
                      className={`font-heading font-semibold ${
                        isCurrent
                          ? "text-lg text-stone-900"
                          : isDone
                          ? "text-stone-500"
                          : "text-stone-600"
                      }`}
                    >
                      {step.title}
                    </p>
                    <div
                      className={`mt-2 h-1.5 rounded-full ${
                        isCurrent ? "bg-white" : "bg-stone-100"
                      }`}
                    >
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-stone-500">
                      {step.substeps.length > 0
                        ? `${doneSubs}/${step.substeps.length}`
                        : `${step.progress}%`}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-stone-400 transition ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-stone-200/70 px-4 pb-4 pt-3">
                    {step.substeps.length > 0 ? (
                      <ul className="space-y-1">
                        {step.substeps.map((sub) => {
                          const canToggle = !isUpcoming;
                          return (
                            <li
                              key={sub.id}
                              className="flex items-center gap-3 rounded-lg px-2 py-2"
                            >
                              <button
                                type="button"
                                disabled={!canToggle || isPending}
                                aria-pressed={sub.completed}
                                aria-label={
                                  sub.completed
                                    ? `Mark "${sub.title}" as not finished`
                                    : `Mark "${sub.title}" as finished`
                                }
                                onClick={() =>
                                  setDone("substep", sub.id, !sub.completed)
                                }
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition disabled:cursor-default ${
                                  sub.completed
                                    ? "border-green-500 bg-green-500 text-white"
                                    : `border-stone-300 bg-white ${
                                        canToggle ? "hover:border-green-500" : ""
                                      }`
                                }`}
                              >
                                {sub.completed && (
                                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                )}
                              </button>
                              <span
                                className={
                                  sub.completed
                                    ? "text-stone-400 line-through"
                                    : sub.id === nextSubId
                                    ? "font-semibold text-stone-900"
                                    : "text-stone-600"
                                }
                              >
                                {sub.title}
                              </span>
                              {sub.id === nextSubId && (
                                <span className="ml-auto rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-green-700">
                                  Next
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-stone-500">
                          No sub-steps yet.{" "}
                          <Link
                            href={`/goals/${goalId}`}
                            className="font-semibold text-green-600 hover:underline"
                          >
                            Break it down
                          </Link>
                        </p>
                        {isCurrent && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setDone("step", step.id, true)}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                          >
                            Mark finished
                          </button>
                        )}
                        {isDone && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setDone("step", step.id, false)}
                            className="text-sm font-semibold text-stone-500 hover:text-stone-900 disabled:opacity-60"
                          >
                            Undo
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}

        {/* destination */}
        <li className="relative flex gap-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              finished
                ? "bg-green-500 text-white"
                : "border-2 border-dashed border-stone-300 text-stone-400"
            }`}
          >
            <Flag className="h-4 w-4" />
          </span>
          <div className="pt-0.5">
            <p
              className={`text-xs font-semibold uppercase tracking-wider ${
                finished ? "text-green-700" : "text-stone-400"
              }`}
            >
              {finished ? "Goal reached" : "Destination"}
            </p>
            <p
              className={`font-heading font-semibold ${
                finished ? "text-stone-900" : "text-stone-500"
              }`}
            >
              {goalTitle}
            </p>
          </div>
        </li>
      </ol>
    </section>
  );
}