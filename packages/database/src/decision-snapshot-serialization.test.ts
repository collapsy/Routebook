import { describe, expect, it } from "vitest";

import type { ItineraryProposalDecisionContextSnapshot } from "@routebook/decision-intelligence";

import {
  deserializeDecisionSnapshot,
  serializeDecisionSnapshot,
} from "./decision-repository";

const capturedAt = new Date("2026-08-02T15:00:00.000Z");

describe("Itinerary Proposal Decision snapshot serialization", () => {
  it("serializa e reidrata o snapshot sem perda de identidade ou versão", () => {
    const snapshot: ItineraryProposalDecisionContextSnapshot = {
      schemaVersion: 1,
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      itineraryProposalId: "proposal-1",
      baseItineraryVersion: 7,
      requestFingerprint: "a".repeat(64),
      capturedAt,
    };

    const serialized = serializeDecisionSnapshot(snapshot);

    expect(serialized).toEqual({
      schemaVersion: 1,
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      itineraryProposalId: "proposal-1",
      baseItineraryVersion: 7,
      requestFingerprint: "a".repeat(64),
      capturedAt: capturedAt.toISOString(),
    });
    expect(deserializeDecisionSnapshot(serialized)).toEqual(snapshot);
  });
});
