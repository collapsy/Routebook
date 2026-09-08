import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzlePlaceExternalReferenceRepository,
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import {
  PLACE_CATEGORIES,
  PLACE_PRICE_RANGES,
  reconcileExternalPlaceCandidate,
  type Place,
  type ExternalPlaceReconciliation,
  type PlaceQualityScore,
  type PlaceQualitySignalMatch,
  type PlaceQualitySignals,
} from "@routebook/place-catalog";
import { listSavedPlaces } from "@routebook/saved-places";
import { findTripById } from "@routebook/trip-management";

import { ExternalPlaceImagePreview } from "../../../../components/external-place-image-preview";
import { PlacePrimaryImage } from "../../../../components/place-primary-image";
import { PlaceRankingMeta } from "../../../../components/place-ranking-meta";
import { TripMap } from "../../../../components/trip-map";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsPlaceLabel,
  buildGoogleMapsSearchUrl,
} from "../../../../lib/google-maps-links";
import {
  buildPlaceDiscoveryFeed,
  type EnrichedPlaceDiscoveryItem,
  type ExternalPlaceDiscoveryItem,
  type PublishedPlaceDiscoveryItem,
} from "../../../../lib/place-discovery-feed";
import {
  PLACE_DISCOVERY_ORDERS,
  buildPlaceDiscoveryQualityTargets,
  buildPlaceDiscoveryTopLists,
  parsePlaceDiscoveryOrder,
  rankPlaceDiscoveryItems,
  type PlaceDiscoveryOrder,
} from "../../../../lib/place-discovery-ranking";
import {
  derivePlaceBootstrapStage,
  resolvePlaceBootstrapPolicy,
  runPlaceBootstrapStep,
} from "../../../../lib/place-bootstrap";
import { resolveConfiguredPlaceQualityProvider } from "../../../../lib/place-quality-provider";
import type { TripMapPoint } from "../../../../lib/trip-map";
import { OverturePmtilesPlaceSearchAdapter } from "../../../../lib/overture-place-search";
import { resolvePlaceDiscoveryRegion } from "../../../../lib/place-discovery-region";
import {
  removePublishedPlaceAction,
  saveExternalPlaceAction,
  savePublishedPlaceAction,
} from "./actions";
import {
  categoryLabels,
  filterPlaces,
  listAvailablePlaceCategories,
  parseMaximumDistance,
  parsePlaceCategory,
  parsePlacePriceRange,
  priceRangeLabels,
} from "./filters";

import styles from "./place-discovery.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lugares da viagem — RouteBook",
  description: "Explore lugares para visitar durante a sua viagem.",
};

type DiscoverySearchParams = {
  busca?: string;
  categoria?: string;
  distancia?: string;
  preco?: string;
  ordem?: string;
  descoberta?: string | undefined;
  erroPromocao?: string;
};

const distanceOptions = [1, 3, 5, 10] as const;
const externalDiscoveryDisplayLimit = 60;

const orderLabels: Readonly<Record<PlaceDiscoveryOrder, string>> = Object.freeze({
  recommended: "Recomendados",
  rating: "Melhor avaliados",
  popularity: "Mais populares",
  distance: "Mais próximos",
});

function resolveCuratedDestinationId(places: readonly Place[]): string | undefined {
  const destinationIds = [
    ...new Set(places.flatMap((place) => (place.destinationId ? [place.destinationId] : []))),
  ];
  return destinationIds.length === 1 ? destinationIds[0] : undefined;
}

function discoveryHref(tripId: string, values: DiscoverySearchParams): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value) query.set(key, value);
  }

  const serialized = query.toString();
  return `/viagens/${tripId}/lugares${serialized ? `?${serialized}` : ""}`;
}

function formatDistance(meters: number): string {
  if (meters < 1_000) return `${Math.round(meters)} m`;
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(meters / 1_000)} km`;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesExternalSearch(result: ExternalPlaceReconciliation, search?: string): boolean {
  if (!search) return true;
  const needle = normalizeSearchText(search);
  return [
    result.candidate.name,
    result.candidate.addressLabel,
    result.candidate.providerCategory,
    result.candidate.category,
  ]
    .filter((value): value is string => Boolean(value))
    .some((value) => normalizeSearchText(value).includes(needle));
}

function placeActionErrorMessage(value?: string): string | undefined {
  switch (value) {
    case "candidato-invalido":
      return "Não foi possível usar este lugar. Atualize a busca e tente novamente.";
    case "candidato-nao-encontrado":
      return "Este lugar não está mais disponível na busca atual. Atualize a busca e tente novamente.";
    case "candidato-rejeitado":
      return "Não foi possível salvar este lugar. Atualize a busca ou escolha outra opção.";
    case "possivel-duplicata":
      return "Este lugar pode já estar disponível na viagem. Atualize a busca antes de tentar novamente.";
    case "fonte-indisponivel":
    case "destino-nao-suportado":
    case "consistencia":
    case "erro-tecnico":
      return "Não foi possível salvar este lugar agora. Tente novamente.";
    default:
      return undefined;
  }
}

function providerCategoryLabel(value: string): string {
  return value.replaceAll("_", " ").replaceAll("-", " ");
}

type CanonicalDiscoveryItem = PublishedPlaceDiscoveryItem | EnrichedPlaceDiscoveryItem;

function CanonicalDiscoveryCard({
  item,
  tripId,
  destinationId,
  distanceReferenceLabel,
  accommodationCoordinate,
  isSaved,
  rankingPosition,
  rankingOrderLabel,
  quality,
  qualitySignals,
  categoryRank,
  externalMediaEnabled,
  timeZone,
}: Readonly<{
  item: CanonicalDiscoveryItem;
  tripId: string;
  destinationId?: string;
  distanceReferenceLabel: string;
  accommodationCoordinate?: Readonly<{ latitude: number; longitude: number }>;
  isSaved: boolean;
  rankingPosition: number;
  rankingOrderLabel: string;
  quality?: PlaceQualityScore;
  qualitySignals?: PlaceQualitySignals;
  categoryRank?: number;
  externalMediaEnabled: boolean;
  timeZone: string;
}>) {
  const { place, distanceMeters } = item;
  const candidate = item.kind === "enriched" ? item.candidate : undefined;
  const coordinate = candidate
    ? { latitude: candidate.latitude, longitude: candidate.longitude }
    : { latitude: place.latitude, longitude: place.longitude };
  const addressLabel = candidate?.addressLabel ?? place.addressLabel;
  const mapsSearchUrl = buildGoogleMapsSearchUrl({
    name: place.name,
    addressLabel,
    coordinate,
  });
  const destinationLabel = buildGoogleMapsPlaceLabel({
    name: place.name,
    addressLabel,
  });

  return (
    <li
      data-place-enriched-by={candidate?.provider}
      data-place-source="published"
      data-place-state={candidate ? "enriched" : "published"}
    >
      {place.primaryImage || !candidate ? (
        <PlacePrimaryImage
          category={place.category}
          placeName={place.name}
          primaryImage={place.primaryImage}
        />
      ) : (
        <ExternalPlaceImagePreview
          category={place.category}
          destinationId={destinationId}
          enabled={externalMediaEnabled}
          latitude={candidate.latitude}
          longitude={candidate.longitude}
          placeName={place.name}
        />
      )}

      <div className={styles.cardIdentity}>
        <span>{categoryLabels[place.category]}</span>
        {isSaved ? <span>Salvo</span> : null}
      </div>

      <h3 className={styles.cardTitle}>{place.name}</h3>
      {place.summary ? <p className={styles.cardSummary}>{place.summary}</p> : null}

      <div className={styles.cardFacts}>
        <span className={styles.cardFact}>
          {formatDistance(distanceMeters)} em linha reta {distanceReferenceLabel}
        </span>
        {place.priceRange ? (
          <span className={styles.cardPrice}>{priceRangeLabels[place.priceRange]}</span>
        ) : null}
      </div>

      <PlaceRankingMeta
        categoryLabel={categoryLabels[place.category]}
        orderLabel={rankingOrderLabel}
        position={rankingPosition}
        timeZone={timeZone}
        {...(quality ? { quality } : {})}
        {...(qualitySignals ? { signals: qualitySignals } : {})}
        {...(categoryRank ? { categoryRank } : {})}
      />

      <div className={styles.cardActions}>
        <Link className="product-primary-action" href={`/viagens/${tripId}/lugares/${place.slug}`}>
          Ver detalhes
        </Link>
        <form action={isSaved ? removePublishedPlaceAction : savePublishedPlaceAction}>
          <input name="tripId" type="hidden" value={tripId} />
          <input name="placeSlug" type="hidden" value={place.slug} />
          <button className="product-secondary-action" type="submit">
            {isSaved ? "Remover dos salvos" : "Salvar lugar"}
          </button>
        </form>
      </div>

      <details className={styles.cardDetails}>
        <summary>Mais informações</summary>
        <div className={styles.cardDetailsBody}>
          <p>{addressLabel ?? "Endereço ainda não informado"}</p>
          {candidate ? (
            <small>Fonte de localização: Overture · licença: {candidate.sourceLicense}</small>
          ) : (
            <small>Fonte: RouteBook</small>
          )}
          <div className={styles.cardAuxiliaryActions}>
            <a
              className="product-secondary-action"
              href={mapsSearchUrl}
              rel="noreferrer"
              target="_blank"
            >
              Ver mapa e fotos
            </a>
            <a
              className="product-secondary-action"
              href={buildGoogleMapsDirectionsUrl({
                ...(accommodationCoordinate ? { origin: accommodationCoordinate } : {}),
                destination: coordinate,
                destinationLabel,
                travelMode: "walking",
              })}
              rel="noreferrer"
              target="_blank"
            >
              Calcular rota real
            </a>
          </div>
        </div>
      </details>
    </li>
  );
}

function ExternalDiscoveryCard({
  item,
  tripId,
  destinationId,
  distanceReferenceLabel,
  accommodationCoordinate,
  search,
  category,
  maximumDistanceMeters,
  priceRange,
  discoveryMode,
  rankingPosition,
  rankingOrderLabel,
  quality,
  qualitySignals,
  categoryRank,
  externalMediaEnabled,
  timeZone,
}: Readonly<{
  item: ExternalPlaceDiscoveryItem;
  tripId: string;
  destinationId?: string;
  distanceReferenceLabel: string;
  accommodationCoordinate?: Readonly<{ latitude: number; longitude: number }>;
  search?: string;
  category?: (typeof PLACE_CATEGORIES)[number];
  maximumDistanceMeters?: number;
  priceRange?: (typeof PLACE_PRICE_RANGES)[number];
  discoveryMode?: string;
  rankingPosition: number;
  rankingOrderLabel: string;
  quality?: PlaceQualityScore;
  qualitySignals?: PlaceQualitySignals;
  categoryRank?: number;
  externalMediaEnabled: boolean;
  timeZone: string;
}>) {
  const { candidate, distanceMeters } = item;
  const coordinate = { latitude: candidate.latitude, longitude: candidate.longitude };
  const categoryLabel = candidate.category
    ? categoryLabels[candidate.category]
    : providerCategoryLabel(candidate.providerCategory);
  const destinationLabel = buildGoogleMapsPlaceLabel({
    name: candidate.name,
    addressLabel: candidate.addressLabel,
  });
  const mapsSearchUrl = buildGoogleMapsSearchUrl({
    name: candidate.name,
    addressLabel: candidate.addressLabel,
    coordinate,
  });

  return (
    <li
      data-place-category={candidate.category ?? "unmapped"}
      data-place-source="external"
      data-place-state="external"
    >
      <ExternalPlaceImagePreview
        category={candidate.category}
        destinationId={destinationId}
        enabled={externalMediaEnabled}
        latitude={candidate.latitude}
        longitude={candidate.longitude}
        placeName={candidate.name}
      />

      <div className={styles.cardIdentity}>
        <span>{categoryLabel}</span>
      </div>

      <h3 className={styles.cardTitle}>{candidate.name}</h3>

      <div className={styles.cardFacts}>
        <span className={styles.cardFact}>
          {formatDistance(distanceMeters)} em linha reta {distanceReferenceLabel}
        </span>
      </div>

      <PlaceRankingMeta
        categoryLabel={categoryLabel}
        orderLabel={rankingOrderLabel}
        position={rankingPosition}
        timeZone={timeZone}
        {...(quality ? { quality } : {})}
        {...(qualitySignals ? { signals: qualitySignals } : {})}
        {...(categoryRank ? { categoryRank } : {})}
      />

      <div className={styles.cardActions}>
        <a className="product-primary-action" href={mapsSearchUrl} rel="noreferrer" target="_blank">
          Ver mapa e fotos
        </a>
        {candidate.category ? (
          <form action={saveExternalPlaceAction} className={styles.promotionForm}>
            <input name="tripId" type="hidden" value={tripId} />
            <input name="externalId" type="hidden" value={candidate.externalId} />
            {search ? <input name="busca" type="hidden" value={search} /> : null}
            {category ? <input name="categoria" type="hidden" value={category} /> : null}
            {maximumDistanceMeters ? (
              <input name="distancia" type="hidden" value={String(maximumDistanceMeters / 1_000)} />
            ) : null}
            {priceRange ? <input name="preco" type="hidden" value={priceRange} /> : null}
            {discoveryMode ? <input name="descoberta" type="hidden" value={discoveryMode} /> : null}
            <button className="product-secondary-action" type="submit">
              Salvar lugar
            </button>
          </form>
        ) : null}
      </div>

      <details className={styles.cardDetails}>
        <summary>Mais informações</summary>
        <div className={styles.cardDetailsBody}>
          <p>{candidate.addressLabel ?? "Endereço não informado"}</p>
          <small>Fonte: Overture · licença: {candidate.sourceLicense}</small>
          {!candidate.category ? (
            <small>Salvar ainda não está disponível para este lugar.</small>
          ) : null}
          <div className={styles.cardAuxiliaryActions}>
            <a
              className="product-secondary-action"
              href={buildGoogleMapsDirectionsUrl({
                ...(accommodationCoordinate ? { origin: accommodationCoordinate } : {}),
                destination: coordinate,
                destinationLabel,
                travelMode: "walking",
              })}
              rel="noreferrer"
              target="_blank"
            >
              Calcular rota real
            </a>
          </div>
        </div>
      </details>
    </li>
  );
}

export default async function PlacesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<DiscoverySearchParams>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const rawFilters = await searchParams;
  const search = rawFilters.busca?.trim().slice(0, 120) || undefined;
  const category = parsePlaceCategory(rawFilters.categoria);
  const priceRange = parsePlacePriceRange(rawFilters.preco);
  const requestedOrder = parsePlaceDiscoveryOrder(rawFilters.ordem);
  const discoverExternal = rawFilters.descoberta !== "ocultar";
  const showAllExternal = rawFilters.descoberta === "todas";
  const discoveryMode = !discoverExternal ? "ocultar" : showAllExternal ? "todas" : undefined;
  const placeActionError = placeActionErrorMessage(rawFilters.erroPromocao);
  const accommodationCoordinate = trip.accommodation?.coordinate;
  const requestedMaximumDistanceMeters = parseMaximumDistance(rawFilters.distancia);
  const regionResolution = resolvePlaceDiscoveryRegion({
    destination: trip.destination,
    ...(accommodationCoordinate ? { accommodationCoordinate } : {}),
    ...(requestedMaximumDistanceMeters
      ? { requestedRadiusMeters: requestedMaximumDistanceMeters }
      : {}),
  });
  const region = regionResolution.status === "resolved" ? regionResolution.region : undefined;
  const bootstrapPolicy = resolvePlaceBootstrapPolicy();
  const bootstrapStartedAt = process.hrtime.bigint();
  console.info("[place-bootstrap] started", {
    destinationResolved: true,
    accommodationResolved: Boolean(accommodationCoordinate),
    regionSource: region?.source ?? "unavailable",
    discoveryEnabled: bootstrapPolicy.discovery.enabled,
    qualityEnabled: bootstrapPolicy.quality.enabled,
    mediaEnabled: bootstrapPolicy.media.enabled,
  });
  const maximumDistanceMeters = region ? requestedMaximumDistanceMeters : undefined;
  const placeRepository = new DrizzlePlaceRepository();
  const [publishedPlaces, savedPlaces] = await Promise.all([
    region
      ? placeRepository.listPublishedWithinRadius({
          center: region.center,
          radiusMeters: region.curatedRadiusMeters,
        })
      : [],
    listSavedPlaces(new DrizzleSavedPlaceRepository(), tripId),
  ]);
  const destinationId = resolveCuratedDestinationId(publishedPlaces);
  const savedPlaceIds = new Set(savedPlaces.map((selection) => selection.placeId));
  const filteredPlaces = filterPlaces(
    publishedPlaces,
    {
      ...(search ? { search } : {}),
      ...(category ? { category } : {}),
      ...(priceRange ? { priceRange } : {}),
      ...(maximumDistanceMeters ? { maximumDistanceMeters } : {}),
    },
    region?.center,
  );
  const baseParams: DiscoverySearchParams = {
    ...(search ? { busca: search } : {}),
    ...(category ? { categoria: category } : {}),
    ...(maximumDistanceMeters ? { distancia: String(maximumDistanceMeters / 1_000) } : {}),
    ...(priceRange ? { preco: priceRange } : {}),
    ...(discoveryMode ? { descoberta: discoveryMode } : {}),
  };
  const activeFilters = [
    ...(search
      ? [
          {
            key: "busca" as const,
            label: `Busca: ${search}`,
          },
        ]
      : []),
    ...(category
      ? [{ key: "categoria" as const, label: `Categoria: ${categoryLabels[category]}` }]
      : []),
    ...(maximumDistanceMeters && region
      ? [
          {
            key: "distancia" as const,
            label: `Até ${maximumDistanceMeters / 1_000} km ${region.distanceReferenceLabel}`,
          },
        ]
      : []),
    ...(priceRange
      ? [{ key: "preco" as const, label: `Preço: ${priceRangeLabels[priceRange]}` }]
      : []),
  ];
  let allExternalReconciliations: ExternalPlaceReconciliation[] = [];
  let externalReconciliations: ExternalPlaceReconciliation[] = [];
  let externalCandidateCount = 0;
  let externalPossibleMatchCount = 0;
  let externalLinkedCount = 0;
  let externalRejectedCount = 0;
  let externalDiscoveryError: string | undefined;
  let discoveryStatus: "success" | "disabled" | "failed" = "disabled";
  let discoveryAttempts = 0;
  let discoveryDurationMs = 0;

  if (discoverExternal && region) {
    const references = await new DrizzlePlaceExternalReferenceRepository().listByPlaceIds(
      publishedPlaces.map((place) => place.id),
    );
    const discoveryResult = await runPlaceBootstrapStep({
      enabled: bootstrapPolicy.discovery.enabled,
      maxAttempts: bootstrapPolicy.discovery.maxAttempts,
      operation: () =>
        new OverturePmtilesPlaceSearchAdapter().search({
          center: region.center,
          radiusMeters: region.externalRadiusMeters,
          limit: bootstrapPolicy.discovery.candidateLimit,
        }),
    });
    discoveryStatus = discoveryResult.status;
    discoveryAttempts = discoveryResult.attempts;
    discoveryDurationMs = discoveryResult.durationMs;

    if (discoveryResult.status === "success") {
      const candidates = discoveryResult.value;
      const reconciliations = candidates.map((candidate) =>
        reconcileExternalPlaceCandidate(candidate, publishedPlaces, references),
      );
      allExternalReconciliations = reconciliations;
      externalCandidateCount = candidates.length;
      externalPossibleMatchCount = reconciliations.filter(
        (result) => result.status === "possible_match",
      ).length;
      externalLinkedCount = reconciliations.filter((result) => result.status === "linked").length;
      externalRejectedCount = reconciliations.filter(
        (result) => result.status === "rejected",
      ).length;
      externalReconciliations = reconciliations.filter((result) => {
        if (category && result.candidate.category !== category) return false;
        return result.status !== "new" || matchesExternalSearch(result, search);
      });
    } else if (discoveryResult.status === "failed") {
      externalDiscoveryError =
        "Não foi possível atualizar os lugares encontrados agora. Os lugares já disponíveis continuam na lista.";
    }
  }

  const hasExternalCoverage = discoverExternal && Boolean(region) && discoveryStatus === "success";
  const facetDiscoveryItems = region
    ? buildPlaceDiscoveryFeed({
        publishedPlaces,
        externalReconciliations: hasExternalCoverage ? allExternalReconciliations : [],
        reference: region.center,
      })
    : [];
  const availableCategories = listAvailablePlaceCategories(
    facetDiscoveryItems.map((item) =>
      item.kind === "external" ? item.candidate.category : item.place.category,
    ),
  );
  const filteredPublishedPlaces = filteredPlaces.map(({ place }) => place);
  const allDiscoveryItems = region
    ? buildPlaceDiscoveryFeed({
        publishedPlaces: filteredPublishedPlaces,
        externalReconciliations: hasExternalCoverage ? externalReconciliations : [],
        reference: region.center,
      })
    : [];
  const discoveryItems =
    showAllExternal || !region
      ? allDiscoveryItems
      : buildPlaceDiscoveryFeed({
          publishedPlaces: filteredPublishedPlaces,
          externalReconciliations: hasExternalCoverage ? externalReconciliations : [],
          reference: region.center,
          externalLimit: externalDiscoveryDisplayLimit,
        });

  const qualityProvider = resolveConfiguredPlaceQualityProvider();
  let qualityMatches: PlaceQualitySignalMatch[] = [];
  let qualityProviderError: string | undefined;
  let qualityStatus: "success" | "disabled" | "failed" = "disabled";
  let qualityAttempts = 0;
  let qualityDurationMs = 0;
  if (qualityProvider.status === "configured") {
    const qualityResult = await runPlaceBootstrapStep({
      enabled: bootstrapPolicy.quality.enabled,
      maxAttempts: bootstrapPolicy.quality.maxAttempts,
      operation: () =>
        qualityProvider.port.findSignals(
          buildPlaceDiscoveryQualityTargets(discoveryItems).slice(
            0,
            bootstrapPolicy.quality.targetLimit,
          ),
        ),
    });
    qualityStatus = qualityResult.status;
    qualityAttempts = qualityResult.attempts;
    qualityDurationMs = qualityResult.durationMs;

    if (qualityResult.status === "success") {
      qualityMatches = [...qualityResult.value];
    } else {
      qualityProviderError =
        "Avaliação e popularidade não estão disponíveis agora. Use Mais próximos para ordenar.";
    }
  }

  const ranking = rankPlaceDiscoveryItems({
    items: discoveryItems,
    qualityMatches,
    order: requestedOrder,
    contextualNow: true,
  });
  const topLists = buildPlaceDiscoveryTopLists(ranking.items);
  const categoryRankByItemId = new Map(
    topLists.flatMap((list) =>
      list.items.map((entry, index) => [entry.item.id, index + 1] as const),
    ),
  );
  const canonicalParams: DiscoverySearchParams = {
    ...baseParams,
    ...(ranking.order === "distance" ? {} : { ordem: ranking.order }),
  };
  const visibleOptionCount = discoveryItems.length;
  const totalAvailableOptionCount = allDiscoveryItems.length;
  const availableExternalCount = allDiscoveryItems.filter(
    (item) => item.kind === "external",
  ).length;
  const visibleExternalCount = discoveryItems.filter((item) => item.kind === "external").length;
  const hasMoreExternalResults =
    hasExternalCoverage && availableExternalCount > visibleExternalCount;
  const hasExpandedExternalResults =
    hasExternalCoverage &&
    showAllExternal &&
    availableExternalCount > externalDiscoveryDisplayLimit;
  const externalMediaItemIds = new Set(
    destinationId && bootstrapPolicy.media.enabled
      ? ranking.items
          .filter(({ item }) => {
            if (item.kind === "external") return true;
            return item.kind === "enriched" && !item.place.primaryImage;
          })
          .slice(0, bootstrapPolicy.media.previewBudget)
          .map(({ item }) => item.id)
      : [],
  );
  const bootstrapStage = derivePlaceBootstrapStage({
    regionResolved: Boolean(region),
    safePlaceCount: discoveryItems.length,
    discoveryStatus,
    mediaExpected: externalMediaItemIds.size > 0,
  });
  const mapPoints: TripMapPoint[] = ranking.items.map(({ item }) => {
    if (item.kind !== "external") {
      const coordinate =
        item.kind === "enriched"
          ? { latitude: item.candidate.latitude, longitude: item.candidate.longitude }
          : { latitude: item.place.latitude, longitude: item.place.longitude };
      return {
        id: item.id,
        label: item.place.name,
        kind: savedPlaceIds.has(item.place.id) ? "saved-place" : "published-place",
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        href: `/viagens/${tripId}/lugares/${item.place.slug}`,
      };
    }

    return {
      id: item.id,
      label: item.candidate.name,
      kind: "external-place",
      latitude: item.candidate.latitude,
      longitude: item.candidate.longitude,
    };
  });

  if (accommodationCoordinate && trip.accommodation) {
    mapPoints.unshift({
      id: "accommodation",
      label: trip.accommodation.name,
      kind: "accommodation",
      latitude: accommodationCoordinate.latitude,
      longitude: accommodationCoordinate.longitude,
    });
  }
  const distanceReferenceLabel = region?.distanceReferenceLabel ?? "da referência espacial";

  console.info("[place-bootstrap] completed", {
    destinationResolved: true,
    accommodationResolved: Boolean(accommodationCoordinate),
    regionSource: region?.source ?? "unavailable",
    stage: bootstrapStage,
    durationMs: Number(process.hrtime.bigint() - bootstrapStartedAt) / 1_000_000,
    publishedCount: publishedPlaces.length,
    candidateCount: externalCandidateCount,
    possibleMatchCount: externalPossibleMatchCount,
    linkedCount: externalLinkedCount,
    rejectedCount: externalRejectedCount,
    qualityMatchCount: qualityMatches.length,
    mediaPreviewBudget: bootstrapPolicy.media.previewBudget,
    mediaPreviewEligibleCount: externalMediaItemIds.size,
    discovery: {
      status: discoveryStatus,
      attempts: discoveryAttempts,
      durationMs: discoveryDurationMs,
    },
    quality: {
      status: qualityStatus,
      attempts: qualityAttempts,
      durationMs: qualityDurationMs,
    },
    providerInvocationCount: discoveryAttempts + qualityAttempts,
  });

  return (
    <section className="app-page trip-overview-page">
      <Link className="back-link" href={`/viagens/${tripId}`}>
        ← Voltar para a viagem
      </Link>

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">Guia de viagem</p>
          <h1>Lugares em {trip.destination.name}</h1>
          <p>
            Compare lugares para decidir o que vale visitar. As distâncias da lista são em linha
            reta; use as ações de rota para trajetos e tempo de deslocamento.
          </p>
        </div>
      </header>

      <form action={`/viagens/${tripId}/lugares`} className={styles.filters} method="get">
        {discoveryMode ? <input name="descoberta" type="hidden" value={discoveryMode} /> : null}
        {ranking.order !== "distance" ? (
          <input name="ordem" type="hidden" value={ranking.order} />
        ) : null}
        <div className={styles.searchField}>
          <label htmlFor="place-search">Nome ou termo</label>
          <input
            defaultValue={search}
            id="place-search"
            maxLength={120}
            name="busca"
            placeholder="Ex.: praia, gastronomia ou endereço"
            type="search"
          />
        </div>
        <div>
          <label htmlFor="place-category">Categoria</label>
          <select defaultValue={category ?? ""} id="place-category" name="categoria">
            <option value="">Todas</option>
            {availableCategories.map((value) => (
              <option key={value} value={value}>
                {categoryLabels[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="place-distance">Distância máxima</label>
          <select
            defaultValue={maximumDistanceMeters ? String(maximumDistanceMeters / 1_000) : ""}
            disabled={!region}
            id="place-distance"
            name="distancia"
          >
            <option value="">Qualquer distância</option>
            {distanceOptions.map((kilometers) => (
              <option key={kilometers} value={kilometers}>
                Até {kilometers} km
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="place-price">Faixa de preço</label>
          <select defaultValue={priceRange ?? ""} id="place-price" name="preco">
            <option value="">Qualquer faixa</option>
            {PLACE_PRICE_RANGES.map((value) => (
              <option key={value} value={value}>
                {priceRangeLabels[value]}
              </option>
            ))}
          </select>
        </div>
        <button className="product-primary-action" type="submit">
          Aplicar filtros
        </button>
      </form>

      {!region ? (
        <p className={styles.notice} role="status">
          Não foi possível calcular distâncias nem buscar lugares próximos agora.
        </p>
      ) : region.source === "accommodation" ? (
        <p className={styles.notice}>
          Distâncias estimadas em linha reta a partir da hospedagem; não representam rota ou tempo
          de deslocamento.
        </p>
      ) : (
        <p className={styles.notice} role="status">
          Sem a localização da hospedagem, as distâncias usam uma referência aproximada do destino.
          São estimativas em linha reta e não representam rota ou tempo de deslocamento.
        </p>
      )}

      {activeFilters.length > 0 ? (
        <section aria-label="Filtros ativos" className={styles.activeFilters}>
          <strong>Filtros ativos</strong>
          <ul>
            {activeFilters.map((filter) => {
              const nextParams = { ...canonicalParams };
              delete nextParams[filter.key];
              return (
                <li key={filter.key}>
                  <Link href={discoveryHref(tripId, nextParams)}>
                    {filter.label} <span aria-hidden="true">×</span>
                    <span className={styles.visuallyHidden}> Remover filtro</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            className="product-secondary-action"
            href={discoveryHref(tripId, {
              ...(discoveryMode ? { descoberta: discoveryMode } : {}),
              ...(ranking.order === "distance" ? {} : { ordem: ranking.order }),
            })}
          >
            Limpar filtros
          </Link>
        </section>
      ) : null}

      <section aria-labelledby="place-ranking-title" className={styles.rankingPanel}>
        <div className={styles.rankingHeader}>
          <div>
            <p className="product-eyebrow">Ordenação</p>
            <h2 id="place-ranking-title">Como você quer ordenar?</h2>
          </div>
          <nav aria-label="Ordenação dos lugares" className={styles.rankingControls}>
            {PLACE_DISCOVERY_ORDERS.map((order) => {
              const available = ranking.availableOrders.includes(order);
              if (!available) {
                return (
                  <span aria-disabled="true" className={styles.rankingDisabled} key={order}>
                    {orderLabels[order]}
                  </span>
                );
              }
              return (
                <Link
                  aria-current={ranking.order === order ? "page" : undefined}
                  className={ranking.order === order ? styles.rankingActive : styles.rankingControl}
                  href={discoveryHref(tripId, {
                    ...baseParams,
                    ...(order === "distance" ? {} : { ordem: order }),
                  })}
                  key={order}
                >
                  {orderLabels[order]}
                </Link>
              );
            })}
          </nav>
        </div>

        {ranking.hasQualityCoverage ? (
          <>
            <p className={styles.rankingNotice}>
              O Score RouteBook combina sinais disponíveis e o contexto da viagem. Veja os detalhes
              do ranking em cada lugar.
            </p>
            {topLists.length > 0 ? (
              <details className={styles.topLists}>
                <summary>Ver Top 5 por categoria</summary>
                <div className={styles.topListsGrid}>
                  {topLists.map((list) => (
                    <section key={list.category}>
                      <strong>{categoryLabels[list.category]}</strong>
                      <ol>
                        {list.items.map((entry) => (
                          <li key={entry.item.id}>
                            {entry.item.kind === "external"
                              ? entry.item.candidate.name
                              : entry.item.place.name}
                            <small>Score {entry.quality?.score}/10</small>
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>
              </details>
            ) : null}
          </>
        ) : (
          <p className={styles.rankingNotice} role="status">
            {qualityProviderError ??
              "Avaliação e popularidade não estão disponíveis para esta seleção. Use Mais próximos para ordenar."}
          </p>
        )}
      </section>

      <div className={styles.resultHeading}>
        <div>
          <h2>
            {hasExternalCoverage
              ? `${visibleOptionCount} de ${totalAvailableOptionCount} ${
                  totalAvailableOptionCount === 1 ? "lugar" : "lugares"
                } exibidos`
              : `${filteredPublishedPlaces.length} ${
                  filteredPublishedPlaces.length === 1 ? "lugar" : "lugares"
                }`}
          </h2>
          <p>A lista e o mapa mostram os mesmos lugares.</p>
        </div>
      </div>

      {discoverExternal &&
      (placeActionError ||
        priceRange ||
        externalDiscoveryError ||
        hasMoreExternalResults ||
        hasExpandedExternalResults) ? (
        <section aria-label="Mais lugares" className={styles.discoverySummary}>
          {placeActionError ? (
            <p className={styles.notice} role="alert">
              {placeActionError}
            </p>
          ) : null}
          {priceRange ? (
            <p className={styles.notice} role="status">
              Alguns lugares não têm faixa de preço informada e podem continuar aparecendo nos
              resultados.
            </p>
          ) : null}
          {externalDiscoveryError ? (
            <p className={styles.notice} role="status">
              {externalDiscoveryError}
            </p>
          ) : hasMoreExternalResults ? (
            <Link
              className="product-primary-action"
              href={discoveryHref(tripId, { ...canonicalParams, descoberta: "todas" })}
            >
              Mostrar todos os {availableExternalCount} lugares encontrados
            </Link>
          ) : hasExpandedExternalResults ? (
            <Link
              className="product-secondary-action"
              href={discoveryHref(tripId, { ...canonicalParams, descoberta: undefined })}
            >
              Mostrar primeiros {externalDiscoveryDisplayLimit} lugares
            </Link>
          ) : null}
        </section>
      ) : null}

      {ranking.items.length > 0 ? (
        <ul
          className={`${styles.optionsGrid} trip-days-grid`}
          aria-label="Opções de lugares"
          data-place-ranking-order={ranking.order}
        >
          {ranking.items.map(({ item, position, quality, signals }) =>
            item.kind === "external" ? (
              <ExternalDiscoveryCard
                key={item.id}
                rankingOrderLabel={orderLabels[ranking.order]}
                rankingPosition={position}
                externalMediaEnabled={externalMediaItemIds.has(item.id)}
                {...(quality ? { quality } : {})}
                {...(signals ? { qualitySignals: signals } : {})}
                {...(categoryRankByItemId.has(item.id)
                  ? { categoryRank: categoryRankByItemId.get(item.id)! }
                  : {})}
                distanceReferenceLabel={distanceReferenceLabel}
                item={item}
                timeZone={trip.destination.timeZone}
                tripId={tripId}
                {...(destinationId ? { destinationId } : {})}
                {...(accommodationCoordinate ? { accommodationCoordinate } : {})}
                {...(search ? { search } : {})}
                {...(category ? { category } : {})}
                {...(maximumDistanceMeters ? { maximumDistanceMeters } : {})}
                {...(priceRange ? { priceRange } : {})}
                {...(showAllExternal ? { discoveryMode: "todas" } : {})}
              />
            ) : (
              <CanonicalDiscoveryCard
                key={item.id}
                rankingOrderLabel={orderLabels[ranking.order]}
                rankingPosition={position}
                externalMediaEnabled={externalMediaItemIds.has(item.id)}
                {...(quality ? { quality } : {})}
                {...(signals ? { qualitySignals: signals } : {})}
                {...(categoryRankByItemId.has(item.id)
                  ? { categoryRank: categoryRankByItemId.get(item.id)! }
                  : {})}
                distanceReferenceLabel={distanceReferenceLabel}
                isSaved={savedPlaceIds.has(item.place.id)}
                item={item}
                timeZone={trip.destination.timeZone}
                tripId={tripId}
                {...(destinationId ? { destinationId } : {})}
                {...(accommodationCoordinate ? { accommodationCoordinate } : {})}
              />
            ),
          )}
        </ul>
      ) : (
        <section className="traveler-context-summary" aria-live="polite">
          <p className="product-eyebrow">Nenhum resultado</p>
          <h2>Nenhum lugar corresponde aos filtros</h2>
          <p>Remova um filtro, amplie a distância ou limpe todos para voltar à descoberta.</p>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
            Limpar filtros
          </Link>
        </section>
      )}

      <TripMap
        description={`A lista e o mapa mostram os mesmos ${visibleOptionCount} ${visibleOptionCount === 1 ? "lugar" : "lugares"}. A hospedagem aparece como referência adicional quando disponível.`}
        emptyDescription="Não há lugar com coordenadas no conjunto filtrado. Limpe ou amplie os filtros para recuperar resultados."
        emptyTitle="Nenhum lugar para exibir no mapa"
        points={mapPoints}
        title={`Mapa dos ${visibleOptionCount} ${visibleOptionCount === 1 ? "lugar" : "lugares"} exibidos`}
      />
    </section>
  );
}
