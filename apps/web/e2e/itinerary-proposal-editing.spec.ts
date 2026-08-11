import { expect, test } from "@playwright/test";
import { sql } from "drizzle-orm";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  getDatabase,
} from "@routebook/database";
import {
  completeItineraryProposalGeneration,
  rejectItineraryProposal,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposalId,
} from "@routebook/proposal-management";
import { addActivity, createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test.setTimeout(120_000);

const confirmedActivity = "Café já confirmado";
const proposedActivity = "Mirante ao pôr do sol";
const editedActivity = "Mirante revisado no fim da tarde";

type EditingFixture = Readonly<{
  tripId: string;
  itineraryId: string;
  proposalId: ItineraryProposalId;
  proposedActivityId: string;
  firstDayId: string;
  secondDayId: string;
  baseItineraryVersion: number;
}>;

function resultRows(result: unknown): readonly Record<string, unknown>[] {
  if (Array.isArray(result)) return result as readonly Record<string, unknown>[];
  if (result && typeof result === "object" && "rows" in result) {
    const rows = (result as { rows?: unknown }).rows;
    if (Array.isArray(rows)) return rows as readonly Record<string, unknown>[];
  }
  return [];
}

async function createEditingFixture(tripName: string): Promise<EditingFixture> {
  const requestedAt = new Date(Date.now() - 10_000);
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: tripName,
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
      title: confirmedActivity,
      startTime: "09:00",
      durationMinutes: 60,
    },
    requestedAt,
  );
  await new DrizzleItineraryRepository().save(itinerary);

  const proposedActivityId = crypto.randomUUID();
  const repository = new DrizzleItineraryProposalRepository();
  const requested = requestItineraryProposal({
    tripId: trip.id,
    itineraryId: itinerary.id,
    baseTripContextVersion: 1,
    baseItineraryVersion: itinerary.version,
    contextSnapshotId: `e2e-edit-${trip.id}`,
    requestedAt,
  });
  const generating = startItineraryProposalGeneration(
    requested,
    new Date(requestedAt.getTime() + 1_000),
  );
  const generatedAt = new Date(requestedAt.getTime() + 2_000);
  const ready = completeItineraryProposalGeneration(generating, {
    generationMethod: "e2e-edit-fixture",
    generationVersion: "1",
    proposedActivities: [
      {
        proposedActivityId,
        targetTripDayId: itinerary.days[0]!.id,
        title: proposedActivity,
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

  return Object.freeze({
    tripId: trip.id,
    itineraryId: itinerary.id,
    proposalId: ready.id,
    proposedActivityId,
    firstDayId: itinerary.days[0]!.id,
    secondDayId: itinerary.days[1]!.id,
    baseItineraryVersion: itinerary.version,
  });
}

async function persistedEditingRows(
  fixture: EditingFixture,
): Promise<readonly Record<string, unknown>[]> {
  return resultRows(
    await getDatabase().execute(sql`
      SELECT
        proposal.status,
        proposal.updated_at AS "updatedAt",
        activity.id::text AS "proposedActivityId",
        activity.target_trip_day_id::text AS "targetTripDayId",
        activity.title,
        activity.description,
        activity.proposed_start_time::text AS "proposedStartTime",
        activity.duration_minutes AS "durationMinutes",
        activity.operation_type AS "operationType",
        activity.flexibility,
        activity.estimated_cost_amount::text AS "estimatedCostAmount",
        activity.estimated_cost_currency AS "estimatedCostCurrency",
        activity.reason
      FROM itinerary_proposals AS proposal
      JOIN proposed_activities AS activity
        ON activity.itinerary_proposal_id = proposal.id
      WHERE proposal.trip_id = ${fixture.tripId}::uuid
        AND proposal.id = ${fixture.proposalId}::uuid
        AND activity.id = ${fixture.proposedActivityId}::uuid
    `),
  );
}

test("edita uma Proposed Activity da UI ao PostgreSQL, reidrata e preserva o Itinerary", async ({
  page,
}, testInfo) => {
  const fixture = await createEditingFixture(
    `Editar proposta ${testInfo.project.name} ${Date.now()}`,
  );
  const itineraryRepository = new DrizzleItineraryRepository();
  const proposalRepository = new DrizzleItineraryProposalRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(fixture.tripId);
  const proposalBefore = await proposalRepository.findById(fixture.tripId, fixture.proposalId);

  expect(itineraryBefore).not.toBeNull();
  expect(proposalBefore).toMatchObject({ status: "ready" });

  await page.goto(`/viagens/${fixture.tripId}/roteiro/proposta`);
  await page.getByText(`Editar sugestão: ${proposedActivity}`, { exact: true }).click();

  await page.getByRole("combobox", { name: "Dia proposto" }).selectOption(fixture.secondDayId);
  await page.getByRole("textbox", { name: "Título" }).fill(editedActivity);
  await page
    .getByRole("textbox", { name: "Descrição da sugestão" })
    .fill("Vista revisada para encerrar a tarde com calma.");
  await page.getByLabel("Horário").fill("18:10");
  await page.getByLabel("Duração (min)").fill("75");
  await page.getByRole("combobox", { name: "Flexibilidade" }).selectOption("fixed");
  await page.getByLabel("Valor").fill("42.50");
  await page.getByLabel("Moeda").fill("brl");
  await page.getByRole("button", { name: "Salvar edição" }).click();

  await expect
    .poll(async () => {
      const proposal = await proposalRepository.findById(fixture.tripId, fixture.proposalId);
      return proposal?.proposedActivities?.[0]?.title;
    })
    .toBe(editedActivity);

  const proposalAfter = await proposalRepository.findById(fixture.tripId, fixture.proposalId);
  expect(proposalAfter).toMatchObject({
    status: "ready",
    proposedActivities: [
      expect.objectContaining({
        proposedActivityId: fixture.proposedActivityId,
        targetTripDayId: fixture.secondDayId,
        title: editedActivity,
        description: "Vista revisada para encerrar a tarde com calma.",
        proposedStartTime: "18:10:00",
        durationMinutes: 75,
        operationType: "add",
        flexibility: "fixed",
        estimatedCostAmount: 42.5,
        estimatedCostCurrency: "BRL",
        reason: "Aproveita o fim da tarde e reduz deslocamentos.",
      }),
    ],
  });
  expect(proposalAfter!.updatedAt.getTime()).toBeGreaterThan(proposalBefore!.updatedAt.getTime());

  const rows = await persistedEditingRows(fixture);
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({
    status: "ready",
    proposedActivityId: fixture.proposedActivityId,
    targetTripDayId: fixture.secondDayId,
    title: editedActivity,
    description: "Vista revisada para encerrar a tarde com calma.",
    proposedStartTime: "18:10:00",
    durationMinutes: 75,
    operationType: "add",
    flexibility: "fixed",
    estimatedCostAmount: "42.5000",
    estimatedCostCurrency: "BRL",
    reason: "Aproveita o fim da tarde e reduz deslocamentos.",
  });
  expect(new Date(String(rows[0]?.updatedAt)).getTime()).toBe(proposalAfter!.updatedAt.getTime());

  const itineraryAfter = await itineraryRepository.findByTripId(fixture.tripId);
  expect(itineraryAfter).toMatchObject({
    id: fixture.itineraryId,
    version: fixture.baseItineraryVersion,
  });
  expect(itineraryAfter?.days.flatMap(({ activities }) => activities)).toEqual(
    itineraryBefore?.days.flatMap(({ activities }) => activities),
  );
  expect(
    itineraryAfter?.days
      .flatMap(({ activities }) => activities)
      .some(({ title }) => title === editedActivity),
  ).toBe(false);

  await page.reload();
  await expect(page.getByRole("heading", { name: editedActivity })).toBeVisible();
  await expect(page.getByText(proposedActivity, { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Roteiro atual permanece preservado/i)).toBeVisible();
  await page.getByText(`Editar sugestão: ${editedActivity}`, { exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Dia proposto" })).toHaveValue(
    fixture.secondDayId,
  );
  await expect(page.getByRole("textbox", { name: "Título" })).toHaveValue(editedActivity);
  await expect(page.getByLabel("Horário")).toHaveValue("18:10");
  await expect(page.getByLabel("Duração (min)")).toHaveValue("75");
  await expect(page.getByRole("combobox", { name: "Flexibilidade" })).toHaveValue("fixed");
  await expect(page.getByLabel("Valor")).toHaveValue("42.5");
  await expect(page.getByLabel("Moeda")).toHaveValue("BRL");
});

test("mantém erro recuperável quando a Proposal deixa de estar ready antes do submit", async ({
  page,
}, testInfo) => {
  const fixture = await createEditingFixture(
    `Edição concorrente ${testInfo.project.name} ${Date.now()}`,
  );
  const proposalRepository = new DrizzleItineraryProposalRepository();
  const itineraryRepository = new DrizzleItineraryRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(fixture.tripId);

  await page.goto(`/viagens/${fixture.tripId}/roteiro/proposta`);
  await page.getByText(`Editar sugestão: ${proposedActivity}`, { exact: true }).click();
  await page.getByRole("textbox", { name: "Título" }).fill("Título que não deve persistir");

  const ready = await proposalRepository.findById(fixture.tripId, fixture.proposalId);
  expect(ready).toMatchObject({ status: "ready" });
  await proposalRepository.save(rejectItineraryProposal(ready!, new Date()));

  await page.getByRole("button", { name: "Salvar edição" }).click();
  await expect(page.locator('p[role="alert"]')).toHaveText(
    "A proposta de roteiro não pode mais ser editada.",
  );

  const persisted = await proposalRepository.findById(fixture.tripId, fixture.proposalId);
  expect(persisted).toMatchObject({
    status: "rejected",
    proposedActivities: [expect.objectContaining({ title: proposedActivity })],
  });
  expect((await persistedEditingRows(fixture))[0]).toMatchObject({
    status: "rejected",
    title: proposedActivity,
  });

  const itineraryAfter = await itineraryRepository.findByTripId(fixture.tripId);
  expect(itineraryAfter).toMatchObject({
    id: fixture.itineraryId,
    version: fixture.baseItineraryVersion,
  });
  expect(itineraryAfter?.days.flatMap(({ activities }) => activities)).toEqual(
    itineraryBefore?.days.flatMap(({ activities }) => activities),
  );
});
