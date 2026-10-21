"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createGoal } from "@/app/actions/goals";
import { CATEGORIES } from "@/lib/goals";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

export default function GoalForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [nextStep, setNextStep] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [errors, setErrors] = useState<{ title?: string; category?: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createGoal({ title, category, nextStep, targetDate });

      if (!result.ok) {
        setErrors(result.errors);
        return;
      }

      toast.success("Goal created!");
      setTitle("");
      setNextStep("");
      setTargetDate("");
      setErrors({});
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6"
    >
      <h2 className="font-heading text-lg font-semibold text-stone-900">
        New goal
      </h2>

      <FormField
        label="What do you want to achieve?"
        id="goal-title"
        placeholder="Become a full-stack developer"
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

      <FormField
        label="Next step (optional)"
        id="goal-next"
        placeholder="Finish the Server Components lesson"
        value={nextStep}
        onChange={(e) => setNextStep(e.target.value)}
      />

      <FormField
        label="Target date (optional)"
        id="goal-date"
        type="date"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
      />

      <Button type="submit" loading={isSubmitting}>
        Create goal →
      </Button>
    </form>
  );
}