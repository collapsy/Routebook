import { afterEach, describe, expect, it, vi } from "vitest";

import {
  FixtureDestinationSuggestionProvider,
  GoogleDestinationSuggestionProvider,
  resolveConfiguredDestinationSuggestionProvider,
  resolveSelectedDestination,
  suggestConfiguredDestinations,
} from "./destination-suggestions";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("GoogleDestinationSuggestionProvider", () => {
  it("normaliza apenas destinos e limita sugestões sem expor a chave", async () => {
    const fetcher = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      expect(init?.headers).toMatchObject({
        "X-Goog-Api-Key": "secret-key",
      });
      expect(String(init?.body)).toContain('"sessionToken":"session-123"');
      return Response.json({
        suggestions: [
          {
            placePrediction: {
              placeId: "sp",
              text: { text: "São Paulo, SP, Brasil" },
              structuredFormat: {
                mainText: { text: "São Paulo" },
                secondaryText: { text: "SP, Brasil" },
              },
              types: ["locality", "political"],
            },
          },
          {
            placePrediction: {
              placeId: "restaurant",
              text: { text: "Restaurante São Paulo" },
              structuredFormat: { mainText: { text: "Restaurante São Paulo" } },
              types: ["restaurant", "establishment"],
            },
          },
          ...Array.from({ length: 7 }, (_, index) => ({
            placePrediction: {
              placeId: `region-${index}`,
              text: { text: `Região ${index}, Brasil` },
              structuredFormat: { mainText: { text: `Região ${index}` } },
              types: ["administrative_area_level_2", "political"],
            },
          })),
        ],
      });
    });
    const provider = new GoogleDestinationSuggestionProvider("secret-key", fetcher);

    const result = await provider.suggest("sao", "session-123");

    expect(result.status).toBe("ready");
    if (result.status !== "ready") throw new Error("Expected ready suggestions.");
    expect(result.suggestions).toHaveLength(5);
    expect(result.suggestions[0]).toEqual({
      reference: "sp",
      label: "São Paulo, SP, Brasil",
      primaryText: "São Paulo",
      secondaryText: "SP, Brasil",
      provider: "google",
      attribution: "Google Maps",
    });
    expect(result.suggestions.some((suggestion) => suggestion.reference === "restaurant")).toBe(
      false,
    );
    expect(JSON.stringify(result)).not.toContain("secret-key");
  });

  it("revalida Place ID com Details e deriva timezone localmente", async () => {
    const fetcher = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/v1/places/ChIJ-SP");
      expect(url.searchParams.get("sessionToken")).toBe("session-456");
      expect(init?.headers).toMatchObject({
        "X-Goog-Api-Key": "secret-key",
        "X-Goog-FieldMask": "id,displayName,formattedAddress,location,addressComponents,types",
      });
      return Response.json({
        id: "ChIJ-SP",
        displayName: { text: "São Paulo" },
        formattedAddress: "São Paulo - SP, Brasil",
        location: { latitude: -23.5505, longitude: -46.6333 },
        addressComponents: [
          { longText: "Brasil", shortText: "BR", types: ["country", "political"] },
        ],
        types: ["locality", "political"],
      });
    });
    const provider = new GoogleDestinationSuggestionProvider(
      "secret-key",
      fetcher,
      () => new Date("2026-09-04T12:00:00.000Z"),
      () => "America/Sao_Paulo",
    );

    const result = await provider.resolve("ChIJ-SP", "session-456");

    expect(result.status).toBe("resolved");
    if (result.status !== "resolved") throw new Error("Expected resolved destination.");
    expect(result.value.destination).toEqual({
      name: "São Paulo - SP, Brasil",
      type: "city",
      countryCode: "BR",
      latitude: -23.5505,
      longitude: -46.6333,
      timeZone: "America/Sao_Paulo",
    });
    expect(result.value.provenance).toMatchObject({
      provider: "google-places",
      externalReference: "ChIJ-SP",
      confidenceLevel: "confirmed",
      metadata: { attribution: "Google Maps", selectionRevalidated: true },
    });
  });

  it("rejeita resposta Details cujo ID não corresponde à seleção", async () => {
    const provider = new GoogleDestinationSuggestionProvider(
      "secret-key",
      vi.fn(async () =>
        Response.json({
          id: "outro-id",
          displayName: { text: "São Paulo" },
          formattedAddress: "São Paulo - SP, Brasil",
          location: { latitude: -23.5505, longitude: -46.6333 },
          addressComponents: [{ shortText: "BR", types: ["country"] }],
          types: ["locality"],
        }),
      ),
    );

    await expect(provider.resolve("esperado", "session")).resolves.toEqual({
      status: "unavailable",
      reason: "invalid-response",
    });
  });
});

describe("configuração de Destination suggestions", () => {
  it("reutiliza fixture determinística no E2E e resolve São Paulo por referência", async () => {
    process.env.ROUTEBOOK_E2E_DESTINATION_RESOLVER = "1";
    process.env.ROUTEBOOK_DESTINATION_RESOLVER = "fixture";
    delete process.env.VERCEL_ENV;

    const suggestions = await suggestConfiguredDestinations("sao paulo", "fixture-session");
    expect(suggestions.status).toBe("ready");
    if (suggestions.status !== "ready") throw new Error("Expected fixture suggestions.");
    expect(suggestions.suggestions).toContainEqual({
      reference: "fixture:sao-paulo-sp-br",
      label: "São Paulo, SP, Brasil",
      primaryText: "São Paulo",
      secondaryText: "SP, Brasil",
      provider: "fixture",
      attribution: "RouteBook test fixture",
    });

    const resolved = await resolveSelectedDestination({
      provider: "fixture",
      reference: "fixture:sao-paulo-sp-br",
      sessionToken: "fixture-session",
    });
    expect(resolved.status).toBe("resolved");
    if (resolved.status !== "resolved") throw new Error("Expected fixture resolution.");
    expect(resolved.value.destination.name).toBe("São Paulo, SP");
    expect(resolved.value.destination.timeZone).toBe("America/Sao_Paulo");
  });

  it("não chama Provider para menos de três caracteres", async () => {
    delete process.env.ROUTEBOOK_DESTINATION_SUGGESTION_PROVIDER;
    await expect(suggestConfiguredDestinations("sp", "session")).resolves.toEqual({
      status: "ready",
      suggestions: [],
    });
  });

  it("mantém Google bloqueado em Production", () => {
    process.env.ROUTEBOOK_DESTINATION_SUGGESTION_PROVIDER = "google";
    process.env.GOOGLE_PLACES_API_KEY = "secret-key";
    process.env.VERCEL_ENV = "production";

    expect(resolveConfiguredDestinationSuggestionProvider()).toEqual({
      status: "unavailable",
      reason: "blocked",
    });
  });

  it("expõe provider fixture diretamente somente para testes", async () => {
    const provider = new FixtureDestinationSuggestionProvider();
    const result = await provider.suggest("florianopolis", "ignored");
    expect(result.status).toBe("ready");
  });
});
