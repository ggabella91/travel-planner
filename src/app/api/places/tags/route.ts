import { db } from "@/lib/db";
import { places } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { parseTags } from "@/lib/tags";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({ tags: places.tags })
    .from(places)
    .where(eq(places.userId, session.user.email));

  const unique = [...new Set(rows.flatMap((r) => parseTags(r.tags)))].sort();
  return Response.json(unique);
}
