import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (!q) return Response.json({ error: "missing q" }, { status: 400 });

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return Response.json({ error: "not configured" }, { status: 503 });

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        next: { revalidate: 86400 },
      },
    );

    if (!res.ok) return Response.json({ error: "upstream error" }, { status: 502 });

    const data = await res.json();
    const photo = data.results?.[0];
    if (!photo) return Response.json(null);

    return Response.json({
      url: photo.urls.regular,
      color: photo.color,
      photographer: photo.user.name,
      photoLink: photo.links.html,
    });
  } catch {
    return Response.json({ error: "fetch failed" }, { status: 502 });
  }
}
