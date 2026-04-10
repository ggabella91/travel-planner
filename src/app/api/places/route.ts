import { db } from "@/lib/db";
import { places } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(places)
    .where(eq(places.userId, session.user.email))
    .orderBy(desc(places.createdAt));
  return Response.json(rows);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, city, state, country, category, notes, source, url, externalId, externalSource, tags } = body;

  if (!name || !city || !country) {
    return Response.json(
      { error: "name, city, and country are required" },
      { status: 400 }
    );
  }

  // Deduplication: check if this external place is already saved
  if (externalId) {
    const [existing] = await db
      .select({ id: places.id, name: places.name })
      .from(places)
      .where(and(eq(places.externalId, externalId), eq(places.userId, session.user.email)));
    if (existing) {
      return Response.json({ error: "already_saved", existing }, { status: 409 });
    }
  }

  const id = crypto.randomUUID();

  const [place] = await db
    .insert(places)
    .values({
      id,
      userId: session.user.email,
      name,
      city,
      state: state || null,
      country,
      category,
      notes,
      source,
      url,
      externalId: externalId || null,
      externalSource: externalSource || null,
      tags: Array.isArray(tags) && tags.length > 0 ? JSON.stringify(tags) : null,
    })
    .returning();

  return Response.json(place, { status: 201 });
}
