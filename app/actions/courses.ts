"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { courseLessons, courseModules, courses, goals } from "@/db/schema";
import { importFromUrl } from "@/lib/course-import";
import {
    cleanModules,
    cleanUrlOrNull,
    detectProvider,
    validateCourse,
    type CourseFormErrors,
    type CourseFormValues,
    type ImportResult,
} from "@/lib/learning";
import { normalizeUrl } from "@/lib/projects";
import { requireUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";

export type CourseResult =
    | { ok: true; id?: number }
    | { ok: false; errors?: CourseFormErrors; message?: string };

function refresh() {
    revalidatePath("/learning");
    revalidatePath("/dashboard");
    revalidatePath("/week");
}

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

export async function importCourse(rawUrl: string): Promise<ImportResult> {
    const user = await requireUser();
    if (!(await rateLimit(`import:${user.id}`, 20, 60 * 60 * 1000))) {
        return { ok: false, message: "Too many imports. Try again in a little while." };
    }

    const url = cleanUrlOrNull(normalizeUrl(String(rawUrl ?? "")));
    if (!url) {
        return { ok: false, message: "Paste a valid link, like https://www.udemy.com/course/..." };
    }

    try {
        return await importFromUrl(url);
    } catch {
        return { ok: false, message: "We couldn't read that link. Add the course by hand below." };
    }
}

export async function createCourse(values: CourseFormValues): Promise<CourseResult> {
    const user = await requireUser();

    const errors = validateCourse(values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };

    const goalId = await resolveGoalId(user.id, values.goalId);
    if (goalId === undefined) {
        return { ok: false, errors: { goalId: "Pick one of your goals." } };
    }

    const modules = cleanModules(values.modules);
    const url = cleanUrlOrNull(normalizeUrl(values.url));

    const [course] = await db
        .insert(courses)
        .values({
            userId: user.id,
            goalId,
            title: values.title.trim(),
            url,
            provider: url ? detectProvider(url) : null,
            thumbnailUrl: cleanUrlOrNull(values.thumbnailUrl, true),
        })
        .returning({ id: courses.id });

    const insertedModules = await db
        .insert(courseModules)
        .values(modules.map((m, i) => ({ courseId: course.id, title: m.title, position: i })))
        .returning({ id: courseModules.id });
    insertedModules.sort((a, b) => a.id - b.id);

    const lessons = modules.flatMap((m, i) =>
        m.lessons.map((l, j) => ({
            moduleId: insertedModules[i].id,
            title: l.title,
            url: cleanUrlOrNull(l.url),
            position: j,
        }))
    );
    await db.insert(courseLessons).values(lessons);

    refresh();
    return { ok: true, id: course.id };
}

export async function updateCourse(id: number, values: CourseFormValues): Promise<CourseResult> {
    const user = await requireUser();

    const errors = validateCourse(values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };

    const [course] = await db
        .select({ id: courses.id })
        .from(courses)
        .where(and(eq(courses.id, id), eq(courses.userId, user.id)))
        .limit(1);
    if (!course) return { ok: false, message: "Course not found." };

    const goalId = await resolveGoalId(user.id, values.goalId);
    if (goalId === undefined) {
        return { ok: false, errors: { goalId: "Pick one of your goals." } };
    }

    const url = cleanUrlOrNull(normalizeUrl(values.url));
    await db
        .update(courses)
        .set({
            goalId,
            title: values.title.trim(),
            url,
            provider: url ? detectProvider(url) : null,
            thumbnailUrl: cleanUrlOrNull(values.thumbnailUrl, true),
        })
        .where(eq(courses.id, id));

    const modules = cleanModules(values.modules);

    /* ----- modules ----- */
    const existingModules = await db
        .select({ id: courseModules.id, title: courseModules.title, position: courseModules.position })
        .from(courseModules)
        .where(eq(courseModules.courseId, id));
    const moduleById = new Map(existingModules.map((m) => [m.id, m]));

    const finalIds: number[] = modules.map((m) => (m.id && moduleById.has(m.id) ? m.id : 0));
    const keptModules = new Set(finalIds.filter(Boolean));

    const removeModules = existingModules.filter((m) => !keptModules.has(m.id)).map((m) => m.id);
    if (removeModules.length > 0) {
        // their lessons go with them (cascade)
        await db.delete(courseModules).where(inArray(courseModules.id, removeModules));
    }

    const moduleUpdates: PromiseLike<unknown>[] = [];
    modules.forEach((m, i) => {
        const old = moduleById.get(finalIds[i]);
        if (old && (old.title !== m.title || old.position !== i)) {
            moduleUpdates.push(
                db
                    .update(courseModules)
                    .set({ title: m.title, position: i })
                    .where(and(eq(courseModules.id, old.id), eq(courseModules.courseId, id)))
            );
        }
    });
    await Promise.all(moduleUpdates);

    const newIndexes = finalIds.flatMap((v, i) => (v === 0 ? [i] : []));
    if (newIndexes.length > 0) {
        const inserted = await db
            .insert(courseModules)
            .values(newIndexes.map((i) => ({ courseId: id, title: modules[i].title, position: i })))
            .returning({ id: courseModules.id });
        inserted.sort((a, b) => a.id - b.id);
        newIndexes.forEach((moduleIndex, k) => {
            finalIds[moduleIndex] = inserted[k].id;
        });
    }

    /* ----- lessons (only changed rows are written) ----- */
    const existingLessons = await db
        .select({
            id: courseLessons.id,
            moduleId: courseLessons.moduleId,
            title: courseLessons.title,
            position: courseLessons.position,
            url: courseLessons.url,
        })
        .from(courseLessons)
        .where(inArray(courseLessons.moduleId, finalIds));
    const lessonById = new Map(existingLessons.map((l) => [l.id, l]));

    const keptLessons = new Set<number>();
    const lessonUpdates: PromiseLike<unknown>[] = [];
    const lessonInserts: { moduleId: number; title: string; url: string | null; position: number }[] = [];

    modules.forEach((m, i) => {
        m.lessons.forEach((lesson, j) => {
            const old = lesson.id ? lessonById.get(lesson.id) : undefined;
            const lessonUrl = cleanUrlOrNull(lesson.url);

            if (old && old.moduleId === finalIds[i]) {
                keptLessons.add(old.id);
                if (old.title !== lesson.title || old.position !== j || old.url !== lessonUrl) {
                    lessonUpdates.push(
                        db
                            .update(courseLessons)
                            .set({ title: lesson.title, position: j, url: lessonUrl })
                            .where(eq(courseLessons.id, old.id))
                    );
                }
            } else {
                lessonInserts.push({ moduleId: finalIds[i], title: lesson.title, url: lessonUrl, position: j });
            }
        });
    });

    const removeLessons = existingLessons.filter((l) => !keptLessons.has(l.id)).map((l) => l.id);
    if (removeLessons.length > 0) {
        await db.delete(courseLessons).where(inArray(courseLessons.id, removeLessons));
    }
    await Promise.all(lessonUpdates);
    if (lessonInserts.length > 0) await db.insert(courseLessons).values(lessonInserts);

    refresh();
    return { ok: true, id };
}

export async function deleteCourse(id: number) {
    const user = await requireUser();
    if (!Number.isInteger(id)) throw new Error("Invalid request");

    await db.delete(courses).where(and(eq(courses.id, id), eq(courses.userId, user.id)));
    refresh();
}

export async function setLessonCompleted(id: number, completed: boolean) {
    const user = await requireUser();
    if (!Number.isInteger(id) || typeof completed !== "boolean") {
        throw new Error("Invalid request");
    }

    const [row] = await db
        .select({ id: courseLessons.id, courseId: courses.id })
        .from(courseLessons)
        .innerJoin(courseModules, eq(courseModules.id, courseLessons.moduleId))
        .innerJoin(courses, eq(courses.id, courseModules.courseId))
        .where(and(eq(courseLessons.id, id), eq(courses.userId, user.id)))
        .limit(1);
    if (!row) throw new Error("Not found");

    await db
        .update(courseLessons)
        .set({ completed, completedAt: completed ? new Date() : null })
        .where(eq(courseLessons.id, id));

    if (completed) {
        await db.update(courses).set({ lastOpenedAt: new Date() }).where(eq(courses.id, row.courseId));
    }

    refresh();
}

// called when you press Continue, so "Last: ..." stays true
export async function touchCourse(id: number) {
    const user = await requireUser();
    if (!Number.isInteger(id)) throw new Error("Invalid request");

    await db
        .update(courses)
        .set({ lastOpenedAt: new Date() })
        .where(and(eq(courses.id, id), eq(courses.userId, user.id)));

    revalidatePath("/learning");
}