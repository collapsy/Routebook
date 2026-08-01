import { ignorePlanningRisk, PlanningRiskDecisionServiceError } from "@routebook/database";

function reviewPath(tripId: string): string {
  return `/viagens/${tripId}/roteiro/revisao`;
}

export type PlanningRiskActionResult = Readonly<{
  redirectTo: string;
}>;

function required(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function errorResult(
  tripId: string,
  error: PlanningRiskDecisionServiceError,
): PlanningRiskActionResult {
  const codeByError = {
    "planning-conflict-not-found": "conflito-nao-encontrado",
    "cross-trip": "acao-cross-trip",
    "not-risk": "severidade-incompativel",
    "invalid-state": "estado-incompativel",
    "owner-not-found": "responsavel-nao-encontrado",
    "idempotency-conflict": "conflito-idempotencia",
    "persistence-failure": "falha-persistencia",
  } as const;
  return { redirectTo: `${reviewPath(tripId)}?erro=${codeByError[error.code]}` };
}

export async function ignorePlanningRiskAction(
  formData: FormData,
): Promise<PlanningRiskActionResult> {
  "use server";

  const tripId = required(formData, "tripId");
  const planningConflictId = required(formData, "planningConflictId");
  const confirmation = required(formData, "confirmation");
  if (!tripId || !planningConflictId) {
    return { redirectTo: "/viagens?erro=conflito-invalido" };
  }
  if (confirmation !== "risk-accepted") {
    return { redirectTo: `${reviewPath(tripId)}?erro=confirmacao-obrigatoria` };
  }

  try {
    await ignorePlanningRisk({
      tripId,
      planningConflictId,
      idempotencyKey: `${planningConflictId}:ignore-planning-risk`,
    });
  } catch (error) {
    if (error instanceof PlanningRiskDecisionServiceError) {
      return errorResult(tripId, error);
    }
    throw error;
  }

  return { redirectTo: `${reviewPath(tripId)}?riscoIgnorado=1` };
}
