# Forgot / Reset Password Flow

**Date:** 2026-04-04
**Issue:** travel-planner-8wy
**Status:** approved

## Overview

Add a standard forgot-password / reset-password flow for credentials (email + password) users. Google-only users are silently excluded — they have no password to reset.

## Data Model

New table: `password_reset_tokens`

| column | type | constraints | notes |
|---|---|---|---|
| `token` | `text` | PRIMARY KEY | `crypto.randomUUID()` |
| `email` | `text` | NOT NULL | user's email address |
| `expires_at` | `timestamp` | NOT NULL | `now + 1 hour` |
| `used_at` | `timestamp` | nullable | set when consumed; `null` means still valid |

No FK to `users` — keeps consistent with the rest of the schema and avoids cascade complications.

Migration: new Drizzle migration file added alongside the schema change.

## API Routes

### `POST /api/auth/forgot-password`

**Input:** `{ email: string }`

**Behavior:**
- Always returns `200 { ok: true }` regardless of whether the email exists (prevents email enumeration).
- Looks up the user by email. If no user exists, or the user has no `passwordHash` (Google-only), returns early with the same 200 response — no email sent.
- Generates a `crypto.randomUUID()` token, inserts into `password_reset_tokens` with `expires_at = now + 1 hour`.
- Sends a reset email via Resend to the user's email address containing a link to `/reset-password?token=<token>`.

**Error cases:** Only returns non-200 on malformed request (missing email field → 400).

---

### `POST /api/auth/reset-password`

**Input:** `{ token: string, password: string }`

**Behavior:**
- Looks up the token in `password_reset_tokens`.
- Validates: token exists, `used_at` is null, `expires_at` is in the future.
- If invalid/expired: returns `400 { error: "This reset link is invalid or has expired." }`.
- If valid: hashes the new password with `bcryptjs` (cost 12), updates `users.passwordHash`, sets `used_at = now()` on the token.
- Returns `200 { ok: true }`.

**Validation:** `password` must be a string of at least 8 characters (same rule as signup).

## Pages & UI

### `/forgot-password`

New page at `src/app/forgot-password/page.tsx`. Client component form with:
- Single email input
- Submit button
- On submit: calls `POST /api/auth/forgot-password`
- After response (success or error): replaces the form with a static confirmation message — "If that email has an account, you'll receive a reset link shortly." This message is shown unconditionally to avoid leaking whether an account exists.
- Shares the same centered card layout as `/login` and `/signup`.

### `/reset-password`

New page at `src/app/reset-password/page.tsx`. Client component that:
- Reads `?token` from the URL on mount.
- Shows a "new password" input + "confirm password" input.
- Client-side validates that both fields match before submitting.
- On submit: calls `POST /api/auth/reset-password` with `{ token, password }`.
- On success: redirects to `/login` (using `window.location.href`).
- On failure: shows an inline error — "This reset link is invalid or has expired." with a link back to `/forgot-password`.

### `CredentialsForm` update

Add a "Forgot password?" link below the password input field, linking to `/forgot-password`. Styled consistently with the existing "Sign up" link (small, muted, `text-primary` on hover).

## Middleware

`src/middleware.ts`: extend the `isPublic` check to include `/forgot-password` and `/reset-password`:

```ts
const isPublic =
  pathname === "/login" ||
  pathname === "/signup" ||
  pathname === "/forgot-password" ||
  pathname === "/reset-password";
```

Logged-in users who visit these pages are **not** redirected away — unlike `/login` and `/signup`, there's no reason to block an authenticated user from resetting their password.

## Email

Uses Resend (`resend` npm package). New env var: `RESEND_API_KEY`.

Email content:
- **Subject:** "Reset your Travel Planner password"
- **Body:** Plain text (no HTML template needed for MVP) with the reset link and a note that it expires in 1 hour.
- Sent from a `from` address configured via a new env var `RESEND_FROM` (e.g. `noreply@yourdomain.com`).

## Out of Scope

- Rate limiting on `/api/auth/forgot-password` (can add later)
- HTML email templates
- Token cleanup / cron job for expired tokens (harmless to leave them; can prune later)
- Account linking between Google and credentials users
