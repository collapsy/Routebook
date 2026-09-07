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
  description:
    "Consulte Recommendations canônicas e descobertas externas contextuais, com motivos, limitações e Provenance explícitos.",
};

const errorMessages: Readonly<Record<string, string>> = {
  "recomendacao-nao-encontrada":
    "A Recommendation não foi encontrada nesta Viagem. Atualize a lista e tente novamente.",
  "estado-incompativel":
    "Esta Recommendation não pode mais receber esta ação porque seu estado foi atualizado.",
  "acao-cross-trip": "A ação foi rejeitada porque os dados não pertencem à mesma Viagem.",
  "lugar-nao-encontrado": "O Lugar não foi encontrado ou não está publicado.",
  "responsavel-nao-encontrado": "A Viagem não possui um participante owner persistido.",
  "dia-invalido": "Selecione explicitamente um Dia válido desta Viagem.",
  "conflito-idempotencia": "Esta ação já foi enviada com dados diferentes. Atualize a página.",
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
        title: "Não conseguimos ampliar as sugestões agora",
        description:
          "A fonte externa de lugares ficou indisponível nesta tentativa. Nenhuma opção foi inventada; você pode tentar novamente mais tarde ou explorar os lugares já disponíveis.",
      };
    case "disabled":
      return {
        title: "Descoberta externa indisponível",
        description:
          "Não há Places publicados suficientes para esta região e a descoberta externa está desabilitada neste ambiente.",
      };
    case "unavailable":
      return {
        title: "Ainda falta uma referência espacial",
        description:
          "O RouteBook precisa de uma localização válida do Destino ou da Hospedagem para procurar opções próximas sem inventar precisão.",
      };
    case "success":
      return {
        title: "Ainda não encontramos opções suficientes nesta região",
        description:
          "A busca atual não retornou Places publicados nem descobertas externas seguras para sugerir. Nenhuma categoria ou recomendação foi inventada.",
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
          Recommendation ignorada. O Lugar, suas Preferências e o Roteiro não foram alterados.
        </p>
      ) : null}

      {salva === "1" ? (
        <p className={styles.success} role="status">
          Lugar salvo e escolha registrada. Nenhuma Activity foi criada automaticamente.
        </p>
      ) : null}

      {adicionada === "1" ? (
        <p className={styles.success} role="status">
          Lugar adicionado ao Dia escolhido e Decision persistida com sucesso.
        </p>
      ) : null}

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <header className={styles.heading}>
        <p className={styles.eyebrow}>Decision Intelligence contextual</p>
        <h1>Sugestões para {experience.trip.name}</h1>
        <p>
          Estas sugestões combinam o Contexto da viagem com Places publicados e, quando necessário,
          descobertas externas seguras da região. A leitura nunca salva um Lugar nem altera o
          Roteiro automaticamente.
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
          <h2 id="partial-context-heading">Geração parcial com Contexto incompleto</h2>
          <p>
            As Recommendations canônicas continuam disponíveis, mas alguns critérios não puderam
            participar da ordenação. Cada card identifica suas limitações de forma explícita.
          </p>
          <Link className={styles.contextLink} href={`/viagens/${tripId}/contexto`}>
            Revisar Contexto da viagem
          </Link>
        </section>
      ) : null}

      {experience.invalidatedCount > 0 ? (
        <p className={styles.notice} role="status">
          O Contexto mudou. {experience.invalidatedCount} Recommendation
          {experience.invalidatedCount === 1
            ? " anterior foi invalidada"
            : "s anteriores foram invalidadas"}
          e a lista foi atualizada com os dados atuais.
        </p>
      ) : null}

      {discoverySuggestions.discoveryStatus === "failed" && experience.cards.length > 0 ? (
        <p className={styles.notice} role="status">
          A descoberta externa ficou indisponível nesta tentativa. As Recommendations publicadas
          continuam disponíveis normalmente.
        </p>
      ) : null}

      {experience.destinationSupported && experience.cards.length === 0 && !hasExternalSuggestions ? (
        <section className={styles.empty}>
          <h2>Nenhuma sugestão disponível agora</h2>
          <p>
            Não há Places publicados nem descobertas externas seguras que possam ser apresentados
            pelas regras atuais. Nenhuma alternativa foi criada artificialmente.
          </p>
        </section>
      ) : null}

      {experience.cards.length > 0 ? (
        <>
          <section className={styles.summary} aria-labelledby="recommendation-summary-heading">
            <h2 id="recommendation-summary-heading">
              {showAll ? "Lista completa e explicável" : "Sugestões para decidir agora"}
            </h2>
            {showAll ? (
              <p>
                Exibindo todas as {experience.cards.length} Recommendations canônicas na ordem
                produzida pelo mecanismo determinístico. A interface não recalcula nem reordena essa
                lista.
              </p>
            ) : (
              <p>
                Exibindo {focusedPresentation.focusedCards.length} de {experience.cards.length}{" "}
                Recommendations canônicas como seleção inicial, sempre na ordem original.
                {focusedPresentation.remainingPendingCount > 0
                  ? ` Há ${focusedPresentation.remainingPendingCount} outra${focusedPresentation.remainingPendingCount === 1 ? "" : "s"} sugestão${focusedPresentation.remainingPendingCount === 1 ? "" : "ões"} ainda pendente${focusedPresentation.remainingPendingCount === 1 ? "" : "s"}.`
                  : ""}
                {focusedPresentation.consideredCards.length > 0
                  ? ` ${focusedPresentation.consideredCards.length} opção${focusedPresentation.consideredCards.length === 1 ? " já foi considerada" : "ões já foram consideradas"} e permanece acessível abaixo.`
                  : ""}
              </p>
            )}
            <p>
              {experience.activeCount} Recommendation
              {experience.activeCount === 1 ? " ativa" : "s ativas"}
              {experience.rejectedCount > 0
                ? ` e ${experience.rejectedCount} ignorada${experience.rejectedCount === 1 ? "" : "s"}`
                : ""}
              . A ordem usa correspondência de interesses e distância geodésica quando esses dados
              estão disponíveis.
            </p>
            <div className={styles.viewControls} aria-label="Modo de visualização das Recommendations">
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
            <ol className={styles.list} aria-label="Recommendations de Lugares">
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
                  <p>
                    Estes rótulos apenas resumem estados existentes. Nenhuma Recommendation foi
                    reclassificada por esta visualização.
                  </p>
                </div>
                <Link
                  className={styles.modeLink}
                  href={`/viagens/${tripId}/recomendacoes?view=all`}
                >
                  Revisar cards completos
                </Link>
              </div>
              <ul className={styles.consideredList} aria-label="Recommendations já consideradas">
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
        <section
          className={styles.externalSuggestions}
          aria-labelledby="external-suggestions-heading"
        >
          <div className={styles.externalHeading}>
            <div>
              <p className={styles.externalEyebrow}>Descoberta externa · somente leitura</p>
              <h2 id="external-suggestions-heading">Descobertas para considerar agora</h2>
            </div>
            <p>
              Estas opções ainda não são Places publicados nem Recommendations persistidas. Elas
              aparecem porque foram encontradas com segurança na região atual e são ordenadas por
              interesses conhecidos e proximidade, sem criar uma escolha por você.
            </p>
          </div>

          <ol className={styles.externalList} aria-label="Sugestões externas de lugares">
            {externalSuggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <article className={styles.externalCard} aria-label={suggestion.name}>
                  <div className={styles.externalMeta}>
                    <span>{suggestion.categoryLabel}</span>
                    <span>Descoberta externa</span>
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
                descobertas externas seguras.
              </span>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
