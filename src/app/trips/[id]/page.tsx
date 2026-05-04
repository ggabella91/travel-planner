"use client";

import { useState, use, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PencilIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TripDetailSheet } from "@/components/trip-detail-sheet";
import { AddPlaceSheet } from "@/components/add-place-sheet";
import { AddPlacesSheet } from "./components/add-places-sheet";
import { PlaceList } from "./components/place-card";
import { useTripPlaces } from "./hooks/use-trip-places";
import type { TripPlace } from "./hooks/use-trip-places";
import { useTripById } from "./hooks/use-trip-by-id";
import { useCityPhoto } from "../hooks/use-city-photo";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usePlaces } from "@/app/places/hooks/use-places";
import { STATUS_COLORS, STATUS_LABELS, STATUS_ICONS } from "../constants";
import { toast } from "@/lib/toast";
import { formatDate, dayLabel } from "./utils";
import type { Place } from "@/lib/db/schema";

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { trip, loading: tripLoading, error: tripError, reload: reloadTrip } = useTripById(id);
  const { places } = usePlaces();
  const { tripPlaces, loading: placesLoading, error: placesError, reload: reloadTripPlaces } = useTripPlaces(id);

  const cities: string[] = trip ? JSON.parse(trip.cities) : [];
  const photo = useCityPhoto(cities[0]);

  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addNewOpen, setAddNewOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const addedPlaceIds = useMemo(
    () => new Set(tripPlaces.map((p) => p.id)),
    [tripPlaces],
  );

  // Number of days from trip dates, or derived from max assigned day
  const numDays = useMemo(() => {
    if (trip?.startDate && trip?.endDate) {
      const [sy, sm, sd] = trip.startDate.split("-").map(Number);
      const [ey, em, ed] = trip.endDate.split("-").map(Number);
      const diff = Math.round(
        (new Date(ey, em - 1, ed).getTime() - new Date(sy, sm - 1, sd).getTime()) / 86400000,
      );
      return diff + 1;
    }
    const maxDay = tripPlaces.reduce(
      (m, p) => Math.max(m, ...p.tripPlace.days, 0),
      0,
    );
    return Math.max(maxDay + 1, 7);
  }, [trip, tripPlaces]);

  // Group places by day — a place can appear in multiple day buckets
  const grouped = useMemo(() => {
    const byDay = new Map<number | null, TripPlace[]>();
    byDay.set(null, []);
    for (let d = 1; d <= numDays; d++) byDay.set(d, []);
    for (const p of tripPlaces) {
      if (p.tripPlace.days.length === 0) {
        byDay.get(null)!.push(p);
      } else {
        for (const d of p.tripPlace.days) {
          if (!byDay.has(d)) byDay.set(d, []);
          byDay.get(d)!.push(p);
        }
      }
    }
    return byDay;
  }, [tripPlaces, numDays]);

  function handleToggle(place: Place, added: boolean) {
    reloadTripPlaces();
  }

  async function handleRemovePlace(placeId: string) {
    setRemoving(true);
    try {
      const res = await fetch(`/api/trips/${id}/places/${placeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setConfirmRemove(null);
      reloadTripPlaces();
      toast.success("Place removed");
    } catch {
      toast.error("Failed to remove — try again");
    } finally {
      setRemoving(false);
    }
  }

  const handleDaysChange = useCallback(async (placeId: string, days: number[]) => {
    const res = await fetch(`/api/trips/${id}/places/${placeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    });
    if (!res.ok) {
      toast.error("Failed to update days — try again");
      throw new Error();
    }
    reloadTripPlaces();
  }, [id, reloadTripPlaces]);

  if (tripLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-48 w-full bg-muted animate-pulse" />
        <div className="mx-auto max-w-lg px-5 pt-4 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (tripError || !trip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">{tripError ? "Failed to load trip." : "Trip not found."}</p>
        {tripError ? (
          <button onClick={reloadTrip} className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Try again
          </button>
        ) : (
          <Link href="/trips" className="text-sm text-primary underline">Back to trips</Link>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {photo && (
          <>
            <img src={photo.url} alt={cities[0]} className="h-full w-full object-cover" style={{ backgroundColor: photo.color }} />
            <a
              href={photo.photoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-3 text-[10px] text-white/50 hover:text-white/80 transition-colors"
            >
              {photo.photographer} / Unsplash
            </a>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />

        {/* Back button */}
        <Link
          href="/trips"
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-4 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <ArrowLeftIcon className="size-4" />
          <span className="sr-only">Back</span>
        </Link>

        {/* Edit button */}
        <button
          onClick={() => setEditOpen(true)}
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-4 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="Edit trip"
        >
          <PencilIcon className="size-4" />
        </button>

        {/* Trip name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <h1 className="text-xl font-bold leading-tight text-white">{trip.name}</h1>
          <p className="mt-0.5 text-sm text-white/70">{cities.join(" · ")}</p>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-5 pt-4 [padding-bottom:max(9rem,calc(env(safe-area-inset-bottom)+9rem))]">
        {/* Trip metadata */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border/50">
          <Badge className={`border text-xs ${STATUS_COLORS[trip.status] ?? "bg-muted text-muted-foreground"}`}>
            <span className="mr-1">{STATUS_ICONS[trip.status]}</span>
            {STATUS_LABELS[trip.status] ?? trip.status}
          </Badge>
          {(trip.startDate || trip.endDate) && (
            <span className="text-xs text-muted-foreground">
              {trip.startDate && formatDate(trip.startDate)}
              {trip.startDate && trip.endDate && " – "}
              {trip.endDate && formatDate(trip.endDate)}
            </span>
          )}
        </div>

        {trip.notes && (
          <p className="py-3 text-sm text-muted-foreground leading-relaxed border-b border-border/50">
            {trip.notes}
          </p>
        )}

        {/* Places section */}
        <div className="pt-4">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-sm font-semibold">
              Places
              {!placesLoading && (
                <span className="ml-2 text-xs font-normal text-muted-foreground/60 tabular-nums">
                  {tripPlaces.length}
                </span>
              )}
            </h2>
          </div>

          {placesLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : placesError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">Failed to load places.</p>
              <button onClick={reloadTripPlaces} className="cursor-pointer text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                Try again
              </button>
            </div>
          ) : tripPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground/70">No places added yet.</p>
              <p className="text-xs text-muted-foreground/50">Tap + to add from your backlog.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Day sections */}
              {Array.from({ length: numDays }, (_, i) => i + 1).map((day) => {
                const dayPlaces = grouped.get(day) ?? [];
                return (
                  <div key={day}>
                    <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {trip && dayLabel(day, trip)}
                    </p>
                    {dayPlaces.length === 0 ? (
                      <p className="text-xs text-muted-foreground/40 px-4">Nothing scheduled</p>
                    ) : (
                      <PlaceList
                        places={dayPlaces}
                        trip={trip!}
                        numDays={numDays}
                        currentDay={day}
                        onDaysChange={handleDaysChange}
                        onRemove={setConfirmRemove}
                      />
                    )}
                  </div>
                );
              })}

              {/* Unscheduled section */}
              {(() => {
                const unscheduled = grouped.get(null) ?? [];
                return (
                  <div>
                    <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Unscheduled
                    </p>
                    {unscheduled.length === 0 ? (
                      <p className="text-xs text-muted-foreground/40 px-4">None</p>
                    ) : (
                      <PlaceList
                        places={unscheduled}
                        trip={trip!}
                        numDays={numDays}
                        currentDay={null}
                        onDaysChange={handleDaysChange}
                        onRemove={setConfirmRemove}
                      />
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <div className="fixed right-4 z-20 [bottom:calc(4.5rem+env(safe-area-inset-bottom))]">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setAddOpen(true)}
          aria-label="Add places"
        >
          <PlusIcon className="size-6" />
        </Button>
      </div>

      <TripDetailSheet
        trip={trip}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={() => { reloadTrip(); setEditOpen(false); }}
        initialEditing
      />

      <AddPlacesSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        tripId={id}
        tripCities={cities}
        places={places}
        addedPlaceIds={addedPlaceIds}
        onToggle={handleToggle}
        onAddNew={() => setAddNewOpen(true)}
      />

      <AddPlaceSheet
        open={addNewOpen}
        onOpenChange={setAddNewOpen}
        onAdded={() => { reloadTripPlaces(); }}
        near={cities[0]}
      />

      <ConfirmDialog
        open={confirmRemove !== null}
        onOpenChange={(o) => { if (!o) setConfirmRemove(null); }}
        title="Remove from trip?"
        description="This will unlink this place from your trip. You can add it back at any time."
        onConfirm={() => { if (confirmRemove) handleRemovePlace(confirmRemove); }}
        loading={removing}
      />
    </div>
  );
}
