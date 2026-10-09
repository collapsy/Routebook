import Link from "next/link";
import type { TripStatus } from "@routebook/trip-management";

import { TripPreparationStageFocus } from "./trip-preparation-stage-focus";
import styles from "./trip-planning-wizard.module.css";

type TripPlanningWizardProps = Readonly<{
  tripId: string;
  tripStatus: TripStatus;
  currentStep?: "places" | "context" | "review" | "proposal";
  currentView?: "explore" | "selection";
  onboarding?: boolean;
  proposalState?: "generate" | "review";
}>;

export function TripPlanningWizard({
  tripId,
  tripStatus,
  currentStep = "places",
  currentView = "explore",
  onboarding = false,
  proposalState = "generate",
}: TripPlanningWizardProps) {
  if (tripStatus !== "draft") return null;

  const contextStep = currentStep === "context";
  const reviewStep = currentStep === "review";
  const proposalStep = currentStep === "proposal";
  const stepNumber = proposalStep ? "4" : reviewStep ? "3" : contextStep ? "2" : "1";
  const proposalLabel = proposalState === "review" ? "Revisar proposta" : "Gerar proposta";

  return (
    <section
      aria-labelledby="trip-planning-wizard-title"
      className={styles.wizard}
      data-planning-wizard-step={currentStep}
    >
      <TripPreparationStageFocus
        active={currentStep !== "places" || onboarding}
        stage={`${currentStep}:${proposalStep ? proposalState : ""}`}
        targetId="trip-planning-wizard-title"
      />
      <div className={styles.intro}>
        <div>
          <p className="product-eyebrow">Preparar viagem · Etapa {stepNumber} de 4</p>
          <h2 id="trip-planning-wizard-title" tabIndex={-1}>
            {proposalStep
              ? proposalState === "review"
                ? "Revise a proposta antes de decidir o que aplicar"
                : "Gere uma proposta para revisar"
              : reviewStep
                ? "Confira as escolhas para a futura proposta"
                : contextStep
                  ? "Conte o que ajuda a planejar esta viagem"
                  : onboarding
                    ? "Vamos preparar sua viagem"
                    : "Escolha os lugares que fazem sentido para você"}
          </h2>
          <p>
            {proposalStep
              ? proposalState === "review"
                ? "Esta proposta é uma sugestão separada do Roteiro. Nenhuma mudança foi aplicada automaticamente."
                : "A proposta será uma sugestão separada do Roteiro. Depois de gerada, você poderá revisar e decidir o que aplicar."
              : reviewStep
                ? "Revise os dados conhecidos e as suas intenções antes da próxima etapa. Esta revisão não cria atividades nem proposta automaticamente."
                : contextStep
                  ? "Use o que o RouteBook já sabe sobre a Viagem e informe somente o contexto adicional que fizer sentido. Nada aqui cria atividades ou proposta automaticamente."
                  : onboarding
                    ? "Este é o primeiro passo: explore lugares e marque o que combina com você. Depois, vamos completar o contexto e revisar tudo antes de montar uma proposta."
                    : "Explore opções e marque sua intenção. Esta seleção ajuda a preparar a futura proposta, mas ainda não coloca nenhum lugar no roteiro."}
          </p>
        </div>
      </div>

      <ol aria-label="Etapas da preparação da viagem" className={styles.steps}>
        <li
          aria-current={!contextStep && !reviewStep && !proposalStep ? "step" : undefined}
          className={
            contextStep || reviewStep || proposalStep ? styles.completedStep : styles.activeStep
          }
        >
          {contextStep || reviewStep || proposalStep ? (
            <Link className={styles.stepLink} href={`/viagens/${tripId}/lugares-salvos?preparar=1`}>
              <span>1</span>
              <strong>Lugares</strong>
            </Link>
          ) : (
            <>
              <span>1</span>
              <strong>Lugares</strong>
            </>
          )}
        </li>
        <li
          aria-current={contextStep ? "step" : undefined}
          className={
            reviewStep || proposalStep
              ? styles.completedStep
              : contextStep
                ? styles.activeStep
                : styles.futureStep
          }
        >
          {contextStep || reviewStep || proposalStep ? (
            <Link className={styles.stepLink} href={`/viagens/${tripId}/contexto?preparar=1`}>
              <span>2</span>
              <strong>Contexto</strong>
            </Link>
          ) : (
            <>
              <span>2</span>
              <span>Contexto</span>
            </>
          )}
        </li>
        <li
          aria-current={reviewStep ? "step" : undefined}
          className={
            reviewStep ? styles.activeStep : proposalStep ? styles.completedStep : styles.futureStep
          }
        >
          {reviewStep ? (
            <>
              <span>3</span>
              <strong>Revisão</strong>
            </>
          ) : proposalStep ? (
            <Link
              className={styles.stepLink}
              href={`/viagens/${tripId}/preparacao/revisao?preparar=1`}
            >
              <span>3</span>
              <strong>Revisão</strong>
            </Link>
          ) : (
            <>
              <span>3</span>
              <span>Revisão</span>
            </>
          )}
        </li>
        <li
          aria-current={proposalStep ? "step" : undefined}
          className={proposalStep ? styles.activeStep : styles.futureStep}
        >
          <span>4</span>
          {proposalStep ? <strong>{proposalLabel}</strong> : <span>Proposta</span>}
        </li>
      </ol>

      {!contextStep && !reviewStep ? (
        <nav aria-label="Lugares da preparação" className={styles.views}>
          <Link
            aria-current={currentView === "explore" ? "page" : undefined}
            className={
              currentView === "explore" ? "product-primary-action" : "product-secondary-action"
            }
            href={`/viagens/${tripId}/lugares?preparar=1`}
          >
            Explorar
          </Link>
          <Link
            aria-current={currentView === "selection" ? "page" : undefined}
            className={
              currentView === "selection" ? "product-primary-action" : "product-secondary-action"
            }
            href={`/viagens/${tripId}/lugares-salvos?preparar=1`}
          >
            Minha seleção
          </Link>
        </nav>
      ) : null}
    </section>
  );
}
