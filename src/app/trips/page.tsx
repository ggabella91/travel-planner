"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateTripSheet } from "@/components/create-trip-sheet";
import { SignOutButton } from "@/components/sign-out-button";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { STATUS_LABELS, STATUS_ICONS } from "./constants";
import { TripCard } from "./components/trip-card";
import { useTrips } from "./hooks/use-trips";

function TripsSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="rounded-xl border bg-card shadow overflow-hidden">
          <Skeleton className="h-32 w-full rounded-none" />
          <div className="px-4 py-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-28" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function TripsPage() {
  const { trips, loading, error, reload } = useTrips();
  const [createOpen, setCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTrips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return trips.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (q && !t.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [trips, filterStatus, searchQuery]);

  const statusOptions = ["all", "planning", "active", "done"];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-lg items-center px-5 py-3 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
          <h1 className="text-base font-semibold tracking-tight">Trips</h1>
          {trips.length > 0 && (
            <span className="ml-2 text-xs tabular-nums text-muted-foreground/60">
              {trips.length} trip{trips.length !== 1 ? "s" : ""}
            </span>
          )}
          <div className="ml-auto">
            <SignOutButton />
          </div>
        </div>
        {trips.length > 0 && (
          <div className="mx-auto max-w-lg px-5 pb-3">
            <div className="relative flex items-center">
              <SearchIcon className="absolute left-3 size-3.5 text-muted-foreground/50 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trips…"
                className="w-full rounded-lg border border-input bg-muted/40 py-1.5 pl-8 pr-8 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 cursor-pointer text-muted-foreground/50 hover:text-muted-foreground"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-lg px-5 pt-4 [padding-bottom:max(9rem,calc(env(safe-area-inset-bottom)+9rem))]">
        {loading ? (
          <TripsSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 pt-20 text-center">
            <p className="text-sm text-muted-foreground">Failed to load trips.</p>
            <button onClick={reload} className="cursor-pointer text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              Try again
            </button>
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 pt-20 text-center">
            <div className="relative flex size-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-primary/10" />
              <div className="absolute inset-3 rounded-full border border-primary/10" />
              <div className="absolute inset-6 rounded-full bg-primary/6" />
              <svg viewBox="0 0 48 48" className="relative size-12 text-primary/50" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 36 Q24 8 42 28" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="3 3" fill="none"/>
                <path d="M28 18l-4-4-2 2 2 3-8 5 1 2 5-1 2 4 2-1-1-5 3-2z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.5"/>
                <circle cx="42" cy="28" r="2" fill="currentColor" fillOpacity="0.4"/>
                <circle cx="42" cy="28" r="4" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1"/>
              </svg>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-foreground/70">No trips yet</p>
              <p className="text-xs text-muted-foreground/60">Tap + to plan your first adventure</p>
            </div>
          </div>
        ) : (
          <>
            {/* Status filter */}
            <div className="flex items-center gap-3 pb-5">
              <span className="shrink-0 w-12 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                Status
              </span>
              <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      filterStatus === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <span className="mr-1">{STATUS_ICONS[s]}</span>
                    {s === "all" ? "All" : STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {filteredTrips.length === 0 ? (
              <div className="flex flex-col items-center gap-2 pt-16 text-center">
                <p className="text-sm text-muted-foreground">No trips match your search.</p>
                <button
                  onClick={() => { setFilterStatus("all"); setSearchQuery(""); }}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {filteredTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      <div className="fixed right-4 z-20 [bottom:calc(4.5rem+env(safe-area-inset-bottom))]">
        <Button
          size="lg"
          className="h-14 w-14 cursor-pointer rounded-full shadow-lg"
          onClick={() => setCreateOpen(true)}
          aria-label="New trip"
        >
          <PlusIcon className="size-6" />
        </Button>
      </div>

      <CreateTripSheet open={createOpen} onOpenChange={setCreateOpen} onCreated={reload} />
    </div>
  );
}
