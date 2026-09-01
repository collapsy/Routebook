import { describe, expect, it, vi } from "vitest";

import type { PlaceQualityTarget } from "@routebook/place-catalog";

import {
  FoursquarePlacesQualityAdapter,
  GooglePlacesQualityAdapter,
  isConservativeQualityIdentityMatch,
  resolveConfiguredPlaceQualityProvider,
} from "./place-quality-provider";

const target: PlaceQualityTarget = {
  id: "published:praia-do-amor",
  name: "Praia do Amor",
  category: "beach",
  latitude: -6.2366,
  longitude: -35.0465,
  addressLabel: "Pipa, Tibau do Sul — RN",
};

describe("isConservativeQualityIdentityMatch", () => {
  it("aceita identidade forte próxima e rejeita homônimo distante", () => {
    expect(
      isConservativeQualityIdentityMatch(target, {
        externalId: "near",
        name: "Praia do Amor",
        latitude: -6.2367,
        longitude: -35.0466,
      }),
    ).toBe(true);

    expect(
      isConservativeQualityIdentityMatch(target, {
        externalId: "far",
        name: "Praia do Amor",
        latitude: -6.7,
        longitude: -35.8,
      }),
    ).toBe(false);
  });
});

describe("GooglePlacesQualityAdapter", () => {
  it("usa FieldMask mínimo e converte rating + volume com Provenance", async () => {
    let request: { input: string; init: RequestInit | undefined } | undefined;
    const fetcher = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      request = { input: String(input), init };
      return new Response(
        JSON.stringify({
          places: [
            {
              id: "google-1",
              displayName: { text: "Praia do Amor" },
              location: { latitude: -6.2367, longitude: -35.0466 },
              rating: 4.8,
              userRatingCount: 2340,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const adapter = new GooglePlacesQualityAdapter("secret-google", {
      fetcher,
      now: () => new Date("2026-08-28T16:00:00.000Z"),
    });
    const matches = await adapter.findSignals([target]);

    expect(matches).toEqual([
      {
        targetId: target.id,
        signals: {
          provider: "google-places",
          externalId: "google-1",
          rating: { value: 4.8, scaleMax: 5, reviewCount: 2340 },
          collectedAt: new Date("2026-08-28T16:00:00.000Z"),
        },
      },
    ]);
    expect(request?.input).toBe("https://places.googleapis.com/v1/places:searchText");
    expect((request?.init?.headers as Record<string, string>)["X-Goog-Api-Key"]).toBe(
      "secret-google",
    );
    expect((request?.init?.headers as Record<string, string>)["X-Goog-FieldMask"]).toBe(
      "places.id,places.displayName,places.location,places.rating,places.userRatingCount",
    );
    expect(JSON.stringify(matches)).not.toContain("secret-google");
  });

  it("faz busca nominal limitada quando a busca ampla não contém o Place curado", async () => {
    const restaurant: PlaceQualityTarget = {
      id: "published:camarao-na-fazenda-pipa",
      name: "Camarão na Fazenda Pipa",
      category: "gastronomy",
      latitude: -6.2304,
      longitude: -35.0497,
      addressLabel: "Rua dos Bem-Te-Vis, 66, Praia da Pipa — RN",
    };
    const requestBodies: unknown[] = [];
    const fetcher = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      requestBodies.push(JSON.parse(String(init?.body)) as unknown);
      return new Response(
        JSON.stringify(
          fetcher.mock.calls.length === 1
            ? {
                places: [
                  {
                    id: "google-outro",
                    displayName: { text: "Outro Restaurante" },
                    location: { latitude: -6.2301, longitude: -35.0491 },
                    rating: 4.5,
                    userRatingCount: 500,
                  },
                ],
              }
            : {
                places: [
                  {
                    id: "google-camarao",
                    displayName: { text: "Camarão na Fazenda Pipa" },
                    location: { latitude: -6.2305, longitude: -35.0498 },
                    rating: 4.7,
                    userRatingCount: 3210,
                  },
                ],
              },
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const adapter = new GooglePlacesQualityAdapter("secret-google", { fetcher });
    const matches = await adapter.findSignals([restaurant]);

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(requestBodies).toEqual([
      expect.objectContaining({ textQuery: "restaurantes", pageSize: 20 }),
      expect.objectContaining({
        textQuery: "Camarão na Fazenda Pipa, Rua dos Bem-Te-Vis, 66, Praia da Pipa — RN",
        pageSize: 5,
      }),
    ]);
    expect(matches).toEqual([
      expect.objectContaining({
        targetId: restaurant.id,
        signals: expect.objectContaining({
          externalId: "google-camarao",
          rating: { value: 4.7, scaleMax: 5, reviewCount: 3210 },
        }),
      }),
    ]);
  });

  it("limita buscas nominais adicionais a quatro alvos por categoria", async () => {
    const targets = Array.from({ length: 6 }, (_, index): PlaceQualityTarget => ({
      id: `published:lugar-${index}`,
      name: `Lugar ${index}`,
      category: "nature",
      latitude: -6.24 + index * 0.0001,
      longitude: -35.04,
    }));
    const fetcher = vi.fn(
      async () =>
        new Response(JSON.stringify({ places: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    const adapter = new GooglePlacesQualityAdapter("secret-google", { fetcher });
    await expect(adapter.findSignals(targets)).resolves.toEqual([]);

    expect(fetcher).toHaveBeenCalledTimes(5);
  });

  it("preserva resultados amplos quando uma busca nominal adicional falha", async () => {
    const missing: PlaceQualityTarget = {
      id: "published:chapadao",
      name: "Chapadão de Pipa",
      category: "nature",
      latitude: -6.2445,
      longitude: -35.0407,
    };
    const fetcher = vi.fn(async () => {
      if (fetcher.mock.calls.length > 1) return new Response(null, { status: 503 });
      return new Response(
        JSON.stringify({
          places: [
            {
              id: "google-santuario",
              displayName: { text: "Santuário Ecológico de Pipa" },
              location: { latitude: -6.222, longitude: -35.055 },
              rating: 4.8,
              userRatingCount: 1800,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    const sanctuary: PlaceQualityTarget = {
      id: "published:santuario",
      name: "Santuário Ecológico de Pipa",
      category: "nature",
      latitude: -6.222,
      longitude: -35.055,
    };

    const adapter = new GooglePlacesQualityAdapter("secret-google", { fetcher });
    const matches = await adapter.findSignals([sanctuary, missing]);

    expect(matches.map((match) => match.targetId)).toEqual([sanctuary.id]);
  });

  it("aceita expansão nominal distintiva somente na busca direcionada daquele alvo", async () => {
    const chapadao: PlaceQualityTarget = {
      id: "published:chapadao",
      name: "Chapadão de Pipa",
      category: "nature",
      latitude: -6.2445,
      longitude: -35.0407,
    };
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify(
            fetcher.mock.calls.length === 1
              ? { places: [] }
              : {
                  places: [
                    {
                      id: "google-chapadao",
                      displayName: { text: "Chapadão - Falésia da Praia de Pipa" },
                      location: { latitude: -6.2364, longitude: -35.0435 },
                      rating: 4.8,
                      userRatingCount: 11631,
                    },
                  ],
                },
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );

    expect(
      isConservativeQualityIdentityMatch(chapadao, {
        externalId: "google-chapadao",
        name: "Chapadão - Falésia da Praia de Pipa",
        latitude: -6.2364,
        longitude: -35.0435,
      }),
    ).toBe(false);

    const adapter = new GooglePlacesQualityAdapter("secret-google", { fetcher });
    const matches = await adapter.findSignals([chapadao]);

    expect(matches).toEqual([
      expect.objectContaining({
        targetId: chapadao.id,
        signals: expect.objectContaining({ externalId: "google-chapadao" }),
      }),
    ]);
  });
});

describe("FoursquarePlacesQualityAdapter", () => {
  it("usa endpoint atual, Service Key e versão explícita sem expor secret", async () => {
    let request: { input: string; init: RequestInit | undefined } | undefined;
    const fetcher = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      request = { input: String(input), init };
      return new Response(
        JSON.stringify({
          results: [
            {
              fsq_place_id: "fsq-1",
              name: "Praia do Amor",
              latitude: -6.2367,
              longitude: -35.0466,
              rating: 9.1,
              popularity: 0.87,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const adapter = new FoursquarePlacesQualityAdapter("secret-fsq", {
      fetcher,
      now: () => new Date("2026-08-28T16:00:00.000Z"),
    });
    const matches = await adapter.findSignals([target]);
    const url = new URL(request!.input);

    expect(url.origin + url.pathname).toBe("https://places-api.foursquare.com/places/search");
    expect(url.searchParams.get("fields")).toContain("rating");
    expect(url.searchParams.get("fields")).toContain("popularity");
    expect((request?.init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer secret-fsq",
    );
    expect((request?.init?.headers as Record<string, string>)["X-Places-Api-Version"]).toBe(
      "2025-06-17",
    );
    expect(matches[0]?.signals).toMatchObject({
      provider: "foursquare-places",
      externalId: "fsq-1",
      rating: { value: 9.1, scaleMax: 10 },
      popularity: { value: 0.87, scaleMax: 1 },
    });
    expect(JSON.stringify(matches)).not.toContain("secret-fsq");
  });
});

describe("resolveConfiguredPlaceQualityProvider", () => {
  it("não ativa Provider implicitamente e exige secret quando selecionado", () => {
    expect(resolveConfiguredPlaceQualityProvider({})).toEqual({ status: "not-configured" });
    expect(
      resolveConfiguredPlaceQualityProvider({ ROUTEBOOK_PLACE_QUALITY_PROVIDER: "google" }),
    ).toEqual({
      status: "missing-secret",
      provider: "google",
      providerLabel: "Google Places",
    });
    expect(
      resolveConfiguredPlaceQualityProvider({ ROUTEBOOK_PLACE_QUALITY_PROVIDER: "outro" }),
    ).toEqual({
      status: "invalid-provider",
      requestedProvider: "outro",
    });
  });
});
