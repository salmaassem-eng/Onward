"use client";

import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { addCustomPlanItem, addLinkedPlanItems } from "@/app/actions/plan";
import { weekdayName } from "@/lib/dates";
import { CATEGORIES } from "@/lib/goals";
import { reportErrors } from "@/lib/notify";
import {
  validateCustomTask,
  validateDate,
  type PlanCandidate,
  type TaskFormErrors,
} from "@/lib/plan";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import { tagStyle } from "./plan-styles";

type AddTaskModalProps = {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  minDate: string; // today
  candidates: PlanCandidate[];
};

export default function AddTaskModal(props: AddTaskModalProps) {
  return (
    <Modal open={props.open} onClose={props.onClose} labelledBy="add-task-title" width="max-w-lg">
      <Body {...props} />
    </Modal>
  );
}

function Body({ onClose, defaultDate, minDate, candidates }: AddTaskModalProps) {
  const [tab, setTab] = useState<"pick" | "new">(candidates.length > 0 ? "pick" : "new");
  const [date, setDate] = useState(defaultDate);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [busy, setBusy] = useState(false);

  const q = query.trim().toLowerCase();
  const shown = candidates.filter((c) => `${c.title} ${c.source}`.toLowerCase().includes(q));

  function toggle(key: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setErrors((prev) => ({ ...prev, items: undefined }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    let found: TaskFormErrors = {};
    if (tab === "pick") {
      const dateError = validateDate(date, minDate);
      if (dateError) found.date = dateError;
      if (picked.size === 0) found.items = "Pick at least one item to add.";
    } else {
      found = validateCustomTask({ title, category, date }, minDate);
    }
    if (Object.keys(found).length > 0) {
      setErrors(found);
      reportErrors(found);
      return;
    }

    setBusy(true);
    try {
      const result =
        tab === "pick"
          ? await addLinkedPlanItems(
              date,
              candidates.filter((c) => picked.has(c.key)).map((c) => ({ kind: c.kind, id: c.id }))
            )
          : await addCustomPlanItem(date, title, category);

      if (!result.ok) {
        if (result.errors) {
          setErrors(result.errors);
          reportErrors(result.errors);
        }
        if (result.message) toast.error(result.message);
        return;
      }

      if (result.added === 0) toast.info("Already in your plan for that day.");
      else
        toast.success(
          `Added ${result.added} ${result.added === 1 ? "task" : "tasks"} to ${weekdayName(date)}.`
        );
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg py-2 text-sm font-semibold transition ${
      active ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
    }`;

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-col">
      <div className="flex items-start justify-between p-6 pb-4">
        <div>
          <h2 id="add-task-title" className="font-heading text-xl font-bold text-stone-900">
            Add a task
          </h2>
          <p className="mt-1 text-sm text-stone-500">Plan something for a specific day.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-2">
        <FormField
          label="Day"
          id="plan-date"
          type="date"
          min={minDate}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setErrors((prev) => ({ ...prev, date: undefined }));
          }}
          error={errors.date}
        />

        <div className="flex gap-1 rounded-xl bg-stone-100 p-1" role="group" aria-label="Task type">
          <button type="button" aria-pressed={tab === "pick"} onClick={() => setTab("pick")} className={tabClass(tab === "pick")}>
            From my goals & projects
          </button>
          <button type="button" aria-pressed={tab === "new"} onClick={() => setTab("new")} className={tabClass(tab === "new")}>
            New task
          </button>
        </div>

        {tab === "pick" ? (
          <div>
            {candidates.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 p-5 text-center text-sm text-stone-500">
                Nothing to pick from yet. Create a goal or project, or add a new task.
              </p>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    aria-label="Search your steps and tasks"
                    placeholder="Search steps and tasks"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-stone-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/40"
                  />
                </div>

                <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                  {shown.length === 0 && (
                    <li className="py-4 text-center text-sm text-stone-400">No matches.</li>
                  )}
                  {shown.map((c) => {
                    const on = picked.has(c.key);
                    return (
                      <li key={c.key}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(c.key)}
                          className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                            on ? "border-green-400 bg-green-50" : "border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                              on ? "border-green-500 bg-green-500 text-white" : "border-stone-300"
                            }`}
                          >
                            {on && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-stone-900">{c.title}</span>
                            <span className="block truncate text-xs text-stone-400">{c.source}</span>
                          </span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${tagStyle(c.tag)}`}>
                            {c.tag}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {errors.items && (
              <p data-form-error className="mt-2 text-sm text-red-500">
                {errors.items}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <FormField
              label="What will you do?"
              id="plan-title"
              placeholder="Weekly review"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              error={errors.title}
            />
            <div>
              <p className="mb-2 text-sm font-medium text-stone-700">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                      category === c
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-stone-200 text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 pt-4">
        <Button type="submit" loading={busy}>
          {tab === "pick" && picked.size > 0
            ? `Add ${picked.size} ${picked.size === 1 ? "task" : "tasks"} →`
            : "Add to plan →"}
        </Button>
      </div>
    </form>
  );
}