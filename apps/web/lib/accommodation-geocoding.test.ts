import { describe, expect, it, vi } from "vitest";

import type { Trip } from "@routebook/trip-management";

import {
  accommodationNameSearchRadiusKm,
  buildAccommodationGeocodingQuery,
  prepareAccommodationUpdate,
} from "./accommodation-geocoding";
import { GeocodingProviderError, type Geocoder } from "./geocoding";

function trip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Gramado 2026",
    destination: {
      name: "Gramado, RS, Brasil",
      type: "city",
      countryCode: "BR",
      latitude: -29.3746,
      longitude: -50.8764,
      timeZone: "America/Sao_Paulo",
    },
    period: {
      startDate: "2026-11-10",
      endDate: "2026-11-12",
      timeZone: "America/Sao_Paulo",
    },
    status: "draft",
    participants: [],
    contextVersion: 1,
    createdAt: new Date("2026-09-07T00:00:00Z"),
    updatedAt: new Date("2026-09-07T00:00:00Z"),
    ...overrides,
  };
}

function geocoder(result: Awaited<ReturnType<Geocoder["geocode"]>>): Geocoder {
  return { geocode: vi.fn().mockResolvedValue(result) };
}

describe("buildAccommodationGeocodingQuery", () => {
  it("usa endereço e Destination como contexto textual", () => {
    expect(
      buildAccommodationGeocodingQuery(
        "Hotel Teste",
        "Av. Borges de Medeiros, 3000",
        "Gramado, RS, Brasil",
      ),
    ).toBe("Av. Borges de Medeiros, 3000, Gramado, RS, Brasil");
  });

  it("usa somente o nome quando não existe endereço e deixa Destination para o contexto espacial", () => {
    expect(buildAccommodationGeocodingQuery("Hotel Teste", undefined, "Gramado, RS, Brasil")).toBe(
      "Hotel Teste",
    );
  });
});

describe("accommodationNameSearchRadiusKm", () => {
  it("usa limites amplos por tipo canônico sem regra regional", () => {
    expect(accommodationNameSearchRadiusKm("district")).toBe(60);
    expect(accommodationNameSearchRadiusKm("city")).toBe(120);
    expect(accommodationNameSearchRadiusKm("island")).toBe(250);
    expect(accommodationNameSearchRadiusKm("park")).toBe(250);
    expect(accommodationNameSearchRadiusKm("region")).toBe(800);
  });
});

describe("prepareAccommodationUpdate", () => {
  it("resolve endereço automaticamente e preserva a query contextual do RB-INC-181", async () => {
    const provider = geocoder({
      normalizedAddress: "Av. Borges de Medeiros, Gramado, RS, Brasil",
      latitude: -29.378,
      longitude: -50.873,
    });

    const result = await prepareAccommodationUpdate({
      trip: trip(),
      accommodationName: "Hotel Teste",
      accommodationAddress: "Av. Borges de Medeiros, 3000",
      geocoder: provider,
    });

    expect(provider.geocode).toHaveBeenCalledWith(
      "Av. Borges de Medeiros, 3000, Gramado, RS, Brasil",
      { countryCode: "BR" },
    );
    expect(result).toEqual({
      locationStatus: "resolved",
      input: {
        accommodationName: "Hotel Teste",
        accommodationAddress: "Av. Borges de Medeiros, 3000",
        accommodationLatitude: -29.378,
        accommodationLongitude: -50.873,
      },
    });
  });

  it("resolve somente nome usando país, âncora e raio do Destination", async () => {
    const provider = geocoder({
      normalizedAddress: "Hotel Teste, Gramado, RS, Brasil",
      latitude: -29.378,
      longitude: -50.873,
    });

    const result = await prepareAccommodationUpdate({
      trip: trip(),
      accommodationName: "Hotel Teste",
      geocoder: provider,
    });

    expect(provider.geocode).toHaveBeenCalledWith("Hotel Teste", {
      countryCode: "BR",
      anchor: { latitude: -29.3746, longitude: -50.8764 },
      maxDistanceKm: 120,
      rejectAmbiguous: true,
    });
    expect(result).toEqual({
      locationStatus: "resolved",
      input: {
        accommodationName: "Hotel Teste",
        accommodationAddress: "Hotel Teste, Gramado, RS, Brasil",
        accommodationLatitude: -29.378,
        accommodationLongitude: -50.873,
      },
    });
  });

  it("preserva coordenada existente sem chamar Provider quando o endereço não mudou", async () => {
    const provider = geocoder(undefined);
    const current = trip({
      accommodation: {
        name: "Hotel Antigo",
        address: "Rua Coberta, 1",
        coordinate: { latitude: -29.38, longitude: -50.87 },
      },
    });

    const result = await prepareAccommodationUpdate({
      trip: current,
      accommodationName: "Hotel Renomeado",
      accommodationAddress: "Rua Coberta, 1",
      geocoder: provider,
    });

    expect(provider.geocode).not.toHaveBeenCalled();
    expect(result.locationStatus).toBe("preserved");
    expect(result.input.accommodationLatitude).toBe(-29.38);
    expect(result.input.accommodationLongitude).toBe(-50.87);
  });

  it("não mantém coordenada antiga quando endereço muda e não há resultado", async () => {
    const provider = geocoder(undefined);
    const current = trip({
      accommodation: {
        name: "Hotel",
        address: "Endereço antigo",
        coordinate: { latitude: -29.38, longitude: -50.87 },
      },
    });

    const result = await prepareAccommodationUpdate({
      trip: current,
      accommodationName: "Hotel",
      accommodationAddress: "Endereço novo",
      geocoder: provider,
    });

    expect(result.locationStatus).toBe("not-found");
    expect(result.input).toEqual({
      accommodationName: "Hotel",
      accommodationAddress: "Endereço novo",
    });
  });

  it("não inventa coordenada quando name-only não produz candidato seguro", async () => {
    const provider = geocoder(undefined);

    const result = await prepareAccommodationUpdate({
      trip: trip(),
      accommodationName: "Hotel Homônimo",
      geocoder: provider,
    });

    expect(result.locationStatus).toBe("not-found");
    expect(result.input).toEqual({ accommodationName: "Hotel Homônimo" });
  });

  it("degrada erro do Provider sem inventar coordenadas", async () => {
    const provider: Geocoder = {
      geocode: vi.fn().mockRejectedValue(new GeocodingProviderError()),
    };

    const result = await prepareAccommodationUpdate({
      trip: trip(),
      accommodationName: "Hotel",
      accommodationAddress: "Rua X, 10",
      geocoder: provider,
    });

    expect(result.locationStatus).toBe("unavailable");
    expect(result.input.accommodationLatitude).toBeUndefined();
    expect(result.input.accommodationLongitude).toBeUndefined();
  });

  it("coordenadas manuais ignoram o Provider", async () => {
    const provider = geocoder(undefined);

    const result = await prepareAccommodationUpdate({
      trip: trip(),
      accommodationName: "Hotel",
      accommodationAddress: "Rua X, 10",
      manualLatitude: -29.4,
      manualLongitude: -50.9,
      geocoder: provider,
    });

    expect(provider.geocode).not.toHaveBeenCalled();
    expect(result.locationStatus).toBe("manual");
    expect(result.input.accommodationLatitude).toBe(-29.4);
    expect(result.input.accommodationLongitude).toBe(-50.9);
  });

  it("remoção não chama Provider", async () => {
    const provider = geocoder(undefined);

    const result = await prepareAccommodationUpdate({
      trip: trip(),
      accommodationName: "",
      geocoder: provider,
    });

    expect(provider.geocode).not.toHaveBeenCalled();
    expect(result).toEqual({ input: { accommodationName: "" }, locationStatus: "removed" });
  });
});
