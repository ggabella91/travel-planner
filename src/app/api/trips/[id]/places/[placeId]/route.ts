import { db } from "@/lib/db";
import { trips, tripPlaces } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

async function verifyTripOwnership(tripId: string, email: string) {
  const [trip] = await db
    .select({ id: trips.id })
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, email)));
  return !!trip;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string; placeId: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId, placeId } = await ctx.params;
  const owned = await verifyTripOwnership(tripId, session.user.email);
  if (!owned) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const days: number[] = Array.isArray(body.days) ? body.days.map(Number) : [];

  const [row] = await db
    .update(tripPlaces)
    .set({ days: JSON.stringify(days) })
    .where(and(eq(tripPlaces.tripId, tripId), eq(tripPlaces.placeId, placeId)))
    .returning();

  return Response.json({
    ...row,
    days: row.days ? (JSON.parse(row.days) as number[]) : [],
  });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string; placeId: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId, placeId } = await ctx.params;
  const owned = await verifyTripOwnership(tripId, session.user.email);
  if (!owned) return Response.json({ error: "Not found" }, { status: 404 });

  await db
    .delete(tripPlaces)
    .where(and(eq(tripPlaces.tripId, tripId), eq(tripPlaces.placeId, placeId)));

  return new Response(null, { status: 204 });
}
