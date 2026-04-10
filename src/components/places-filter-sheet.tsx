"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, STATUS_ICONS } from "@/app/places/constants";
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_ACTIVE_CHIP_COLORS,
} from "@/lib/categories";

interface PlacesFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterStatus: string;
  filterCategory: string;
  filterCity: string;
  onFilterStatus: (v: string) => void;
  onFilterCategory: (v: string) => void;
  onFilterCity: (v: string) => void;
  filterTags: string[];
  onFilterTags: (tags: string[]) => void;
  onReset: () => void;
  categories: string[];
  cities: string[];
  tags: string[];
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        {label}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  className = "",
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? className || "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function PlacesFilterSheet({
  open,
  onOpenChange,
  filterStatus,
  filterCategory,
  filterCity,
  filterTags,
  onFilterStatus,
  onFilterCategory,
  onFilterCity,
  onFilterTags,
  onReset,
  categories,
  cities,
  tags,
}: PlacesFilterSheetProps) {
  const hasActiveFilters =
    filterStatus !== "all" || filterCategory !== "all" || filterCity !== "all" || filterTags.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[80dvh] overflow-y-auto rounded-t-2xl [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="px-5">
          <SheetHeader className="px-0 pt-3 pb-4 flex-row items-center justify-between">
            <SheetTitle>Filter places</SheetTitle>
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="cursor-pointer text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Reset all
              </button>
            )}
          </SheetHeader>

          <div className="h-px bg-gradient-to-r from-border/30 via-border to-border/30 mb-5" />

          <div className="flex flex-col gap-6">
            {/* Status */}
            <FilterSection label="Status">
              {(["all", "backlog", "visited", "skipped"] as const).map((s) => (
                <Chip key={s} active={filterStatus === s} onClick={() => onFilterStatus(s)}>
                  <span className="mr-1">{STATUS_ICONS[s]}</span>
                  {STATUS_LABELS[s]}
                </Chip>
              ))}
            </FilterSection>

            {/* Category */}
            {categories.length > 0 && (
              <FilterSection label="Type">
                <Chip active={filterCategory === "all"} onClick={() => onFilterCategory("all")}>
                  All types
                </Chip>
                {categories.map((c) => (
                  <Chip
                    key={c}
                    active={filterCategory === c}
                    className={CATEGORY_ACTIVE_CHIP_COLORS[c] ?? "bg-primary text-primary-foreground"}
                    onClick={() => onFilterCategory(c)}
                  >
                    <span className="mr-1">{CATEGORY_ICONS[c]}</span>
                    {CATEGORY_LABELS[c] ?? c}
                  </Chip>
                ))}
              </FilterSection>
            )}

            {/* City */}
            {cities.length > 1 && (
              <FilterSection label="City">
                <Chip active={filterCity === "all"} onClick={() => onFilterCity("all")}>
                  All cities
                </Chip>
                {cities.map((city) => (
                  <Chip key={city} active={filterCity === city} onClick={() => onFilterCity(city)}>
                    {city}
                  </Chip>
                ))}
              </FilterSection>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <FilterSection label="Tags">
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    active={filterTags.includes(tag)}
                    onClick={() =>
                      onFilterTags(
                        filterTags.includes(tag)
                          ? filterTags.filter((t) => t !== tag)
                          : [...filterTags, tag],
                      )
                    }
                  >
                    {tag}
                  </Chip>
                ))}
              </FilterSection>
            )}
          </div>

          <SheetFooter className="px-0 pt-6 pb-2">
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Show results
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
