"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Check, ChevronDown, Flag } from "lucide-react";
import { toast } from "react-toastify";
import { setItemCompleted, swapOrder } from "@/app/actions/journey";
import type { GoalStepView } from "@/lib/goals";

type JourneyPathProps = {
  goalId: number;
  goalTitle: string;
  steps: GoalStepView[];
};

const arrowButton =
  "rounded-md p-1.5 text-stone-400 transition hover:bg-white hover:text-stone-700 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-stone-400";

export default function JourneyPath({
  goalId,
  goalTitle,
  steps,
}: JourneyPathProps) {
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const currentIndex = steps.findIndex((s) => s.status === "current");
  const finished = steps.length > 0 && currentIndex === -1;
  // only unfinished steps can be reordered, so the order of finished ones never changes
  const movable = steps.filter((s) => s.status !== "done");

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
        if (completed) toast.success("Nice. Marked as finished.");
        else toast.info("Moved back to to-do.");
      } catch {
        toast.error("Couldn't save that. Please try again.");
      }
    });
  }

  function reorder(kind: "step" | "substep", id: number, otherId: number) {
    startTransition(async () => {
      try {
        await swapOrder(kind, id, otherId);
        toast.success("Order updated.");
      } catch {
        toast.error("Couldn't change the order. Please try again.");
      }
    });
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold text-stone-900">
            Your path
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            {steps.length === 0
              ? "No steps yet."
              : finished
              ? "Every step is finished."
              : `You're on step ${currentIndex + 1} of ${steps.length}. Use the arrows to change what comes next.`}
          </p>
        </div>
        <Link
          href={`/goals/${goalId}`}
          className="text-sm font-semibold text-green-600 hover:underline"
        >
          Add or edit steps
        </Link>
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

          const mi = movable.findIndex((s) => s.id === step.id);
          const prevStepId = mi > 0 ? movable[mi - 1].id : undefined;
          const nextStepId =
            mi >= 0 && mi < movable.length - 1 ? movable[mi + 1].id : undefined;
          const canMoveStep = !isDone && movable.length > 1;

          const openSubs = step.substeps.filter((s) => !s.completed);

          return (
            <li key={step.id} className="relative flex gap-4 pb-6">
              <span
                aria-hidden
                className={`absolute bottom-0 left-5 top-10 w-0.5 -translate-x-1/2 ${
                  isDone ? "bg-green-300" : "bg-stone-200"
                }`}
              />

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
                  {isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
                </span>
              </span>

              <div
                className={`min-w-0 flex-1 rounded-2xl border ${
                  isCurrent
                    ? "border-green-200 bg-green-50"
                    : "border-stone-200 bg-white"
                }`}
              >
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleOpen(step)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left"
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

                  {canMoveStep && (
                    <div className="flex shrink-0 flex-col pr-3">
                      <button
                        type="button"
                        disabled={isPending || prevStepId === undefined}
                        onClick={() => reorder("step", step.id, prevStepId!)}
                        aria-label={`Move "${step.title}" earlier`}
                        title="Move earlier"
                        className={arrowButton}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isPending || nextStepId === undefined}
                        onClick={() => reorder("step", step.id, nextStepId!)}
                        aria-label={`Move "${step.title}" later`}
                        title="Move later"
                        className={arrowButton}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {open && (
                  <div className="border-t border-stone-200/70 px-4 pb-4 pt-3">
                    {step.substeps.length > 0 ? (
                      <ul className="space-y-1">
                        {step.substeps.map((sub) => {
                          const canToggle = !isUpcoming;
                          const si = openSubs.findIndex((x) => x.id === sub.id);
                          const prevSubId = si > 0 ? openSubs[si - 1].id : undefined;
                          const nextSubIdMove =
                            si >= 0 && si < openSubs.length - 1
                              ? openSubs[si + 1].id
                              : undefined;
                          const canMoveSub = !sub.completed && openSubs.length > 1;

                          return (
                            <li
                              key={sub.id}
                              className="flex items-center gap-3 rounded-lg px-2 py-1.5"
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
                                className={`min-w-0 flex-1 ${
                                  sub.completed
                                    ? "text-stone-400 line-through"
                                    : sub.id === nextSubId
                                    ? "font-semibold text-stone-900"
                                    : "text-stone-600"
                                }`}
                              >
                                {sub.title}
                              </span>
                              {sub.id === nextSubId && (
                                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-green-700">
                                  Next
                                </span>
                              )}
                              {canMoveSub && (
                                <div className="flex shrink-0">
                                  <button
                                    type="button"
                                    disabled={isPending || prevSubId === undefined}
                                    onClick={() =>
                                      reorder("substep", sub.id, prevSubId!)
                                    }
                                    aria-label={`Move "${sub.title}" earlier`}
                                    title="Move earlier"
                                    className={arrowButton}
                                  >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      isPending || nextSubIdMove === undefined
                                    }
                                    onClick={() =>
                                      reorder("substep", sub.id, nextSubIdMove!)
                                    }
                                    aria-label={`Move "${sub.title}" later`}
                                    title="Move later"
                                    className={arrowButton}
                                  >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                  </button>
                                </div>
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
    </div>
  );
}