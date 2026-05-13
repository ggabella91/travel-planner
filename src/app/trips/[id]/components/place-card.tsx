"use client";

import { useState, useRef, useEffect } from "react";
import {
  CalendarPlusIcon,
  CheckIcon,
  GripVerticalIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CATEGORY_ICONS } from "@/lib/categories";
import { getFlag } from "@/lib/flags";
import type { Trip } from "@/lib/db/schema";
import type { TripPlace } from "../hooks/use-trip-places";
import { dayLabel } from "../utils";

function PlaceCard({
  place,
  trip,
  numDays,
  currentDay,
  onDaysChange,
  onRemove,
  onNoteChange,
  dragHandleProps,
}: {
  place: TripPlace;
  trip: Trip;
  numDays: number;
  currentDay: number | null;
  onDaysChange: (placeId: string, days: number[]) => Promise<void>;
  onRemove: (placeId: string) => void;
  onNoteChange?: (placeId: string, note: string | null) => Promise<void>;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const assignedDays = place.tripPlace.days;
  const isUnscheduled = currentDay === null;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pending, setPending] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteValue, setNoteValue] = useState(place.tripPlace.note ?? "");
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    setNoteValue(place.tripPlace.note ?? "");
  }, [place.tripPlace.note]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setPending([]);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function openDropdown() {
    setPending([]);
    setDropdownOpen(true);
  }

  function togglePending(d: number) {
    setPending((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  async function confirmAdd() {
    if (pending.length === 0) return;
    setSaving(true);
    try {
      await onDaysChange(place.id, [...assignedDays, ...pending].sort((a, b) => a - b));
      setDropdownOpen(false);
      setPending([]);
    } finally {
      setSaving(false);
    }
  }

  async function removeDay(d: number) {
    setSaving(true);
    try {
      await onDaysChange(place.id, assignedDays.filter((x) => x !== d));
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!onNoteChange) return;
    setNoteSaving(true);
    try {
      await onNoteChange(place.id, noteValue.trim() || null);
    } finally {
      setNoteSaving(false);
      setNoteOpen(false);
    }
  }

  const availableDays = Array.from({ length: numDays }, (_, i) => i + 1).filter(
    (d) => !assignedDays.includes(d),
  );

  return (
    <li className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 px-3 py-3">
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            className="cursor-grab shrink-0 touch-none text-muted-foreground/30 hover:text-muted-foreground/60 active:cursor-grabbing"
            aria-label="Drag to reorder"
            tabIndex={-1}
          >
            <GripVerticalIcon className="size-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug truncate">{place.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {place.category && <span className="mr-1">{CATEGORY_ICONS[place.category]}</span>}
            {getFlag(place.country)} {place.city}
          </p>
        </div>
        <button
          onClick={() => onRemove(place.id)}
          className="cursor-pointer shrink-0 rounded-full p-1.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Remove from trip"
        >
          <Trash2Icon className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
        {isUnscheduled ? (
          assignedDays.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 pl-2.5 pr-1.5 py-0.5 text-xs font-medium text-primary"
            >
              Day {d}{trip.startDate ? ` · ${dayLabel(d, trip, "short")}` : ""}
              <button
                type="button"
                onClick={() => removeDay(d)}
                disabled={saving}
                className="cursor-pointer rounded-full p-0.5 hover:bg-primary/20 transition-colors disabled:opacity-50"
                aria-label={`Remove day ${d}`}
              >
                <XIcon className="size-2.5" />
              </button>
            </span>
          ))
        ) : (
          (() => {
            const otherDays = assignedDays.filter((d) => d !== currentDay);
            return otherDays.length > 0 ? (
              <span className="text-xs text-muted-foreground/60">
                Also Day {otherDays.join(", Day ")}
              </span>
            ) : null;
          })()
        )}

        {availableDays.length > 0 && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={openDropdown}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/30 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary cursor-pointer disabled:opacity-50"
            >
              <CalendarPlusIcon className="size-3" />
              Add day
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-48 rounded-xl border bg-popover shadow-lg">
                <div className="max-h-44 overflow-y-auto">
                  {availableDays.map((d) => {
                    const selected = pending.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => togglePending(d)}
                        className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-xs transition-colors ${selected ? "bg-primary/8 text-primary" : "hover:bg-accent text-foreground"}`}
                      >
                        <span className="font-medium">
                          Day {d}{trip.startDate ? ` · ${dayLabel(d, trip, "medium")}` : ""}
                        </span>
                        {selected && <CheckIcon className="size-3 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t p-2">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={confirmAdd}
                    disabled={pending.length === 0 || saving}
                    className="w-full cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {saving ? "Saving…" : `Add ${pending.length > 0 ? pending.length : ""} day${pending.length !== 1 ? "s" : ""}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline note */}
      {onNoteChange && (
        <div className="border-t border-border/30 px-4 py-2">
          {noteOpen ? (
            <textarea
              autoFocus
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              onBlur={saveNote}
              onKeyDown={(e) => { if (e.key === "Escape") { setNoteValue(place.tripPlace.note ?? ""); setNoteOpen(false); } }}
              rows={2}
              disabled={noteSaving}
              placeholder="Note for this stop…"
              className="w-full resize-none rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/50 disabled:opacity-50"
            />
          ) : (
            <button
              type="button"
              onClick={() => setNoteOpen(true)}
              className="w-full cursor-pointer text-left text-xs"
            >
              {place.tripPlace.note ? (
                <span className="line-clamp-1 text-muted-foreground">{place.tripPlace.note}</span>
              ) : (
                <span className="text-muted-foreground/35 hover:text-muted-foreground/60 transition-colors">+ note</span>
              )}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function SortablePlaceCard(props: Parameters<typeof PlaceCard>[0]) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.place.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <PlaceCard {...props} dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>} />
    </div>
  );
}

export function PlaceList({
  places,
  trip,
  numDays,
  currentDay,
  onDaysChange,
  onRemove,
  onNoteChange,
  onReorder,
}: {
  places: TripPlace[];
  trip: Trip;
  numDays: number;
  currentDay: number | null;
  onDaysChange: (placeId: string, days: number[]) => Promise<void>;
  onRemove: (placeId: string) => void;
  onNoteChange?: (placeId: string, note: string | null) => Promise<void>;
  onReorder?: (orderedPlaceIds: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = places.findIndex((p) => p.id === String(active.id));
    const newIndex = places.findIndex((p) => p.id === String(over.id));
    const reordered = arrayMove(places, oldIndex, newIndex);
    onReorder?.(reordered.map((p) => p.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={places.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {places.map((place) => (
            <SortablePlaceCard
              key={place.id}
              place={place}
              trip={trip}
              numDays={numDays}
              currentDay={currentDay}
              onDaysChange={onDaysChange}
              onRemove={onRemove}
              onNoteChange={onNoteChange}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
