import { db } from "@/lib/db";
import { trips, tripPlaces } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string; placeId: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId, placeId } = await ctx.params;

  // Verify trip ownership
  const [trip] = await db
    .select({ id: trips.id })
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, session.user.email)));
  if (!trip) return Response.json({ error: "Not found" }, { status: 404 });

  await db
    .delete(tripPlaces)
    .where(and(eq(tripPlaces.tripId, tripId), eq(tripPlaces.placeId, placeId)));

  return new Response(null, { status: 204 });
}
