"use client";

export default function SavedPlacesError({ reset }: { reset: () => void }) {
  return (
    <section className="app-page trip-overview-page" role="alert">
      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">Minha seleção</p>
          <h1>Não foi possível carregar Minha seleção</h1>
          <p>Tente novamente.</p>
          <button className="product-secondary-action" onClick={reset} type="button">
            Tentar novamente
          </button>
        </div>
      </header>
    </section>
  );
}
