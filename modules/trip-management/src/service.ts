import type { TripRepository } from "./repository";
import { createTrip, type CreateTripInput, type Trip } from "./trip";

export async function createAndPersistTrip(
  repository: TripRepository,
  input: CreateTripInput,
): Promise<Trip> {
  const trip = createTrip(input);
  await repository.create(trip);
  return trip;
}

export function listTrips(repository: TripRepository): Promise<Trip[]> {
  return repository.list();
}

export function findTripById(repository: TripRepository, tripId: string): Promise<Trip | null> {
  return repository.findById(tripId);
}
