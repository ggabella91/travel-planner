"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/db/schema";

let cache: Place[] | null = null;

export function invalidatePlacesCache() { cache = null; }

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState(false);
  const mountedRef = useRef(true);

  const load = useCallback(() => {
    setError(false);
    fetch("/api/places")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Place[]) => {
        if (!mountedRef.current) return;
        cache = data;
        setPlaces(data);
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

  return { places, loading, error, reload: load };
}
