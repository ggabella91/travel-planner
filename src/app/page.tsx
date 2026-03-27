"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddPlaceSheet } from "@/components/add-place-sheet";
import { PlusIcon } from "lucide-react";
import type { Place } from "@/lib/db/schema";

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  cafe: "Cafe",
  neighborhood: "Neighborhood",
  activity: "Activity",
  spot: "Spot",
};

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/places");
    if (res.ok) setPlaces(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <h1 className="text-base font-semibold">Places</h1>
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          <PlusIcon className="size-4" />
          Add
        </Button>
      </header>

      <main className="px-4 py-4">
        {places.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 pt-20 text-center text-muted-foreground">
            <p className="text-sm">No places yet.</p>
            <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
              Add your first place
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col divide-y">
            {places.map((place) => (
              <li key={place.id} className="flex flex-col gap-1 py-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium leading-snug">{place.name}</span>
                  {place.category && (
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {CATEGORY_LABELS[place.category] ?? place.category}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {place.city}, {place.country}
                </span>
                {place.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{place.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <AddPlaceSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onAdded={load}
      />
    </div>
  );
}
