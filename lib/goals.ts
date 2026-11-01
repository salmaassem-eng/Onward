import { isValidDate } from "./dates";

export const CATEGORIES = ["Career", "Learning", "Health", "Personal"] as const;
export type Category = (typeof CATEGORIES)[number];

export const MAX_STEPS = 20;
export const MAX_SUBSTEPS = 15;

/* ---------- form values + validation (client and server) ---------- */

export type SubstepInput = { id?: number; title: string; targetDate: string };
export type GoalStepInput = {
  id?: number;
  title: string;
  targetDate: string; // "YYYY-MM-DD" or ""
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
      targetDate: (s.targetDate ?? "").trim(),
      substeps: s.substeps
        .map((x) => ({
          ...x,
          title: x.title.trim(),
          targetDate: (x.targetDate ?? "").trim(),
        }))
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

  if (values.targetDate && !isValidDate(values.targetDate)) {
    errors.targetDate = "Enter a valid date.";
  }

  const steps = cleanSteps(values.steps);
  const orphanSubsteps = values.steps.some(
    (s) => s.title.trim() === "" && s.substeps.some((x) => x.title.trim() !== "")
  );
  const badDate = values.steps.some(
    (s) =>
      (s.targetDate && !isValidDate(s.targetDate)) ||
      s.substeps.some((x) => x.targetDate && !isValidDate(x.targetDate))
  );
  const lateSubstep = steps.some(
    (s) => s.targetDate && s.substeps.some((x) => x.targetDate && x.targetDate > s.targetDate)
  );

  if (orphanSubsteps) {
    errors.steps = "Give each step a title before adding sub-steps to it.";
  } else if (badDate) {
    errors.steps = "One of the step or sub-step dates isn't valid.";
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
  } else if (lateSubstep) {
    errors.steps = "A sub-step can't be due after its step.";
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

export function formatDay(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type SubstepView = {
  id: number;
  title: string;
  completed: boolean;
  targetDate: string | null;
  dueLabel: string | null;
  overdue: boolean;
};
export type StepStatus = "done" | "current" | "upcoming";

export type GoalStepView = {
  id: number;
  title: string;
  completed: boolean; // derived: every sub-step is done (or the step itself)
  status: StepStatus;
  progress: number;
  targetDate: string | null;
  dueLabel: string | null;
  overdue: boolean;
  substeps: SubstepView[];
};

export type NextAction = {
  kind: "step" | "substep";
  id: number;
  title: string;
  parent: string;
  dueLabel: string | null;
  overdue: boolean;
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

type GoalRow = {
  id: number;
  title: string;
  category: Category;
  description: string | null;
  targetDate: string | null;
  steps: {
    id: number;
    title: string;
    completed: boolean;
    targetDate: string | null;
    substeps: {
      id: number;
      title: string;
      completed: boolean;
      targetDate: string | null;
    }[];
  }[];
};

function stepFraction(step: GoalRow["steps"][number]) {
  if (step.substeps.length > 0) {
    return step.substeps.filter((x) => x.completed).length / step.substeps.length;
  }
  return step.completed ? 1 : 0;
}

function due(date: string | null, completed: boolean, today?: string) {
  return {
    targetDate: date,
    dueLabel: date ? formatDay(date) : null,
    overdue: Boolean(date && today && !completed && date < today),
  };
}

// `today` ("YYYY-MM-DD" in the user's time zone) is only needed to mark overdue items
export function toGoalView(row: GoalRow, today?: string): GoalView {
  const fractions = row.steps.map(stepFraction);
  const currentIndex = fractions.findIndex((f) => f < 1);

  const steps: GoalStepView[] = row.steps.map((s, i) => {
    const done = fractions[i] === 1;
    return {
      id: s.id,
      title: s.title,
      completed: done,
      status: done ? "done" : i === currentIndex ? "current" : "upcoming",
      progress: Math.round(fractions[i] * 100),
      ...due(s.targetDate, done, today),
      substeps: s.substeps.map((x) => ({
        id: x.id,
        title: x.title,
        completed: x.completed,
        ...due(x.targetDate, x.completed, today),
      })),
    };
  });

  const total = steps.length;
  const average = total === 0 ? 0 : fractions.reduce((a, b) => a + b, 0) / total;
  const cur = currentIndex >= 0 ? steps[currentIndex] : null;

  let nextAction: NextAction | null = null;
  let next: string | null = null;

  if (cur) {
    const sub = cur.substeps.find((x) => !x.completed);
    if (sub) {
      nextAction = {
        kind: "substep",
        id: sub.id,
        title: sub.title,
        parent: cur.title,
        dueLabel: sub.dueLabel,
        overdue: sub.overdue,
      };
      next = sub.title;
    } else {
      nextAction = {
        kind: "step",
        id: cur.id,
        title: cur.title,
        parent: row.title,
        dueLabel: cur.dueLabel,
        overdue: cur.overdue,
      };
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