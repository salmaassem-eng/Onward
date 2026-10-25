"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { PlanCandidate, PlanItemView } from "@/lib/plan";
import AddTaskModal from "./AddTaskModal";
import PlanItemRow from "./PlanItemRow";

type TodayCardProps = {
  items: PlanItemView[];
  today: string;
  candidates: PlanCandidate[];
};

export default function TodayCard({ items, today, candidates }: TodayCardProps) {
  const [adding, setAdding] = useState(false);
  const done = items.filter((i) => i.completed).length;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-stone-900">Today</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-400">
            {done} of {items.length}
          </span>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-sm font-semibold text-green-600 hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-10 text-center">
          <p className="font-heading font-semibold text-stone-900">Nothing planned today</p>
          <p className="mt-1 text-sm text-stone-500">
            Pick a step from your journey or projects, or add your own.
          </p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Add a task
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <PlanItemRow key={item.id} item={item} today={today} />
          ))}
        </ul>
      )}

      <Link href="/week" className="mt-4 inline-block text-sm font-semibold text-stone-500 hover:text-stone-900">
        Plan the whole week →
      </Link>

      <AddTaskModal
        open={adding}
        onClose={() => setAdding(false)}
        defaultDate={today}
        minDate={today}
        candidates={candidates}
      />
    </section>
  );
}