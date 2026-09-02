import type { Place, PlaceCategory } from "./place";

export type PlaceSearchQuery = Readonly<{
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
  providerCategoryHierarchy?: readonly string[];
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

export type ExternalPlaceReconciliationStatus = "new" | "possible_match" | "linked" | "rejected";

export type ExternalPlaceMatchEvidence = Readonly<{
  externalReference?: Readonly<{ provider: string; externalId: string }>;
  categoryMatch?: boolean;
  nameMatch?: "exact" | "token-overlap" | "category-alias";
  addressMatch?: "exact" | "conflict";
  sharedDistinctiveTokens?: readonly string[];
  distanceMeters?: number;
}>;

export type ExternalPlaceReconciliation = Readonly<{
  candidate: ExternalPlaceCandidate;
  status: ExternalPlaceReconciliationStatus;
  matchedPlaceId?: string;
  reason: string;
  distanceMeters?: number;
  evidence?: ExternalPlaceMatchEvidence;
}>;

export interface PlaceSearchPort {
  search(query: PlaceSearchQuery): Promise<readonly ExternalPlaceCandidate[]>;
}

export type ExternalPlaceImageCachePolicy = "download_allowed" | "temporary_only" | "unknown";

export type ExternalPlaceImageCandidate = Readonly<{
  provider: string;
  externalPlaceId: string;
  sourceUrl: string;
  sourceName: string;
  license: string;
  attribution?: string;
  collectedAt: Date;
  cachePolicy: ExternalPlaceImageCachePolicy;
}>;

export interface PlaceImagePort {
  findCandidates(
    place: Readonly<{ name: string; latitude: number; longitude: number; externalId?: string }>,
  ): Promise<readonly ExternalPlaceImageCandidate[]>;
}

const OVERTURE_CATEGORY_MAP: Readonly<Record<string, PlaceCategory>> = Object.freeze({
  beach: "beach",
  restaurant: "gastronomy",
  casual_eatery: "gastronomy",
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
  nightclub: "nightlife",
  cocktail_bar: "nightlife",
  music_venue: "nightlife",
  park: "nature",
  nature_reserve: "nature",
  scenic_viewpoint: "nature",
  viewpoint: "nature",
  tourist_attraction: "nature",
  lagoon: "nature",
  waterfall: "nature",
  botanical_garden: "nature",
  hiking_area: "nature",
});

const IDENTITY_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "da",
  "das",
  "de",
  "del",
  "do",
  "dos",
  "e",
  "el",
  "em",
  "en",
  "la",
  "las",
  "los",
  "na",
  "nas",
  "no",
  "nos",
  "o",
  "of",
  "os",
  "para",
  "por",
  "the",
  "um",
  "un",
  "uma",
  "una",
  "y",
]);

const GENERIC_IDENTITY_TOKENS = new Set([
  "bar",
  "beach",
  "cafe",
  "cafeteria",
  "club",
  "clube",
  "hotel",
  "mirante",
  "pousada",
  "praia",
  "restaurant",
  "restaurante",
]);

const BEACH_IDENTITY_DESCRIPTORS = new Set(["baia", "bahia", "beach", "playa", "praia"]);
const BEACH_ALIAS_MAX_DISTANCE_METERS = 500;
const BEACH_ALIAS_RECONCILIATION_MAX_DISTANCE_METERS = 800;
const EXACT_NAME_MAX_DISTANCE_METERS = 300;
const EXACT_ADDRESS_MAX_DISTANCE_METERS = 500;
const TOKEN_IDENTITY_MAX_DISTANCE_METERS = 350;
const SINGLE_TOKEN_IDENTITY_MAX_DISTANCE_METERS = 100;
const EXTREME_PROXIMITY_MAX_DISTANCE_METERS = 50;

function normalizeOvertureCategory(value: string): string {
  return value.trim().toLowerCase();
}

export function mapOverturePlaceCategory(
  category: string,
  hierarchy: readonly string[] = [],
): PlaceCategory | undefined {
  const direct = OVERTURE_CATEGORY_MAP[normalizeOvertureCategory(category)];
  if (direct) return direct;

  for (const value of [...hierarchy].map(normalizeOvertureCategory).reverse()) {
    const mapped = OVERTURE_CATEGORY_MAP[value];
    if (mapped && mapped !== "beach") return mapped;
  }
  return undefined;
}

export function validatePlaceSearchQuery(query: PlaceSearchQuery): void {
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
  if (
    !Number.isFinite(query.radiusMeters) ||
    query.radiusMeters <= 0 ||
    query.radiusMeters > 50_000
  ) {
    throw new Error("O raio da busca externa deve estar entre 1 e 50000 metros.");
  }
  if (
    query.limit !== undefined &&
    (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 200)
  ) {
    throw new Error("O limite da busca externa deve estar entre 1 e 200.");
  }
}

function requireHttpsUrl(value: string, message: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(message);
  }
  if (url.protocol !== "https:") throw new Error(message);
}

export function validateExternalPlaceCandidate(candidate: ExternalPlaceCandidate): void {
  if (!candidate.provider.trim()) throw new Error("O Provider do candidato externo é obrigatório.");
  if (!candidate.externalId.trim())
    throw new Error("O identificador externo do candidato é obrigatório.");
  if (candidate.name.trim().length < 2) throw new Error("O nome do candidato externo é inválido.");
  if (!candidate.providerCategory.trim())
    throw new Error("A categoria externa do candidato é obrigatória.");
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
  if (
    candidate.confidence !== undefined &&
    (candidate.confidence < 0 || candidate.confidence > 1)
  ) {
    throw new Error("A confiança do candidato externo deve estar entre 0 e 1.");
  }
  if (candidate.sourceUrl) {
    requireHttpsUrl(candidate.sourceUrl, "A URL da Fonte externa deve usar HTTPS.");
  }
  if (Number.isNaN(candidate.collectedAt.getTime())) {
    throw new Error("O instante de coleta do candidato externo é inválido.");
  }
}

export function validateExternalPlaceImageCandidate(candidate: ExternalPlaceImageCandidate): void {
  if (!candidate.provider.trim()) throw new Error("O Provider da imagem externa é obrigatório.");
  if (!candidate.externalPlaceId.trim())
    throw new Error("A identidade externa do Place da imagem é obrigatória.");
  if (!candidate.sourceName.trim()) throw new Error("A Fonte da imagem externa é obrigatória.");
  if (!candidate.license.trim()) throw new Error("A licença da imagem externa é obrigatória.");
  requireHttpsUrl(candidate.sourceUrl, "A URL da imagem externa deve usar HTTPS.");
  if (Number.isNaN(candidate.collectedAt.getTime())) {
    throw new Error("O instante de coleta da imagem externa é inválido.");
  }
}

export function canPromoteExternalImageToControlledAsset(
  candidate: ExternalPlaceImageCandidate,
): boolean {
  try {
    validateExternalPlaceImageCandidate(candidate);
  } catch {
    return false;
  }
  return candidate.cachePolicy === "download_allowed";
}

function normalizeIdentity(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizedNameTokens(value: string): string[] {
  return normalizeIdentity(value).split(" ").filter(Boolean);
}

function identityTokens(value: string): string[] {
  return normalizedNameTokens(value).filter((token) => !IDENTITY_STOP_WORDS.has(token));
}

function beachIdentityTokens(value: string): string[] {
  const segments = value
    .split(/[,/\-–—]+/)
    .map(normalizeIdentity)
    .filter(Boolean);
  const selectedSegment =
    segments.find((segment) =>
      normalizedNameTokens(segment).some((token) => BEACH_IDENTITY_DESCRIPTORS.has(token)),
    ) ??
    segments[0] ??
    normalizeIdentity(value);

  return normalizedNameTokens(selectedSegment).filter(
    (token) =>
      !IDENTITY_STOP_WORDS.has(token) &&
      !BEACH_IDENTITY_DESCRIPTORS.has(token) &&
      !GENERIC_IDENTITY_TOKENS.has(token) &&
      !(token.length === 2 && /^[a-z]{2}$/.test(token)),
  );
}

function tokenEditDistance(first: string, second: string): number {
  const previous = Array.from({ length: second.length + 1 }, (_, index) => index);
  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    const current = [firstIndex];
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      current[secondIndex] = Math.min(
        (current[secondIndex - 1] ?? 0) + 1,
        (previous[secondIndex] ?? 0) + 1,
        (previous[secondIndex - 1] ?? 0) +
          (first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[second.length] ?? Number.POSITIVE_INFINITY;
}

function haveEquivalentBeachIdentityNames(first: string, second: string): boolean {
  const firstTokens = beachIdentityTokens(first);
  const secondTokens = beachIdentityTokens(second);
  if (firstTokens.length === 0 || secondTokens.length === 0) return false;

  if (
    firstTokens.length === secondTokens.length &&
    firstTokens.every((token, index) => token === secondTokens[index])
  ) {
    return true;
  }

  if (firstTokens.length === 1 && secondTokens.length === 1) {
    const [firstToken] = firstTokens;
    const [secondToken] = secondTokens;
    if (!firstToken || !secondToken || Math.min(firstToken.length, secondToken.length) < 6) {
      return false;
    }
    const maximumEditDistance = Math.min(firstToken.length, secondToken.length) >= 8 ? 3 : 2;
    return tokenEditDistance(firstToken, secondToken) <= maximumEditDistance;
  }

  return false;
}

function distinctiveIdentityTokens(tokens: readonly string[]): string[] {
  return tokens.filter((token) => token.length >= 4 && !GENERIC_IDENTITY_TOKENS.has(token));
}

function tokenIntersection(first: readonly string[], second: readonly string[]): string[] {
  const secondSet = new Set(second);
  return [...new Set(first.filter((token) => secondSet.has(token)))];
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

type IdentitySignals = Readonly<{
  distanceMeters: number;
  exactName: boolean;
  exactAddress: boolean;
  addressConflict: boolean;
  categoryAlias: boolean;
  sharedTokens: readonly string[];
  sharedDistinctiveTokens: readonly string[];
  strongIdentity: boolean;
}>;

function identitySignals(candidate: ExternalPlaceCandidate, place: Place): IdentitySignals {
  const distanceMeters = placeDistanceMeters(candidate, place);
  const exactName = normalizeIdentity(candidate.name) === normalizeIdentity(place.name);
  const hasBothAddresses = Boolean(candidate.addressLabel && place.addressLabel);
  const exactAddress =
    hasBothAddresses &&
    normalizeIdentity(candidate.addressLabel ?? "") === normalizeIdentity(place.addressLabel ?? "");
  const addressConflict = hasBothAddresses && !exactAddress;
  const categoryAlias =
    candidate.category === "beach" &&
    place.category === "beach" &&
    haveEquivalentBeachIdentityNames(candidate.name, place.name);

  const candidateTokens = identityTokens(candidate.name);
  const placeTokens = identityTokens(place.name);
  const sharedTokens = tokenIntersection(candidateTokens, placeTokens);
  const sharedDistinctiveTokens = distinctiveIdentityTokens(sharedTokens);
  const minimumTokenCount = Math.min(candidateTokens.length, placeTokens.length);
  const unionTokenCount = new Set([...candidateTokens, ...placeTokens]).size;
  const minimumCoverage = minimumTokenCount === 0 ? 0 : sharedTokens.length / minimumTokenCount;
  const jaccard = unionTokenCount === 0 ? 0 : sharedTokens.length / unionTokenCount;

  const tokenIdentity =
    !addressConflict &&
    sharedDistinctiveTokens.length > 0 &&
    ((distanceMeters <= TOKEN_IDENTITY_MAX_DISTANCE_METERS &&
      sharedTokens.length >= 2 &&
      minimumCoverage >= 0.8 &&
      jaccard >= 0.5) ||
      (distanceMeters <= SINGLE_TOKEN_IDENTITY_MAX_DISTANCE_METERS &&
        minimumTokenCount === 1 &&
        sharedTokens.length === 1 &&
        minimumCoverage === 1));

  const strongIdentity =
    candidate.category === place.category &&
    !addressConflict &&
    ((categoryAlias && distanceMeters <= BEACH_ALIAS_MAX_DISTANCE_METERS) ||
      (exactAddress && distanceMeters <= EXACT_ADDRESS_MAX_DISTANCE_METERS) ||
      (exactName && distanceMeters <= EXACT_NAME_MAX_DISTANCE_METERS) ||
      tokenIdentity);

  return {
    distanceMeters,
    exactName,
    exactAddress,
    addressConflict,
    categoryAlias,
    sharedTokens,
    sharedDistinctiveTokens,
    strongIdentity,
  };
}

function matchEvidence(signals: IdentitySignals): ExternalPlaceMatchEvidence {
  return {
    categoryMatch: true,
    ...(signals.exactName
      ? { nameMatch: "exact" as const }
      : signals.categoryAlias
        ? { nameMatch: "category-alias" as const }
        : signals.sharedDistinctiveTokens.length > 0
          ? { nameMatch: "token-overlap" as const }
          : {}),
    ...(signals.addressConflict
      ? { addressMatch: "conflict" as const }
      : signals.exactAddress
        ? { addressMatch: "exact" as const }
        : {}),
    ...(signals.sharedDistinctiveTokens.length > 0
      ? { sharedDistinctiveTokens: signals.sharedDistinctiveTokens }
      : {}),
    distanceMeters: signals.distanceMeters,
  };
}

export function isStrongExternalPlaceIdentityMatch(
  candidate: ExternalPlaceCandidate,
  place: Place,
): boolean {
  if (!candidate.category || candidate.category !== place.category) return false;
  return identitySignals(candidate, place).strongIdentity;
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
      evidence: {
        externalReference: {
          provider: linkedReference.provider,
          externalId: linkedReference.externalId,
        },
      },
    };
  }

  const possibleMatches = places
    .filter((place) => place.category === candidate.category)
    .map((place) => ({ place, signals: identitySignals(candidate, place) }))
    .filter(({ signals }) => {
      if (signals.addressConflict) return false;
      return (
        signals.strongIdentity ||
        (signals.categoryAlias &&
          signals.distanceMeters <= BEACH_ALIAS_RECONCILIATION_MAX_DISTANCE_METERS) ||
        (signals.exactName && signals.distanceMeters <= EXACT_NAME_MAX_DISTANCE_METERS) ||
        (signals.exactAddress && signals.distanceMeters <= EXACT_ADDRESS_MAX_DISTANCE_METERS) ||
        signals.distanceMeters <= EXTREME_PROXIMITY_MAX_DISTANCE_METERS
      );
    })
    .sort(
      (left, right) =>
        Number(right.signals.strongIdentity) - Number(left.signals.strongIdentity) ||
        Number(right.signals.exactAddress) - Number(left.signals.exactAddress) ||
        Number(right.signals.exactName) - Number(left.signals.exactName) ||
        Number(right.signals.categoryAlias) - Number(left.signals.categoryAlias) ||
        left.signals.distanceMeters - right.signals.distanceMeters,
    );

  const nearest = possibleMatches[0];
  if (nearest) {
    const { signals } = nearest;
    return {
      candidate,
      status: "possible_match",
      matchedPlaceId: nearest.place.id,
      reason: signals.strongIdentity
        ? "Nome ou endereço, categoria e proximidade sustentam possível duplicata; exige reconciliação antes da promoção."
        : signals.categoryAlias
          ? "Alias nominal de categoria e proximidade sustentam possível duplicata; exige reconciliação antes da promoção."
          : signals.exactName
            ? "Nome e proximidade indicam possível duplicata; exige reconciliação antes da promoção."
            : signals.exactAddress
              ? "Endereço e proximidade indicam possível duplicata; exige reconciliação antes da promoção."
              : "Proximidade extrema e mesma categoria indicam possível duplicata; exige reconciliação antes da promoção.",
      distanceMeters: signals.distanceMeters,
      evidence: matchEvidence(signals),
    };
  }

  return {
    candidate,
    status: "new",
    reason: "Nenhum Place canônico ou vínculo externo compatível foi encontrado.",
  };
}
