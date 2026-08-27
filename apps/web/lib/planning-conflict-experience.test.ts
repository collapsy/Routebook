import { addActivity, createItinerary } from "@routebook/trip-management";
import { describe, expect, it } from "vitest";

import {
  buildPlanningConflictReview,
  PlanningConflictReviewIntegrityError,
  type PlanningConflictReviewSource,
} from "./planning-conflict-experience";

function createConflict(
  input: Partial<PlanningConflictReviewSource> &
    Pick<PlanningConflictReviewSource, "id" | "type" | "severity">,
): PlanningConflictReviewSource {
  return {
    tripId: "trip-1",
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
      itineraryHref: `/viagens/trip-1/roteiro?dia=${day.date}#dia-em-foco`,
      canIgnore: true,
    });
    expect(review.items[0]?.explanation).not.toContain(firstActivity.id);
    expect(review.items[0]?.explanation).not.toContain(secondActivity.id);
    expect(review.ignoredRisks).toEqual([]);
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

  it("composes ignored Risks with their Decision and known actor", () => {
    const itinerary = createPlannedItinerary();
    const day = itinerary.days[0]!;
    const activities = day.activities;
    const ignoredAt = new Date("2026-08-01T00:05:00.000Z");
    const conflict = createConflict({
      id: "conflict-ignored",
      type: "activity-time-overlap",
      severity: "risk",
      state: "ignored",
      relatedDayIds: [day.id],
      relatedActivityIds: activities.map((activity) => activity.id),
      ignoredAt,
      ignoredDecisionId: "decision-ignore",
    });
    const openConflict = createConflict({
      id: "conflict-open",
      type: "activity-time-overlap",
      severity: "risk",
      relatedDayIds: [day.id],
      relatedActivityIds: activities.map((activity) => activity.id),
    });
    const decision = {
      id: "decision-ignore",
      tripId: "trip-1",
      actorParticipantId: "participant-owner",
      decidedAt: ignoredAt,
      type: "ignore-planning-risk",
      chosenOption: {
        type: "ignore-planning-risk",
        planningConflictId: conflict.id,
      },
      effect: {
        type: "planning-conflict-ignored",
        planningConflictId: conflict.id,
      },
    };

    const review = buildPlanningConflictReview({
      itinerary,
      tripId: "trip-1",
      conflicts: [openConflict, conflict],
      decisions: [decision],
      participants: [{ userId: "participant-owner", displayName: "RouteBook QA" }],
    });

    expect(review.total).toBe(1);
    expect(review.counts).toEqual({ error: 0, risk: 1, suggestion: 0 });
    expect(review.ignoredRisks).toEqual([
      expect.objectContaining({
        id: conflict.id,
        title: "Horários sobrepostos",
        activityTitles: ["Café na vila", "Passeio de barco"],
        dayLabel: "Dia 1 · 22 de agosto",
        actorLabel: "RouteBook QA",
        ignoredAtLabel: expect.stringContaining("31 de jul. de 2026"),
      }),
    ]);
  });

  it("omits unavailable actor names but rejects an incompatible Decision", () => {
    const itinerary = createPlannedItinerary();
    const ignoredAt = new Date("2026-08-01T00:05:00.000Z");
    const conflict = createConflict({
      id: "conflict-ignored",
      type: "day-overloaded",
      severity: "risk",
      state: "ignored",
      ignoredAt,
      ignoredDecisionId: "decision-ignore",
    });
    const decision = {
      id: "decision-ignore",
      tripId: "trip-1",
      actorParticipantId: "participant-removed",
      decidedAt: ignoredAt,
      type: "ignore-planning-risk",
      chosenOption: {
        type: "ignore-planning-risk",
        planningConflictId: conflict.id,
      },
      effect: {
        type: "planning-conflict-ignored",
        planningConflictId: conflict.id,
      },
    };

    const review = buildPlanningConflictReview({
      itinerary,
      tripId: "trip-1",
      conflicts: [conflict],
      decisions: [decision],
    });
    expect(review.ignoredRisks[0]).not.toHaveProperty("actorLabel");

    expect(() =>
      buildPlanningConflictReview({
        itinerary,
        tripId: "trip-1",
        conflicts: [conflict],
        decisions: [],
      }),
    ).toThrow(PlanningConflictReviewIntegrityError);

    expect(() =>
      buildPlanningConflictReview({
        itinerary,
        tripId: "trip-1",
        conflicts: [conflict],
        decisions: [{ ...decision, tripId: "trip-2" }],
      }),
    ).toThrow(PlanningConflictReviewIntegrityError);

    expect(() =>
      buildPlanningConflictReview({
        itinerary,
        tripId: "trip-1",
        conflicts: [conflict],
        decisions: [
          {
            ...decision,
            chosenOption: {
              type: "ignore-planning-risk",
              planningConflictId: "another-conflict",
            },
          },
        ],
      }),
    ).toThrow(PlanningConflictReviewIntegrityError);
  });
});
