import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAppUrl } from "@/lib/app-url";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const COOKIE = "g_oauth";

type Profile = { sub: string; email: string; name: string };

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

async function fetchProfile(
  code: string,
  verifier: string,
  redirectUri: string
): Promise<Profile | "unverified" | null> {
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!tokenRes.ok) return null;

    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) return null;

    const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!infoRes.ok) return null;

    const info = (await infoRes.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
    };
    if (!info.sub || !info.email) return null;
    if (info.email_verified !== true) return "unverified";

    const email = info.email.trim().toLowerCase();
    const rawName = (info.name ?? "").trim().slice(0, 60);
    return {
      sub: info.sub,
      email,
      name: rawName.length >= 2 ? rawName : email.split("@")[0].slice(0, 60),
    };
  } catch {
    return null;
  }
}

async function findOrCreateUser(profile: Profile): Promise<number | "exists" | null> {
  const [byGoogle] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.googleId, profile.sub))
    .limit(1);
  if (byGoogle) return byGoogle.id;

  // a password account already uses this email: never link it automatically
  const [byEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, profile.email))
    .limit(1);
  if (byEmail) return "exists";

  try {
    const [created] = await db
      .insert(users)
      .values({ name: profile.name, email: profile.email, googleId: profile.sub })
      .returning({ id: users.id });
    return created.id;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;

  const store = await cookies();
  const saved = store.get(COOKIE)?.value ?? "";
  store.delete({ name: COOKIE, path: "/api/auth/google" }); // one use only

  const error = params.get("error");
  if (error) {
    redirect(error === "access_denied" ? "/login?error=google_cancelled" : "/login?error=google_failed");
  }

  const base = getAppUrl();
  const code = params.get("code");
  const state = params.get("state");
  const [savedState, verifier] = saved.split(".");

  if (!base || !code || !state || !savedState || !verifier || !same(state, savedState)) {
    redirect("/login?error=google_failed");
  }

  const ip = await getClientIp();
  if (!(await rateLimit(`google:${ip}`, 20, 15 * 60 * 1000))) {
    redirect("/login?error=too_many");
  }

  const profile = await fetchProfile(code, verifier, `${base}/api/auth/google/callback`);
  if (profile === "unverified") redirect("/login?error=google_unverified");
  if (!profile) redirect("/login?error=google_failed");

  const userId = await findOrCreateUser(profile);
  if (userId === "exists") redirect("/login?error=email_exists");
  if (userId === null) redirect("/login?error=google_failed");

  await createSession(userId);
  redirect("/dashboard");
}