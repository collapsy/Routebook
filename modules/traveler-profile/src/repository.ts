import type { TravelerProfile } from "./profile";

export interface TravelerProfileRepository {
  findByTripId(tripId: string): Promise<TravelerProfile | null>;
  upsert(profile: TravelerProfile): Promise<void>;
}
