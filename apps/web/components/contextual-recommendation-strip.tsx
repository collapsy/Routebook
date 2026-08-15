import Link from "next/link";

import type { RecommendationCardViewModel } from "../lib/recommendation-experience";
import { PlacePrimaryImage } from "./place-primary-image";

const categoryLabels = {
  beach: "Praia",
  gastronomy: "Gastronomia",
  nature: "Natureza",
  nightlife: "Vida noturna",
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

function uniqueLimitations(cards: readonly RecommendationCardViewModel[]): readonly string[] {
  return [...new Set(cards.flatMap((card) => card.limitations.map((limitation) => limitation.message)))].slice(
    0,
    3,
  );
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
  const limitations = uniqueLimitations(visibleCards);

  return (
    <section className="traveler-context-summary" aria-labelledby="contextual-decision-title">
      <div className="section-heading-row">
        <div>
          <p className="product-eyebrow">Decisão contextual</p>
          <h2 id="contextual-decision-title">O que vale a pena considerar?</h2>
          <p>
            Estas sugestões usam somente o contexto conhecido da Viagem. Elas ajudam a comparar
            opções; a escolha continua sendo sua.
          </p>
        </div>
        <Link className="product-secondary-action" href={`/viagens/${tripId}/recomendacoes`}>
          Ver todas as sugestões
        </Link>
      </div>

      {hasContextLimitations ? (
        <p className="notice" role="status">
          O contexto ainda tem lacunas. A seleção pode estar incompleta; configure os dados da
          Viagem antes de tratar estas sugestões como uma leitura abrangente.
        </p>
      ) : null}

      {visibleCards.length > 0 ? (
        <>
          <p>
            <strong>Próximo passo possível:</strong> abra os detalhes de uma opção para comparar o
            que já é conhecido antes de salvar ou adicionar algo ao roteiro.
          </p>

          <ul className="trip-days-grid" aria-label="Sugestões contextuais de lugares">
            {visibleCards.map((card) => (
              <li key={card.id}>
                <PlacePrimaryImage placeName={card.placeName} primaryImage={card.primaryImage} />
                <span>{categoryLabels[card.category]}</span>
                <strong>{card.placeName}</strong>
                <p>{card.summary}</p>

                {card.priceRange ? (
                  <small>Faixa de preço do catálogo: {priceRangeLabels[card.priceRange]}</small>
                ) : (
                  <small>Faixa de preço: indisponível no catálogo</small>
                )}

                {card.geodesicDistanceLabel ? (
                  <small>
                    {card.geodesicDistanceLabel} da hospedagem; isso não representa rota ou tempo.
                  </small>
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

          <p className="notice">
            <strong>Custos, riscos e perda de oportunidade:</strong> esta visão só apresenta esses
            fatores quando houver dados governados para sustentá-los. O catálogo atual não mede
            custo real, risco ou impacto de esperar.
          </p>
        </>
      ) : (
        <div aria-live="polite">
          <h3>Ainda não há contexto suficiente para uma seleção confiável</h3>
          <p>
            O RouteBook não vai preencher lacunas com suposições. Informe interesses e, se quiser
            usar proximidade, a hospedagem para ampliar o contexto disponível.
          </p>
          <div className="section-heading-row">
            <Link className="product-secondary-action" href={`/viagens/${tripId}/contexto`}>
              Configurar contexto
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
