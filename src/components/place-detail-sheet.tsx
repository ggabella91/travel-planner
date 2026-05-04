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
import { ExternalLinkIcon, PencilIcon, XIcon } from "lucide-react";
import type { Place } from "@/lib/db/schema";
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/categories";
import { getFlag } from "@/lib/flags";
import { SOURCE_LABELS } from "@/app/places/constants";
import { usePlacePhoto } from "@/app/places/hooks/use-place-photo";
import { toast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PlaceForm, EMPTY_PLACE_FORM } from "@/components/place-form";
import type { PlaceFormValues } from "@/components/place-form";
import { parseTags } from "@/lib/tags";

interface PlaceDetailSheetProps {
  place: Place | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function PlaceDetailSheet({ place, open, onOpenChange, onUpdated }: PlaceDetailSheetProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<PlaceFormValues>(EMPTY_PLACE_FORM);

  const photo = usePlacePhoto(place?.name, place?.city);

  function startEditing() {
    if (!place) return;
    setForm({
      name: place.name,
      city: place.city,
      state: place.state ?? "",
      country: place.country,
      category: place.category ?? "",
      source: place.source ?? "",
      notes: place.notes ?? "",
      url: place.url ?? "",
      tags: parseTags(place.tags),
      status: place.status,
      rating: place.rating ?? null,
    });
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setForm(EMPTY_PLACE_FORM);
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
      setForm(EMPTY_PLACE_FORM);
      onUpdated();
      toast.success("Place updated");
    } catch {
      toast.error("Failed to save — try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!place) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/places/${place.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setConfirmDelete(false);
      onUpdated();
      toast.success("Place deleted");
    } catch {
      toast.error("Failed to delete — try again");
    } finally {
      setDeleting(false);
    }
  }

  function handleViewOpenChange(o: boolean) {
    if (!o) setEditing(false);
    onOpenChange(o);
  }

  if (!place) return null;

  return (
    <>
      {/* View modal */}
      <Modal open={open && !editing} onOpenChange={handleViewOpenChange}>
        <ModalContent showCloseButton={!photo} className="p-0">
          {photo ? (
            <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
              <img
                src={photo.url}
                alt={place.name}
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
                  {place.name}
                </ModalTitle>
                <p className="mt-0.5 text-sm text-white/70">
                  {getFlag(place.country)} {place.city}{place.state ? `, ${place.state}` : ""}, {place.country}
                </p>
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
              <ModalTitle className="text-lg font-semibold leading-snug pr-8">{place.name}</ModalTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {getFlag(place.country)} {place.city}{place.state ? `, ${place.state}` : ""}, {place.country}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between px-5 py-3">
            {place.category ? (
              <Badge className={`border text-xs ${CATEGORY_COLORS[place.category] ?? "bg-muted text-muted-foreground"}`}>
                <span className="mr-1">{CATEGORY_ICONS[place.category]}</span>
                {CATEGORY_LABELS[place.category] ?? place.category}
              </Badge>
            ) : (
              <div />
            )}
            <button
              onClick={startEditing}
              className="cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Edit place"
            >
              <PencilIcon className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-5 pb-5">
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

            {(() => {
              const viewTags = parseTags(place.tags);
              return viewTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {viewTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null;
            })()}

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
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete place?"
        description="This will permanently remove this place from your backlog. This cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />

      {/* Edit sheet */}
      <Sheet open={open && editing} onOpenChange={(o) => { if (!o) cancelEditing(); }}>
        <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="px-5">
            <SheetHeader className="px-0 pt-3 pb-5">
              <SheetTitle>Edit place</SheetTitle>
            </SheetHeader>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <PlaceForm
                values={form}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
                mode="edit"
              />

              <SheetFooter className="px-0 pt-2 pb-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={cancelEditing}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Saving…" : "Save changes"}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete place
                </Button>
              </SheetFooter>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
