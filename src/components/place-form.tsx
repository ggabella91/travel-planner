"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircleIcon } from "lucide-react";
import { TagInput } from "@/components/tag-input";
import { CATEGORIES, SOURCES, STATUSES, RATINGS } from "@/app/places/constants";
import { CATEGORY_ICONS } from "@/lib/categories";
import type { FoursquareSuggestion } from "@/lib/foursquare";

export interface PlaceFormValues {
  name: string;
  city: string;
  state: string;
  country: string;
  category: string;
  source: string;
  notes: string;
  url: string;
  tags: string[];
  status: string;
  rating: number | null;
}

export const EMPTY_PLACE_FORM: PlaceFormValues = {
  name: "",
  city: "",
  state: "",
  country: "",
  category: "",
  source: "",
  notes: "",
  url: "",
  tags: [],
  status: "backlog",
  rating: null,
};

interface PlaceFormProps {
  values: PlaceFormValues;
  onChange: (patch: Partial<PlaceFormValues>) => void;
  mode: "add" | "edit";
  // add-mode only
  near?: string;
  duplicate?: { id: string; name: string } | null;
  onDismissDuplicate?: () => void;
  onFoursquareSuggestion?: (suggestion: FoursquareSuggestion) => void;
}

export function PlaceForm({
  values,
  onChange,
  mode,
  near,
  duplicate,
  onDismissDuplicate,
  onFoursquareSuggestion,
}: PlaceFormProps) {
  return (
    <>
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="place-name">Name *</Label>
        {mode === "add" ? (
          <AutocompleteInput
            id="place-name"
            placeholder="e.g. Ichiran Ramen, Tokyo"
            value={values.name}
            onChange={(v) => onChange({ name: v })}
            onSearch={async (q) => {
              if (q.length < 2) return [];
              const url = `/api/autocomplete/places?q=${encodeURIComponent(q)}${near ? `&near=${encodeURIComponent(near)}` : ""}`;
              const res = await fetch(url);
              if (!res.ok) return [];
              const suggestions: FoursquareSuggestion[] = await res.json();
              return suggestions.map((s) => ({
                value: s.name,
                label: `${CATEGORY_ICONS[s.category] ?? "📍"} ${s.name}`,
                sublabel: [s.city, s.country].filter(Boolean).join(", "),
                meta: { suggestion: s },
              }));
            }}
            onSelect={(opt) => {
              if (opt.meta?.suggestion && onFoursquareSuggestion) {
                onFoursquareSuggestion(opt.meta.suggestion as FoursquareSuggestion);
              }
            }}
            debounceMs={500}
            required
            autoFocus
          />
        ) : (
          <Input
            id="place-name"
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value })}
            required
          />
        )}
      </div>

      {/* Duplicate warning (add mode) */}
      {mode === "add" && duplicate && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2.5">
          <AlertCircleIcon className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            You already saved <span className="font-medium">{duplicate.name}</span>.{" "}
            <button
              type="button"
              onClick={onDismissDuplicate}
              className="underline cursor-pointer"
            >
              Save anyway
            </button>
          </p>
        </div>
      )}

      {/* City + State */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="place-city">City *</Label>
          <AutocompleteInput
            id="place-city"
            placeholder="Tokyo"
            value={values.city}
            onChange={(v) => onChange({ city: v })}
            onSearch={async (q) => {
              const res = await fetch(`/api/autocomplete/cities?q=${encodeURIComponent(q)}`);
              return res.ok ? res.json() : [];
            }}
            onSelect={(opt) => {
              const patch: Partial<PlaceFormValues> = { city: opt.value };
              if (opt.meta?.state) patch.state = opt.meta.state as string;
              if (opt.meta?.country && !values.country) patch.country = opt.meta.country as string;
              onChange(patch);
            }}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="place-state">State / Province</Label>
          <Input
            id="place-state"
            placeholder={mode === "add" ? "e.g. Osaka Prefecture" : "Optional"}
            value={values.state}
            onChange={(e) => onChange({ state: e.target.value })}
          />
        </div>
      </div>

      {/* Country */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="place-country">Country *</Label>
        <AutocompleteInput
          id="place-country"
          placeholder="Japan"
          value={values.country}
          onChange={(v) => onChange({ country: v })}
          onSearch={async (q) => {
            const res = await fetch(`/api/autocomplete/countries?q=${encodeURIComponent(q)}`);
            return res.ok ? res.json() : [];
          }}
          onSelect={(opt) => onChange({ country: opt.value })}
          required
        />
      </div>

      {/* Category + Source */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Category</Label>
          <Select value={values.category} onValueChange={(v) => onChange({ category: v ?? "" })}>
            <SelectTrigger className="w-full">
              <SelectValue className="capitalize" placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Source</Label>
          <Select value={values.source} onValueChange={(v) => onChange({ source: v ?? "" })}>
            <SelectTrigger className="w-full">
              <SelectValue className="capitalize" placeholder="Where from?" />
            </SelectTrigger>
            <SelectContent>
              {SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status + Rating (edit mode only) */}
      {mode === "edit" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select
              value={values.status}
              onValueChange={(v) => {
                const patch: Partial<PlaceFormValues> = { status: v ?? "backlog" };
                if (v !== "visited") patch.rating = null;
                onChange(patch);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue className="capitalize" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {values.status === "visited" && (
            <div className="flex flex-col gap-1.5">
              <Label>Rating</Label>
              <Select
                value={values.rating ? String(values.rating) : ""}
                onValueChange={(v) => onChange({ rating: v ? Number(v) : null })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="1–5" />
                </SelectTrigger>
                <SelectContent>
                  {RATINGS.map((r) => (
                    <SelectItem key={r} value={String(r)}>{r} / 5</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="place-notes">Notes</Label>
        <textarea
          id="place-notes"
          placeholder="Why it was recommended, what to order, etc."
          value={values.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <Label>Tags</Label>
        <TagInput value={values.tags} onChange={(tags) => onChange({ tags })} />
      </div>

      {/* URL */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="place-url">Link</Label>
        <Input
          id="place-url"
          type="url"
          placeholder="https://..."
          value={values.url}
          onChange={(e) => onChange({ url: e.target.value })}
        />
      </div>
    </>
  );
}
