import { describe, expect, it } from "vitest";

import {
  completeItineraryProposalGeneration,
  expireItineraryProposalByTime,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposal,
  type ProposedActivityInput,
} from "@routebook/proposal-management";
import { addActivity, createItinerary } from "@routebook/trip-management";

import {
  buildItineraryProposalReview,
  findLatestReviewableItineraryProposal,
  findLatestReadyItineraryProposal,
  getItineraryProposalReviewStatus,
  hasReadyItineraryProposal,
  ItineraryProposalReviewIntegrityError,
} from "./itinerary-proposal-experience";

const requestedAt = new Date("2026-08-01T12:00:00.000Z");

function createReviewItinerary() {
  let itinerary = createItinerary(
    {
      tripId: "trip-review",
      period: {
        startDate: "2026-08-22",
        endDate: "2026-08-23",
        timeZone: "America/Fortaleza",
      },
    },
    requestedAt,
  );
  itinerary = addActivity(
    itinerary,
    { dayDate: "2026-08-22", title: "Café já confirmado", startTime: "09:00" },
    requestedAt,
  );
  return itinerary;
}

function createReadyProposal({
  generatedAt = new Date("2026-08-01T12:02:00.000Z"),
  id = "proposal-ready",
  itinerary = createReviewItinerary(),
  proposedActivities,
}: {
  generatedAt?: Date;
  id?: string;
  itinerary?: ReturnType<typeof createReviewItinerary>;
  proposedActivities?: readonly ProposedActivityInput[];
} = {}): ItineraryProposal {
  const requested = requestItineraryProposal({
    id,
    tripId: itinerary.tripId,
    itineraryId: itinerary.id,
    baseTripContextVersion: 1,
    baseItineraryVersion: itinerary.version,
    contextSnapshotId: `context-${id}`,
    requestedAt,
  });
  const generating = startItineraryProposalGeneration(
    requested,
    new Date("2026-08-01T12:01:00.000Z"),
  );

  return completeItineraryProposalGeneration(generating, {
    generationMethod: "deterministic-fixture",
    generationVersion: "1",
    proposedActivities: proposedActivities ?? [],
    criteria: ["Ritmo leve", "Proximidade entre lugares"],
    justifications: ["Reduz deslocamentos entre atividades."],
    limitations: ["Horários externos não foram confirmados."],
    planningConflictIds: ["conflict-known"],
    generatedAt,
    validUntil: new Date(generatedAt.getTime() + 86_400_000),
  });
}

function createExpiredProposal({
  expiredAt,
  ...readyOptions
}: Parameters<typeof createReadyProposal>[0] & { expiredAt?: Date } = {}): ItineraryProposal {
  const ready = createReadyProposal(readyOptions);
  return expireItineraryProposalByTime(
    ready,
    expiredAt ?? new Date(ready.validUntil!.getTime() + 60_000),
  );
}

describe("itinerary proposal review experience", () => {
  it("selects only the latest ready Proposal with a stable identity tie-break", () => {
    const itinerary = createReviewItinerary();
    const sameInstant = new Date("2026-08-01T12:03:00.000Z");
    const older = createReadyProposal({
      generatedAt: new Date("2026-08-01T12:02:00.000Z"),
      id: "proposal-c",
      itinerary,
    });
    const tiedA = createReadyProposal({ generatedAt: sameInstant, id: "proposal-a", itinerary });
    const tiedB = createReadyProposal({ generatedAt: sameInstant, id: "proposal-b", itinerary });
    const requested = requestItineraryProposal({
      id: "proposal-requested",
      tripId: itinerary.tripId,
      itineraryId: itinerary.id,
      baseTripContextVersion: 1,
      baseItineraryVersion: itinerary.version,
      contextSnapshotId: "context-requested",
      requestedAt,
    });

    expect(hasReadyItineraryProposal([requested, older, tiedA])).toBe(true);
    expect(findLatestReadyItineraryProposal([tiedA, requested, older, tiedB])?.id).toBe(
      "proposal-b",
    );
    expect(findLatestReadyItineraryProposal([requested])).toBeNull();
  });

  it("rejects an incomplete ready snapshot instead of inventing review content", () => {
    const malformed = {
      ...createReadyProposal(),
      generatedAt: undefined,
    } as unknown as ItineraryProposal;

    expect(() => findLatestReadyItineraryProposal([malformed])).toThrowError(
      ItineraryProposalReviewIntegrityError,
    );
  });

  it("prioritizes an active ready Proposal over newer expired history", () => {
    const itinerary = createReviewItinerary();
    const ready = createReadyProposal({
      generatedAt: new Date("2026-08-01T12:02:00.000Z"),
      id: "proposal-ready-active",
      itinerary,
    });
    const expired = createExpiredProposal({
      generatedAt: new Date("2026-08-02T12:02:00.000Z"),
      id: "proposal-expired-newer",
      itinerary,
    });

    expect(getItineraryProposalReviewStatus([expired, ready])).toBe("ready");
    expect(findLatestReviewableItineraryProposal([expired, ready])?.id).toBe(ready.id);
  });

  it("selects the latest expired Proposal with a stable identity tie-break", () => {
    const itinerary = createReviewItinerary();
    const sameInstant = new Date("2026-08-03T12:02:00.000Z");
    const older = createExpiredProposal({
      expiredAt: new Date("2026-08-02T12:02:00.000Z"),
      id: "proposal-expired-c",
      itinerary,
    });
    const tiedA = createExpiredProposal({
      expiredAt: sameInstant,
      id: "proposal-expired-a",
      itinerary,
    });
    const tiedB = createExpiredProposal({
      expiredAt: sameInstant,
      id: "proposal-expired-b",
      itinerary,
    });

    expect(getItineraryProposalReviewStatus([older, tiedA])).toBe("expired");
    expect(findLatestReviewableItineraryProposal([tiedA, older, tiedB])?.id).toBe(
      "proposal-expired-b",
    );
  });

  it("rejects an incomplete expired snapshot instead of hiding missing lifecycle facts", () => {
    const malformed = {
      ...createExpiredProposal(),
      expiredAt: undefined,
    } as unknown as ItineraryProposal;

    expect(() => findLatestReviewableItineraryProposal([malformed])).toThrowError(
      ItineraryProposalReviewIntegrityError,
    );
  });

  it("groups changes by known days and exposes unresolved references explicitly", () => {
    const itinerary = createReviewItinerary();
    const firstDay = itinerary.days[0]!;
    const sourceActivity = firstDay.activities[0]!;
    const proposal = createReadyProposal({
      itinerary,
      proposedActivities: [
        {
          proposedActivityId: "activity-add",
          targetTripDayId: firstDay.id,
          title: "Mirante ao pôr do sol",
          proposedStartTime: "17:30",
          durationMinutes: 90,
          proposedOrder: 2,
          operationType: "add",
          estimatedCostAmount: 25,
          estimatedCostCurrency: "BRL",
          reason: "Aproveita o fim da tarde.",
        },
        {
          proposedActivityId: "activity-update",
          sourceActivityId: sourceActivity.id,
          title: "Café sem pressa",
          proposedOrder: 1,
          operationType: "update",
        },
        {
          proposedActivityId: "activity-unknown",
          targetTripDayId: "day-not-in-current-itinerary",
          title: "Referência externa",
          operationType: "move",
        },
      ],
    });

    const review = buildItineraryProposalReview({ itinerary, proposal });

    expect(review.proposedChangeCount).toBe(3);
    expect(review.knownConflictCount).toBe(1);
    expect(review.days.map(({ label }) => label)).toEqual([
      "Dia 1 · 22 de agosto",
      "Referência de dia indisponível",
    ]);
    expect(review.days[0]?.activities.map(({ id }) => id)).toEqual([
      "activity-update",
      "activity-add",
    ]);
    expect(review.days[0]?.activities[0]).toMatchObject({
      operationLabel: "Atualizar",
      sourceActivityTitle: "Café já confirmado",
      timeLabel: "Horário não informado",
    });
    expect(review.days[0]?.activities[1]).toMatchObject({
      durationLabel: "1 h 30 min",
      estimatedCostLabel: "R$ 25,00",
      operationLabel: "Adicionar",
      timeLabel: "Horário proposto: 17:30",
    });
    expect(review.days[1]?.referenceAvailable).toBe(false);
  });

  it("marks a Proposal based on an older Itinerary version without applying it", () => {
    const itinerary = createReviewItinerary();
    const proposal = {
      ...createReadyProposal({ itinerary }),
      baseItineraryVersion: itinerary.version - 1,
    } as ItineraryProposal;

    expect(buildItineraryProposalReview({ itinerary, proposal }).isBasedOnCurrentItinerary).toBe(
      false,
    );
  });

  it("formats the expiration instant for an expired historical review", () => {
    const itinerary = createReviewItinerary();
    const proposal = createExpiredProposal({
      expiredAt: new Date("2026-08-02T15:30:00.000Z"),
      itinerary,
    });

    expect(buildItineraryProposalReview({ itinerary, proposal })).toMatchObject({
      status: "expired",
      expiredAtLabel: "2 de ago. de 2026, 12:30",
    });
  });
});
