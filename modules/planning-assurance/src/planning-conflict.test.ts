import { describe, expect, it } from "vitest";

import {
  createPlanningConflict,
  createPlanningConflictFingerprint,
  createPlanningConflictId,
  createPlanningConflictLineageKey,
  invalidatePlanningConflict,
  PlanningConflictTransitionError,
  PlanningConflictValidationError,
  supersedePlanningConflict,
  type PlanningConflictContextSnapshot,
} from "./index";

const snapshot: PlanningConflictContextSnapshot = {
  schemaVersion: 1,
  tripId: "trip-1",
  tripStartDate: "2026-08-22",
  tripEndDate: "2026-08-24",
  itineraryId: "itinerary-1",
  itineraryVersion: 3,
  capturedAt: new Date("2026-07-31T18:00:00.000Z"),
  days: [
    {
      id: "day-1",
      tripId: "trip-1",
      date: "2026-08-22",
      activities: [],
    },
  ],
};

function buildConflict() {
  return createPlanningConflict({
    id: "conflict-1",
    tripId: "trip-1",
    type: "day-overloaded",
    severity: "risk",
    contextSnapshot: snapshot,
    evidence: [{ code: "day-overloaded", facts: { activityCount: 9 } }],
    relatedDayIds: ["day-1"],
    detectedAt: snapshot.capturedAt,
    policyVersion: "planning-conflict-v1",
    contextFingerprint: "a".repeat(64),
    lineageKey: "b".repeat(64),
  });
}

describe("PlanningConflict", () => {
  it("cria identidade distinta e congela o agregado normalizado", () => {
    const conflict = buildConflict();

    expect(createPlanningConflictId("conflict-1")).toBe("conflict-1");
    expect(createPlanningConflictFingerprint("A".repeat(64))).toBe("a".repeat(64));
    expect(createPlanningConflictLineageKey("B".repeat(64))).toBe("b".repeat(64));
    expect(conflict).toMatchObject({
      id: "conflict-1",
      tripId: "trip-1",
      state: "open",
      relatedDayIds: ["day-1"],
    });
    expect(Object.isFrozen(conflict)).toBe(true);
    expect(Object.isFrozen(conflict.contextSnapshot.days)).toBe(true);
  });

  it("rejeita snapshot cross-trip e fingerprints inválidos", () => {
    expect(() =>
      createPlanningConflict({
        ...buildConflict(),
        contextSnapshot: {
          ...snapshot,
          days: [
            {
              id: "day-1",
              tripId: "trip-2",
              date: "2026-08-22",
              activities: [],
            },
          ],
        },
      }),
    ).toThrow(PlanningConflictValidationError);

    expect(() => createPlanningConflictFingerprint("not-a-hash")).toThrow(
      PlanningConflictValidationError,
    );
  });

  it.each(["error", "risk", "suggestion"] as const)(
    "aceita a severidade canÃ´nica %s",
    (severity) => {
      expect(createPlanningConflict({ ...buildConflict(), severity }).severity).toBe(severity);
    },
  );

  it("invalida e supersede somente conflitos abertos", () => {
    const conflict = buildConflict();
    const changedAt = new Date("2026-07-31T18:05:00.000Z");
    const invalidated = invalidatePlanningConflict(conflict, changedAt);

    expect(invalidated).toMatchObject({ state: "invalidated", invalidatedAt: changedAt });
    expect(() => invalidatePlanningConflict(invalidated, changedAt)).toThrow(
      PlanningConflictTransitionError,
    );

    const replacementId = createPlanningConflictId("conflict-2");
    const superseded = supersedePlanningConflict(conflict, replacementId, changedAt);
    expect(superseded).toMatchObject({
      state: "superseded",
      supersededByPlanningConflictId: replacementId,
      supersededAt: changedAt,
    });
    expect(() => supersedePlanningConflict(conflict, conflict.id, changedAt)).toThrow(
      PlanningConflictTransitionError,
    );
  });
});
