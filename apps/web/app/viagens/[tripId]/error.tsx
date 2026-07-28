"use client";

export default function TripOverviewError({ reset }: { reset: () => void }) {
  return (
    <section className="product-state-page">
      <div className="product-state-card">
        <p className="product-eyebrow">Falha temporária</p>
        <h1>Não foi possível carregar esta viagem.</h1>
        <p>A conexão com os dados falhou. Tente novamente sem perder o endereço atual.</p>
        <button className="product-button" onClick={reset} type="button">
          Tentar novamente
        </button>
      </div>
    </section>
  );
}
