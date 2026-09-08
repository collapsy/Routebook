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
