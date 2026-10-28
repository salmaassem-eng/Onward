"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { userAvatars, userSettings, users } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import { destroyOtherSessions, destroySession, requireUser } from "@/lib/session";
import { isTheme, validateName, validateNewPassword } from "@/lib/settings";

export type SettingsResult =
  | { ok: true }
  | { ok: false; message?: string; errors?: Record<string, string> };

const MAX_AVATAR_BYTES = 150_000;
const HOUR = 60 * 60 * 1000;

const refreshAll = () => revalidatePath("/", "layout");

// never trust the file type the browser reports: read the real signature
function sniffImage(buf: Buffer): "image/webp" | "image/jpeg" | "image/png" | null {
  if (
    buf.length > 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length > 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  return null;
}

export async function updateProfile(name: string): Promise<SettingsResult> {
  const user = await requireUser();

  const error = validateName(String(name ?? ""));
  if (error) return { ok: false, errors: { name: error } };

  await db.update(users).set({ name: name.trim() }).where(eq(users.id, user.id));
  refreshAll();
  return { ok: true };
}

export async function uploadAvatar(formData: FormData): Promise<SettingsResult> {
  const user = await requireUser();

  if (!(await rateLimit(`avatar:${user.id}`, 20, HOUR))) {
    return { ok: false, message: "Too many uploads. Try again in a little while." };
  }

  const file = formData.get("avatar");
  if (!(file instanceof File)) return { ok: false, message: "Pick an image first." };
  if (file.size === 0 || file.size > MAX_AVATAR_BYTES) {
    return { ok: false, message: "That image is too large. Try a smaller one." };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const contentType = sniffImage(buf);
  if (!contentType) return { ok: false, message: "Use a JPG, PNG or WebP image." };

  const now = new Date();
  const data = buf.toString("base64");

  await db
    .insert(userAvatars)
    .values({ userId: user.id, data, contentType, updatedAt: now })
    .onConflictDoUpdate({
      target: userAvatars.userId,
      set: { data, contentType, updatedAt: now },
    });
  await db.update(users).set({ avatarUpdatedAt: now }).where(eq(users.id, user.id));

  refreshAll();
  return { ok: true };
}

export async function removeAvatar(): Promise<SettingsResult> {
  const user = await requireUser();

  await db.delete(userAvatars).where(eq(userAvatars.userId, user.id));
  await db.update(users).set({ avatarUpdatedAt: null }).where(eq(users.id, user.id));

  refreshAll();
  return { ok: true };
}

export async function updateTheme(theme: string): Promise<SettingsResult> {
  const user = await requireUser();
  if (!isTheme(theme)) return { ok: false, message: "Invalid theme." };

  await db
    .insert(userSettings)
    .values({ userId: user.id, theme })
    .onConflictDoUpdate({ target: userSettings.userId, set: { theme } });

  refreshAll();
  return { ok: true };
}

export async function changePassword(
  current: string,
  next: string
): Promise<SettingsResult> {
  const user = await requireUser();

  if (!(await rateLimit(`password:${user.id}`, 5, 15 * 60 * 1000))) {
    return { ok: false, message: "Too many attempts. Try again in a few minutes." };
  }

  const nextError = validateNewPassword(String(next ?? ""));
  if (nextError) return { ok: false, errors: { next: nextError } };

  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!row) return { ok: false, message: "Account not found." };

  const valid = await bcrypt.compare(String(current ?? ""), row.passwordHash);
  if (!valid) return { ok: false, errors: { current: "That password is wrong." } };
  if (current === next) {
    return { ok: false, errors: { next: "Choose a different password." } };
  }

  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(next, 12) })
    .where(eq(users.id, user.id));

  // anyone else logged in with the old password is signed out
  await destroyOtherSessions(user.id);
  return { ok: true };
}

export async function deleteAccount(password: string): Promise<SettingsResult> {
  const user = await requireUser();

  if (!(await rateLimit(`delete-account:${user.id}`, 5, 15 * 60 * 1000))) {
    return { ok: false, message: "Too many attempts. Try again in a few minutes." };
  }

  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!row) return { ok: false, message: "Account not found." };

  const valid = await bcrypt.compare(String(password ?? ""), row.passwordHash);
  if (!valid) return { ok: false, errors: { password: "That password is wrong." } };

  await destroySession();
  // goals, projects, courses, plan, sessions, avatar and settings all go with it (cascade)
  await db.delete(users).where(eq(users.id, user.id));

  refreshAll();
  return { ok: true };
}