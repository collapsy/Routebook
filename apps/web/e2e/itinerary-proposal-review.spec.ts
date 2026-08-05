import { expect, test, type Page } from "@playwright/test";
import { sql } from "drizzle-orm";

import {
  DrizzleDecisionRepository,
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  getDatabase,
} from "@routebook/database";
import {
  completeItineraryProposalGeneration,
  expireItineraryProposalByTime,
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

type ProposalFixture = Readonly<{
  tripId: string;
  itineraryId: string;
  proposalId: ItineraryProposalId;
  proposedActivityId: string;
  baseItineraryVersion: number;
  idempotencyKey: string;
}>;

function resultRows(result: unknown): readonly Record<string, unknown>[] {
  if (Array.isArray(result)) return result as readonly Record<string, unknown>[];
  if (result && typeof result === "object" && "rows" in result) {
    const rows = (result as { rows?: unknown }).rows;
    if (Array.isArray(rows)) return rows as readonly Record<string, unknown>[];
  }
  return [];
}

async function createProposalFixture(
  tripName: string,
  status: "ready" | "expired" = "ready",
): Promise<ProposalFixture> {
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
  if (status === "expired") {
    await repository.save(
      expireItineraryProposalByTime(ready, new Date(ready.validUntil!.getTime() + 60_000)),
    );
  }

  return Object.freeze({
    tripId: trip.id,
    itineraryId: itinerary.id,
    proposalId: ready.id,
    proposedActivityId,
    baseItineraryVersion: itinerary.version,
    idempotencyKey: `accept-itinerary-proposal:${ready.id}:${itinerary.version}`,
  });
}

async function createItineraryWithoutProposal(tripName: string): Promise<string> {
  const now = new Date();
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-23",
    },
    now,
  );
  const itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);
  await new DrizzleItineraryRepository().save(itinerary);
  return trip.id;
}

async function openAcceptance(page: Page, tripId: string): Promise<void> {
  await page.goto(`/viagens/${tripId}/roteiro/proposta`);
  await page.getByText("Aceitar proposta", { exact: true }).click();
  await page.getByRole("checkbox", { name: /atualizará o Roteiro/i }).check();
}

async function proposalApplicationRows(
  fixture: ProposalFixture,
): Promise<readonly Record<string, unknown>[]> {
  return resultRows(
    await getDatabase().execute(sql`
      SELECT
        id::text AS "id",
        status,
        request_fingerprint AS "requestFingerprint",
        resulting_itinerary_version AS "resultingItineraryVersion"
      FROM proposal_applications
      WHERE itinerary_proposal_id = ${fixture.proposalId}::uuid
        AND idempotency_key = ${fixture.idempotencyKey}
      ORDER BY created_at, id
    `),
  );
}

test("aceita uma Proposal ready da UI ao PostgreSQL e preserva o resultado após reload", async ({
  page,
}, testInfo) => {
  const fixture = await createProposalFixture(
    `Aceite integral ${testInfo.project.name} ${Date.now()}`,
  );

  await openAcceptance(page, fixture.tripId);
  await Promise.all([
    page.waitForURL(/\/roteiro\?propostaAceita=applied$/),
    page.getByRole("button", { name: "Confirmar e aceitar proposta" }).click(),
  ]);

  await expect(page.getByRole("status")).toHaveText(
    "Proposta aceita. O Roteiro foi atualizado com as mudanças confirmadas.",
  );
  await expect(page.getByText(proposedActivity, { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver proposta" })).toHaveCount(0);

  const itinerary = await new DrizzleItineraryRepository().findByTripId(fixture.tripId);
  expect(itinerary).toMatchObject({
    id: fixture.itineraryId,
    version: fixture.baseItineraryVersion + 1,
  });
  expect(
    itinerary?.days
      .flatMap(({ activities }) => activities)
      .find(({ title }) => title === proposedActivity),
  ).toMatchObject({
    title: proposedActivity,
    startTime: "17:30",
    durationMinutes: 90,
  });

  const proposal = await new DrizzleItineraryProposalRepository().findById(
    fixture.tripId,
    fixture.proposalId,
  );
  expect(proposal).toMatchObject({ status: "accepted" });
  expect(proposal?.acceptedAt).toBeInstanceOf(Date);

  const applications = await proposalApplicationRows(fixture);
  expect(applications).toHaveLength(1);
  expect(applications[0]).toMatchObject({
    status: "succeeded",
    resultingItineraryVersion: fixture.baseItineraryVersion + 1,
  });

  const decision = await new DrizzleDecisionRepository().findByIdempotencyKey(
    fixture.tripId,
    fixture.idempotencyKey,
  );
  expect(decision).toMatchObject({
    tripId: fixture.tripId,
    type: "accept-itinerary-proposal",
    idempotencyKey: fixture.idempotencyKey,
    contextSnapshot: {
      itineraryId: fixture.itineraryId,
      itineraryProposalId: fixture.proposalId,
      baseItineraryVersion: fixture.baseItineraryVersion,
    },
    effect: {
      proposalApplicationId: applications[0]?.id,
      resultingItineraryVersion: fixture.baseItineraryVersion + 1,
      appliedProposedActivityIds: [fixture.proposedActivityId],
    },
  });

  await page.reload();
  await expect(page.getByText(proposedActivity, { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver proposta" })).toHaveCount(0);
});

test("reproduz o aceite concorrente e rejeita chave nova sem duplicar efeitos", async ({
  context,
  page,
}, testInfo) => {
  const fixture = await createProposalFixture(
    `Replay integral ${testInfo.project.name} ${Date.now()}`,
  );
  const replayPage = await context.newPage();
  const conflictingPage = await context.newPage();

  try {
    await openAcceptance(page, fixture.tripId);
    await openAcceptance(replayPage, fixture.tripId);
    await openAcceptance(conflictingPage, fixture.tripId);

    await Promise.all([
      page.waitForURL(/\/roteiro\?propostaAceita=applied$/),
      page.getByRole("button", { name: "Confirmar e aceitar proposta" }).click(),
    ]);
    await Promise.all([
      replayPage.waitForURL(/\/roteiro\?propostaAceita=replay$/),
      replayPage.getByRole("button", { name: "Confirmar e aceitar proposta" }).click(),
    ]);

    await expect(replayPage.getByRole("status")).toHaveText(
      "Esta proposta já havia sido aceita. O Roteiro atualizado foi carregado.",
    );

    await conflictingPage.locator('input[name="idempotencyKey"]').evaluate((input) => {
      (input as HTMLInputElement).value = `${(input as HTMLInputElement).value}:nova`;
    });
    await conflictingPage.getByRole("button", { name: "Confirmar e aceitar proposta" }).click();
    await expect(conflictingPage.getByRole("alert")).toHaveText(
      "A proposta não está pronta para ser aceita.",
    );

    const itinerary = await new DrizzleItineraryRepository().findByTripId(fixture.tripId);
    expect(itinerary?.version).toBe(fixture.baseItineraryVersion + 1);
    expect(
      itinerary?.days
        .flatMap(({ activities }) => activities)
        .filter(({ title }) => title === proposedActivity),
    ).toHaveLength(1);

    expect(await proposalApplicationRows(fixture)).toHaveLength(1);
    expect(
      (await new DrizzleDecisionRepository().listByTripId(fixture.tripId)).filter(
        ({ idempotencyKey }) => idempotencyKey === fixture.idempotencyKey,
      ),
    ).toHaveLength(1);
    expect(
      await new DrizzleItineraryProposalRepository().findById(fixture.tripId, fixture.proposalId),
    ).toMatchObject({ status: "accepted" });
  } finally {
    await replayPage.close();
    await conflictingPage.close();
  }
});

test("mantém versão concorrente como erro recuperável sem persistir aceite", async ({
  page,
}, testInfo) => {
  const fixture = await createProposalFixture(
    `Versão concorrente ${testInfo.project.name} ${Date.now()}`,
  );
  await openAcceptance(page, fixture.tripId);

  const itineraryRepository = new DrizzleItineraryRepository();
  const current = await itineraryRepository.findByTripId(fixture.tripId);
  expect(current).not.toBeNull();
  const changed = addActivity(
    current!,
    {
      dayDate: "2026-08-22",
      title: "Alteração concorrente",
      startTime: "12:00",
      durationMinutes: 30,
    },
    new Date(),
  );
  await itineraryRepository.save(changed);

  await page.getByRole("button", { name: "Confirmar e aceitar proposta" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "O roteiro mudou desde a geração desta proposta.",
  );

  expect(await proposalApplicationRows(fixture)).toHaveLength(0);
  expect(
    await new DrizzleDecisionRepository().findByIdempotencyKey(
      fixture.tripId,
      fixture.idempotencyKey,
    ),
  ).toBeNull();
  expect(
    await new DrizzleItineraryProposalRepository().findById(fixture.tripId, fixture.proposalId),
  ).toMatchObject({ status: "ready" });
});

test("revisa uma Proposal ready sem aplicá-la ao Roteiro", async ({ page }, testInfo) => {
  const { tripId } = await createProposalFixture(`Proposta ${testInfo.project.name} ${Date.now()}`);
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
  await expect(page.getByRole("button", { name: /aplicar|gerar novamente/i })).toHaveCount(0);
  await expect(page.getByText("Aceitar proposta", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Descartar proposta" })).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/roteiro$/),
    page.getByRole("link", { name: "Voltar para o Roteiro" }).click(),
  ]);
  await expect(page.getByText(confirmedActivity, { exact: true })).toBeVisible();
  await expect(page.getByText(proposedActivity, { exact: true })).toHaveCount(0);
});

test("descarta uma Proposal ready e preserva integralmente o Roteiro", async ({
  page,
}, testInfo) => {
  const { tripId } = await createProposalFixture(
    `Descartar proposta ${testInfo.project.name} ${Date.now()}`,
  );
  const itineraryRepository = new DrizzleItineraryRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(tripId);
  await page.goto(`/viagens/${tripId}/roteiro/proposta`);

  await Promise.all([
    page.waitForURL(/\/roteiro\?propostaDescartada=1$/),
    page.getByRole("button", { name: "Descartar proposta" }).click(),
  ]);

  await expect(page.getByRole("status")).toHaveText(
    "Proposta descartada. Seu Roteiro atual não foi alterado.",
  );
  await expect(page.getByText(confirmedActivity, { exact: true })).toBeVisible();
  await expect(page.getByText(proposedActivity, { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Ver proposta" })).toHaveCount(0);

  const proposals = await new DrizzleItineraryProposalRepository().listByTripId(tripId);
  expect(proposals).toHaveLength(1);
  expect(proposals[0]).toMatchObject({ status: "rejected" });
  expect(proposals[0]?.rejectedAt).toBeInstanceOf(Date);
  expect(await itineraryRepository.findByTripId(tripId)).toEqual(itineraryBefore);
});

test("trata uma Proposal atualizada concorrentemente sem falso sucesso", async ({
  page,
}, testInfo) => {
  const { tripId } = await createProposalFixture(
    `Concorrência de proposta ${testInfo.project.name} ${Date.now()}`,
  );
  await page.goto(`/viagens/${tripId}/roteiro/proposta`);
  await page.waitForLoadState("networkidle");

  const repository = new DrizzleItineraryProposalRepository();
  const ready = (await repository.listByTripId(tripId)).find(({ status }) => status === "ready")!;
  const rejectedAt = new Date(Math.max(Date.now(), ready.updatedAt.getTime()) + 1_000);
  await repository.save(rejectItineraryProposal(ready, rejectedAt));

  await page.getByRole("button", { name: "Descartar proposta" }).click();
  await expect(page).toHaveURL(/\/roteiro\?erroProposta=estado-atualizado$/);

  await expect(page.locator(".itinerary-feedback")).toHaveText(
    /foi atualizada e não pode mais ser descartada/i,
  );
  await expect(page.getByText(confirmedActivity, { exact: true })).toBeVisible();
  await expect(page.getByText("Proposta descartada", { exact: false })).toHaveCount(0);
  expect((await repository.listByTripId(tripId))[0]?.rejectedAt).toEqual(rejectedAt);
});

test("mantém a rota direta recuperável quando não existe Proposal revisável", async ({
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

test("consulta uma Proposal expired somente como referência histórica", async ({
  page,
}, testInfo) => {
  const { tripId } = await createProposalFixture(
    `Proposta expirada ${testInfo.project.name} ${Date.now()}`,
    "expired",
  );
  await page.goto(`/viagens/${tripId}/roteiro`);

  await expect(page.getByText(confirmedActivity, { exact: true })).toBeVisible();
  await expect(page.getByText(proposedActivity, { exact: true })).toHaveCount(0);
  await Promise.all([
    page.waitForURL(/\/roteiro\/proposta$/),
    page.getByRole("link", { name: "Ver proposta expirada" }).click(),
  ]);

  await expect(page.getByText("Proposta expirada — somente referência")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Consulte o histórico desta proposta" }),
  ).toBeVisible();
  await expect(page.getByText(/Esta proposta não pode mais ser aplicada/i)).toBeVisible();
  await expect(page.getByText("Expirada em")).toBeVisible();
  await expect(page.getByRole("heading", { name: proposedActivity })).toBeVisible();
  await expect(page.getByRole("note")).toHaveText(/referência histórica/i);
  await expect(
    page.getByRole("button", { name: /aceitar|aplicar|descartar|gerar novamente/i }),
  ).toHaveCount(0);
});
