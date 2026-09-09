import { afterEach, describe, expect, it, vi } from "vitest";

import {
  GeocodingProviderError,
  NominatimGeocoder,
  type GeocodingContext,
} from "./geocoding";

type NominatimFixture = Readonly<{
  display_name: string;
  lat: string;
  lon: string;
  countryCode?: string;
}>;

function payload(fixtures: readonly NominatimFixture[]): Response {
  return new Response(
    JSON.stringify(
      fixtures.map((fixture) => ({
        display_name: fixture.display_name,
        lat: fixture.lat,
        lon: fixture.lon,
        address: fixture.countryCode ? { country_code: fixture.countryCode } : {},
      })),
    ),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

function context(overrides: Partial<GeocodingContext> = {}): GeocodingContext {
  return {
    countryCode: "BR",
    anchor: { latitude: -29.3746, longitude: -50.8764 },
    maxDistanceKm: 120,
    rejectAmbiguous: true,
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("NominatimGeocoder", () => {
  it("normaliza o primeiro resultado e preserva o contrato sem contexto", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      payload([
        {
          display_name: "Condomínio Solar Água, Pipa, Tibau do Sul, RN, Brasil",
          lat: "-6.2302",
          lon: "-35.0503",
          countryCode: "br",
        },
      ]),
    );
    const provider = new NominatimGeocoder("https://example.test", fetchMock);

    const result = await provider.geocode("Condomínio Solar Água, Pipa, RN");

    expect(result).toEqual({
      normalizedAddress: "Condomínio Solar Água, Pipa, Tibau do Sul, RN, Brasil",
      latitude: -6.2302,
      longitude: -35.0503,
    });
    expect(fetchMock).toHaveBeenCalledOnce();

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.pathname).toBe("/search");
    expect(requestedUrl.searchParams.get("q")).toBe("Condomínio Solar Água, Pipa, RN");
    expect(requestedUrl.searchParams.get("limit")).toBe("1");
    expect(requestedUrl.searchParams.has("countrycodes")).toBe(false);
    expect(requestedUrl.searchParams.has("viewbox")).toBe(false);
  });

  it("usa país e viewbox e seleciona o candidato mais próximo da âncora", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      payload([
        {
          display_name: "Hotel A distante, Brasil",
          lat: "-29.7",
          lon: "-51.1",
          countryCode: "br",
        },
        {
          display_name: "Hotel A Gramado, Brasil",
          lat: "-29.378",
          lon: "-50.873",
          countryCode: "br",
        },
      ]),
    );
    const provider = new NominatimGeocoder("https://example.test", fetchMock);

    const result = await provider.geocode("Hotel A", context({ rejectAmbiguous: false }));

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get("limit")).toBe("5");
    expect(requestedUrl.searchParams.get("countrycodes")).toBe("br");
    expect(requestedUrl.searchParams.get("viewbox")).toMatch(
      /^-?\d+\.\d+,-?\d+\.\d+,-?\d+\.\d+,-?\d+\.\d+$/,
    );
    expect(result?.normalizedAddress).toBe("Hotel A Gramado, Brasil");
  });

  it("rejeita candidato de outro país mesmo se estiver perto", async () => {
    const provider = new NominatimGeocoder(
      "https://example.test",
      vi.fn().mockResolvedValue(
        payload([
          {
            display_name: "Hotel A, país incorreto",
            lat: "-29.378",
            lon: "-50.873",
            countryCode: "ar",
          },
        ]),
      ),
    );

    await expect(provider.geocode("Hotel A", context())).resolves.toBeUndefined();
  });

  it("rejeita candidato além do raio máximo do Destination", async () => {
    const provider = new NominatimGeocoder(
      "https://example.test",
      vi.fn().mockResolvedValue(
        payload([
          {
            display_name: "Hotel A, muito distante",
            lat: "-23.5505",
            lon: "-46.6333",
            countryCode: "br",
          },
        ]),
      ),
    );

    await expect(provider.geocode("Hotel A", context())).resolves.toBeUndefined();
  });

  it("falha fechado quando dois candidatos distintos continuam competitivos", async () => {
    const provider = new NominatimGeocoder(
      "https://example.test",
      vi.fn().mockResolvedValue(
        payload([
          {
            display_name: "Hotel A unidade centro, Brasil",
            lat: "-29.378",
            lon: "-50.873",
            countryCode: "br",
          },
          {
            display_name: "Hotel A unidade bairro, Brasil",
            lat: "-29.395",
            lon: "-50.89",
            countryCode: "br",
          },
        ]),
      ),
    );

    await expect(provider.geocode("Hotel A", context())).resolves.toBeUndefined();
  });

  it("não trata objetos praticamente co-localizados como hotéis ambíguos", async () => {
    const provider = new NominatimGeocoder(
      "https://example.test",
      vi.fn().mockResolvedValue(
        payload([
          {
            display_name: "Hotel A prédio, Brasil",
            lat: "-29.378",
            lon: "-50.873",
            countryCode: "br",
          },
          {
            display_name: "Hotel A entrada, Brasil",
            lat: "-29.3783",
            lon: "-50.8732",
            countryCode: "br",
          },
          {
            display_name: "Hotel A outra cidade, Brasil",
            lat: "-29.6",
            lon: "-51.0",
            countryCode: "br",
          },
        ]),
      ),
    );

    const result = await provider.geocode("Hotel A", context());

    expect(result?.normalizedAddress).toBe("Hotel A prédio, Brasil");
  });

  it("retorna undefined quando nenhuma localização é encontrada", async () => {
    const provider = new NominatimGeocoder(
      "https://example.test",
      vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 })),
    );

    await expect(provider.geocode("Endereço inexistente")).resolves.toBeUndefined();
  });

  it("rejeita Provider indisponível", async () => {
    const provider = new NominatimGeocoder(
      "https://example.test",
      vi.fn().mockResolvedValue(new Response("erro", { status: 503 })),
    );

    await expect(provider.geocode("Pipa, RN")).rejects.toBeInstanceOf(GeocodingProviderError);
  });

  it("rejeita coordenadas malformadas", async () => {
    const provider = new NominatimGeocoder(
      "https://example.test",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([{ display_name: "Resultado inválido", lat: "200", lon: "x" }]),
          { status: 200 },
        ),
      ),
    );

    await expect(provider.geocode("Resultado inválido")).rejects.toThrow("localização inválida");
  });

  it("mantém erro explícito quando a chamada de rede falha", async () => {
    const provider = new NominatimGeocoder(
      "https://example.test",
      vi.fn().mockRejectedValue(new Error("network")),
    );

    await expect(provider.geocode("Hotel A", context())).rejects.toBeInstanceOf(
      GeocodingProviderError,
    );
  });
});
