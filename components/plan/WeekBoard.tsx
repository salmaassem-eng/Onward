"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { shortDate, weekdayName, weekdayShort } from "@/lib/dates";
import type { PlanCandidate, PlanItemView } from "@/lib/plan";
import AddTaskModal from "./AddTaskModal";
import PlanItemRow from "./PlanItemRow";

type WeekBoardProps = {
  title: string;
  range: string;
  prevHref: string;
  nextHref: string;
  todayHref: string | null;
  days: string[];
  items: PlanItemView[];
  today: string;
  candidates: PlanCandidate[];
};

export default function WeekBoard({
  title,
  range,
  prevHref,
  nextHref,
  todayHref,
  days,
  items,
  today,
  candidates,
}: WeekBoardProps) {
  const [selected, setSelected] = useState("all");
  const [addDate, setAddDate] = useState<string | null>(null);

  const forDay = (date: string) => items.filter((i) => i.date === date);
  const total = items.length;
  const done = items.filter((i) => i.completed).length;
  const remaining = total - done;
  const activeDays = days.filter((d) => forDay(d).some((i) => i.completed)).length;
  const isPastWeek = days[6] < today;
  const shownDays = selected === "all" ? days : [selected];

  const defaultAdd =
    selected !== "all" && selected >= today
      ? selected
      : days.includes(today)
      ? today
      : days[0] >= today
      ? days[0]
      : today;

  let message: string;
  if (total === 0) {
    message = isPastWeek
      ? "Nothing was planned this week."
      : "Nothing planned yet. Add a task to shape your week.";
  } else if (done === 0) {
    message = isPastWeek ? "No tasks were finished this week." : "Your week is planned. Pick the first one and start.";
  } else if (remaining === 0) {
    message = `All ${total} done. Look how far you came.`;
  } else {
    message = `You've moved forward ${done} ${done === 1 ? "time" : "times"} this week. Keep going.`;
  }

  const navButton =
    "flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-50";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">{title}</h1>
          <div className="mt-3 flex items-center gap-2">
            <Link href={prevHref} aria-label="Previous week" className={navButton}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link href={nextHref} aria-label="Next week" className={navButton}>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <span className="ml-2 text-lg text-stone-500">{range}</span>
            {todayHref && (
              <Link href={todayHref} className="ml-2 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 hover:bg-green-100">
                This week
              </Link>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAddDate(defaultAdd)}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Add task
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center">
          <p className="font-heading text-3xl font-bold text-stone-900">
            {done}/{total}
          </p>
          <p className="mt-1 text-sm text-stone-500">Activities done</p>
          <div className="mt-3 h-2 rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${total === 0 ? 0 : Math.round((done / total) * 100)}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center">
          <p className="font-heading text-3xl font-bold text-green-700">
            {activeDays}
            <span className="text-xl text-green-600">/7</span>
          </p>
          <p className="mt-1 text-sm text-green-700">Days with progress</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center">
          <p className="font-heading text-3xl font-bold text-stone-900">{remaining}</p>
          <p className="mt-1 text-sm text-stone-500">Remaining</p>
          <p className="mt-1 text-xs text-stone-400">{remaining > 0 && !isPastWeek ? "Keep going →" : "\u00A0"}</p>
        </div>
      </div>

      <p className="mt-6 rounded-2xl border border-green-100 bg-green-50 px-5 py-4 font-medium text-green-700">
        {message}
      </p>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by day">
        <button
          type="button"
          onClick={() => setSelected("all")}
          aria-pressed={selected === "all"}
          className={`rounded-full border px-6 py-2.5 font-semibold transition ${
            selected === "all"
              ? "border-green-600 bg-green-600 text-white"
              : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
          }`}
        >
          All days
        </button>
        {days.map((date) => {
          const list = forDay(date);
          const d = list.filter((i) => i.completed).length;
          const complete = list.length > 0 && d === list.length;
          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelected(date)}
              aria-pressed={selected === date}
              className={`rounded-full border px-5 py-1.5 text-center transition ${
                selected === date
                  ? "border-green-600 bg-green-600 text-white"
                  : date === today
                  ? "border-green-300 bg-white text-stone-700 hover:bg-stone-50"
                  : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
              }`}
            >
              <span className="block text-sm font-semibold">{weekdayShort(date)}</span>
              <span
                className={`block text-xs font-medium ${
                  selected === date ? "text-green-100" : complete ? "text-green-600" : "text-stone-400"
                }`}
              >
                {list.length === 0 ? "–" : `${d}/${list.length}`}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-8">
        {shownDays.map((date) => {
          const list = forDay(date);
          const d = list.filter((i) => i.completed).length;
          const complete = list.length > 0 && d === list.length;

          return (
            <section key={date}>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h2 className="font-heading text-lg font-semibold text-stone-900">{weekdayName(date)}</h2>
                <span className="text-sm text-stone-400">{shortDate(date)}</span>
                {date === today && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Today</span>
                )}
                {list.length > 0 && <span className="text-sm text-stone-400">{d}/{list.length}</span>}
                {complete && <span className="text-sm font-semibold text-green-600">✓ Done</span>}
                {date >= today && (
                  <button
                    type="button"
                    onClick={() => setAddDate(date)}
                    className="ml-auto flex items-center gap-1 text-sm font-semibold text-green-600 hover:underline"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                )}
              </div>

              {list.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-stone-300 px-5 py-4 text-sm text-stone-400">
                  {date < today ? "Nothing was planned." : "Nothing planned yet."}
                </p>
              ) : (
                <ul className="space-y-2">
                  {list.map((item) => (
                    <PlanItemRow key={item.id} item={item} today={today} showMove />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <AddTaskModal
        open={addDate !== null}
        onClose={() => setAddDate(null)}
        defaultDate={addDate ?? defaultAdd}
        minDate={today}
        candidates={candidates}
      />
    </>
  );
}