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
import { PencilIcon } from "lucide-react";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import type { Trip } from "@/lib/db/schema";
import { STATUS_COLORS, STATUS_LABELS, STATUSES } from "@/app/trips/constants";

interface TripDetailSheetProps {
  trip: Trip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}


function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function TripDetailSheet({ trip, open, onOpenChange, onUpdated }: TripDetailSheetProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    citiesRaw: string;
    startDate: string;
    endDate: string;
    status: string;
    notes: string;
  }>({ name: "", citiesRaw: "", startDate: "", endDate: "", status: "planning", notes: "" });

  function startEditing() {
    if (!trip) return;
    const cities: string[] = JSON.parse(trip.cities);
    setForm({
      name: trip.name,
      citiesRaw: cities.join(", "),
      startDate: trip.startDate ?? "",
      endDate: trip.endDate ?? "",
      status: trip.status,
      notes: trip.notes ?? "",
    });
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!trip) return;
    setLoading(true);
    try {
      const cities = JSON.stringify(
        form.citiesRaw.split(",").map((c) => c.trim()).filter(Boolean),
      );
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cities }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setEditing(false);
      onUpdated();
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(o: boolean) {
    if (!o) setEditing(false);
    onOpenChange(o);
  }

  if (!trip) return null;

  const cities: string[] = JSON.parse(trip.cities);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="px-5">
          {editing ? (
            <>
              <SheetHeader className="px-0 pt-3 pb-5">
                <SheetTitle>Edit trip</SheetTitle>
              </SheetHeader>

              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="trip-edit-name">Name *</Label>
                  <Input
                    id="trip-edit-name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="trip-edit-cities">Cities *</Label>
                  <AutocompleteInput
                    id="trip-edit-cities"
                    placeholder="Tokyo, Osaka"
                    value={form.citiesRaw}
                    onChange={(v) => set("citiesRaw", v)}
                    onSearch={async (q) => {
                      const last = q.split(",").pop()?.trim() ?? q;
                      if (last.length < 2) return [];
                      const res = await fetch(`/api/autocomplete/cities?q=${encodeURIComponent(last)}`);
                      return res.ok ? res.json() : [];
                    }}
                    onSelect={(opt) => {
                      const parts = form.citiesRaw.split(",").map((s) => s.trim()).filter(Boolean);
                      parts[parts.length - 1] = opt.value;
                      set("citiesRaw", parts.join(", "));
                    }}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple cities with commas</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => set("status", v ?? "planning")}>
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="trip-edit-start">Start date</Label>
                    <Input
                      id="trip-edit-start"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => set("startDate", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="trip-edit-end">End date</Label>
                    <Input
                      id="trip-edit-end"
                      type="date"
                      value={form.endDate}
                      onChange={(e) => set("endDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="trip-edit-notes">Notes</Label>
                  <textarea
                    id="trip-edit-notes"
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                  />
                </div>

                <SheetFooter className="px-0 pt-2 pb-4 flex-row gap-3">
                  <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={cancelEditing}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 cursor-pointer" disabled={loading}>
                    {loading ? "Saving…" : "Save changes"}
                  </Button>
                </SheetFooter>
              </form>
            </>
          ) : (
            <>
              <SheetHeader className="px-0 pt-3 pb-5">
                <div className="flex items-start justify-between gap-3 pr-6">
                  <SheetTitle className="text-left leading-snug">{trip.name}</SheetTitle>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className={`border text-xs ${STATUS_COLORS[trip.status] ?? "bg-muted text-muted-foreground"}`}>
                      {STATUS_LABELS[trip.status] ?? trip.status}
                    </Badge>
                    <button
                      onClick={startEditing}
                      className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Edit trip"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{cities.join(" · ")}</p>
              </SheetHeader>

              <div className="flex flex-col gap-5 pb-2">
                {(trip.startDate || trip.endDate) && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Dates</p>
                    <p className="text-sm">
                      {trip.startDate && formatDate(trip.startDate)}
                      {trip.startDate && trip.endDate && " – "}
                      {trip.endDate && formatDate(trip.endDate)}
                    </p>
                  </div>
                )}

                {trip.notes && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Notes</p>
                    <p className="text-sm leading-relaxed">{trip.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
