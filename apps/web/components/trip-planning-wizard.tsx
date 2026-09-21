import Link from "next/link";

import styles from "./trip-planning-wizard.module.css";

type TripPlanningWizardProps = Readonly<{
  tripId: string;
  currentView: "explore" | "selection";
}>;

const futureSteps = ["Contexto", "Revisão", "Proposta"] as const;

export function TripPlanningWizard({ tripId, currentView }: TripPlanningWizardProps) {
  return (
    <section
      aria-labelledby="trip-planning-wizard-title"
      className={styles.wizard}
      data-planning-wizard-step="places"
    >
      <div className={styles.intro}>
        <div>
          <p className="product-eyebrow">Preparar viagem · Etapa 1 de 4</p>
          <h1 id="trip-planning-wizard-title">Escolha os lugares que fazem sentido para você</h1>
          <p>
            Explore opções e marque sua intenção. Esta seleção ajuda a preparar a futura proposta,
            mas ainda não coloca nenhum lugar no roteiro.
          </p>
        </div>
      </div>

      <ol aria-label="Etapas da preparação da viagem" className={styles.steps}>
        <li aria-current="step" className={styles.activeStep}>
          <span>1</span>
          <strong>Lugares</strong>
        </li>
        {futureSteps.map((step, index) => (
          <li aria-disabled="true" className={styles.futureStep} key={step}>
            <span>{index + 2}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <nav aria-label="Lugares da preparação" className={styles.views}>
        <Link
          aria-current={currentView === "explore" ? "page" : undefined}
          className={
            currentView === "explore" ? "product-primary-action" : "product-secondary-action"
          }
          href={`/viagens/${tripId}/lugares`}
        >
          Explorar
        </Link>
        <Link
          aria-current={currentView === "selection" ? "page" : undefined}
          className={
            currentView === "selection" ? "product-primary-action" : "product-secondary-action"
          }
          href={`/viagens/${tripId}/lugares-salvos`}
        >
          Minha seleção
        </Link>
      </nav>
    </section>
  );
}
