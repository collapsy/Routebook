import type { Place, PlaceCategory } from "./place";

export type PlaceSearchQuery = Readonly<{
  destinationId: string;
  center: Readonly<{ latitude: number; longitude: number }>;
  radiusMeters: number;
  categories?: readonly PlaceCategory[];
  limit?: number;
}>;

export type ExternalPlaceCandidate = Readonly<{
  provider: string;
  externalId: string;
  name: string;
  latitude: number;
  longitude: number;
  providerCategory: string;
  category?: PlaceCategory;
  addressLabel?: string;
  sourceUrl?: string;
  sourceLicense: string;
  collectedAt: Date;
  confidence?: number;
}>;

export type PlaceExternalReference = Readonly<{
  placeId: string;
  provider: string;
  externalId: string;
}>;

export type ExternalPlaceReconciliationStatus =
  | "new"
  | "possible_match"
  | "linked"
  | "rejected";

export type ExternalPlaceReconciliation = Readonly<{
  candidate: ExternalPlaceCandidate;
  status: ExternalPlaceReconciliationStatus;
  matchedPlaceId?: string;
  reason: string;
  distanceMeters?: number;
}>;

export interface PlaceSearchPort {
  search(query: PlaceSearchQuery): Promise<readonly ExternalPlaceCandidate[]>;
}

const OVERTURE_CATEGORY_MAP: Readonly<Record<string, PlaceCategory>> = Object.freeze({
  beach: "beach",
  restaurant: "gastronomy",
  cafe: "gastronomy",
  coffee_shop: "gastronomy",
  bakery: "gastronomy",
  ice_cream_shop: "gastronomy",
  food_court: "gastronomy",
  fast_food_restaurant: "gastronomy",
  juice_bar: "gastronomy",
  bar_and_grill: "gastronomy",
  bar: "nightlife",
  pub: "nightlife",
  night_club: "nightlife",
  cocktail_bar: "nightlife",
  music_venue: "nightlife",
  park: "nature",
  nature_reserve: "nature",
  scenic_viewpoint: "nature",
  tourist_attraction: "nature",
  lagoon: "nature",
  waterfall: "nature",
  botanical_garden: "nature",
  hiking_area: "nature",
});

export function mapOverturePlaceCategory(category: string): PlaceCategory | undefined {
  return OVERTURE_CATEGORY_MAP[category.trim().toLowerCase()];
}

export function validatePlaceSearchQuery(query: PlaceSearchQuery): void {
  if (!query.destinationId.trim()) throw new Error("O destino da busca externa é obrigatório.");
  if (
    !Number.isFinite(query.center.latitude) ||
    query.center.latitude < -90 ||
    query.center.latitude > 90 ||
    !Number.isFinite(query.center.longitude) ||
    query.center.longitude < -180 ||
    query.center.longitude > 180
  ) {
    throw new Error("O centro geográfico da busca externa é inválido.");
  }
  if (!Number.isFinite(query.radiusMeters) || query.radiusMeters <= 0 || query.radiusMeters > 50_000) {
    throw new Error("O raio da busca externa deve estar entre 1 e 50000 metros.");
  }
  if (query.limit !== undefined && (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 200)) {
    throw new Error("O limite da busca externa deve estar entre 1 e 200.");
  }
}

export function validateExternalPlaceCandidate(candidate: ExternalPlaceCandidate): void {
  if (!candidate.provider.trim()) throw new Error("O Provider do candidato externo é obrigatório.");
  if (!candidate.externalId.trim()) throw new Error("O identificador externo do candidato é obrigatório.");
  if (candidate.name.trim().length < 2) throw new Error("O nome do candidato externo é inválido.");
  if (!candidate.providerCategory.trim()) throw new Error("A categoria externa do candidato é obrigatória.");
  if (!candidate.sourceLicense.trim()) throw new Error("A licença da Fonte externa é obrigatória.");
  if (
    !Number.isFinite(candidate.latitude) ||
    candidate.latitude < -90 ||
    candidate.latitude > 90 ||
    !Number.isFinite(candidate.longitude) ||
    candidate.longitude < -180 ||
    candidate.longitude > 180
  ) {
    throw new Error("As coordenadas do candidato externo são inválidas.");
  }
  if (candidate.confidence !== undefined && (candidate.confidence < 0 || candidate.confidence > 1)) {
    throw new Error("A confiança do candidato externo deve estar entre 0 e 1.");
  }
  if (candidate.sourceUrl) {
    const source = new URL(candidate.sourceUrl);
    if (source.protocol !== "https:") {
      throw new Error("A URL da Fonte externa deve usar HTTPS.");
    }
  }
  if (Number.isNaN(candidate.collectedAt.getTime())) {
    throw new Error("O instante de coleta do candidato externo é inválido.");
  }
}

function normalizeIdentity(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function placeDistanceMeters(
  first: Readonly<{ latitude: number; longitude: number }>,
  second: Readonly<{ latitude: number; longitude: number }>,
): number {
  const earthRadiusMeters = 6_371_008.8;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

export function reconcileExternalPlaceCandidate(
  candidate: ExternalPlaceCandidate,
  places: readonly Place[],
  references: readonly PlaceExternalReference[] = [],
): ExternalPlaceReconciliation {
  try {
    validateExternalPlaceCandidate(candidate);
  } catch (error) {
    return {
      candidate,
      status: "rejected",
      reason: error instanceof Error ? error.message : "Candidato externo inválido.",
    };
  }

  if (!candidate.category) {
    return {
      candidate,
      status: "rejected",
      reason: `A categoria externa '${candidate.providerCategory}' não possui mapeamento canônico.`,
    };
  }

  const linkedReference = references.find(
    (reference) =>
      reference.provider === candidate.provider && reference.externalId === candidate.externalId,
  );
  if (linkedReference) {
    return {
      candidate,
      status: "linked",
      matchedPlaceId: linkedReference.placeId,
      reason: "A referência externa já está vinculada a um Place canônico.",
    };
  }

  const normalizedCandidateName = normalizeIdentity(candidate.name);
  const possibleMatches = places
    .filter((place) => place.category === candidate.category)
    .map((place) => ({
      place,
      distanceMeters: placeDistanceMeters(candidate, place),
      sameName: normalizeIdentity(place.name) === normalizedCandidateName,
      sameAddress:
        Boolean(candidate.addressLabel && place.addressLabel) &&
        normalizeIdentity(candidate.addressLabel ?? "") === normalizeIdentity(place.addressLabel ?? ""),
    }))
    .filter(
      (match) =>
        (match.sameName && match.distanceMeters <= 500) ||
        (match.sameAddress && match.distanceMeters <= 500) ||
        match.distanceMeters <= 75,
    )
    .sort((left, right) => left.distanceMeters - right.distanceMeters);

  const nearest = possibleMatches[0];
  if (nearest) {
    return {
      candidate,
      status: "possible_match",
      matchedPlaceId: nearest.place.id,
      reason: nearest.sameName
        ? "Nome e proximidade indicam possível duplicata; exige reconciliação antes da promoção."
        : nearest.sameAddress
          ? "Endereço e proximidade indicam possível duplicata; exige reconciliação antes da promoção."
          : "Proximidade extrema e mesma categoria indicam possível duplicata; exige reconciliação antes da promoção.",
      distanceMeters: nearest.distanceMeters,
    };
  }

  return {
    candidate,
    status: "new",
    reason: "Nenhum Place canônico ou vínculo externo compatível foi encontrado.",
  };
}
