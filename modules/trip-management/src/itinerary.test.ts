import { describe, expect, it } from "vitest";

import {
  addActivity,
  createItinerary,
  ItineraryValidationError,
  moveActivity,
  removeActivity,
  reorderActivities,
  updateActivity,
} from "./itinerary";

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

describe("updateActivity", () => {
  it("edita dados planejáveis preservando identidade, posição e vínculo", () => {
    const itinerary = addActivity(createBaseItinerary(), {
      dayDate: "2026-08-24",
      title: "Praia do Amor",
      type: "place-visit",
      placeId: "place-praia-do-amor",
      startTime: "09:00",
      durationMinutes: 180,
    });
    const original = itinerary.days[2]?.activities[0];
    expect(original).toBeDefined();

    const updatedAt = new Date("2026-07-30T03:30:00Z");
    const updated = updateActivity(
      itinerary,
      {
        activityId: original!.id,
        title: "Caminhada na Praia do Amor",
        durationMinutes: 120,
      },
      updatedAt,
    );
    const activity = updated.days[2]?.activities[0];

    expect(activity).toMatchObject({
      id: original!.id,
      title: "Caminhada na Praia do Amor",
      type: "place-visit",
      status: "planned",
      flexibility: "flexible",
      durationMinutes: 120,
      order: 1,
      placeId: "place-praia-do-amor",
      createdAt: original!.createdAt,
      updatedAt,
    });
    expect(activity?.startTime).toBeUndefined();
    expect(updated.days[2]?.id).toBe(itinerary.days[2]?.id);
    expect(updated.version).toBe(3);
    expect(updated.updatedAt).toEqual(updatedAt);
    expect(original?.title).toBe("Praia do Amor");
    expect(original?.startTime).toBe("09:00");
  });

  it("rejeita identidade ausente e dados planejáveis inválidos", () => {
    try {
      updateActivity(createBaseItinerary(), {
        activityId: "activity-inexistente",
        title: " ",
        startTime: "29:00",
        durationMinutes: -1,
      });
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(ItineraryValidationError);
      const validationError = error as ItineraryValidationError;
      expect(validationError.fieldErrors.activityId).toBeDefined();
      expect(validationError.fieldErrors.title).toBeDefined();
      expect(validationError.fieldErrors.startTime).toBeDefined();
      expect(validationError.fieldErrors.durationMinutes).toBeDefined();
    }
  });
});

describe("reorderActivities", () => {
  it("troca duas posições no mesmo dia preservando dados e imutabilidade", () => {
    const first = addActivity(createBaseItinerary(), {
      dayDate: "2026-08-24",
      title: "Primeira atividade",
      placeId: "place-primeira",
    });
    const second = addActivity(first, {
      dayDate: "2026-08-24",
      title: "Segunda atividade",
      startTime: "10:00",
    });
    const third = addActivity(second, {
      dayDate: "2026-08-24",
      title: "Terceira atividade",
    });
    const activities = third.days[2]?.activities;
    expect(activities).toHaveLength(3);

    const updatedAt = new Date("2026-07-30T03:45:00Z");
    const updated = reorderActivities(
      third,
      {
        activityId: activities![1]!.id,
        targetActivityId: activities![0]!.id,
      },
      updatedAt,
    );

    expect(updated.days[2]?.activities.map((activity) => activity.title)).toEqual([
      "Segunda atividade",
      "Primeira atividade",
      "Terceira atividade",
    ]);
    expect(updated.days[2]?.activities.map((activity) => activity.order)).toEqual([1, 2, 3]);
    expect(updated.days[2]?.activities[0]).toMatchObject({
      id: activities![1]!.id,
      startTime: "10:00",
      updatedAt,
    });
    expect(updated.days[2]?.activities[1]).toMatchObject({
      id: activities![0]!.id,
      placeId: "place-primeira",
      updatedAt,
    });
    expect(updated.days[2]?.activities[2]).toBe(activities![2]);
    expect(updated.version).toBe(5);
    expect(third.days[2]?.activities.map((activity) => activity.title)).toEqual([
      "Primeira atividade",
      "Segunda atividade",
      "Terceira atividade",
    ]);
  });

  it("rejeita identidades iguais, ausentes ou pertencentes a dias diferentes", () => {
    const first = addActivity(createBaseItinerary(), {
      dayDate: "2026-08-22",
      title: "Dia um",
    });
    const second = addActivity(first, {
      dayDate: "2026-08-23",
      title: "Dia dois",
    });
    const sourceId = second.days[0]?.activities[0]?.id;
    const targetId = second.days[1]?.activities[0]?.id;
    expect(sourceId).toBeDefined();
    expect(targetId).toBeDefined();

    expect(() =>
      reorderActivities(second, { activityId: sourceId!, targetActivityId: sourceId! }),
    ).toThrow(ItineraryValidationError);
    expect(() =>
      reorderActivities(second, { activityId: sourceId!, targetActivityId: targetId! }),
    ).toThrow(ItineraryValidationError);
    expect(() =>
      reorderActivities(second, {
        activityId: "activity-inexistente",
        targetActivityId: targetId!,
      }),
    ).toThrow(ItineraryValidationError);
  });
});

describe("moveActivity", () => {
  it("move para outro dia preservando identidade e normalizando as duas sequências", () => {
    const first = addActivity(createBaseItinerary(), {
      dayDate: "2026-08-22",
      title: "Café da manhã",
    });
    const second = addActivity(first, {
      dayDate: "2026-08-22",
      title: "Praia do Amor",
      type: "place-visit",
      placeId: "place-praia-do-amor",
      startTime: "10:30",
      durationMinutes: 180,
    });
    const third = addActivity(second, {
      dayDate: "2026-08-22",
      title: "Jantar",
    });
    const fourth = addActivity(third, {
      dayDate: "2026-08-23",
      title: "Passeio existente",
    });
    const sourceActivities = fourth.days[0]?.activities;
    const moved = sourceActivities?.[1];
    expect(moved).toBeDefined();

    const updatedAt = new Date("2026-07-30T03:50:00Z");
    const updated = moveActivity(
      fourth,
      { activityId: moved!.id, targetDayDate: "2026-08-23" },
      updatedAt,
    );

    expect(updated.days[0]?.activities.map((activity) => activity.title)).toEqual([
      "Café da manhã",
      "Jantar",
    ]);
    expect(updated.days[0]?.activities.map((activity) => activity.order)).toEqual([1, 2]);
    expect(updated.days[0]?.activities[1]?.updatedAt).toEqual(updatedAt);
    expect(updated.days[1]?.activities.map((activity) => activity.title)).toEqual([
      "Passeio existente",
      "Praia do Amor",
    ]);
    expect(updated.days[1]?.activities.map((activity) => activity.order)).toEqual([1, 2]);
    expect(updated.days[1]?.activities[1]).toMatchObject({
      id: moved!.id,
      title: "Praia do Amor",
      type: "place-visit",
      status: "planned",
      flexibility: "flexible",
      placeId: "place-praia-do-amor",
      startTime: "10:30",
      durationMinutes: 180,
      createdAt: moved!.createdAt,
      updatedAt,
    });
    expect(updated.version).toBe(6);
    expect(updated.updatedAt).toEqual(updatedAt);
    expect(fourth.days[0]?.activities).toHaveLength(3);
    expect(fourth.days[1]?.activities).toHaveLength(1);
  });

  it("rejeita atividade inexistente, destino inválido e o próprio dia", () => {
    const itinerary = addActivity(createBaseItinerary(), {
      dayDate: "2026-08-22",
      title: "Atividade",
    });
    const activityId = itinerary.days[0]?.activities[0]?.id;
    expect(activityId).toBeDefined();

    expect(() =>
      moveActivity(itinerary, {
        activityId: "activity-inexistente",
        targetDayDate: "2026-08-23",
      }),
    ).toThrow(ItineraryValidationError);
    expect(() =>
      moveActivity(itinerary, { activityId: activityId!, targetDayDate: "2026-08-30" }),
    ).toThrow(ItineraryValidationError);

    try {
      moveActivity(itinerary, { activityId: activityId!, targetDayDate: "2026-08-22" });
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(ItineraryValidationError);
      expect((error as ItineraryValidationError).fieldErrors.targetDayDate).toBeDefined();
    }
  });
});

describe("removeActivity", () => {
  it("remove a atividade e normaliza a ordem sem mutar o roteiro original", () => {
    const first = addActivity(createBaseItinerary(), {
      dayDate: "2026-08-24",
      title: "Café da manhã",
    });
    const second = addActivity(first, {
      dayDate: "2026-08-24",
      title: "Passeio de barco",
      placeId: "place-passeio-de-barco",
    });
    const third = addActivity(second, {
      dayDate: "2026-08-24",
      title: "Jantar",
    });
    const removedId = third.days[2]?.activities[1]?.id;
    expect(removedId).toBeDefined();

    const updatedAt = new Date("2026-07-30T04:00:00Z");
    const updated = removeActivity(third, { activityId: removedId! }, updatedAt);

    expect(updated.days[2]?.activities.map((activity) => activity.title)).toEqual([
      "Café da manhã",
      "Jantar",
    ]);
    expect(updated.days[2]?.activities.map((activity) => activity.order)).toEqual([1, 2]);
    expect(updated.days[2]?.activities[1]?.updatedAt).toEqual(updatedAt);
    expect(updated.version).toBe(5);
    expect(updated.updatedAt).toEqual(updatedAt);
    expect(third.days[2]?.activities).toHaveLength(3);
    expect(third.days[2]?.activities[1]?.placeId).toBe("place-passeio-de-barco");
  });

  it("rejeita identidade vazia ou ausente do roteiro", () => {
    expect(() => removeActivity(createBaseItinerary(), { activityId: " " })).toThrow(
      ItineraryValidationError,
    );

    try {
      removeActivity(createBaseItinerary(), { activityId: "activity-inexistente" });
      throw new Error("A validação deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(ItineraryValidationError);
      expect((error as ItineraryValidationError).fieldErrors.activityId).toBeDefined();
    }
  });
});
