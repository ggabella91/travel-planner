"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddPlaceSheet } from "@/components/add-place-sheet";
import { PlaceDetailSheet } from "@/components/place-detail-sheet";
import { PlusIcon } from "lucide-react";
import type { Place } from "@/lib/db/schema";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/categories";

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/places");
    if (res.ok) setPlaces(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-lg items-center px-5 py-3 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
          <h1 className="text-base font-semibold tracking-tight">Places</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 pt-4 [padding-bottom:max(7rem,calc(env(safe-area-inset-bottom)+7rem))]">
        {places.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 pt-24 text-center">
            <p className="text-sm text-muted-foreground">No places saved yet.</p>
            <p className="text-xs text-muted-foreground/60">Tap + to add your first one.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {places.map((place) => (
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
      </main>

      {/* FAB */}
      <div className="fixed right-4 z-20 [bottom:max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))]">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
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
      />
    </div>
  );
}
