import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { goals, projects } from "@/db/schema";
import { toProjectView } from "./projects";

export async function getUserProjects(userId: number) {
  const rows = await db.query.projects.findMany({
    where: eq(projects.userId, userId),
    with: {
      goal: { columns: { id: true, title: true } },
      milestones: {
        orderBy: (m, { asc }) => [asc(m.position)],
        with: { tasks: { orderBy: (t, { asc }) => [asc(t.position)] } },
      },
    },
    orderBy: (p, { desc }) => [desc(p.id)],
  });
  return rows.map(toProjectView);
}

// raw row for the edit form
export async function getUserProjectForEdit(userId: number, projectId: number) {
  return db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    with: {
      goal: { columns: { id: true, title: true } },
      milestones: {
        orderBy: (m, { asc }) => [asc(m.position)],
        with: { tasks: { orderBy: (t, { asc }) => [asc(t.position)] } },
      },
    },
  });
}

// for the "connected goal" dropdown
export async function getGoalOptions(userId: number) {
  return db
    .select({ id: goals.id, title: goals.title })
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(asc(goals.title));
}