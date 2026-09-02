import {
  placeDistanceMeters,
  type PlaceCategory,
  type PlaceQualitySignalMatch,
  type PlaceQualitySignalsPort,
  type PlaceQualityTarget,
} from "@routebook/place-catalog";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type ProviderCandidate = Readonly<{
  externalId: string;
  name: string;
  latitude: number;
  longitude: number;
  addressLabel?: string;
  targetedForId?: string;
  rating?: number;
  ratingScaleMax?: number;
  reviewCount?: number;
  popularity?: number;
  popularityScaleMax?: number;
}>;

type AdapterDependencies = Readonly<{
  fetcher?: FetchLike;
  now?: () => Date;
}>;

type QualityProviderName = "google" | "foursquare";

export type PlaceQualityProviderConfiguration =
  | Readonly<{ status: "not-configured" }>
  | Readonly<{ status: "invalid-provider"; requestedProvider: string }>
  | Readonly<{ status: "missing-secret"; provider: QualityProviderName; providerLabel: string }>
  | Readonly<{
      status: "configured";
      provider: QualityProviderName;
      providerLabel: string;
      port: PlaceQualitySignalsPort;
    }>;

const GOOGLE_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const FOURSQUARE_ENDPOINT = "https://places-api.foursquare.com/places/search";
const FOURSQUARE_API_VERSION = "2025-06-17";
const REQUEST_TIMEOUT_MS = 5_000;
const GOOGLE_TARGETED_FALLBACK_LIMIT_PER_CATEGORY = 4;
const GOOGLE_TARGETED_FALLBACK_PAGE_SIZE = 5;
const GOOGLE_TARGETED_FALLBACK_RADIUS_METERS = 2_500;
const GOOGLE_FIELD_MASK =
  "places.id,places.displayName,places.location,places.formattedAddress,places.rating,places.userRatingCount";

const CATEGORY_QUERY: Readonly<Record<PlaceCategory, string>> = Object.freeze({
  beach: "praias",
  gastronomy: "restaurantes",
  nightlife: "bares e vida noturna",
  nature: "atrações e natureza",
});

const IDENTITY_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "bar",
  "bares",
  "cafe",
  "cafeteria",
  "club",
  "clube",
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
  "praia",
  "restaurant",
  "restaurante",
  "restaurantes",
  "the",
  "y",
]);

const EXACT_NAME_MAX_DISTANCE_METERS = 300;
const TOKEN_MATCH_MAX_DISTANCE_METERS = 700;

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
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

function identityTokens(value: string): string[] {
  return normalizeIdentity(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !IDENTITY_STOPWORDS.has(token));
}

function candidateDistance(target: PlaceQualityTarget, candidate: ProviderCandidate): number {
  return placeDistanceMeters(target, candidate);
}

function addressRelationship(
  target: PlaceQualityTarget,
  candidate: ProviderCandidate,
): "same" | "different" | "unknown" {
  if (!target.addressLabel || !candidate.addressLabel) return "unknown";
  return normalizeIdentity(target.addressLabel) === normalizeIdentity(candidate.addressLabel)
    ? "same"
    : "different";
}

export function isConservativeQualityIdentityMatch(
  target: PlaceQualityTarget,
  candidate: ProviderCandidate,
): boolean {
  const distanceMeters = candidateDistance(target, candidate);
  const targetIdentity = normalizeIdentity(target.name);
  const candidateIdentity = normalizeIdentity(candidate.name);
  const address = addressRelationship(target, candidate);

  if (address === "different") return false;
  if (targetIdentity === candidateIdentity) {
    return distanceMeters <= EXACT_NAME_MAX_DISTANCE_METERS;
  }
  if (distanceMeters > TOKEN_MATCH_MAX_DISTANCE_METERS) return false;

  const targetTokens = identityTokens(target.name);
  const candidateTokens = identityTokens(candidate.name);
  if (targetTokens.length === 0 || candidateTokens.length === 0) return false;

  const candidateSet = new Set(candidateTokens);
  const shared = [...new Set(targetTokens.filter((token) => candidateSet.has(token)))];
  const distinctiveShared = shared.filter((token) => token.length >= 4);
  if (distinctiveShared.length === 0) return false;

  const minimumCoverage = shared.length / Math.min(targetTokens.length, candidateTokens.length);
  const unionCoverage = shared.length / new Set([...targetTokens, ...candidateTokens]).size;

  return (
    minimumCoverage >= 0.8 &&
    unionCoverage >= 0.5 &&
    (address === "same" || distanceMeters <= TOKEN_MATCH_MAX_DISTANCE_METERS)
  );
}

function selectCandidate(
  target: PlaceQualityTarget,
  candidates: readonly ProviderCandidate[],
  usedExternalIds: ReadonlySet<string>,
): ProviderCandidate | undefined {
  return candidates
    .filter(
      (candidate) =>
        !usedExternalIds.has(candidate.externalId) &&
        (isConservativeQualityIdentityMatch(target, candidate) ||
          isTargetedQualityIdentityExpansionMatch(target, candidate)),
    )
    .sort((left, right) => {
      const exactLeft = normalizeIdentity(left.name) === normalizeIdentity(target.name) ? 0 : 1;
      const exactRight = normalizeIdentity(right.name) === normalizeIdentity(target.name) ? 0 : 1;
      return (
        exactLeft - exactRight ||
        candidateDistance(target, left) - candidateDistance(target, right) ||
        left.externalId.localeCompare(right.externalId)
      );
    })[0];
}

function isTargetedQualityIdentityExpansionMatch(
  target: PlaceQualityTarget,
  candidate: ProviderCandidate,
): boolean {
  if (
    candidate.targetedForId !== target.id ||
    candidateDistance(target, candidate) > 1_200 ||
    addressRelationship(target, candidate) === "different"
  ) {
    return false;
  }

  const targetTokens = identityTokens(target.name);
  const candidateTokens = identityTokens(candidate.name);
  if (targetTokens.length === 0 || candidateTokens.length === 0) return false;

  const candidateSet = new Set(candidateTokens);
  const distinctiveTargetTokens = targetTokens.filter((token) => token.length >= 6);
  return (
    distinctiveTargetTokens.length > 0 &&
    distinctiveTargetTokens.every((token) => candidateSet.has(token)) &&
    candidateTokens.length <= targetTokens.length + 3
  );
}

function qualityMatchesFromCandidates(
  provider: string,
  targets: readonly PlaceQualityTarget[],
  candidates: readonly ProviderCandidate[],
  collectedAt: Date,
): PlaceQualitySignalMatch[] {
  const usedExternalIds = new Set<string>();
  const matches: PlaceQualitySignalMatch[] = [];

  for (const target of targets) {
    const candidate = selectCandidate(target, candidates, usedExternalIds);
    if (!candidate) continue;
    if (candidate.rating === undefined && candidate.popularity === undefined) continue;

    usedExternalIds.add(candidate.externalId);
    matches.push({
      targetId: target.id,
      signals: {
        provider,
        externalId: candidate.externalId,
        ...(candidate.rating === undefined || candidate.ratingScaleMax === undefined
          ? {}
          : {
              rating: {
                value: candidate.rating,
                scaleMax: candidate.ratingScaleMax,
                ...(candidate.reviewCount === undefined
                  ? {}
                  : { reviewCount: candidate.reviewCount }),
              },
            }),
        ...(candidate.popularity === undefined || candidate.popularityScaleMax === undefined
          ? {}
          : {
              popularity: {
                value: candidate.popularity,
                scaleMax: candidate.popularityScaleMax,
              },
            }),
        collectedAt,
      },
    });
  }

  return matches;
}

function targetGroups(
  targets: readonly PlaceQualityTarget[],
): ReadonlyArray<readonly [PlaceCategory, readonly PlaceQualityTarget[]]> {
  const groups = new Map<PlaceCategory, PlaceQualityTarget[]>();
  for (const target of targets) {
    const group = groups.get(target.category) ?? [];
    group.push(target);
    groups.set(target.category, group);
  }
  return [...groups.entries()];
}

function groupSearchArea(targets: readonly PlaceQualityTarget[]) {
  const latitude = targets.reduce((total, target) => total + target.latitude, 0) / targets.length;
  const longitude = targets.reduce((total, target) => total + target.longitude, 0) / targets.length;
  const center = { latitude, longitude };
  const maximumDistance = targets.reduce(
    (maximum, target) => Math.max(maximum, placeDistanceMeters(center, target)),
    0,
  );

  return {
    center,
    radiusMeters: Math.min(12_000, Math.max(2_000, Math.ceil(maximumDistance + 1_500))),
  };
}

async function fetchWithTimeout(
  fetcher: FetchLike,
  input: string | URL,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetcher(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

abstract class GroupedPlaceQualityAdapter implements PlaceQualitySignalsPort {
  protected readonly fetcher: FetchLike;
  protected readonly now: () => Date;

  constructor(dependencies: AdapterDependencies = {}) {
    this.fetcher = dependencies.fetcher ?? fetch;
    this.now = dependencies.now ?? (() => new Date());
  }

  protected abstract searchCategory(
    category: PlaceCategory,
    targets: readonly PlaceQualityTarget[],
  ): Promise<readonly ProviderCandidate[]>;

  protected abstract providerId(): string;

  async findSignals(
    targets: readonly PlaceQualityTarget[],
  ): Promise<readonly PlaceQualitySignalMatch[]> {
    if (targets.length === 0) return [];

    const groups = targetGroups(targets);
    const results = await Promise.allSettled(
      groups.map(async ([category, categoryTargets]) => {
        const candidates = await this.searchCategory(category, categoryTargets);
        return qualityMatchesFromCandidates(
          this.providerId(),
          categoryTargets,
          candidates,
          this.now(),
        );
      }),
    );

    const successful = results.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    );
    if (successful.length === 0 && results.some((result) => result.status === "rejected")) {
      throw new Error("O Provider de qualidade não respondeu para a seleção atual.");
    }

    const usedExternalIdentities = new Set<string>();
    return successful.filter((match) => {
      const key = `${match.signals.provider}:${match.signals.externalId}`;
      if (usedExternalIdentities.has(key)) return false;
      usedExternalIdentities.add(key);
      return true;
    });
  }
}

export class GooglePlacesQualityAdapter extends GroupedPlaceQualityAdapter {
  constructor(
    private readonly apiKey: string,
    dependencies: AdapterDependencies = {},
  ) {
    super(dependencies);
  }

  protected providerId(): string {
    return "google-places";
  }

  private async search(
    textQuery: string,
    center: Readonly<{ latitude: number; longitude: number }>,
    radiusMeters: number,
    pageSize: number,
    context: string,
    targetedForId?: string,
  ): Promise<readonly ProviderCandidate[]> {
    const response = await fetchWithTimeout(this.fetcher, GOOGLE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask": GOOGLE_FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery,
        languageCode: "pt-BR",
        regionCode: "BR",
        pageSize,
        locationBias: {
          circle: {
            center,
            radius: radiusMeters,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Places respondeu HTTP ${response.status} para ${context}.`);
    }

    const payload = (await response.json()) as {
      places?: readonly {
        id?: string;
        displayName?: Readonly<{ text?: string }>;
        location?: Readonly<{ latitude?: number; longitude?: number }>;
        formattedAddress?: string;
        rating?: number;
        userRatingCount?: number;
      }[];
    };

    return (payload.places ?? []).flatMap((place) => {
      const externalId = cleanText(place.id);
      const name = cleanText(place.displayName?.text);
      const latitude = finiteNumber(place.location?.latitude);
      const longitude = finiteNumber(place.location?.longitude);
      if (!externalId || !name || latitude === undefined || longitude === undefined) return [];

      const addressLabel = cleanText(place.formattedAddress);
      const rating = finiteNumber(place.rating);
      const reviewCount = finiteNumber(place.userRatingCount);
      return [
        {
          externalId,
          name,
          latitude,
          longitude,
          ...(addressLabel ? { addressLabel } : {}),
          ...(targetedForId ? { targetedForId } : {}),
          ...(rating === undefined ? {} : { rating, ratingScaleMax: 5 }),
          ...(reviewCount === undefined ? {} : { reviewCount }),
        },
      ];
    });
  }

  protected async searchCategory(
    category: PlaceCategory,
    targets: readonly PlaceQualityTarget[],
  ): Promise<readonly ProviderCandidate[]> {
    const { center, radiusMeters } = groupSearchArea(targets);
    const categoryCandidates = await this.search(
      CATEGORY_QUERY[category],
      center,
      radiusMeters,
      20,
      category,
    );
    const targetsWithoutCategoryCandidate = targets
      .filter(
        (target) =>
          !categoryCandidates.some((candidate) =>
            isConservativeQualityIdentityMatch(target, candidate),
          ),
      )
      .slice(0, GOOGLE_TARGETED_FALLBACK_LIMIT_PER_CATEGORY);

    const targetedResults = await Promise.allSettled(
      targetsWithoutCategoryCandidate.map((target) =>
        this.search(
          target.addressLabel ? `${target.name}, ${target.addressLabel}` : target.name,
          { latitude: target.latitude, longitude: target.longitude },
          GOOGLE_TARGETED_FALLBACK_RADIUS_METERS,
          GOOGLE_TARGETED_FALLBACK_PAGE_SIZE,
          `${category}:${target.id}`,
          target.id,
        ),
      ),
    );

    return [
      ...categoryCandidates,
      ...targetedResults.flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
    ];
  }
}

export class FoursquarePlacesQualityAdapter extends GroupedPlaceQualityAdapter {
  constructor(
    private readonly serviceKey: string,
    dependencies: AdapterDependencies = {},
  ) {
    super(dependencies);
  }

  protected providerId(): string {
    return "foursquare-places";
  }

  protected async searchCategory(
    category: PlaceCategory,
    targets: readonly PlaceQualityTarget[],
  ): Promise<readonly ProviderCandidate[]> {
    const { center, radiusMeters } = groupSearchArea(targets);
    const url = new URL(FOURSQUARE_ENDPOINT);
    url.searchParams.set("query", CATEGORY_QUERY[category]);
    url.searchParams.set("ll", `${center.latitude},${center.longitude}`);
    url.searchParams.set("radius", String(radiusMeters));
    url.searchParams.set("limit", "50");
    url.searchParams.set("fields", "fsq_place_id,name,latitude,longitude,rating,popularity");
    url.searchParams.set("sort", "RELEVANCE");

    const response = await fetchWithTimeout(this.fetcher, url, {
      headers: {
        Authorization: `Bearer ${this.serviceKey}`,
        "X-Places-Api-Version": FOURSQUARE_API_VERSION,
      },
    });

    if (!response.ok) {
      throw new Error(`Foursquare Places respondeu HTTP ${response.status} para ${category}.`);
    }

    const payload = (await response.json()) as {
      results?: readonly {
        fsq_place_id?: string;
        name?: string;
        latitude?: number;
        longitude?: number;
        rating?: number;
        popularity?: number;
      }[];
    };

    return (payload.results ?? []).flatMap((place) => {
      const externalId = cleanText(place.fsq_place_id);
      const name = cleanText(place.name);
      const latitude = finiteNumber(place.latitude);
      const longitude = finiteNumber(place.longitude);
      if (!externalId || !name || latitude === undefined || longitude === undefined) return [];

      const rating = finiteNumber(place.rating);
      const popularity = finiteNumber(place.popularity);
      return [
        {
          externalId,
          name,
          latitude,
          longitude,
          ...(rating === undefined ? {} : { rating, ratingScaleMax: 10 }),
          ...(popularity === undefined ? {} : { popularity, popularityScaleMax: 1 }),
        },
      ];
    });
  }
}

export function resolveConfiguredPlaceQualityProvider(
  environment: Readonly<Record<string, string | undefined>> = process.env,
  dependencies: AdapterDependencies = {},
): PlaceQualityProviderConfiguration {
  const requestedProvider = cleanText(environment.ROUTEBOOK_PLACE_QUALITY_PROVIDER).toLowerCase();
  if (!requestedProvider) return { status: "not-configured" };
  if (requestedProvider !== "google" && requestedProvider !== "foursquare") {
    return { status: "invalid-provider", requestedProvider };
  }

  if (requestedProvider === "google") {
    const apiKey = cleanText(environment.GOOGLE_PLACES_API_KEY);
    if (!apiKey) {
      return {
        status: "missing-secret",
        provider: "google",
        providerLabel: "Google Places",
      };
    }
    return {
      status: "configured",
      provider: "google",
      providerLabel: "Google Places",
      port: new GooglePlacesQualityAdapter(apiKey, dependencies),
    };
  }

  const serviceKey = cleanText(environment.FOURSQUARE_PLACES_API_KEY);
  if (!serviceKey) {
    return {
      status: "missing-secret",
      provider: "foursquare",
      providerLabel: "Foursquare Places",
    };
  }
  return {
    status: "configured",
    provider: "foursquare",
    providerLabel: "Foursquare Places",
    port: new FoursquarePlacesQualityAdapter(serviceKey, dependencies),
  };
}
