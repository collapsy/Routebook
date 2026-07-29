"use client";

export default function SavedPlacesError({ reset }: { reset: () => void }) {
  return (
    <section className="app-page trip-overview-page" role="alert">
      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">Não foi possível carregar</p>
          <h1>Seus lugares salvos continuam preservados</h1>
          <p>Ocorreu uma falha ao consultar a seleção. Nenhum lugar foi removido ou alterado.</p>
          <button className="product-secondary-action" onClick={reset} type="button">
            Tentar novamente
          </button>
        </div>
      </header>
    </section>
  );
}
