import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const { name, cities, startDate, endDate, status, notes } = body;

  if (!name || !cities) {
    return Response.json({ error: "name and cities are required" }, { status: 400 });
  }

  const [trip] = await db
    .update(trips)
    .set({
      name,
      cities,
      startDate: startDate || null,
      endDate: endDate || null,
      status: status || "planning",
      notes: notes || null,
    })
    .where(and(eq(trips.id, id), eq(trips.userId, session.user.email)))
    .returning();

  if (!trip) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(trip);
}
