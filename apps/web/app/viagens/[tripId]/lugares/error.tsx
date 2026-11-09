"use client";

export default function PlacesError({ reset }: { reset: () => void }) {
  return (
    <section className="app-page" role="alert">
      <h1>Não foi possível carregar os lugares</h1>
      <p>Tente novamente. Sua seleção de lugares continua salva.</p>
      <button className="product-primary-action" onClick={reset} type="button">
        Tentar novamente
      </button>
    </section>
  );
}
