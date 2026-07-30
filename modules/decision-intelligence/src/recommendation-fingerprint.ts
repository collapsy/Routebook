import { createHash } from "node:crypto";

import type { DecisionContextSnapshot, Recommendation } from "./recommendation";

export type RecommendationContextFingerprintInput = Readonly<{
  snapshot: DecisionContextSnapshot;
  placeId: string;
  policyVersion: string;
}>;

export function createRecommendationContextFingerprint(
  input: RecommendationContextFingerprintInput,
): string {
  const canonicalContext = JSON.stringify({
    schemaVersion: input.snapshot.schemaVersion,
    tripId: input.snapshot.tripId,
    destinationId: input.snapshot.destinationId,
    tripContextVersion: input.snapshot.tripContextVersion,
    travelerProfileVersion: input.snapshot.travelerProfileVersion ?? null,
    itineraryVersion: input.snapshot.itineraryVersion ?? null,
    placeId: input.placeId,
    policyVersion: input.policyVersion,
  });

  return createHash("sha256").update(canonicalContext).digest("hex");
}

export function fingerprintRecommendation(recommendation: Recommendation): string {
  return createRecommendationContextFingerprint({
    snapshot: recommendation.snapshot,
    placeId: recommendation.target.placeId,
    policyVersion: recommendation.generation.policyVersion,
  });
}
