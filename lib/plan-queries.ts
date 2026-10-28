import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { planItems } from "@/db/schema";
import type { PlanItemView } from "./plan";

export async function getPlanItems(
  userId: number,
  from: string,
  to: string
): Promise<PlanItemView[]> {
  const rows = await db.query.planItems.findMany({
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
  });

  return rows.map((row): PlanItemView => {
    const base = { id: row.id, date: row.date, href: null as string | null };

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
    };
  });
}