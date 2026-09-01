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

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/place-image-preview", () => {
  it("rejeita recorte geográfico ou Destination inválido sem consultar a Fonte", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(new Request(requestUrl({ destinationId: "outro-destino" })));

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("devolve somente preview seguro com Provenance e cache CDN", async () => {
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
    expect(String(payload.matchEvidence)).toContain("contexto local de Pipa/Tibau do Sul");
  });

  it("prefere Google Places quando externalId seguro e configuração Preview estão disponíveis", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetcher = vi.fn(async () =>
      Response.json({
        id: "ChIJPraiaDoAmor01",
        displayName: { text: "Praia do Amor" },
        location: { latitude: -6.2367, longitude: -35.0466 },
        photos: [
          {
            name: "places/ChIJPraiaDoAmor01/photos/photo-resource-current",
            authorAttributions: [
              {
                displayName: "Pessoa fotógrafa",
                uri: "//maps.google.com/maps/contrib/123",
              },
            ],
            googleMapsUri: "https://www.google.com/maps/place/?q=place_id:abc",
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(
      new Request(
        requestUrl({
          category: "beach",
          googlePlaceId: "ChIJPraiaDoAmor01",
        }),
      ),
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(payload).toMatchObject({
      provider: "google-places",
      sourceName: "Google Maps",
      authorAttributions: [
        {
          displayName: "Pessoa fotógrafa",
          uri: "https://maps.google.com/maps/contrib/123",
        },
      ],
    });
    expect(String(payload.mediaUrl)).toContain("/api/place-image-preview/google?token=");
    expect(JSON.stringify(payload)).not.toContain("photo-resource-current");
    expect(JSON.stringify(payload)).not.toContain("secret-google");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("cai para Wikimedia quando Google não confirma a identidade", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "preview");
    const fetcher = vi
      .fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(
        Response.json({
          id: "ChIJPraiaDoAmor01",
          displayName: { text: "Praia do Amor distante" },
          location: { latitude: -7.5, longitude: -36.5 },
          photos: [],
        }),
      )
      .mockResolvedValueOnce(commonsResponse());
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(
      new Request(
        requestUrl({
          category: "beach",
          googlePlaceId: "ChIJPraiaDoAmor01",
        }),
      ),
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      provider: "wikimedia-commons",
      sourceName: "Wikimedia Commons",
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("mantém fallback quando a identidade é ambígua", async () => {
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

  it("isola indisponibilidade do Wikimedia sem transformar erro em mídia", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("rate limited", { status: 429 })),
    );
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const response = await GET(new Request(requestUrl()));

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
