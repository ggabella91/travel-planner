"use client";

import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckIcon, SearchIcon } from "lucide-react";
import type { Place } from "@/lib/db/schema";
import { CATEGORY_ICONS } from "@/lib/categories";
import { getFlag } from "@/lib/flags";
import { toast } from "@/lib/toast";

interface AddPlacesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  tripCities: string[];
  places: Place[];
  addedPlaceIds: Set<string>;
  onToggle: (place: Place, added: boolean) => void;
}

export function AddPlacesSheet({
  open,
  onOpenChange,
  tripId,
  tripCities,
  places,
  addedPlaceIds,
  onToggle,
}: AddPlacesSheetProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return places.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q),
    );
  }, [places, search]);

  // Places in trip cities shown first
  const sorted = useMemo(() => {
    const citySet = new Set(tripCities.map((c) => c.toLowerCase()));
    return [...filtered].sort((a, b) => {
      const aMatch = citySet.has(a.city.toLowerCase()) ? 0 : 1;
      const bMatch = citySet.has(b.city.toLowerCase()) ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [filtered, tripCities]);

  async function handleToggle(place: Place) {
    const added = addedPlaceIds.has(place.id);
    setLoading(place.id);
    try {
      if (added) {
        const res = await fetch(`/api/trips/${tripId}/places/${place.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch(`/api/trips/${tripId}/places`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placeId: place.id }),
        });
        if (!res.ok) throw new Error();
      }
      onToggle(place, !added);
    } catch {
      toast.error("Failed to update — try again");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] overflow-hidden rounded-t-2xl flex flex-col [padding-bottom:max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="px-5">
          <SheetHeader className="px-0 pt-3 pb-3">
            <SheetTitle>Add places</SheetTitle>
          </SheetHeader>
          <div className="relative mb-3">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search places…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-transparent py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-2">
          {sorted.map((place) => {
            const added = addedPlaceIds.has(place.id);
            const isLoading = loading === place.id;
            return (
              <li key={place.id}>
                <button
                  onClick={() => handleToggle(place)}
                  disabled={isLoading}
                  className={`w-full cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors ${
                    added
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-card hover:bg-muted/50"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug truncate">{place.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {place.category && <span className="mr-1">{CATEGORY_ICONS[place.category]}</span>}
                        {getFlag(place.country)} {place.city}
                      </p>
                    </div>
                    {added && <CheckIcon className="size-4 shrink-0 text-primary" />}
                  </div>
                </button>
              </li>
            );
          })}
          {sorted.length === 0 && (
            <p className="pt-8 text-center text-sm text-muted-foreground">No places match your search.</p>
          )}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
