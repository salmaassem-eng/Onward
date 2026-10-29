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

function Stat({
  value,
  label,
  green = false,
}: {
  value: string;
  label: string;
  green?: boolean;
}) {
  return (
    <div className="px-2 py-4 text-center sm:px-5 sm:py-5">
      <p
        className={`font-heading text-2xl font-bold sm:text-3xl ${
          green ? "text-green-700" : "text-stone-900"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-stone-500 sm:text-sm">{label}</p>
    </div>
  );
}

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
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
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
    message = isPastWeek
      ? "No tasks were finished this week."
      : "Your week is planned. Pick the first one and start.";
  } else if (remaining === 0) {
    message = `All ${total} done. Look how far you came.`;
  } else {
    message = `You've moved forward ${done} ${done === 1 ? "time" : "times"} this week. Keep going.`;
  }

  const navButton =
    "flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-50";

  const chip = (active: boolean, isToday = false) =>
    `shrink-0 rounded-full border text-center transition ${
      active
        ? "border-green-600 bg-green-600 text-white"
        : isToday
        ? "border-green-300 bg-white text-stone-700 hover:bg-stone-50"
        : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
    }`;

  return (
    <>
      {/* header: title + add button on one row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">{title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Link href={prevHref} aria-label="Previous week" className={navButton}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link href={nextHref} aria-label="Next week" className={navButton}>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <span className="ml-1 text-base text-stone-500 sm:text-lg">{range}</span>
            {todayHref && (
              <Link
                href={todayHref}
                className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 hover:bg-green-100"
              >
                This week
              </Link>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAddDate(defaultAdd)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 sm:px-6 sm:py-3.5 sm:text-base"
        >
          <Plus className="h-4 w-4" />
          Add task
        </button>
      </div>

      {/* one compact summary card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="grid grid-cols-3 divide-x divide-stone-200">
          <Stat value={`${done}/${total}`} label="Done" />
          <Stat value={`${activeDays}/7`} label="Active days" green />
          <Stat value={String(remaining)} label="Left" />
        </div>
        <div
          role="progressbar"
          aria-label="Tasks done this week"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-1.5 bg-stone-100"
        >
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 sm:text-base">
        {message}
      </p>

      {/* day filter: sticks under the top bar while you scroll */}
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top)+1px)] z-20 -mx-4 mt-4 bg-cream px-4 py-3 sm:-mx-6 sm:px-6 lg:top-0 lg:mx-0 lg:px-0">
        <div
          role="group"
          aria-label="Filter by day"
          className="flex gap-2 overflow-x-auto [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          <button
            type="button"
            onClick={() => setSelected("all")}
            aria-pressed={selected === "all"}
            className={`${chip(selected === "all")} flex items-center px-5 font-semibold`}
          >
            All days
          </button>
          {days.map((date) => {
            const list = forDay(date);
            const d = list.filter((i) => i.completed).length;
            const complete = list.length > 0 && d === list.length;
            const active = selected === date;

            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelected(date)}
                aria-pressed={active}
                aria-label={`${weekdayName(date)}, ${list.length === 0 ? "nothing planned" : `${d} of ${list.length} done`}`}
                className={`${chip(active, date === today)} px-4 py-1.5`}
              >
                <span className="block text-sm font-semibold">{weekdayShort(date)}</span>
                <span
                  className={`block text-xs font-medium ${
                    active ? "text-green-100" : complete ? "text-green-600" : "text-stone-400"
                  }`}
                >
                  {list.length === 0 ? "–" : `${d}/${list.length}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-8">
        {shownDays.map((date) => {
          const list = forDay(date);
          const d = list.filter((i) => i.completed).length;
          const complete = list.length > 0 && d === list.length;

          return (
            <section key={date}>
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="font-heading text-lg font-semibold text-stone-900">
                  {weekdayName(date)}
                </h2>
                <span className="text-sm text-stone-400">{shortDate(date)}</span>
                {date === today && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    Today
                  </span>
                )}
                {list.length > 0 && (
                  <span className="text-sm text-stone-400">
                    {d}/{list.length}
                  </span>
                )}
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