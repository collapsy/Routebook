import type { Metadata } from "next";

import { EmptyTripsState } from "@/components/empty-trips-state";

export const metadata: Metadata = {
  title: "Minhas viagens — RouteBook",
  description: "Acesse, organize e crie suas viagens no RouteBook.",
};

export default function TripsPage() {
  return (
    <section className="app-page">
      <header className="app-page-heading">
        <p className="product-eyebrow">Seu espaço de planejamento</p>
        <h1>Minhas viagens</h1>
        <p>
          Cada viagem reúne contexto, lugares, distâncias e roteiro em um único espaço. Comece
          criando seu primeiro planejamento.
        </p>
      </header>

      <EmptyTripsState />
    </section>
  );
}
