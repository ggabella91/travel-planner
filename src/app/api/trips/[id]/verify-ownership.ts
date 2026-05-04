import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function verifyTripOwnership(tripId: string, email: string) {
  const [trip] = await db
    .select({ id: trips.id })
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, email)));
  return !!trip;
}
