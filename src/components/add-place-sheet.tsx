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
import { Label } from "@/components/ui/label";
import { PlaceForm, EMPTY_PLACE_FORM } from "@/components/place-form";
import type { PlaceFormValues } from "@/components/place-form";
import { toast } from "@/lib/toast";
import type { FoursquareSuggestion } from "@/lib/foursquare";

interface AddPlaceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
  near?: string;
}

const EMPTY_EXTERNAL = { externalId: "", externalSource: "" };

export function AddPlaceSheet({ open, onOpenChange, onAdded, near }: AddPlaceSheetProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PlaceFormValues>(EMPTY_PLACE_FORM);
  const [external, setExternal] = useState(EMPTY_EXTERNAL);
  const [duplicate, setDuplicate] = useState<{ id: string; name: string } | null>(null);
  const [nearInput, setNearInput] = useState("");

  function patchForm(patch: Partial<PlaceFormValues>) {
    setForm((f) => ({ ...f, ...patch }));
    if ("name" in patch && external.externalId) {
      setExternal(EMPTY_EXTERNAL);
      setDuplicate(null);
    }
  }

  function applyFoursquareSuggestion(suggestion: FoursquareSuggestion) {
    setDuplicate(null);
    setExternal({ externalId: suggestion.fsqId, externalSource: "foursquare" });
    setForm((f) => ({
      ...f,
      name: suggestion.name,
      city: suggestion.city,
      state: suggestion.state,
      country: suggestion.country,
      category: suggestion.category,
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
        body: JSON.stringify({ ...form, ...external }),
      });
      if (res.status === 409) {
        const data = await res.json();
        setDuplicate(data.existing);
        return;
      }
      if (!res.ok) throw new Error("Failed to save");
      setForm(EMPTY_PLACE_FORM);
      setExternal(EMPTY_EXTERNAL);
      setNearInput("");
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
      setForm(EMPTY_PLACE_FORM);
      setExternal(EMPTY_EXTERNAL);
      setDuplicate(null);
      setNearInput("");
    }
    onOpenChange(o);
  }

  const effectiveNear = near ?? (nearInput.trim() || undefined);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
        <div className="px-5">
          <SheetHeader className="px-0 pt-3 pb-5">
            <SheetTitle>Add a place</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!near && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="near-input">Destination <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="near-input"
                  placeholder="e.g. Tokyo, Medellín"
                  value={nearInput}
                  onChange={(e) => setNearInput(e.target.value)}
                />
              </div>
            )}

            <PlaceForm
              values={form}
              onChange={patchForm}
              mode="add"
              near={effectiveNear}
              duplicate={duplicate}
              onDismissDuplicate={() => {
                setDuplicate(null);
                setExternal(EMPTY_EXTERNAL);
              }}
              onFoursquareSuggestion={applyFoursquareSuggestion}
            />

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
