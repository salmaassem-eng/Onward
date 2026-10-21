export const CATEGORIES = ["Career", "Learning", "Health", "Personal"] as const;
export type Category = (typeof CATEGORIES)[number];

export const MAX_STEPS = 50;

/* ---------- form values + validation (client and server) ---------- */

export type GoalStepInput = { id?: number; title: string };

export type GoalFormValues = {
  title: string;
  category: string;
  description: string;
  targetDate: string; // "YYYY-MM-DD" or ""
  steps: GoalStepInput[];
};

export type GoalFormErrors = {
  title?: string;
  category?: string;
  description?: string;
  targetDate?: string;
  steps?: string;
};

export function cleanSteps(steps: GoalStepInput[]): GoalStepInput[] {
  return steps
    .map((s) => ({ ...s, title: s.title.trim() }))
    .filter((s) => s.title.length > 0);
}

export function validateGoal(values: GoalFormValues): GoalFormErrors {
  const errors: GoalFormErrors = {};
  const title = values.title.trim();

  if (title.length < 2) {
    errors.title = "Give your goal a title (at least 2 characters).";
  } else if (title.length > 100) {
    errors.title = "Keep the title under 100 characters.";
  }

  if (!CATEGORIES.includes(values.category as Category)) {
    errors.category = "Pick a category.";
  }

  if (values.description.trim().length > 300) {
    errors.description = "Keep the description under 300 characters.";
  }

  if (values.targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.targetDate)) {
    errors.targetDate = "Enter a valid date.";
  }

  const steps = cleanSteps(values.steps);
  if (steps.length === 0) {
    errors.steps = "Add at least one step.";
  } else if (steps.length > MAX_STEPS) {
    errors.steps = `A goal can have up to ${MAX_STEPS} steps.`;
  } else if (steps.some((s) => s.title.length > 100)) {
    errors.steps = "Keep each step under 100 characters.";
  }

  return errors;
}

/* ---------- view model used by the pages ---------- */

export function formatTargetDate(value: string | null) {
  if (!value) return "Ongoing";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export type GoalStepView = { id: number; title: string; completed: boolean };

export type GoalView = {
  id: number;
  title: string;
  category: Category;
  description: string | null;
  targetLabel: string;
  progress: number;
  doneCount: number;
  totalCount: number;
  current: string | null;
  next: string | null;
  steps: GoalStepView[];
};

type GoalRow = {
  id: number;
  title: string;
  category: Category;
  description: string | null;
  targetDate: string | null;
  steps: GoalStepView[];
};

export function toGoalView(row: GoalRow): GoalView {
  const totalCount = row.steps.length;
  const doneCount = row.steps.filter((s) => s.completed).length;
  const remaining = row.steps.filter((s) => !s.completed);

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    targetLabel: formatTargetDate(row.targetDate),
    progress:
      totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100),
    doneCount,
    totalCount,
    current: remaining[0]?.title ?? null,
    next: remaining[1]?.title ?? null,
    steps: row.steps.map(({ id, title, completed }) => ({
      id,
      title,
      completed,
    })),
  };
}