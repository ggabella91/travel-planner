"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPlaceSheet } from "@/components/add-place-sheet";
import { PlaceDetailSheet } from "@/components/place-detail-sheet";
import { SignOutButton } from "@/components/sign-out-button";
import { PlusIcon } from "lucide-react";
import type { Place } from "@/lib/db/schema";
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  CATEGORY_ACTIVE_CHIP_COLORS,
  CATEGORY_CARD_ACCENT,
} from "@/lib/categories";
import { getFlag } from "@/lib/flags";
import { STATUS_LABELS, STATUS_ICONS, STATUS_DOT } from "@/app/places/constants";
import { usePlaces } from "@/app/places/hooks/use-places";

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 w-12">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
    </div>
  );
}

function PlacesSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="rounded-xl border bg-card shadow overflow-hidden">
          <div className="px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-2.5 h-3 w-36" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-1.5 h-3 w-3/4" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  const { places, loading, reload } = usePlaces();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCity, setFilterCity] = useState("all");

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

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-lg items-center px-5 py-3 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
          <h1 className="text-base font-semibold tracking-tight">Places</h1>
          {places.length > 0 && (
            <span className="ml-2 text-xs tabular-nums text-muted-foreground/60">
              {places.length} saved
            </span>
          )}
          <div className="ml-auto">
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 pt-4 [padding-bottom:max(9rem,calc(env(safe-area-inset-bottom)+9rem))]">
        {loading ? (
          <PlacesSkeleton />
        ) : places.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 pt-20 text-center">
            <div className="relative flex size-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-primary/10" />
              <div className="absolute inset-3 rounded-full border border-primary/10" />
              <div className="absolute inset-6 rounded-full bg-primary/6" />
              <svg viewBox="0 0 48 48" className="relative size-12 text-primary/50" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M24 4C17.4 4 12 9.4 12 16c0 9.6 12 24 12 24s12-14.4 12-24c0-6.6-5.4-12-12-12z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="24" cy="16" r="4" fill="currentColor" fillOpacity="0.5"/>
                <circle cx="24" cy="38" r="6" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 3"/>
              </svg>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-foreground/70">No places saved yet</p>
              <p className="text-xs text-muted-foreground/60">Tap + to start building your backlog</p>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col pb-5">
              <div className="py-2.5">
                <FilterRow label="Status">
                  {["all", "backlog", "visited", "skipped"].map((s) => (
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
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </FilterRow>
              </div>

              {categories.length > 0 && (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-border/70 to-transparent" />
                  <div className="py-2.5">
                    <FilterRow label="Type">
                      <button
                        onClick={() => setFilterCategory("all")}
                        className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          filterCategory === "all"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                        }`}
                      >
                        All
                      </button>
                      {categories.map((c) => (
                        <button
                          key={c}
                          onClick={() => setFilterCategory(c)}
                          className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            filterCategory === c
                              ? CATEGORY_ACTIVE_CHIP_COLORS[c] ?? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                          }`}
                        >
                          <span className="mr-1">{CATEGORY_ICONS[c]}</span>
                          {CATEGORY_LABELS[c] ?? c}
                        </button>
                      ))}
                    </FilterRow>
                  </div>
                </>
              )}

              {cities.length > 1 && (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-border/70 to-transparent" />
                  <div className="py-2.5">
                    <FilterRow label="City">
                      {[{ value: "all", label: "All" }, ...cities.map((c) => ({ value: c, label: c }))].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setFilterCity(opt.value)}
                          className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            filterCity === opt.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </FilterRow>
                  </div>
                </>
              )}
            </div>

            {filteredPlaces.length === 0 ? (
              <p className="pt-16 text-center text-sm text-muted-foreground">No places match your filters.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {filteredPlaces.map((place) => (
                  <li
                    key={place.id}
                    className={`cursor-pointer rounded-xl border bg-card shadow transition-all active:bg-muted overflow-hidden ${
                      place.category ? `border-l-4 ${CATEGORY_CARD_ACCENT[place.category] ?? ""}` : ""
                    }`}
                    onClick={() => setSelectedPlace(place)}
                  >
                    <div className="px-4 py-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium leading-snug">{place.name}</span>
                        {place.category && (
                          <Badge className={`mt-0.5 shrink-0 border text-xs ${CATEGORY_COLORS[place.category] ?? "bg-muted text-muted-foreground"}`}>
                            <span className="mr-1">{CATEGORY_ICONS[place.category]}</span>
                            {CATEGORY_LABELS[place.category] ?? place.category}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[place.status] ?? "bg-zinc-300"}`} />
                        <p className="text-xs text-muted-foreground">
                          {getFlag(place.country)} {place.city}, {place.country}
                        </p>
                      </div>
                      {place.status === "visited" && place.rating && (
                        <p className="mt-1 text-xs tracking-wide text-amber-400">
                          {"★".repeat(place.rating)}{"☆".repeat(5 - place.rating)}
                        </p>
                      )}
                      {place.notes && (
                        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {place.notes}
                        </p>
                      )}
                    </div>
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

      <AddPlaceSheet open={addOpen} onOpenChange={setAddOpen} onAdded={reload} />

      <PlaceDetailSheet
        place={selectedPlace}
        open={!!selectedPlace}
        onOpenChange={(open) => { if (!open) setSelectedPlace(null); }}
        onUpdated={() => { reload(); setSelectedPlace(null); }}
      />
    </div>
  );
}
