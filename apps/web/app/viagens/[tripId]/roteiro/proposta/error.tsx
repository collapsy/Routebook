"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import styles from "./proposal-page.module.css";

export default function ItineraryProposalReviewError({ reset }: { reset: () => void }) {
  const { tripId } = useParams<{ tripId: string }>();

  return (
    <section className={`app-page ${styles.page}`}>
      <Link className="back-link" href={`/viagens/${tripId}/roteiro`}>
        ← Voltar para o Roteiro
      </Link>
      <div className={styles.errorState} role="alert">
        <p className="product-eyebrow">Proposta indisponível</p>
        <h1>Não foi possível revisar esta proposta</h1>
        <p>
          O Roteiro atual permanece inalterado. Tente carregar novamente ou continue o planejamento
          manual.
        </p>
        <div>
          <button className="product-button" onClick={reset} type="button">
            Tentar novamente
          </button>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/roteiro`}>
            Voltar para o Roteiro
          </Link>
        </div>
      </div>
    </section>
  );
}
