// Presentation-only filters. Never propagate mutation banners or arbitrary return URLs.
const keys = [
  "etapa",
  "dia",
  "busca",
  "categoria",
  "distancia",
  "preco",
  "ordem",
  "descoberta",
  "preparar",
] as const;

export function discoveryQuery(value: string): string {
  const source = new URLSearchParams(value.slice(0, 2000));
  const result = new URLSearchParams();
  for (const key of keys) {
    const entry = source.get(key)?.trim();
    if (entry && entry.length <= (key === "busca" ? 120 : 160)) result.set(key, entry);
  }
  return result.toString();
}

export function discoveryReturnHref(tripId: string, query: string): string {
  const safeQuery = discoveryQuery(query);
  return `/viagens/${encodeURIComponent(tripId)}/lugares${safeQuery ? `?${safeQuery}` : ""}`;
}
