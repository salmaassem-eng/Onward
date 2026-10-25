"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { goals, goalSteps, goalSubsteps } from "@/db/schema";
import {
  cleanSteps,
  validateGoal,
  type Category,
  type GoalFormErrors,
  type GoalFormValues,
} from "@/lib/goals";
import { requireUser } from "@/lib/session";

export type GoalResult =
  | { ok: true; id?: number}
  | { ok: false; errors?: GoalFormErrors; message?: string };

function refresh() {
  revalidatePath("/journey");
  revalidatePath("/dashboard");
  revalidatePath("/week");
}

export async function createGoal(values: GoalFormValues): Promise<GoalResult> {
  const user = await requireUser();

  const errors = validateGoal(values);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const steps = cleanSteps(values.steps);

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

  const inserted = await db
    .insert(goalSteps)
    .values(steps.map((s, i) => ({ goalId: goal.id, title: s.title, position: i })))
    .returning({ id: goalSteps.id });
  // identity ids grow in insert order, so sorting restores the form order
  inserted.sort((a, b) => a.id - b.id);

  const subs = steps.flatMap((s, i) =>
    s.substeps.map((x, j) => ({
      stepId: inserted[i].id,
      title: x.title,
      position: j,
    }))
  );
  if (subs.length > 0) await db.insert(goalSubsteps).values(subs);

  refresh();
  return { ok: true, id: goal.id };
}

export async function updateGoal(
  id: number,
  values: GoalFormValues
): Promise<GoalResult> {
  const user = await requireUser();

  const errors = validateGoal(values);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

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

  /* ----- steps ----- */
  const existing = await db
    .select({ id: goalSteps.id })
    .from(goalSteps)
    .where(eq(goalSteps.goalId, id));
  const existingIds = new Set(existing.map((e) => e.id));

  // finalIds[i] = database id of the i-th step (0 = still to insert)
  const finalIds: number[] = steps.map((s) =>
    s.id && existingIds.has(s.id) ? s.id : 0
  );
  const keptIds = new Set(finalIds.filter(Boolean));

  const toDelete = existing.filter((e) => !keptIds.has(e.id)).map((e) => e.id);
  if (toDelete.length > 0) {
    // sub-steps of deleted steps are removed by the cascade
    await db.delete(goalSteps).where(inArray(goalSteps.id, toDelete));
  }

  const stepUpdates: PromiseLike<unknown>[] = [];
  steps.forEach((s, i) => {
    if (finalIds[i]) {
      stepUpdates.push(
        db
          .update(goalSteps)
          .set({ title: s.title, position: i })
          .where(and(eq(goalSteps.id, finalIds[i]), eq(goalSteps.goalId, id)))
      );
    }
  });
  await Promise.all(stepUpdates);

  const newIndexes = finalIds.flatMap((v, i) => (v === 0 ? [i] : []));
  if (newIndexes.length > 0) {
    const inserted = await db
      .insert(goalSteps)
      .values(
        newIndexes.map((i) => ({ goalId: id, title: steps[i].title, position: i }))
      )
      .returning({ id: goalSteps.id });
    inserted.sort((a, b) => a.id - b.id);
    newIndexes.forEach((stepIndex, k) => {
      finalIds[stepIndex] = inserted[k].id;
    });
  }

  /* ----- sub-steps ----- */
  const existingSubs = await db
    .select({ id: goalSubsteps.id, stepId: goalSubsteps.stepId })
    .from(goalSubsteps)
    .where(inArray(goalSubsteps.stepId, finalIds));
  const owner = new Map(existingSubs.map((s) => [s.id, s.stepId]));

  const keptSubs = new Set<number>();
  const subUpdates: PromiseLike<unknown>[] = [];
  const subInserts: { stepId: number; title: string; position: number }[] = [];

  steps.forEach((s, i) => {
    s.substeps.forEach((sub, j) => {
      if (sub.id && owner.get(sub.id) === finalIds[i]) {
        keptSubs.add(sub.id);
        subUpdates.push(
          db
            .update(goalSubsteps)
            .set({ title: sub.title, position: j })
            .where(eq(goalSubsteps.id, sub.id))
        );
      } else {
        subInserts.push({ stepId: finalIds[i], title: sub.title, position: j });
      }
    });
  });

  const subDelete = existingSubs.filter((s) => !keptSubs.has(s.id)).map((s) => s.id);
  if (subDelete.length > 0) {
    await db.delete(goalSubsteps).where(inArray(goalSubsteps.id, subDelete));
  }
  await Promise.all(subUpdates);
  if (subInserts.length > 0) await db.insert(goalSubsteps).values(subInserts);

  refresh();
  return { ok: true, id};
}

export async function deleteGoal(id: number) {
  const user = await requireUser();

  await db
    .delete(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)));

  refresh();
}