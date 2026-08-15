import type { Trip } from "./trip";

export interface TripRepository {
  create(trip: Trip): Promise<void>;
  update(trip: Trip): Promise<void>;
  deleteById(tripId: string): Promise<boolean>;
  list(): Promise<Trip[]>;
  findById(tripId: string): Promise<Trip | null>;
}