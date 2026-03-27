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
    if (!city) return;
    if (fetchedRef.current.has(city)) return;
    if (cache[city] !== undefined) {
      setPhoto(cache[city]);
      return;
    }
    fetchedRef.current.add(city);
    fetch(`/api/photos/city?q=${encodeURIComponent(city)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CityPhoto) => {
        cache[city] = data;
        setPhoto(data);
      })
      .catch(() => {});
  }, [city]);

  return photo;
}
