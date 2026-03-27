export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  if (q.length < 2) {
    return Response.json([]);
  }

  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fields=name,flag,cca2`,
    );
    if (!res.ok) return Response.json([]);

    const data: Array<{ name: { common: string }; flag: string; cca2: string }> =
      await res.json();

    const results = data.slice(0, 8).map((c) => ({
      label: c.name.common,
      value: c.name.common,
      sublabel: c.flag,
      meta: { flag: c.flag },
    }));

    return Response.json(results);
  } catch {
    return Response.json([]);
  }
}
