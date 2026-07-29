import { randomUUID } from "node:crypto";

export type SavedPlace = {
  id: string;
  tripId: string;
  placeId: string;
  createdAt: Date;
};

export type SavePlaceInput = {
  tripId: string;
  placeId: string;
};

export class SavedPlaceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SavedPlaceValidationError";
  }
}

export function createSavedPlace(input: SavePlaceInput, now = new Date()): SavedPlace {
  const tripId = input.tripId.trim();
  const placeId = input.placeId.trim();

  if (!tripId) throw new SavedPlaceValidationError("A viagem é obrigatória.");
  if (!placeId) throw new SavedPlaceValidationError("O lugar é obrigatório.");

  return {
    id: randomUUID(),
    tripId,
    placeId,
    createdAt: now,
  };
}
