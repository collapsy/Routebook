import { randomUUID } from "node:crypto";

export const PLACE_CATEGORIES = ["beach", "gastronomy", "nature", "nightlife"] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];
export type PlacePublicationStatus = "draft" | "published" | "archived";

export type Place = {
  id: string;
  destinationId: string;
  slug: string;
  name: string;
  summary: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  addressLabel?: string;
  publicationStatus: PlacePublicationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePlaceInput = {
  destinationId: string;
  slug: string;
  name: string;
  summary: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  addressLabel?: string;
  publicationStatus?: PlacePublicationStatus;
};

export class PlaceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlaceValidationError";
  }
}

export function createPlace(input: CreatePlaceInput, now = new Date()): Place {
  const destinationId = input.destinationId.trim();
  const slug = input.slug.trim().toLowerCase();
  const name = input.name.trim();
  const summary = input.summary.trim();
  const addressLabel = input.addressLabel?.trim();

  if (!destinationId) throw new PlaceValidationError("O destino do lugar é obrigatório.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new PlaceValidationError("O slug do lugar deve ser canônico.");
  }
  if (name.length < 2) throw new PlaceValidationError("O nome do lugar é obrigatório.");
  if (summary.length < 20) throw new PlaceValidationError("O resumo do lugar é insuficiente.");
  if (!PLACE_CATEGORIES.includes(input.category)) {
    throw new PlaceValidationError("A categoria do lugar é inválida.");
  }
  if (input.latitude < -90 || input.latitude > 90) {
    throw new PlaceValidationError("A latitude do lugar é inválida.");
  }
  if (input.longitude < -180 || input.longitude > 180) {
    throw new PlaceValidationError("A longitude do lugar é inválida.");
  }

  return {
    id: randomUUID(),
    destinationId,
    slug,
    name,
    summary,
    category: input.category,
    latitude: input.latitude,
    longitude: input.longitude,
    ...(addressLabel ? { addressLabel } : {}),
    publicationStatus: input.publicationStatus ?? "draft",
    createdAt: now,
    updatedAt: now,
  };
}
