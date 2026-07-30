import { describe, expect, it } from "vitest";

import { addFreePeriod, createItinerary, ItineraryValidationError } from "./itinerary";

const period = {
  startDate: "2026-08-22",
  endDate: "2026-08-29",
  timeZone: "America/Fortaleza" as const,
};

function createBaseItinerary() {
  return createItinerary(
    { tripId: "trip-pipa-free-period", period },
    new Date("2026-07-30T13:00:00Z"),
  );
}

describe("addFreePeriod", () => {
  it("adiciona períodos livres ordenados sem mutar o roteiro original", () => {
    const original = createBaseItinerary();
    const firstAt = new Date("2026-07-30T13:10:00Z");
    const first = addFreePeriod(
      original,
      {
        dayDate: "2026-08-23",
        mode: "flexible",
        startTime: "14:00",
        durationMinutes: 120,
      },
      firstAt,
    );
    const secondAt = new Date("2026-07-30T13:20:00Z");
    const second = addFreePeriod(first, { dayDate: "2026-08-23", mode: "protected" }, secondAt);

    expect(original.days[1]?.freePeriods).toEqual([]);
    expect(second.days[1]?.freePeriods).toHaveLength(2);
    expect(second.days[1]?.freePeriods[0]).toMatchObject({
      mode: "flexible",
      startTime: "14:00",
      durationMinutes: 120,
      order: 1,
      createdAt: firstAt,
      updatedAt: firstAt,
    });
    expect(second.days[1]?.freePeriods[1]).toMatchObject({
      mode: "protected",
      order: 2,
      createdAt: secondAt,
      updatedAt: secondAt,
    });
    expect(second.days[1]?.freePeriods[1]?.startTime).toBeUndefined();
    expect(second.days[1]?.freePeriods[1]?.durationMinutes).toBeUndefined();
    expect(second.version).toBe(3);
    expect(second.updatedAt).toEqual(secondAt);
  });

  it("rejeita dia, modo, horário e duração inválidos", () => {
    try {
      addFreePeriod(createBaseItinerary(), {
        dayDate: "2026-08-30",
        mode: "invalid" as "flexible",
        startTime: "25:90",
        durationMinutes: 0,
      });
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(ItineraryValidationError);
      const validationError = error as ItineraryValidationError;
      expect(validationError.fieldErrors.dayDate).toBeDefined();
      expect(validationError.fieldErrors.mode).toBeDefined();
      expect(validationError.fieldErrors.startTime).toBeDefined();
      expect(validationError.fieldErrors.durationMinutes).toBeDefined();
    }
  });
});
