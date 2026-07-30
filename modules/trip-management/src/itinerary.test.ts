import { describe, expect, it } from "vitest";

import { addActivity, createItinerary, ItineraryValidationError } from "./itinerary";

const period = {
  startDate: "2026-08-22",
  endDate: "2026-08-29",
  timeZone: "America/Fortaleza" as const,
};

function createBaseItinerary() {
  return createItinerary(
    {
      tripId: "trip-pipa-2026",
      period,
    },
    new Date("2026-07-30T02:00:00Z"),
  );
}

describe("createItinerary", () => {
  it("cria os dias do período inclusivo em ordem cronológica", () => {
    const itinerary = createBaseItinerary();

    expect(itinerary.tripId).toBe("trip-pipa-2026");
    expect(itinerary.days).toHaveLength(8);
    expect(itinerary.days[0]).toMatchObject({ date: "2026-08-22", position: 1, activities: [] });
    expect(itinerary.days[7]).toMatchObject({ date: "2026-08-29", position: 8, activities: [] });
    expect(new Set(itinerary.days.map((day) => day.date)).size).toBe(8);
    expect(itinerary.version).toBe(1);
  });

  it("rejeita viagem vazia e período invertido", () => {
    expect(() =>
      createItinerary({
        tripId: " ",
        period: { ...period, startDate: "2026-08-29", endDate: "2026-08-22" },
      }),
    ).toThrow(ItineraryValidationError);
  });
});

describe("addActivity", () => {
  it("adiciona atividade vinculada a lugar sem exigir horário", () => {
    const itinerary = createBaseItinerary();
    const updated = addActivity(
      itinerary,
      {
        dayDate: "2026-08-23",
        title: "Praia do Amor",
        type: "place-visit",
        placeId: "place-praia-do-amor",
        durationMinutes: 180,
      },
      new Date("2026-07-30T03:00:00Z"),
    );

    expect(updated.days[1]?.activities).toHaveLength(1);
    expect(updated.days[1]?.activities[0]).toMatchObject({
      title: "Praia do Amor",
      type: "place-visit",
      status: "planned",
      flexibility: "flexible",
      placeId: "place-praia-do-amor",
      durationMinutes: 180,
      order: 1,
    });
    expect(updated.days[1]?.activities[0]?.startTime).toBeUndefined();
    expect(updated.version).toBe(2);
    expect(updated.updatedAt).toEqual(new Date("2026-07-30T03:00:00Z"));
    expect(itinerary.days[1]?.activities).toHaveLength(0);
  });

  it("mantém ordem determinística dentro do dia", () => {
    const first = addActivity(createBaseItinerary(), {
      dayDate: "2026-08-24",
      title: "Café da manhã",
      type: "meal",
      startTime: "09:00",
    });
    const second = addActivity(first, {
      dayDate: "2026-08-24",
      title: "Passeio de barco",
      type: "tour",
      startTime: "11:00",
    });

    expect(second.days[2]?.activities.map((activity) => activity.order)).toEqual([1, 2]);
    expect(second.version).toBe(3);
  });

  it("rejeita dia fora da viagem, título vazio, horário e duração inválidos", () => {
    try {
      addActivity(createBaseItinerary(), {
        dayDate: "2026-08-30",
        title: " ",
        startTime: "25:70",
        durationMinutes: 0,
      });
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(ItineraryValidationError);
      const validationError = error as ItineraryValidationError;
      expect(validationError.fieldErrors.dayDate).toBeDefined();
      expect(validationError.fieldErrors.title).toBeDefined();
      expect(validationError.fieldErrors.startTime).toBeDefined();
      expect(validationError.fieldErrors.durationMinutes).toBeDefined();
    }
  });
});
