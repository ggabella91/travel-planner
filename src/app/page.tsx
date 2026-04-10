"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPlaceSheet } from "@/components/add-place-sheet";
import { PlaceDetailSheet } from "@/components/place-detail-sheet";
import { SignOutButton } from "@/components/sign-out-button";
import { CheckIcon, SkipForwardIcon, PlusIcon, SearchIcon, XIcon, SlidersHorizontalIcon } from "lucide-react";
import { toast } from "@/lib/toast";
import { PlacesFilterSheet } from "@/components/places-filter-sheet";
import type { Place } from "@/lib/db/schema";
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  CATEGORY_CARD_ACCENT,
} from "@/lib/categories";
import { getFlag } from "@/lib/flags";
import { STATUS_DOT } from "@/app/places/constants";
import { usePlaces } from "@/app/places/hooks/use-places";
import { parseTags } from "@/lib/tags";


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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  async function handleStatusChange(placeId: string, status: string) {
    try {
      const res = await fetch(`/api/places/${placeId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      reload();
      toast.success(status === "visited" ? "Marked as visited" : status === "skipped" ? "Marked as skipped" : "Moved to backlog");
    } catch {
      toast.error("Failed to update — try again");
    }
  }
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterTags, setFilterTags] = useState<string[]>([]);

  const cities = useMemo(
    () => [...new Set(places.map((p) => p.city))].sort(),
    [places],
  );

  const categories = useMemo(
    () => [...new Set(places.map((p) => p.category).filter(Boolean) as string[])],
    [places],
  );

  const tags = useMemo(
    () => [...new Set(places.flatMap((p) => parseTags(p.tags)))].sort(),
    [places],
  );

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return places.filter((p) => {
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterCategory !== "all" && p.category !== filterCategory) return false;
      if (filterCity !== "all" && p.city !== filterCity) return false;
      if (filterTags.length > 0) {
        const placeTags = parseTags(p.tags);
        if (!filterTags.some((t) => placeTags.includes(t))) return false;
      }
      if (q) {
        const haystack = `${p.name} ${p.city} ${p.notes ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [places, filterStatus, filterCategory, filterCity, filterTags, searchQuery]);

  const activeFilterCount =
    (filterStatus !== "all" ? 1 : 0) +
    (filterCategory !== "all" ? 1 : 0) +
    (filterCity !== "all" ? 1 : 0) +
    (filterTags.length > 0 ? 1 : 0);

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
        {places.length > 0 && (
          <div className="mx-auto max-w-lg px-5 pb-3 flex items-center gap-2">
            <div className="relative flex flex-1 items-center">
              <SearchIcon className="absolute left-3 size-3.5 text-muted-foreground/50 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places…"
                className="w-full rounded-lg border border-input bg-muted/40 py-1.5 pl-8 pr-8 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 cursor-pointer text-muted-foreground/50 hover:text-muted-foreground"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              aria-label="Filter places"
              className={`relative cursor-pointer rounded-lg p-1.5 transition-colors ${
                activeFilterCount > 0
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <SlidersHorizontalIcon className="size-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        )}
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
                    <div className="px-4 pt-4 pb-3">
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
                      {(() => {
                        const cardTags = parseTags(place.tags);
                        return cardTags.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {cardTags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div
                      className="flex gap-1 border-t border-border/40 px-3 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleStatusChange(place.id, place.status === "visited" ? "backlog" : "visited")}
                        className={`flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          place.status === "visited"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <CheckIcon className="size-3" />
                        Visited
                      </button>
                      <button
                        onClick={() => handleStatusChange(place.id, place.status === "skipped" ? "backlog" : "skipped")}
                        className={`flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          place.status === "skipped"
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <SkipForwardIcon className="size-3" />
                        Skip
                      </button>
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

      <PlacesFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filterStatus={filterStatus}
        filterCategory={filterCategory}
        filterCity={filterCity}
        filterTags={filterTags}
        onFilterStatus={setFilterStatus}
        onFilterCategory={setFilterCategory}
        onFilterCity={setFilterCity}
        onFilterTags={setFilterTags}
        onReset={() => {
          setFilterStatus("all");
          setFilterCategory("all");
          setFilterCity("all");
          setFilterTags([]);
        }}
        categories={categories}
        cities={cities}
        tags={tags}
      />

      <PlaceDetailSheet
        place={selectedPlace}
        open={!!selectedPlace}
        onOpenChange={(open) => { if (!open) setSelectedPlace(null); }}
        onUpdated={() => { reload(); setSelectedPlace(null); }}
      />
    </div>
  );
}
