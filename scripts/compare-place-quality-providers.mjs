import { pathToFileURL } from "node:url";

export const PIPA_PLACE_QUALITY_CATEGORIES = Object.freeze([
  { id: "beach", query: "praias em Pipa RN" },
  { id: "gastronomy", query: "restaurantes em Pipa RN" },
  { id: "nightlife", query: "bares e baladas em Pipa RN" },
  { id: "nature", query: "atrações e natureza em Pipa RN" },
]);

const PIPA_CENTER = Object.freeze({ latitude: -6.24, longitude: -35.065 });
const RADIUS_METERS = 8_000;
const GOOGLE_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const FOURSQUARE_ENDPOINT = "https://places-api.foursquare.com/places/search";
const FOURSQUARE_API_VERSION = "2025-06-17";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

export function summarizeProviderPlaces(provider, category, rawPlaces) {
  const places = array(rawPlaces);
  const normalized = places.map((place) => {
    if (provider === "google") {
      return {
        id: text(place?.id),
        name: text(place?.displayName?.text),
        rating: finiteNumber(place?.rating),
        reviewCount: finiteNumber(place?.userRatingCount),
        hasPhoto: array(place?.photos).length > 0,
        price: text(place?.priceLevel) || undefined,
      };
    }

    return {
      id: text(place?.fsq_place_id) || text(place?.id),
      name: text(place?.name),
      rating: finiteNumber(place?.rating),
      reviewCount: finiteNumber(place?.stats?.total_ratings),
      popularity: finiteNumber(place?.popularity),
      hasPhoto: array(place?.photos).length > 0,
      price: finiteNumber(place?.price),
    };
  });

  return {
    provider,
    category,
    count: normalized.length,
    withRating: normalized.filter((place) => place.rating !== undefined).length,
    withReviewCount: normalized.filter((place) => place.reviewCount !== undefined).length,
    withPopularity: normalized.filter((place) => place.popularity !== undefined).length,
    withPhotos: normalized.filter((place) => place.hasPhoto).length,
    top: normalized.slice(0, 10),
  };
}

export async function fetchGooglePlacesForCategory(apiKey, category, fetcher = fetch) {
  const response = await fetcher(GOOGLE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.photos,places.priceLevel",
    },
    body: JSON.stringify({
      textQuery: category.query,
      languageCode: "pt-BR",
      regionCode: "BR",
      locationBias: {
        circle: {
          center: PIPA_CENTER,
          radius: RADIUS_METERS,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Places respondeu HTTP ${response.status} para ${category.id}.`);
  }

  const payload = await response.json();
  return summarizeProviderPlaces("google", category.id, payload?.places);
}

export async function fetchFoursquarePlacesForCategory(apiKey, category, fetcher = fetch) {
  const url = new URL(FOURSQUARE_ENDPOINT);
  url.searchParams.set("query", category.query);
  url.searchParams.set("ll", `${PIPA_CENTER.latitude},${PIPA_CENTER.longitude}`);
  url.searchParams.set("radius", String(RADIUS_METERS));
  url.searchParams.set("limit", "50");
  url.searchParams.set(
    "fields",
    "fsq_place_id,name,latitude,longitude,rating,popularity,photos,price,stats",
  );
  url.searchParams.set("sort", "RATING");

  const response = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Places-Api-Version": FOURSQUARE_API_VERSION,
    },
  });

  if (!response.ok) {
    throw new Error(`Foursquare Places respondeu HTTP ${response.status} para ${category.id}.`);
  }

  const payload = await response.json();
  return summarizeProviderPlaces("foursquare", category.id, payload?.results);
}

function selectedProviders(value) {
  const providers = (value ?? "google,foursquare")
    .split(",")
    .map((provider) => provider.trim().toLowerCase())
    .filter(Boolean);
  const invalid = providers.filter(
    (provider) => provider !== "google" && provider !== "foursquare",
  );
  if (invalid.length > 0 || providers.length === 0) {
    throw new Error("Use --providers google,foursquare, google ou foursquare.");
  }
  return [...new Set(providers)];
}

export async function comparePlaceQualityProviders({
  providers = ["google", "foursquare"],
  googleKey,
  foursquareKey,
  fetcher = fetch,
} = {}) {
  const missing = [];
  if (providers.includes("google") && !text(googleKey)) missing.push("GOOGLE_PLACES_API_KEY");
  if (providers.includes("foursquare") && !text(foursquareKey)) {
    missing.push("FOURSQUARE_PLACES_API_KEY");
  }
  if (missing.length > 0) {
    throw new Error(
      `Credenciais necessárias para o spike: ${missing.join(", ")}. Nenhuma chamada foi realizada.`,
    );
  }

  const results = [];
  for (const category of PIPA_PLACE_QUALITY_CATEGORIES) {
    if (providers.includes("google")) {
      results.push(await fetchGooglePlacesForCategory(googleKey, category, fetcher));
    }
    if (providers.includes("foursquare")) {
      results.push(await fetchFoursquarePlacesForCategory(foursquareKey, category, fetcher));
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    destination: "Pipa, Tibau do Sul — RN, Brasil",
    radiusMeters: RADIUS_METERS,
    providers,
    results,
  };
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument?.startsWith("--")) continue;
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Argumento ${argument} exige valor.`);
    }
    values.set(argument, value);
    index += 1;
  }
  return values;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const providers = selectedProviders(args.get("--providers"));
  const report = await comparePlaceQualityProviders({
    providers,
    googleKey: process.env.GOOGLE_PLACES_API_KEY,
    foursquareKey: process.env.FOURSQUARE_PLACES_API_KEY,
  });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

const entrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : undefined;
if (entrypoint === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
