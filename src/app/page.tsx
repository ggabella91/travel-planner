"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddPlaceSheet } from "@/components/add-place-sheet";
import { PlaceDetailSheet } from "@/components/place-detail-sheet";
import { PlusIcon } from "lucide-react";
import type { Place } from "@/lib/db/schema";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/categories";

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  backlog: "Backlog",
  visited: "Visited",
  skipped: "Skipped",
};

function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCity, setFilterCity] = useState("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/places");
    if (res.ok) setPlaces(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cities = useMemo(
    () => [...new Set(places.map((p) => p.city))].sort(),
    [places],
  );

  const categories = useMemo(
    () => [...new Set(places.map((p) => p.category).filter(Boolean) as string[])],
    [places],
  );

  const filteredPlaces = useMemo(
    () =>
      places.filter((p) => {
        if (filterStatus !== "all" && p.status !== filterStatus) return false;
        if (filterCategory !== "all" && p.category !== filterCategory) return false;
        if (filterCity !== "all" && p.city !== filterCity) return false;
        return true;
      }),
    [places, filterStatus, filterCategory, filterCity],
  );

  const statusOptions = ["all", "backlog", "visited", "skipped"].map((s) => ({
    value: s,
    label: STATUS_LABELS[s],
  }));

  const categoryOptions = [
    { value: "all", label: "All" },
    ...categories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] ?? c })),
  ];

  const cityOptions = [
    { value: "all", label: "All" },
    ...cities.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-lg items-center px-5 py-3 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
          <h1 className="text-base font-semibold tracking-tight">Places</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 pt-4 [padding-bottom:max(9rem,calc(env(safe-area-inset-bottom)+9rem))]">
        {places.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 pt-24 text-center">
            <p className="text-sm text-muted-foreground">No places saved yet.</p>
            <p className="text-xs text-muted-foreground/60">Tap + to add your first one.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 pb-4">
              <FilterChips options={statusOptions} value={filterStatus} onChange={setFilterStatus} />
              {categories.length > 0 && (
                <FilterChips options={categoryOptions} value={filterCategory} onChange={setFilterCategory} />
              )}
              {cities.length > 1 && (
                <FilterChips options={cityOptions} value={filterCity} onChange={setFilterCity} />
              )}
            </div>

            {filteredPlaces.length === 0 ? (
              <p className="pt-16 text-center text-sm text-muted-foreground">No places match your filters.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {filteredPlaces.map((place) => (
                  <li
                    key={place.id}
                    className="cursor-pointer rounded-xl border bg-card px-4 py-4 shadow-sm transition-colors active:bg-muted"
                    onClick={() => setSelectedPlace(place)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium leading-snug">{place.name}</span>
                      {place.category && (
                        <Badge className={`mt-0.5 shrink-0 border text-xs ${CATEGORY_COLORS[place.category] ?? "bg-muted text-muted-foreground"}`}>
                          {CATEGORY_LABELS[place.category] ?? place.category}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {place.city}, {place.country}
                    </p>
                    {place.notes && (
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {place.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {/* FAB */}
      <div className="fixed right-4 z-20 [bottom:calc(4.5rem+env(safe-area-inset-bottom))]">
        <Button
          size="lg"
          className="h-14 w-14 cursor-pointer rounded-full shadow-lg"
          onClick={() => setAddOpen(true)}
          aria-label="Add place"
        >
          <PlusIcon className="size-6" />
        </Button>
      </div>

      <AddPlaceSheet open={addOpen} onOpenChange={setAddOpen} onAdded={load} />

      <PlaceDetailSheet
        place={selectedPlace}
        open={!!selectedPlace}
        onOpenChange={(open) => { if (!open) setSelectedPlace(null); }}
        onUpdated={() => { load(); setSelectedPlace(null); }}
      />
    </div>
  );
}
