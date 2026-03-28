"use client";

import { signOut } from "next-auth/react";
import { LogOutIcon } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Sign out"
    >
      <LogOutIcon className="size-4" />
    </button>
  );
}
