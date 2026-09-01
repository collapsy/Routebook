import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import {
  addActivity,
  createItinerary,
  createTrip,
  removeActivity,
  updateActivity,
} from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import { decisions } from "./decision-schema";
import { DrizzleItineraryRepository } from "./itinerary-repository";
import {
  ignorePlanningRisk,
  PlanningRiskDecisionServiceError,
} from "./planning-conflict-decision-service";
import { evaluatePlanningConflicts } from "./planning-conflict-evaluation-service";
import { DrizzlePlanningConflictRepository } from "./planning-conflict-repository";
import { trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

afterAll(async () => {
  await closeDatabase();
});

async function createOverlapFixture() {
  const trip = createTrip({
    name: "Decisão sobre Risco de Planejamento",
    destination: {
      name: "Pipa, Tibau do Sul - RN",
      type: "district",
      countryCode: "BR",
      latitude: -6.2302,
      longitude: -35.0503,
      timeZone: "America/Fortaleza",
    },
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    ownerName: "RouteBook QA",
  });
  await new DrizzleTripRepository().create(trip);

  let itinerary = createItinerary({ tripId: trip.id, period: trip.period });
  itinerary = addActivity(itinerary, {
    dayDate: "2026-08-22",
    title: "Primeira atividade",
    type: "tour",
    startTime: "09:00",
    durationMinutes: 120,
  });
  itinerary = addActivity(itinerary, {
    dayDate: "2026-08-22",
    title: "Atividade sobreposta",
    type: "tour",
    startTime: "10:00",
    durationMinutes: 60,
  });
  await new DrizzleItineraryRepository().save(itinerary);
  const evaluation = await evaluatePlanningConflicts(trip.id, new Date("2026-07-31T23:00:00.000Z"));
  const conflict = evaluation.activeConflicts.find(
    (candidate) => candidate.type === "activity-time-overlap",
  );
  if (!conflict) throw new Error("A fixture deveria produzir um Risco de sobreposição.");
  return { trip, itinerary, conflict };
}

describe("ignorePlanningRisk", () => {
  it("persiste Decision e estado ignored atomicamente e preserva idempotência", async () => {
    const { trip, conflict } = await createOverlapFixture();
    const command = {
      tripId: trip.id,
      planningConflictId: conflict.id,
      idempotencyKey: `${conflict.id}:ignore-planning-risk`,
      decidedAt: new Date("2026-07-31T23:05:00.000Z"),
    };

    try {
      const first = await ignorePlanningRisk(command);
      const repeated = await ignorePlanningRisk({
        ...command,
        decidedAt: new Date("2026-07-31T23:06:00.000Z"),
      });

      expect(first.conflict).toMatchObject({
        id: conflict.id,
        state: "ignored",
        ignoredDecisionId: first.decision.id,
      });
      expect(first.decision).toMatchObject({
        actorParticipantId: trip.participants[0]?.userId,
        type: "ignore-planning-risk",
        chosenOption: { planningConflictId: conflict.id },
      });
      expect(repeated).toEqual(first);

      const reevaluated = await evaluatePlanningConflicts(
        trip.id,
        new Date("2026-07-31T23:10:00.000Z"),
      );
      expect(reevaluated.activeConflicts).not.toContainEqual(
        expect.objectContaining({ id: conflict.id }),
      );
      expect(await new DrizzlePlanningConflictRepository().listByTripId(trip.id)).toContainEqual(
        first.conflict,
      );

      await expect(
        ignorePlanningRisk({
          ...command,
          idempotencyKey: `${conflict.id}:second-attempt`,
        }),
      ).rejects.toMatchObject({ code: "invalid-state" });
      expect(
        await getDatabase().select().from(decisions).where(eq(decisions.tripId, trip.id)),
      ).toHaveLength(1);
    } finally {
      await getDatabase().delete(trips).where(eq(trips.id, trip.id));
    }
  });

  it("supersede o risco ignorado quando a mesma linhagem muda de evidência", async () => {
    const { trip, itinerary, conflict } = await createOverlapFixture();

    try {
      const ignored = await ignorePlanningRisk({
        tripId: trip.id,
        planningConflictId: conflict.id,
        idempotencyKey: `${conflict.id}:ignore-planning-risk`,
        decidedAt: new Date("2026-07-31T23:05:00.000Z"),
      });
      const activityId = conflict.relatedActivityIds[0];
      if (!activityId) throw new Error("O conflito deveria referenciar uma Activity.");
      const activity = itinerary.days
        .flatMap((day) => day.activities)
        .find((candidate) => candidate.id === activityId);
      if (!activity) throw new Error("A Activity do conflito deveria existir no Roteiro.");
      const changed = updateActivity(itinerary, {
        activityId,
        title: activity.title,
        ...(activity.startTime ? { startTime: activity.startTime } : {}),
        durationMinutes: 150,
      });
      await new DrizzleItineraryRepository().save(changed);

      const reevaluated = await evaluatePlanningConflicts(
        trip.id,
        new Date("2026-07-31T23:10:00.000Z"),
      );
      const replacement = reevaluated.activeConflicts.find(
        (candidate) => candidate.lineageKey === conflict.lineageKey,
      );
      expect(replacement).toMatchObject({ state: "open", severity: "risk" });
      expect(replacement?.id).not.toBe(conflict.id);

      const history = await new DrizzlePlanningConflictRepository().listByTripId(trip.id);
      expect(history).toContainEqual(
        expect.objectContaining({
          id: conflict.id,
          state: "superseded",
          ignoredDecisionId: ignored.decision.id,
          supersededByPlanningConflictId: replacement?.id,
        }),
      );
    } finally {
      await getDatabase().delete(trips).where(eq(trips.id, trip.id));
    }
  });

  it("invalida o histórico ignorado quando a condição deixa de existir", async () => {
    const { trip, itinerary, conflict } = await createOverlapFixture();

    try {
      const ignored = await ignorePlanningRisk({
        tripId: trip.id,
        planningConflictId: conflict.id,
        idempotencyKey: `${conflict.id}:ignore-planning-risk`,
        decidedAt: new Date("2026-07-31T23:05:00.000Z"),
      });
      const activityId = conflict.relatedActivityIds[1];
      if (!activityId) throw new Error("O conflito deveria referenciar duas Activities.");
      await new DrizzleItineraryRepository().save(removeActivity(itinerary, { activityId }));

      const reevaluated = await evaluatePlanningConflicts(
        trip.id,
        new Date("2026-07-31T23:10:00.000Z"),
      );
      expect(reevaluated.activeConflicts).toHaveLength(0);
      expect(await new DrizzlePlanningConflictRepository().listByTripId(trip.id)).toContainEqual(
        expect.objectContaining({
          id: conflict.id,
          state: "invalidated",
          ignoredDecisionId: ignored.decision.id,
        }),
      );
      await expect(
        ignorePlanningRisk({
          tripId: trip.id,
          planningConflictId: conflict.id,
          idempotencyKey: `${conflict.id}:ignore-planning-risk`,
        }),
      ).resolves.toMatchObject({
        decision: { id: ignored.decision.id },
        conflict: { id: conflict.id, state: "invalidated" },
      });
    } finally {
      await getDatabase().delete(trips).where(eq(trips.id, trip.id));
    }
  });

  it("rejeita uso cross-trip sem criar Decision", async () => {
    const fixture = await createOverlapFixture();
    const otherTrip = createTrip({
      name: "Outra Viagem",
      destination: {
        name: "Pipa, Tibau do Sul - RN",
        type: "district",
        countryCode: "BR",
        latitude: -6.2302,
        longitude: -35.0503,
        timeZone: "America/Fortaleza",
      },
      startDate: "2026-08-22",
      endDate: "2026-08-24",
      ownerName: "Outro owner",
    });
    await new DrizzleTripRepository().create(otherTrip);

    try {
      await expect(
        ignorePlanningRisk({
          tripId: otherTrip.id,
          planningConflictId: fixture.conflict.id,
          idempotencyKey: `${fixture.conflict.id}:cross-trip`,
        }),
      ).rejects.toBeInstanceOf(PlanningRiskDecisionServiceError);
      await expect(
        ignorePlanningRisk({
          tripId: otherTrip.id,
          planningConflictId: fixture.conflict.id,
          idempotencyKey: `${fixture.conflict.id}:cross-trip`,
        }),
      ).rejects.toMatchObject({ code: "cross-trip" });
      expect(
        await getDatabase().select().from(decisions).where(eq(decisions.tripId, otherTrip.id)),
      ).toHaveLength(0);
    } finally {
      await getDatabase().delete(trips).where(eq(trips.id, fixture.trip.id));
      await getDatabase().delete(trips).where(eq(trips.id, otherTrip.id));
    }
  });
});
