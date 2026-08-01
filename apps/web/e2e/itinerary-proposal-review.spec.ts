import { expect, test } from "@playwright/test";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import {
  completeItineraryProposalGeneration,
  requestItineraryProposal,
  startItineraryProposalGeneration,
} from "@routebook/proposal-management";
import { addActivity, createItinerary, createTrip } from "@routebook/trip-management";

const confirmedActivity = "Café já confirmado";
const proposedActivity = "Mirante ao pôr do sol";

async function createProposalFixture(tripName: string): Promise<string> {
  const requestedAt = new Date();
  const trip = createTrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-23",
      ownerName: "RouteBook E2E",
    },
    requestedAt,
  );
  let itinerary = createItinerary({ tripId: trip.id, period: trip.period }, requestedAt);
  itinerary = addActivity(
    itinerary,
    {
      dayDate: "2026-08-22",
      title: confirmedActivity,
      startTime: "09:00",
      durationMinutes: 60,
    },
    requestedAt,
  );

  await new DrizzleTripRepository().create(trip);
  await new DrizzleItineraryRepository().save(itinerary);

  const repository = new DrizzleItineraryProposalRepository();
  const requested = requestItineraryProposal({
    tripId: trip.id,
    itineraryId: itinerary.id,
    baseTripContextVersion: 1,
    baseItineraryVersion: itinerary.version,
    contextSnapshotId: `e2e-${trip.id}`,
    requestedAt,
  });
  const generationStartedAt = new Date(requestedAt.getTime() + 1_000);
  const generatedAt = new Date(requestedAt.getTime() + 2_000);
  const generating = startItineraryProposalGeneration(requested, generationStartedAt);
  const ready = completeItineraryProposalGeneration(generating, {
    generationMethod: "e2e-fixture",
    generationVersion: "1",
    proposedActivities: [
      {
        proposedActivityId: crypto.randomUUID(),
        targetTripDayId: itinerary.days[0]!.id,
        title: proposedActivity,
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
    criteria: ["Ritmo leve", "Proximidade entre lugares"],
    justifications: ["A organização reduz deslocamentos no fim da tarde."],
    limitations: ["Horários externos não foram confirmados."],
    planningConflictIds: [],
    generatedAt,
    validUntil: new Date(generatedAt.getTime() + 86_400_000),
  });

  await repository.create(requested);
  await repository.save(generating);
  await repository.save(ready);
  return trip.id;
}

async function createItineraryWithoutProposal(tripName: string): Promise<string> {
  const now = new Date();
  const trip = createTrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-23",
      ownerName: "RouteBook E2E",
    },
    now,
  );
  const itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);
  await new DrizzleTripRepository().create(trip);
  await new DrizzleItineraryRepository().save(itinerary);
  return trip.id;
}

test("revisa uma Proposal ready sem aplicá-la ao Roteiro", async ({ page }, testInfo) => {
  const tripId = await createProposalFixture(`Proposta ${testInfo.project.name} ${Date.now()}`);
  await page.goto(`/viagens/${tripId}/roteiro`);

  await expect(page.getByText(confirmedActivity, { exact: true })).toBeVisible();
  await expect(page.getByText(proposedActivity, { exact: true })).toHaveCount(0);
  await Promise.all([
    page.waitForURL(/\/roteiro\/proposta$/),
    page.getByRole("link", { name: "Ver proposta" }).click(),
  ]);

  await expect(page.getByRole("heading", { level: 1, name: "Proposta de Roteiro" })).toBeVisible();
  await expect(page.getByText("Sugestão — ainda não aplicada")).toBeVisible();
  await expect(page.getByRole("heading", { name: proposedActivity })).toBeVisible();
  await expect(page.getByText("Proximidade entre lugares")).toBeVisible();
  await expect(page.getByText("Horários externos não foram confirmados.")).toBeVisible();
  await expect(page.getByText(/O Roteiro atual permanece preservado/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /aceitar|aplicar|descartar|gerar novamente/i }),
  ).toHaveCount(0);

  await Promise.all([
    page.waitForURL(/\/roteiro$/),
    page.getByRole("link", { name: "Voltar para o Roteiro" }).click(),
  ]);
  await expect(page.getByText(confirmedActivity, { exact: true })).toBeVisible();
  await expect(page.getByText(proposedActivity, { exact: true })).toHaveCount(0);
});

test("mantém a rota direta recuperável quando não existe Proposal ready", async ({
  page,
}, testInfo) => {
  const tripId = await createItineraryWithoutProposal(
    `Sem proposta ${testInfo.project.name} ${Date.now()}`,
  );
  await page.goto(`/viagens/${tripId}/roteiro/proposta`);

  await expect(page.getByRole("heading", { name: "Nenhuma proposta disponível" })).toBeVisible();
  await expect(
    page.getByText(/Roteiro atual continua disponível e não foi alterado/i),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Continuar no Roteiro" })).toHaveAttribute(
    "href",
    `/viagens/${tripId}/roteiro`,
  );
});
