import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { goalSteps, goals } from "@/db/schema";
import { toGoalView } from "@/lib/goals";

export async function getGoalsForUser(userId: number) {
  const rows = await db.query.goals.findMany({
    where: eq(goals.userId, userId),
    orderBy: [desc(goals.id)],
    with: {
      steps: {
        orderBy: [asc(goalSteps.position)],
        with: {
          substeps: {
            orderBy: (substep, { asc }) => [asc(substep.position)],
          },
        },
      },
    },
  });

  return rows.map((goal) => toGoalView(goal));
}
