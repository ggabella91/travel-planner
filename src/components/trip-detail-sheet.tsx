"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Modal, ModalClose, ModalContent, ModalTitle } from "@/components/ui/modal";
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
import { PencilIcon, XIcon } from "lucide-react";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import type { Trip } from "@/lib/db/schema";
import { STATUS_COLORS, STATUS_LABELS, STATUSES } from "@/app/trips/constants";
import { useCityPhoto } from "@/app/trips/hooks/use-city-photo";

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

  const cities: string[] = trip ? JSON.parse(trip.cities) : [];
  const photo = useCityPhoto(cities[0]);

  function startEditing() {
    if (!trip) return;
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
      const citiesJson = JSON.stringify(
        form.citiesRaw.split(",").map((c) => c.trim()).filter(Boolean),
      );
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cities: citiesJson }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setEditing(false);
      onUpdated();
    } finally {
      setLoading(false);
    }
  }

  function handleViewOpenChange(o: boolean) {
    if (!o) setEditing(false);
    onOpenChange(o);
  }

  if (!trip) return null;

  return (
    <>
      {/* View modal */}
      <Modal open={open && !editing} onOpenChange={handleViewOpenChange}>
        <ModalContent showCloseButton={!photo} className="p-0">
          {photo ? (
            <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
              <img
                src={photo.url}
                alt={cities[0]}
                className="h-full w-full object-cover"
                style={{ backgroundColor: photo.color }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
              <ModalClose
                render={
                  <button className="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/50" />
                }
              >
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </ModalClose>
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                <ModalTitle className="text-xl font-bold leading-tight text-white">
                  {trip.name}
                </ModalTitle>
                <p className="mt-0.5 text-sm text-white/70">{cities.join(" · ")}</p>
                <a
                  href={photo.photoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-[10px] text-white/40 transition-colors hover:text-white/70"
                >
                  {photo.photographer} / Unsplash
                </a>
              </div>
            </div>
          ) : (
            <div className="px-5 pt-5 pb-0">
              <ModalTitle className="text-lg font-semibold leading-snug pr-8">{trip.name}</ModalTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">{cities.join(" · ")}</p>
            </div>
          )}

          <div className="flex items-center justify-between px-5 py-3">
            <Badge className={`border text-xs ${STATUS_COLORS[trip.status] ?? "bg-muted text-muted-foreground"}`}>
              {STATUS_LABELS[trip.status] ?? trip.status}
            </Badge>
            <button
              onClick={startEditing}
              className="cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Edit trip"
            >
              <PencilIcon className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-5 pb-5">
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
        </ModalContent>
      </Modal>

      {/* Edit sheet */}
      <Sheet open={open && editing} onOpenChange={(o) => { if (!o) { cancelEditing(); } }}>
        <SheetContent
          side="bottom"
          className="max-h-[90dvh] overflow-y-auto rounded-t-2xl [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <div className="px-5">
            <SheetHeader className="px-0 pt-3 pb-4">
              <SheetTitle>Edit trip</SheetTitle>
            </SheetHeader>
            <div className="h-px bg-gradient-to-r from-border/30 via-border to-border/30 mb-5" />

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
                  <Input id="trip-edit-start" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="trip-edit-end">End date</Label>
                  <Input id="trip-edit-end" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trip-edit-notes">Notes</Label>
                <textarea
                  id="trip-edit-notes"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
