import {
  DeterministicItineraryProposalGenerator,
  generateAuthoritativeItineraryProposal,
  type GenerateAuthoritativeItineraryProposalCommand,
  type ItineraryProposal,
} from "@routebook/proposal-management";

import { getDatabase } from "./client";
import { createPostgresAuthoritativeItineraryProposalGenerationContextPort } from "./authoritative-itinerary-proposal-generation-context";
import { DrizzleItineraryProposalRepository } from "./proposal-repository";

type Database = ReturnType<typeof getDatabase>;

export type PostgresAuthoritativeItineraryProposalGenerationService = Readonly<{
  generate(command: GenerateAuthoritativeItineraryProposalCommand): Promise<ItineraryProposal>;
}>;

/**
 * Composes the concrete PostgreSQL adapters with the deterministic proposal generator.
 *
 * All non-deterministic values remain explicit in the command. This boundary only wires
 * infrastructure and delegates lifecycle, eligibility and error semantics to the
 * canonical proposal-management services.
 */
export function createPostgresAuthoritativeItineraryProposalGenerationService(
  database: Database = getDatabase(),
): PostgresAuthoritativeItineraryProposalGenerationService {
  const repository = new DrizzleItineraryProposalRepository(database);
  const generationPort = new DeterministicItineraryProposalGenerator();
  const contextPort = createPostgresAuthoritativeItineraryProposalGenerationContextPort(database);

  return Object.freeze({
    generate(command: GenerateAuthoritativeItineraryProposalCommand): Promise<ItineraryProposal> {
      return generateAuthoritativeItineraryProposal(
        repository,
        generationPort,
        contextPort,
        command,
      );
    },
  });
}
