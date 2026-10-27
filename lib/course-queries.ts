import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { toCourseView } from "./learning";

export async function getUserCourses(userId: number) {
  const rows = await db.query.courses.findMany({
    where: eq(courses.userId, userId),
    with: {
      goal: { columns: { id: true, title: true } },
      modules: {
        orderBy: (m, { asc }) => [asc(m.position)],
        with: { lessons: { orderBy: (l, { asc }) => [asc(l.position)] } },
      },
    },
    orderBy: (c, { desc }) => [desc(c.id)],
  });
  const now = new Date();
  return rows.map((r) => toCourseView(r, now));
}

// raw row for the edit form
export async function getUserCourseForEdit(userId: number, courseId: number) {
  return db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.userId, userId)),
    with: {
      modules: {
        orderBy: (m, { asc }) => [asc(m.position)],
        with: { lessons: { orderBy: (l, { asc }) => [asc(l.position)] } },
      },
    },
  });
}