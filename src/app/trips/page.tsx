"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateTripSheet } from "@/components/create-trip-sheet";
import { TripDetailSheet } from "@/components/trip-detail-sheet";
import { PlusIcon } from "lucide-react";
import type { Trip } from "@/lib/db/schema";

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-sky-100 text-sky-700 border-sky-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  done: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<string, string> = {
  planning: "Planning",
  active: "Active",
  done: "Done",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/trips");
    if (res.ok) setTrips(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-lg items-center px-5 py-3 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
          <h1 className="text-base font-semibold tracking-tight">Trips</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 pt-4 [padding-bottom:max(9rem,calc(env(safe-area-inset-bottom)+9rem))]">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 pt-24 text-center">
            <p className="text-sm text-muted-foreground">No trips yet.</p>
            <p className="text-xs text-muted-foreground/60">Tap + to plan your first trip.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {trips.map((trip) => {
              const cities: string[] = JSON.parse(trip.cities);
              return (
                <li
                  key={trip.id}
                  className="cursor-pointer rounded-xl border bg-card px-4 py-4 shadow-sm transition-colors active:bg-muted"
                  onClick={() => setSelectedTrip(trip)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium leading-snug">{trip.name}</span>
                    <Badge className={`mt-0.5 shrink-0 border text-xs ${STATUS_COLORS[trip.status] ?? "bg-muted text-muted-foreground"}`}>
                      {STATUS_LABELS[trip.status] ?? trip.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{cities.join(" · ")}</p>
                  {(trip.startDate || trip.endDate) && (
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {trip.startDate && formatDate(trip.startDate)}
                      {trip.startDate && trip.endDate && " – "}
                      {trip.endDate && formatDate(trip.endDate)}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
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

      <CreateTripSheet open={createOpen} onOpenChange={setCreateOpen} onCreated={load} />

      <TripDetailSheet
        trip={selectedTrip}
        open={!!selectedTrip}
        onOpenChange={(o) => { if (!o) setSelectedTrip(null); }}
        onUpdated={() => { load(); setSelectedTrip(null); }}
      />
    </div>
  );
}
