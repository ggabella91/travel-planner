import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(trips)
    .where(eq(trips.userId, session.user.email))
    .orderBy(desc(trips.createdAt));
  return Response.json(rows);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, city, startDate, endDate, notes } = body;

  if (!name || !city) {
    return Response.json({ error: "name and city are required" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const [trip] = await db
    .insert(trips)
    .values({
      id,
      userId: session.user.email,
      name,
      cities: JSON.stringify([city]),
      startDate: startDate || null,
      endDate: endDate || null,
      notes: notes || null,
      status: "planning",
    })
    .returning();

  return Response.json(trip, { status: 201 });
}
