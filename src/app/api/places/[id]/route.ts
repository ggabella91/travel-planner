import { db } from "@/lib/db";
import { places } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const { name, city, state, country, category, notes, source, url, status, rating, tags } = body;

  if (!name || !city || !country) {
    return Response.json({ error: "name, city, and country are required" }, { status: 400 });
  }

  const [place] = await db
    .update(places)
    .set({
      name,
      city,
      state: state || null,
      country,
      category: category || null,
      notes: notes || null,
      source: source || null,
      url: url || null,
      status: status || "backlog",
      rating: rating ? Number(rating) : null,
      ...(tags !== undefined && { tags: Array.isArray(tags) ? JSON.stringify(tags) : null }),
      updatedAt: new Date(),
    })
    .where(and(eq(places.id, id), eq(places.userId, session.user.email)))
    .returning();

  if (!place) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(place);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const [deleted] = await db
    .delete(places)
    .where(and(eq(places.id, id), eq(places.userId, session.user.email)))
    .returning();

  if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });

  return new Response(null, { status: 204 });
}
