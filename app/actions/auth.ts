"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession } from "@/lib/session";
import {
  validateLogin,
  validateSignup,
  type LoginValues,
  type SignupValues,
} from "@/lib/validation";

export type AuthResult =
  | { ok: true }
  | {
      ok: false;
      errors?: { name?: string; email?: string; password?: string };
      message?: string;
    };

// compared against when the email doesn't exist, so response time doesn't leak which emails are registered
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export async function signup(values: SignupValues): Promise<AuthResult> {
  const errors = validateSignup(values);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const email = values.email.trim().toLowerCase();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { ok: false, errors: { email: "This email is already registered." } };
  }

  const passwordHash = await bcrypt.hash(values.password, 12);
  const [user] = await db
    .insert(users)
    .values({ name: values.name.trim(), email, passwordHash })
    .returning({ id: users.id });

  await createSession(user.id);
  return { ok: true };
}

export async function login(values: LoginValues): Promise<AuthResult> {
  const errors = validateLogin(values);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const email = values.email.trim().toLowerCase();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const valid = await bcrypt.compare(
    values.password,
    user?.passwordHash ?? DUMMY_HASH
  );

  if (!user || !valid) {
    return { ok: false, message: "Wrong email or password." };
  }

  await createSession(user.id);
  return { ok: true };
}

export async function logout() {
  await destroySession();
  redirect("/login");
}