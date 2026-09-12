import Link from "next/link";

import type { RecommendationCardViewModel } from "../lib/recommendation-experience";
import { PlacePrimaryImage } from "./place-primary-image";

const categoryLabels = {
  beach: "Praia",
  gastronomy: "Gastronomia",
  nature: "Natureza",
  nightlife: "Vida noturna",
  attraction: "Ponto turístico",
  viewpoint: "Mirante",
  tour: "Passeio",
  shopping: "Compras",
} as const;

const priceRangeLabels = {
  free: "Gratuito",
  budget: "Econômico",
  moderate: "Moderado",
  premium: "Mais alto",
} as const;

function formatReasons(card: RecommendationCardViewModel): string {
  return card.reasons
    .slice(0, 2)
    .map((reason) => reason.message)
    .join(" ");
}

export function ContextualRecommendationStrip({
  tripId,
  cards,
  hasContextLimitations,
}: {
  tripId: string;
  cards: readonly RecommendationCardViewModel[];
  hasContextLimitations: boolean;
}) {
  const visibleCards = cards.filter((card) => card.status !== "rejected").slice(0, 3);
  const contextIsInsufficient =
    visibleCards.length === 0 ||
    (hasContextLimitations && visibleCards.every((card) => card.confidenceLevel === "low"));

  return (
    <section className="traveler-context-summary" aria-labelledby="contextual-decision-title">
      <div className="section-heading-row">
        <div>
          <p className="product-eyebrow">Sugestões para a viagem</p>
          <h2 id="contextual-decision-title">O que vale a pena considerar?</h2>
          <p>Compare opções com base nas preferências e informações da sua viagem.</p>
        </div>
        <Link className="product-secondary-action" href={`/viagens/${tripId}/recomendacoes`}>
          Ver todas as sugestões
        </Link>
      </div>

      {hasContextLimitations && !contextIsInsufficient ? (
        <p className="notice">
          Algumas preferências ainda não foram informadas. As sugestões podem ficar menos
          personalizadas.
        </p>
      ) : null}

      {!contextIsInsufficient ? (
        <>
          <p>
            <strong>Próximo passo:</strong> abra os detalhes para comparar antes de salvar ou
            adicionar ao roteiro.
          </p>

          <ul className="trip-days-grid" aria-label="Sugestões contextuais de lugares">
            {visibleCards.map((card) => (
              <li key={card.id}>
                <PlacePrimaryImage placeName={card.placeName} primaryImage={card.primaryImage} />
                <span>{categoryLabels[card.category]}</span>
                <strong>{card.placeName}</strong>
                <p>{card.summary}</p>

                {card.priceRange ? (
                  <small>Faixa de preço: {priceRangeLabels[card.priceRange]}</small>
                ) : (
                  <small>Faixa de preço: indisponível</small>
                )}

                {card.geodesicDistanceLabel ? (
                  <small>{card.geodesicDistanceLabel} da hospedagem.</small>
                ) : null}

                <small>
                  <strong>Por que aparece:</strong> {formatReasons(card)}
                </small>

                {card.limitations.length > 0 ? (
                  <small>
                    <strong>Limitação:</strong> {card.limitations[0]?.message}
                  </small>
                ) : null}

                <Link
                  aria-label={`Comparar detalhes de ${card.placeName}`}
                  className="product-secondary-action"
                  href={card.detailsHref}
                >
                  Comparar detalhes
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div aria-live="polite">
          <h3>Precisamos de mais informações para personalizar as sugestões</h3>
          <p>
            Informe seus interesses e, se quiser sugestões por proximidade, a hospedagem da viagem.
          </p>
          <div className="section-heading-row">
            <Link className="product-secondary-action" href={`/viagens/${tripId}/contexto`}>
              Informar preferências
            </Link>
            <Link className="product-secondary-action" href={`/viagens/${tripId}/hospedagem`}>
              Informar hospedagem
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
