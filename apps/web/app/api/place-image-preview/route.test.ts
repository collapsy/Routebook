import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

function commonsResponse(
  description = "Praia do Amor em Pipa, Tibau do Sul, Rio Grande do Norte",
  title = "File:Praia do Amor Pipa.jpg",
  coordinate: Readonly<{ latitude: number; longitude: number }> | null = {
    latitude: -6.2366,
    longitude: -35.0465,
  },
) {
  return new Response(
    JSON.stringify({
      query: {
        pages: [
          {
            pageid: 123,
            title,
            ...(coordinate
              ? {
                  coordinates: [
                    { lat: coordinate.latitude, lon: coordinate.longitude, primary: "" },
                  ],
                }
              : {}),
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

function requestUrl(overrides: Record<string, string | undefined> = {}): string {
  const values: Record<string, string | undefined> = {
    destinationId: "pipa-rn-br",
    name: "Praia do Amor",
    latitude: "-6.2366",
    longitude: "-35.0465",
    ...overrides,
  };
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, value);
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

  it("rejeita coordenadas inválidas sem consultar a Fonte", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(new Request(requestUrl({ latitude: "91" })));

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejeita contexto de Destination inválido sem consultar a Fonte", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(
      new Request(requestUrl({ destinationId: "<script>alert(1)</script>" })),
    );

    expect(response.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejeita Google Place ID inválido sem consultar Provider", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(
      new Request(requestUrl({ googlePlaceId: "<script>", category: "nightlife" })),
    );

    expect(response.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("prioriza Google Photo com identidade revalidada e metadata no-store", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetcher = vi.fn(async () =>
      Response.json({
        id: "ChIJLavaTerrace01",
        displayName: { text: "Lava Terrace" },
        location: { latitude: 14.55781, longitude: -90.73369 },
        photos: [
          {
            name: "places/ChIJLavaTerrace01/photos/resource-secret",
            authorAttributions: [{ displayName: "Fotógrafo Google" }],
            googleMapsUri: "https://www.google.com/maps/place/?q=place_id:lava",
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(
      new Request(
        requestUrl({
          destinationId: "Antigua Guatemala",
          name: "Lava Terrace",
          latitude: "14.5578",
          longitude: "-90.7337",
          googlePlaceId: "ChIJLavaTerrace01",
          category: "nightlife",
        }),
      ),
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(payload).toMatchObject({
      provider: "google-places",
      sourceName: "Google Maps",
      authorAttributions: [{ displayName: "Fotógrafo Google" }],
    });
    expect(String(payload.mediaUrl)).toMatch(/^\/api\/place-image-preview\/google\?token=/);
    expect(JSON.stringify(payload)).not.toContain("resource-secret");
    expect(JSON.stringify(payload)).not.toContain("secret-google");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("reconcilia Google Quality sob demanda para card fora do bootstrap e então libera Google Photo", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("ROUTEBOOK_PLACE_QUALITY_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetcher = vi
      .fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(
        Response.json({
          places: [
            {
              id: "ChIJPuntoCeroGt01",
              displayName: { text: "Punto Cero Guatemala" },
              location: { latitude: 14.74191, longitude: -91.15621 },
              formattedAddress: "Panajachel, Guatemala",
              rating: 4.6,
              userRatingCount: 127,
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          id: "ChIJPuntoCeroGt01",
          displayName: { text: "Punto Cero Guatemala" },
          location: { latitude: 14.74191, longitude: -91.15621 },
          photos: [
            {
              name: "places/ChIJPuntoCeroGt01/photos/resource-secret",
              authorAttributions: [{ displayName: "Cliente Google" }],
              googleMapsUri: "https://www.google.com/maps/place/?q=place_id:punto-cero",
            },
          ],
        }),
      );
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(
      new Request(
        requestUrl({
          destinationId: "Panajachel Guatemala",
          name: "Punto Cero Guatemala",
          latitude: "14.74191",
          longitude: "-91.15621",
          category: "nightlife",
          googlePlaceId: undefined,
        }),
      ),
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(payload).toMatchObject({
      provider: "google-places",
      sourceName: "Google Maps",
      authorAttributions: [{ displayName: "Cliente Google" }],
    });
    expect(String(payload.mediaUrl)).toMatch(/^\/api\/place-image-preview\/google\?token=/);
    expect(fetcher).toHaveBeenCalledTimes(2);

    const [qualityInput, qualityInit] = fetcher.mock.calls[0] ?? [];
    expect(String(qualityInput)).toBe("https://places.googleapis.com/v1/places:searchText");
    expect(JSON.parse(String(qualityInit?.body))).toMatchObject({
      textQuery: "bares e vida noturna",
      locationBias: {
        circle: {
          center: { latitude: 14.74191, longitude: -91.15621 },
        },
      },
    });
    expect(JSON.parse(String(qualityInit?.body))).not.toHaveProperty("regionCode");
    expect(JSON.stringify(payload)).not.toContain("resource-secret");
    expect(JSON.stringify(payload)).not.toContain("secret-google");
  });

  it("não executa Quality lazy quando o Quality Provider Google não está configurado", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetcher = vi.fn(async () => commonsResponse());
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(
      new Request(
        requestUrl({
          category: "beach",
          googlePlaceId: undefined,
        }),
      ),
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(payload.sourceName).toBe("Wikimedia Commons");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("cai para Wikimedia quando Quality lazy não encontra identidade Google segura", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("ROUTEBOOK_PLACE_QUALITY_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetcher = vi
      .fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(Response.json({ places: [] }))
      .mockResolvedValueOnce(Response.json({ places: [] }))
      .mockResolvedValueOnce(commonsResponse());
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(
      new Request(
        requestUrl({
          category: "beach",
          googlePlaceId: undefined,
        }),
      ),
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(payload.sourceName).toBe("Wikimedia Commons");
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("cai para Wikimedia segura quando Google não possui foto", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetcher = vi
      .fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(
        Response.json({
          id: "ChIJPraiaDoAmor01",
          displayName: { text: "Praia do Amor" },
          location: { latitude: -6.2366, longitude: -35.0465 },
          photos: [],
        }),
      )
      .mockResolvedValueOnce(commonsResponse());
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(
      new Request(
        requestUrl({
          googlePlaceId: "ChIJPraiaDoAmor01",
          category: "beach",
        }),
      ),
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(payload.sourceName).toBe("Wikimedia Commons");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("devolve preview seguro de Pipa com Provenance e cache CDN", async () => {
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
      previewUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Praia_do_Amor_Pipa.jpg/640px-Praia_do_Amor_Pipa.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Praia_do_Amor_Pipa.jpg",
      sourceName: "Wikimedia Commons",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      attribution: "Fotógrafo RouteBook",
    });
    expect(String(payload.matchEvidence)).toMatch(/identifica o Lugar/i);
  });

  it("aceita Destination zero-seed sem destinationId quando a fotografia é geograficamente coerente", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        commonsResponse(
          "Ponte Hercílio Luz em Florianópolis, Santa Catarina",
          "File:Ponte Hercílio Luz Florianópolis.jpg",
          { latitude: -27.594, longitude: -48.566 },
        ),
      ),
    );

    const response = await GET(
      new Request(
        requestUrl({
          destinationId: undefined,
          name: "Ponte Hercílio Luz",
          latitude: "-27.5935",
          longitude: "-48.5652",
        }),
      ),
    );

    expect(response.status).toBe(200);
  });

  it("mantém fallback quando a identidade é ambígua", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        commonsResponse("Praia do Amor no litoral brasileiro", "File:Praia do Amor.jpg", null),
      ),
    );

    const response = await GET(new Request(requestUrl({ destinationId: undefined })));

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=21600, stale-while-revalidate=86400",
    );
  });

  it("repete falha transitória no limite e mantém fallback sem inventar mídia", async () => {
    const fetcher = vi.fn(async () => new Response("rate limited", { status: 429 }));
    vi.stubGlobal("fetch", fetcher);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const response = await GET(new Request(requestUrl()));

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
