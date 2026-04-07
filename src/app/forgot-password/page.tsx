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
              <Link href="/login" className="text-center text-xs text-primary hover:underline">
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
