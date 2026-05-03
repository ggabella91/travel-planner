import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, session.user.email)));

  if (!trip) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(trip);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const { name, cities, startDate, endDate, status, notes } = body;

  const VALID_STATUSES = ["planning", "active", "done"];
  if (!name || !cities) {
    return Response.json({ error: "name and cities are required" }, { status: 400 });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return Response.json({ error: "invalid status" }, { status: 400 });
  }
  let citiesJson: string;
  try {
    const parsed = JSON.parse(cities);
    if (!Array.isArray(parsed)) throw new Error();
    citiesJson = JSON.stringify(parsed);
  } catch {
    return Response.json({ error: "cities must be a valid JSON array" }, { status: 400 });
  }

  const [trip] = await db
    .update(trips)
    .set({
      name,
      cities: citiesJson,
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

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const [deleted] = await db
    .delete(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, session.user.email)))
    .returning();

  if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });

  return new Response(null, { status: 204 });
}
