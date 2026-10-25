"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { goals, projectMilestones, projects, projectTasks } from "@/db/schema";
import {
  cleanMilestones,
  normalizeUrl,
  toProjectView,
  validateProject,
  type ProjectFormErrors,
  type ProjectFormValues,
  type ProjectStatus,
} from "@/lib/projects";
import { requireUser } from "@/lib/session";

export type ProjectResult =
  | { ok: true }
  | { ok: false; errors?: ProjectFormErrors; message?: string };

function refresh() {
  revalidatePath("/week");
  revalidatePath("/journey");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

// "" -> null (freelance), a goal id that belongs to the user -> the id,
// anything else -> undefined (invalid)
async function resolveGoalId(userId: number, raw: string) {
  if (!raw) return null;
  const id = Number(raw);
  if (!Number.isInteger(id)) return undefined;

  const [goal] = await db
    .select({ id: goals.id })
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .limit(1);
  return goal ? goal.id : undefined;
}

export async function createProject(
  values: ProjectFormValues
): Promise<ProjectResult> {
  const user = await requireUser();

  const errors = validateProject(values);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const goalId = await resolveGoalId(user.id, values.goalId);
  if (goalId === undefined) {
    return { ok: false, errors: { goalId: "Pick one of your goals." } };
  }

  const milestones = cleanMilestones(values.milestones);

  const [project] = await db
    .insert(projects)
    .values({
      userId: user.id,
      goalId,
      title: values.title.trim(),
      description: values.description.trim() || null,
      status: values.status as ProjectStatus,
      deadline: values.deadline || null,
      githubUrl: normalizeUrl(values.githubUrl) || null,
      // deployUrl is never saved on creation: a new project isn't finished
    })
    .returning({ id: projects.id });

  const inserted = await db
    .insert(projectMilestones)
    .values(
      milestones.map((m, i) => ({
        projectId: project.id,
        title: m.title,
        position: i,
      }))
    )
    .returning({ id: projectMilestones.id });
  inserted.sort((a, b) => a.id - b.id);

  const tasks = milestones.flatMap((m, i) =>
    m.tasks.map((t, j) => ({
      milestoneId: inserted[i].id,
      title: t.title,
      position: j,
    }))
  );
  if (tasks.length > 0) await db.insert(projectTasks).values(tasks);

  refresh();
  return { ok: true };
}

export async function updateProject(
  id: number,
  values: ProjectFormValues
): Promise<ProjectResult> {
  const user = await requireUser();

  const errors = validateProject(values);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .limit(1);
  if (!project) return { ok: false, message: "Project not found." };

  const goalId = await resolveGoalId(user.id, values.goalId);
  if (goalId === undefined) {
    return { ok: false, errors: { goalId: "Pick one of your goals." } };
  }

  await db
    .update(projects)
    .set({
      goalId,
      title: values.title.trim(),
      description: values.description.trim() || null,
      status: values.status as ProjectStatus,
      deadline: values.deadline || null,
      githubUrl: normalizeUrl(values.githubUrl) || null,
    })
    .where(eq(projects.id, id));

  const milestones = cleanMilestones(values.milestones);

  /* ----- milestones ----- */
  const existing = await db
    .select({ id: projectMilestones.id })
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, id));
  const existingIds = new Set(existing.map((e) => e.id));

  const finalIds: number[] = milestones.map((m) =>
    m.id && existingIds.has(m.id) ? m.id : 0
  );
  const keptIds = new Set(finalIds.filter(Boolean));

  const toDelete = existing.filter((e) => !keptIds.has(e.id)).map((e) => e.id);
  if (toDelete.length > 0) {
    // their tasks go with them (cascade)
    await db
      .delete(projectMilestones)
      .where(inArray(projectMilestones.id, toDelete));
  }

  const milestoneUpdates: PromiseLike<unknown>[] = [];
  milestones.forEach((m, i) => {
    if (finalIds[i]) {
      milestoneUpdates.push(
        db
          .update(projectMilestones)
          .set({ title: m.title, position: i })
          .where(
            and(
              eq(projectMilestones.id, finalIds[i]),
              eq(projectMilestones.projectId, id)
            )
          )
      );
    }
  });
  await Promise.all(milestoneUpdates);

  const newIndexes = finalIds.flatMap((v, i) => (v === 0 ? [i] : []));
  if (newIndexes.length > 0) {
    const inserted = await db
      .insert(projectMilestones)
      .values(
        newIndexes.map((i) => ({
          projectId: id,
          title: milestones[i].title,
          position: i,
        }))
      )
      .returning({ id: projectMilestones.id });
    inserted.sort((a, b) => a.id - b.id);
    newIndexes.forEach((milestoneIndex, k) => {
      finalIds[milestoneIndex] = inserted[k].id;
    });
  }

  /* ----- tasks ----- */
  const existingTasks = await db
    .select({ id: projectTasks.id, milestoneId: projectTasks.milestoneId })
    .from(projectTasks)
    .where(inArray(projectTasks.milestoneId, finalIds));
  const owner = new Map(existingTasks.map((t) => [t.id, t.milestoneId]));

  const keptTasks = new Set<number>();
  const taskUpdates: PromiseLike<unknown>[] = [];
  const taskInserts: { milestoneId: number; title: string; position: number }[] =
    [];

  milestones.forEach((m, i) => {
    m.tasks.forEach((task, j) => {
      if (task.id && owner.get(task.id) === finalIds[i]) {
        keptTasks.add(task.id);
        taskUpdates.push(
          db
            .update(projectTasks)
            .set({ title: task.title, position: j })
            .where(eq(projectTasks.id, task.id))
        );
      } else {
        taskInserts.push({
          milestoneId: finalIds[i],
          title: task.title,
          position: j,
        });
      }
    });
  });

  const taskDelete = existingTasks
    .filter((t) => !keptTasks.has(t.id))
    .map((t) => t.id);
  if (taskDelete.length > 0) {
    await db.delete(projectTasks).where(inArray(projectTasks.id, taskDelete));
  }
  await Promise.all(taskUpdates);
  if (taskInserts.length > 0) await db.insert(projectTasks).values(taskInserts);

  /* ----- live link: only saved when the project is really finished ----- */
  const fresh = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      goal: { columns: { id: true, title: true } },
      milestones: {
        orderBy: (m, { asc }) => [asc(m.position)],
        with: { tasks: { orderBy: (t, { asc }) => [asc(t.position)] } },
      },
    },
  });
  if (fresh && toProjectView(fresh).isFinished) {
    await db
      .update(projects)
      .set({ deployUrl: normalizeUrl(values.deployUrl) || null })
      .where(eq(projects.id, id));
  }

  refresh();
  return { ok: true };
}

export async function deleteProject(id: number) {
  const user = await requireUser();

  await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)));

  refresh();
}

// tick a milestone (one without tasks) or a task
export async function setProjectItemCompleted(
  kind: "milestone" | "task",
  id: number,
  completed: boolean
) {
  const user = await requireUser();

  if (
    (kind !== "milestone" && kind !== "task") ||
    !Number.isInteger(id) ||
    typeof completed !== "boolean"
  ) {
    throw new Error("Invalid request");
  }

  const completedAt = completed ? new Date() : null;

  if (kind === "milestone") {
    const [row] = await db
      .select({ id: projectMilestones.id })
      .from(projectMilestones)
      .innerJoin(projects, eq(projects.id, projectMilestones.projectId))
      .where(and(eq(projectMilestones.id, id), eq(projects.userId, user.id)))
      .limit(1);
    if (!row) throw new Error("Not found");

    await db
      .update(projectMilestones)
      .set({ completed, completedAt })
      .where(eq(projectMilestones.id, id));
  } else {
    const [row] = await db
      .select({ id: projectTasks.id })
      .from(projectTasks)
      .innerJoin(
        projectMilestones,
        eq(projectMilestones.id, projectTasks.milestoneId)
      )
      .innerJoin(projects, eq(projects.id, projectMilestones.projectId))
      .where(and(eq(projectTasks.id, id), eq(projects.userId, user.id)))
      .limit(1);
    if (!row) throw new Error("Not found");

    await db
      .update(projectTasks)
      .set({ completed, completedAt })
      .where(eq(projectTasks.id, id));
  }

  refresh();
}