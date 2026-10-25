export const PROJECT_STATUSES = ["active", "paused"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const MAX_MILESTONES = 50;
export const MAX_TASKS = 50;

/* ---------- form values + validation (client and server) ---------- */

export type TaskInput = { id?: number; title: string };
export type MilestoneInput = {
  id?: number;
  title: string;
  tasks: TaskInput[];
};

export type ProjectFormValues = {
  title: string;
  description: string;
  goalId: string; // "" = freelance project
  status: string;
  deadline: string; // "YYYY-MM-DD" or ""
  githubUrl: string;
  deployUrl: string;
  milestones: MilestoneInput[];
};

export type ProjectFormErrors = {
  title?: string;
  description?: string;
  goalId?: string;
  status?: string;
  deadline?: string;
  githubUrl?: string;
  deployUrl?: string;
  milestones?: string;
};

// "github.com/me/repo" becomes "https://github.com/me/repo"
export function normalizeUrl(value: string) {
  const v = value.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function isValidUrl(value: string) {
  if (value.length > 300) return false;
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

export function cleanMilestones(milestones: MilestoneInput[]): MilestoneInput[] {
  return milestones
    .map((m) => ({
      ...m,
      title: m.title.trim(),
      tasks: m.tasks
        .map((t) => ({ ...t, title: t.title.trim() }))
        .filter((t) => t.title.length > 0),
    }))
    .filter((m) => m.title.length > 0);
}

export function validateProject(values: ProjectFormValues): ProjectFormErrors {
  const errors: ProjectFormErrors = {};
  const title = values.title.trim();

  if (title.length < 2) {
    errors.title = "Give your project a name (at least 2 characters).";
  } else if (title.length > 100) {
    errors.title = "Keep the name under 100 characters.";
  }

  if (values.description.trim().length > 300) {
    errors.description = "Keep the description under 300 characters.";
  }

  if (!PROJECT_STATUSES.includes(values.status as ProjectStatus)) {
    errors.status = "Pick a status.";
  }

  if (values.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(values.deadline)) {
    errors.deadline = "Enter a valid date.";
  }

  const github = normalizeUrl(values.githubUrl);
  if (github && !isValidUrl(github)) {
    errors.githubUrl = "Enter a valid link, like github.com/you/project.";
  }

  const deploy = normalizeUrl(values.deployUrl);
  if (deploy && !isValidUrl(deploy)) {
    errors.deployUrl = "Enter a valid link, like myproject.vercel.app.";
  }

  const milestones = cleanMilestones(values.milestones);
  const orphanTasks = values.milestones.some(
    (m) => m.title.trim() === "" && m.tasks.some((t) => t.title.trim() !== "")
  );

  if (orphanTasks) {
    errors.milestones = "Give each milestone a title before adding tasks to it.";
  } else if (milestones.length === 0) {
    errors.milestones = "Add at least one milestone.";
  } else if (milestones.length > MAX_MILESTONES) {
    errors.milestones = `A project can have up to ${MAX_MILESTONES} milestones.`;
  } else if (
    milestones.some(
      (m) => m.title.length > 100 || m.tasks.some((t) => t.title.length > 100)
    )
  ) {
    errors.milestones = "Keep each milestone and task under 100 characters.";
  } else if (milestones.some((m) => m.tasks.length > MAX_TASKS)) {
    errors.milestones = `A milestone can have up to ${MAX_TASKS} tasks.`;
  }

  return errors;
}

/* ---------- view model used by the pages ---------- */

export function formatDeadline(value: string | null) {
  if (!value) return "No deadline";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type ProjectState = "active" | "paused" | "completed";
export type MilestoneStatus = "done" | "current" | "upcoming";

export type TaskView = { id: number; title: string; completed: boolean };

export type MilestoneView = {
  id: number;
  title: string;
  completed: boolean;
  status: MilestoneStatus;
  progress: number;
  tasks: TaskView[];
};

export type ProjectNextAction = {
  kind: "task" | "milestone";
  id: number;
  title: string;
  parent: string;
};

export type ProjectView = {
  id: number;
  title: string;
  initial: string;
  description: string | null;
  goalId: number | null;
  goalTitle: string | null;
  state: ProjectState;
  progress: number;
  doneCount: number;
  totalCount: number;
  deadlineLabel: string;
  githubUrl: string | null;
  deployUrl: string | null; // only filled once the project is finished
  isFinished: boolean;
  nextAction: ProjectNextAction | null;
  milestones: MilestoneView[];
};

type ProjectRow = {
  id: number;
  title: string;
  description: string | null;
  status: ProjectStatus;
  deadline: string | null;
  githubUrl: string | null;
  deployUrl: string | null;
  goal: { id: number; title: string } | null;
  milestones: {
    id: number;
    title: string;
    completed: boolean;
    tasks: TaskView[];
  }[];
};

function fraction(m: ProjectRow["milestones"][number]) {
  if (m.tasks.length > 0) {
    return m.tasks.filter((t) => t.completed).length / m.tasks.length;
  }
  return m.completed ? 1 : 0;
}

export function toProjectView(row: ProjectRow): ProjectView {
  const fractions = row.milestones.map(fraction);
  const currentIndex = fractions.findIndex((f) => f < 1);
  const total = row.milestones.length;
  const isFinished = total > 0 && currentIndex === -1;

  const milestones: MilestoneView[] = row.milestones.map((m, i) => ({
    id: m.id,
    title: m.title,
    completed: fractions[i] === 1,
    status:
      fractions[i] === 1 ? "done" : i === currentIndex ? "current" : "upcoming",
    progress: Math.round(fractions[i] * 100),
    tasks: m.tasks.map(({ id, title, completed }) => ({ id, title, completed })),
  }));

  const average = total === 0 ? 0 : fractions.reduce((a, b) => a + b, 0) / total;
  const cur = currentIndex >= 0 ? milestones[currentIndex] : null;

  let nextAction: ProjectNextAction | null = null;
  if (cur) {
    const task = cur.tasks.find((t) => !t.completed);
    nextAction = task
      ? { kind: "task", id: task.id, title: task.title, parent: cur.title }
      : { kind: "milestone", id: cur.id, title: cur.title, parent: row.title };
  }

  return {
    id: row.id,
    title: row.title,
    initial: row.title.trim()[0]?.toUpperCase() ?? "P",
    description: row.description,
    goalId: row.goal?.id ?? null,
    goalTitle: row.goal?.title ?? null,
    state: isFinished ? "completed" : row.status,
    progress: Math.round(average * 100),
    doneCount: milestones.filter((m) => m.status === "done").length,
    totalCount: total,
    deadlineLabel: formatDeadline(row.deadline),
    githubUrl: row.githubUrl,
    deployUrl: isFinished ? row.deployUrl : null,
    isFinished,
    nextAction,
    milestones,
  };
}