export default function SavedPlacesLoading() {
  return (
    <section className="app-page trip-overview-page" aria-busy="true" aria-live="polite">
      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">Sua seleção</p>
          <h1>Carregando lugares salvos…</h1>
          <p>Estamos recuperando os lugares persistidos para esta viagem.</p>
        </div>
      </header>
    </section>
  );
}
