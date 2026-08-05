import { test } from "@playwright/test";

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

test("expõe a resposta RSC do aceite integral", async ({ page }, testInfo) => {
  const requestedAt = new Date(Date.now() - 10_000);
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: `Diagnóstico RSC ${testInfo.project.name} ${Date.now()}`,
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

  const proposalRepository = new DrizzleItineraryProposalRepository();
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
        proposedOrder: 1,
        operationType: "add",
        flexibility: "flexible",
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

  await proposalRepository.create(requested);
  await proposalRepository.save(generating);
  await proposalRepository.save(ready);

  await page.goto(`/viagens/${trip.id}/roteiro/proposta`);
  await page.getByText("Aceitar proposta", { exact: true }).click();
  await page.getByRole("checkbox", { name: /atualizará o Roteiro/i }).check();

  const actionResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      Boolean(response.request().headers()["next-action"]),
  );
  await page.getByRole("button", { name: "Confirmar e aceitar proposta" }).click();
  const actionResponse = await actionResponsePromise;
  const body = await actionResponse.text();

  throw new Error(`RB_INC_093_ACTION_RESPONSE ${body}`);
});
