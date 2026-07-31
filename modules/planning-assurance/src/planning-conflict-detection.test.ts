import { describe, expect, it } from "vitest";

import {
  detectPlanningConflicts,
  MAX_DAY_ACTIVITY_COUNT,
  MAX_DAY_SCHEDULED_MINUTES,
  PlanningConflictValidationError,
  type PlanningActivitySnapshot,
  type PlanningConflictContextSnapshot,
} from "./index";

function activity(
  id: string,
  overrides: Partial<PlanningActivitySnapshot> = {},
): PlanningActivitySnapshot {
  return {
    id,
    tripId: "trip-1",
    dayId: "day-1",
    ...overrides,
  };
}

function snapshot(
  activities: readonly PlanningActivitySnapshot[],
  overrides: Partial<PlanningConflictContextSnapshot> = {},
): PlanningConflictContextSnapshot {
  return {
    schemaVersion: 1,
    tripId: "trip-1",
    tripStartDate: "2026-08-22",
    tripEndDate: "2026-08-24",
    itineraryId: "itinerary-1",
    itineraryVersion: 4,
    capturedAt: new Date("2026-07-31T18:00:00.000Z"),
    days: [
      {
        id: "day-1",
        tripId: "trip-1",
        date: "2026-08-22",
        activities,
      },
    ],
    ...overrides,
  };
}

describe("detectPlanningConflicts", () => {
  it("é determinístico, estável e não altera o snapshot", () => {
    const context = snapshot([
      activity("activity-b", { startTime: "10:00", durationMinutes: 120 }),
      activity("activity-a", { startTime: "09:30", durationMinutes: 90 }),
    ]);
    const original = structuredClone(context);

    const first = detectPlanningConflicts(context);
    const second = detectPlanningConflicts(context);

    expect(first).toEqual(second);
    expect(first.map((conflict) => conflict.id)).toEqual(second.map((conflict) => conflict.id));
    expect(context).toEqual(original);
  });

  it("detecta sobreposição parcial e total, mas não intervalos adjacentes", () => {
    const partial = detectPlanningConflicts(
      snapshot([
        activity("a", { startTime: "09:00", durationMinutes: 120 }),
        activity("b", { startTime: "10:30", durationMinutes: 60 }),
      ]),
    );
    expect(partial.filter((conflict) => conflict.type === "activity-time-overlap")).toHaveLength(1);

    const total = detectPlanningConflicts(
      snapshot([
        activity("a", { startTime: "09:00", durationMinutes: 180 }),
        activity("b", { startTime: "10:00", durationMinutes: 30 }),
      ]),
    );
    expect(total.filter((conflict) => conflict.type === "activity-time-overlap")).toHaveLength(1);

    const adjacent = detectPlanningConflicts(
      snapshot([
        activity("a", { startTime: "09:00", durationMinutes: 60 }),
        activity("b", { startTime: "10:00", durationMinutes: 60 }),
      ]),
    );
    expect(adjacent.filter((conflict) => conflict.type === "activity-time-overlap")).toHaveLength(
      0,
    );
  });

  it("detecta Activity fora do período e incompatível com o Dia", () => {
    const mismatchedActivity = activity("a", {
      dayId: "another-day",
      scheduledDate: "2026-08-24",
      startTime: "09:00",
      durationMinutes: 60,
    });
    const conflicts = detectPlanningConflicts({
      ...snapshot([mismatchedActivity]),
      days: [
        {
          id: "day-1",
          tripId: "trip-1",
          date: "2026-08-25",
          activities: [mismatchedActivity],
        },
      ],
    });

    expect(conflicts.map((conflict) => conflict.type)).toContain("activity-outside-trip-period");
    expect(conflicts.map((conflict) => conflict.type)).toContain("activity-day-mismatch");
  });

  it("detecta duração, horário e limite diário inválidos por constantes explícitas", () => {
    const overloadedActivities = Array.from({ length: MAX_DAY_ACTIVITY_COUNT + 1 }, (_, index) =>
      activity(`activity-${index}`, {
        startTime: `${String(index).padStart(2, "0")}:00`,
        durationMinutes: Math.ceil(MAX_DAY_SCHEDULED_MINUTES / MAX_DAY_ACTIVITY_COUNT),
      }),
    );
    overloadedActivities[0] = activity("activity-0", {
      startTime: "25:00",
      durationMinutes: 0,
    });

    const conflicts = detectPlanningConflicts(snapshot(overloadedActivities));

    expect(conflicts.map((conflict) => conflict.type)).toContain("invalid-activity-interval");
    const overloaded = conflicts.find((conflict) => conflict.type === "day-overloaded");
    expect(overloaded?.evidence[0]?.facts).toMatchObject({
      maxActivityCount: MAX_DAY_ACTIVITY_COUNT,
      maxScheduledMinutes: MAX_DAY_SCHEDULED_MINUTES,
    });
  });

  it("rejeita relações cross-trip antes da detecção", () => {
    expect(() =>
      detectPlanningConflicts(
        snapshot([
          activity("activity-1", {
            tripId: "trip-2",
          }),
        ]),
      ),
    ).toThrow(PlanningConflictValidationError);
  });
});
