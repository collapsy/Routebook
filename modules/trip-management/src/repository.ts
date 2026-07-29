import type { Trip } from "./trip";

export interface TripRepository {
  create(trip: Trip): Promise<void>;
  update(trip: Trip): Promise<void>;
  list(): Promise<Trip[]>;
  findById(tripId: string): Promise<Trip | null>;
}
