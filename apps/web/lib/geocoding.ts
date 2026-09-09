export type GeocodingResult = {
  normalizedAddress: string;
  latitude: number;
  longitude: number;
};

export type GeocodingContext = Readonly<{
  countryCode?: string;
  anchor?: Readonly<{
    latitude: number;
    longitude: number;
  }>;
  maxDistanceKm?: number;
  rejectAmbiguous?: boolean;
}>;

export interface Geocoder {
  geocode(query: string, context?: GeocodingContext): Promise<GeocodingResult | undefined>;
}

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type NominatimResult = {
  display_name?: unknown;
  lat?: unknown;
  lon?: unknown;
  address?: unknown;
};

type GeocodingCandidate = GeocodingResult & {
  countryCode?: string;
  providerRank: number;
};

type RankedCandidate = GeocodingCandidate & {
  distanceKm: number;
};

const EARTH_RADIUS_KM = 6_371;
const COLOCATED_THRESHOLD_KM = 0.5;
const MIN_AMBIGUITY_MARGIN_KM = 5;
const RELATIVE_AMBIGUITY_MARGIN = 0.2;

export class GeocodingProviderError extends Error {
  constructor(message = "O serviço de localização não está disponível no momento.") {
    super(message);
    this.name = "GeocodingProviderError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function normalizedCountryCode(value: string | undefined): string | undefined {
  const code = value?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : undefined;
}

function parseCandidate(value: unknown, providerRank: number): GeocodingCandidate | undefined {
  const candidate = asRecord(value) as NominatimResult | undefined;
  if (!candidate) return undefined;

  const normalizedAddress =
    typeof candidate.display_name === "string" ? candidate.display_name.trim() : "";
  const latitude = Number(candidate.lat);
  const longitude = Number(candidate.lon);

  if (
    !normalizedAddress ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return undefined;
  }

  const address = asRecord(candidate.address);
  const countryCode = normalizedCountryCode(
    typeof address?.country_code === "string" ? address.country_code : undefined,
  );

  return {
    normalizedAddress,
    latitude,
    longitude,
    ...(countryCode ? { countryCode } : {}),
    providerRank,
  };
}

function isValidAnchor(
  anchor: GeocodingContext["anchor"],
): anchor is NonNullable<GeocodingContext["anchor"]> {
  return Boolean(
    anchor &&
    Number.isFinite(anchor.latitude) &&
    Number.isFinite(anchor.longitude) &&
    anchor.latitude >= -90 &&
    anchor.latitude <= 90 &&
    anchor.longitude >= -180 &&
    anchor.longitude <= 180,
  );
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceKm(
  left: Readonly<{ latitude: number; longitude: number }>,
  right: Readonly<{ latitude: number; longitude: number }>,
): number {
  const latitudeDelta = toRadians(right.latitude - left.latitude);
  const longitudeDelta = toRadians(right.longitude - left.longitude);
  const leftLatitude = toRadians(left.latitude);
  const rightLatitude = toRadians(right.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(leftLatitude) * Math.cos(rightLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

function buildViewbox(
  anchor: NonNullable<GeocodingContext["anchor"]>,
  radiusKm: number | undefined,
): string | undefined {
  if (!radiusKm || !Number.isFinite(radiusKm) || radiusKm <= 0) return undefined;

  const latitudeDelta = Math.min(80, radiusKm / 111.32);
  const longitudeScale = Math.max(0.15, Math.abs(Math.cos(toRadians(anchor.latitude))));
  const longitudeDelta = Math.min(170, radiusKm / (111.32 * longitudeScale));
  const west = Math.max(-180, anchor.longitude - longitudeDelta);
  const east = Math.min(180, anchor.longitude + longitudeDelta);
  const north = Math.min(90, anchor.latitude + latitudeDelta);
  const south = Math.max(-90, anchor.latitude - latitudeDelta);

  if (west >= east || south >= north) return undefined;
  return [west, north, east, south].map((value) => value.toFixed(6)).join(",");
}

function publicResult(candidate: GeocodingCandidate): GeocodingResult {
  return {
    normalizedAddress: candidate.normalizedAddress,
    latitude: candidate.latitude,
    longitude: candidate.longitude,
  };
}

function selectCandidate(
  candidates: readonly GeocodingCandidate[],
  context: GeocodingContext | undefined,
): GeocodingResult | undefined {
  const expectedCountryCode = normalizedCountryCode(context?.countryCode);
  const sameCountry = expectedCountryCode
    ? candidates.filter((candidate) => candidate.countryCode === expectedCountryCode)
    : [...candidates];

  if (sameCountry.length === 0) return undefined;

  const anchor = context?.anchor;
  if (!isValidAnchor(anchor)) return publicResult(sameCountry[0]!);

  const maxDistanceKm = context?.maxDistanceKm;
  const ranked = sameCountry
    .map<RankedCandidate>((candidate) => ({
      ...candidate,
      distanceKm: distanceKm(anchor, candidate),
    }))
    .filter(
      (candidate) =>
        maxDistanceKm === undefined ||
        !Number.isFinite(maxDistanceKm) ||
        maxDistanceKm <= 0 ||
        candidate.distanceKm <= maxDistanceKm,
    )
    .sort(
      (left, right) => left.distanceKm - right.distanceKm || left.providerRank - right.providerRank,
    );

  const nearest = ranked[0];
  if (!nearest) return undefined;

  if (context?.rejectAmbiguous) {
    const competitor = ranked.find(
      (candidate) =>
        candidate !== nearest && distanceKm(candidate, nearest) > COLOCATED_THRESHOLD_KM,
    );
    if (competitor) {
      const ambiguityMargin = Math.max(
        MIN_AMBIGUITY_MARGIN_KM,
        nearest.distanceKm * RELATIVE_AMBIGUITY_MARGIN,
      );
      if (competitor.distanceKm <= nearest.distanceKm + ambiguityMargin) return undefined;
    }
  }

  return publicResult(nearest);
}

export class NominatimGeocoder implements Geocoder {
  constructor(
    private readonly endpoint = process.env.NOMINATIM_BASE_URL ??
      "https://nominatim.openstreetmap.org",
    private readonly fetcher: FetchLike = fetch,
  ) {}

  async geocode(query: string, context?: GeocodingContext): Promise<GeocodingResult | undefined> {
    const url = new URL("/search", this.endpoint);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", context ? "5" : "1");
    url.searchParams.set("addressdetails", "1");

    const countryCode = normalizedCountryCode(context?.countryCode);
    if (countryCode) url.searchParams.set("countrycodes", countryCode.toLowerCase());

    if (isValidAnchor(context?.anchor)) {
      const viewbox = buildViewbox(context.anchor, context.maxDistanceKm);
      if (viewbox) url.searchParams.set("viewbox", viewbox);
    }

    let response: Response;

    try {
      response = await this.fetcher(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Accept-Language": "pt-BR,pt;q=0.9",
          "User-Agent": "RouteBook/0.1 (personal travel planner)",
        },
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      throw new GeocodingProviderError();
    }

    if (!response.ok) {
      throw new GeocodingProviderError();
    }

    const payload: unknown = await response.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      return undefined;
    }

    const candidates = payload
      .map((value, providerRank) => parseCandidate(value, providerRank))
      .filter((candidate): candidate is GeocodingCandidate => Boolean(candidate));

    if (candidates.length === 0) {
      throw new GeocodingProviderError("O serviço retornou uma localização inválida.");
    }

    return selectCandidate(candidates, context);
  }
}

class E2EAccommodationGeocoder implements Geocoder {
  async geocode(query: string): Promise<GeocodingResult | undefined> {
    if (!query.trim()) return undefined;
    return {
      normalizedAddress: query,
      latitude: -29.378,
      longitude: -50.873,
    };
  }
}

export function resolveAccommodationGeocoder(environment = process.env): Geocoder {
  if (environment.ROUTEBOOK_E2E_DESTINATION_RESOLVER === "1" && !environment.VERCEL_ENV) {
    return new E2EAccommodationGeocoder();
  }
  return new NominatimGeocoder();
}
