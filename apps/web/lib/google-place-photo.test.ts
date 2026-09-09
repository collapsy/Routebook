import { describe, expect, it, vi } from "vitest";

import {
  GooglePlacePhotoAdapter,
  resolveConfiguredGooglePlacePhotoProvider,
} from "./google-place-photo";

const input = {
  placeId: "ChIJPraiaDoAmor01",
  name: "Praia do Amor",
  category: "beach" as const,
  latitude: -6.2366,
  longitude: -35.0465,
};

function detailsResponse(overrides: Record<string, unknown> = {}): Response {
  return Response.json({
    id: input.placeId,
    displayName: { text: "Praia do Amor" },
    location: { latitude: -6.2367, longitude: -35.0466 },
    photos: [
      {
        name: `places/${input.placeId}/photos/photo-resource-current`,
        authorAttributions: [
          {
            displayName: "Pessoa fotógrafa",
            uri: "//maps.google.com/maps/contrib/123",
          },
        ],
        googleMapsUri: "https://www.google.com/maps/place/?q=place_id:abc",
      },
    ],
    ...overrides,
  });
}

describe("resolveConfiguredGooglePlacePhotoProvider", () => {
  it("não ativa fotos implicitamente e bloqueia Production", () => {
    expect(resolveConfiguredGooglePlacePhotoProvider({})).toEqual({ status: "not-configured" });
    expect(
      resolveConfiguredGooglePlacePhotoProvider({
        ROUTEBOOK_PLACE_PHOTO_PROVIDER: "google",
        GOOGLE_PLACES_API_KEY: "secret",
        VERCEL_ENV: "production",
      }),
    ).toMatchObject({ status: "blocked-environment", provider: "google" });
  });

  it("exige secret quando Google é explicitamente selecionado", () => {
    expect(
      resolveConfiguredGooglePlacePhotoProvider({
        ROUTEBOOK_PLACE_PHOTO_PROVIDER: "google",
        VERCEL_ENV: "preview",
      }),
    ).toMatchObject({ status: "missing-secret", provider: "google" });
  });
});

describe("GooglePlacePhotoAdapter", () => {
  it("revalida identidade com FieldMask explícito e não expõe photo name", async () => {
    let request: { input: string; init: RequestInit | undefined } | undefined;
    const fetcher = vi.fn(async (value: string | URL | Request, init?: RequestInit) => {
      request = { input: String(value), init };
      return detailsResponse();
    });
    const adapter = new GooglePlacePhotoAdapter("secret-google", {
      fetcher,
      now: () => new Date("2026-09-01T18:00:00.000Z"),
    });

    const preview = await adapter.findPreview(input);

    expect(request?.input).toBe("https://places.googleapis.com/v1/places/ChIJPraiaDoAmor01");
    expect((request?.init?.headers as Record<string, string>)["X-Goog-FieldMask"]).toBe(
      "id,displayName,location,photos",
    );
    expect(preview).toMatchObject({
      provider: "google-places",
      sourceName: "Google Maps",
      authorAttributions: [
        {
          displayName: "Pessoa fotógrafa",
          uri: "https://maps.google.com/maps/contrib/123",
        },
      ],
    });
    expect(JSON.stringify(preview)).not.toContain("photo-resource-current");
    expect(JSON.stringify(preview)).not.toContain("secret-google");
  });

  it("rejeita Place ID cuja identidade não corresponde ao target", async () => {
    const adapter = new GooglePlacePhotoAdapter("secret-google", {
      fetcher: vi.fn(async () =>
        detailsResponse({
          displayName: { text: "Praia do Amor - outro estado" },
          location: { latitude: -7.5, longitude: -36.5 },
        }),
      ),
    });

    await expect(adapter.findPreview(input)).resolves.toBeUndefined();
  });

  it("usa token efêmero e resolve photo name novamente antes da mídia", async () => {
    const fetcher = vi
      .fn<(value: string | URL | Request, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(detailsResponse())
      .mockResolvedValueOnce(
        Response.json({
          photos: [
            {
              name: `places/${input.placeId}/photos/photo-resource-refreshed`,
              authorAttributions: [],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: { "content-type": "image/jpeg", "content-length": "3" },
        }),
      );
    const adapter = new GooglePlacePhotoAdapter("secret-google", {
      fetcher,
      now: () => new Date("2026-09-01T18:00:00.000Z"),
    });
    const preview = await adapter.findPreview(input);
    expect(preview).toBeDefined();

    const media = await adapter.fetchMedia(preview!.mediaToken);

    expect(media?.contentType).toBe("image/jpeg");
    expect(new Uint8Array(media!.bytes)).toEqual(new Uint8Array([1, 2, 3]));
    expect(String(fetcher.mock.calls[1]?.[0])).toContain("/places/ChIJPraiaDoAmor01");
    expect(
      (fetcher.mock.calls[1]?.[1]?.headers as Record<string, string>)["X-Goog-FieldMask"],
    ).toBe("photos");
    expect(String(fetcher.mock.calls[2]?.[0])).toContain("photo-resource-refreshed/media");
  });

  it("rejeita token adulterado sem chamada de rede", async () => {
    const fetcher = vi.fn();
    const adapter = new GooglePlacePhotoAdapter("secret-google", { fetcher });

    await expect(adapter.fetchMedia("payload.signature-invalida")).resolves.toBeUndefined();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
