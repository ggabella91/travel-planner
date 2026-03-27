interface NominatimResult {
  name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    province?: string;
    region?: string;
    county?: string;
    country?: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  if (q.length < 2) {
    return Response.json([]);
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=1&dedupe=1`,
      {
        headers: {
          "User-Agent": "TravelPlannerApp/1.0",
          "Accept-Language": "en",
        },
      },
    );
    if (!res.ok) return Response.json([]);

    const data: NominatimResult[] = await res.json();

    const seen = new Set<string>();
    const results: Array<{
      label: string;
      value: string;
      sublabel: string;
      meta: { country: string };
    }> = [];

    for (const item of data) {
      // only include actual populated places, not counties/regions
      const city =
        item.address?.city ||
        item.address?.town ||
        item.address?.village;

      if (!city) continue;

      const state =
        item.address?.state ||
        item.address?.province ||
        item.address?.region ||
        item.address?.county ||
        "";

      const country = item.address?.country ?? "";

      const dedupeKey = [city, state, country].join("|");
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const sublabelParts = [state, country].filter(Boolean);

      results.push({
        label: city,
        value: city,
        sublabel: sublabelParts.join(", "),
        meta: { country, state },
      });

      if (results.length >= 8) break;
    }

    return Response.json(results);
  } catch {
    return Response.json([]);
  }
}
