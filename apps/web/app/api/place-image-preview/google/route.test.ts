import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/place-image-preview/google", () => {
  it("rejeita token ausente sem chamar Provider", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await GET(new Request("http://localhost/api/place-image-preview/google"));

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("degrada para indisponível quando Provider não está configurado", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "");

    const response = await GET(
      new Request("http://localhost/api/place-image-preview/google?token=abc"),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("nunca permite cache da mídia Google", async () => {
    vi.stubEnv("ROUTEBOOK_PLACE_PHOTO_PROVIDER", "google");
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "secret-google");
    vi.stubEnv("VERCEL_ENV", "preview");

    const detailsIdentity = Response.json({
      id: "ChIJPraiaDoAmor01",
      displayName: { text: "Praia do Amor" },
      location: { latitude: -6.2367, longitude: -35.0466 },
      photos: [
        {
          name: "places/ChIJPraiaDoAmor01/photos/photo-one",
          authorAttributions: [],
        },
      ],
    });
    const detailsPhoto = Response.json({
      photos: [
        {
          name: "places/ChIJPraiaDoAmor01/photos/photo-one",
          authorAttributions: [],
        },
      ],
    });
    const image = new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { "content-type": "image/jpeg", "content-length": "3" },
    });
    const fetcher = vi
      .fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(detailsIdentity)
      .mockResolvedValueOnce(detailsPhoto)
      .mockResolvedValueOnce(image);
    vi.stubGlobal("fetch", fetcher);

    const { GooglePlacePhotoAdapter } = await import("../../../../lib/google-place-photo");
    const adapter = new GooglePlacePhotoAdapter("secret-google", {
      fetcher,
      now: () => new Date("2026-09-01T18:00:00.000Z"),
    });
    const preview = await adapter.findPreview({
      placeId: "ChIJPraiaDoAmor01",
      name: "Praia do Amor",
      category: "beach",
      latitude: -6.2366,
      longitude: -35.0465,
    });
    expect(preview).toBeDefined();

    // A rota cria uma nova instância do adapter usando o fetch global. A sequência restante
    // começa em Place Details photos e termina na mídia.
    fetcher.mockClear();
    fetcher
      .mockResolvedValueOnce(detailsPhoto)
      .mockResolvedValueOnce(image);

    const response = await GET(
      new Request(
        `http://localhost/api/place-image-preview/google?token=${encodeURIComponent(preview!.mediaToken)}`,
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
  });
});
