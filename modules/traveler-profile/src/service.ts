import type { SaveTravelerProfileInput, TravelerProfile } from "./profile";
import { saveTravelerProfile } from "./profile";
import type { TravelerProfileRepository } from "./repository";

export function findTravelerProfile(
  repository: TravelerProfileRepository,
  tripId: string,
): Promise<TravelerProfile | null> {
  return repository.findByTripId(tripId);
}

export async function saveAndPersistTravelerProfile(
  repository: TravelerProfileRepository,
  input: SaveTravelerProfileInput,
): Promise<TravelerProfile> {
  const current = await repository.findByTripId(input.tripId);
  const profile = saveTravelerProfile(input, current ?? undefined);
  await repository.upsert(profile);
  return profile;
}
