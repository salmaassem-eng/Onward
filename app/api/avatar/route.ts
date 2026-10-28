import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userAvatars } from "@/db/schema";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return new Response(null, { status: 401 });

  const [row] = await db
    .select()
    .from(userAvatars)
    .where(eq(userAvatars.userId, user.id))
    .limit(1);
  if (!row) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(Buffer.from(row.data, "base64")), {
    headers: {
      "Content-Type": row.contentType,
      // the URL carries ?v=<version>, so every upload is a new URL and this can be cached for a year
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}