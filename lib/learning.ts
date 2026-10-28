import { normalizeUrl } from "./projects";

export const COURSE_PROVIDERS = ["youtube", "udemy", "coursera", "other"] as const;
export type CourseProvider = (typeof COURSE_PROVIDERS)[number];

export const PROVIDER_LABELS: Record<CourseProvider, string> = {
  youtube: "YouTube",
  udemy: "Udemy",
  coursera: "Coursera",
  other: "Website",
};

export const MAX_MODULES = 30;
export const MAX_LESSONS_TOTAL = 300;
export const MAX_IMPORTED_LESSONS = 200;

/* ---------- links ---------- */

export function cleanUrlOrNull(value: string | null | undefined, httpsOnly = false) {
  const v = (value ?? "").trim();
  if (!v || v.length > 500) return null;
  try {
    const u = new URL(v);
    const ok = httpsOnly
      ? u.protocol === "https:"
      : u.protocol === "https:" || u.protocol === "http:";
    return ok ? u.toString() : null;
  } catch {
    return null;
  }
}

export function detectProvider(url: string): CourseProvider | null {
  try {
    const h = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (h === "youtu.be" || h === "youtube.com" || h.endsWith(".youtube.com")) return "youtube";
    if (h === "udemy.com" || h.endsWith(".udemy.com")) return "udemy";
    if (h === "coursera.org" || h.endsWith(".coursera.org")) return "coursera";
    return "other";
  } catch {
    return null;
  }
}

/* ---------- import result (shared by the server and the form) ---------- */

export type ImportedLesson = { title: string; url: string | null };
export type ImportedCourse = {
  url: string;
  provider: CourseProvider;
  title: string; // may be empty when nothing could be read
  thumbnailUrl: string | null;
  modules: { title: string; lessons: ImportedLesson[] }[];
};
export type ImportResult =
  | { ok: true; course: ImportedCourse; found: number; notice: string }
  | { ok: false; message: string };

/* ---------- form values + validation (client and server) ---------- */

export type LessonInput = { id?: number; title: string; url: string };
export type ModuleInput = { id?: number; title: string; lessons: LessonInput[] };

export type CourseFormValues = {
  title: string;
  url: string;
  thumbnailUrl: string;
  goalId: string; // "" = not connected
  modules: ModuleInput[];
};

export type CourseFormErrors = {
  title?: string;
  url?: string;
  goalId?: string;
  content?: string;
};

export function cleanModules(modules: ModuleInput[]): ModuleInput[] {
  return modules
    .map((m) => ({
      ...m,
      title: m.title.trim(),
      lessons: m.lessons
        .map((l) => ({ ...l, title: l.title.trim(), url: l.url ?? "" }))
        .filter((l) => l.title.length > 0),
    }))
    .filter((m) => m.title.length > 0);
}

// one lesson per line; numbers and bullets are removed
export function parseLessonList(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "").trim().slice(0, 100))
    .filter((line) => line.length > 0)
    .slice(0, MAX_LESSONS_TOTAL);
}

export function validateCourse(values: CourseFormValues): CourseFormErrors {
  const errors: CourseFormErrors = {};
  const title = values.title.trim();

  if (title.length < 2) errors.title = "Give the course a name (at least 2 characters).";
  else if (title.length > 100) errors.title = "Keep the name under 100 characters.";

  const url = normalizeUrl(values.url);
  if (url && !cleanUrlOrNull(url)) {
    errors.url = "Enter a valid link, like https://www.udemy.com/course/...";
  }

  if (values.goalId && !/^\d+$/.test(values.goalId)) errors.goalId = "Pick one of your goals.";

  const modules = cleanModules(values.modules);
  const orphan = values.modules.some(
    (m) => m.title.trim() === "" && m.lessons.some((l) => l.title.trim() !== "")
  );
  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const emptyModule = modules.find((m) => m.lessons.length === 0);

  if (orphan) {
    errors.content = "Give each module a title before adding lessons to it.";
  } else if (modules.length === 0) {
    errors.content = "Add at least one lesson.";
  } else if (emptyModule) {
    errors.content = `Add a lesson to "${emptyModule.title}", or remove that module.`;
  } else if (modules.length > MAX_MODULES) {
    errors.content = `A course can have up to ${MAX_MODULES} modules.`;
  } else if (lessonCount > MAX_LESSONS_TOTAL) {
    errors.content = `A course can have up to ${MAX_LESSONS_TOTAL} lessons.`;
  } else if (
    modules.some((m) => m.title.length > 100 || m.lessons.some((l) => l.title.length > 100))
  ) {
    errors.content = "Keep each module and lesson title under 100 characters.";
  }

  return errors;
}

/* ---------- view model used by the pages ---------- */

export function formatRelative(date: Date | null, now = new Date()) {
  if (!date) return "Not started";
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export type ModuleStatus = "done" | "current" | "upcoming";

export type LessonView = {
  id: number;
  title: string;
  url: string | null;
  completed: boolean;
};

export type CourseModuleView = {
  id: number;
  title: string;
  status: ModuleStatus;
  total: number;
  doneCount: number;
  progress: number;
  lessons: LessonView[];
};

export type NextLesson = {
  id: number;
  title: string;
  module: string;
  url: string | null; // the lesson's own link, or the course link
};

export type CourseView = {
  id: number;
  title: string;
  initial: string;
  provider: CourseProvider | null;
  providerLabel: string | null;
  url: string | null;
  thumbnailUrl: string | null;
  goalId: number | null;
  subtitle: string;
  progress: number;
  lessonsDone: number;
  lessonsTotal: number;
  modulesDone: number;
  modulesTotal: number;
  lastLabel: string;
  isComplete: boolean;
  next: NextLesson | null;
  modules: CourseModuleView[];
};

type CourseRow = {
  id: number;
  title: string;
  url: string | null;
  provider: CourseProvider | null;
  thumbnailUrl: string | null;
  lastOpenedAt: Date | null;
  goal: { id: number; title: string } | null;
  modules: {
    id: number;
    title: string;
    lessons: { id: number; title: string; url: string | null; completed: boolean }[];
  }[];
};

export function toCourseView(row: CourseRow, now = new Date()): CourseView {
  let currentFound = false;

  const modules: CourseModuleView[] = row.modules.map((m) => {
    const total = m.lessons.length;
    const doneCount = m.lessons.filter((l) => l.completed).length;
    let status: ModuleStatus = "upcoming";
    if (total > 0 && doneCount === total) status = "done";
    else if (total > 0 && !currentFound) {
      status = "current";
      currentFound = true;
    }
    return {
      id: m.id,
      title: m.title,
      status,
      total,
      doneCount,
      progress: total === 0 ? 0 : Math.round((doneCount / total) * 100),
      lessons: m.lessons.map(({ id, title, url, completed }) => ({ id, title, url, completed })),
    };
  });

  const lessonsTotal = modules.reduce((s, m) => s + m.total, 0);
  const lessonsDone = modules.reduce((s, m) => s + m.doneCount, 0);
  const current = modules.find((m) => m.status === "current");
  const lesson = current?.lessons.find((l) => !l.completed);
  const label = row.provider ? PROVIDER_LABELS[row.provider] : null;

  return {
    id: row.id,
    title: row.title,
    initial: row.title.trim()[0]?.toUpperCase() ?? "C",
    provider: row.provider,
    providerLabel: label,
    url: row.url,
    thumbnailUrl: row.thumbnailUrl,
    goalId: row.goal?.id ?? null,
    subtitle: row.goal?.title ?? label ?? "Added by hand",
    progress: lessonsTotal === 0 ? 0 : Math.round((lessonsDone / lessonsTotal) * 100),
    lessonsDone,
    lessonsTotal,
    modulesDone: modules.filter((m) => m.status === "done").length,
    modulesTotal: modules.length,
    lastLabel: formatRelative(row.lastOpenedAt, now),
    isComplete: lessonsTotal > 0 && lessonsDone === lessonsTotal,
    next:
      current && lesson
        ? {
            id: lesson.id,
            title: lesson.title,
            module: current.title,
            url: lesson.url ?? row.url,
          }
        : null,
    modules,
  };
}