export const CATEGORIES = ["Career", "Learning", "Health", "Personal"] as const;
export type Category = (typeof CATEGORIES)[number];

export const MAX_STEPS = 20;
export const MAX_SUBSTEPS = 15;

/* ---------- form values + validation (client and server) ---------- */

export type SubstepInput = { id?: number; title: string };
export type GoalStepInput = {
  id?: number;
  title: string;
  substeps: SubstepInput[];
};

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
    .map((s) => ({
      ...s,
      title: s.title.trim(),
      substeps: s.substeps
        .map((x) => ({ ...x, title: x.title.trim() }))
        .filter((x) => x.title.length > 0),
    }))
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
  const orphanSubsteps = values.steps.some(
    (s) =>
      s.title.trim() === "" && s.substeps.some((x) => x.title.trim() !== "")
  );

  if (orphanSubsteps) {
    errors.steps = "Give each step a title before adding sub-steps to it.";
  } else if (steps.length === 0) {
    errors.steps = "Add at least one step.";
  } else if (steps.length > MAX_STEPS) {
    errors.steps = `A goal can have up to ${MAX_STEPS} steps.`;
  } else if (
    steps.some(
      (s) => s.title.length > 100 || s.substeps.some((x) => x.title.length > 100)
    )
  ) {
    errors.steps = "Keep each step and sub-step under 100 characters.";
  } else if (steps.some((s) => s.substeps.length > MAX_SUBSTEPS)) {
    errors.steps = `A step can have up to ${MAX_SUBSTEPS} sub-steps.`;
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

export type SubstepView = { id: number; title: string; completed: boolean };
export type StepStatus = "done" | "current" | "upcoming";

export type GoalStepView = {
  id: number;
  title: string;
  completed: boolean; // derived: every sub-step is done (or the step itself)
  status: StepStatus;
  progress: number;
  substeps: SubstepView[];
};

export type NextAction = {
  kind: "step" | "substep";
  id: number;
  title: string;
  parent: string;
};

export type GoalView = {
  id: number;
  title: string;
  category: Category;
  description: string | null;
  targetLabel: string;
  progress: number;
  doneCount: number; // finished steps
  totalCount: number; // all steps
  current: string | null; // title of the current step
  next: string | null; // what comes after "current"
  nextAction: NextAction | null; // the one thing to do now
  steps: GoalStepView[];
};

type GoalStepRow = {
  id: number;
  title: string;
  completed: boolean;
  substeps: SubstepView[];
};

type GoalRow = {
  id: number;
  title: string;
  category: Category;
  description: string | null;
  targetDate: string | null;
  steps: (Omit<GoalStepRow, "substeps"> & {
    substeps?: SubstepView[];
  })[];
};

function stepFraction(step: GoalStepRow) {
  if (step.substeps.length > 0) {
    return step.substeps.filter((x) => x.completed).length / step.substeps.length;
  }
  return step.completed ? 1 : 0;
}

export function toGoalView(row: GoalRow): GoalView {
  const stepsWithSubsteps = row.steps.map((step) => {
    if (!step.substeps) {
      throw new Error("Goal steps must be queried with their substeps.");
    }

    return { ...step, substeps: step.substeps };
  });
  const fractions = stepsWithSubsteps.map(stepFraction);
  const currentIndex = fractions.findIndex((f) => f < 1);

  const steps: GoalStepView[] = stepsWithSubsteps.map((s, i) => ({
    id: s.id,
    title: s.title,
    completed: fractions[i] === 1,
    status: fractions[i] === 1 ? "done" : i === currentIndex ? "current" : "upcoming",
    progress: Math.round(fractions[i] * 100),
    substeps: s.substeps.map(({ id, title, completed }) => ({
      id,
      title,
      completed,
    })),
  }));

  const total = steps.length;
  const average = total === 0 ? 0 : fractions.reduce((a, b) => a + b, 0) / total;
  const cur = currentIndex >= 0 ? steps[currentIndex] : null;

  let nextAction: NextAction | null = null;
  let next: string | null = null;

  if (cur) {
    const sub = cur.substeps.find((x) => !x.completed);
    if (sub) {
      nextAction = { kind: "substep", id: sub.id, title: sub.title, parent: cur.title };
      next = sub.title;
    } else {
      nextAction = { kind: "step", id: cur.id, title: cur.title, parent: row.title };
      next = steps.slice(currentIndex + 1).find((s) => s.status !== "done")?.title ?? null;
    }
  }

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    targetLabel: formatTargetDate(row.targetDate),
    progress: Math.round(average * 100),
    doneCount: steps.filter((s) => s.status === "done").length,
    totalCount: total,
    current: cur?.title ?? null,
    next,
    nextAction,
    steps,
  };
}