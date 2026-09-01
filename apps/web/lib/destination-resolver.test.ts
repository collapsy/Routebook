import { afterEach, describe, expect, it, vi } from "vitest";

import {
  NominatimDestinationResolver,
  resolveConfiguredDestinationResolver,
  resolveIanaTimeZone,
} from "./destination-resolver";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const response = (candidates: unknown[]) => Response.json(candidates);

describe("NominatimDestinationResolver", () => {
  it("resolve Florianópolis pelo contrato provider-neutral", async () => {
    const resolver = new NominatimDestinationResolver({
      fetcher: async () =>
        response([
          {
            osm_type: "relation",
            osm_id: 296514,
            name: "Florianópolis",
            display_name: "Florianópolis, Santa Catarina, Brasil",
            lat: "-27.5948036",
            lon: "-48.5569286",
            category: "boundary",
            type: "administrative",
            addresstype: "city",
            importance: 0.72,
            boundingbox: ["-27.851", "-27.383", "-48.594", "-48.358"],
            address: {
              city: "Florianópolis",
              state: "Santa Catarina",
              "ISO3166-2-lvl4": "BR-SC",
              country: "Brasil",
              country_code: "br",
            },
          },
        ]),
      now: () => new Date("2026-09-01T12:00:00.000Z"),
      timeZoneLookup: () => "America/Sao_Paulo",
    });
    const result = await resolver.resolve("Florianópolis, SC");
    expect(result.status).toBe("resolved");
    if (result.status !== "resolved") throw new Error("Expected resolved result");
    expect(result.value.destination).toMatchObject({
      name: "Florianópolis",
      type: "city",
      countryCode: "BR",
      timeZone: "America/Sao_Paulo",
    });
    expect(result.value.provenance).toMatchObject({
      provider: "nominatim-osm",
      externalReference: "R296514",
      sourceLicense: "ODbL-1.0",
      confidenceLevel: "high",
    });
    expect(result.value.bounds).toBeDefined();
  });

  it("resolve Pipa sem regra regional no resolver", async () => {
    const resolver = new NominatimDestinationResolver({
      fetcher: async () =>
        response([
          {
            osm_type: "node",
            osm_id: 12345,
            name: "Pipa",
            display_name: "Pipa, Tibau do Sul, Rio Grande do Norte, Brasil",
            lat: "-6.2302",
            lon: "-35.0503",
            category: "place",
            type: "village",
            addresstype: "village",
            importance: 0.55,
            address: {
              village: "Pipa",
              municipality: "Tibau do Sul",
              state: "Rio Grande do Norte",
              "ISO3166-2-lvl4": "BR-RN",
              country: "Brasil",
              country_code: "br",
            },
          },
        ]),
      timeZoneLookup: () => "America/Fortaleza",
    });
    const result = await resolver.resolve("Pipa, RN");
    expect(result.status).toBe("resolved");
    if (result.status !== "resolved") throw new Error("Expected resolved result");
    expect(result.value.destination).toMatchObject({
      name: "Pipa",
      type: "district",
      countryCode: "BR",
      timeZone: "America/Fortaleza",
    });
  });

  it("não escolhe silenciosamente homônimos distantes", async () => {
    const resolver = new NominatimDestinationResolver({
      fetcher: async () =>
        response([
          {
            osm_type: "relation",
            osm_id: 1,
            name: "Springfield",
            display_name: "Springfield, Estado A, Estados Unidos",
            lat: "10",
            lon: "10",
            addresstype: "city",
            importance: 0.7,
            address: { city: "Springfield", country_code: "us" },
          },
          {
            osm_type: "relation",
            osm_id: 2,
            name: "Springfield",
            display_name: "Springfield, Estado B, Estados Unidos",
            lat: "40",
            lon: "-90",
            addresstype: "city",
            importance: 0.6,
            address: { city: "Springfield", country_code: "us" },
          },
        ]),
      timeZoneLookup: () => "Etc/UTC",
    });
    await expect(resolver.resolve("Springfield")).resolves.toMatchObject({ status: "ambiguous" });
  });

  it("descarta candidato sem identidade OSM estável", async () => {
    const resolver = new NominatimDestinationResolver({
      fetcher: async () =>
        response([
          {
            name: "Cidade sem identidade",
            display_name: "Cidade sem identidade, Brasil",
            lat: "-10",
            lon: "-40",
            addresstype: "city",
            address: { city: "Cidade sem identidade", country_code: "br" },
          },
        ]),
      timeZoneLookup: () => "America/Bahia",
    });
    await expect(resolver.resolve("Cidade sem identidade")).resolves.toEqual({ status: "not-found" });
  });

  it("degrada falha de rede sem inventar Destination", async () => {
    const resolver = new NominatimDestinationResolver({
      fetcher: async () => {
        throw new Error("network down");
      },
    });
    await expect(resolver.resolve("Florianópolis, SC")).resolves.toEqual({
      status: "unavailable",
      reason: "provider-error",
    });
  });
});

describe("timezone local", () => {
  it("resolve IANA para Pipa e Florianópolis", () => {
    expect(resolveIanaTimeZone(-6.2302, -35.0503)).toBe("America/Fortaleza");
    expect(resolveIanaTimeZone(-27.5949, -48.5482)).toBe("America/Sao_Paulo");
  });
});

describe("configuração", () => {
  it("fica desligado por default", () => {
    vi.stubEnv("ROUTEBOOK_DESTINATION_RESOLVER", "");
    expect(resolveConfiguredDestinationResolver()).toEqual({
      status: "unavailable",
      reason: "disabled",
    });
  });

  it("bloqueia Nominatim em Production", () => {
    vi.stubEnv("ROUTEBOOK_DESTINATION_RESOLVER", "nominatim");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(resolveConfiguredDestinationResolver()).toEqual({
      status: "unavailable",
      reason: "blocked",
    });
  });

  it("libera fixture somente sob flag E2E e fora da Vercel", async () => {
    vi.stubEnv("ROUTEBOOK_DESTINATION_RESOLVER", "fixture");
    vi.stubEnv("ROUTEBOOK_E2E_DESTINATION_RESOLVER", "1");
    vi.stubEnv("VERCEL_ENV", "");
    const configured = resolveConfiguredDestinationResolver();
    expect(configured.status).toBe("configured");
    if (configured.status !== "configured") throw new Error("Expected configured resolver");
    const result = await configured.resolver.resolve("Florianópolis, SC");
    expect(result.status).toBe("resolved");
  });
});
