"use client";

import { useState, use, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CalendarPlusIcon, CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TripDetailSheet } from "@/components/trip-detail-sheet";
import { AddPlaceSheet } from "@/components/add-place-sheet";
import { AddPlacesSheet } from "./components/add-places-sheet";
import { useTripPlaces } from "./hooks/use-trip-places";
import type { TripPlace } from "./hooks/use-trip-places";
import { useCityPhoto } from "../hooks/use-city-photo";
import { useTrips } from "../hooks/use-trips";
import { usePlaces } from "@/app/places/hooks/use-places";
import { STATUS_COLORS, STATUS_LABELS, STATUS_ICONS } from "../constants";
import { CATEGORY_ICONS } from "@/lib/categories";
import { getFlag } from "@/lib/flags";
import { toast } from "@/lib/toast";
import type { Place, Trip } from "@/lib/db/schema";

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function dayLabel(day: number, trip: Trip, format: "full" | "short" | "medium" = "full") {
  if (!trip.startDate) return `Day ${day}`;
  const [y, m, d] = trip.startDate.split("-").map(Number);
  const date = new Date(y, m - 1, d + day - 1);
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  if (format === "short") return dateStr;
  if (format === "medium") return `${weekday}, ${dateStr}`;
  return `Day ${day} · ${weekday}, ${dateStr}`;
}

function PlaceCard({
  place,
  trip,
  numDays,
  currentDay,
  onDaysChange,
  onRemove,
}: {
  place: TripPlace;
  trip: Trip;
  numDays: number;
  currentDay: number | null; // null = Unscheduled section
  onDaysChange: (placeId: string, days: number[]) => Promise<void>;
  onRemove: (placeId: string) => void;
}) {
  const assignedDays = place.tripPlace.days;
  const isUnscheduled = currentDay === null;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pending, setPending] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setPending([]);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function openDropdown() {
    setPending([]);
    setDropdownOpen(true);
  }

  function togglePending(d: number) {
    setPending((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  async function confirmAdd() {
    if (pending.length === 0) return;
    setSaving(true);
    try {
      await onDaysChange(place.id, [...assignedDays, ...pending].sort((a, b) => a - b));
      setDropdownOpen(false);
      setPending([]);
    } finally {
      setSaving(false);
    }
  }

  async function removeDay(d: number) {
    setSaving(true);
    try {
      await onDaysChange(place.id, assignedDays.filter((x) => x !== d));
    } finally {
      setSaving(false);
    }
  }

  const availableDays = Array.from({ length: numDays }, (_, i) => i + 1).filter(
    (d) => !assignedDays.includes(d),
  );

  return (
    <li className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug truncate">{place.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {place.category && <span className="mr-1">{CATEGORY_ICONS[place.category]}</span>}
            {getFlag(place.country)} {place.city}
          </p>
        </div>
        <button
          onClick={() => onRemove(place.id)}
          className="cursor-pointer shrink-0 rounded-full p-1.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Remove from trip"
        >
          <Trash2Icon className="size-3.5" />
        </button>
      </div>

      {/* Day chips (Unscheduled only) + "also on" hint (day sections) + add dropdown */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
        {isUnscheduled ? (
          // Full chip UI with × remove in Unscheduled
          assignedDays.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 pl-2.5 pr-1.5 py-0.5 text-xs font-medium text-primary"
            >
              Day {d}{trip.startDate ? ` · ${dayLabel(d, trip, "short")}` : ""}
              <button
                type="button"
                onClick={() => removeDay(d)}
                disabled={saving}
                className="cursor-pointer rounded-full p-0.5 hover:bg-primary/20 transition-colors disabled:opacity-50"
                aria-label={`Remove day ${d}`}
              >
                <XIcon className="size-2.5" />
              </button>
            </span>
          ))
        ) : (
          // In a day section: show other days as a quiet hint
          (() => {
            const otherDays = assignedDays.filter((d) => d !== currentDay);
            return otherDays.length > 0 ? (
              <span className="text-xs text-muted-foreground/60">
                Also Day {otherDays.join(", Day ")}
              </span>
            ) : null;
          })()
        )}

        {availableDays.length > 0 && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={openDropdown}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/30 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary cursor-pointer disabled:opacity-50"
            >
              <CalendarPlusIcon className="size-3" />
              Add day
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-48 rounded-xl border bg-popover shadow-lg">
                <div className="max-h-44 overflow-y-auto">
                  {availableDays.map((d) => {
                    const selected = pending.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => togglePending(d)}
                        className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-xs transition-colors ${selected ? "bg-primary/8 text-primary" : "hover:bg-accent text-foreground"}`}
                      >
                        <span className="font-medium">
                          Day {d}{trip.startDate ? ` · ${dayLabel(d, trip, "medium")}` : ""}
                        </span>
                        {selected && <CheckIcon className="size-3 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t p-2">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={confirmAdd}
                    disabled={pending.length === 0 || saving}
                    className="w-full cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {saving ? "Saving…" : `Add ${pending.length > 0 ? pending.length : ""} day${pending.length !== 1 ? "s" : ""}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function PlaceList({
  places,
  trip,
  numDays,
  currentDay,
  onDaysChange,
  onRemove,
}: {
  places: TripPlace[];
  trip: Trip;
  numDays: number;
  currentDay: number | null;
  onDaysChange: (placeId: string, days: number[]) => Promise<void>;
  onRemove: (placeId: string) => void;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          trip={trip}
          numDays={numDays}
          currentDay={currentDay}
          onDaysChange={onDaysChange}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { trips, loading: tripsLoading, reload: reloadTrips } = useTrips();
  const { places } = usePlaces();
  const { tripPlaces, loading: placesLoading, reload: reloadTripPlaces } = useTripPlaces(id);

  const trip = trips.find((t) => t.id === id);
  const cities: string[] = trip ? JSON.parse(trip.cities) : [];
  const photo = useCityPhoto(cities[0]);

  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addNewOpen, setAddNewOpen] = useState(false);

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
    try {
      const res = await fetch(`/api/trips/${id}/places/${placeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      reloadTripPlaces();
      toast.success("Place removed");
    } catch {
      toast.error("Failed to remove — try again");
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
                        onRemove={handleRemovePlace}
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
                        onRemove={handleRemovePlace}
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
        onAddNew={() => setAddNewOpen(true)}
      />

      <AddPlaceSheet
        open={addNewOpen}
        onOpenChange={setAddNewOpen}
        onAdded={() => { reloadTripPlaces(); }}
        near={cities[0]}
      />
    </div>
  );
}
