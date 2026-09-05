import type { Destination } from "@routebook/trip-management";

import { resolveIanaTimeZone, type ResolvedDestination } from "./destination-resolver";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type JsonRecord = Record<string, unknown>;

export type DestinationSuggestion = Readonly<{
  reference: string;
  label: string;
  primaryText: string;
  secondaryText?: string;
  provider: "google" | "fixture";
  attribution: "Google Maps" | "RouteBook test fixture";
}>;

export type DestinationSuggestionResult =
  | Readonly<{ status: "ready"; suggestions: readonly DestinationSuggestion[] }>
  | Readonly<{
      status: "unavailable";
      reason: "disabled" | "blocked" | "misconfigured" | "provider-error";
    }>;

export type SelectedDestinationResult =
  | Readonly<{ status: "resolved"; value: ResolvedDestination }>
  | Readonly<{ status: "not-found" }>
  | Readonly<{
      status: "unavailable";
      reason: "blocked" | "misconfigured" | "provider-error" | "invalid-response";
    }>;

export interface DestinationSuggestionProvider {
  suggest(input: string, sessionToken: string): Promise<DestinationSuggestionResult>;
  resolve(reference: string, sessionToken: string): Promise<SelectedDestinationResult>;
}

type ConfiguredDestinationSuggestionProvider =
  | Readonly<{
      status: "configured";
      providerId: DestinationSuggestion["provider"];
      provider: DestinationSuggestionProvider;
      attribution: string;
    }>
  | Readonly<{ status: "unavailable"; reason: "disabled" | "blocked" | "misconfigured" }>;

const GOOGLE_AUTOCOMPLETE_ENDPOINT = "https://places.googleapis.com/v1/places:autocomplete";
const GOOGLE_PLACES_ENDPOINT = "https://places.googleapis.com/v1/places";
const GOOGLE_ATTRIBUTION = "Google Maps" as const;
const GOOGLE_SOURCE_LICENSE = "Google Maps Platform Terms";
const GOOGLE_SOURCE_URL = "https://maps.google.com/";
const GOOGLE_FIELD_MASK = "id,displayName,formattedAddress,location,addressComponents,types";
const GOOGLE_AUTOCOMPLETE_FIELD_MASK =
  "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types";
const TIMEOUT_MS = 5_000;

const FIXTURES = [
  {
    reference: "fixture:pipa-rn-br",
    aliases: ["pipa", "pipa rn", "pipa tibau do sul rn"],
    suggestion: {
      label: "Pipa, Tibau do Sul - RN, Brasil",
      primaryText: "Pipa",
      secondaryText: "Tibau do Sul - RN, Brasil",
    },
    destination: {
      name: "Pipa, Tibau do Sul - RN",
      type: "district" as const,
      countryCode: "BR",
      latitude: -6.2302,
      longitude: -35.0503,
      timeZone: "America/Fortaleza",
    },
  },
  {
    reference: "fixture:florianopolis-sc-br",
    aliases: ["florianopolis", "florianopolis sc"],
    suggestion: {
      label: "Florianópolis, SC, Brasil",
      primaryText: "Florianópolis",
      secondaryText: "SC, Brasil",
    },
    destination: {
      name: "Florianópolis, SC",
      type: "city" as const,
      countryCode: "BR",
      latitude: -27.5949,
      longitude: -48.5482,
      timeZone: "America/Sao_Paulo",
    },
  },
  {
    reference: "fixture:sao-paulo-sp-br",
    aliases: ["sao paulo", "sao paulo sp"],
    suggestion: {
      label: "São Paulo, SP, Brasil",
      primaryText: "São Paulo",
      secondaryText: "SP, Brasil",
    },
    destination: {
      name: "São Paulo, SP",
      type: "city" as const,
      countryCode: "BR",
      latitude: -23.5505,
      longitude: -46.6333,
      timeZone: "America/Sao_Paulo",
    },
  },
] as const;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): JsonRecord | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stringArray(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function destinationTypeFromGoogle(types: readonly string[]): Destination["type"] | undefined {
  if (types.some((type) => ["locality", "postal_town"].includes(type))) return "city";
  if (
    types.some((type) =>
      [
        "sublocality",
        "sublocality_level_1",
        "sublocality_level_2",
        "sublocality_level_3",
        "sublocality_level_4",
        "sublocality_level_5",
        "neighborhood",
      ].includes(type),
    )
  )
    return "district";
  if (types.some((type) => /^administrative_area_level_[1-7]$/.test(type))) return "region";
  if (types.includes("island")) return "island";
  if (types.includes("park") || types.includes("national_park")) return "park";
  return undefined;
}

function isDestinationLikeGooglePrediction(types: readonly string[]): boolean {
  return Boolean(destinationTypeFromGoogle(types));
}

function countryCodeFromGoogle(addressComponents: unknown): string | undefined {
  if (!Array.isArray(addressComponents)) return undefined;
  for (const entry of addressComponents) {
    const component = asRecord(entry);
    if (!component || !stringArray(component.types).includes("country")) continue;
    const code = text(component.shortText).toUpperCase();
    if (/^[A-Z]{2}$/.test(code)) return code;
  }
  return undefined;
}

function googleSuggestionFrom(value: unknown): DestinationSuggestion | undefined {
  const suggestion = asRecord(value);
  const prediction = asRecord(suggestion?.placePrediction);
  if (!prediction) return undefined;

  const reference = text(prediction.placeId);
  const types = stringArray(prediction.types);
  const predictionText = asRecord(prediction.text);
  const structured = asRecord(prediction.structuredFormat);
  const mainText = asRecord(structured?.mainText);
  const secondaryText = asRecord(structured?.secondaryText);
  const label = text(predictionText?.text);
  const primaryText = text(mainText?.text) || label.split(",")[0]?.trim() || label;
  const secondary = text(secondaryText?.text);

  if (!reference || !label || !primaryText || !isDestinationLikeGooglePrediction(types))
    return undefined;
  return {
    reference,
    label,
    primaryText,
    ...(secondary ? { secondaryText: secondary } : {}),
    provider: "google",
    attribution: GOOGLE_ATTRIBUTION,
  };
}

function fixtureMatches(input: string): readonly (typeof FIXTURES)[number][] {
  const normalized = normalizeText(input);
  return FIXTURES.filter((fixture) =>
    fixture.aliases.some(
      (alias) =>
        normalizeText(alias).includes(normalized) || normalized.includes(normalizeText(alias)),
    ),
  );
}

export class FixtureDestinationSuggestionProvider implements DestinationSuggestionProvider {
  async suggest(input: string): Promise<DestinationSuggestionResult> {
    const suggestions = fixtureMatches(input)
      .slice(0, 5)
      .map((fixture) => ({
        reference: fixture.reference,
        ...fixture.suggestion,
        provider: "fixture" as const,
        attribution: "RouteBook test fixture" as const,
      }));
    return { status: "ready", suggestions };
  }

  async resolve(reference: string): Promise<SelectedDestinationResult> {
    const fixture = FIXTURES.find((entry) => entry.reference === reference);
    if (!fixture) return { status: "not-found" };
    return {
      status: "resolved",
      value: {
        destination: fixture.destination,
        provenance: {
          provider: "routebook-e2e-fixture",
          externalReference: fixture.reference,
          sourceLicense: "internal-test-only",
          collectedAt: new Date("2026-09-04T12:00:00.000Z"),
          method: "destination-autocomplete-selection+deterministic-e2e-fixture",
          confidenceLevel: "confirmed",
          metadata: { testOnly: true, selectionRevalidated: true },
        },
      },
    };
  }
}

export class GoogleDestinationSuggestionProvider implements DestinationSuggestionProvider {
  constructor(
    private readonly apiKey: string,
    private readonly fetcher: FetchLike = fetch,
    private readonly now: () => Date = () => new Date(),
    private readonly timeZoneLookup: (
      latitude: number,
      longitude: number,
    ) => string = resolveIanaTimeZone,
  ) {}

  async suggest(input: string, sessionToken: string): Promise<DestinationSuggestionResult> {
    const normalizedInput = input.trim();
    if (normalizedInput.length < 3) return { status: "ready", suggestions: [] };

    let response: Response;
    try {
      response = await this.fetcher(GOOGLE_AUTOCOMPLETE_ENDPOINT, {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
          "X-Goog-FieldMask": GOOGLE_AUTOCOMPLETE_FIELD_MASK,
        },
        body: JSON.stringify({
          input: normalizedInput,
          languageCode: "pt-BR",
          sessionToken,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      return { status: "unavailable", reason: "provider-error" };
    }
    if (!response.ok) return { status: "unavailable", reason: "provider-error" };

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { status: "unavailable", reason: "provider-error" };
    }
    const record = asRecord(payload);
    if (!record || !Array.isArray(record.suggestions))
      return { status: "unavailable", reason: "provider-error" };

    const byReference = new Map<string, DestinationSuggestion>();
    for (const raw of record.suggestions) {
      const suggestion = googleSuggestionFrom(raw);
      if (suggestion && !byReference.has(suggestion.reference))
        byReference.set(suggestion.reference, suggestion);
      if (byReference.size >= 5) break;
    }
    return { status: "ready", suggestions: [...byReference.values()] };
  }

  async resolve(reference: string, sessionToken: string): Promise<SelectedDestinationResult> {
    const placeId = reference.trim();
    if (!placeId || placeId.length > 512) return { status: "not-found" };

    const url = new URL(`${GOOGLE_PLACES_ENDPOINT}/${encodeURIComponent(placeId)}`);
    url.searchParams.set("languageCode", "pt-BR");
    if (sessionToken) url.searchParams.set("sessionToken", sessionToken);

    let response: Response;
    try {
      response = await this.fetcher(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "X-Goog-Api-Key": this.apiKey,
          "X-Goog-FieldMask": GOOGLE_FIELD_MASK,
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      return { status: "unavailable", reason: "provider-error" };
    }
    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) return { status: "unavailable", reason: "provider-error" };

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { status: "unavailable", reason: "invalid-response" };
    }
    const place = asRecord(payload);
    const location = asRecord(place?.location);
    const displayName = asRecord(place?.displayName);
    const latitude = finiteNumber(location?.latitude);
    const longitude = finiteNumber(location?.longitude);
    const returnedId = text(place?.id);
    const name = text(displayName?.text);
    const formattedAddress = text(place?.formattedAddress);
    const types = stringArray(place?.types);
    const type = destinationTypeFromGoogle(types);
    const countryCode = countryCodeFromGoogle(place?.addressComponents);

    if (
      !place ||
      returnedId !== placeId ||
      !name ||
      latitude === undefined ||
      longitude === undefined ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180 ||
      !countryCode ||
      !type
    )
      return { status: "unavailable", reason: "invalid-response" };

    let timeZone: string;
    try {
      timeZone = this.timeZoneLookup(latitude, longitude);
    } catch {
      return { status: "unavailable", reason: "invalid-response" };
    }

    return {
      status: "resolved",
      value: {
        destination: {
          name: formattedAddress || name,
          type,
          countryCode,
          latitude,
          longitude,
          timeZone,
        },
        provenance: {
          provider: "google-places",
          externalReference: placeId,
          sourceLicense: GOOGLE_SOURCE_LICENSE,
          sourceUrl: GOOGLE_SOURCE_URL,
          collectedAt: this.now(),
          method: "places-autocomplete-selection+place-details+local-timezone-estimate-v1",
          confidenceLevel: "confirmed",
          metadata: {
            attribution: GOOGLE_ATTRIBUTION,
            providerTypes: types,
            displayName: name,
            timezoneMethod: "@photostructure/tz-lookup@11.6.1",
            timezoneApproximate: true,
            selectionRevalidated: true,
          },
        },
      },
    };
  }
}

export function resolveConfiguredDestinationSuggestionProvider(): ConfiguredDestinationSuggestionProvider {
  if (
    process.env.ROUTEBOOK_E2E_DESTINATION_RESOLVER === "1" &&
    process.env.ROUTEBOOK_DESTINATION_RESOLVER === "fixture" &&
    !process.env.VERCEL_ENV
  ) {
    return {
      status: "configured",
      providerId: "fixture",
      provider: new FixtureDestinationSuggestionProvider(),
      attribution: "RouteBook test fixture",
    };
  }

  const configured = (process.env.ROUTEBOOK_DESTINATION_SUGGESTION_PROVIDER ?? "")
    .trim()
    .toLowerCase();
  if (!configured || configured === "off" || configured === "disabled")
    return { status: "unavailable", reason: "disabled" };
  if (configured !== "google") return { status: "unavailable", reason: "misconfigured" };
  if (process.env.VERCEL_ENV === "production") return { status: "unavailable", reason: "blocked" };

  const apiKey = (process.env.GOOGLE_PLACES_API_KEY ?? "").trim();
  if (!apiKey) return { status: "unavailable", reason: "misconfigured" };
  return {
    status: "configured",
    providerId: "google",
    provider: new GoogleDestinationSuggestionProvider(apiKey),
    attribution: GOOGLE_ATTRIBUTION,
  };
}

export async function suggestConfiguredDestinations(
  input: string,
  sessionToken: string,
): Promise<DestinationSuggestionResult> {
  if (input.trim().length < 3) return { status: "ready", suggestions: [] };
  const configured = resolveConfiguredDestinationSuggestionProvider();
  if (configured.status !== "configured") return configured;
  return configured.provider.suggest(input, sessionToken);
}

export async function resolveSelectedDestination(
  input: Readonly<{
    provider: string;
    reference: string;
    sessionToken: string;
  }>,
): Promise<SelectedDestinationResult> {
  const configured = resolveConfiguredDestinationSuggestionProvider();
  if (configured.status !== "configured") {
    return {
      status: "unavailable",
      reason: configured.reason === "disabled" ? "misconfigured" : configured.reason,
    };
  }

  if (input.provider !== configured.providerId || !input.reference.trim())
    return { status: "not-found" };
  return configured.provider.resolve(input.reference, input.sessionToken);
}
