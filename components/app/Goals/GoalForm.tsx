"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CornerDownRight,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { createGoal, deleteGoal, updateGoal } from "@/app/actions/goals";
import {
  CATEGORIES,
  MAX_STEPS,
  MAX_SUBSTEPS,
  validateGoal,
  type GoalFormErrors,
  type GoalFormValues,
} from "@/lib/goals";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

type SubState = { key: string; id?: number; title: string; completed: boolean };
type StepState = {
  key: string;
  id?: number;
  title: string;
  completed: boolean;
  substeps: SubState[];
};

type GoalFormProps = {
  goalId?: number;
  initial?: {
    title: string;
    category: string;
    description: string;
    targetDate: string;
    steps: {
      id: number;
      title: string;
      completed: boolean;
      substeps: { id: number; title: string; completed: boolean }[];
    }[];
  };
};

function swap<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

const fieldBase =
  "rounded-xl border bg-white text-stone-900 outline-none transition placeholder:text-stone-400 focus:ring-2";
const fieldOk =
  "border-stone-200 focus:border-green-500 focus:ring-green-500/40";
const fieldBad = "border-red-400 focus:ring-red-400/30";

const iconButton =
  "rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30 disabled:hover:bg-transparent";

export default function GoalForm({ goalId, initial }: GoalFormProps) {
  const router = useRouter();
  const isEdit = goalId !== undefined;

  const nextKey = useRef(1);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? "");
  const [steps, setSteps] = useState<StepState[]>(() =>
    initial
      ? initial.steps.map((s) => ({
          key: `step-${s.id}`,
          id: s.id,
          title: s.title,
          completed: s.completed,
          substeps: s.substeps.map((x) => ({
            key: `sub-${x.id}`,
            id: x.id,
            title: x.title,
            completed: x.completed,
          })),
        }))
      : [{ key: "new-0", title: "", completed: false, substeps: [] }]
  );
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<GoalFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function clearError(field: keyof GoalFormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function patchStep(stepKey: string, fn: (s: StepState) => StepState) {
    setSteps((prev) => prev.map((s) => (s.key === stepKey ? fn(s) : s)));
    clearError("steps");
  }

  /* ----- steps ----- */
  function addStep() {
    if (steps.length >= MAX_STEPS) return;
    const key = `new-${nextKey.current++}`;
    setSteps((prev) => [
      ...prev,
      { key, title: "", completed: false, substeps: [] },
    ]);
    setFocusKey(key);
    clearError("steps");
  }

  function removeStep(key: string) {
    setSteps((prev) =>
      prev.length <= 1 ? prev : prev.filter((s) => s.key !== key)
    );
  }

  /* ----- sub-steps ----- */
  function addSubstep(stepKey: string) {
    const key = `sub-new-${nextKey.current++}`;
    patchStep(stepKey, (s) =>
      s.substeps.length >= MAX_SUBSTEPS
        ? s
        : {
            ...s,
            substeps: [...s.substeps, { key, title: "", completed: false }],
          }
    );
    setFocusKey(key);
  }

  function removeSubstep(stepKey: string, subKey: string) {
    patchStep(stepKey, (s) => ({
      ...s,
      substeps: s.substeps.filter((x) => x.key !== subKey),
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const values: GoalFormValues = {
      title,
      category,
      description,
      targetDate,
      steps: steps.map((s) => ({
        id: s.id,
        title: s.title,
        substeps: s.substeps.map((x) => ({ id: x.id, title: x.title })),
      })),
    };

    const validationErrors = validateGoal(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateGoal(goalId, values)
        : await createGoal(values);

      if (!result.ok) {
        if (result.errors) setErrors(result.errors);
        if (result.message) toast.error(result.message);
        return;
      }

      toast.success(isEdit ? "Goal updated!" : "Goal created!");
      router.push("/goals");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    if (!confirm("Delete this goal, its steps and sub-steps?")) return;

    setIsDeleting(true);
    try {
      await deleteGoal(goalId);
      toast.success("Goal deleted.");
      router.push("/goals");
    } catch {
      toast.error("Couldn't delete the goal.");
      setIsDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8"
    >
      {isEdit && (
        <div className="flex items-center justify-between border-b border-stone-100 pb-5">
          <p className="text-sm text-stone-400">Editing this goal</p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete goal"}
          </button>
        </div>
      )}

      <FormField
        label="Goal title"
        id="goal-title"
        placeholder="Become a full-stack developer"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          clearError("title");
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
              onClick={() => {
                setCategory(c);
                clearError("category");
              }}
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
        {errors.category && (
          <p className="mt-1.5 text-sm text-red-500">{errors.category}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="goal-description"
          className="mb-2 block text-sm font-medium text-stone-700"
        >
          Description (optional)
        </label>
        <textarea
          id="goal-description"
          rows={3}
          placeholder="Why this goal matters to you"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError("description");
          }}
          className={`${fieldBase} w-full resize-none px-5 py-3.5 ${
            errors.description ? fieldBad : fieldOk
          }`}
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div>
        <FormField
          label="Target date (optional)"
          id="goal-date"
          type="date"
          value={targetDate}
          onChange={(e) => {
            setTargetDate(e.target.value);
            clearError("targetDate");
          }}
          error={errors.targetDate}
        />
        <p className="mt-1.5 text-sm text-stone-400">
          Leave it empty for an ongoing goal.
        </p>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-stone-700">Steps</p>
          <span className="text-xs text-stone-400">
            {steps.length}/{MAX_STEPS}
          </span>
        </div>
        <p className="mb-3 mt-1 text-sm text-stone-400">
          Steps are the big milestones, followed in this order. Add sub-steps
          under a step for the small tasks.
        </p>

        <ul className="space-y-3">
          {steps.map((step, i) => (
            <li
              key={step.key}
              className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-stone-500">
                  {i + 1}
                </span>
                <input
                  aria-label={`Step ${i + 1}`}
                  placeholder="Describe this step"
                  value={step.title}
                  autoFocus={step.key === focusKey}
                  onChange={(e) =>
                    patchStep(step.key, (s) => ({ ...s, title: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addStep();
                    }
                  }}
                  className={`${fieldBase} ${fieldOk} min-w-0 flex-1 px-4 py-2.5`}
                />
                {step.completed && step.substeps.length === 0 && (
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                    Done
                  </span>
                )}
                <div className="flex shrink-0">
                  <button
                    type="button"
                    onClick={() => setSteps((prev) => swap(prev, i, -1))}
                    disabled={i === 0}
                    aria-label={`Move step ${i + 1} up`}
                    className={iconButton}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSteps((prev) => swap(prev, i, 1))}
                    disabled={i === steps.length - 1}
                    aria-label={`Move step ${i + 1} down`}
                    className={iconButton}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(step.key)}
                    disabled={steps.length <= 1}
                    aria-label={`Remove step ${i + 1}`}
                    className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {step.substeps.length > 0 && (
                <ul className="ml-4 mt-3 space-y-2 border-l-2 border-stone-200 pl-4">
                  {step.substeps.map((sub, j) => (
                    <li key={sub.key} className="flex items-center gap-1">
                      <input
                        aria-label={`Sub-step ${j + 1} of step ${i + 1}`}
                        placeholder="Describe this sub-step"
                        value={sub.title}
                        autoFocus={sub.key === focusKey}
                        onChange={(e) =>
                          patchStep(step.key, (s) => ({
                            ...s,
                            substeps: s.substeps.map((x) =>
                              x.key === sub.key
                                ? { ...x, title: e.target.value }
                                : x
                            ),
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSubstep(step.key);
                          }
                        }}
                        className={`${fieldBase} ${fieldOk} min-w-0 flex-1 px-3 py-2 text-sm`}
                      />
                      {sub.completed && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Done
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          patchStep(step.key, (s) => ({
                            ...s,
                            substeps: swap(s.substeps, j, -1),
                          }))
                        }
                        disabled={j === 0}
                        aria-label="Move sub-step up"
                        className={iconButton}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          patchStep(step.key, (s) => ({
                            ...s,
                            substeps: swap(s.substeps, j, 1),
                          }))
                        }
                        disabled={j === step.substeps.length - 1}
                        aria-label="Move sub-step down"
                        className={iconButton}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubstep(step.key, sub.key)}
                        aria-label="Remove sub-step"
                        className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={() => addSubstep(step.key)}
                disabled={step.substeps.length >= MAX_SUBSTEPS}
                className="ml-4 mt-3 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-green-600 disabled:opacity-40"
              >
                <CornerDownRight className="h-4 w-4" />
                Add sub-step
              </button>
            </li>
          ))}
        </ul>

        {errors.steps && (
          <p className="mt-2 text-sm text-red-500">{errors.steps}</p>
        )}

        <button
          type="button"
          onClick={addStep}
          disabled={steps.length >= MAX_STEPS}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-green-600 hover:underline disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Add step
        </button>
      </div>

      <div className="pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save changes →" : "Create goal →"}
        </Button>
      </div>
    </form>
  );
}