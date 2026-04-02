import type { NextRequest } from "next/server";
import { mapFoursquareCategory, resolveCountryCode } from "@/lib/foursquare";
import { CATEGORY_ICONS } from "@/lib/categories";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return Response.json([]);

  const apiKey = process.env.FOURSQUARE_API_KEY;
  if (!apiKey) return Response.json({ error: "Foursquare API key not configured" }, { status: 500 });

  // Optional explicit near param (e.g. from trip context) overrides comma-parsing
  const nearParam = req.nextUrl.searchParams.get("near")?.trim() ?? "";

  // Split "Place Name, City" into search query + location hint
  const commaIdx = q.lastIndexOf(",");
  const query = commaIdx > 0 ? q.slice(0, commaIdx).trim() : q;
  const near = nearParam || (commaIdx > 0 ? q.slice(commaIdx + 1).trim() : "");

  const url = new URL("https://places-api.foursquare.com/places/search");
  url.searchParams.set("query", query);
  url.searchParams.set("fields", "fsq_place_id,name,location,categories");
  url.searchParams.set("limit", "8");
  if (near) url.searchParams.set("near", near);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Places-Api-Version": "2025-06-17",
      Accept: "application/json",
      "Accept-Language": "en",
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error("Foursquare error:", res.status, await res.text());
    return Response.json([]);
  }

  const data = await res.json();
  const results = (data.results ?? []) as Array<{
    fsq_place_id: string;
    name: string;
    categories?: Array<{ name: string; short_name?: string }>;
    location?: {
      locality?: string;
      region?: string;
      country?: string;
    };
  }>;

  const suggestions = results.map((place) => {
    const category = mapFoursquareCategory(place.categories);
    const country = resolveCountryCode(place.location?.country);
    const locality = place.location?.locality ?? "";
    // Prefer the user-typed near value as city — it's already in English.
    // Fall back to locality only when no near was provided.
    const city = near || locality;
    // Only use region if it's Latin script (skip Japanese/Chinese/etc.)
    const region = place.location?.region ?? "";
    const state = /^[\u0000-\u024F]+$/.test(region) ? region : "";
    return {
      fsqId: place.fsq_place_id,
      name: place.name,
      city,
      state,
      country,
      category,
      categoryIcon: CATEGORY_ICONS[category] ?? "📍",
      categoryLabel: place.categories?.[0]?.short_name ?? place.categories?.[0]?.name ?? "",
    };
  });

  return Response.json(suggestions);
}
