"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateTripSheet } from "@/components/create-trip-sheet";
import { TripDetailSheet } from "@/components/trip-detail-sheet";
import { PlusIcon, PlaneIcon } from "lucide-react";
import type { Trip } from "@/lib/db/schema";
import { useCityPhoto } from "./hooks/use-city-photo";
import { STATUS_COLORS, STATUS_LABELS, STATUS_ICONS, STATUS_CARD_ACCENT } from "./constants";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/trips");
    if (res.ok) setTrips(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredTrips = useMemo(
    () => trips.filter((t) => filterStatus === "all" || t.status === filterStatus),
    [trips, filterStatus],
  );

  const statusOptions = ["all", "planning", "active", "done"];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-lg items-center px-5 py-3 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
          <h1 className="text-base font-semibold tracking-tight">Trips</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 pt-4 [padding-bottom:max(9rem,calc(env(safe-area-inset-bottom)+9rem))]">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 pt-24 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <PlaneIcon className="size-8 text-muted-foreground/50" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">No trips yet</p>
              <p className="text-xs text-muted-foreground/60">Tap + to plan your first trip</p>
            </div>
          </div>
        ) : (
          <>
            {/* Status filter */}
            <div className="flex items-center gap-3 pb-5">
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 w-12">
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
              <p className="pt-16 text-center text-sm text-muted-foreground">No trips match your filters.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {filteredTrips.map((trip) => {
                  const cities: string[] = JSON.parse(trip.cities);
                  return (
                    <li
                      key={trip.id}
                      className={`cursor-pointer overflow-hidden rounded-xl border bg-card shadow-sm transition-colors active:bg-muted border-l-4 ${STATUS_CARD_ACCENT[trip.status] ?? ""}`}
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <div className="px-4 py-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium leading-snug">{trip.name}</span>
                          <Badge className={`mt-0.5 shrink-0 border text-xs ${STATUS_COLORS[trip.status] ?? "bg-muted text-muted-foreground"}`}>
                            <span className="mr-1">{STATUS_ICONS[trip.status]}</span>
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
                        {trip.notes && (
                          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {trip.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
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
