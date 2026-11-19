"use client";

import { useTransition } from "react";
import { ArrowRight, Check, ExternalLink, Pin, PinOff, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  makeRoutine,
  movePlanItem,
  removePlanItem,
  stopRoutine,
  toggleRoutine,
  togglePlanItem,
} from "@/app/actions/plan";
import { moveTarget, type PlanItemView } from "@/lib/plan";
import { tagStyle } from "./plan-styles";

type PlanItemRowProps = {
  item: PlanItemView;
  today: string;
  showMove?: boolean;
  undoable?: boolean; // Home: the row disappears when done, so offer an Undo
};

const iconButton =
  "shrink-0 rounded-lg p-2 text-stone-300 transition hover:bg-stone-100 hover:text-stone-600";

export default function PlanItemRow({
  item,
  today,
  showMove = false,
  undoable = false,
}: PlanItemRowProps) {
  const [pending, startTransition] = useTransition();
  const isRoutine = item.routineId !== null;
  const locked = isRoutine && item.date > today; // a future day can't be checked yet
  const target = moveTarget(item.date, today);
  const moveLabel = item.date < today ? "Move to today" : "Move to tomorrow";

  const setDone = (completed: boolean) =>
    isRoutine
      ? toggleRoutine(item.routineId!, item.date, completed)
      : togglePlanItem(item.id, completed);

  async function undo() {
    try {
      await setDone(false);
      toast.info("Moved back to to-do.");
    } catch {
      toast.error("Couldn't undo that. Please try again.");
    }
  }

  function toggle() {
    startTransition(async () => {
      try {
        await setDone(!item.completed);

        if (item.completed) {
          toast.info("Moved back to to-do.");
        } else if (undoable) {
          toast.success(
            ({ closeToast }) => (
              <div className="flex items-center justify-between gap-3">
                <span>Nice. Done for today.</span>
                <button
                  type="button"
                  onClick={() => {
                    closeToast();
                    void undo();
                  }}
                  className="font-semibold underline"
                >
                  Undo
                </button>
              </div>
            ),
            { autoClose: 5000 }
          );
        } else {
          toast.success("Nice. Marked as done.");
        }
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

  function pin() {
    startTransition(async () => {
      try {
        const result = await makeRoutine(item.id);
        if (result.ok) toast.success(`Pinned. "${item.title}" now repeats every day.`);
        else toast.error(result.message ?? "Couldn't pin it.");
      } catch {
        toast.error("Couldn't pin it. Please try again.");
      }
    });
  }

  function unpin() {
    startTransition(async () => {
      try {
        const result = await stopRoutine(item.routineId!, item.date);
        if (result.ok) toast.success("Stopped repeating.");
        else toast.error(result.message ?? "Couldn't unpin it.");
      } catch {
        toast.error("Couldn't unpin it. Please try again.");
      }
    });
  }

  return (
    <li
      className={`flex items-center gap-2 rounded-2xl border px-3 py-3 transition sm:gap-3 sm:px-4 ${
        item.completed
          ? "border-stone-100 bg-stone-50/70"
          : isRoutine
          ? "border-green-100 bg-white"
          : "border-stone-200 bg-white"
      } ${pending ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={pending || locked}
        aria-pressed={item.completed}
        title={locked ? "You can check this off on the day" : undefined}
        aria-label={
          item.completed ? `Mark "${item.title}" as not done` : `Mark "${item.title}" as done`
        }
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
          item.completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-stone-300 bg-white hover:border-green-500"
        }`}
      >
        {item.completed && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          dir="auto"
          className={`line-clamp-2 break-words font-medium ${
            item.completed ? "text-stone-400 line-through" : "text-stone-900"
          }`}
        >
          {item.title}
        </p>
        <div className="mt-1 flex min-w-0 items-center gap-2 text-xs">
          <span className={`shrink-0 rounded-full px-2 py-0.5 font-medium ${tagStyle(item.tag)}`}>
            {item.tag}
          </span>
          {isRoutine ? (
            <span className="inline-flex shrink-0 items-center gap-1 font-medium text-green-600">
              <Pin className="h-3 w-3" aria-hidden />
              Every day
            </span>
          ) : (
            item.source && (
              <span dir="auto" className="truncate text-stone-400">
                {item.source}
              </span>
            )
          )}
        </div>
      </div>

      {item.href && (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open "${item.title}"`}
          title="Open this lesson"
          className="shrink-0 rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-green-600"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}

      {showMove && !item.completed && !isRoutine && (
        <button
          type="button"
          onClick={move}
          disabled={pending}
          title={moveLabel}
          aria-label={`${moveLabel}: ${item.title}`}
          className="flex shrink-0 items-center gap-1 rounded-lg p-2 text-xs font-semibold text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
        >
          <ArrowRight className="h-4 w-4" />
          <span className="hidden sm:inline">{item.date < today ? "Today" : "Tomorrow"}</span>
        </button>
      )}

      {item.custom && (
        <button
          type="button"
          onClick={pin}
          disabled={pending}
          title="Pin as a daily routine"
          aria-label={`Pin "${item.title}" as a daily routine`}
          className={`${iconButton} hover:!bg-green-50 hover:!text-green-600`}
        >
          <Pin className="h-4 w-4" />
        </button>
      )}

      {isRoutine ? (
        <button
          type="button"
          onClick={unpin}
          disabled={pending}
          title="Stop repeating"
          aria-label={`Stop repeating "${item.title}"`}
          className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
        >
          <PinOff className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={`Remove "${item.title}" from the plan`}
          className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}