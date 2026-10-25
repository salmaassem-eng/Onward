"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GoalView } from "@/lib/goals";
import ButtonLink from "@/components/starterPage/Button";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#1c1917] p-8 sm:p-10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-80 w-80 bg-[radial-gradient(circle,rgba(34,197,94,0.15),transparent_70%)]" />
      <div className="relative">{children}</div>
    </section>
  );
}

export default function ContinueCard({ goals }: { goals: GoalView[] }) {
  const slides = goals
    .filter((g) => g.nextAction)
    .sort((a, b) => b.progress - a.progress);
  const [index, setIndex] = useState(0);
  const current = Math.min(index, Math.max(slides.length - 1, 0));

  // no goals at all
  if (goals.length === 0) {
    return (
      <Shell>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-400">Start here</p>
            <h2 className="font-heading mt-3 text-3xl font-bold text-white">Nothing to continue yet</h2>
            <p className="mt-2 max-w-md text-stone-400">
              Add a goal and it will show up here, so you can jump back in any time.
            </p>
          </div>
          <ButtonLink href="/goals/new" size="lg">Set your first goal →</ButtonLink>
        </div>
      </Shell>
    );
  }

  // goals exist but every one is finished
  if (slides.length === 0) {
    return (
      <Shell>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-400">Keep your progress going</p>
            <h2 className="font-heading mt-3 text-3xl font-bold text-white">Every goal is complete</h2>
            <p className="mt-2 max-w-md text-stone-400">
              Look how far you came. Add a new goal and keep your journey moving.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/goals/new" size="lg">Add a new goal →</ButtonLink>
            <ButtonLink href="/journey" variant="secondary" size="lg">View journey</ButtonLink>
          </div>
        </div>
      </Shell>
    );
  }

  const go = (n: number) => setIndex((n + slides.length) % slides.length);

  return (
    <Shell>
      <div aria-roledescription="carousel" aria-label="Goals to continue" className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((goal, i) => {
            const action = goal.nextAction!;
            return (
              <div
                key={goal.id}
                inert={i !== current}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slides.length}`}
                className="w-full shrink-0"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold uppercase tracking-wide text-green-400">
                      Continue · {goal.category}
                    </p>
                    <h2 className="font-heading mt-3 text-3xl font-bold text-white">{action.title}</h2>
                    <p className="mt-2 text-stone-400">
                      {action.kind === "substep" ? `${goal.title} · ${action.parent}` : goal.title}
                    </p>
                    <div className="mt-5 flex items-center gap-4">
                      <div className="h-2 flex-1 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-green-400" style={{ width: `${goal.progress}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-green-400">{goal.progress}%</span>
                    </div>
                  </div>
                  <ButtonLink href={`/journey?goal=${goal.id}`} size="lg">Continue →</ButtonLink>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(current - 1)}
            aria-label="Previous goal"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(current + 1)}
            aria-label="Next goal"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="ml-2 flex gap-1.5">
            {slides.map((g, i) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${g.title}`}
                aria-current={i === current}
                className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-green-400" : "w-2 bg-white/25"}`}
              />
            ))}
          </div>
          <span className="ml-auto text-sm text-stone-500">
            {current + 1} / {slides.length}
          </span>
        </div>
      )}
    </Shell>
  );
}