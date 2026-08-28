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

const CATEGORY_QUERY: Readonly<Record<PlaceCategory, string>> = Object.freeze({
  beach: "praias",
  gastronomy: "restaurantes",
  nightlife: "bares e vida noturna",
  nature: "atrações e natureza",
});

const IDENTITY_STOPWORDS = new Set([
  "a",
  "as",
  "bar",
  "bares",
  "cafe",
  "cafeteria",
  "club",
  "clube",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "em",
  "na",
  "nas",
  "no",
  "nos",
  "o",
  "os",
  "pipa",
  "praia",
  "restaurant",
  "restaurante",
  "restaurantes",
  "rn",
  "tibau",
  "sul",
]);

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
    .toLocaleLowerCase("pt-BR")
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

export function isConservativeQualityIdentityMatch(
  target: PlaceQualityTarget,
  candidate: ProviderCandidate,
): boolean {
  const distanceMeters = candidateDistance(target, candidate);
  const targetIdentity = normalizeIdentity(target.name);
  const candidateIdentity = normalizeIdentity(candidate.name);

  if (targetIdentity === candidateIdentity) return distanceMeters <= 2_500;
  if (distanceMeters > 700) return false;

  const targetTokens = identityTokens(target.name);
  const candidateTokens = identityTokens(candidate.name);
  if (targetTokens.length === 0 || candidateTokens.length === 0) return false;

  const candidateSet = new Set(candidateTokens);
  const shared = [...new Set(targetTokens.filter((token) => candidateSet.has(token)))];
  const distinctiveShared = shared.filter((token) => token.length >= 4);
  if (distinctiveShared.length === 0) return false;

  const minimumCoverage = shared.length / Math.min(targetTokens.length, candidateTokens.length);
  const unionCoverage = shared.length / new Set([...targetTokens, ...candidateTokens]).size;

  return minimumCoverage >= 0.8 && unionCoverage >= 0.5;
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
        isConservativeQualityIdentityMatch(target, candidate),
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
  const longitude =
    targets.reduce((total, target) => total + target.longitude, 0) / targets.length;
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
    return successful;
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

  protected async searchCategory(
    category: PlaceCategory,
    targets: readonly PlaceQualityTarget[],
  ): Promise<readonly ProviderCandidate[]> {
    const { center, radiusMeters } = groupSearchArea(targets);
    const response = await fetchWithTimeout(this.fetcher, GOOGLE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.location,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({
        textQuery: CATEGORY_QUERY[category],
        languageCode: "pt-BR",
        regionCode: "BR",
        pageSize: 20,
        locationBias: {
          circle: {
            center,
            radius: radiusMeters,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Places respondeu HTTP ${response.status} para ${category}.`);
    }

    const payload = (await response.json()) as {
      places?: readonly {
        id?: string;
        displayName?: Readonly<{ text?: string }>;
        location?: Readonly<{ latitude?: number; longitude?: number }>;
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

      return [
        {
          externalId,
          name,
          latitude,
          longitude,
          ...(finiteNumber(place.rating) === undefined
            ? {}
            : { rating: finiteNumber(place.rating), ratingScaleMax: 5 }),
          ...(finiteNumber(place.userRatingCount) === undefined
            ? {}
            : { reviewCount: finiteNumber(place.userRatingCount) }),
        },
      ];
    });
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
    url.searchParams.set(
      "fields",
      "fsq_place_id,name,latitude,longitude,rating,popularity",
    );
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

      return [
        {
          externalId,
          name,
          latitude,
          longitude,
          ...(finiteNumber(place.rating) === undefined
            ? {}
            : { rating: finiteNumber(place.rating), ratingScaleMax: 10 }),
          ...(finiteNumber(place.popularity) === undefined
            ? {}
            : { popularity: finiteNumber(place.popularity), popularityScaleMax: 1 }),
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
