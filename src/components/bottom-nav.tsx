"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPinIcon, PlaneIcon } from "lucide-react";

const tabs = [
  { href: "/", label: "Places", icon: MapPinIcon },
  { href: "/trips", label: "Trips", icon: PlaneIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur-sm [padding-bottom:env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
