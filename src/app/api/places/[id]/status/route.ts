import { db } from "@/lib/db";
import { places } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const VALID_STATUSES = ["backlog", "visited", "skipped"];

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const [place] = await db
    .update(places)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(places.id, id), eq(places.userId, session.user.email)))
    .returning();

  if (!place) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(place);
}
