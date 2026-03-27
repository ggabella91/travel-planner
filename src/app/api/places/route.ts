import { db } from "@/lib/db";
import { places } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(places).orderBy(desc(places.createdAt));
  return Response.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { name, city, state, country, category, notes, source, url } = body;

  if (!name || !city || !country) {
    return Response.json(
      { error: "name, city, and country are required" },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();

  const [place] = await db
    .insert(places)
    .values({ id, name, city, state: state || null, country, category, notes, source, url })
    .returning();

  return Response.json(place, { status: 201 });
}
