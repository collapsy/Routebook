import { describe, expect, it } from "vitest";

import { createTrip, TripValidationError } from "./trip";

const input = {
  name: "Pipa autenticada",
  destination: {
    name: "Pipa, Tibau do Sul - RN",
    type: "district" as const,
    countryCode: "BR",
    latitude: -6.2302,
    longitude: -35.0503,
    timeZone: "America/Fortaleza",
  },
  startDate: "2026-08-22",
  endDate: "2026-08-29",
  ownerName: "Ronaldo",
};

const ownerUserId = "11111111-1111-4111-8111-111111111111";

describe("authenticated Trip owner", () => {
  it("preserva o User autenticado como owner participant", () => {
    const trip = createTrip({ ...input, ownerUserId });

    expect(trip.participants).toEqual([
      {
        userId: ownerUserId,
        displayName: "Ronaldo",
        role: "owner",
      },
    ]);
  });

  it("mantém geração legada quando ownerUserId não é fornecido", () => {
    const trip = createTrip(input);

    expect(trip.participants[0]?.userId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("rejeita ownerUserId inválido", () => {
    try {
      createTrip({ ...input, ownerUserId: "client-controlled-id" });
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(TripValidationError);
      expect((error as TripValidationError).fieldErrors.ownerUserId).toBeDefined();
    }
  });
});
