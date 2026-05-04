const windows = new Map<string, number[]>();

/**
 * Sliding-window rate limiter. Returns true if the request is allowed.
 * In-memory only — resets on cold start, which is acceptable for a personal app.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (windows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) return false;
  hits.push(now);
  windows.set(key, hits);
  return true;
}
