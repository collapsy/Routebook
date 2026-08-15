import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";
import { PMTiles, type RangeResponse } from "pmtiles";

import {
  mapOverturePlaceCategory,
  placeDistanceMeters,
  validateExternalPlaceCandidate,
  validatePlaceSearchQuery,
  type ExternalPlaceCandidate,
  type PlaceCategory,
  type PlaceSearchPort,
  type PlaceSearchQuery,
} from "@routebook/place-catalog";

const OVERTURE_EXTRAS_BUCKET = "https://overturemaps-extras-us-west-2.s3.us-west-2.amazonaws.com";
const OVERTURE_PLACES_SOURCE_URL = "https://docs.overturemaps.org/guides/places/";
const DEFAULT_ZOOM = 14;
const DEFAULT_MINIMUM_CONFIDENCE = 0.7;
const MAX_RUNTIME_RADIUS_METERS = 8_000;
const MAX_RUNTIME_TILES = 100;
const RELEASE_CACHE_TTL_MS = 60 * 60 * 1_000;

const KNOWN_SOURCE_LICENSES: Readonly<Record<string, string>> = Object.freeze({
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

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type OvertureArchive = Readonly<{
  getZxy(
    zoom: number,
    x: number,
    y: number,
    signal?: AbortSignal,
  ): Promise<RangeResponse | undefined>;
}>;

type TileCoordinate = Readonly<{ zoom: number; x: number; y: number }>;

type OverturePlaceSearchDependencies = Readonly<{
  fetcher?: FetchLike;
  createArchive?: (url: string) => OvertureArchive;
  resolveRelease?: () => Promise<string>;
  now?: () => Date;
  minimumConfidence?: number;
  zoom?: number;
}>;

type JsonRecord = Record<string, unknown>;

type ParsedPointFeature = Readonly<{
  properties: JsonRecord;
  longitude: number;
  latitude: number;
}>;

let cachedRelease: Readonly<{ value: string; expiresAt: number }> | undefined;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseStructured(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}

function asRecord(value: unknown): JsonRecord | undefined {
  const parsed = parseStructured(value);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as JsonRecord)
    : undefined;
}

function asRecords(value: unknown): JsonRecord[] {
  const parsed = parseStructured(value);
  return Array.isArray(parsed)
    ? parsed.filter((item): item is JsonRecord => Boolean(item && typeof item === "object"))
    : [];
}

function sourceDatasetKey(value: unknown): string {
  return text(value)
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

export function resolveOvertureTileSourceLicense(
  source: JsonRecord | undefined,
): string | undefined {
  if (!source) return undefined;
  const explicit = text(source.license);
  if (explicit) return explicit;

  const rawDataset = text(source.dataset).toLowerCase();
  const normalizedDataset = sourceDatasetKey(source.dataset);
  return (
    KNOWN_SOURCE_LICENSES[rawDataset] ??
    KNOWN_SOURCE_LICENSES[normalizedDataset] ??
    Object.entries(KNOWN_SOURCE_LICENSES).find(([key]) => normalizedDataset.includes(key))?.[1]
  );
}

function primarySource(properties: JsonRecord): JsonRecord | undefined {
  const sources = asRecords(properties.sources);
  return sources.find((source) => text(source.property) === "") ?? sources[0];
}

function primaryName(properties: JsonRecord): string {
  const directName = text(properties["@name"]);
  if (directName) return directName;

  const names = asRecord(properties.names);
  return text(names?.primary) || text(properties.name);
}

function primaryCategory(properties: JsonRecord): string {
  const taxonomy = asRecord(properties.taxonomy);
  const categories = asRecord(properties.categories);
  return text(properties.basic_category) || text(taxonomy?.primary) || text(categories?.primary);
}

function categoryHierarchy(properties: JsonRecord): string[] {
  const taxonomy = asRecord(properties.taxonomy);
  const rawHierarchy = parseStructured(taxonomy?.hierarchy);
  return Array.isArray(rawHierarchy) ? rawHierarchy.map(text).filter(Boolean) : [];
}

function addressLabel(properties: JsonRecord): string | undefined {
  const address = asRecords(properties.addresses)[0];
  if (!address) return undefined;

  const freeform = text(address.freeform);
  if (freeform) return freeform;

  const levels = asRecords(address.address_levels);
  const parts = [levels[0]?.value, address.locality, address.region, address.country]
    .map(text)
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function longitudeToTileX(longitude: number, zoom: number): number {
  const scale = 2 ** zoom;
  return Math.min(scale - 1, Math.max(0, Math.floor(((longitude + 180) / 360) * scale)));
}

function latitudeToTileY(latitude: number, zoom: number): number {
  const scale = 2 ** zoom;
  const clampedLatitude = Math.min(85.051_128_78, Math.max(-85.051_128_78, latitude));
  const radians = (clampedLatitude * Math.PI) / 180;
  const mercator = Math.asinh(Math.tan(radians));
  return Math.min(scale - 1, Math.max(0, Math.floor(((1 - mercator / Math.PI) / 2) * scale)));
}

export function tileCoordinatesForRadius(
  center: Readonly<{ latitude: number; longitude: number }>,
  radiusMeters: number,
  zoom = DEFAULT_ZOOM,
): TileCoordinate[] {
  const latitudeDelta = radiusMeters / 111_320;
  const longitudeScale = Math.max(0.1, Math.cos((center.latitude * Math.PI) / 180));
  const longitudeDelta = radiusMeters / (111_320 * longitudeScale);
  const west = Math.max(-180, center.longitude - longitudeDelta);
  const east = Math.min(180, center.longitude + longitudeDelta);
  const south = Math.max(-85, center.latitude - latitudeDelta);
  const north = Math.min(85, center.latitude + latitudeDelta);

  const minX = longitudeToTileX(west, zoom);
  const maxX = longitudeToTileX(east, zoom);
  const minY = latitudeToTileY(north, zoom);
  const maxY = latitudeToTileY(south, zoom);
  const tiles: TileCoordinate[] = [];

  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      tiles.push({ zoom, x, y });
    }
  }

  if (tiles.length > MAX_RUNTIME_TILES) {
    throw new Error(
      `A busca externa exigiria ${tiles.length} tiles; reduza o raio para manter a consulta limitada.`,
    );
  }

  return tiles;
}

export function parseLatestOvertureTileRelease(xml: string): string {
  const releases = [...xml.matchAll(/<Prefix>tiles\/(\d{4}-\d{2}-\d{2}\.\d+)\/<\/Prefix>/g)].map(
    (match) => match[1],
  );
  if (releases.length === 0) {
    throw new Error("Nenhuma release de PMTiles do Overture foi encontrada.");
  }
  return releases.sort().at(-1) ?? releases[0];
}

export async function resolveLatestOvertureTileRelease(
  fetcher: FetchLike = fetch,
  now = Date.now(),
): Promise<string> {
  if (cachedRelease && cachedRelease.expiresAt > now) return cachedRelease.value;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const query = new URLSearchParams({
      "list-type": "2",
      prefix: "tiles/",
      delimiter: "/",
    });
    const response = await fetcher(`${OVERTURE_EXTRAS_BUCKET}/?${query}`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Falha ao descobrir a release do Overture (${response.status}).`);
    }
    const release = parseLatestOvertureTileRelease(await response.text());
    cachedRelease = { value: release, expiresAt: now + RELEASE_CACHE_TTL_MS };
    return release;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeTileFeature(
  feature: ParsedPointFeature,
  collectedAt: Date,
  minimumConfidence: number,
): ExternalPlaceCandidate | undefined {
  const operatingStatus = text(feature.properties.operating_status).toLowerCase();
  if (operatingStatus === "permanently_closed") return undefined;

  const externalId = text(feature.properties.id);
  const name = primaryName(feature.properties);
  const providerCategory = primaryCategory(feature.properties);
  const providerCategoryHierarchy = categoryHierarchy(feature.properties);
  const category = mapOverturePlaceCategory(providerCategory, providerCategoryHierarchy);
  const confidence = finiteNumber(feature.properties.confidence);
  const source = primarySource(feature.properties);
  const sourceLicense = resolveOvertureTileSourceLicense(source);

  if (!externalId || name.length < 2 || !providerCategory || !category || !sourceLicense) {
    return undefined;
  }
  if (confidence !== undefined && confidence < minimumConfidence) return undefined;

  const address = addressLabel(feature.properties);
  const candidate: ExternalPlaceCandidate = {
    provider: "overture",
    externalId,
    name,
    latitude: feature.latitude,
    longitude: feature.longitude,
    providerCategory,
    ...(providerCategoryHierarchy.length > 0 ? { providerCategoryHierarchy } : {}),
    category,
    ...(address ? { addressLabel: address } : {}),
    sourceUrl: OVERTURE_PLACES_SOURCE_URL,
    sourceLicense,
    collectedAt,
    ...(confidence !== undefined ? { confidence } : {}),
  };

  try {
    validateExternalPlaceCandidate(candidate);
    return candidate;
  } catch {
    return undefined;
  }
}

function parseTile(range: RangeResponse, coordinate: TileCoordinate): ParsedPointFeature[] {
  const tile = new VectorTile(new PbfReader(new Uint8Array(range.data)));
  const layer = tile.layers.place ?? tile.layers.places;
  if (!layer) return [];

  const features: ParsedPointFeature[] = [];
  for (let index = 0; index < layer.length; index += 1) {
    const feature = layer.feature(index);
    const geoJson = feature.toGeoJSON(coordinate.x, coordinate.y, coordinate.zoom);
    if (geoJson.geometry.type !== "Point") continue;
    const [longitude, latitude] = geoJson.geometry.coordinates;
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) continue;
    features.push({
      properties: feature.properties as JsonRecord,
      longitude,
      latitude,
    });
  }
  return features;
}

async function readTiles(
  archive: OvertureArchive,
  coordinates: readonly TileCoordinate[],
): Promise<ParsedPointFeature[]> {
  const features: ParsedPointFeature[] = [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    for (let start = 0; start < coordinates.length; start += 8) {
      const batch = coordinates.slice(start, start + 8);
      const ranges = await Promise.all(
        batch.map((coordinate) =>
          archive.getZxy(coordinate.zoom, coordinate.x, coordinate.y, controller.signal),
        ),
      );
      ranges.forEach((range, index) => {
        if (!range) return;
        const coordinate = batch[index];
        if (coordinate) features.push(...parseTile(range, coordinate));
      });
    }
    return features;
  } finally {
    clearTimeout(timeout);
  }
}

export class OverturePmtilesPlaceSearchAdapter implements PlaceSearchPort {
  private readonly createArchive: (url: string) => OvertureArchive;
  private readonly resolveRelease: () => Promise<string>;
  private readonly now: () => Date;
  private readonly minimumConfidence: number;
  private readonly zoom: number;

  constructor(dependencies: OverturePlaceSearchDependencies = {}) {
    const fetcher = dependencies.fetcher ?? fetch;
    this.createArchive = dependencies.createArchive ?? ((url) => new PMTiles(url));
    this.resolveRelease =
      dependencies.resolveRelease ?? (() => resolveLatestOvertureTileRelease(fetcher));
    this.now = dependencies.now ?? (() => new Date());
    this.minimumConfidence = dependencies.minimumConfidence ?? DEFAULT_MINIMUM_CONFIDENCE;
    this.zoom = dependencies.zoom ?? DEFAULT_ZOOM;
  }

  async search(query: PlaceSearchQuery): Promise<readonly ExternalPlaceCandidate[]> {
    validatePlaceSearchQuery(query);
    if (query.radiusMeters > MAX_RUNTIME_RADIUS_METERS) {
      throw new Error(
        `A descoberta Overture sob demanda aceita raio máximo de ${MAX_RUNTIME_RADIUS_METERS} metros.`,
      );
    }

    const release = await this.resolveRelease();
    if (!/^\d{4}-\d{2}-\d{2}\.\d+$/.test(release)) {
      throw new Error("A release Overture resolvida é inválida.");
    }

    const coordinates = tileCoordinatesForRadius(query.center, query.radiusMeters, this.zoom);
    const archive = this.createArchive(`${OVERTURE_EXTRAS_BUCKET}/tiles/${release}/places.pmtiles`);
    const collectedAt = this.now();
    const candidatesById = new Map<string, ExternalPlaceCandidate>();

    for (const feature of await readTiles(archive, coordinates)) {
      const candidate = normalizeTileFeature(feature, collectedAt, this.minimumConfidence);
      if (!candidate) continue;
      if (placeDistanceMeters(candidate, query.center) > query.radiusMeters) continue;
      if (query.categories && !query.categories.includes(candidate.category as PlaceCategory))
        continue;

      const previous = candidatesById.get(candidate.externalId);
      if (!previous || (candidate.confidence ?? -1) > (previous.confidence ?? -1)) {
        candidatesById.set(candidate.externalId, candidate);
      }
    }

    const limit = query.limit ?? 40;
    return [...candidatesById.values()]
      .sort((left, right) => {
        const byConfidence = (right.confidence ?? -1) - (left.confidence ?? -1);
        if (byConfidence) return byConfidence;
        const byDistance =
          placeDistanceMeters(left, query.center) - placeDistanceMeters(right, query.center);
        return byDistance || left.name.localeCompare(right.name, "pt-BR");
      })
      .slice(0, limit);
  }
}
