"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ExternalLinkIcon } from "lucide-react";
import type { Place } from "@/lib/db/schema";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/categories";

interface PlaceDetailSheetProps {
  place: Place | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  reddit: "Reddit",
  friend: "Friend",
};

export function PlaceDetailSheet({ place, open, onOpenChange }: PlaceDetailSheetProps) {
  if (!place) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="px-5">
          <SheetHeader className="px-0 pt-3 pb-5">
            <div className="flex items-start justify-between gap-3 pr-6">
              <SheetTitle className="text-left leading-snug">{place.name}</SheetTitle>
              {place.category && (
                <Badge className={`mt-0.5 shrink-0 border text-xs ${CATEGORY_COLORS[place.category] ?? "bg-muted text-muted-foreground"}`}>
                  {CATEGORY_LABELS[place.category] ?? place.category}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {place.city}, {place.country}
            </p>
          </SheetHeader>

          <div className="flex flex-col gap-5 pb-2">
            {place.notes && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Notes</p>
                <p className="text-sm leading-relaxed">{place.notes}</p>
              </div>
            )}

            {place.source && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Source</p>
                <p className="text-sm">{SOURCE_LABELS[place.source] ?? place.source}</p>
              </div>
            )}

            {place.url && (
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted active:bg-muted"
              >
                <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-muted-foreground">{place.url}</span>
              </a>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
