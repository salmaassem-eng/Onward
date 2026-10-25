"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { goals, goalSteps, goalSubsteps } from "@/db/schema";
import { requireUser } from "@/lib/session";

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

  revalidatePath("/journey");
  revalidatePath("/week");
  revalidatePath("/dashboard");
}