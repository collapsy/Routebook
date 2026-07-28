export default function TripOverviewLoading() {
  return (
    <section className="product-state-page" aria-busy="true" aria-label="Carregando viagem">
      <div className="product-state-card">
        <p className="product-eyebrow">Preparando contexto</p>
        <div className="loading-line loading-line-short" />
        <div className="loading-line" />
        <div className="loading-block" />
      </div>
    </section>
  );
}
