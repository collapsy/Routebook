import type { Itinerary } from "./itinerary";

export interface ItineraryRepository {
  findByTripId(tripId: string): Promise<Itinerary | null>;
  save(itinerary: Itinerary): Promise<Itinerary>;
}
