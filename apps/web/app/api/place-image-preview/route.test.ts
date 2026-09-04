import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

function commonsResponse(
  description = "Praia do Amor em Pipa, Tibau do Sul, Rio Grande do Norte",
  title = "File:Praia do Amor Pipa.jpg",
) {
  return new Response(
    JSON.stringify({
      query: {
        pages: [
          {
            pageid: 123,
            title,
            imageinfo: [
              {
                descriptionurl: "https://commons.wikimedia.org/wiki/File:Praia_do_Amor_Pipa.jpg",
                url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Praia_do_Amor_Pipa.jpg",
                thumburl:
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Praia_do_Amor_Pipa.jpg/640px-Praia_do_Amor_Pipa.jpg",
                mime: "image/jpeg",
                sha1: "source-sha1",
                extmetadata: {
                  Artist: { value: "Fotógrafo RouteBook" },
                  LicenseShortName: { value: "CC BY-SA 4.0" },
                  LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0/" },
                  ImageDescription: { value: description },
                },
              },
            ],
          },
        ],
      },
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

function googleDetailsResponse(overrides: Record<string, unknown> = {}) {
  return Response.json({
    id: "ChIJMaspSaoPaulo01",
    displayName: { text: "MASP" },
    location: { latitude: -23.5614, longitude: -46.6559 },
    photos: [
      {
        name: "places/ChIJMaspSaoPaulo01/photos/current-photo-name",
        authorAttributions: [
          {
            displayName: "Pessoa fotógrafa",
            uri: "https://maps.google.com/maps/contrib/123",
          },
        ],
        googleMapsUri: "https://www.google.com/maps/place/?q=place_id:masp",
      },
    ],
    ...overrides,
  });
}

function requestUrl(overrides: Record<string, string> = {}): string {
  const params = new URLSearchParams({
    destinationId: "pipa-rn-br",
    name: "Praia do Amor",
    latitude: "-6.2366",
    longitude: "-35.0465",
    ...overrides,
  });
  return `http://localhost/api/place-image-preview?${params}`;
}

function googleRequestUrl(overrides: Record<string, string> = {}): string {
  const params = new URLSearchParams({
    name: "MASP",
    latitude: "-23.5615",
    longitude: "-46.6559",
    category: "nature",
    googlePlaceId: "ChIJMaspSaoPaulo01",
    ...overrides,
  });
  return `http://localhost/api/place-image-preview?${params}`;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/place-image-preview", () => {
  it("honra kill switch de Media sem consultar a Fonte", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    vi.stubEnv("ROUTEBOOK_PLACE_MEDIA_ENABLED", "false");

    const response = await GET(new Request(requestUrl()));

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejeita recorte geográfico ou Destination inválido sem outra fonte governada", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(new Request(requestUrl({ destinationId: "outro-destino" })));

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("devolve somente preview Wikimedia seguro com Provenance e cache CDN", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => commonsResponse()),
    );

    const response = await GET(new Request(requestUrl()));
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=86400, stale-while-revalidate=604800",
    );
    expect(payload).toMatchObject({
      provider: "wikimedia-commons",
      previewUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Praia_do_Amor_Pipa.jpg/640px-Praia_do_Amor_Pipa.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Praia_do_Amor_Pipa.jpg",
      sourceName: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      attribution: "Fotógrafo RouteBook",
    });
    expect(String(payload.matchEvidence)).toContain("contexto local de Pipa/Tibau do Sul");
  });

  it("resolve Google Photos fora de Pipa sem expor photo name ou secret", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetcher = vi.fn(async () => googleDetailsResponse());
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(new Request(googleRequestUrl()));
    const payload = (await response.json()) as Record<string, unknown>;
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(payload).toMatchObject({
      provider: "google-places",
      sourceName: "Google Maps",
      sourceUrl: "https://www.google.com/maps/place/?q=place_id:masp",
      authorAttributions: [
        {
          displayName: "Pessoa fotógrafa",
          uri: "https://maps.google.com/maps/contrib/123",
        },
      ],
    });
    expect(String(payload.mediaUrl)).toMatch(/^\/api\/place-image-preview\/google\?token=/);
    expect(serialized).not.toContain("current-photo-name");
    expect(serialized).not.toContain("secret-google");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("mantém miss Google sem cache quando identidade não corresponde", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        googleDetailsResponse({
          displayName: { text: "MASP de outro estado" },
          location: { latitude: -7.5, longitude: -36.5 },
        }),
      ),
    );

    const response = await GET(new Request(googleRequestUrl()));

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("repete falha transitória do Google no limite e degrada sem mídia inventada", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetcher = vi.fn(async () => new Response("rate limited", { status: 429 }));
    vi.stubGlobal("fetch", fetcher);
    vi.spyOn(console, "info").mockImplementation(() => undefined);

    const response = await GET(new Request(googleRequestUrl()));

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("mantém fallback Wikimedia quando a identidade é ambígua", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        commonsResponse("Praia do Amor no litoral brasileiro", "File:Praia do Amor.jpg"),
      ),
    );

    const response = await GET(new Request(requestUrl()));

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=21600, stale-while-revalidate=86400",
    );
  });

  it("repete falha transitória Wikimedia no limite e mantém fallback sem inventar mídia", async () => {
    const fetcher = vi.fn(async () => new Response("rate limited", { status: 429 }));
    vi.stubGlobal("fetch", fetcher);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const response = await GET(new Request(requestUrl()));

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
