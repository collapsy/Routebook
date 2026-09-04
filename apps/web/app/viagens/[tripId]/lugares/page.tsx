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
  placeBootstrapStageCopy,
  resolvePlaceBootstrapPolicy,
  runPlaceBootstrapStep,
} from "../../../../lib/place-bootstrap";
import { resolveConfiguredPlaceQualityProvider } from "../../../../lib/place-quality-provider";
import type { TripMapPoint } from "../../../../lib/trip-map";
import { OverturePmtilesPlaceSearchAdapter } from "../../../../lib/overture-place-search";
import { resolvePlaceDiscoveryRegion } from "../../../../lib/place-discovery-region";
import {
  promoteExternalPlaceAction,
  removePublishedPlaceAction,
  saveExternalPlaceAction,
  savePublishedPlaceAction,
} from "./actions";
import {
  categoryLabels,
  filterPlaces,
  parseMaximumDistance,
  parsePlaceCategory,
  parsePlacePriceRange,
  priceRangeLabels,
} from "./filters";

import styles from "./place-discovery.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lugares da viagem — RouteBook",
  description: "Explore lugares únicos e contextualizados do destino da sua viagem.",
};

type DiscoverySearchParams = {
  busca?: string;
  categoria?: string;
  distancia?: string;
  preco?: string;
  ordem?: string;
  descoberta?: string | undefined;
  promocao?: string;
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

function promotionMessage(value?: string): string | undefined {
  switch (value) {
    case "criada":
      return "Candidato enviado para curadoria como draft. Ele só aparecerá no catálogo depois de uma publicação governada.";
    case "existente":
      return "Este candidato já havia sido enviado para curadoria. Nenhuma duplicata foi criada.";
    case "salva":
      return "Lugar salvo na viagem com a origem externa preservada. Nenhuma publicação editorial foi feita.";
    default:
      return undefined;
  }
}

function promotionErrorMessage(value?: string): string | undefined {
  switch (value) {
    case "candidato-invalido":
      return "O candidato informado é inválido. Refaça a descoberta antes de tentar novamente.";
    case "candidato-nao-encontrado":
      return "O candidato não foi reencontrado na fonte atual. Refaça a descoberta antes de tentar novamente.";
    case "candidato-rejeitado":
      return "O candidato não atende aos critérios atuais para promoção e não foi gravado.";
    case "possivel-duplicata":
      return "O RouteBook encontrou uma possível duplicidade. A promoção foi bloqueada para evitar criar outro Lugar.";
    case "fonte-indisponivel":
      return "A fonte externa não pôde revalidar este candidato agora. Nenhuma alteração foi gravada.";
    case "destino-nao-suportado":
      return "A promoção externa ainda não está disponível para este destino.";
    case "consistencia":
      return "O candidato possui um vínculo inconsistente e não foi promovido. Nenhuma alteração parcial foi mantida.";
    case "erro-tecnico":
      return "Não foi possível enviar o candidato para curadoria agora. Nenhuma alteração parcial foi mantida.";
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
      <PlaceRankingMeta
        categoryLabel={categoryLabels[place.category]}
        orderLabel={rankingOrderLabel}
        position={rankingPosition}
        timeZone={timeZone}
        {...(quality ? { quality } : {})}
        {...(qualitySignals ? { signals: qualitySignals } : {})}
        {...(categoryRank ? { categoryRank } : {})}
      />
      {place.primaryImage ? (
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
          googlePlaceId={
            qualitySignals?.provider === "google-places"
              ? qualitySignals.externalId
              : undefined
          }
          latitude={coordinate.latitude}
          longitude={coordinate.longitude}
          placeName={place.name}
        />
      )}
      <div className={styles.cardIdentity}>
        <span>{categoryLabels[place.category]}</span>
        <strong className={`${styles.sourceBadge} ${styles.publishedSource}`}>
          {candidate ? "Curado + atualizado" : "Curado pelo RouteBook"}
        </strong>
      </div>
      <strong>{place.name}</strong>
      <p>{place.summary}</p>
      <small>{addressLabel ?? "Endereço ainda não informado"}</small>
      <small>
        Faixa de preço aproximada:{" "}
        {place.priceRange ? priceRangeLabels[place.priceRange] : "indisponível"}
      </small>
      <small>
        {formatDistance(distanceMeters)} em linha reta {distanceReferenceLabel}
      </small>
      {candidate ? (
        <small>
          Conteúdo: RouteBook · contexto de localização: Overture · licença da origem:{" "}
          {candidate.sourceLicense}
        </small>
      ) : (
        <small>Conteúdo e localização: catálogo publicado do RouteBook</small>
      )}
      <div className={styles.cardActions}>
        <form action={isSaved ? removePublishedPlaceAction : savePublishedPlaceAction}>
          <input name="tripId" type="hidden" value={tripId} />
          <input name="placeSlug" type="hidden" value={place.slug} />
          <button className="product-secondary-action" type="submit">
            {isSaved ? "Remover dos salvos" : "Salvar lugar"}
          </button>
        </form>
        <Link
          className="product-primary-action"
          href={`/viagens/${tripId}/lugares/${place.slug}#adicionar-ao-roteiro`}
        >
          Adicionar ao roteiro
        </Link>
        <Link
          className="product-secondary-action"
          href={`/viagens/${tripId}/lugares/${place.slug}`}
        >
          Ver detalhes
        </Link>
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

  return (
    <li
      data-place-category={candidate.category ?? "unmapped"}
      data-place-source="external"
      data-place-state="external"
    >
      <PlaceRankingMeta
        categoryLabel={categoryLabel}
        orderLabel={rankingOrderLabel}
        position={rankingPosition}
        timeZone={timeZone}
        {...(quality ? { quality } : {})}
        {...(qualitySignals ? { signals: qualitySignals } : {})}
        {...(categoryRank ? { categoryRank } : {})}
      />
      <ExternalPlaceImagePreview
        category={candidate.category}
        destinationId={destinationId}
        enabled={externalMediaEnabled}
        googlePlaceId={
          qualitySignals?.provider === "google-places"
            ? qualitySignals.externalId
            : undefined
        }
        latitude={candidate.latitude}
        longitude={candidate.longitude}
        placeName={candidate.name}
      />
      <div className={styles.cardIdentity}>
        <span>{categoryLabel}</span>
        <strong className={`${styles.sourceBadge} ${styles.externalSource}`}>
          Descoberta atual
        </strong>
      </div>
      <strong>{candidate.name}</strong>
      <p>{candidate.addressLabel ?? "Endereço não informado pela fonte"}</p>
      <small>Categoria na origem: {providerCategoryLabel(candidate.providerCategory)}</small>
      <small>
        {formatDistance(distanceMeters)} em linha reta {distanceReferenceLabel}
      </small>
      <small>Fonte: Overture · licença da origem: {candidate.sourceLicense}</small>
      <small>Candidato externo — ainda não publicado no RouteBook · sem conteúdo curado</small>
      <div className={styles.cardActions}>
        <a
          className="product-secondary-action"
          href={buildGoogleMapsSearchUrl({
            name: candidate.name,
            addressLabel: candidate.addressLabel,
            coordinate,
          })}
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
      {candidate.category ? (
        <>
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
            <button className="product-button" type="submit">
              Salvar na viagem
            </button>
          </form>
          <small>
            O RouteBook revalida o candidato antes de salvar e preserva a fonte. Salvar não publica
            o Lugar nem o adiciona automaticamente ao roteiro.
          </small>
        </>
      ) : (
        <small>
          Este candidato pode ser consultado, mas ainda não tem categoria segura para ser salvo.
        </small>
      )}
      {destinationId ? (
        <>
          <form action={promoteExternalPlaceAction} className={styles.promotionForm}>
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
              Enviar para curadoria
            </button>
          </form>
          <small>
            A ação cria um draft para revisão; não publica, não salva na viagem e não adiciona ao
            roteiro.
          </small>
        </>
      ) : (
        <small>A curadoria editorial permanece separada e não é necessária para planejar.</small>
      )}
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
  const promotionStatusMessage = promotionMessage(rawFilters.promocao);
  const promotionError = promotionErrorMessage(rawFilters.erroPromocao);
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
          ...(category ? { categories: [category] } : {}),
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
      externalCandidateCount = candidates.length;
      externalPossibleMatchCount = reconciliations.filter(
        (result) => result.status === "possible_match",
      ).length;
      externalLinkedCount = reconciliations.filter((result) => result.status === "linked").length;
      externalRejectedCount = reconciliations.filter(
        (result) => result.status === "rejected",
      ).length;
      externalReconciliations = reconciliations.filter(
        (result) => result.status !== "new" || matchesExternalSearch(result, search),
      );
    } else if (discoveryResult.status === "failed") {
      externalDiscoveryError =
        "A fonte externa não respondeu agora. O catálogo curado continua disponível normalmente.";
    }
  }

  const hasExternalCoverage = discoverExternal && Boolean(region) && discoveryStatus === "success";
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
    } else if (qualityResult.status === "failed") {
      qualityProviderError =
        "Os sinais de qualidade não responderam agora. A Discovery continua ordenada por proximidade.";
    } else {
      qualityProviderError =
        "O enriquecimento de qualidade está pausado neste ambiente. Os lugares continuam disponíveis por proximidade.";
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
  const enrichedCount = allDiscoveryItems.filter((item) => item.kind === "enriched").length;
  const curatedCount = allDiscoveryItems.filter((item) => item.kind !== "external").length;
  const hasMoreExternalResults =
    hasExternalCoverage && availableExternalCount > visibleExternalCount;
  const hasExpandedExternalResults =
    hasExternalCoverage &&
    showAllExternal &&
    availableExternalCount > externalDiscoveryDisplayLimit;
  const externalMediaItemIds = new Set(
    bootstrapPolicy.media.enabled
      ? ranking.items
          .filter(({ item, signals }) => {
            const hasGovernedMediaSource =
              Boolean(destinationId) || signals?.provider === "google-places";
            if (!hasGovernedMediaSource) return false;
            if (item.kind === "external") return true;
            return !item.place.primaryImage;
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
  const bootstrapCopy = placeBootstrapStageCopy(bootstrapStage);
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
            Explore uma lista única de Lugares. O RouteBook combina conteúdo curado com descobertas
            atuais da região sem mostrar o mesmo lugar duas vezes. Para distância por ruas, duração
            e trânsito, use as ações de rota real.
          </p>
        </div>
      </header>

      <section
        aria-label="Status do guia"
        className={styles.notice}
        data-place-bootstrap-stage={bootstrapStage}
        role="status"
      >
        <strong>{bootstrapCopy.label}</strong>
        <p>{bootstrapCopy.description}</p>
      </section>

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
            {PLACE_CATEGORIES.map((value) => (
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
          Não há uma referência espacial confiável para esta viagem. O RouteBook não inventa centro,
          distância ou cobertura de Discovery.
        </p>
      ) : region.source === "accommodation" ? (
        <p className={styles.notice}>
          Distâncias estimadas em linha reta a partir da hospedagem; não representam rota ou tempo
          de deslocamento.
        </p>
      ) : (
        <p className={styles.notice} role="status">
          Sem hospedagem geocodificada, as distâncias usam a referência aproximada do destino. Elas
          são estimativas em linha reta e não representam rota ou tempo de deslocamento.
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
            <p className="product-eyebrow">Ranking RouteBook</p>
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
              Score RouteBook é derivado de sinais externos verificados e contexto da viagem; não é
              uma nota criada pelo usuário. Rating, popularidade e Provider continuam identificados
              em cada card.
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
              (qualityProvider.status === "configured"
                ? `${qualityProvider.providerLabel} está configurado, mas nenhum sinal foi associado com segurança a esta seleção. O RouteBook não inventa um Top.`
                : qualityProvider.status === "missing-secret"
                  ? `${qualityProvider.providerLabel} foi selecionado, mas a credencial ainda não está provisionada. Até lá, somente Mais próximos é real.`
                  : qualityProvider.status === "invalid-provider"
                    ? "A configuração do Provider de qualidade é inválida. O ranking permanece por proximidade."
                    : "Ranking por avaliação e popularidade aguarda um Provider de qualidade explicitamente configurado. Até lá, somente Mais próximos é exibido como ordenação real.")}
          </p>
        )}
      </section>

      <div className={styles.resultHeading}>
        <div>
          <h2>
            {hasExternalCoverage
              ? `${visibleOptionCount} de ${totalAvailableOptionCount} ${
                  totalAvailableOptionCount === 1 ? "lugar único" : "lugares únicos"
                } exibidos`
              : `${filteredPublishedPlaces.length} ${
                  filteredPublishedPlaces.length === 1 ? "lugar curado" : "lugares curados"
                }`}
          </h2>
          <p>
            {hasExternalCoverage
              ? `${curatedCount} com conteúdo curado do RouteBook · ${enrichedCount} também reconciliados com Overture · ${availableExternalCount} somente na descoberta atual.`
              : "Lista e mapa exibem o mesmo conjunto curado e filtrado."}
          </p>
        </div>
        <Link
          className="product-secondary-action"
          href={discoveryHref(tripId, {
            ...canonicalParams,
            ...(discoverExternal ? { descoberta: "ocultar" } : { descoberta: undefined }),
          })}
        >
          {discoverExternal ? "Ocultar atualização externa" : "Mostrar atualização externa"}
        </Link>
      </div>

      {discoverExternal ? (
        <section aria-label="Cobertura da descoberta" className={styles.discoverySummary}>
          <strong>Um catálogo, identidades únicas</strong>
          <p>
            O RouteBook reconcilia a cobertura do Overture com o catálogo curado antes de montar a
            grade. Quando as duas fontes representam o mesmo Lugar, você vê um único card com
            conteúdo curado e contexto atualizado. A origem continua indicada para rastreabilidade.
          </p>
          <p>
            {externalCandidateCount} candidatos externos foram avaliados. {enrichedCount} Lugares
            visíveis receberam contexto externo e {externalPossibleMatchCount} correspondências
            possíveis foram tratadas de forma conservadora para evitar duplicatas.{" "}
            {externalLinkedCount} referências já possuem vínculo canônico e {externalRejectedCount}{" "}
            candidatos foram rejeitados pela validação da Fonte/categoria.
          </p>
          {promotionStatusMessage ? (
            <p className={styles.notice} role="status">
              {promotionStatusMessage}
            </p>
          ) : null}
          {promotionError ? (
            <p className={styles.notice} role="alert">
              {promotionError}
            </p>
          ) : null}
          {priceRange ? (
            <p className={styles.notice} role="status">
              A fonte externa não fornece a faixa de preço canônica do RouteBook; esse filtro vale
              para Lugares com conteúdo curado e não exclui descobertas externas sem preço.
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
              Mostrar todos os {availableExternalCount} lugares descobertos
            </Link>
          ) : hasExpandedExternalResults ? (
            <Link
              className="product-secondary-action"
              href={discoveryHref(tripId, { ...canonicalParams, descoberta: undefined })}
            >
              Mostrar primeiras {externalDiscoveryDisplayLimit} descobertas externas
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
        description={`Mesmo conjunto da grade: ${visibleOptionCount} identidades únicas, sendo ${discoveryItems.filter((item) => item.kind !== "external").length} com conteúdo curado e ${visibleExternalCount} somente externos. A Hospedagem aparece como referência adicional quando disponível.`}
        emptyDescription="Não há lugar com coordenadas no conjunto filtrado. Limpe ou amplie os filtros para recuperar resultados."
        emptyTitle="Nenhum lugar para exibir no mapa"
        points={mapPoints}
        title={`Mapa dos ${visibleOptionCount} ${visibleOptionCount === 1 ? "lugar" : "lugares"} exibidos`}
      />
    </section>
  );
}
