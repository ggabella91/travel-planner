"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Trip } from "@/lib/db/schema";

export type TripWithStats = Trip & { placeCount: number };

let cache: TripWithStats[] | null = null;

export function invalidateTripsCache() { cache = null; }

export function useTrips() {
  const [trips, setTrips] = useState<TripWithStats[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState(false);
  const mountedRef = useRef(true);

  const load = useCallback(() => {
    setError(false);
    fetch("/api/trips")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: TripWithStats[]) => {
        if (!mountedRef.current) return;
        cache = data;
        setTrips(data);
        setLoading(false);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, [load]);

  return { trips, loading, error, reload: load };
}
