"use client";

import { signOut } from "next-auth/react";
import { LogOutIcon } from "lucide-react";
import { invalidatePlacesCache } from "@/app/places/hooks/use-places";
import { invalidateTripsCache } from "@/app/trips/hooks/use-trips";

export function SignOutButton() {
  return (
    <button
      onClick={() => {
        invalidatePlacesCache();
        invalidateTripsCache();
        signOut({ callbackUrl: "/login" });
      }}
      className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <LogOutIcon className="size-3.5" aria-hidden />
      Log out
    </button>
  );
}
