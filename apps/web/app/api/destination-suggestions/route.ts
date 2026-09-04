import { NextResponse } from "next/server";

import { suggestConfiguredDestinations } from "../../../lib/destination-suggestions";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex",
} as const;

function isValidSessionToken(value: string): boolean {
  return value.length >= 16 && value.length <= 128 && /^[A-Za-z0-9_-]+$/.test(value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const sessionToken = url.searchParams.get("sessionToken")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({ enabled: true, suggestions: [] }, { headers: NO_STORE_HEADERS });
  }
  if (query.length > 120 || !isValidSessionToken(sessionToken)) {
    return NextResponse.json(
      { error: "Parâmetros inválidos para buscar destinos." },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const result = await suggestConfiguredDestinations(query, sessionToken);
  if (result.status === "unavailable") {
    if (["disabled", "blocked", "misconfigured"].includes(result.reason)) {
      return NextResponse.json(
        {
          enabled: false,
          suggestions: [],
          message: "Sugestões de destinos não estão disponíveis neste ambiente.",
        },
        { headers: NO_STORE_HEADERS },
      );
    }
    return NextResponse.json(
      { error: "Não foi possível buscar destinos agora. Tente novamente em instantes." },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }

  const attribution = result.suggestions.some((suggestion) => suggestion.provider === "google")
    ? "Google Maps"
    : undefined;
  return NextResponse.json(
    {
      enabled: true,
      suggestions: result.suggestions,
      ...(attribution ? { attribution } : {}),
    },
    { headers: NO_STORE_HEADERS },
  );
}
