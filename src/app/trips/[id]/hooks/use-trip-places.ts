"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/db/schema";

export type TripPlace = Place & { tripPlace: { id: string; days: number[]; order: number | null; note: string | null } };

export function useTripPlaces(tripId: string) {
  const [tripPlaces, setTripPlaces] = useState<TripPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/trips/${tripId}/places`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: TripPlace[] | null) => {
        if (!mountedRef.current) return;
        if (data) setTripPlaces(data);
        setLoading(false);
      });
  }, [tripId]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, [load]);

  return { tripPlaces, loading, reload: load };
}
