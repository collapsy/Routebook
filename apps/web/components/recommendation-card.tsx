import Link from "next/link";

import type { RecommendationCardViewModel } from "../lib/recommendation-experience";
import styles from "./recommendation-card.module.css";

const categoryLabels = {
  beach: "Praia",
  gastronomy: "Gastronomia",
  nature: "Natureza",
  nightlife: "Vida noturna",
} as const;

const confidenceLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
} as const;

type ItineraryDayOption = Readonly<{
  id: string;
  date: string;
}>;

export function RecommendationCard({
  card,
  tripId,
  itineraryDays,
  ignoreAction,
  saveAction,
  addToItineraryAction,
}: {
  card: RecommendationCardViewModel;
  tripId: string;
  itineraryDays: readonly ItineraryDayOption[];
  ignoreAction: (formData: FormData) => void | Promise<void>;
  saveAction: (formData: FormData) => void | Promise<void>;
  addToItineraryAction: (formData: FormData) => void | Promise<void>;
}) {
  const titleId = `recommendation-${card.id}`;
  const isRejected = card.status === "rejected";
  const isAccepted = card.status === "accepted";
  const canDecide = card.status === "presented";

  return (
    <article
      aria-labelledby={titleId}
      className={`${styles.card} ${isRejected ? styles.rejected : ""}`}
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>{categoryLabels[card.category]}</p>
        <h2 id={titleId}>{card.placeName}</h2>
        <p className={styles.summary}>{card.summary}</p>
      </header>

      <div className={styles.meta} aria-label={`Estado da recomendação de ${card.placeName}`}>
        <span className={styles.badge}>Confiança {confidenceLabels[card.confidenceLevel]}</span>
        {card.isSaved ? <span className={styles.badge}>Lugar salvo</span> : null}
        {card.isPlanned ? <span className={styles.badge}>Já está no roteiro</span> : null}
        {isRejected ? <span className={styles.badge}>Recomendação ignorada</span> : null}
        {isAccepted ? <span className={styles.badge}>Escolha confirmada</span> : null}
      </div>

      {card.geodesicDistanceLabel ? (
        <p className={styles.distance}>
          <strong>Distância da hospedagem: </strong>
          {card.geodesicDistanceLabel}. Não representa rota, trânsito ou tempo de deslocamento.
        </p>
      ) : null}

      <section className={styles.section} aria-labelledby={`${titleId}-reasons`}>
        <h3 id={`${titleId}-reasons`}>Por que foi sugerido</h3>
        <ul className={styles.list}>
          {card.reasons.map((reason) => (
            <li key={reason.code}>{reason.message}</li>
          ))}
        </ul>
      </section>

      <section className={styles.confidence} aria-labelledby={`${titleId}-confidence`}>
        <h3 id={`${titleId}-confidence`}>Confiança {confidenceLabels[card.confidenceLevel]}</h3>
        <p className={styles.confidenceBasis}>
          Essa leitura considera {card.confidenceBasis.join(" e ")}. Não é garantia de qualidade ou
          de disponibilidade.
        </p>
      </section>

      {card.limitations.length > 0 ? (
        <section
          className={`${styles.section} ${styles.limitations}`}
          aria-labelledby={`${titleId}-limitations`}
        >
          <h3 id={`${titleId}-limitations`}>O que não foi possível considerar</h3>
          <ul className={styles.list}>
            {card.limitations.map((limitation) => (
              <li key={limitation.code}>{limitation.message}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {isRejected ? (
        <p className={styles.stateText} role="status">
          Você ignorou esta Recommendation. O Lugar continua disponível no catálogo e nenhuma
          Preferência ou Atividade foi alterada.
        </p>
      ) : null}

      {isAccepted ? (
        <p className={styles.stateText} role="status">
          Esta Recommendation já foi transformada em uma escolha explícita e persistida.
        </p>
      ) : null}

      <div className={styles.actions}>
        <Link
          aria-label={`Ver detalhes de ${card.placeName}`}
          className={styles.details}
          href={card.detailsHref}
        >
          Ver detalhes
        </Link>

        {canDecide ? (
          <form action={saveAction} aria-label={`Salvar ${card.placeName}`}>
            <input name="tripId" type="hidden" value={tripId} />
            <input name="recommendationId" type="hidden" value={card.id} />
            <input name="placeId" type="hidden" value={card.placeId} />
            <button className={styles.ignoreButton} type="submit">
              Salvar lugar
            </button>
          </form>
        ) : null}

        {canDecide && itineraryDays.length > 0 ? (
          <form action={addToItineraryAction} aria-label={`Adicionar ${card.placeName} ao roteiro`}>
            <input name="tripId" type="hidden" value={tripId} />
            <input name="recommendationId" type="hidden" value={card.id} />
            <input name="placeId" type="hidden" value={card.placeId} />
            <label>
              Dia
              <select name="dayId" required>
                <option value="">Selecione</option>
                {itineraryDays.map((day) => (
                  <option key={day.id} value={day.id}>
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" }).format(
                      new Date(`${day.date}T00:00:00Z`),
                    )}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Horário opcional
              <input name="startTime" type="time" />
            </label>
            <label>
              Duração opcional
              <input min="1" name="durationMinutes" placeholder="min" type="number" />
            </label>
            <button className={styles.ignoreButton} type="submit">
              Adicionar ao roteiro
            </button>
          </form>
        ) : null}

        {card.canIgnore ? (
          <form action={ignoreAction} aria-labelledby={titleId}>
            <input name="tripId" type="hidden" value={tripId} />
            <input name="recommendationId" type="hidden" value={card.id} />
            <button
              aria-label={`Ignorar recomendação de ${card.placeName}`}
              className={styles.ignoreButton}
              type="submit"
            >
              Ignorar
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
