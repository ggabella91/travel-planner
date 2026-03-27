import { db } from "@/lib/db";
import { places } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/places/[id]">) {
  const { id } = await ctx.params;
  const body = await req.json();
  const { name, city, state, country, category, notes, source, url, status, rating } = body;

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
      updatedAt: new Date(),
    })
    .where(eq(places.id, id))
    .returning();

  if (!place) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(place);
}
