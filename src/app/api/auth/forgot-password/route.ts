import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import type { NextRequest } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body?.email;

  if (!email || typeof email !== "string") {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  // Always return 200 to prevent email enumeration
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user?.passwordHash) {
    // Google-only user or no account — silently do nothing
    return Response.json({ ok: true });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(passwordResetTokens).values({ token, email, expiresAt });

  const baseUrl = new URL(req.url).origin;
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: email,
      subject: "Reset your Travel Planner password",
      text: [
        "You requested a password reset.",
        "",
        "Click the link below to reset your password (expires in 1 hour):",
        "",
        resetUrl,
        "",
        "If you didn't request this, you can safely ignore this email.",
      ].join("\n"),
    });
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    // Delete the token so it doesn't accumulate in the DB unused
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  return Response.json({ ok: true });
}
