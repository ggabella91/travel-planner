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
