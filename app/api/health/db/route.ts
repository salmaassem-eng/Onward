import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Database health check failed:", error);
    return Response.json(
      { status: "error", message: "Database unavailable." },
      { status: 503 },
    );
  }
}
