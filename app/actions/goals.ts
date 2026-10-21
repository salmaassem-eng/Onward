"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { goals, goalSteps } from "@/db/schema";
import {
  cleanSteps,
  validateGoal,
  type Category,
  type GoalFormErrors,
  type GoalFormValues,
} from "@/lib/goals";
import { requireUser } from "@/lib/session";

export type GoalResult =
  | { ok: true }
  | { ok: false; errors?: GoalFormErrors; message?: string };

function refresh() {
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function createGoal(values: GoalFormValues): Promise<GoalResult> {
  const user = await requireUser();

  const errors = validateGoal(values);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const [goal] = await db
    .insert(goals)
    .values({
      userId: user.id,
      title: values.title.trim(),
      category: values.category as Category,
      description: values.description.trim() || null,
      targetDate: values.targetDate || null,
    })
    .returning({ id: goals.id });

  await db.insert(goalSteps).values(
    cleanSteps(values.steps).map((s, i) => ({
      goalId: goal.id,
      title: s.title,
      position: i,
    }))
  );

  refresh();
  return { ok: true };
}

export async function updateGoal(
  id: number,
  values: GoalFormValues
): Promise<GoalResult> {
  const user = await requireUser();

  const errors = validateGoal(values);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // the goal must belong to this user
  const [goal] = await db
    .select({ id: goals.id })
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)))
    .limit(1);
  if (!goal) return { ok: false, message: "Goal not found." };

  await db
    .update(goals)
    .set({
      title: values.title.trim(),
      category: values.category as Category,
      description: values.description.trim() || null,
      targetDate: values.targetDate || null,
    })
    .where(eq(goals.id, id));

  const steps = cleanSteps(values.steps);
  const existing = await db
    .select({ id: goalSteps.id })
    .from(goalSteps)
    .where(eq(goalSteps.goalId, id));

  const existingIds = new Set(existing.map((e) => e.id));
  const keptIds = new Set(steps.flatMap((s) => (s.id ? [s.id] : [])));

  // 1. remove the steps that were deleted in the form
  const toDelete = existing.filter((e) => !keptIds.has(e.id)).map((e) => e.id);
  if (toDelete.length > 0) {
    await db.delete(goalSteps).where(inArray(goalSteps.id, toDelete));
  }

  // 2. update the ones that stay (title + new order), keep their completed flag
  const toInsert: { goalId: number; title: string; position: number }[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.id && existingIds.has(step.id)) {
      await db
        .update(goalSteps)
        .set({ title: step.title, position: i })
        .where(and(eq(goalSteps.id, step.id), eq(goalSteps.goalId, id)));
    } else {
      toInsert.push({ goalId: id, title: step.title, position: i });
    }
  }

  // 3. insert the new ones
  if (toInsert.length > 0) {
    await db.insert(goalSteps).values(toInsert);
  }

  refresh();
  return { ok: true };
}

export async function deleteGoal(id: number) {
  const user = await requireUser();

  await db
    .delete(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)));

  refresh();
}