"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircleIcon } from "lucide-react";

import { CATEGORIES, SOURCES } from "@/app/places/constants";
import { toast } from "@/lib/toast";
import type { FoursquareSuggestion } from "@/lib/foursquare";
import { CATEGORY_ICONS } from "@/lib/categories";

interface AddPlaceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

const EMPTY_FORM = {
  name: "",
  city: "",
  state: "",
  country: "",
  category: "",
  source: "",
  notes: "",
  url: "",
  externalId: "",
  externalSource: "",
};

export function AddPlaceSheet({ open, onOpenChange, onAdded }: AddPlaceSheetProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [duplicate, setDuplicate] = useState<{ id: string; name: string } | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function applyFoursquareSuggestion(suggestion: FoursquareSuggestion) {
    setDuplicate(null);
    setForm((f) => ({
      ...f,
      name: suggestion.name,
      city: suggestion.city,
      state: suggestion.state,
      country: suggestion.country,
      category: suggestion.category,
      externalId: suggestion.fsqId,
      externalSource: "foursquare",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDuplicate(null);
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 409) {
        const data = await res.json();
        setDuplicate(data.existing);
        return;
      }
      if (!res.ok) throw new Error("Failed to save");
      setForm(EMPTY_FORM);
      onOpenChange(false);
      onAdded();
      toast.success("Place saved");
    } catch {
      toast.error("Failed to save — try again");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(o: boolean) {
    if (!o) {
      setForm(EMPTY_FORM);
      setDuplicate(null);
    }
    onOpenChange(o);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
        <div className="px-5">
          <SheetHeader className="px-0 pt-3 pb-5">
            <SheetTitle>Add a place</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name *</Label>
              <AutocompleteInput
                id="name"
                placeholder="e.g. Ichiran Ramen, Tokyo"
                value={form.name}
                onChange={(v) => {
                  set("name", v);
                  // clear foursquare binding if user edits after selection
                  if (form.externalId) setForm((f) => ({ ...f, name: v, externalId: "", externalSource: "" }));
                  setDuplicate(null);
                }}
                onSearch={async (q) => {
                  if (q.length < 2) return [];
                  const res = await fetch(`/api/autocomplete/places?q=${encodeURIComponent(q)}`);
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
                  if (opt.meta?.suggestion) {
                    applyFoursquareSuggestion(opt.meta.suggestion as FoursquareSuggestion);
                  }
                }}
                debounceMs={500}
                required
                autoFocus
              />
            </div>

            {duplicate && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2.5">
                <AlertCircleIcon className="size-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  You already saved <span className="font-medium">{duplicate.name}</span>.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setDuplicate(null);
                      setForm((f) => ({ ...f, externalId: "", externalSource: "" }));
                    }}
                    className="underline cursor-pointer"
                  >
                    Save anyway
                  </button>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City *</Label>
                <AutocompleteInput
                  id="city"
                  placeholder="Tokyo"
                  value={form.city}
                  onChange={(v) => set("city", v)}
                  onSearch={async (q) => {
                    const res = await fetch(`/api/autocomplete/cities?q=${encodeURIComponent(q)}`);
                    return res.ok ? res.json() : [];
                  }}
                  onSelect={(opt) => {
                    set("city", opt.value);
                    if (opt.meta?.state) set("state", opt.meta.state as string);
                    if (opt.meta?.country && !form.country) set("country", opt.meta.country as string);
                  }}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  placeholder="e.g. Osaka Prefecture"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="country">Country *</Label>
              <AutocompleteInput
                id="country"
                placeholder="Japan"
                value={form.country}
                onChange={(v) => set("country", v)}
                onSearch={async (q) => {
                  const res = await fetch(`/api/autocomplete/countries?q=${encodeURIComponent(q)}`);
                  return res.ok ? res.json() : [];
                }}
                onSelect={(opt) => set("country", opt.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue className="capitalize" placeholder="Pick one" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Source</Label>
                <Select value={form.source} onValueChange={(v) => set("source", v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue className="capitalize" placeholder="Where from?" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                placeholder="Why it was recommended, what to order, etc."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="url">Link</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => set("url", e.target.value)}
              />
            </div>

            <SheetFooter className="px-0 pt-2 pb-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving…" : "Save place"}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
