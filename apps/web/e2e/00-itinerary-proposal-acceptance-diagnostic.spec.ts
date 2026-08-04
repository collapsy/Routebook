import { expect, test } from "@playwright/test";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
} from "@routebook/database";
import {
  completeItineraryProposalGeneration,
  requestItineraryProposal,
  startItineraryProposalGeneration,
} from "@routebook/proposal-management";
import { addActivity, createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test.setTimeout(30_000);

test("diagnostica o estado real retornado pelo aceite integral", async ({ page }, testInfo) => {
  const requestedAt = new Date(Date.now() - 10_000);
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: `Diagnóstico de aceite ${testInfo.project.name} ${Date.now()}`,
      startDate: "2026-08-22",
      endDate: "2026-08-23",
    },
    requestedAt,
  );
  let itinerary = createItinerary({ tripId: trip.id, period: trip.period }, requestedAt);
  itinerary = addActivity(
    itinerary,
    {
      dayDate: "2026-08-22",
      title: "Café já confirmado",
      startTime: "09:00",
      durationMinutes: 60,
    },
    requestedAt,
  );
  await new DrizzleItineraryRepository().save(itinerary);

  const repository = new DrizzleItineraryProposalRepository();
  const requested = requestItineraryProposal({
    tripId: trip.id,
    itineraryId: itinerary.id,
    baseTripContextVersion: 1,
    baseItineraryVersion: itinerary.version,
    contextSnapshotId: `diagnostic-${trip.id}`,
    requestedAt,
  });
  const generating = startItineraryProposalGeneration(
    requested,
    new Date(requestedAt.getTime() + 1_000),
  );
  const generatedAt = new Date(requestedAt.getTime() + 2_000);
  const ready = completeItineraryProposalGeneration(generating, {
    generationMethod: "e2e-diagnostic",
    generationVersion: "1",
    proposedActivities: [
      {
        proposedActivityId: crypto.randomUUID(),
        targetTripDayId: itinerary.days[0]!.id,
        title: "Mirante ao pôr do sol",
        description: "Uma pausa com vista antes do jantar.",
        proposedStartTime: "17:30",
        durationMinutes: 90,
        proposedOrder: 2,
        operationType: "add",
        flexibility: "flexível",
        estimatedCostAmount: 25,
        estimatedCostCurrency: "BRL",
        reason: "Aproveita o fim da tarde e reduz deslocamentos.",
      },
    ],
    criteria: ["Ritmo leve"],
    justifications: ["Reduz deslocamentos."],
    limitations: ["Horários externos não confirmados."],
    planningConflictIds: [],
    generatedAt,
    validUntil: new Date(generatedAt.getTime() + 86_400_000),
  });
  await repository.create(requested);
  await repository.save(generating);
  await repository.save(ready);

  await page.goto(`/viagens/${trip.id}/roteiro/proposta`);
  await page.getByText("Aceitar proposta", { exact: true }).click();
  await page.getByRole("checkbox", { name: /atualizará o Roteiro/i }).check();
  await page.getByRole("button", { name: "Confirmar e aceitar proposta" }).click();

  const expectedPath = `/viagens/${trip.id}/roteiro?propostaAceita=applied`;
  await expect
    .poll(
      async () => {
        const currentUrl = new URL(page.url());
        if (`${currentUrl.pathname}${currentUrl.search}` === expectedPath) return expectedPath;

        const alert = page.getByRole("alert");
        if (await alert.isVisible().catch(() => false)) {
          return `alert:${await alert.textContent()}`;
        }

        const status = page.getByRole("status");
        if (await status.isVisible().catch(() => false)) {
          return `status:${await status.textContent()}`;
        }

        if (
          await page
            .getByText("Aplicando a proposta e atualizando o Roteiro…")
            .isVisible()
            .catch(() => false)
        ) {
          return "pending";
        }

        return `url:${currentUrl.pathname}${currentUrl.search}`;
      },
      { timeout: 12_000 },
    )
    .toBe(expectedPath);
});
