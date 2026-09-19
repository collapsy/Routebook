import { describe, expect, it } from "vitest";

import { addActivity, createItinerary, type Itinerary } from "./itinerary";
import { createReplanningWindow, ReplanningWindowValidationError } from "./replanning-window";

function createFortalezaItinerary(): Itinerary {
  return createItinerary(
    {
      tripId: "trip-replanning",
      period: {
        startDate: "2026-08-22",
        endDate: "2026-08-25",
        timeZone: "America/Fortaleza",
      },
    },
    new Date("2026-08-01T00:00:00.000Z"),
  );
}

function add(itinerary: Itinerary, input: Parameters<typeof addActivity>[1]): Itinerary {
  return addActivity(itinerary, input, new Date("2026-08-01T01:00:00.000Z"));
}

describe("createReplanningWindow", () => {
  it("usa o timezone da Trip e não o timezone do servidor na fronteira de data", () => {
    const itinerary = createFortalezaItinerary();
    const window = createReplanningWindow(itinerary, new Date("2026-08-24T01:30:00.000Z"));

    expect(window.localDate).toBe("2026-08-23");
    expect(window.localTime).toBe("22:30");
    expect(window.timeZone).toBe("America/Fortaleza");
    expect(window.eligibleDayIds).toEqual([
      itinerary.days[1]!.id,
      itinerary.days[2]!.id,
      itinerary.days[3]!.id,
    ]);
  });

  it("protege passado e classifica o trecho transcorrido do Dia atual", () => {
    let itinerary = createFortalezaItinerary();

    itinerary = add(itinerary, {
      dayDate: "2026-08-22",
      title: "Atividade no passado",
      startTime: "18:00",
    });
    itinerary = add(itinerary, {
      dayDate: "2026-08-23",
      title: "Atividade encerrada",
      startTime: "09:00",
      durationMinutes: 60,
    });
    itinerary = add(itinerary, {
      dayDate: "2026-08-23",
      title: "Atividade em andamento",
      startTime: "11:30",
      durationMinutes: 120,
    });
    itinerary = add(itinerary, {
      dayDate: "2026-08-23",
      title: "Início passado sem duração",
      startTime: "10:00",
    });
    itinerary = add(itinerary, {
      dayDate: "2026-08-23",
      title: "Sem horário",
    });
    itinerary = add(itinerary, {
      dayDate: "2026-08-23",
      title: "Atividade futura",
      startTime: "14:00",
      durationMinutes: 90,
    });

    const past = itinerary.days[0]!.activities[0]!;
    const elapsed = itinerary.days[1]!.activities[0]!;
    const inProgress = itinerary.days[1]!.activities[1]!;
    const withoutDuration = itinerary.days[1]!.activities[2]!;
    const unscheduled = itinerary.days[1]!.activities[3]!;
    const future = itinerary.days[1]!.activities[4]!;

    const window = createReplanningWindow(itinerary, new Date("2026-08-23T15:00:00.000Z"));

    expect(window.localTime).toBe("12:00");
    expect(window.reasonByActivityId[past.id]).toBe("PAST_DAY");
    expect(window.reasonByActivityId[elapsed.id]).toBe("CURRENT_DAY_ELAPSED");
    expect(window.reasonByActivityId[inProgress.id]).toBe("CURRENT_DAY_IN_PROGRESS");
    expect(window.reasonByActivityId[withoutDuration.id]).toBe(
      "CURRENT_DAY_STARTED_WITHOUT_DURATION",
    );
    expect(window.reasonByActivityId[unscheduled.id]).toBe("CURRENT_DAY_UNSCHEDULED");
    expect(window.eligibleActivityIds).toContain(future.id);
    expect(window.protectedActivityIds).toEqual(
      expect.arrayContaining([
        past.id,
        elapsed.id,
        inProgress.id,
        withoutDuration.id,
        unscheduled.id,
      ]),
    );
  });

  it("protege fixed e estados terminais mesmo quando estão no futuro", () => {
    let itinerary = createFortalezaItinerary();

    itinerary = add(itinerary, {
      dayDate: "2026-08-24",
      title: "Fixed",
      flexibility: "fixed",
      startTime: "15:00",
    });
    itinerary = add(itinerary, {
      dayDate: "2026-08-24",
      title: "Completed",
      status: "completed",
    });
    itinerary = add(itinerary, {
      dayDate: "2026-08-24",
      title: "Skipped",
      status: "skipped",
    });
    itinerary = add(itinerary, {
      dayDate: "2026-08-24",
      title: "Cancelled",
      status: "cancelled",
    });
    itinerary = add(itinerary, {
      dayDate: "2026-08-24",
      title: "Removed",
      status: "removed",
    });

    const activities = itinerary.days[2]!.activities;
    const window = createReplanningWindow(itinerary, new Date("2026-08-23T15:00:00.000Z"));

    expect(window.reasonByActivityId[activities[0]!.id]).toBe("FIXED_ACTIVITY");
    for (const activity of activities.slice(1)) {
      expect(window.reasonByActivityId[activity.id]).toBe("TERMINAL_ACTIVITY");
    }
  });

  it("mantém unavailable e needs-review futuros elegíveis para Proposal explícita", () => {
    let itinerary = createFortalezaItinerary();
    itinerary = add(itinerary, {
      dayDate: "2026-08-24",
      title: "Unavailable",
      status: "unavailable",
    });
    itinerary = add(itinerary, {
      dayDate: "2026-08-24",
      title: "Needs review",
      status: "needs-review",
    });

    const activities = itinerary.days[2]!.activities;
    const window = createReplanningWindow(itinerary, new Date("2026-08-23T15:00:00.000Z"));

    expect(window.eligibleActivityIds).toEqual(
      expect.arrayContaining([activities[0]!.id, activities[1]!.id]),
    );
  });

  it("deriva corretamente horário local em timezone com DST", () => {
    const itinerary = createItinerary(
      {
        tripId: "trip-dst",
        period: {
          startDate: "2026-03-08",
          endDate: "2026-03-09",
          timeZone: "America/New_York",
        },
      },
      new Date("2026-02-01T00:00:00.000Z"),
    );

    const window = createReplanningWindow(itinerary, new Date("2026-03-08T07:30:00.000Z"));

    expect(window.localDate).toBe("2026-03-08");
    expect(window.localTime).toBe("03:30");
  });

  it("é determinístico e não muta o Itinerary de entrada", () => {
    const itinerary = add(createFortalezaItinerary(), {
      dayDate: "2026-08-24",
      title: "Futura",
      startTime: "14:00",
    });
    const before = structuredClone(itinerary);
    const capturedAt = new Date("2026-08-23T15:00:00.000Z");

    const first = createReplanningWindow(itinerary, capturedAt);
    const second = createReplanningWindow(itinerary, capturedAt);

    expect(first).toEqual(second);
    expect(itinerary).toEqual(before);
    expect(first.capturedAt).not.toBe(capturedAt);
  });

  it("rejeita timezone e capturedAt inválidos", () => {
    const itinerary = createFortalezaItinerary();

    expect(() =>
      createReplanningWindow(
        { ...itinerary, period: { ...itinerary.period, timeZone: "Mars/Olympus" } },
        new Date(),
      ),
    ).toThrow(ReplanningWindowValidationError);

    expect(() => createReplanningWindow(itinerary, new Date("invalid"))).toThrow(
      ReplanningWindowValidationError,
    );
  });

  it("rejeita IDs duplicados de Dia e Activity", () => {
    const itinerary = add(createFortalezaItinerary(), {
      dayDate: "2026-08-24",
      title: "Futura",
    });

    const duplicateDay = {
      ...itinerary,
      days: [itinerary.days[0]!, { ...itinerary.days[1]!, id: itinerary.days[0]!.id }],
    };
    expect(() =>
      createReplanningWindow(duplicateDay, new Date("2026-08-23T15:00:00.000Z")),
    ).toThrow(ReplanningWindowValidationError);

    const activity = itinerary.days[2]!.activities[0]!;
    const duplicateActivity = {
      ...itinerary,
      days: itinerary.days.map((day, index) =>
        index === 3 ? { ...day, activities: [{ ...activity }] } : day,
      ),
    };
    expect(() =>
      createReplanningWindow(duplicateActivity, new Date("2026-08-23T15:00:00.000Z")),
    ).toThrow(ReplanningWindowValidationError);
  });
});
