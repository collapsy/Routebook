import type { Destination } from "@routebook/trip-management";

import tzLookup from "@/vendor/tz-lookup";

export type DestinationBounds = Readonly<{
  minimumLatitude: number;
  maximumLatitude: number;
  minimumLongitude: number;
  maximumLongitude: number;
}>;

export type DestinationResolutionProvenance = Readonly<{
  provider: string;
  externalReference: string;
  sourceLicense: string;
  sourceUrl?: string;
  collectedAt: Date;
  method: string;
  confidenceLevel: "confirmed" | "high" | "medium" | "low" | "unknown";
  metadata?: Readonly<Record<string, unknown>>;
}>;

export type ResolvedDestination = Readonly<{
  destination: Destination;
  provenance: DestinationResolutionProvenance;
  bounds?: DestinationBounds;
}>;

export type DestinationResolutionResult =
  | Readonly<{ status: "resolved"; value: ResolvedDestination }>
  | Readonly<{ status: "not-found" }>
  | Readonly<{ status: "ambiguous"; candidates: readonly string[] }>
  | Readonly<{ status: "unavailable"; reason: "provider-error" | "invalid-response" }>;

export interface DestinationResolver {
  resolve(query: string): Promise<DestinationResolutionResult>;
}

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type JsonRecord = Record<string, unknown>;
type DestinationResolverDependencies = Readonly<{
  endpoint?: string;
  fetcher?: FetchLike;
  now?: () => Date;
  timeZoneLookup?: (latitude: number, longitude: number) => string;
  userAgent?: string;
}>;
type ParsedCandidate = Readonly<{
  destination: Destination;
  bounds?: DestinationBounds;
  externalReference: string;
  sourceUrl: string;
  providerCategory: string;
  providerType: string;
  addresstype: string;
  importance: number;
  searchText: string;
}>;

export type ConfiguredDestinationResolver =
  | Readonly<{
      status: "configured";
      resolver: DestinationResolver;
      attribution?: Readonly<{ label: string; href: string }>;
    }>
  | Readonly<{ status: "unavailable"; reason: "disabled" | "blocked" | "invalid-configuration" }>;

const DEFAULT_NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org";
const DEFAULT_NOMINATIM_USER_AGENT =
  "RouteBook/0.1 (+https://github.com/collapsy/Routebook)";
const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";
const OSM_LICENSE = "ODbL-1.0";
const TIMEZONE_METHOD = "@photostructure/tz-lookup@11.6.1";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): JsonRecord | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizedTokens(value: string): string[] {
  return normalizeText(value).split(/\s+/).filter(Boolean);
}

function isIanaTimeZone(value: string): boolean {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function resolveIanaTimeZone(latitude: number, longitude: number): string {
  const timeZone = tzLookup(latitude, longitude);
  if (!isIanaTimeZone(timeZone)) throw new Error("Timezone lookup returned an invalid IANA identifier.");
  return timeZone;
}

function distanceMeters(
  left: Readonly<{ latitude: number; longitude: number }>,
  right: Readonly<{ latitude: number; longitude: number }>,
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const latitudeDelta = radians(right.latitude - left.latitude);
  const longitudeDelta = radians(right.longitude - left.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(left.latitude)) *
      Math.cos(radians(right.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

function candidateName(candidate: JsonRecord): string {
  const namedetails = asRecord(candidate.namedetails);
  const displayName = text(candidate.display_name);
  return text(candidate.name) || text(namedetails?.name) || displayName.split(",")[0]?.trim() || "";
}

function addressValue(address: JsonRecord | undefined, key: string): string {
  return text(address?.[key]);
}

function destinationTypeFor(
  name: string,
  candidate: JsonRecord,
  address: JsonRecord | undefined,
): Destination["type"] | undefined {
  const normalizedName = normalizeText(name);
  const matches = (keys: readonly string[]) =>
    keys.some((key) => normalizeText(addressValue(address, key)) === normalizedName);

  if (matches(["city", "town", "municipality"])) return "city";
  if (matches(["village", "hamlet", "suburb", "neighbourhood", "quarter", "borough", "district"])) return "district";
  if (matches(["state", "county", "region", "state_district"])) return "region";

  const addresstype = text(candidate.addresstype).toLowerCase();
  const providerType = text(candidate.type).toLowerCase();
  const providerCategory = (text(candidate.category) || text(candidate.class)).toLowerCase();
  const type = addresstype || providerType;

  if (["city", "town", "municipality"].includes(type)) return "city";
  if (["village", "hamlet", "suburb", "neighbourhood", "quarter", "borough", "district"].includes(type)) return "district";
  if (["state", "county", "region", "state_district", "administrative"].includes(type)) return "region";
  if (["island", "islet"].includes(type)) return "island";
  if (
    ["park", "national_park", "nature_reserve", "protected_area"].includes(type) ||
    (providerCategory === "leisure" && providerType === "park")
  ) return "park";
  if (["locality", "archipelago"].includes(type)) return "custom-region";
  return undefined;
}

function parseBounds(value: unknown): DestinationBounds | undefined {
  if (!Array.isArray(value) || value.length !== 4) return undefined;
  const south = finiteNumber(value[0]);
  const north = finiteNumber(value[1]);
  const west = finiteNumber(value[2]);
  const east = finiteNumber(value[3]);
  if (
    south === undefined || north === undefined || west === undefined || east === undefined ||
    south < -90 || north > 90 || west < -180 || east > 180 || south > north || west > east
  ) return undefined;
  return {
    minimumLatitude: south,
    maximumLatitude: north,
    minimumLongitude: west,
    maximumLongitude: east,
  };
}

function osmIdentity(candidate: JsonRecord): Readonly<{ externalReference: string; sourceUrl: string }> | undefined {
  const rawType = text(candidate.osm_type).toLowerCase();
  const osmId = text(candidate.osm_id);
  const type = rawType === "node" ? "node" : rawType === "way" ? "way" : rawType === "relation" ? "relation" : undefined;
  const prefix = type === "node" ? "N" : type === "way" ? "W" : type === "relation" ? "R" : undefined;
  if (!type || !prefix || !/^\d+$/.test(osmId)) return undefined;
  return {
    externalReference: prefix + osmId,
    sourceUrl: "https://www.openstreetmap.org/" + type + "/" + osmId,
  };
}

function candidateSearchText(candidate: JsonRecord, address: JsonRecord | undefined): string {
  const addressValues = address
    ? Object.values(address).filter((value): value is string => typeof value === "string")
    : [];
  return [candidateName(candidate), text(candidate.display_name), ...addressValues].filter(Boolean).join(" ");
}

function parseCandidate(
  candidate: JsonRecord,
  timeZoneLookup: (latitude: number, longitude: number) => string,
): ParsedCandidate | undefined {
  const identity = osmIdentity(candidate);
  const address = asRecord(candidate.address);
  const name = candidateName(candidate);
  const latitude = finiteNumber(candidate.lat);
  const longitude = finiteNumber(candidate.lon);
  const countryCode = addressValue(address, "country_code").toUpperCase();
  const type = destinationTypeFor(name, candidate, address);

  if (
    !identity || name.length < 2 || latitude === undefined || longitude === undefined ||
    latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 ||
    !/^[A-Z]{2}$/.test(countryCode) || !type
  ) return undefined;

  let timeZone: string;
  try {
    timeZone = timeZoneLookup(latitude, longitude);
  } catch {
    return undefined;
  }
  if (!isIanaTimeZone(timeZone)) return undefined;

  const bounds = parseBounds(candidate.boundingbox);
  return {
    destination: { name, type, countryCode, latitude, longitude, timeZone },
    ...(bounds ? { bounds } : {}),
    ...identity,
    providerCategory: text(candidate.category) || text(candidate.class),
    providerType: text(candidate.type),
    addresstype: text(candidate.addresstype),
    importance: Math.max(0, Math.min(1, finiteNumber(candidate.importance) ?? 0)),
    searchText: candidateSearchText(candidate, address),
  };
}

function scoreCandidate(query: string, candidate: ParsedCandidate): number {
  const queryName = normalizeText(query.split(",")[0] ?? query);
  const candidateNameNormalized = normalizeText(candidate.destination.name);
  const queryTokens = normalizedTokens(query);
  const haystack = new Set(normalizedTokens(candidate.searchText));
  let score = 0;

  if (candidateNameNormalized === queryName) score += 4;
  else if (candidateNameNormalized.includes(queryName) || queryName.includes(candidateNameNormalized)) score += 2.5;
  if (queryTokens.length > 0) {
    const matched = queryTokens.filter((token) => haystack.has(token)).length;
    score += (matched / queryTokens.length) * 3;
  }
  score += candidate.importance;
  if (candidate.externalReference.startsWith("R")) score += 0.08;
  return score;
}

function ambiguousLabels(
  query: string,
  ranked: readonly Readonly<{ candidate: ParsedCandidate; score: number }>[],
): readonly string[] | undefined {
  const first = ranked[0];
  const second = ranked[1];
  if (!first || !second) return undefined;
  const distance = distanceMeters(first.candidate.destination, second.candidate.destination);
  const sameName =
    normalizeText(first.candidate.destination.name) === normalizeText(second.candidate.destination.name);

  if (sameName && !query.includes(",") && distance > 50_000) {
    return [first.candidate.searchText, second.candidate.searchText];
  }
  if (first.score - second.score < 0.08 && distance > 5_000) {
    return [first.candidate.searchText, second.candidate.searchText];
  }
  return undefined;
}

export class NominatimDestinationResolver implements DestinationResolver {
  private readonly endpoint: string;
  private readonly fetcher: FetchLike;
  private readonly now: () => Date;
  private readonly timeZoneLookup: (latitude: number, longitude: number) => string;
  private readonly userAgent: string;

  constructor(dependencies: DestinationResolverDependencies = {}) {
    this.endpoint = dependencies.endpoint ?? DEFAULT_NOMINATIM_ENDPOINT;
    this.fetcher = dependencies.fetcher ?? fetch;
    this.now = dependencies.now ?? (() => new Date());
    this.timeZoneLookup = dependencies.timeZoneLookup ?? resolveIanaTimeZone;
    this.userAgent = dependencies.userAgent ?? DEFAULT_NOMINATIM_USER_AGENT;
  }

  async resolve(query: string): Promise<DestinationResolutionResult> {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) return { status: "not-found" };

    const url = new URL("/search", this.endpoint);
    url.searchParams.set("q", normalizedQuery);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "5");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("namedetails", "1");

    let response: Response;
    try {
      response = await this.fetcher(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.7",
          "User-Agent": this.userAgent,
        },
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      return { status: "unavailable", reason: "provider-error" };
    }
    if (!response.ok) return { status: "unavailable", reason: "provider-error" };

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { status: "unavailable", reason: "invalid-response" };
    }
    if (!Array.isArray(payload)) return { status: "unavailable", reason: "invalid-response" };

    const parsed = payload
      .map((item) => asRecord(item))
      .filter((item): item is JsonRecord => Boolean(item))
      .map((item) => parseCandidate(item, this.timeZoneLookup))
      .filter((item): item is ParsedCandidate => Boolean(item));

    const byIdentity = new Map<string, ParsedCandidate>();
    for (const candidate of parsed) {
      const previous = byIdentity.get(candidate.externalReference);
      if (!previous || candidate.importance > previous.importance) byIdentity.set(candidate.externalReference, candidate);
    }

    const ranked = [...byIdentity.values()]
      .map((candidate) => ({ candidate, score: scoreCandidate(normalizedQuery, candidate) }))
      .filter((item) => item.score >= 2.25)
      .sort((left, right) => right.score - left.score);
    const first = ranked[0];
    if (!first) return { status: "not-found" };

    const ambiguous = ambiguousLabels(normalizedQuery, ranked);
    if (ambiguous) return { status: "ambiguous", candidates: ambiguous };

    const metadata: Record<string, unknown> = {
      attribution: "© OpenStreetMap contributors",
      providerCategory: first.candidate.providerCategory,
      providerType: first.candidate.providerType,
      addresstype: first.candidate.addresstype,
      timezoneMethod: TIMEZONE_METHOD,
      timezoneApproximate: true,
    };
    if (first.candidate.bounds) metadata.bounds = first.candidate.bounds;

    return {
      status: "resolved",
      value: {
        destination: first.candidate.destination,
        ...(first.candidate.bounds ? { bounds: first.candidate.bounds } : {}),
        provenance: {
          provider: "nominatim-osm",
          externalReference: first.candidate.externalReference,
          sourceLicense: OSM_LICENSE,
          sourceUrl: first.candidate.sourceUrl,
          collectedAt: this.now(),
          method: "forward-geocoding+nominatim+local-timezone-estimate-v1",
          confidenceLevel: ranked[1] && first.score - ranked[1].score < 0.4 ? "medium" : "high",
          metadata,
        },
      },
    };
  }
}

class E2EDestinationResolver implements DestinationResolver {
  async resolve(query: string): Promise<DestinationResolutionResult> {
    const normalized = normalizeText(query);
    const fixtures = [
      {
        aliases: ["pipa", "pipa rn", "pipa tibau do sul rn"],
        destination: {
          name: "Pipa, Tibau do Sul - RN",
          type: "district" as const,
          countryCode: "BR",
          latitude: -6.2302,
          longitude: -35.0503,
          timeZone: "America/Fortaleza",
        },
        externalReference: "fixture:pipa-rn-br",
      },
      {
        aliases: ["florianopolis", "florianopolis sc"],
        destination: {
          name: "Florianópolis, SC",
          type: "city" as const,
          countryCode: "BR",
          latitude: -27.5949,
          longitude: -48.5482,
          timeZone: "America/Sao_Paulo",
        },
        externalReference: "fixture:florianopolis-sc-br",
      },
    ] as const;
    const fixture = fixtures.find((entry) => entry.aliases.includes(normalized as never));
    if (!fixture) return { status: "not-found" };
    return {
      status: "resolved",
      value: {
        destination: fixture.destination,
        provenance: {
          provider: "routebook-e2e-fixture",
          externalReference: fixture.externalReference,
          sourceLicense: "internal-test-only",
          collectedAt: new Date("2026-09-01T12:00:00.000Z"),
          method: "deterministic-e2e-fixture",
          confidenceLevel: "confirmed",
          metadata: { testOnly: true },
        },
      },
    };
  }
}

export function resolveConfiguredDestinationResolver(): ConfiguredDestinationResolver {
  const configured = (process.env.ROUTEBOOK_DESTINATION_RESOLVER ?? "").trim().toLowerCase();
  if (!configured || configured === "off" || configured === "disabled") {
    return { status: "unavailable", reason: "disabled" };
  }
  if (configured === "nominatim") {
    if (process.env.VERCEL_ENV === "production") return { status: "unavailable", reason: "blocked" };
    return {
      status: "configured",
      resolver: new NominatimDestinationResolver({
        endpoint: process.env.NOMINATIM_BASE_URL ?? DEFAULT_NOMINATIM_ENDPOINT,
        userAgent: process.env.ROUTEBOOK_NOMINATIM_USER_AGENT ?? DEFAULT_NOMINATIM_USER_AGENT,
      }),
      attribution: { label: "Dados de localização © OpenStreetMap contributors", href: OSM_COPYRIGHT_URL },
    };
  }
  if (configured === "fixture") {
    if (process.env.ROUTEBOOK_E2E_DESTINATION_RESOLVER !== "1" || Boolean(process.env.VERCEL_ENV)) {
      return { status: "unavailable", reason: "blocked" };
    }
    return { status: "configured", resolver: new E2EDestinationResolver() };
  }
  return { status: "unavailable", reason: "invalid-configuration" };
}
