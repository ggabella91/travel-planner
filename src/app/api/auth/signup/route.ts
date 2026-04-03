import { db } from "@/lib/db";
import { users, places } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const [existing] = await db.select({ email: users.email }).from(users).where(eq(users.email, email));
  if (existing) {
    return Response.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  // Block credentials sign-up for emails that already have Google-authenticated data.
  // These users must sign in with Google; account linking is not yet supported.
  const [googleData] = await db.select({ id: places.id }).from(places).where(eq(places.userId, email)).limit(1);
  if (googleData) {
    return Response.json(
      { error: "This email is linked to a Google account. Please sign in with Google instead." },
      { status: 409 },
    );
  }

  const passwordHash = await hash(password, 12);
  await db.insert(users).values({ email, name: name || null, passwordHash });

  return Response.json({ ok: true }, { status: 201 });
}
