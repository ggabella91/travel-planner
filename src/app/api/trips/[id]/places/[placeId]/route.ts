import { db } from "@/lib/db";
import { tripPlaces } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { verifyTripOwnership } from "../../verify-ownership";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string; placeId: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId, placeId } = await ctx.params;
  const owned = await verifyTripOwnership(tripId, session.user.email);
  if (!owned) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updates: Partial<typeof tripPlaces.$inferInsert> = {};

  if (body.days !== undefined) {
    const rawDays: number[] = Array.isArray(body.days) ? body.days.map(Number) : [];
    if (rawDays.some((d) => !Number.isInteger(d) || d < 1))
      return Response.json({ error: "days must be positive integers" }, { status: 400 });
    updates.days = JSON.stringify(rawDays);
  }

  if (body.note !== undefined) {
    updates.note = body.note === "" || body.note === null ? null : String(body.note);
  }

  if (body.order !== undefined) {
    const orderNum = Number(body.order);
    if (!Number.isInteger(orderNum) || orderNum < 0)
      return Response.json({ error: "order must be a non-negative integer" }, { status: 400 });
    updates.order = orderNum;
  }

  if (Object.keys(updates).length === 0)
    return Response.json({ error: "no fields to update" }, { status: 400 });

  const [row] = await db
    .update(tripPlaces)
    .set(updates)
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
