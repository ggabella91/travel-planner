"use client";

import { useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TripDetailSheet } from "@/components/trip-detail-sheet";
import { AddPlacesSheet } from "./components/add-places-sheet";
import { useTripPlaces } from "./hooks/use-trip-places";
import { useCityPhoto } from "../hooks/use-city-photo";
import { useTrips } from "../hooks/use-trips";
import { usePlaces } from "@/app/places/hooks/use-places";
import { STATUS_COLORS, STATUS_LABELS, STATUS_ICONS, STATUS_CARD_ACCENT } from "../constants";
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/categories";
import { getFlag } from "@/lib/flags";
import { toast } from "@/lib/toast";
import type { Place } from "@/lib/db/schema";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { trips, loading: tripsLoading, reload: reloadTrips } = useTrips();
  const { places } = usePlaces();
  const { tripPlaces, loading: placesLoading, reload: reloadTripPlaces } = useTripPlaces(id);

  const trip = trips.find((t) => t.id === id);
  const cities: string[] = trip ? JSON.parse(trip.cities) : [];
  const photo = useCityPhoto(cities[0]);

  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const addedPlaceIds = useMemo(
    () => new Set(tripPlaces.map((p) => p.id)),
    [tripPlaces],
  );

  function handleToggle(place: Place, added: boolean) {
    reloadTripPlaces();
  }

  async function handleRemovePlace(placeId: string) {
    try {
      const res = await fetch(`/api/trips/${id}/places/${placeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      reloadTripPlaces();
      toast.success("Place removed");
    } catch {
      toast.error("Failed to remove — try again");
    }
  }

  if (tripsLoading) {
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

  if (!trip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Trip not found.</p>
        <Link href="/trips" className="text-sm text-primary underline">Back to trips</Link>
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
          ) : tripPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground/70">No places added yet.</p>
              <p className="text-xs text-muted-foreground/50">Tap + to add from your backlog.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {tripPlaces.map((place) => (
                <li
                  key={place.id}
                  className={`rounded-xl border bg-card shadow-sm overflow-hidden ${
                    place.category ? `border-l-4 ${CATEGORY_COLORS[place.category] ? `border-l-[${CATEGORY_COLORS[place.category]}]` : ""}` : ""
                  }`}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug truncate">{place.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {place.category && <span className="mr-1">{CATEGORY_ICONS[place.category]}</span>}
                        {getFlag(place.country)} {place.city}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemovePlace(place.id)}
                      className="cursor-pointer shrink-0 rounded-full p-1.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove from trip"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
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
        onUpdated={() => { reloadTrips(); setEditOpen(false); }}
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
      />
    </div>
  );
}
