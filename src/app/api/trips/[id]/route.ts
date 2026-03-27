import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/trips/[id]">) {
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
    .where(eq(trips.id, id))
    .returning();

  if (!trip) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(trip);
}
