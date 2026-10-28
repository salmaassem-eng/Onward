import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import type { Theme } from "./settings";

export const getUserSettings = cache(async (userId: number): Promise<{ theme: Theme }> => {
  const [row] = await db
    .select({ theme: userSettings.theme })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  return { theme: row?.theme ?? "light" };
});