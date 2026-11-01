import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";

export const dynamic = "force-dynamic";

const COOKIE = "g_oauth";

export async function GET() {
  const base = getAppUrl();
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!base || !clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    redirect("/login?error=google_not_configured");
  }

  // PKCE: Google only gives the code back to whoever knows the verifier
  const state = crypto.randomBytes(32).toString("base64url");
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${base}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  res.cookies.set(COOKIE, `${state}.${verifier}`, {
    httpOnly: true,
    sameSite: "lax", // lax, so it comes back with Google's redirect
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/google",
    maxAge: 600,
  });
  return res;
}