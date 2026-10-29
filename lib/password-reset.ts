import "server-only";
import crypto from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens } from "@/db/schema";

export const RESET_MINUTES = 30;

// 32 random bytes become exactly 43 characters
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/;

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function createResetToken(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");

  // a new request cancels the old link
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  await db.insert(passwordResetTokens).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + RESET_MINUTES * 60_000),
  });

  return token;
}

// only looks, never uses the token (used when the page opens)
export async function isResetTokenValid(token: string) {
  if (!TOKEN_SHAPE.test(token)) return false;

  const [row] = await db
    .select({ id: passwordResetTokens.id })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);
  return Boolean(row);
}

// one atomic update, so the same link can never work twice
export async function consumeResetToken(token: string): Promise<number | null> {
  if (!TOKEN_SHAPE.test(token)) return null;

  const rows = await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .returning({ userId: passwordResetTokens.userId });

  return rows[0]?.userId ?? null;
}