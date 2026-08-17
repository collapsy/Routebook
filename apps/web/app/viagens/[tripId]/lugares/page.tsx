import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzlePlaceExternalReferenceRepository,
  DrizzlePlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import {
  PLACE_CATEGORIES,
  PLACE_PRICE_RANGES,
  listPublishedPlaces,
  reconcileExternalPlaceCandidate,
  type ExternalPlaceReconciliation,
} from "@routebook/place-catalog";
import { findTripById } from "@routebook/trip-management";

import { PlacePrimaryImage } from "../../../../components/place-primary-image";
import { TripMap } from "../../../../components/trip-map";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsSearchUrl,
} from "../../../../lib/google-maps-links";
import {
  buildPlaceDiscoveryFeed,
  type ExternalPlaceDiscoveryItem,
  type PublishedPlaceDiscoveryItem,
} from "../../../../lib/place-discovery-feed";
import type { TripMapPoint } from "../../../../lib/trip-map";
import { OverturePmtilesPlaceSearchAdapter } from "../../../../lib/overture-place-search";
import { promoteExternalPlaceAction } from "./actions";
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
  description: "Explore lugares publicados do destino da sua viagem.",
};

type DiscoverySearchParams = {
  busca?: string;
  categoria?: string;
  distancia?: string;
  preco?: string;
  descoberta?: string | undefined;
  promocao?: string;
  erroPromocao?: string;
};

const distanceOptions = [1, 3, 5, 10] as const;
const pipaDiscoveryCenter = { latitude: -6.24, longitude: -35.065 } as const;
const externalDiscoveryRadiusMeters = 8_000;
const externalDiscoveryScanLimit = 200;
const externalDiscoveryDisplayLimit = 60;

function resolveDestinationId(destinationName: string): string | null {
  const normalized = destinationName.trim().toLocaleLowerCase("pt-BR");
  return normalized.includes("pipa") ? "pipa-rn-br" : null;
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

function PublishedDiscoveryCard({
  item,
  tripId,
  distanceReferenceLabel,
  accommodationCoordinate,
}: Readonly<{
  item: PublishedPlaceDiscoveryItem;
  tripId: string;
  distanceReferenceLabel: string;
  accommodationCoordinate?: Readonly<{ latitude: number; longitude: number }>;
}>) {
  const { place, distanceMeters } = item;
  const coordinate = { latitude: place.latitude, longitude: place.longitude };
  const mapsSearchUrl = buildGoogleMapsSearchUrl({
    name: place.name,
    addressLabel: place.addressLabel,
    coordinate,
  });

  return (
    <li data-place-source="published">
      <PlacePrimaryImage
        category={place.category}
        placeName={place.name}
        primaryImage={place.primaryImage}
      />
      <div className={styles.cardIdentity}>
        <span>{categoryLabels[place.category]}</span>
        <strong className={`${styles.sourceBadge} ${styles.publishedSource}`}>
          Publicado no RouteBook
        </strong>
      </div>
      <strong>{place.name}</strong>
      <p>{place.summary}</p>
      <small>{place.addressLabel ?? "Endereço ainda não informado"}</small>
      <small>
        Faixa de preço aproximada:{" "}
        {place.priceRange ? priceRangeLabels[place.priceRange] : "indisponível"}
      </small>
      <small>
        {formatDistance(distanceMeters)} em linha reta {distanceReferenceLabel}
      </small>
      <div className={styles.cardActions}>
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
        {accommodationCoordinate ? (
          <a
            className="product-secondary-action"
            href={buildGoogleMapsDirectionsUrl({
              origin: accommodationCoordinate,
              destination: coordinate,
              travelMode: "walking",
            })}
            rel="noreferrer"
            target="_blank"
          >
            Calcular rota real
          </a>
        ) : null}
      </div>
    </li>
  );
}

function ExternalDiscoveryCard({
  item,
  tripId,
  distanceReferenceLabel,
  accommodationCoordinate,
  search,
  category,
  maximumDistanceMeters,
  priceRange,
}: Readonly<{
  item: ExternalPlaceDiscoveryItem;
  tripId: string;
  distanceReferenceLabel: string;
  accommodationCoordinate?: Readonly<{ latitude: number; longitude: number }>;
  search?: string;
  category?: (typeof PLACE_CATEGORIES)[number];
  maximumDistanceMeters?: number;
  priceRange?: (typeof PLACE_PRICE_RANGES)[number];
}>) {
  const { candidate, distanceMeters } = item;
  const coordinate = { latitude: candidate.latitude, longitude: candidate.longitude };
  const categoryLabel = candidate.category
    ? categoryLabels[candidate.category]
    : providerCategoryLabel(candidate.providerCategory);

  return (
    <li data-place-source="external">
      <PlacePrimaryImage category={candidate.category} placeName={candidate.name} />
      <div className={styles.cardIdentity}>
        <span>{categoryLabel}</span>
        <strong className={`${styles.sourceBadge} ${styles.externalSource}`}>
          Descoberta externa
        </strong>
      </div>
      <strong>{candidate.name}</strong>
      <p>{candidate.addressLabel ?? "Endereço não informado pela fonte"}</p>
      <small>Categoria na origem: {providerCategoryLabel(candidate.providerCategory)}</small>
      <small>
        {formatDistance(distanceMeters)} em linha reta {distanceReferenceLabel}
      </small>
      <small>Fonte: Overture · licença da origem: {candidate.sourceLicense}</small>
      <small>Candidato externo — ainda não publicado no RouteBook</small>
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
        {accommodationCoordinate ? (
          <a
            className="product-secondary-action"
            href={buildGoogleMapsDirectionsUrl({
              origin: accommodationCoordinate,
              destination: coordinate,
              travelMode: "walking",
            })}
            rel="noreferrer"
            target="_blank"
          >
            Calcular rota real
          </a>
        ) : null}
      </div>
      <form action={promoteExternalPlaceAction} className={styles.promotionForm}>
        <input name="tripId" type="hidden" value={tripId} />
        <input name="externalId" type="hidden" value={candidate.externalId} />
        {search ? <input name="busca" type="hidden" value={search} /> : null}
        {category ? <input name="categoria" type="hidden" value={category} /> : null}
        {maximumDistanceMeters ? (
          <input name="distancia" type="hidden" value={String(maximumDistanceMeters / 1_000)} />
        ) : null}
        {priceRange ? <input name="preco" type="hidden" value={priceRange} /> : null}
        <button className="product-secondary-action" type="submit">
          Enviar para curadoria
        </button>
      </form>
      <small>
        A ação cria um draft para revisão; não publica, não salva na viagem e não adiciona ao
        roteiro.
      </small>
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

  const destinationId = resolveDestinationId(trip.destination.name);
  const rawFilters = await searchParams;
  const search = rawFilters.busca?.trim().slice(0, 120) || undefined;
  const category = parsePlaceCategory(rawFilters.categoria);
  const priceRange = parsePlacePriceRange(rawFilters.preco);
  const discoverExternal = rawFilters.descoberta !== "ocultar";
  const promotionStatusMessage = promotionMessage(rawFilters.promocao);
  const promotionError = promotionErrorMessage(rawFilters.erroPromocao);
  const accommodationCoordinate = trip.accommodation?.coordinate;
  const maximumDistanceMeters = accommodationCoordinate
    ? parseMaximumDistance(rawFilters.distancia)
    : undefined;
  const publishedPlaces = destinationId
    ? await listPublishedPlaces(new DrizzlePlaceRepository(), destinationId)
    : [];
  const filteredPlaces = filterPlaces(
    publishedPlaces,
    {
      ...(search ? { search } : {}),
      ...(category ? { category } : {}),
      ...(priceRange ? { priceRange } : {}),
      ...(maximumDistanceMeters ? { maximumDistanceMeters } : {}),
    },
    accommodationCoordinate,
  );
  const canonicalParams: DiscoverySearchParams = {
    ...(search ? { busca: search } : {}),
    ...(category ? { categoria: category } : {}),
    ...(maximumDistanceMeters ? { distancia: String(maximumDistanceMeters / 1_000) } : {}),
    ...(priceRange ? { preco: priceRange } : {}),
    ...(!discoverExternal ? { descoberta: "ocultar" } : {}),
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
    ...(maximumDistanceMeters
      ? [
          {
            key: "distancia" as const,
            label: `Até ${maximumDistanceMeters / 1_000} km da hospedagem`,
          },
        ]
      : []),
    ...(priceRange
      ? [{ key: "preco" as const, label: `Preço: ${priceRangeLabels[priceRange]}` }]
      : []),
  ];
  let externalResults: ExternalPlaceReconciliation[] = [];
  let externalPossibleMatchCount = 0;
  let externalLinkedCount = 0;
  let externalDiscoveryError: string | undefined;
  const discoveryCenter = accommodationCoordinate ?? pipaDiscoveryCenter;

  if (discoverExternal && destinationId) {
    try {
      const radiusMeters = Math.min(
        maximumDistanceMeters ?? externalDiscoveryRadiusMeters,
        externalDiscoveryRadiusMeters,
      );
      const [references, candidates] = await Promise.all([
        new DrizzlePlaceExternalReferenceRepository().listByDestination(destinationId),
        new OverturePmtilesPlaceSearchAdapter().search({
          destinationId,
          center: discoveryCenter,
          radiusMeters,
          ...(category ? { categories: [category] } : {}),
          limit: externalDiscoveryScanLimit,
        }),
      ]);
      const reconciliations = candidates.map((candidate) =>
        reconcileExternalPlaceCandidate(candidate, publishedPlaces, references),
      );

      externalPossibleMatchCount = reconciliations.filter(
        (result) => result.status === "possible_match",
      ).length;
      externalLinkedCount = reconciliations.filter((result) => result.status === "linked").length;
      externalResults = reconciliations
        .filter((result) => result.status === "new")
        .filter((result) => matchesExternalSearch(result, search))
        .slice(0, externalDiscoveryDisplayLimit);
      console.info("[place-discovery] Overture reconciliation completed", {
        tripId,
        destinationId,
        radiusMeters,
        publishedCount: publishedPlaces.length,
        candidateCount: candidates.length,
        newCandidateCount: reconciliations.filter((result) => result.status === "new").length,
        possibleMatchCount: externalPossibleMatchCount,
        linkedCount: externalLinkedCount,
        rejectedCount: reconciliations.filter((result) => result.status === "rejected").length,
        visibleExternalCount: externalResults.length,
      });
    } catch (error) {
      console.error("Falha ao descobrir Places externos via Overture", error);
      externalDiscoveryError =
        "A fonte externa não respondeu agora. O catálogo publicado continua disponível normalmente.";
    }
  }

  const hasExternalCoverage = discoverExternal && !externalDiscoveryError;
  const discoveryItems = buildPlaceDiscoveryFeed({
    publishedPlaces: filteredPlaces.map(({ place }) => place),
    externalCandidates: hasExternalCoverage
      ? externalResults.map((result) => result.candidate)
      : [],
    reference: discoveryCenter,
  });
  const visibleOptionCount = discoveryItems.length;
  const mapPoints: TripMapPoint[] = discoveryItems.map((item) => {
    if (item.kind === "published") {
      return {
        id: item.id,
        label: item.place.name,
        kind: "published-place",
        latitude: item.place.latitude,
        longitude: item.place.longitude,
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
  const distanceReferenceLabel = accommodationCoordinate ? "da hospedagem" : "do centro de Pipa";

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
            Compare o catálogo curado com descobertas recentes da região. Com Hospedagem
            geocodificada, a lista prioriza os Lugares mais próximos pela distância geodésica em
            linha reta. Para distância por ruas, duração e trânsito, use as ações de rota real.
          </p>
        </div>
      </header>

      <form action={`/viagens/${tripId}/lugares`} className={styles.filters} method="get">
        {!discoverExternal ? <input name="descoberta" type="hidden" value="ocultar" /> : null}
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
            disabled={!accommodationCoordinate}
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

      {!accommodationCoordinate ? (
        <p className={styles.notice} role="status">
          O filtro de distância fica disponível após informar a localização da hospedagem.
        </p>
      ) : (
        <p className={styles.notice}>
          Distâncias estimadas em linha reta a partir da hospedagem; não representam rota ou tempo
          de deslocamento.
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
            href={discoveryHref(tripId, !discoverExternal ? { descoberta: "ocultar" } : {})}
          >
            Limpar filtros
          </Link>
        </section>
      ) : null}

      <div className={styles.resultHeading}>
        <div>
          <h2>
            {hasExternalCoverage
              ? `${visibleOptionCount} ${visibleOptionCount === 1 ? "opção" : "opções"} para explorar`
              : `${filteredPlaces.length} ${
                  filteredPlaces.length === 1 ? "lugar publicado" : "lugares publicados"
                }`}
          </h2>
          <p>
            {hasExternalCoverage
              ? `${filteredPlaces.length} ${
                  filteredPlaces.length === 1 ? "lugar publicado" : "lugares publicados"
                } no RouteBook + ${externalResults.length} ${
                  externalResults.length === 1 ? "descoberta atualizada" : "descobertas atualizadas"
                } no Overture.`
              : "Lista e mapa exibem o mesmo conjunto publicado e filtrado."}
          </p>
        </div>
        <Link
          className="product-secondary-action"
          href={discoveryHref(tripId, {
            ...canonicalParams,
            ...(discoverExternal ? { descoberta: "ocultar" } : { descoberta: undefined }),
          })}
        >
          {discoverExternal ? "Ocultar descobertas atualizadas" : "Mostrar descobertas atualizadas"}
        </Link>
      </div>

      {discoverExternal ? (
        <section aria-label="Cobertura da descoberta" className={styles.discoverySummary}>
          <strong>Uma grade, duas fontes claramente identificadas</strong>
          <p>
            Places publicados e descobertas Overture aparecem juntos por proximidade. Cada card e
            marcador informa sua origem; candidato externo continua fora do catálogo até passar por
            curadoria e publicação.
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
              somente para o catálogo publicado.
            </p>
          ) : null}
          {externalDiscoveryError ? (
            <p className={styles.notice} role="status">
              {externalDiscoveryError}
            </p>
          ) : externalResults.length > 0 ? (
            <p>
              {externalResults.length} candidatos novos participam da grade.{" "}
              {externalPossibleMatchCount} possíveis correspondências foram retidas para evitar
              duplicatas e {externalLinkedCount} já possuem vínculo canônico.
            </p>
          ) : (
            <p role="status">
              Nenhum candidato novo corresponde ao recorte atual. Lugares já vinculados ou com
              possível duplicidade não são reapresentados como novos.
            </p>
          )}
        </section>
      ) : null}

      {discoveryItems.length > 0 ? (
        <ul className={`${styles.optionsGrid} trip-days-grid`} aria-label="Opções de lugares">
          {discoveryItems.map((item) =>
            item.kind === "published" ? (
              <PublishedDiscoveryCard
                key={item.id}
                distanceReferenceLabel={distanceReferenceLabel}
                item={item}
                tripId={tripId}
                {...(accommodationCoordinate ? { accommodationCoordinate } : {})}
              />
            ) : (
              <ExternalDiscoveryCard
                key={item.id}
                distanceReferenceLabel={distanceReferenceLabel}
                item={item}
                tripId={tripId}
                {...(accommodationCoordinate ? { accommodationCoordinate } : {})}
                {...(search ? { search } : {})}
                {...(category ? { category } : {})}
                {...(maximumDistanceMeters ? { maximumDistanceMeters } : {})}
                {...(priceRange ? { priceRange } : {})}
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
        description="O mapa usa exatamente as opções visíveis na lista, distinguindo Places publicados de descobertas externas. A hospedagem aparece como referência quando disponível."
        emptyDescription="Não há lugar com coordenadas no conjunto filtrado. Limpe ou amplie os filtros para recuperar resultados."
        emptyTitle="Nenhum lugar para exibir no mapa"
        points={mapPoints}
        title="Mapa dos lugares filtrados"
      />
    </section>
  );
}
