import { addActivity, createItinerary } from "@routebook/trip-management";
import { describe, expect, it } from "vitest";

import {
  buildPlanningConflictReview,
  type PlanningConflictReviewSource,
} from "./planning-conflict-experience";

function createConflict(
  input: Partial<PlanningConflictReviewSource> &
    Pick<PlanningConflictReviewSource, "id" | "type" | "severity">,
): PlanningConflictReviewSource {
  return {
    state: "open",
    contextSnapshot: {
      tripStartDate: "2026-08-22",
      tripEndDate: "2026-08-29",
    },
    evidence: [],
    relatedDayIds: [],
    relatedActivityIds: [],
    ...input,
  };
}

function createPlannedItinerary() {
  let itinerary = createItinerary({
    tripId: "trip-1",
    period: {
      startDate: "2026-08-22",
      endDate: "2026-08-29",
      timeZone: "America/Fortaleza",
    },
  });
  itinerary = addActivity(itinerary, {
    dayDate: "2026-08-22",
    title: "Café na vila",
    startTime: "09:00",
    durationMinutes: 120,
  });
  itinerary = addActivity(itinerary, {
    dayDate: "2026-08-22",
    title: "Passeio de barco",
    startTime: "10:00",
    durationMinutes: 90,
  });
  return itinerary;
}

describe("buildPlanningConflictReview", () => {
  it("composes open conflicts with human labels and links to affected itinerary days", () => {
    const itinerary = createPlannedItinerary();
    const day = itinerary.days[0]!;
    const firstActivity = day.activities[0]!;
    const secondActivity = day.activities[1]!;

    const review = buildPlanningConflictReview({
      itinerary,
      tripId: itinerary.tripId,
      conflicts: [
        createConflict({
          id: "conflict-overlap",
          type: "activity-time-overlap",
          severity: "risk",
          relatedDayIds: [day.id],
          relatedActivityIds: [firstActivity.id, secondActivity.id],
          evidence: [
            {
              code: "activity-time-overlap",
              facts: { firstStartMinutes: 540, secondStartMinutes: 600 },
            },
          ],
        }),
        createConflict({
          id: "conflict-old",
          type: "activity-time-overlap",
          severity: "risk",
          state: "invalidated",
        }),
      ],
    });

    expect(review.total).toBe(1);
    expect(review.counts).toEqual({ error: 0, risk: 1, suggestion: 0 });
    expect(review.items[0]).toMatchObject({
      id: "conflict-overlap",
      severity: "risk",
      severityLabel: "Risco",
      title: "Horários sobrepostos",
      dayLabel: "Dia 1 · 22 de agosto",
      activityTitles: ["Café na vila", "Passeio de barco"],
      itineraryHref: `/viagens/trip-1/roteiro#${day.id}`,
    });
    expect(review.items[0]?.explanation).not.toContain(firstActivity.id);
    expect(review.items[0]?.explanation).not.toContain(secondActivity.id);
  });

  it("uses only known evidence when explaining invalid intervals and overloaded days", () => {
    const itinerary = createPlannedItinerary();
    const day = itinerary.days[0]!;

    const review = buildPlanningConflictReview({
      itinerary,
      tripId: itinerary.tripId,
      conflicts: [
        createConflict({
          id: "conflict-invalid",
          type: "invalid-activity-interval",
          severity: "error",
          relatedDayIds: [day.id],
          evidence: [
            {
              code: "invalid-activity-interval",
              facts: { reason: "interval-exceeds-day-boundary" },
            },
          ],
        }),
        createConflict({
          id: "conflict-overload",
          type: "day-overloaded",
          severity: "risk",
          relatedDayIds: [day.id],
          evidence: [
            {
              code: "day-overloaded",
              facts: {
                activityCount: 9,
                maxActivityCount: 8,
                totalScheduledMinutes: 780,
                maxScheduledMinutes: 720,
              },
            },
          ],
        }),
      ],
    });

    expect(review.counts).toEqual({ error: 1, risk: 1, suggestion: 0 });
    expect(review.items[0]?.explanation).toContain("ultrapassam o limite deste dia");
    expect(review.items[1]?.explanation).toBe(
      "A análise encontrou 9 atividades para um limite de 8 e 780 minutos programados para um limite de 720.",
    );
  });

  it("omits unknown references while presenting outside-period and day-mismatch evidence", () => {
    const itinerary = createPlannedItinerary();
    const day = itinerary.days[0]!;
    const activity = day.activities[0]!;
    const review = buildPlanningConflictReview({
      itinerary,
      tripId: itinerary.tripId,
      conflicts: [
        createConflict({
          id: "conflict-outside",
          type: "activity-outside-trip-period",
          severity: "error",
          relatedDayIds: ["unknown-day-id"],
          relatedActivityIds: ["unknown-activity-id"],
          evidence: [
            {
              code: "activity-outside-trip-period",
              facts: { dayDate: "2026-08-30" },
            },
          ],
        }),
        createConflict({
          id: "conflict-mismatch",
          type: "activity-day-mismatch",
          severity: "risk",
          relatedDayIds: [day.id],
          relatedActivityIds: [activity.id],
        }),
      ],
    });

    expect(review.items[0]).toMatchObject({
      title: "Atividade fora do período da viagem",
      activityTitles: [],
    });
    expect(review.items[0]).not.toHaveProperty("dayLabel");
    expect(review.items[0]).not.toHaveProperty("itineraryHref");
    expect(review.items[0]?.explanation).not.toContain("unknown-day-id");
    expect(review.items[1]).toMatchObject({
      title: "Atividade associada a outro dia",
      activityTitles: ["Café na vila"],
    });
  });
});
