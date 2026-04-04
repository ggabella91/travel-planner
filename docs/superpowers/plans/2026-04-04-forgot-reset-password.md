# Forgot / Reset Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete forgot-password / reset-password flow for credentials (email + password) users using Resend for email delivery.

**Architecture:** A `password_reset_tokens` table stores single-use, time-limited tokens. Two new API routes handle token generation + email send, and token validation + password update. Two new pages provide the UI, wired together with a "Forgot password?" link on the login credentials form.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM + postgres, Auth.js v5 (bcryptjs), Resend (npm package), shadcn/ui + Tailwind v4.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/lib/db/schema.ts` | Modify | Add `passwordResetTokens` table |
| `drizzle/` | Generate | New migration SQL via `npm run db:generate` |
| `src/app/api/auth/forgot-password/route.ts` | Create | Token generation + Resend email |
| `src/app/api/auth/reset-password/route.ts` | Create | Token validation + password update |
| `src/app/forgot-password/page.tsx` | Create | Email entry form |
| `src/app/reset-password/page.tsx` | Create | New password form |
| `src/app/login/credentials-form.tsx` | Modify | Add "Forgot password?" link |
| `src/middleware.ts` | Modify | Add new pages to public routes |

---

## Task 1: Install Resend and configure env vars

**Files:**
- Modify: `.env.local` (manual)
- No code changes in this task

- [ ] **Step 1: Install the resend package**

```bash
npm install resend
```

Expected output: `added 1 package` (or similar)

- [ ] **Step 2: Add env vars to `.env.local`**

Open `.env.local` and add these two lines (fill in your values):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM=noreply@yourdomain.com
```

`RESEND_API_KEY`: your Resend API key from resend.com/api-keys
`RESEND_FROM`: a verified sender address in your Resend account (must match a verified domain)

- [ ] **Step 3: Verify the package installed**

```bash
node -e "require('resend'); console.log('ok')"
```

Expected output: `ok`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install resend for password reset emails"
```

---

## Task 2: Add `password_reset_tokens` table to schema and migrate

**Files:**
- Modify: `src/lib/db/schema.ts`
- Generate: `drizzle/` (new migration files)

- [ ] **Step 1: Add the table to `src/lib/db/schema.ts`**

Add this block after the `tripPlaces` table definition and before the type exports:

```ts
export const passwordResetTokens = pgTable("password_reset_tokens", {
  token: text("token").primaryKey(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});
```

Also add this type export at the bottom of the file alongside the others:

```ts
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
```

- [ ] **Step 2: Generate the migration**

```bash
npm run db:generate
```

Expected: a new file created in `drizzle/` with SQL like:
```sql
CREATE TABLE "password_reset_tokens" (
  "token" text PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "used_at" timestamp
);
```

- [ ] **Step 3: Apply the migration**

```bash
npm run db:migrate
```

Expected: `[✓] Migrations applied` (or similar success output)

- [ ] **Step 4: Verify the table exists**

```bash
node --env-file=.env.local -e "
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql\`SELECT COUNT(*) FROM password_reset_tokens\`.then(r => { console.log('table ok, rows:', r[0].count); sql.end(); });
"
```

Expected: `table ok, rows: 0`

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/schema.ts drizzle/
git commit -m "feat: add password_reset_tokens table"
```

---

## Task 3: Create `POST /api/auth/forgot-password`

**Files:**
- Create: `src/app/api/auth/forgot-password/route.ts`

- [ ] **Step 1: Create the route file**

Create `src/app/api/auth/forgot-password/route.ts` with this content:

```ts
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

  return Response.json({ ok: true });
}
```

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

Wait for `Ready in` output before proceeding.

- [ ] **Step 3: Test with a non-existent email (should return 200 silently)**

```bash
curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@example.com"}' | cat
```

Expected: `{"ok":true}`

- [ ] **Step 4: Test with a missing email field (should return 400)**

```bash
curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{}' | cat
```

Expected: `{"error":"Email is required"}`

- [ ] **Step 5: Test with a real credentials-user email**

Replace `your@email.com` with an email that exists in the `users` table with a `passwordHash`:

```bash
curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}' | cat
```

Expected: `{"ok":true}` and a reset email arrives in your inbox.

Also verify a token row was inserted:

```bash
node --env-file=.env.local -e "
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql\`SELECT token, email, expires_at, used_at FROM password_reset_tokens ORDER BY expires_at DESC LIMIT 1\`
  .then(r => { console.log(r[0]); sql.end(); });
"
```

Expected: a row with `used_at: null` and `expires_at` ~1 hour from now.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/auth/forgot-password/route.ts
git commit -m "feat: add forgot-password api route"
```

---

## Task 4: Create `POST /api/auth/reset-password`

**Files:**
- Create: `src/app/api/auth/reset-password/route.ts`

- [ ] **Step 1: Create the route file**

Create `src/app/api/auth/reset-password/route.ts` with this content:

```ts
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq, and, isNull, gt } from "drizzle-orm";
import { hash } from "bcryptjs";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, password } = body ?? {};

  if (!token || typeof token !== "string") {
    return Response.json({ error: "Token is required" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const [record] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    );

  if (!record) {
    return Response.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const passwordHash = await hash(password, 12);

  await db.update(users).set({ passwordHash }).where(eq(users.email, record.email));
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.token, token));

  return Response.json({ ok: true });
}
```

- [ ] **Step 2: Test with a bogus token (should return 400)**

```bash
curl -s -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"not-a-real-token","password":"newpassword123"}' | cat
```

Expected: `{"error":"This reset link is invalid or has expired."}`

- [ ] **Step 3: Test with a short password (should return 400)**

```bash
curl -s -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"anything","password":"short"}' | cat
```

Expected: `{"error":"Password must be at least 8 characters"}`

- [ ] **Step 4: Test with a real token from the database**

Grab the token inserted in Task 3 Step 5:

```bash
node --env-file=.env.local -e "
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql\`SELECT token FROM password_reset_tokens WHERE used_at IS NULL ORDER BY expires_at DESC LIMIT 1\`
  .then(r => { console.log(r[0]?.token); sql.end(); });
"
```

Then use that token:

```bash
curl -s -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<token-from-above>","password":"newpassword123"}' | cat
```

Expected: `{"ok":true}`

Verify the token is now marked used and the password was updated:

```bash
node --env-file=.env.local -e "
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql\`SELECT used_at FROM password_reset_tokens ORDER BY expires_at DESC LIMIT 1\`
  .then(r => { console.log('used_at:', r[0]?.used_at); sql.end(); });
"
```

Expected: `used_at: <timestamp>` (not null)

- [ ] **Step 5: Test that the same token is rejected a second time**

Re-run the same curl from Step 4 with the same token.

Expected: `{"error":"This reset link is invalid or has expired."}`

- [ ] **Step 6: Commit**

```bash
git add src/app/api/auth/reset-password/route.ts
git commit -m "feat: add reset-password api route"
```

---

## Task 5: Update middleware to allow new public pages

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Update the `isPublic` and redirect logic**

Open `src/middleware.ts`. Replace the entire file content with:

```ts
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublic =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    return Response.redirect(loginUrl);
  }

  // Only redirect logged-in users away from login/signup — not from password reset pages
  const redirectAwayIfLoggedIn = pathname === "/login" || pathname === "/signup";
  if (isLoggedIn && redirectAwayIfLoggedIn) {
    const homeUrl = new URL("/", req.url);
    return Response.redirect(homeUrl);
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|icons|manifest.json|apple-touch-icon.png).*)"],
};
```

- [ ] **Step 2: Verify unauthenticated access works**

Without being logged in, visit `http://localhost:3000/forgot-password` in your browser.

Expected: the page loads (not redirected to `/login`). It will show a blank page or 404 for now — that's fine, the page doesn't exist yet.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add forgot-password and reset-password to public routes"
```

---

## Task 6: Create `/forgot-password` page

**Files:**
- Create: `src/app/forgot-password/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/forgot-password/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { MapPinIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    // Always show confirmation regardless of outcome (prevents enumeration)
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-sky-400/6 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-violet-400/5 blur-3xl" />
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex size-16 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-primary/10" />
            <div className="absolute inset-2 rounded-xl bg-primary/10" />
            <MapPinIcon className="relative size-8 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-xl font-semibold tracking-tight">Reset password</h1>
            <p className="text-sm text-muted-foreground">We&apos;ll send you a reset link</p>
          </div>
        </div>

        <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
          {submitted ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                If that email has an account, you&apos;ll receive a reset link shortly.
              </p>
              <Link
                href="/login"
                className="text-center text-xs text-primary hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </Button>
              <Link
                href="/login"
                className="text-center text-xs text-muted-foreground hover:text-primary"
              >
                Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Visit `http://localhost:3000/forgot-password` in your browser.

Expected: page loads with email input, "Send reset link" button, and "Back to sign in" link. Matches the visual style of the login page.

- [ ] **Step 3: Verify the confirmation state**

Submit any email address. Expected: form is replaced with the confirmation message "If that email has an account, you'll receive a reset link shortly."

- [ ] **Step 4: Commit**

```bash
git add src/app/forgot-password/page.tsx
git commit -m "feat: add forgot-password page"
```

---

## Task 7: Create `/reset-password` page

**Files:**
- Create: `src/app/reset-password/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/reset-password/page.tsx`:

```tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MapPinIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) {
      window.location.href = "/login";
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}{" "}
          {error.includes("invalid or has expired") && (
            <Link href="/forgot-password" className="font-medium underline">
              Request a new one
            </Link>
          )}
        </p>
      )}
      <Input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />
      <Input
        type="password"
        placeholder="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />
      <Button type="submit" className="w-full" disabled={loading || !token}>
        {loading ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-sky-400/6 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-violet-400/5 blur-3xl" />
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex size-16 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-primary/10" />
            <div className="absolute inset-2 rounded-xl bg-primary/10" />
            <MapPinIcon className="relative size-8 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-xl font-semibold tracking-tight">Set new password</h1>
            <p className="text-sm text-muted-foreground">
              Choose a password at least 8 characters
            </p>
          </div>
        </div>

        <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders with a valid token**

First generate a fresh token (repeat Task 3 Step 5 curl against a real credentials email). Then visit:

```
http://localhost:3000/reset-password?token=<the-token>
```

Expected: page loads with two password inputs and "Set new password" button.

- [ ] **Step 3: Verify client-side mismatch validation**

Enter different values in the two password fields and submit.

Expected: inline error "Passwords don't match" with no network request made.

- [ ] **Step 4: Verify successful reset and redirect**

Enter matching passwords (8+ chars) and submit.

Expected: redirected to `/login`. Sign in with the new password — it should work. The old password should no longer work.

- [ ] **Step 5: Verify expired/invalid token error**

Visit:

```
http://localhost:3000/reset-password?token=fake-token
```

Enter matching passwords and submit.

Expected: inline error "This reset link is invalid or has expired." with a "Request a new one" link pointing to `/forgot-password`.

- [ ] **Step 6: Commit**

```bash
git add src/app/reset-password/page.tsx
git commit -m "feat: add reset-password page"
```

---

## Task 8: Add "Forgot password?" link to CredentialsForm

**Files:**
- Modify: `src/app/login/credentials-form.tsx`

- [ ] **Step 1: Add the link below the password input**

In `src/app/login/credentials-form.tsx`, find the `<Input type="password" ...>` field and add a "Forgot password?" link directly after it, before the submit button:

```tsx
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
```

- [ ] **Step 2: Verify the link appears on the login page**

Visit `http://localhost:3000/login`.

Expected: "Forgot password?" link appears below the password field, right-aligned. Clicking it navigates to `/forgot-password`.

- [ ] **Step 3: Commit**

```bash
git add src/app/login/credentials-form.tsx
git commit -m "feat: add forgot password link to credentials form"
```

---

## Task 9: End-to-end smoke test

No new files — manual verification of the complete flow.

- [ ] **Step 1: Full happy-path test**

1. Go to `/login`, click "Forgot password?"
2. Enter a credentials-user email, submit
3. Confirm the confirmation message is shown
4. Open the reset email, click the link
5. Enter a new password (8+ chars), confirm it, submit
6. Verify redirect to `/login`
7. Sign in with the new password — should succeed

- [ ] **Step 2: Push to remote**

```bash
git pull --rebase
bd dolt push
git push
git status
```

Expected: `Your branch is up to date with 'origin/main'`

- [ ] **Step 3: Close the beads issue**

```bash
bd close travel-planner-8wy
```
