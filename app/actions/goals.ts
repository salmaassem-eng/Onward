"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { CATEGORIES, type Category } from "@/lib/goals";
import { requireUser } from "@/lib/session";

export type GoalInput = {
  title: string;
  category: string;
  nextStep: string;
  targetDate: string;
};

export type GoalResult =
  | { ok: true }
  | { ok: false; errors: { title?: string; category?: string } };

function refresh() {
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function createGoal(input: GoalInput): Promise<GoalResult> {
  const user = await requireUser();

  const title = input.title.trim();
  const errors: { title?: string; category?: string } = {};

  if (title.length < 2) {
    errors.title = "Give your goal a title (at least 2 characters).";
  } else if (title.length > 100) {
    errors.title = "Keep the title under 100 characters.";
  }
  if (!CATEGORIES.includes(input.category as Category)) {
    errors.category = "Pick a category.";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  await db.insert(goals).values({
    userId: user.id,
    title,
    category: input.category as Category,
    nextStep: input.nextStep.trim() || null,
    targetDate: input.targetDate || null,
  });

  refresh();
  return { ok: true };
}

export async function updateGoalProgress(id: number, progress: number) {
  const user = await requireUser();
  const value = Math.min(100, Math.max(0, Math.round(progress)));

  await db
    .update(goals)
    .set({ progress: value })
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)));

  refresh();
}

export async function deleteGoal(id: number) {
  const user = await requireUser();

  await db
    .delete(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)));

  refresh();
}