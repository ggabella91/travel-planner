"use client";

import { useState, useEffect, useCallback } from "react";
import type { Trip } from "@/lib/db/schema";

export function useTripById(id: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/trips/${id}`);
      if (!res.ok) throw new Error();
      setTrip(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { trip, loading, error, reload };
}
