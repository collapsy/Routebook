import type { Metadata } from "next";
import Link from "next/link";

const creationSteps = [
  {
    title: "Destino",
    description: "Escolha a cidade ou região principal da viagem.",
  },
  {
    title: "Datas",
    description: "Informe o início e o término para organizar os dias.",
  },
  {
    title: "Hospedagem",
    description: "Defina a referência que será usada para distâncias e contexto.",
  },
  {
    title: "Viajantes",
    description: "Registre o tamanho do grupo antes de revisar a criação.",
  },
] as const;

export const metadata: Metadata = {
  title: "Criar viagem — RouteBook",
  description: "Conheça as etapas necessárias para criar uma viagem no RouteBook.",
};

export default function NewTripPreparationPage() {
  return (
    <section className="preparation-page">
      <Link className="back-link" href="/viagens">
        ← Voltar para Minhas viagens
      </Link>

      <div className="preparation-layout">
        <div>
          <header className="preparation-copy">
            <p className="product-eyebrow">Fluxo em preparação</p>
            <h1>A criação da sua viagem começa aqui.</h1>
            <p>
              O fluxo será curto e orientado. Você informará somente o contexto necessário para o
              RouteBook começar a ajudar, sem precisar configurar todas as preferências de uma vez.
            </p>
          </header>

          <ol className="preparation-steps">
            {creationSteps.map((step, index) => (
              <li className="preparation-step" key={step.title}>
                <span aria-hidden="true">{index + 1}</span>
                <div>
                  <h2>{step.title}</h2>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="preparation-note">
          <strong>Nenhum dado será salvo nesta etapa.</strong>
          <p>
            Esta versão confirma a estrutura e a navegação do produto. A criação completa e persistente
            da Viagem será ativada quando o fluxo estiver pronto para uso.
          </p>
        </aside>
      </div>
    </section>
  );
}
