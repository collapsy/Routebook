import { describe, expect, it } from "vitest";

import { createTrip, TripValidationError } from "./trip";

const validInput = {
  name: "Pipa em agosto",
  startDate: "2026-08-22",
  endDate: "2026-08-29",
  ownerName: "Ronaldo",
  accommodationName: "Condomínio Solar Água",
  accommodationAddress: "Pipa, Tibau do Sul - RN",
};

describe("createTrip", () => {
  it("cria uma viagem draft com destino canônico e owner", () => {
    const trip = createTrip(validInput, new Date("2026-07-28T12:00:00Z"));

    expect(trip.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(trip.destination.name).toBe("Pipa, Tibau do Sul - RN");
    expect(trip.period).toEqual({
      startDate: "2026-08-22",
      endDate: "2026-08-29",
      timeZone: "America/Fortaleza",
    });
    expect(trip.participants).toHaveLength(1);
    expect(trip.participants[0]?.role).toBe("owner");
    expect(trip.contextVersion).toBe(1);
  });

  it("mantém hospedagem opcional", () => {
    const trip = createTrip({ ...validInput, accommodationName: "", accommodationAddress: "" });
    expect(trip.accommodation).toBeUndefined();
  });

  it("associa coordenadas válidas à hospedagem", () => {
    const trip = createTrip({
      ...validInput,
      accommodationLatitude: -6.2289,
      accommodationLongitude: -35.0521,
    });

    expect(trip.accommodation?.coordinate).toEqual({
      latitude: -6.2289,
      longitude: -35.0521,
    });
  });

  it("mantém viagens existentes válidas sem coordenadas", () => {
    const trip = createTrip(validInput);
    expect(trip.accommodation?.coordinate).toBeUndefined();
  });

  it("rejeita coordenada parcial da hospedagem", () => {
    try {
      createTrip({ ...validInput, accommodationLatitude: -6.2289 });
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(TripValidationError);
      expect((error as TripValidationError).fieldErrors.accommodationLongitude).toBeDefined();
    }
  });

  it("rejeita coordenadas fora dos limites geográficos", () => {
    expect(() =>
      createTrip({
        ...validInput,
        accommodationLatitude: -91,
        accommodationLongitude: -181,
      }),
    ).toThrow(TripValidationError);
  });

  it("rejeita período invertido", () => {
    expect(() =>
      createTrip({ ...validInput, startDate: "2026-08-29", endDate: "2026-08-22" }),
    ).toThrow(TripValidationError);
  });

  it("rejeita criação sem owner", () => {
    try {
      createTrip({ ...validInput, ownerName: "" });
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(TripValidationError);
      expect((error as TripValidationError).fieldErrors.ownerName).toBeDefined();
    }
  });
});
