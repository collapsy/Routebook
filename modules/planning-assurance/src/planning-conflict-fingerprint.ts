import { createHash } from "node:crypto";

import type { PlanningConflictEvidence, PlanningConflictType } from "./planning-conflict";
import {
  createPlanningConflictFingerprint,
  createPlanningConflictLineageKey,
  type PlanningConflictFingerprint,
  type PlanningConflictLineageKey,
} from "./planning-conflict";

export type PlanningConflictFingerprintInput = Readonly<{
  tripId: string;
  type: PlanningConflictType;
  policyVersion: string;
  relatedDayIds: readonly string[];
  relatedActivityIds: readonly string[];
  evidence: readonly PlanningConflictEvidence[];
}>;

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  return value;
}

function hash(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

export function fingerprintPlanningConflict(
  input: PlanningConflictFingerprintInput,
): PlanningConflictFingerprint {
  return createPlanningConflictFingerprint(
    hash({
      tripId: input.tripId.trim(),
      type: input.type,
      policyVersion: input.policyVersion.trim(),
      relatedDayIds: [...input.relatedDayIds].map((value) => value.trim()).sort(),
      relatedActivityIds: [...input.relatedActivityIds].map((value) => value.trim()).sort(),
      evidence: input.evidence,
    }),
  );
}

export function createPlanningConflictLineage(
  input: Omit<PlanningConflictFingerprintInput, "evidence" | "policyVersion">,
): PlanningConflictLineageKey {
  return createPlanningConflictLineageKey(
    hash({
      tripId: input.tripId.trim(),
      type: input.type,
      relatedDayIds: [...input.relatedDayIds].map((value) => value.trim()).sort(),
      relatedActivityIds: [...input.relatedActivityIds].map((value) => value.trim()).sort(),
    }),
  );
}
