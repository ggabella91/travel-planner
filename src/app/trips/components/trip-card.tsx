"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Trip } from "@/lib/db/schema";
import { useCityPhoto } from "../hooks/use-city-photo";
import { STATUS_COLORS, STATUS_LABELS, STATUS_ICONS, STATUS_CARD_ACCENT } from "../constants";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const cities: string[] = JSON.parse(trip.cities);
  const photo = useCityPhoto(cities[0]);

  return (
    <li className={`relative overflow-hidden rounded-xl border bg-card shadow transition-all active:opacity-80 border-l-4 ${STATUS_CARD_ACCENT[trip.status] ?? ""}`}>
      {photo && (
        <a
          href={photo.photoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-[6.5rem] right-2 z-10 text-[10px] text-white/60 transition-colors hover:text-white/90"
        >
          {photo.photographer} / Unsplash
        </a>
      )}
      <Link href={`/trips/${trip.id}`} className="block">
        {photo && (
          <div className="relative h-32 w-full overflow-hidden">
            <img
              src={photo.url}
              alt={cities[0]}
              className="h-full w-full object-cover"
              style={{ backgroundColor: photo.color }}
            />
          </div>
        )}
        <div className="px-4 py-4">
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium leading-snug">{trip.name}</span>
            <Badge className={`mt-0.5 shrink-0 border text-xs ${STATUS_COLORS[trip.status] ?? "bg-muted text-muted-foreground"}`}>
              <span className="mr-1">{STATUS_ICONS[trip.status]}</span>
              {STATUS_LABELS[trip.status] ?? trip.status}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{cities.join(" · ")}</p>
          {(trip.startDate || trip.endDate) && (
            <p className="mt-1 text-xs text-muted-foreground/70">
              {trip.startDate && formatDate(trip.startDate)}
              {trip.startDate && trip.endDate && " – "}
              {trip.endDate && formatDate(trip.endDate)}
            </p>
          )}
          {trip.notes && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {trip.notes}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
