import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { DEFAULT_PREFERENCES, type Preferences } from "./settings";

export const getUserSettings = cache(async (userId: number): Promise<Preferences> => {
  const [row] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  if (!row) return DEFAULT_PREFERENCES;

  return {
    theme: row.theme,
    dailyReminder: row.dailyReminder,
    reminderContent: row.reminderContent,
    reminderHour: row.reminderHour,
    weeklyDigest: row.weeklyDigest,
  };
});