import { describe, expect, it, vi } from "vitest";

import {
  GooglePlacePhotoAdapter,
  resolveConfiguredGooglePlacePhotoProvider,
} from "./google-place-photo";
import {
  GooglePlacesQualityAdapter,
  isConservativeQualityIdentityMatch,
} from "./place-quality-provider";

const input = {
  placeId: "ChIJPraiaDoAmor01",
  name: "Praia do Amor",
  category: "beach" as const,
  latitude: -6.2366,
  longitude: -35.0465,
};

const puntoCero = {
  id: "external:punto-cero-guatemala",
  name: "Punto Cero Guatemala",
  category: "nightlife" as const,
  latitude: 14.7443,
  longitude: -91.1562,
  addressLabel: "Panajachel, GT",
};

const puntoRojo = {
  externalId: "google-punto-rojo",
  name: "PUNTO ROJO",
  latitude: 14.74432,
  longitude: -91.15618,
  addressLabel: "PRPR+59R, Panajachel, Guatemala",
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

describe("Google Places alias reconciliation", () => {
  it("mantém alias desativado no matching amplo e exige âncora espacial forte", () => {
    expect(isConservativeQualityIdentityMatch(puntoCero, puntoRojo)).toBe(false);
    expect(
      isConservativeQualityIdentityMatch(puntoCero, puntoRojo, { allowSpatialAlias: true }),
    ).toBe(true);
    expect(
      isConservativeQualityIdentityMatch(
        puntoCero,
        { ...puntoRojo, latitude: 14.746 },
        { allowSpatialAlias: true },
      ),
    ).toBe(false);
  });

  it("reconcilia o renome somente quando é o primeiro resultado da busca nominal", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify(
            fetcher.mock.calls.length === 1
              ? { places: [] }
              : {
                  places: [
                    {
                      id: puntoRojo.externalId,
                      displayName: { text: puntoRojo.name },
                      location: {
                        latitude: puntoRojo.latitude,
                        longitude: puntoRojo.longitude,
                      },
                      formattedAddress: puntoRojo.addressLabel,
                      rating: 4.5,
                      userRatingCount: 2,
                    },
                  ],
                },
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    const adapter = new GooglePlacesQualityAdapter("secret-google", { fetcher });

    const matches = await adapter.findSignals([puntoCero]);

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(matches).toEqual([
      expect.objectContaining({
        targetId: puntoCero.id,
        signals: expect.objectContaining({
          provider: "google-places",
          externalId: puntoRojo.externalId,
        }),
      }),
    ]);
  });

  it("não usa um alias espacial que venha atrás de outro resultado nominal", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify(
            fetcher.mock.calls.length === 1
              ? { places: [] }
              : {
                  places: [
                    {
                      id: "google-neighbor",
                      displayName: { text: "Otro Bar" },
                      location: { latitude: 14.74431, longitude: -91.15619 },
                      formattedAddress: "Panajachel, Guatemala",
                      rating: 4.7,
                      userRatingCount: 90,
                    },
                    {
                      id: puntoRojo.externalId,
                      displayName: { text: puntoRojo.name },
                      location: {
                        latitude: puntoRojo.latitude,
                        longitude: puntoRojo.longitude,
                      },
                      formattedAddress: puntoRojo.addressLabel,
                      rating: 4.5,
                      userRatingCount: 2,
                    },
                  ],
                },
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    const adapter = new GooglePlacesQualityAdapter("secret-google", { fetcher });

    await expect(adapter.findSignals([puntoCero])).resolves.toEqual([]);
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

  it("revalida alias de Place já reconciliado somente quando permanece praticamente no mesmo ponto", async () => {
    const renamedInput = {
      placeId: "ChIJPuntoRojo01",
      name: puntoCero.name,
      category: puntoCero.category,
      latitude: puntoCero.latitude,
      longitude: puntoCero.longitude,
    };
    const fetcher = vi.fn(async () =>
      Response.json({
        id: renamedInput.placeId,
        displayName: { text: puntoRojo.name },
        location: { latitude: puntoRojo.latitude, longitude: puntoRojo.longitude },
        photos: [
          {
            name: `places/${renamedInput.placeId}/photos/current-photo`,
            authorAttributions: [],
          },
        ],
      }),
    );
    const adapter = new GooglePlacePhotoAdapter("secret-google", {
      fetcher,
      now: () => new Date("2026-09-09T20:00:00.000Z"),
    });

    const preview = await adapter.findPreview(renamedInput);

    expect(preview).toMatchObject({
      provider: "google-places",
      sourceName: "Google Maps",
    });
    expect(JSON.stringify(preview)).not.toContain("current-photo");
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
