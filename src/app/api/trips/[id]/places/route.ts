import { db } from "@/lib/db";
import { trips, places, tripPlaces } from "@/lib/db/schema";
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

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await ctx.params;
  const owned = await verifyTripOwnership(tripId, session.user.email);
  if (!owned) return Response.json({ error: "Not found" }, { status: 404 });

  const rows = await db
    .select({ place: places, tripPlace: tripPlaces })
    .from(tripPlaces)
    .innerJoin(places, eq(tripPlaces.placeId, places.id))
    .where(eq(tripPlaces.tripId, tripId))
    .orderBy(tripPlaces.day, tripPlaces.order);

  return Response.json(rows.map((r) => ({ ...r.place, tripPlace: r.tripPlace })));
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await ctx.params;
  const owned = await verifyTripOwnership(tripId, session.user.email);
  if (!owned) return Response.json({ error: "Not found" }, { status: 404 });

  const { placeId } = await req.json();
  if (!placeId) return Response.json({ error: "placeId is required" }, { status: 400 });

  // Verify the place belongs to this user
  const [place] = await db
    .select({ id: places.id })
    .from(places)
    .where(and(eq(places.id, placeId), eq(places.userId, session.user.email)));
  if (!place) return Response.json({ error: "Place not found" }, { status: 404 });

  // Avoid duplicates
  const [existing] = await db
    .select({ id: tripPlaces.id })
    .from(tripPlaces)
    .where(and(eq(tripPlaces.tripId, tripId), eq(tripPlaces.placeId, placeId)));
  if (existing) return Response.json({ error: "Already added" }, { status: 409 });

  const [row] = await db
    .insert(tripPlaces)
    .values({ id: crypto.randomUUID(), tripId, placeId })
    .returning();

  return Response.json(row, { status: 201 });
}
