import { addDays, isValidDate } from "./dates";
import { CATEGORIES, type Category, type GoalView } from "./goals";
import type { ProjectView } from "./projects";

export const REF_KINDS = [
  "goal_step",
  "goal_substep",
  "project_milestone",
  "project_task",
] as const;
export type RefKind = (typeof REF_KINDS)[number];

export type PlanItemView = {
  id: number;
  date: string;
  title: string;
  completed: boolean;
  tag: string; // a goal category, or "Project"
  source: string | null; // "Goal · Step", "Project · Milestone"
};

export type PlanCandidate = {
  key: string;
  kind: RefKind;
  id: number;
  title: string;
  source: string;
  tag: string;
};

export type TaskFormErrors = {
  title?: string;
  category?: string;
  date?: string;
  items?: string;
};

export function validateDate(date: string, today: string) {
  if (!isValidDate(date)) return "Pick a valid date.";
  if (date < today) return "Pick today or a day in the future.";
  return undefined;
}

export function validateCustomTask(
  v: { title: string; category: string; date: string },
  today: string
): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const title = v.title.trim();

  if (title.length < 2) errors.title = "Give the task a name (at least 2 characters).";
  else if (title.length > 100) errors.title = "Keep the name under 100 characters.";

  if (!CATEGORIES.includes(v.category as Category)) errors.category = "Pick a category.";

  const dateError = validateDate(v.date, today);
  if (dateError) errors.date = dateError;

  return errors;
}

// what you can pick from when planning:
// the current step of each goal, and every open milestone/task of active projects
export function buildCandidates(
  goals: GoalView[],
  projects: ProjectView[]
): PlanCandidate[] {
  const out: PlanCandidate[] = [];

  for (const goal of goals) {
    const step = goal.steps.find((s) => s.status === "current");
    if (!step) continue;

    if (step.substeps.length > 0) {
      for (const sub of step.substeps) {
        if (sub.completed) continue;
        out.push({
          key: `goal_substep:${sub.id}`,
          kind: "goal_substep",
          id: sub.id,
          title: sub.title,
          source: `${goal.title} · ${step.title}`,
          tag: goal.category,
        });
      }
    } else {
      out.push({
        key: `goal_step:${step.id}`,
        kind: "goal_step",
        id: step.id,
        title: step.title,
        source: goal.title,
        tag: goal.category,
      });
    }
  }

  for (const project of projects) {
    if (project.state === "completed") continue;

    for (const m of project.milestones) {
      if (m.status === "done") continue;

      if (m.tasks.length > 0) {
        for (const t of m.tasks) {
          if (t.completed) continue;
          out.push({
            key: `project_task:${t.id}`,
            kind: "project_task",
            id: t.id,
            title: t.title,
            source: `${project.title} · ${m.title}`,
            tag: "Project",
          });
        }
      } else {
        out.push({
          key: `project_milestone:${m.id}`,
          kind: "project_milestone",
          id: m.id,
          title: m.title,
          source: project.title,
          tag: "Project",
        });
      }
    }
  }

  return out;
}

// where an unfinished task goes when you press "move"
export function moveTarget(date: string, today: string) {
  return date < today ? today : addDays(date, 1);
}