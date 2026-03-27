"use client";

import { useEffect, useRef, useState } from "react";
import type { CityPhoto } from "@/app/trips/hooks/use-city-photo";

const cache: Record<string, CityPhoto> = {};

export function usePlacePhoto(name: string | undefined, city: string | undefined): CityPhoto {
  const query = name && city ? `${name} ${city}` : undefined;

  const [photo, setPhoto] = useState<CityPhoto>(() =>
    query !== undefined ? (cache[query] ?? null) : null,
  );
  const fetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!query) {
      setPhoto(null);
      return;
    }
    // Reset immediately so a stale photo from a previous place never lingers
    setPhoto(cache[query] ?? null);
    if (fetchedRef.current.has(query)) return;
    if (cache[query] !== undefined) return;
    fetchedRef.current.add(query);
    fetch(`/api/photos/city?q=${encodeURIComponent(query)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: CityPhoto) => {
        cache[query] = data;
        setPhoto(data);
      })
      .catch(() => {
        fetchedRef.current.delete(query);
      });
  }, [query]);

  return photo;
}
