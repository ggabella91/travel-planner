"use client";

import { useState, useEffect, useCallback } from "react";
import type { Trip } from "@/lib/db/schema";

export function useTripById(id: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${id}`);
      if (!res.ok) { setTrip(null); return; }
      setTrip(await res.json());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { trip, loading, reload };
}
