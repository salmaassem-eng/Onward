"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { goals, goalSteps, goalSubsteps } from "@/db/schema";
import { requireUser } from "@/lib/session";

function refresh() {
  revalidatePath("/journey");
  revalidatePath("/week");
  revalidatePath("/dashboard");
}

export async function setItemCompleted(
  kind: "step" | "substep",
  id: number,
  completed: boolean
) {
  const user = await requireUser();

  if (
    (kind !== "step" && kind !== "substep") ||
    !Number.isInteger(id) ||
    typeof completed !== "boolean"
  ) {
    throw new Error("Invalid request");
  }

  const completedAt = completed ? new Date() : null;

  if (kind === "step") {
    const [row] = await db
      .select({ id: goalSteps.id })
      .from(goalSteps)
      .innerJoin(goals, eq(goals.id, goalSteps.goalId))
      .where(and(eq(goalSteps.id, id), eq(goals.userId, user.id)))
      .limit(1);
    if (!row) throw new Error("Not found");

    await db
      .update(goalSteps)
      .set({ completed, completedAt })
      .where(eq(goalSteps.id, id));
  } else {
    const [row] = await db
      .select({ id: goalSubsteps.id })
      .from(goalSubsteps)
      .innerJoin(goalSteps, eq(goalSteps.id, goalSubsteps.stepId))
      .innerJoin(goals, eq(goals.id, goalSteps.goalId))
      .where(and(eq(goalSubsteps.id, id), eq(goals.userId, user.id)))
      .limit(1);
    if (!row) throw new Error("Not found");

    await db
      .update(goalSubsteps)
      .set({ completed, completedAt })
      .where(eq(goalSubsteps.id, id));
  }

  refresh();
}

// swap the positions of two steps (or two sub-steps) of the same parent
export async function swapOrder(
  kind: "step" | "substep",
  id: number,
  otherId: number
) {
  const user = await requireUser();

  if (
    (kind !== "step" && kind !== "substep") ||
    !Number.isInteger(id) ||
    !Number.isInteger(otherId) ||
    id === otherId
  ) {
    throw new Error("Invalid request");
  }

  if (kind === "step") {
    const rows = await db
      .select({
        id: goalSteps.id,
        parent: goalSteps.goalId,
        position: goalSteps.position,
      })
      .from(goalSteps)
      .innerJoin(goals, eq(goals.id, goalSteps.goalId))
      .where(
        and(inArray(goalSteps.id, [id, otherId]), eq(goals.userId, user.id))
      );

    const a = rows.find((r) => r.id === id);
    const b = rows.find((r) => r.id === otherId);
    if (!a || !b || a.parent !== b.parent) throw new Error("Not found");

    await Promise.all([
      db.update(goalSteps).set({ position: b.position }).where(eq(goalSteps.id, a.id)),
      db.update(goalSteps).set({ position: a.position }).where(eq(goalSteps.id, b.id)),
    ]);
  } else {
    const rows = await db
      .select({
        id: goalSubsteps.id,
        parent: goalSubsteps.stepId,
        position: goalSubsteps.position,
      })
      .from(goalSubsteps)
      .innerJoin(goalSteps, eq(goalSteps.id, goalSubsteps.stepId))
      .innerJoin(goals, eq(goals.id, goalSteps.goalId))
      .where(
        and(inArray(goalSubsteps.id, [id, otherId]), eq(goals.userId, user.id))
      );

    const a = rows.find((r) => r.id === id);
    const b = rows.find((r) => r.id === otherId);
    if (!a || !b || a.parent !== b.parent) throw new Error("Not found");

    await Promise.all([
      db.update(goalSubsteps).set({ position: b.position }).where(eq(goalSubsteps.id, a.id)),
      db.update(goalSubsteps).set({ position: a.position }).where(eq(goalSubsteps.id, b.id)),
    ]);
  }

  refresh();
}