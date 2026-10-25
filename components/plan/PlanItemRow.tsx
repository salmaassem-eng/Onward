"use client";

import { useTransition } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { movePlanItem, removePlanItem, togglePlanItem } from "@/app/actions/plan";
import { moveTarget, type PlanItemView } from "@/lib/plan";
import { tagStyle } from "./plan-styles";

type PlanItemRowProps = {
  item: PlanItemView;
  today: string;
  showMove?: boolean;
};

export default function PlanItemRow({ item, today, showMove = false }: PlanItemRowProps) {
  const [pending, startTransition] = useTransition();
  const target = moveTarget(item.date, today);
  const moveLabel = item.date < today ? "Move to today" : "Move to tomorrow";

  function toggle() {
    startTransition(async () => {
      try {
        await togglePlanItem(item.id, !item.completed);
        if (item.completed) toast.info("Moved back to to-do.");
        else toast.success("Nice. Marked as done.");
      } catch {
        toast.error("Couldn't save that. Please try again.");
      }
    });
  }

  function move() {
    startTransition(async () => {
      try {
        const result = await movePlanItem(item.id, target);
        if (result.ok) toast.success(moveLabel.replace("Move", "Moved") + ".");
        else toast.error(result.errors?.date ?? result.message ?? "Couldn't move it.");
      } catch {
        toast.error("Couldn't move it. Please try again.");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        await removePlanItem(item.id);
        toast.success("Removed from your plan.");
      } catch {
        toast.error("Couldn't remove it. Please try again.");
      }
    });
  }

  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
        item.completed ? "border-stone-100 bg-stone-50/70" : "border-stone-200 bg-white"
      } ${pending ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={item.completed}
        aria-label={item.completed ? `Mark "${item.title}" as not done` : `Mark "${item.title}" as done`}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
          item.completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-stone-300 bg-white hover:border-green-500"
        }`}
      >
        {item.completed && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate font-medium ${item.completed ? "text-stone-400 line-through" : "text-stone-900"}`}>
          {item.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className={`shrink-0 rounded-full px-2 py-0.5 font-medium ${tagStyle(item.tag)}`}>
            {item.tag}
          </span>
          {item.source && <span className="truncate text-stone-400">{item.source}</span>}
        </div>
      </div>

      {showMove && !item.completed && (
        <button
          type="button"
          onClick={move}
          disabled={pending}
          title={moveLabel}
          aria-label={`${moveLabel}: ${item.title}`}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{item.date < today ? "Today" : "Tomorrow"}</span>
        </button>
      )}

      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label={`Remove "${item.title}" from the plan`}
        className="shrink-0 rounded-lg p-2 text-stone-300 transition hover:bg-red-50 hover:text-red-600"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}