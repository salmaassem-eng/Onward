"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { createGoal, deleteGoal, updateGoal } from "@/app/actions/goals";
import {
  CATEGORIES,
  MAX_STEPS,
  validateGoal,
  type GoalFormErrors,
  type GoalFormValues,
} from "@/lib/goals";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

type StepState = {
  key: string;
  id?: number;
  title: string;
  completed: boolean;
};

type GoalFormProps = {
  goalId?: number;
  initial?: {
    title: string;
    category: string;
    description: string;
    targetDate: string;
    steps: { id: number; title: string; completed: boolean }[];
  };
};

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
        }))
      : [{ key: "new-0", title: "", completed: false }]
  );
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<GoalFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function clearError(field: keyof GoalFormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function addStep() {
    if (steps.length >= MAX_STEPS) return;
    const key = `new-${nextKey.current++}`;
    setSteps((prev) => [...prev, { key, title: "", completed: false }]);
    setFocusKey(key);
    clearError("steps");
  }

  function updateStep(key: string, value: string) {
    setSteps((prev) =>
      prev.map((s) => (s.key === key ? { ...s, title: value } : s))
    );
    clearError("steps");
  }

  function removeStep(key: string) {
    setSteps((prev) =>
      prev.length <= 1 ? prev : prev.filter((s) => s.key !== key)
    );
  }

  function moveStep(index: number, direction: -1 | 1) {
    setSteps((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const values: GoalFormValues = {
      title,
      category,
      description,
      targetDate,
      steps: steps.map((s) => ({ id: s.id, title: s.title })),
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
    if (!confirm("Delete this goal and all its steps?")) return;

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

  const inputBase =
    "w-full rounded-xl border bg-white px-5 py-3.5 text-stone-900 outline-none transition placeholder:text-stone-400 focus:ring-2";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8"
    >
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
          className={`${inputBase} resize-none ${
            errors.description
              ? "border-red-400 focus:ring-red-400/30"
              : "border-stone-200 focus:border-green-500 focus:ring-green-500/40"
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
          Break the goal into small steps. They are followed in this order.
        </p>

        <ul className="space-y-2">
          {steps.map((step, i) => (
            <li key={step.key} className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 text-sm font-semibold text-stone-500">
                {i + 1}
              </span>
              <input
                aria-label={`Step ${i + 1}`}
                placeholder="Describe this step"
                value={step.title}
                autoFocus={step.key === focusKey}
                onChange={(e) => updateStep(step.key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStep();
                  }
                }}
                className={`${inputBase} min-w-0 flex-1 border-stone-200 py-2.5 focus:border-green-500 focus:ring-green-500/40`}
              />
              {step.completed && (
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                  Done
                </span>
              )}
              <div className="flex shrink-0">
                <button
                  type="button"
                  onClick={() => moveStep(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move step ${i + 1} up`}
                  className="rounded-lg p-2 text-stone-400 hover:bg-stone-50 hover:text-stone-700 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(i, 1)}
                  disabled={i === steps.length - 1}
                  aria-label={`Move step ${i + 1} down`}
                  className="rounded-lg p-2 text-stone-400 hover:bg-stone-50 hover:text-stone-700 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(step.key)}
                  disabled={steps.length <= 1}
                  aria-label={`Remove step ${i + 1}`}
                  className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
          className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-600 hover:underline disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Add step
        </button>
      </div>

      <div className="space-y-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save changes →" : "Create goal →"}
        </Button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full rounded-xl py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete goal"}
          </button>
        )}
      </div>
    </form>
  );
}