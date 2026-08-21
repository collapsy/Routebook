import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { calculateDistanceMeters, type PlaceCategory, type PlacePriceRange } from "@routebook/place-catalog";
import {
  getPlaceExternalReferenceRepository,
  getPlaceRepository,
  getSavedPlaceRepository,
  getTripRepository,
} from "@routebook/database";

import { ExternalPlaceImagePreview } from "../../../components/external-place-image-preview";
import { PlacePrimaryImage } from "../../../components/place-primary-image";
import { TripMap, type TripMapPoint } from "../../../components/trip-map";
import { requireAuthenticatedTripAccess } from "../../../lib/auth-experience";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsPlaceLabel,
  buildGoogleMapsSearchUrl,
} from "../../../lib/google-maps-links";
import { searchOverturePlaces } from "../../../lib/overture-place-search";
import {
  buildPlaceDiscoveryFeed,
  type EnrichedPlaceDiscoveryItem,
  type ExternalPlaceDiscoveryItem,
  type PublishedPlaceDiscoveryItem,
} from "../../../lib/place-discovery-feed";
import { promoteExternalPlaceAction, removePublishedPlaceAction, savePublishedPlaceAction } from "./actions";
import { formatDistance } from "./distance";
import {
  buildPlaceDiscoveryFilterHref,
  parsePlaceDiscoveryFilters,
  type PlaceDiscoveryFilters,
} from "./filters";
import styles from "./place-discovery.module.css";

const categoryLabels: Record<PlaceCategory, string> = {
  beach: "Praia",
  gastronomy: "Gastronomia",
  nightlife: "Vida noturna",
  nature: "Natureza",
  attraction: "Atração",
};

const priceRangeLabels: Record<PlacePriceRange, string> = {
  free: "Grátis",
  budget: "Econômico",
  moderate: "Moderado",
  premium: "Premium",
};

const externalDiscoveryDisplayLimit = 60;
const externalDiscoveryFetchLimit = 200;

function isSupportedPipaDestination(destinationId: string | undefined): boolean {
  return destinationId === "pipa-rn";
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function matchesExternalSearch(
  reconciliation: Awaited<ReturnType<typeof searchOverturePlaces>>[number],
  search: string | undefined,
): boolean {
  if (!search) return true;
  const normalizedSearch = normalizeSearch(search);
  const { candidate } = reconciliation;
  return [candidate.name, candidate.addressLabel, candidate.providerCategory]
    .filter((value): value is string => Boolean(value))
    .some((value) => normalizeSearch(value).includes(normalizedSearch));
}

function mapPriceFilterToExternal(priceRange: PlacePriceRange | undefined): boolean {
  return priceRange === undefined;
}

function mapPlaceCategoryToExternal(category: PlaceCategory | undefined): PlaceCategory | undefined {
  return category;
}

function discoveryErrorMessage(value?: string): string | undefined {
  switch (value) {
    case "indisponivel":
      return "A descoberta atualizada está temporariamente indisponível. O catálogo curado continua acessível.";
    default:
      return undefined;
  }
}

function promotionStatusMessage(value?: string): string | undefined {
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

type CanonicalDiscoveryItem = PublishedPlaceDiscoveryItem | EnrichedPlaceDiscoveryItem;

function CanonicalDiscoveryCard({
  item,
  tripId,
  destinationId,
  distanceReferenceLabel,
  accommodationCoordinate,
  isSaved,
}: Readonly<{
  item: CanonicalDiscoveryItem;
  tripId: string;
  destinationId?: string;
  distanceReferenceLabel: string;
  accommodationCoordinate?: Readonly<{ latitude: number; longitude: number }>;
  isSaved: boolean;
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
      data-place-name={place.name}
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
          latitude={candidate.latitude}
          longitude={candidate.longitude}
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
      data-place-name={candidate.name}
      data-place-source="external"
      data-place-state="external"
    >
      <ExternalPlaceImagePreview
        category={candidate.category}
        destinationId={destinationId}
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
    </li>
  );
}

export default async function PlacesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { tripId } = await params;
  const rawSearchParams = await searchParams;
  const access = await requireAuthenticatedTripAccess(tripId);
  if (!access) redirect("/entrar");
  const trip = await getTripRepository().findById(tripId);
  if (!trip) notFound();

  const parsedFilters = parsePlaceDiscoveryFilters(rawSearchParams);
  const destinationId = trip.destinationId;
  const hasExternalCoverage = isSupportedPipaDestination(destinationId);
  const showExternal = parsedFilters.discoveryMode !== "ocultar";
  const showAllExternal = parsedFilters.discoveryMode === "todas";
  const accommodationCoordinate =
    trip.accommodationLatitude !== undefined && trip.accommodationLongitude !== undefined
      ? {
          latitude: trip.accommodationLatitude,
          longitude: trip.accommodationLongitude,
        }
      : undefined;
  const destinationCoordinate =
    trip.destinationLatitude !== undefined && trip.destinationLongitude !== undefined
      ? { latitude: trip.destinationLatitude, longitude: trip.destinationLongitude }
      : undefined;
  const distanceReference = accommodationCoordinate ?? destinationCoordinate;
  const distanceReferenceLabel = accommodationCoordinate
    ? "da hospedagem"
    : destinationCoordinate
      ? "do destino"
      : "da referência disponível";

  const placeRepository = getPlaceRepository();
  const savedPlaceRepository = getSavedPlaceRepository();
  const placeReferenceRepository = getPlaceExternalReferenceRepository();
  const publishedPlaces = await placeRepository.listPublishedByDestination(destinationId);
  const savedPlaces = await savedPlaceRepository.listByTripId(tripId);
  const savedPlaceIds = new Set(savedPlaces.map((savedPlace) => savedPlace.placeId));

  const filters: PlaceDiscoveryFilters = parsedFilters.filters;
  const publishedFilteredPlaces = publishedPlaces
    .filter((place) => !filters.search || normalizeSearch(place.name).includes(normalizeSearch(filters.search)))
    .filter((place) => !filters.category || place.category === filters.category)
    .filter((place) => !filters.priceRange || place.priceRange === filters.priceRange)
    .filter((place) => {
      if (!filters.maximumDistanceMeters || !distanceReference) return true;
      return calculateDistanceMeters(distanceReference, place) <= filters.maximumDistanceMeters;
    });

  let externalCandidateCount = 0;
  let externalPossibleMatchCount = 0;
  let externalLinkedCount = 0;
  let externalRejectedCount = 0;
  let externalReconciliations: Awaited<ReturnType<typeof searchOverturePlaces>> = [];
  let externalDiscoveryError = discoveryErrorMessage(
    typeof rawSearchParams.descobertaErro === "string" ? rawSearchParams.descobertaErro : undefined,
  );

  if (hasExternalCoverage && showExternal && distanceReference && mapPriceFilterToExternal(filters.priceRange)) {
    try {
      const references = await placeReferenceRepository.listByDestination(destinationId);
      const reconciliations = await searchOverturePlaces({
        destinationId,
        center: distanceReference,
        radiusMeters: Math.min(filters.maximumDistanceMeters ?? 8_000, 8_000),
        category: mapPlaceCategoryToExternal(filters.category),
        limit: externalDiscoveryFetchLimit,
        publishedPlaces,
        references,
      });
      externalCandidateCount = reconciliations.length;
      externalPossibleMatchCount = reconciliations.filter(
        (result) => result.status === "possible_match",
      ).length;
      externalLinkedCount = reconciliations.filter((result) => result.status === "linked").length;
      externalRejectedCount = reconciliations.filter(
        (result) => result.status === "rejected",
      ).length;
      externalReconciliations = reconciliations.filter(
        (result) => result.status !== "new" || matchesExternalSearch(result, filters.search),
      );
    } catch {
      externalDiscoveryError =
        "A descoberta atualizada está temporariamente indisponível. O catálogo curado continua acessível.";
    }
  }

  const feedInput = {
    publishedPlaces: publishedFilteredPlaces,
    externalReconciliations,
    reference: distanceReference ?? { latitude: -6.2302, longitude: -35.0503 },
  };
  const allDiscoveryItems = buildPlaceDiscoveryFeed(feedInput);
  const discoveryItems = showAllExternal
    ? allDiscoveryItems
    : buildPlaceDiscoveryFeed({ ...feedInput, externalLimit: externalDiscoveryDisplayLimit });
  const visibleOptionCount = discoveryItems.length;
  const totalAvailableOptionCount = allDiscoveryItems.length;
  const availableExternalCount = allDiscoveryItems.filter((item) => item.kind === "external").length;
  const visibleExternalCount = discoveryItems.filter((item) => item.kind === "external").length;
  const enrichedCount = allDiscoveryItems.filter((item) => item.kind === "enriched").length;
  const curatedCount = allDiscoveryItems.filter((item) => item.kind !== "external").length;
  const hasMoreExternalResults = hasExternalCoverage && availableExternalCount > visibleExternalCount;
  const hasExpandedExternalResults =
    hasExternalCoverage && showAllExternal && availableExternalCount > externalDiscoveryDisplayLimit;
  const mapPoints: TripMapPoint[] = discoveryItems.map((item) => {
    if (item.kind !== "external") {
      const coordinate =
        item.kind === "enriched"
          ? { latitude: item.candidate.latitude, longitude: item.candidate.longitude }
          : { latitude: item.place.latitude, longitude: item.place.longitude };
      return {
        id: item.id,
        kind: "published" as const,
        name: item.place.name,
        coordinate,
        href: `/viagens/${tripId}/lugares/${item.place.slug}`,
      };
    }
    return {
      id: item.id,
      kind: "external" as const,
      name: item.candidate.name,
      coordinate: { latitude: item.candidate.latitude, longitude: item.candidate.longitude },
    };
  });

  const promotionStatusMessageValue = promotionStatusMessage(
    typeof rawSearchParams.promocao === "string" ? rawSearchParams.promocao : undefined,
  );
  const promotionErrorMessageValue = promotionErrorMessage(
    typeof rawSearchParams.promocaoErro === "string" ? rawSearchParams.promocaoErro : undefined,
  );

  const activeFilterHref = (patch: Partial<PlaceDiscoveryFilters>) =>
    buildPlaceDiscoveryFilterHref(`/viagens/${tripId}/lugares`, filters, patch);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Descoberta de Lugares</span>
          <h1>Lugares em {trip.destinationName}</h1>
          <p>
            Explore um catálogo único por identidade. Overture amplia a cobertura atual e o
            RouteBook enriquece os Lugares reconhecidos com conteúdo curado e ações de planejamento.
          </p>
        </div>
        <Link className="product-secondary-action" href={`/viagens/${tripId}`}>
          Voltar à viagem
        </Link>
      </section>

      {externalDiscoveryError ? (
        <p className={styles.notice} role="status">
          {externalDiscoveryError}
        </p>
      ) : null}

      {promotionStatusMessageValue ? (
        <p className={styles.notice} role="status">
          {promotionStatusMessageValue}
        </p>
      ) : null}

      {promotionErrorMessageValue ? (
        <p className={styles.errorNotice} role="alert">
          {promotionErrorMessageValue}
        </p>
      ) : null}

      <section className={styles.controls}>
        <form className={styles.filters} method="get">
          <label>
            Nome ou termo
            <input defaultValue={filters.search ?? ""} name="busca" type="search" />
          </label>
          <label>
            Categoria
            <select defaultValue={filters.category ?? ""} name="categoria">
              <option value="">Todas</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Distância máxima
            <select
              defaultValue={filters.maximumDistanceMeters ? String(filters.maximumDistanceMeters / 1_000) : ""}
              disabled={!distanceReference}
              name="distancia"
            >
              <option value="">Qualquer distância</option>
              <option value="1">Até 1 km</option>
              <option value="3">Até 3 km</option>
              <option value="5">Até 5 km</option>
              <option value="8">Até 8 km</option>
            </select>
          </label>
          <label>
            Faixa de preço
            <select defaultValue={filters.priceRange ?? ""} name="preco">
              <option value="">Qualquer preço</option>
              {Object.entries(priceRangeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {showAllExternal ? <input name="descoberta" type="hidden" value="todas" /> : null}
          <button className="product-primary-action" type="submit">
            Aplicar filtros
          </button>
        </form>

        {!distanceReference ? (
          <p className={styles.filterHint}>
            O filtro de distância fica disponível quando a viagem possui coordenadas da hospedagem
            ou do destino.
          </p>
        ) : (
          <p className={styles.filterHint}>
            Distâncias estimadas em linha reta {distanceReferenceLabel}; não representam rota ou
            tempo de deslocamento.
          </p>
        )}

        {filters.search || filters.category || filters.maximumDistanceMeters || filters.priceRange ? (
          <div aria-label="Filtros ativos" className={styles.activeFilters}>
            {filters.search ? (
              <Link href={activeFilterHref({ search: undefined })}>
                Busca: {filters.search} · Remover filtro
              </Link>
            ) : null}
            {filters.category ? (
              <Link href={activeFilterHref({ category: undefined })}>
                Categoria: {categoryLabels[filters.category]} · Remover filtro
              </Link>
            ) : null}
            {filters.maximumDistanceMeters ? (
              <Link href={activeFilterHref({ maximumDistanceMeters: undefined })}>
                Distância: até {filters.maximumDistanceMeters / 1_000} km · Remover filtro
              </Link>
            ) : null}
            {filters.priceRange ? (
              <Link href={activeFilterHref({ priceRange: undefined })}>
                Preço: {priceRangeLabels[filters.priceRange]} · Remover filtro
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className={styles.summary}>
        <div>
          <span className={styles.eyebrow}>Um catálogo, identidades únicas</span>
          <h2>
            {showExternal && hasExternalCoverage
              ? `${visibleOptionCount} de ${totalAvailableOptionCount} lugar${totalAvailableOptionCount === 1 ? " único" : "es únicos"} exibidos`
              : `${curatedCount} lugar${curatedCount === 1 ? " curado" : "es curados"}`}
          </h2>
          <p>
            {showExternal && hasExternalCoverage
              ? `${curatedCount} com conteúdo curado do RouteBook; ${enrichedCount} também reconciliados com Overture; ${availableExternalCount} somente na descoberta atual.`
              : "Lista e mapa exibem o mesmo conjunto curado e filtrado."}
          </p>
        </div>
        {showExternal && hasExternalCoverage ? (
          <Link
            className="product-secondary-action"
            href={buildPlaceDiscoveryFilterHref(`/viagens/${tripId}/lugares`, filters, {
              discoveryMode: "ocultar",
            })}
          >
            Ocultar atualização externa
          </Link>
        ) : hasExternalCoverage ? (
          <Link
            className="product-secondary-action"
            href={buildPlaceDiscoveryFilterHref(`/viagens/${tripId}/lugares`, filters, {
              discoveryMode: undefined,
            })}
          >
            Mostrar atualização externa
          </Link>
        ) : null}
      </section>

      {showExternal && hasExternalCoverage ? (
        <section className={styles.discoveryStatus} aria-label="Proveniência da descoberta">
          <p>
            {externalCandidateCount} candidatos externos foram avaliados. {enrichedCount} Lugares
            visíveis receberam contexto externo e {externalPossibleMatchCount} correspondências
            possíveis foram tratadas de forma conservadora para evitar duplicatas. {externalLinkedCount}{" "}
            referências já possuem vínculo canônico e {externalRejectedCount} candidatos foram
            rejeitados pela validação da Fonte/categoria.
          </p>
        </section>
      ) : null}

      <TripMap points={mapPoints} accommodation={accommodationCoordinate} />

      <section className={styles.catalog}>
        {discoveryItems.length > 0 ? (
          <>
            <ul aria-label="Opções de lugares" className={styles.grid}>
              {discoveryItems.map((item) =>
                item.kind === "external" ? (
                  <ExternalDiscoveryCard
                    key={item.id}
                    accommodationCoordinate={accommodationCoordinate}
                    category={filters.category}
                    destinationId={destinationId}
                    discoveryMode={filters.discoveryMode}
                    distanceReferenceLabel={distanceReferenceLabel}
                    item={item}
                    maximumDistanceMeters={filters.maximumDistanceMeters}
                    priceRange={filters.priceRange}
                    search={filters.search}
                    tripId={tripId}
                  />
                ) : (
                  <CanonicalDiscoveryCard
                    key={item.id}
                    accommodationCoordinate={accommodationCoordinate}
                    destinationId={destinationId}
                    distanceReferenceLabel={distanceReferenceLabel}
                    isSaved={savedPlaceIds.has(item.place.id)}
                    item={item}
                    tripId={tripId}
                  />
                ),
              )}
            </ul>
            {hasMoreExternalResults ? (
              <Link
                className="product-secondary-action"
                href={buildPlaceDiscoveryFilterHref(`/viagens/${tripId}/lugares`, filters, {
                  discoveryMode: "todas",
                })}
              >
                Mostrar todos os {availableExternalCount} lugares descobertos
              </Link>
            ) : null}
            {hasExpandedExternalResults ? (
              <Link
                className="product-secondary-action"
                href={buildPlaceDiscoveryFilterHref(`/viagens/${tripId}/lugares`, filters, {
                  discoveryMode: undefined,
                })}
              >
                Mostrar primeiras 60 descobertas externas
              </Link>
            ) : null}
          </>
        ) : (
          <div className={styles.emptyState}>
            <h2>Nenhum lugar corresponde aos filtros</h2>
            <p>Remova alguns filtros ou amplie a distância para voltar a explorar o catálogo.</p>
            <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
              Limpar filtros
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
