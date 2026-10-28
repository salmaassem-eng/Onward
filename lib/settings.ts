export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export const REMINDER_CONTENTS = ["today", "week", "both"] as const;
export type ReminderContent = (typeof REMINDER_CONTENTS)[number];

export const REMINDER_HOURS = [6, 7, 8, 9, 10, 12, 15, 18, 20, 21] as const;

export type Preferences = {
  theme: Theme;
  dailyReminder: boolean;
  reminderContent: ReminderContent;
  reminderHour: number;
  weeklyDigest: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "light",
  dailyReminder: false,
  reminderContent: "both",
  reminderHour: 8,
  weeklyDigest: false,
};

export function hourLabel(h: number) {
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${suffix}`;
}

export function validateName(value: string) {
  const n = value.trim();
  if (n.length < 2) return "Name must be at least 2 characters.";
  if (n.length > 60) return "Keep your name under 60 characters.";
  return undefined;
}

export function validateNewPassword(pw: string) {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (new TextEncoder().encode(pw).length > 72) return "Password must be under 72 characters.";
  return undefined;
}

// only known keys with valid values get through
export function sanitizePreferences(input: unknown): Partial<Preferences> | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const out: Partial<Preferences> = {};

  if ("theme" in o) {
    if (!THEMES.includes(o.theme as Theme)) return null;
    out.theme = o.theme as Theme;
  }
  if ("dailyReminder" in o) {
    if (typeof o.dailyReminder !== "boolean") return null;
    out.dailyReminder = o.dailyReminder;
  }
  if ("reminderContent" in o) {
    if (!REMINDER_CONTENTS.includes(o.reminderContent as ReminderContent)) return null;
    out.reminderContent = o.reminderContent as ReminderContent;
  }
  if ("reminderHour" in o) {
    const hour = o.reminderHour;
    if (typeof hour !== "number" || !(REMINDER_HOURS as readonly number[]).includes(hour)) {
      return null;
    }
    out.reminderHour = hour;
  }
  if ("weeklyDigest" in o) {
    if (typeof o.weeklyDigest !== "boolean") return null;
    out.weeklyDigest = o.weeklyDigest;
  }

  return Object.keys(out).length > 0 ? out : null;
}