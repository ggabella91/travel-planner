import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(trips).orderBy(desc(trips.createdAt));
  return Response.json(rows);
}

export async function POST(request: Request) {
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
