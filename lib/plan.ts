import { addDays, isValidDate } from "./dates";
import { CATEGORIES, type Category, type GoalView } from "./goals";
import type { CourseView } from "./learning";
import type { ProjectView } from "./projects";

export const REF_KINDS = [
  "goal_step",
  "goal_substep",
  "project_milestone",
  "project_task",
  "course_lesson",
] as const;
export type RefKind = (typeof REF_KINDS)[number];

export type PlanItemView = {
  id: number;
  date: string;
  title: string;
  completed: boolean;
  tag: string; // a goal category, "Project" or "Learning"
  source: string | null;
  href: string | null; // opens a lesson
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

const LESSONS_PER_COURSE = 5;

export function buildCandidates(
  goals: GoalView[],
  projects: ProjectView[],
  courses: CourseView[]
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

  // the next few open lessons of every unfinished course
  for (const course of courses) {
    if (course.isComplete) continue;
    let added = 0;

    for (const m of course.modules) {
      if (m.status === "done") continue;
      for (const lesson of m.lessons) {
        if (lesson.completed) continue;
        out.push({
          key: `course_lesson:${lesson.id}`,
          kind: "course_lesson",
          id: lesson.id,
          title: lesson.title,
          source: `${course.title} · ${m.title}`,
          tag: "Learning",
        });
        if (++added >= LESSONS_PER_COURSE) break;
      }
      if (added >= LESSONS_PER_COURSE) break;
    }
  }

  return out;
}

// where an unfinished task goes when you press "move"
export function moveTarget(date: string, today: string) {
  return date < today ? today : addDays(date, 1);
}