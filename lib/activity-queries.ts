import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  goals,
  goalSteps,
  goalSubsteps,
  planItems,
  projectMilestones,
  projects,
  projectTasks,
} from "@/db/schema";
import { summarizeActivity } from "./activity";
import { dayFormatter, getTimezone } from "./timezone";

export async function getActivitySummary(userId: number) {
  const dayOf = dayFormatter(await getTimezone());

  const [steps, subs, milestones, tasks, custom] = await Promise.all([
    db
      .select({ at: goalSteps.completedAt })
      .from(goalSteps)
      .innerJoin(goals, eq(goals.id, goalSteps.goalId))
      .where(and(eq(goals.userId, userId), isNotNull(goalSteps.completedAt))),
    db
      .select({ at: goalSubsteps.completedAt })
      .from(goalSubsteps)
      .innerJoin(goalSteps, eq(goalSteps.id, goalSubsteps.stepId))
      .innerJoin(goals, eq(goals.id, goalSteps.goalId))
      .where(and(eq(goals.userId, userId), isNotNull(goalSubsteps.completedAt))),
    db
      .select({ at: projectMilestones.completedAt })
      .from(projectMilestones)
      .innerJoin(projects, eq(projects.id, projectMilestones.projectId))
      .where(and(eq(projects.userId, userId), isNotNull(projectMilestones.completedAt))),
    db
      .select({ at: projectTasks.completedAt })
      .from(projectTasks)
      .innerJoin(projectMilestones, eq(projectMilestones.id, projectTasks.milestoneId))
      .innerJoin(projects, eq(projects.id, projectMilestones.projectId))
      .where(and(eq(projects.userId, userId), isNotNull(projectTasks.completedAt))),
    // custom planner tasks only; linked ones are already counted above
    db
      .select({ at: planItems.completedAt })
      .from(planItems)
      .where(
        and(
          eq(planItems.userId, userId),
          isNotNull(planItems.completedAt),
          isNull(planItems.goalStepId),
          isNull(planItems.goalSubstepId),
          isNull(planItems.projectMilestoneId),
          isNull(planItems.projectTaskId)
        )
      ),
  ]);

  const counts = new Map<string, number>();
  for (const row of [...steps, ...subs, ...milestones, ...tasks, ...custom]) {
    if (!row.at) continue;
    const day = dayOf(row.at);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return summarizeActivity(counts, dayOf(new Date()));
}