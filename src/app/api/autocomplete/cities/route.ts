interface NominatimResult {
  name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
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
      const label =
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.name;

      if (!label) continue;
      if (seen.has(label)) continue;
      seen.add(label);

      const country = item.address?.country ?? "";

      results.push({
        label,
        value: label,
        sublabel: country,
        meta: { country },
      });

      if (results.length >= 8) break;
    }

    return Response.json(results);
  } catch {
    return Response.json([]);
  }
}
