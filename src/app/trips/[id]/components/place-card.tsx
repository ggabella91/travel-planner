"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarPlusIcon, CheckIcon, Trash2Icon, XIcon } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/categories";
import { getFlag } from "@/lib/flags";
import type { Trip } from "@/lib/db/schema";
import type { TripPlace } from "../hooks/use-trip-places";
import { dayLabel } from "../utils";

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
  currentDay: number | null;
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

      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
        {isUnscheduled ? (
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

export function PlaceList({
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
