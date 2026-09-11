import { describe, expect, it } from "vitest";

import type { ItineraryProposalGenerationCandidate } from "./deterministic-itinerary-proposal-generator";
import { mergeItineraryProposalGenerationCandidates } from "./authoritative-itinerary-proposal-generation";

function candidate(
  candidateId: string,
  placeId: string,
  title: string,
): ItineraryProposalGenerationCandidate {
  return { candidateId, placeId, title };
}

describe("mergeItineraryProposalGenerationCandidates", () => {
  it("preserva Recommendations primeiro e omite Discovery do mesmo Place", () => {
    const recommendation = candidate("recommendation-1", "place-1", "Lugar recomendado");
    const duplicatedDiscovery = candidate("discovery:overture:1", "place-1", "Lugar duplicado");
    const discovery = candidate("discovery:overture:2", "place-2", "Lugar descoberto");

    expect(
      mergeItineraryProposalGenerationCandidates(
        [recommendation],
        [duplicatedDiscovery, discovery],
      ),
    ).toEqual([recommendation, discovery]);
  });

  it("deduplica candidatos adicionais pela identidade do Place mantendo a primeira ocorrência", () => {
    const first = candidate("discovery:overture:1", "place-1", "Primeiro");
    const duplicate = candidate("discovery:overture:2", "place-1", "Duplicado");

    expect(mergeItineraryProposalGenerationCandidates([], [first, duplicate])).toEqual([first]);
  });

  it("mantém o comportamento legado quando não há candidatos adicionais", () => {
    const recommendation = candidate("recommendation-1", "place-1", "Lugar recomendado");

    expect(mergeItineraryProposalGenerationCandidates([recommendation])).toEqual([
      recommendation,
    ]);
  });
});
