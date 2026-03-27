"use client";

import { useEffect, useRef, useState } from "react";

export type CityPhoto = {
  url: string;
  color: string;
  photographer: string;
  photoLink: string;
} | null;

const cache: Record<string, CityPhoto> = {};

export function useCityPhoto(city: string | undefined): CityPhoto {
  const [photo, setPhoto] = useState<CityPhoto>(() =>
    city !== undefined ? (cache[city] ?? null) : null,
  );
  const fetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!city) {
      setPhoto(null);
      return;
    }
    // Reset immediately so a stale photo from a previous trip never lingers
    setPhoto(cache[city] ?? null);
    if (fetchedRef.current.has(city)) return;
    if (cache[city] !== undefined) return;
    fetchedRef.current.add(city);
    fetch(`/api/photos/city?q=${encodeURIComponent(city)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: CityPhoto) => {
        cache[city] = data;
        setPhoto(data);
      })
      .catch(() => {
        // do not cache failures — key may not be configured yet, or request may be transient
        fetchedRef.current.delete(city);
      });
  }, [city]);

  return photo;
}
