"use client";

import styles from "./recommendations-page.module.css";

export default function RecommendationsError({ reset }: { reset: () => void }) {
  return (
    <main className={styles.page}>
      <section className={styles.empty} role="alert">
        <h1>Não foi possível atualizar as sugestões</h1>
        <p>Tente carregar novamente.</p>
        <button className={styles.contextLink} onClick={reset} type="button">
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
