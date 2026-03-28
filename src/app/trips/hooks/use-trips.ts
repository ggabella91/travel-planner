"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Trip } from "@/lib/db/schema";

let cache: Trip[] | null = null;

export function invalidateTripsCache() { cache = null; }

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const mountedRef = useRef(true);

  const load = useCallback(() => {
    fetch("/api/trips")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Trip[] | null) => {
        if (!mountedRef.current) return;
        if (data) {
          cache = data;
          setTrips(data);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, [load]);

  return { trips, loading, reload: load };
}
