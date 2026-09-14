import styles from "./recommendations-page.module.css";

export default function RecommendationsLoading() {
  return (
    <main aria-busy="true" className={styles.page}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Sugestões para a viagem</p>
        <h1>Carregando sugestões</h1>
      </header>
      <div aria-hidden="true" className={styles.loadingCard} />
      <div aria-hidden="true" className={styles.loadingCard} />
    </main>
  );
}
