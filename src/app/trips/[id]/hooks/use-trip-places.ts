"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/db/schema";

export type TripPlace = Place & { tripPlace: { id: string; days: number[]; order: number | null; note: string | null } };

export function useTripPlaces(tripId: string) {
  const [tripPlaces, setTripPlaces] = useState<TripPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mountedRef = useRef(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/trips/${tripId}/places`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: TripPlace[]) => {
        if (!mountedRef.current) return;
        setTripPlaces(data);
        setLoading(false);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setError(true);
        setLoading(false);
      });
  }, [tripId]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, [load]);

  return { tripPlaces, loading, error, reload: load };
}
