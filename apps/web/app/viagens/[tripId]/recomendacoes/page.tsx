import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecommendationCard } from "@/components/recommendation-card";
import {
  buildFocusedRecommendationPresentation,
  loadRecommendationExperience,
  type RecommendationCardViewModel,
} from "@/lib/recommendation-experience";
import { DrizzleItineraryRepository, DrizzleTripRepository } from "@routebook/database";
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
    "Consulte Recommendations determinísticas, seus motivos e as limitações do Contexto disponível.",
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
  const experience = await loadRecommendationExperience(tripId);

  if (!experience) notFound();

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
        <p className={styles.eyebrow}>Decision Intelligence determinística</p>
        <h1>Sugestões para {experience.trip.name}</h1>
        <p>
          Estas sugestões usam somente o Contexto já informado e dados publicados no catálogo. Cada
          mudança exige uma ação explícita: salvar o Lugar, escolher um Dia do Roteiro ou ignorar.
        </p>
      </header>

      {!experience.destinationSupported ? (
        <section className={styles.empty}>
          <h2>Destino ainda não coberto</h2>
          <p>
            O catálogo determinístico atual não possui uma identidade canônica para este Destino.
            Nenhuma categoria ou recomendação foi inventada.
          </p>
        </section>
      ) : null}

      {experience.destinationSupported && experience.hasContextLimitations ? (
        <section className={styles.notice} aria-labelledby="partial-context-heading">
          <h2 id="partial-context-heading">Geração parcial com Contexto incompleto</h2>
          <p>
            A lista continua disponível, mas alguns critérios não puderam participar da ordenação.
            Cada card identifica suas limitações de forma explícita.
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

      {experience.destinationSupported && experience.cards.length === 0 ? (
        <section className={styles.empty}>
          <h2>Nenhum candidato publicado disponível</h2>
          <p>
            Não há Places publicados deste Destino que possam ser avaliados pelas regras atuais.
            Nenhuma alternativa foi criada artificialmente.
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
                Exibindo todas as {experience.cards.length} Recommendations na ordem produzida pelo
                mecanismo determinístico. A interface não recalcula nem reordena essa lista.
              </p>
            ) : (
              <p>
                Exibindo {focusedPresentation.focusedCards.length} de {experience.cards.length}{" "}
                Recommendations como seleção inicial, sempre na ordem original.
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
    </main>
  );
}
