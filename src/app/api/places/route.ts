import { db } from "@/lib/db";
import { places } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
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
    .values({ id, userId: session.user.email, name, city, state: state || null, country, category, notes, source, url })
    .returning();

  return Response.json(place, { status: 201 });
}
