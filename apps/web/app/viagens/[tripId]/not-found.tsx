import Link from "next/link";

export default function TripNotFound() {
  return (
    <section className="product-state-page">
      <div className="product-state-card">
        <p className="product-eyebrow">Viagem não encontrada</p>
        <h1>Este TripId não está disponível.</h1>
        <p>Confira o endereço da página ou retorne para a lista de viagens disponíveis.</p>
        <Link className="product-primary-action" href="/viagens">
          Voltar para Minhas viagens
        </Link>
      </div>
    </section>
  );
}
