import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecommendationCard } from "@/components/recommendation-card";
import { loadRecommendationDiscoverySuggestions } from "@/lib/recommendation-discovery-suggestions";
import {
  buildFocusedRecommendationPresentation,
  loadRecommendationExperience,
  type RecommendationCardViewModel,
} from "@/lib/recommendation-experience";
import {
  DrizzleItineraryRepository,
  DrizzleTravelerProfileRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { findTravelerProfile } from "@routebook/traveler-profile";
import { createItinerary, findTripById } from "@routebook/trip-management";

import {
  addRecommendationToItineraryAction,
  ignoreRecommendationAction,
  saveRecommendationPlaceAction,
} from "./actions";
import styles from "./recommendations-page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sugestões para a viagem — RouteBook",
  description: "Compare sugestões de lugares e escolha o que faz sentido para a sua viagem.",
};

const errorMessages: Readonly<Record<string, string>> = {
  "recomendacao-nao-encontrada":
    "Não foi possível encontrar esta sugestão. Atualize a lista e tente novamente.",
  "estado-incompativel":
    "Esta sugestão mudou desde que você abriu a página. Atualize a lista e tente novamente.",
  "acao-cross-trip": "Não foi possível concluir esta ação. Volte para a viagem e tente novamente.",
  "lugar-nao-encontrado": "O lugar não foi encontrado ou não está mais disponível.",
  "responsavel-nao-encontrado": "Não foi possível concluir esta ação nesta viagem.",
  "dia-invalido": "Selecione um dia válido da viagem.",
  "conflito-idempotencia": "A página ficou desatualizada. Atualize e tente novamente.",
};

function consideredStateLabels(card: RecommendationCardViewModel): readonly string[] {
  return [
    ...(card.status === "accepted" ? ["Escolha confirmada"] : []),
    ...(card.status === "rejected" ? ["Recomendação ignorada"] : []),
    ...(card.isSaved ? ["Lugar salvo"] : []),
    ...(card.isPlanned ? ["Já está no roteiro"] : []),
  ];
}

function uncoveredDestinationCopy(
  status: Awaited<ReturnType<typeof loadRecommendationDiscoverySuggestions>>["discoveryStatus"],
): Readonly<{ title: string; description: string }> {
  switch (status) {
    case "failed":
      return {
        title: "Não foi possível atualizar os lugares agora",
        description: "Tente novamente mais tarde ou explore os lugares já disponíveis.",
      };
    case "disabled":
      return {
        title: "Novos lugares estão indisponíveis agora",
        description: "Você ainda pode explorar os lugares já disponíveis nesta viagem.",
      };
    case "unavailable":
      return {
        title: "Informe uma localização para receber sugestões",
        description:
          "Adicione uma localização válida do destino ou da hospedagem para encontrar lugares próximos.",
      };
    case "success":
      return {
        title: "Ainda não encontramos opções suficientes nesta região",
        description: "Explore os lugares disponíveis ou tente novamente mais tarde.",
      };
  }
}

export default async function RecommendationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{
    ignorada?: string;
    salva?: string;
    adicionada?: string;
    erro?: string;
    view?: string;
  }>;
}) {
  const { tripId } = await params;
  const { ignorada, salva, adicionada, erro, view } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const itineraryRepository = new DrizzleItineraryRepository();
  const itinerary =
    (await itineraryRepository.findByTripId(tripId)) ??
    (await itineraryRepository.save(createItinerary({ tripId, period: trip.period })));
  const [experience, travelerProfile] = await Promise.all([
    loadRecommendationExperience(tripId),
    findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId),
  ]);

  if (!experience) notFound();

  const discoverySuggestions = await loadRecommendationDiscoverySuggestions(
    trip,
    travelerProfile?.interests ?? [],
  );
  const externalSuggestions = discoverySuggestions.suggestions;
  const hasExternalSuggestions = externalSuggestions.length > 0;
  const uncoveredCopy = uncoveredDestinationCopy(discoverySuggestions.discoveryStatus);
  const errorMessage = erro ? errorMessages[erro] : undefined;
  const itineraryDays = itinerary.days.map((day) => ({ id: day.id, date: day.date }));
  const showAll = view === "all";
  const focusedPresentation = buildFocusedRecommendationPresentation(experience.cards);
  const displayedCards = showAll ? experience.cards : focusedPresentation.focusedCards;
  const hasHiddenCards = focusedPresentation.totalCount > focusedPresentation.focusedCards.length;

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} href={`/viagens/${tripId}`}>
        ← Voltar para a visão da viagem
      </Link>

      {ignorada === "1" ? (
        <p className={styles.success} role="status">
          Sugestão ignorada.
        </p>
      ) : null}

      {salva === "1" ? (
        <p className={styles.success} role="status">
          Lugar salvo. Você pode adicioná-lo ao roteiro quando quiser.
        </p>
      ) : null}

      {adicionada === "1" ? (
        <p className={styles.success} role="status">
          Lugar adicionado ao dia escolhido.
        </p>
      ) : null}

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <header className={styles.heading}>
        <p className={styles.eyebrow}>Ideias para decidir</p>
        <h1>Sugestões para {experience.trip.name}</h1>
        <p>
          Compare opções sugeridas a partir do que você informou e dos lugares disponíveis na
          região.
        </p>
      </header>

      {!experience.destinationSupported && !hasExternalSuggestions ? (
        <section className={styles.empty}>
          <h2>{uncoveredCopy.title}</h2>
          <p>{uncoveredCopy.description}</p>
          <Link className={styles.contextLink} href={`/viagens/${tripId}/lugares`}>
            Explorar lugares desta viagem
          </Link>
        </section>
      ) : null}

      {experience.destinationSupported && experience.hasContextLimitations ? (
        <section className={styles.notice} aria-labelledby="partial-context-heading">
          <h2 id="partial-context-heading">Algumas preferências não puderam ser consideradas</h2>
          <p>
            As sugestões continuam disponíveis, mas podem ficar menos personalizadas. Revise suas
            preferências para melhorar a seleção.
          </p>
          <Link className={styles.contextLink} href={`/viagens/${tripId}/contexto`}>
            Revisar preferências
          </Link>
        </section>
      ) : null}

      {experience.invalidatedCount > 0 ? (
        <p className={styles.notice} role="status">
          As informações da viagem mudaram. Atualizamos a lista de sugestões.
        </p>
      ) : null}

      {discoverySuggestions.discoveryStatus === "failed" && experience.cards.length > 0 ? (
        <p className={styles.notice} role="status">
          Não foi possível buscar novos lugares agora. As sugestões já disponíveis continuam
          acessíveis.
        </p>
      ) : null}

      {experience.destinationSupported && experience.cards.length === 0 && !hasExternalSuggestions ? (
        <section className={styles.empty}>
          <h2>Nenhuma sugestão disponível agora</h2>
          <p>Explore os lugares da viagem ou revise suas preferências para encontrar outras opções.</p>
        </section>
      ) : null}

      {experience.cards.length > 0 ? (
        <>
          <section className={styles.summary} aria-labelledby="recommendation-summary-heading">
            <h2 id="recommendation-summary-heading">
              {showAll ? "Todas as sugestões" : "Sugestões para decidir agora"}
            </h2>
            {showAll ? (
              <p>Exibindo todas as {experience.cards.length} sugestões.</p>
            ) : (
              <p>
                Mostrando {focusedPresentation.focusedCards.length} de {experience.cards.length}{" "}
                sugestões para começar.
                {focusedPresentation.remainingPendingCount > 0
                  ? ` Há ${focusedPresentation.remainingPendingCount} outra${focusedPresentation.remainingPendingCount === 1 ? "" : "s"} sugestão${focusedPresentation.remainingPendingCount === 1 ? "" : "ões"} ainda pendente${focusedPresentation.remainingPendingCount === 1 ? "" : "s"}.`
                  : ""}
                {focusedPresentation.consideredCards.length > 0
                  ? ` ${focusedPresentation.consideredCards.length} opção${focusedPresentation.consideredCards.length === 1 ? " já foi considerada" : "ões já foram consideradas"} e permanece acessível abaixo.`
                  : ""}
              </p>
            )}
            <p>
              {experience.activeCount} sugestão
              {experience.activeCount === 1 ? " ativa" : "ões ativas"}
              {experience.rejectedCount > 0
                ? ` e ${experience.rejectedCount} ignorada${experience.rejectedCount === 1 ? "" : "s"}`
                : ""}
              . Use os motivos e limitações de cada opção para comparar.
            </p>
            <div className={styles.viewControls} aria-label="Modo de visualização das sugestões">
              {showAll ? (
                <Link className={styles.modeLink} href={`/viagens/${tripId}/recomendacoes`}>
                  Voltar às sugestões focadas
                </Link>
              ) : hasHiddenCards ? (
                <Link
                  className={styles.modeLink}
                  href={`/viagens/${tripId}/recomendacoes?view=all`}
                >
                  Ver todas as sugestões
                </Link>
              ) : null}
            </div>
          </section>

          {!showAll && focusedPresentation.focusedCards.length === 0 ? (
            <section className={styles.empty} aria-labelledby="no-pending-recommendations-heading">
              <h2 id="no-pending-recommendations-heading">Nenhuma sugestão pendente de decisão</h2>
              <p>
                As opções desta lista já foram salvas, planejadas, confirmadas ou ignoradas. Você
                ainda pode revisar o histórico abaixo ou abrir a lista completa.
              </p>
            </section>
          ) : null}

          {displayedCards.length > 0 ? (
            <ol className={styles.list} aria-label="Sugestões de lugares">
              {displayedCards.map((card) => (
                <li key={card.id}>
                  <RecommendationCard
                    addToItineraryAction={addRecommendationToItineraryAction}
                    card={card}
                    ignoreAction={ignoreRecommendationAction}
                    itineraryDays={itineraryDays}
                    saveAction={saveRecommendationPlaceAction}
                    tripId={tripId}
                  />
                </li>
              ))}
            </ol>
          ) : null}

          {!showAll && focusedPresentation.consideredCards.length > 0 ? (
            <section className={styles.considered} aria-labelledby="considered-recommendations-heading">
              <div className={styles.consideredHeading}>
                <div>
                  <h2 id="considered-recommendations-heading">Opções já consideradas</h2>
                  <p>Você pode revisar essas opções ou abrir a lista completa.</p>
                </div>
                <Link
                  className={styles.modeLink}
                  href={`/viagens/${tripId}/recomendacoes?view=all`}
                >
                  Revisar cards completos
                </Link>
              </div>
              <ul className={styles.consideredList} aria-label="Sugestões já consideradas">
                {focusedPresentation.consideredCards.map((card) => (
                  <li className={styles.consideredItem} key={card.id}>
                    <div className={styles.consideredCopy}>
                      <strong>{card.placeName}</strong>
                      <span>{consideredStateLabels(card).join(" · ")}</span>
                    </div>
                    <Link className={styles.contextLink} href={card.detailsHref}>
                      Ver detalhes
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}

      {hasExternalSuggestions ? (
        <section className={styles.externalSuggestions} aria-labelledby="places-to-consider-heading">
          <div className={styles.externalHeading}>
            <div>
              <p className={styles.externalEyebrow}>Lugares da região</p>
              <h2 id="places-to-consider-heading">Lugares para considerar agora</h2>
            </div>
            <p>
              Estas opções consideram seus interesses conhecidos e a proximidade na região da
              viagem.
            </p>
          </div>

          <ol className={styles.externalList} aria-label="Lugares sugeridos">
            {externalSuggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <article className={styles.externalCard} aria-label={suggestion.name}>
                  <div className={styles.externalMeta}>
                    <span>{suggestion.categoryLabel}</span>
                  </div>
                  <div className={styles.externalTitle}>
                    <h3>{suggestion.name}</h3>
                    {suggestion.addressLabel ? <p>{suggestion.addressLabel}</p> : null}
                  </div>
                  <dl className={styles.externalFacts}>
                    <div>
                      <dt>Distância</dt>
                      <dd>{suggestion.geodesicDistanceLabel}</dd>
                    </div>
                    <div>
                      <dt>Fonte</dt>
                      <dd>{suggestion.sourceLabel}</dd>
                    </div>
                  </dl>
                  <div className={styles.externalExplanation}>
                    <strong>Por que apareceu</strong>
                    <ul>
                      {suggestion.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.externalExplanation}>
                    <strong>Limitações</strong>
                    <ul>
                      {suggestion.limitations.map((limitation) => (
                        <li key={limitation}>{limitation}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </li>
            ))}
          </ol>

          <div className={styles.viewControls}>
            <Link className={styles.modeLink} href={`/viagens/${tripId}/lugares`}>
              Explorar todos os lugares
            </Link>
            {discoverySuggestions.availableCount > externalSuggestions.length ? (
              <span className={styles.externalCount}>
                Mostrando {externalSuggestions.length} de {discoverySuggestions.availableCount}{" "}
                lugares encontrados na região.
              </span>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
