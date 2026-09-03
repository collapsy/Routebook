import { randomUUID } from "node:crypto";

export const PLACE_CATEGORIES = ["beach", "gastronomy", "nature", "nightlife"] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];
export const PLACE_PRICE_RANGES = ["free", "budget", "moderate", "premium"] as const;
export type PlacePriceRange = (typeof PLACE_PRICE_RANGES)[number];
export type PlacePublicationStatus = "draft" | "published" | "archived";

export type PlacePrimaryImage = Readonly<{
  assetPath: string;
  altText: string;
  sourceName: string;
  sourceUrl?: string;
  license: string;
  attribution?: string;
}>;

export type Place = {
  id: string;
  /** Legacy editorial grouping. Place identity is global and does not depend on a Destination. */
  destinationId?: string;
  slug: string;
  name: string;
  summary: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  addressLabel?: string;
  priceRange?: PlacePriceRange;
  primaryImage?: PlacePrimaryImage;
  publicationStatus: PlacePublicationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePlaceInput = {
  destinationId?: string;
  slug: string;
  name: string;
  summary: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  addressLabel?: string;
  priceRange?: PlacePriceRange;
  primaryImage?: PlacePrimaryImage;
  publicationStatus?: PlacePublicationStatus;
};

export class PlaceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlaceValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new PlaceValidationError(`${field} da imagem principal é obrigatório.`);
  }
  return value.trim();
}

function optionalText(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new PlaceValidationError(`${field} da imagem principal é inválido.`);
  }
  return value.trim() || undefined;
}

function validateSourceUrl(value: unknown): string | undefined {
  const sourceUrl = optionalText(value, "A URL de origem");
  if (!sourceUrl) return undefined;

  try {
    const parsed = new URL(sourceUrl);
    if (parsed.protocol !== "https:") {
      throw new PlaceValidationError("A URL de origem da imagem principal deve usar HTTPS.");
    }
  } catch (error) {
    if (error instanceof PlaceValidationError) throw error;
    throw new PlaceValidationError("A URL de origem da imagem principal é inválida.");
  }

  return sourceUrl;
}

export function parsePlacePrimaryImage(input: unknown): PlacePrimaryImage | undefined {
  if (input === undefined || input === null) return undefined;
  if (!isRecord(input)) {
    throw new PlaceValidationError("A imagem principal do lugar é inválida.");
  }

  const assetPath = requiredText(input.assetPath, "O assetPath");
  if (!/^\/place-images\/[a-zA-Z0-9][a-zA-Z0-9/_-]*\.(?:avif|webp|jpe?g|png)$/.test(assetPath)) {
    throw new PlaceValidationError(
      "A imagem principal deve usar um asset interno sob /place-images/.",
    );
  }

  const altText = requiredText(input.altText, "O altText");
  const sourceName = requiredText(input.sourceName, "A origem");
  const license = requiredText(input.license, "A licença");
  const sourceUrl = validateSourceUrl(input.sourceUrl);
  const attribution = optionalText(input.attribution, "A atribuição");

  return Object.freeze({
    assetPath,
    altText,
    sourceName,
    ...(sourceUrl ? { sourceUrl } : {}),
    license,
    ...(attribution ? { attribution } : {}),
  });
}

export function createPlace(input: CreatePlaceInput, now = new Date()): Place {
  const destinationId = input.destinationId?.trim() || undefined;
  const slug = input.slug.trim().toLowerCase();
  const name = input.name.trim();
  const summary = input.summary.trim();
  const addressLabel = input.addressLabel?.trim();
  const primaryImage = parsePlacePrimaryImage(input.primaryImage);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new PlaceValidationError("O slug do lugar deve ser canônico.");
  }
  if (name.length < 2) throw new PlaceValidationError("O nome do lugar é obrigatório.");
  if (summary.length < 20) throw new PlaceValidationError("O resumo do lugar é insuficiente.");
  if (!PLACE_CATEGORIES.includes(input.category)) {
    throw new PlaceValidationError("A categoria do lugar é inválida.");
  }
  if (input.priceRange !== undefined && !PLACE_PRICE_RANGES.includes(input.priceRange)) {
    throw new PlaceValidationError("A faixa de preço do lugar é inválida.");
  }
  if (input.latitude < -90 || input.latitude > 90) {
    throw new PlaceValidationError("A latitude do lugar é inválida.");
  }
  if (input.longitude < -180 || input.longitude > 180) {
    throw new PlaceValidationError("A longitude do lugar é inválida.");
  }

  return {
    id: randomUUID(),
    ...(destinationId ? { destinationId } : {}),
    slug,
    name,
    summary,
    category: input.category,
    latitude: input.latitude,
    longitude: input.longitude,
    ...(addressLabel ? { addressLabel } : {}),
    ...(input.priceRange ? { priceRange: input.priceRange } : {}),
    ...(primaryImage ? { primaryImage } : {}),
    publicationStatus: input.publicationStatus ?? "draft",
    createdAt: now,
    updatedAt: now,
  };
}
