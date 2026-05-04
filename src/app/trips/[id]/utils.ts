import type { Trip } from "@/lib/db/schema";

export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function dayLabel(day: number, trip: Trip, format: "full" | "short" | "medium" = "full") {
  if (!trip.startDate) return `Day ${day}`;
  const [y, m, d] = trip.startDate.split("-").map(Number);
  const date = new Date(y, m - 1, d + day - 1);
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  if (format === "short") return dateStr;
  if (format === "medium") return `${weekday}, ${dateStr}`;
  return `Day ${day} · ${weekday}, ${dateStr}`;
}
