import { describe, expect, it } from "vitest";

import { saveTravelerProfile, TravelerProfileValidationError } from "./profile";

const validInput = {
  tripId: "00000000-0000-4000-8000-000000000001",
  travelerCount: 3,
  interests: ["beaches", "gastronomy", "nightlife"],
  pace: "balanced",
  transportPreference: "ride-hailing",
  budgetTotalCents: 450000,
};

describe("saveTravelerProfile", () => {
  it("cria um perfil separado da viagem com orçamento estimado em BRL", () => {
    const profile = saveTravelerProfile(validInput, undefined, new Date("2026-07-28T12:00:00Z"));

    expect(profile.tripId).toBe(validInput.tripId);
    expect(profile.travelerCount).toBe(3);
    expect(profile.interests).toEqual(["beaches", "gastronomy", "nightlife"]);
    expect(profile.budget).toEqual({ totalCents: 450000, currency: "BRL", kind: "estimate" });
    expect(profile.version).toBe(1);
  });

  it("mantém orçamento ausente como não informado", () => {
    const profile = saveTravelerProfile({ ...validInput, budgetTotalCents: undefined });
    expect(profile.budget).toBeUndefined();
  });

  it("incrementa a versão ao atualizar", () => {
    const current = saveTravelerProfile(validInput);
    const updated = saveTravelerProfile({ ...validInput, pace: "relaxed" }, current);

    expect(updated.id).toBe(current.id);
    expect(updated.version).toBe(2);
    expect(updated.pace).toBe("relaxed");
  });

  it("rejeita quantidade e orçamento inválidos", () => {
    expect(() =>
      saveTravelerProfile({ ...validInput, travelerCount: 0, budgetTotalCents: 0 }),
    ).toThrow(TravelerProfileValidationError);
  });
});
