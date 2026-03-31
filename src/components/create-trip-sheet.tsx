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
import { toast } from "@/lib/toast";

interface CreateTripSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateTripSheet({ open, onOpenChange, onCreated }: CreateTripSheetProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", startDate: "", endDate: "" });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create trip");
      setForm({ name: "", city: "", startDate: "", endDate: "" });
      onOpenChange(false);
      onCreated();
      toast.success("Trip created");
    } catch {
      toast.error("Failed to create trip — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
        <div className="px-5">
          <SheetHeader className="px-0 pt-3 pb-5">
            <SheetTitle>New trip</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trip-name">Name *</Label>
              <Input
                id="trip-name"
                placeholder="e.g. Japan 2025"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trip-city">City *</Label>
              <AutocompleteInput
                id="trip-city"
                placeholder="e.g. Tokyo"
                value={form.city}
                onChange={(v) => set("city", v)}
                onSearch={async (q) => {
                  const res = await fetch(`/api/autocomplete/cities?q=${encodeURIComponent(q)}`);
                  return res.ok ? res.json() : [];
                }}
                onSelect={(opt) => set("city", opt.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trip-start">Start date</Label>
                <Input
                  id="trip-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trip-end">End date</Label>
                <Input
                  id="trip-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                />
              </div>
            </div>

            <SheetFooter className="px-0 pt-2 pb-4">
              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading ? "Creating…" : "Create trip"}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
