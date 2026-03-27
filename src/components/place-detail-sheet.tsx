"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLinkIcon, PencilIcon, XIcon } from "lucide-react";
import type { Place } from "@/lib/db/schema";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/categories";

interface PlaceDetailSheetProps {
  place: Place | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  reddit: "Reddit",
  friend: "Friend",
};

const CATEGORIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "cafe", label: "Cafe" },
  { value: "neighborhood", label: "Neighborhood" },
  { value: "activity", label: "Activity" },
  { value: "spot", label: "Spot" },
];

const SOURCES = [
  { value: "instagram", label: "Instagram" },
  { value: "reddit", label: "Reddit" },
  { value: "friend", label: "Friend" },
];

const STATUSES = [
  { value: "backlog", label: "Backlog" },
  { value: "visited", label: "Visited" },
  { value: "skipped", label: "Skipped" },
];

const RATINGS = [1, 2, 3, 4, 5];

export function PlaceDetailSheet({ place, open, onOpenChange, onUpdated }: PlaceDetailSheetProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Place>>({});

  function startEditing() {
    if (!place) return;
    setForm({
      name: place.name,
      city: place.city,
      country: place.country,
      category: place.category ?? "",
      source: place.source ?? "",
      notes: place.notes ?? "",
      url: place.url ?? "",
      status: place.status,
      rating: place.rating ?? undefined,
    });
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setForm({});
  }

  function set(field: keyof Place, value: string | number | null) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!place) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/places/${place.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      setEditing(false);
      setForm({});
      onUpdated();
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(o: boolean) {
    if (!o) {
      setEditing(false);
      setForm({});
    }
    onOpenChange(o);
  }

  if (!place) return null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="px-5">
          {editing ? (
            <>
              <SheetHeader className="px-0 pt-3 pb-5">
                <div className="flex items-center justify-between pr-6">
                  <SheetTitle>Edit place</SheetTitle>
                  <button
                    onClick={cancelEditing}
                    className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Cancel edit"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              </SheetHeader>

              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={form.name ?? ""}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-city">City *</Label>
                    <Input
                      id="edit-city"
                      value={form.city ?? ""}
                      onChange={(e) => set("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-country">Country *</Label>
                    <Input
                      id="edit-country"
                      value={form.country ?? ""}
                      onChange={(e) => set("country", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label>Category</Label>
                    <Select value={form.category ?? ""} onValueChange={(v) => set("category", v ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pick one" />
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
                    <Select value={form.source ?? ""} onValueChange={(v) => set("source", v ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Where from?" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label>Status</Label>
                    <Select value={form.status ?? "backlog"} onValueChange={(v) => set("status", v ?? "backlog")}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.status === "visited" && (
                    <div className="flex flex-col gap-1.5">
                      <Label>Rating</Label>
                      <Select
                        value={form.rating ? String(form.rating) : ""}
                        onValueChange={(v) => set("rating", v ? Number(v) : null)}
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

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <textarea
                    id="edit-notes"
                    value={form.notes ?? ""}
                    onChange={(e) => set("notes", e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-url">Link</Label>
                  <Input
                    id="edit-url"
                    type="url"
                    placeholder="https://..."
                    value={form.url ?? ""}
                    onChange={(e) => set("url", e.target.value)}
                  />
                </div>

                <SheetFooter className="px-0 pt-2 pb-4">
                  <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                    {loading ? "Saving…" : "Save changes"}
                  </Button>
                </SheetFooter>
              </form>
            </>
          ) : (
            <>
              <SheetHeader className="px-0 pt-3 pb-5">
                <div className="flex items-start justify-between gap-3 pr-6">
                  <SheetTitle className="text-left leading-snug">{place.name}</SheetTitle>
                  <div className="flex shrink-0 items-center gap-2">
                    {place.category && (
                      <Badge className={`border text-xs ${CATEGORY_COLORS[place.category] ?? "bg-muted text-muted-foreground"}`}>
                        {CATEGORY_LABELS[place.category] ?? place.category}
                      </Badge>
                    )}
                    <button
                      onClick={startEditing}
                      className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Edit place"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {place.city}, {place.country}
                </p>
              </SheetHeader>

              <div className="flex flex-col gap-5 pb-2">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Status</p>
                    <p className="text-sm capitalize">{place.status}</p>
                  </div>
                  {place.rating && (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Rating</p>
                      <p className="text-sm">{place.rating} / 5</p>
                    </div>
                  )}
                </div>

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
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
