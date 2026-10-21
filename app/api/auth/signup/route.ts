import { hash } from "bcryptjs";
import { validateSignup } from "@/lib/validation";
import { db } from "@/lib/db";
import { isUniqueViolation, logDatabaseError } from "@/lib/db-errors";
import { users } from "@/db/schema";

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

  const name = typeof body.name === "string" ? body.name : "";
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const errors = validateSignup({ name, email, password });

  if (Object.keys(errors).length > 0) {
    return Response.json(
      { error: "Please correct the highlighted fields.", fields: errors },
      { status: 400 },
    );
  }

  try {
    const passwordHash = await hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    logDatabaseError("Account signup failed:", error);
    return Response.json(
      { error: "Unable to create your account right now." },
      { status: 500 },
    );
  }
}
