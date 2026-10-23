import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { toGoalView } from "./goals";

export async function getUserGoals(userId: number) {
  const rows = await db.query.goals.findMany({
    where: eq(goals.userId, userId),
    with: {
      steps: {
        orderBy: (s, { asc }) => [asc(s.position)],
        with: { substeps: { orderBy: (s, { asc }) => [asc(s.position)] } },
      },
    },
    orderBy: (g, { desc }) => [desc(g.id)],
  });
  return rows.map(toGoalView);
}

// raw row (with dates and descriptions) for the edit form
export async function getUserGoalForEdit(userId: number, goalId: number) {
  return db.query.goals.findFirst({
    where: and(eq(goals.id, goalId), eq(goals.userId, userId)),
    with: {
      steps: {
        orderBy: (s, { asc }) => [asc(s.position)],
        with: { substeps: { orderBy: (s, { asc }) => [asc(s.position)] } },
      },
    },
  });
}