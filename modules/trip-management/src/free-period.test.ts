import { describe, expect, it } from "vitest";

import { removeFreePeriod } from "./free-period-removal";
import {
  addFreePeriod,
  createItinerary,
  ItineraryValidationError,
  updateFreePeriod,
} from "./itinerary";

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

describe("updateFreePeriod", () => {
  it("edita modo e opcionais preservando identidade, dia, ordem e criação", () => {
    const createdAt = new Date("2026-07-30T13:10:00Z");
    const itinerary = addFreePeriod(
      createBaseItinerary(),
      {
        dayDate: "2026-08-23",
        mode: "flexible",
        startTime: "14:00",
        durationMinutes: 120,
      },
      createdAt,
    );
    const originalFreePeriod = itinerary.days[1]?.freePeriods[0];
    const updatedAt = new Date("2026-07-30T14:00:00Z");
    const updated = updateFreePeriod(
      itinerary,
      {
        freePeriodId: originalFreePeriod!.id,
        mode: "protected",
      },
      updatedAt,
    );
    const editedFreePeriod = updated.days[1]?.freePeriods[0];

    expect(itinerary.days[1]?.freePeriods[0]).toEqual(originalFreePeriod);
    expect(editedFreePeriod).toEqual({
      id: originalFreePeriod?.id,
      mode: "protected",
      order: originalFreePeriod?.order,
      createdAt,
      updatedAt,
    });
    expect(updated.days[1]?.id).toBe(itinerary.days[1]?.id);
    expect(updated.version).toBe(itinerary.version + 1);
    expect(updated.updatedAt).toEqual(updatedAt);
  });

  it("define novamente horário e duração opcionais", () => {
    const itinerary = addFreePeriod(createBaseItinerary(), {
      dayDate: "2026-08-23",
      mode: "protected",
    });
    const freePeriod = itinerary.days[1]?.freePeriods[0];
    const updated = updateFreePeriod(itinerary, {
      freePeriodId: freePeriod!.id,
      mode: "flexible",
      startTime: "16:30",
      durationMinutes: 75,
    });

    expect(updated.days[1]?.freePeriods[0]).toMatchObject({
      id: freePeriod?.id,
      mode: "flexible",
      startTime: "16:30",
      durationMinutes: 75,
      order: freePeriod?.order,
      createdAt: freePeriod?.createdAt,
    });
  });

  it("rejeita identidade ausente e detalhes inválidos", () => {
    try {
      updateFreePeriod(createBaseItinerary(), {
        freePeriodId: "free-period-inexistente",
        mode: "invalid" as "flexible",
        startTime: "26:00",
        durationMinutes: -10,
      });
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(ItineraryValidationError);
      const validationError = error as ItineraryValidationError;
      expect(validationError.fieldErrors.freePeriodId).toBeDefined();
      expect(validationError.fieldErrors.mode).toBeDefined();
      expect(validationError.fieldErrors.startTime).toBeDefined();
      expect(validationError.fieldErrors.durationMinutes).toBeDefined();
    }
  });
});

describe("removeFreePeriod", () => {
  it("remove somente o item alvo e normaliza a ordem sem mutar o roteiro original", () => {
    const firstAt = new Date("2026-07-30T15:00:00Z");
    const secondAt = new Date("2026-07-30T15:10:00Z");
    const thirdAt = new Date("2026-07-30T15:20:00Z");
    const otherDayAt = new Date("2026-07-30T15:30:00Z");
    let itinerary = addFreePeriod(
      createBaseItinerary(),
      { dayDate: "2026-08-23", mode: "flexible" },
      firstAt,
    );
    itinerary = addFreePeriod(
      itinerary,
      { dayDate: "2026-08-23", mode: "protected" },
      secondAt,
    );
    itinerary = addFreePeriod(
      itinerary,
      { dayDate: "2026-08-23", mode: "flexible" },
      thirdAt,
    );
    itinerary = addFreePeriod(
      itinerary,
      { dayDate: "2026-08-24", mode: "protected" },
      otherDayAt,
    );
    const [first, target, third] = itinerary.days[1]!.freePeriods;
    const otherDayPeriod = itinerary.days[2]!.freePeriods[0];
    const removedAt = new Date("2026-07-30T16:00:00Z");

    const updated = removeFreePeriod(itinerary, { freePeriodId: target!.id }, removedAt);

    expect(itinerary.days[1]?.freePeriods).toHaveLength(3);
    expect(updated.days[1]?.freePeriods.map((item) => item.id)).toEqual([first!.id, third!.id]);
    expect(updated.days[1]?.freePeriods.map((item) => item.order)).toEqual([1, 2]);
    expect(updated.days[1]?.freePeriods[0]?.updatedAt).toEqual(first!.updatedAt);
    expect(updated.days[1]?.freePeriods[1]?.updatedAt).toEqual(removedAt);
    expect(updated.days[2]?.freePeriods[0]).toBe(otherDayPeriod);
    expect(updated.version).toBe(itinerary.version + 1);
    expect(updated.updatedAt).toEqual(removedAt);
  });

  it("rejeita identidade vazia ou que não pertence ao roteiro", () => {
    for (const freePeriodId of ["", "free-period-inexistente"]) {
      try {
        removeFreePeriod(createBaseItinerary(), { freePeriodId });
        throw new Error("A validação deveria falhar.");
      } catch (error) {
        expect(error).toBeInstanceOf(ItineraryValidationError);
        expect((error as ItineraryValidationError).fieldErrors.freePeriodId).toBeDefined();
      }
    }
  });
});
