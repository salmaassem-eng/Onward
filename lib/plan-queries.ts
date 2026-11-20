import { and, asc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { planItems, routineChecks, routines } from "@/db/schema";
import { addDays } from "./dates";
import type { PlanItemView } from "./plan";

export async function getPlanItems(
  userId: number,
  from: string,
  to: string
): Promise<PlanItemView[]> {
  const [rows, routineRows] = await Promise.all([
    db.query.planItems.findMany({
      where: and(
        eq(planItems.userId, userId),
        gte(planItems.date, from),
        lte(planItems.date, to)
      ),
      with: {
        goalStep: { with: { goal: { columns: { title: true, category: true } } } },
        goalSubstep: {
          with: {
            step: { with: { goal: { columns: { title: true, category: true } } } },
          },
        },
        projectMilestone: { with: { project: { columns: { title: true } } } },
        projectTask: {
          with: { milestone: { with: { project: { columns: { title: true } } } } },
        },
        courseLesson: {
          with: {
            module: { with: { course: { columns: { title: true, url: true } } } },
          },
        },
      },
      orderBy: (p, { asc }) => [asc(p.date), asc(p.id)],
    }),
    // routines that repeat on at least one day of this range
    db
      .select()
      .from(routines)
      .where(
        and(
          eq(routines.userId, userId),
          lte(routines.startDate, to),
          or(isNull(routines.endDate), gte(routines.endDate, from))
        )
      )
      .orderBy(asc(routines.id)),
  ]);

  const checks: { routineId: number; date: string }[] =
    routineRows.length === 0
      ? []
      : await db
          .select({ routineId: routineChecks.routineId, date: routineChecks.date })
          .from(routineChecks)
          .where(
            and(
              inArray(routineChecks.routineId, routineRows.map((r) => r.id)),
              gte(routineChecks.date, from),
              lte(routineChecks.date, to)
            )
          );
  const done = new Set(checks.map((c) => `${c.routineId}:${c.date}`));

  const days: string[] = [];
  for (let d = from; d <= to && days.length < 35; d = addDays(d, 1)) days.push(d);

  const routineViews: PlanItemView[] = routineRows.flatMap((r) =>
    days
      .filter((d) => d >= r.startDate && (!r.endDate || d <= r.endDate))
      .map(
        (d): PlanItemView => ({
          key: `r-${r.id}-${d}`,
          id: r.id,
          routineId: r.id,
          date: d,
          title: r.title,
          completed: done.has(`${r.id}:${d}`),
          tag: r.category,
          source: null,
          href: null,
          custom: false,
        })
      )
  );

  const planViews = rows.map((row): PlanItemView => {
    const base = {
      key: `p-${row.id}`,
      id: row.id,
      routineId: null as number | null,
      date: row.date,
      href: null as string | null,
      custom: false,
    };

    if (row.courseLesson) {
      const { module } = row.courseLesson;
      return {
        ...base,
        title: row.courseLesson.title,
        completed: row.courseLesson.completed,
        tag: "Learning",
        source: `${module.course.title} · ${module.title}`,
        href: row.courseLesson.url ?? module.course.url,
      };
    }
    if (row.goalSubstep) {
      const { step } = row.goalSubstep;
      return {
        ...base,
        title: row.goalSubstep.title,
        completed: row.goalSubstep.completed,
        tag: step.goal.category,
        source: `${step.goal.title} · ${step.title}`,
      };
    }
    if (row.goalStep) {
      return {
        ...base,
        title: row.goalStep.title,
        completed: row.goalStep.completed,
        tag: row.goalStep.goal.category,
        source: row.goalStep.goal.title,
      };
    }
    if (row.projectTask) {
      const { milestone } = row.projectTask;
      return {
        ...base,
        title: row.projectTask.title,
        completed: row.projectTask.completed,
        tag: "Project",
        source: `${milestone.project.title} · ${milestone.title}`,
      };
    }
    if (row.projectMilestone) {
      return {
        ...base,
        title: row.projectMilestone.title,
        completed: row.projectMilestone.completed,
        tag: "Project",
        source: row.projectMilestone.project.title,
      };
    }
    return {
      ...base,
      title: row.title ?? "Untitled task",
      completed: row.completed,
      tag: row.category ?? "Personal",
      source: null,
      custom: true,
    };
  });

  // by day, and pinned routines first inside each day
  return [...routineViews, ...planViews].sort((a, b) =>
    a.date === b.date
      ? Number(b.routineId !== null) - Number(a.routineId !== null)
      : a.date < b.date
      ? -1
      : 1
  );
}