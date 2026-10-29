"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db";
import { passwordResetTokens, sessions, users } from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { RESET_MINUTES, consumeResetToken, createResetToken } from "@/lib/password-reset";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { validateNewPassword } from "@/lib/settings";

const HOUR = 60 * 60 * 1000;

export type RequestResult =
  | { ok: true }
  | { ok: false; error?: string; message?: string };

export type ResetResult =
  | { ok: true }
  | { ok: false; error?: string; message?: string; expired?: boolean };

// the address used inside the email link
function appUrl() {
  const url = process.env.APP_URL?.replace(/\/$/, "");
  if (url) return url;
  return process.env.NODE_ENV === "production" ? null : "http://localhost:3000";
}

export async function requestPasswordReset(rawEmail: string): Promise<RequestResult> {
  const email = String(rawEmail ?? "").trim().toLowerCase();

  if (!email) return { ok: false, error: "Please enter your email." };
  if (email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const ip = await getClientIp();
  const allowed =
    (await rateLimit(`forgot:ip:${ip}`, 10, HOUR)) &&
    (await rateLimit(`forgot:email:${email}`, 3, HOUR));
  if (!allowed) return { ok: false, message: "Too many requests. Try again later." };

  const base = appUrl();

  // everything below runs after the response is sent,
  // so the answer takes the same time whether the email exists or not
  after(async () => {
    try {
      const [user] = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!user) return;

      if (!base) {
        console.error("APP_URL is not set: reset email not sent.");
        return;
      }

      const token = await createResetToken(user.id);
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        link: `${base}/reset-password?token=${token}`,
        minutes: RESET_MINUTES,
      });
    } catch (e) {
      console.error("Password reset email failed:", e instanceof Error ? e.message : "unknown error");
    }
  });

  // the same answer for every email
  return { ok: true };
}

export async function resetPasswordWithToken(
  token: string,
  password: string
): Promise<ResetResult> {
  const error = validateNewPassword(String(password ?? ""));
  if (error) return { ok: false, error };

  const ip = await getClientIp();
  if (!(await rateLimit(`reset-token:ip:${ip}`, 10, 15 * 60 * 1000))) {
    return { ok: false, message: "Too many attempts. Try again in a few minutes." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const userId = await consumeResetToken(String(token ?? ""));
  if (!userId) {
    return {
      ok: false,
      expired: true,
      message: "This link is invalid or has expired. Request a new one.",
    };
  }

  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  // everyone logged in with the old password is signed out
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));

  return { ok: true };
}