import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const ROUTEBOOK_CATEGORY_BY_OVERTURE_CATEGORY = Object.freeze({
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

const KNOWN_SOURCE_LICENSES = Object.freeze({
  meta: "CDLA-Permissive-2.0",
  microsoft: "CDLA-Permissive-2.0",
  foursquare: "Apache-2.0",
  fsq: "Apache-2.0",
  alltheplaces: "CC0-1.0",
  "all-the-places": "CC0-1.0",
  pinmeto: "CDLA-Permissive-2.0",
  krick: "CDLA-Permissive-2.0",
  renderseo: "CDLA-Permissive-2.0",
  brightquery: "CDLA-Permissive-2.0",
});

const OVERTURE_PLACES_SOURCE_URL = "https://docs.overturemaps.org/guides/places/";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function sourceDatasetKey(value) {
  return text(value).toLowerCase().replace(/[\s_]+/g, "-");
}

export function resolveOvertureSourceLicense(source) {
  if (!source || typeof source !== "object") return undefined;

  const explicit = text(source.license);
  if (explicit) return explicit;

  const rawDataset = text(source.dataset).toLowerCase();
  const normalized = sourceDatasetKey(source.dataset);
  return (
    KNOWN_SOURCE_LICENSES[rawDataset] ??
    KNOWN_SOURCE_LICENSES[normalized] ??
    Object.entries(KNOWN_SOURCE_LICENSES).find(([key]) => normalized.includes(key))?.[1]
  );
}

export function mapOvertureCategory(category, hierarchy = []) {
  const values = [category, ...(Array.isArray(hierarchy) ? hierarchy : [])]
    .map((value) => text(value).toLowerCase())
    .filter(Boolean)
    .reverse();

  for (const value of values) {
    const mapped = ROUTEBOOK_CATEGORY_BY_OVERTURE_CATEGORY[value];
    if (mapped) return mapped;
  }
  return undefined;
}

function primarySource(properties) {
  const sources = Array.isArray(properties?.sources) ? properties.sources : [];
  return (
    sources.find((source) => source && typeof source === "object" && source.property === "") ??
    sources[0]
  );
}

function primaryCategory(properties) {
  return (
    text(properties?.basic_category) ||
    text(properties?.taxonomy?.primary) ||
    text(properties?.categories?.primary)
  );
}

function categoryHierarchy(properties) {
  const hierarchy = properties?.taxonomy?.hierarchy;
  return Array.isArray(hierarchy) ? hierarchy.map(text).filter(Boolean) : [];
}

function primaryName(properties) {
  return text(properties?.names?.primary) || text(properties?.name);
}

function addressLabel(properties) {
  const addresses = Array.isArray(properties?.addresses) ? properties.addresses : [];
  const address = addresses[0];
  if (!address || typeof address !== "object") return undefined;

  const freeform = text(address.freeform);
  if (freeform) return freeform;

  const parts = [address.address_levels?.[0]?.value, address.locality, address.region, address.country]
    .map(text)
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function rejection(reason) {
  return { candidate: undefined, reason };
}

export function normalizeOvertureFeature(
  feature,
  { collectedAt, minimumConfidence = 0.7 } = {},
) {
  if (!feature || typeof feature !== "object" || feature.type !== "Feature") {
    return rejection("invalid-feature");
  }

  const properties = feature.properties;
  if (!properties || typeof properties !== "object") return rejection("missing-properties");
  if (text(properties.operating_status).toLowerCase() === "permanently_closed") {
    return rejection("permanently-closed");
  }

  const externalId = text(feature.id) || text(properties.id);
  const name = primaryName(properties);
  const providerCategory = primaryCategory(properties);
  const providerCategoryHierarchy = categoryHierarchy(properties);
  const category = mapOvertureCategory(providerCategory, providerCategoryHierarchy);
  const coordinates = feature.geometry?.type === "Point" ? feature.geometry.coordinates : undefined;
  const longitude = Array.isArray(coordinates) ? finiteNumber(coordinates[0]) : undefined;
  const latitude = Array.isArray(coordinates) ? finiteNumber(coordinates[1]) : undefined;
  const confidence = finiteNumber(properties.confidence);

  if (!externalId) return rejection("missing-external-id");
  if (name.length < 2) return rejection("missing-name");
  if (!providerCategory) return rejection("missing-category");
  if (!category) return rejection("unsupported-category");
  if (
    latitude === undefined ||
    longitude === undefined ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return rejection("invalid-coordinate");
  }
  if (confidence !== undefined && confidence < minimumConfidence) {
    return rejection("low-confidence");
  }

  const source = primarySource(properties);
  const sourceLicense = resolveOvertureSourceLicense(source);
  if (!sourceLicense) return rejection("missing-source-license");

  const collected = collectedAt instanceof Date ? collectedAt : new Date(collectedAt ?? Date.now());
  if (Number.isNaN(collected.getTime())) return rejection("invalid-collected-at");

  const address = addressLabel(properties);
  return {
    candidate: {
      provider: "overture",
      externalId,
      name,
      latitude,
      longitude,
      providerCategory,
      ...(providerCategoryHierarchy.length > 0 ? { providerCategoryHierarchy } : {}),
      category,
      ...(address ? { addressLabel: address } : {}),
      sourceUrl: OVERTURE_PLACES_SOURCE_URL,
      sourceLicense,
      collectedAt: collected.toISOString(),
      ...(confidence !== undefined ? { confidence } : {}),
    },
    reason: undefined,
  };
}

export function normalizeOvertureFeatureCollection(
  featureCollection,
  { collectedAt = new Date(), minimumConfidence = 0.7, limit = 200 } = {},
) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    throw new Error("O limite de candidatos deve estar entre 1 e 200.");
  }
  if (
    typeof minimumConfidence !== "number" ||
    !Number.isFinite(minimumConfidence) ||
    minimumConfidence < 0 ||
    minimumConfidence > 1
  ) {
    throw new Error("A confiança mínima deve estar entre 0 e 1.");
  }

  const features = Array.isArray(featureCollection?.features) ? featureCollection.features : [];
  const rejectedByReason = {};
  const byExternalId = new Map();

  for (const feature of features) {
    const result = normalizeOvertureFeature(feature, { collectedAt, minimumConfidence });
    if (!result.candidate) {
      rejectedByReason[result.reason] = (rejectedByReason[result.reason] ?? 0) + 1;
      continue;
    }

    const previous = byExternalId.get(result.candidate.externalId);
    if (
      !previous ||
      (result.candidate.confidence ?? -1) > (previous.confidence ?? -1)
    ) {
      byExternalId.set(result.candidate.externalId, result.candidate);
    }
  }

  const candidates = [...byExternalId.values()]
    .sort((left, right) => {
      const byConfidence = (right.confidence ?? -1) - (left.confidence ?? -1);
      return byConfidence || left.name.localeCompare(right.name, "pt-BR");
    })
    .slice(0, limit);

  return {
    schemaVersion: 1,
    provider: "overture",
    generatedAt: new Date(collectedAt).toISOString(),
    minimumConfidence,
    limit,
    inputFeatureCount: features.length,
    candidateCount: candidates.length,
    rejectedCount: Object.values(rejectedByReason).reduce((total, count) => total + count, 0),
    rejectedByReason,
    candidates,
  };
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument?.startsWith("--")) continue;
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Argumento ${argument} exige um valor.`);
    }
    values.set(argument, value);
    index += 1;
  }
  return values;
}

async function main() {
  const argumentsMap = parseArguments(process.argv.slice(2));
  const inputPath = argumentsMap.get("--input");
  const outputPath = argumentsMap.get("--output");
  if (!inputPath || !outputPath) {
    throw new Error("Uso: --input <overture.geojson> --output <candidates.json>.");
  }

  const collectedAt = new Date(argumentsMap.get("--collected-at") ?? Date.now());
  const minimumConfidence = Number(argumentsMap.get("--min-confidence") ?? "0.7");
  const limit = Number(argumentsMap.get("--limit") ?? "200");
  const featureCollection = JSON.parse(await readFile(inputPath, "utf8"));
  const normalized = normalizeOvertureFeatureCollection(featureCollection, {
    collectedAt,
    minimumConfidence,
    limit,
  });

  await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  process.stdout.write(
    `Overture: ${normalized.candidateCount} candidatos aceitos de ${normalized.inputFeatureCount} features; ${normalized.rejectedCount} rejeitados.\n`,
  );
}

const entrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : undefined;
if (entrypoint === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
