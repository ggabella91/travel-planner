import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const email = session.user.email;
  const { currentPassword, newPassword } = await req.json();

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));

  // If a password is already set, require the current password before changing it
  if (user?.passwordHash) {
    if (!currentPassword) {
      return Response.json({ error: "Current password is required" }, { status: 400 });
    }
    const valid = await compare(currentPassword, user.passwordHash);
    if (!valid) {
      return Response.json({ error: "Current password is incorrect" }, { status: 400 });
    }
  }

  const passwordHash = await hash(newPassword, 12);

  if (user) {
    await db.update(users).set({ passwordHash }).where(eq(users.email, email));
  } else {
    // Google-only user setting a password for the first time
    await db.insert(users).values({ email, name: session.user.name ?? null, passwordHash });
  }

  return Response.json({ ok: true });
}
