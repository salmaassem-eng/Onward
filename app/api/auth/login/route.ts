import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { logDatabaseError } from "@/lib/db-errors";
import { users } from "@/db/schema";
import { validateLogin } from "@/lib/validation";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const errors = validateLogin({ email, password });

  if (Object.keys(errors).length > 0) {
    return Response.json(
      { error: "Please correct the highlighted fields.", fields: errors },
      { status: 400 },
    );
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1);

    if (!user || !(await compare(password, user.passwordHash))) {
      return Response.json(
        { error: "Email or password is incorrect." },
        { status: 401 },
      );
    }

    return Response.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    logDatabaseError("Account login failed:", error);
    return Response.json(
      { error: "Unable to sign in right now." },
      { status: 500 },
    );
  }
}
