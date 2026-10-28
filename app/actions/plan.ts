"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  courseLessons,
  courseModules,
  courses,
  goals,
  goalSteps,
  goalSubsteps,
  planItems,
  projectMilestones,
  projects,
  projectTasks,
} from "@/db/schema";
import type { Category } from "@/lib/goals";
import {
  REF_KINDS,
  validateCustomTask,
  validateDate,
  type RefKind,
  type TaskFormErrors,
} from "@/lib/plan";
import { requireUser } from "@/lib/session";
import { getToday } from "@/lib/timezone";

export type PlanResult =
  | { ok: true; added?: number }
  | { ok: false; errors?: TaskFormErrors; message?: string };

type Ref = { kind: RefKind; id: number };

function refresh() {
  revalidatePath("/week");
  revalidatePath("/dashboard");
}

const refColumns = (kind: RefKind, id: number) => ({
  goalStepId: kind === "goal_step" ? id : null,
  goalSubstepId: kind === "goal_substep" ? id : null,
  projectMilestoneId: kind === "project_milestone" ? id : null,
  projectTaskId: kind === "project_task" ? id : null,
  courseLessonId: kind === "course_lesson" ? id : null,
});

type RefRow = {
  goalStepId: number | null;
  goalSubstepId: number | null;
  projectMilestoneId: number | null;
  projectTaskId: number | null;
  courseLessonId: number | null;
};

function refKeyOf(row: RefRow) {
  if (row.goalStepId) return `goal_step:${row.goalStepId}`;
  if (row.goalSubstepId) return `goal_substep:${row.goalSubstepId}`;
  if (row.projectMilestoneId) return `project_milestone:${row.projectMilestoneId}`;
  if (row.projectTaskId) return `project_task:${row.projectTaskId}`;
  if (row.courseLessonId) return `course_lesson:${row.courseLessonId}`;
  return null;
}

// which of these ids belong to the logged-in user
async function ownedIds(userId: number, kind: RefKind, ids: number[]) {
  if (ids.length === 0) return [] as number[];
  let rows: { id: number }[] = [];

  if (kind === "goal_step") {
    rows = await db
      .select({ id: goalSteps.id })
      .from(goalSteps)
      .innerJoin(goals, eq(goals.id, goalSteps.goalId))
      .where(and(inArray(goalSteps.id, ids), eq(goals.userId, userId)));
  } else if (kind === "goal_substep") {
    rows = await db
      .select({ id: goalSubsteps.id })
      .from(goalSubsteps)
      .innerJoin(goalSteps, eq(goalSteps.id, goalSubsteps.stepId))
      .innerJoin(goals, eq(goals.id, goalSteps.goalId))
      .where(and(inArray(goalSubsteps.id, ids), eq(goals.userId, userId)));
  } else if (kind === "project_milestone") {
    rows = await db
      .select({ id: projectMilestones.id })
      .from(projectMilestones)
      .innerJoin(projects, eq(projects.id, projectMilestones.projectId))
      .where(and(inArray(projectMilestones.id, ids), eq(projects.userId, userId)));
  } else if (kind === "project_task") {
    rows = await db
      .select({ id: projectTasks.id })
      .from(projectTasks)
      .innerJoin(projectMilestones, eq(projectMilestones.id, projectTasks.milestoneId))
      .innerJoin(projects, eq(projects.id, projectMilestones.projectId))
      .where(and(inArray(projectTasks.id, ids), eq(projects.userId, userId)));
  } else {
    rows = await db
      .select({ id: courseLessons.id })
      .from(courseLessons)
      .innerJoin(courseModules, eq(courseModules.id, courseLessons.moduleId))
      .innerJoin(courses, eq(courses.id, courseModules.courseId))
      .where(and(inArray(courseLessons.id, ids), eq(courses.userId, userId)));
  }
  return rows.map((r) => r.id);
}

export async function addLinkedPlanItems(
  date: string,
  refs: Ref[]
): Promise<PlanResult> {
  const user = await requireUser();
  const today = await getToday();

  const dateError = validateDate(date, today);
  if (dateError) return { ok: false, errors: { date: dateError } };

  const clean = (Array.isArray(refs) ? refs : []).filter(
    (r) => REF_KINDS.includes(r?.kind) && Number.isInteger(r?.id)
  );
  if (clean.length === 0 || clean.length > 50) {
    return { ok: false, errors: { items: "Pick at least one item to add." } };
  }

  const owned = new Set<string>();
  for (const kind of REF_KINDS) {
    const ids = clean.filter((r) => r.kind === kind).map((r) => r.id);
    for (const id of await ownedIds(user.id, kind, ids)) owned.add(`${kind}:${id}`);
  }

  const existing = await db
    .select({
      goalStepId: planItems.goalStepId,
      goalSubstepId: planItems.goalSubstepId,
      projectMilestoneId: planItems.projectMilestoneId,
      projectTaskId: planItems.projectTaskId,
      courseLessonId: planItems.courseLessonId,
    })
    .from(planItems)
    .where(and(eq(planItems.userId, user.id), eq(planItems.date, date)));
  const taken = new Set(existing.map(refKeyOf));

  const toInsert = new Map<string, Ref>();
  for (const r of clean) {
    const key = `${r.kind}:${r.id}`;
    if (owned.has(key) && !taken.has(key)) toInsert.set(key, r);
  }

  if (owned.size === 0) {
    return { ok: false, message: "Those items no longer exist." };
  }
  if (toInsert.size > 0) {
    await db.insert(planItems).values(
      [...toInsert.values()].map((r) => ({
        userId: user.id,
        date,
        ...refColumns(r.kind, r.id),
      }))
    );
  }

  refresh();
  return { ok: true, added: toInsert.size };
}

export async function addCustomPlanItem(
  date: string,
  title: string,
  category: string
): Promise<PlanResult> {
  const user = await requireUser();
  const today = await getToday();

  const errors = validateCustomTask({ title, category, date }, today);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  await db.insert(planItems).values({
    userId: user.id,
    date,
    title: title.trim(),
    category: category as Category,
  });

  refresh();
  return { ok: true, added: 1 };
}

export async function togglePlanItem(id: number, completed: boolean) {
  const user = await requireUser();
  if (!Number.isInteger(id) || typeof completed !== "boolean") {
    throw new Error("Invalid request");
  }

  const item = await db.query.planItems.findFirst({
    where: and(eq(planItems.id, id), eq(planItems.userId, user.id)),
  });
  if (!item) throw new Error("Not found");

  const patch = { completed, completedAt: completed ? new Date() : null };

  // linked tasks update the real item, so progress moves everywhere
  if (item.goalSubstepId) {
    await db.update(goalSubsteps).set(patch).where(eq(goalSubsteps.id, item.goalSubstepId));
  } else if (item.goalStepId) {
    await db.update(goalSteps).set(patch).where(eq(goalSteps.id, item.goalStepId));
  } else if (item.projectTaskId) {
    await db.update(projectTasks).set(patch).where(eq(projectTasks.id, item.projectTaskId));
  } else if (item.projectMilestoneId) {
    await db
      .update(projectMilestones)
      .set(patch)
      .where(eq(projectMilestones.id, item.projectMilestoneId));
  } else if (item.courseLessonId) {
    await db.update(courseLessons).set(patch).where(eq(courseLessons.id, item.courseLessonId));

    if (completed) {
      const [row] = await db
        .select({ courseId: courseModules.courseId })
        .from(courseLessons)
        .innerJoin(courseModules, eq(courseModules.id, courseLessons.moduleId))
        .where(eq(courseLessons.id, item.courseLessonId))
        .limit(1);
      if (row) {
        await db
          .update(courses)
          .set({ lastOpenedAt: new Date() })
          .where(eq(courses.id, row.courseId));
      }
    }
  } else {
    await db.update(planItems).set(patch).where(eq(planItems.id, id));
  }

  refresh();
  revalidatePath("/journey");
  revalidatePath("/projects");
  revalidatePath("/learning");
}

export async function movePlanItem(id: number, date: string): Promise<PlanResult> {
  const user = await requireUser();
  const today = await getToday();

  const dateError = validateDate(date, today);
  if (dateError) return { ok: false, errors: { date: dateError } };

  const updated = await db
    .update(planItems)
    .set({ date })
    .where(and(eq(planItems.id, id), eq(planItems.userId, user.id)))
    .returning({ id: planItems.id });
  if (updated.length === 0) return { ok: false, message: "Task not found." };

  refresh();
  return { ok: true };
}

export async function removePlanItem(id: number) {
  const user = await requireUser();

  await db
    .delete(planItems)
    .where(and(eq(planItems.id, id), eq(planItems.userId, user.id)));

  refresh();
}