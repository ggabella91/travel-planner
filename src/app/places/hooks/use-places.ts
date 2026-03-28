"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/db/schema";

let cache: Place[] | null = null;

export function invalidatePlacesCache() { cache = null; }

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const mountedRef = useRef(true);

  const load = useCallback(() => {
    fetch("/api/places")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Place[] | null) => {
        if (!mountedRef.current) return;
        if (data) {
          cache = data;
          setPlaces(data);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, [load]);

  return { places, loading, reload: load };
}
