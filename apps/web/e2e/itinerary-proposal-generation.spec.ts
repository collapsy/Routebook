import { expect, test, type Page } from "@playwright/test";
import { eq } from "drizzle-orm";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleRecommendationRepository,
  DrizzleTripPlacePreferenceRepository,
  getDatabase,
  places,
  recommendations,
  trips,
} from "@routebook/database";
import type { ItineraryProposalId } from "@routebook/proposal-management";
import { addActivity, createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test.setTimeout(120_000);

const PROPOSAL_FIXTURE_CENTER = Object.freeze({
  latitude: 1,
  longitude: 1,
});

type SelectionIntent = "WANT" | "MAYBE" | "NOT_INTERESTED";

type GenerationFixture = Readonly<{
  tripId: string;
  placeId: string;
  placeTitle: string;
}>;

function dateInTimeZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function addCalendarDays(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function createReplanningFixture(tripName: string) {
  const now = new Date();
  const timeZone = "America/Fortaleza";
  const startDate = dateInTimeZone(now, timeZone);
  const endDate = addCalendarDays(startDate, 2);
  const { trip } = await createAuthenticatedE2ETrip({ name: tripName, startDate, endDate }, now);
  const itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);
  const itineraryWithProtectedActivity = addActivity(
    itinerary,
    {
      dayDate: startDate,
      title: "Compromisso protegido do replanejamento",
      startTime: "09:00",
      durationMinutes: 60,
      flexibility: "fixed",
    },
    now,
  );
  const itineraryRepository = new DrizzleItineraryRepository();
  await itineraryRepository.save(itineraryWithProtectedActivity);

  const database = getDatabase();
  const placeId = crypto.randomUUID();
  const placeTitle = `Lugar para replanejar ${placeId.slice(0, 8)}`;
  await database.update(trips).set({ status: "in-progress" }).where(eq(trips.id, trip.id));
  await database.insert(places).values({
    id: placeId,
    destinationId: "pipa-rn",
    slug: `replanning-place-e2e-${placeId}`,
    name: placeTitle,
    summary: "Lugar selecionado para testar replanejamento explícito.",
    category: "beach",
    latitude: PROPOSAL_FIXTURE_CENTER.latitude,
    longitude: PROPOSAL_FIXTURE_CENTER.longitude,
    addressLabel: "Pipa, Tibau do Sul - RN",
    publicationStatus: "published",
    createdAt: now,
    updatedAt: now,
  });
  await new DrizzleTripPlacePreferenceRepository().save({
    id: crypto.randomUUID(),
    tripId: trip.id,
    placeId,
    intent: "WANT",
    priority: null,
    createdAt: now,
    updatedAt: now,
  });

  return { tripId: trip.id, placeTitle, itinerary: itineraryWithProtectedActivity };
}

async function createSelectionFixture(
  tripName: string,
  intent: SelectionIntent = "WANT",
  priority: "MUST_DO" | null = null,
  withPlaceAlreadyPlanned = false,
): Promise<GenerationFixture> {
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

  const database = getDatabase();
  const placeId = crypto.randomUUID();
  const preferenceId = crypto.randomUUID();
  const placeTitle = `Lugar selecionado E2E ${placeId.slice(0, 8)}`;

  await database.insert(places).values({
    id: placeId,
    destinationId: "pipa-rn",
    slug: `selection-place-e2e-${placeId}`,
    name: placeTitle,
    summary: "Lugar criado para validar a seleção autoritativa da Proposal.",
    category: "beach",
    latitude: PROPOSAL_FIXTURE_CENTER.latitude,
    longitude: PROPOSAL_FIXTURE_CENTER.longitude,
    addressLabel: "Pipa, Tibau do Sul - RN",
    publicationStatus: "published",
    createdAt: now,
    updatedAt: now,
  });

  await new DrizzleTripPlacePreferenceRepository().save({
    id: preferenceId,
    tripId: trip.id,
    placeId,
    intent,
    priority,
    createdAt: now,
    updatedAt: now,
  });

  if (withPlaceAlreadyPlanned) {
    const updatedItinerary = addActivity(
      itinerary,
      {
        dayDate: "2026-08-22",
        title: placeTitle,
        placeId,
      },
      now,
    );
    await new DrizzleItineraryRepository().save(updatedItinerary);
  }

  return Object.freeze({ tripId: trip.id, placeId, placeTitle });
}

async function createRecommendationOnlyFixture(tripName: string): Promise<GenerationFixture> {
  const now = new Date();
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-23",
    },
    now,
  );
  await new DrizzleItineraryRepository().save(
    createItinerary({ tripId: trip.id, period: trip.period }, now),
  );

  const database = getDatabase();
  const placeId = crypto.randomUUID();
  const recommendationId = crypto.randomUUID();
  const placeTitle = `Recommendation sem seleção ${placeId.slice(0, 8)}`;

  await database.insert(places).values({
    id: placeId,
    destinationId: "pipa-rn",
    slug: `recommendation-only-${placeId}`,
    name: placeTitle,
    summary: "Recommendation que não recebeu intenção explícita do viajante.",
    category: "nature",
    latitude: PROPOSAL_FIXTURE_CENTER.latitude,
    longitude: PROPOSAL_FIXTURE_CENTER.longitude,
    addressLabel: "Pipa, Tibau do Sul - RN",
    publicationStatus: "published",
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(recommendations).values({
    id: recommendationId,
    tripId: trip.id,
    placeId,
    status: "presented",
    contextSnapshot: {
      schemaVersion: 1,
      tripId: trip.id,
      destinationId: "pipa-rn",
      tripContextVersion: trip.contextVersion,
      capturedAt: now.toISOString(),
    },
    contextFingerprint: "e".repeat(64),
    reasons: [{ code: "scenic", message: "Recommendation sem preferência.", evidence: {} }],
    limitations: [],
    score: 0.99,
    confidenceLevel: "high",
    confidenceBasis: ["published-place"],
    validFrom: new Date(now.getTime() - 60_000),
    expiresAt: new Date(now.getTime() + 86_400_000),
    generator: "deterministic",
    policyVersion: "rb-inc-203-e2e",
    generatedAt: new Date(now.getTime() - 60_000),
    presentedAt: new Date(now.getTime() - 30_000),
    resolvedAt: null,
    linkedDecisionId: null,
    statusReason: null,
    supersededByRecommendationId: null,
    createdAt: now,
    updatedAt: now,
  });

  return Object.freeze({ tripId: trip.id, placeId, placeTitle });
}

async function createDensityFixture(tripName: string, candidateCount: number): Promise<string> {
  const now = new Date();
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-22",
    },
    now,
  );
  await new DrizzleItineraryRepository().save(
    createItinerary({ tripId: trip.id, period: trip.period }, now),
  );

  const database = getDatabase();
  const preferenceRepository = new DrizzleTripPlacePreferenceRepository();
  for (let index = 0; index < candidateCount; index += 1) {
    const placeId = crypto.randomUUID();
    await database.insert(places).values({
      id: placeId,
      destinationId: "pipa-rn",
      slug: `density-selection-${index}-${placeId}`,
      name: `Lugar de densidade ${index + 1}`,
      summary: "Opção escolhida para validar o teto diário da Proposal.",
      category: index % 2 === 0 ? "beach" : "nature",
      latitude: PROPOSAL_FIXTURE_CENTER.latitude + index * 0.001,
      longitude: PROPOSAL_FIXTURE_CENTER.longitude + index * 0.001,
      addressLabel: "Pipa, Tibau do Sul - RN",
      publicationStatus: "published",
      createdAt: now,
      updatedAt: now,
    });
    await preferenceRepository.save({
      id: crypto.randomUUID(),
      tripId: trip.id,
      placeId,
      intent: "WANT",
      priority: index === candidateCount - 1 ? "MUST_DO" : null,
      createdAt: new Date(now.getTime() + index),
      updatedAt: new Date(now.getTime() + index),
    });
  }

  return trip.id;
}

async function generateProposalFromEmptyState(
  page: Page,
  tripId: string,
  includeMaybe = false,
): Promise<ItineraryProposalId> {
  await page.goto(`/viagens/${tripId}/roteiro`);
  const proposalEntryPoint = page.getByRole("link", { name: "Gerar proposta" });
  const proposalPath = `/viagens/${tripId}/roteiro/proposta`;
  await expect(proposalEntryPoint).toHaveAttribute("href", proposalPath);
  await page.goto(proposalPath);
  await expect(page.getByRole("heading", { name: "Nenhuma proposta disponível" })).toBeVisible();

  const maybeCheckbox = page.getByRole("checkbox", {
    name: "Incluir lugares marcados como Talvez",
  });
  await expect(maybeCheckbox).toBeEnabled();
  await expect(maybeCheckbox).not.toBeChecked();
  if (includeMaybe) {
    await maybeCheckbox.check();
    await expect(maybeCheckbox).toBeChecked();
  }

  const generateButton = page.getByRole("button", { name: "Gerar proposta de roteiro" });
  await expect(generateButton).toBeEnabled();
  const actionPathname = new URL(page.url()).pathname;
  const actionResponse = page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === "POST" && new URL(request.url()).pathname === actionPathname;
  });
  const generatedUrl = /\/roteiro\/proposta\?propostaGerada=[0-9a-f-]+$/i;
  const [response] = await Promise.all([actionResponse, generateButton.click()]);
  const redirectUrl = response.headers()["x-action-redirect"]?.split(";")[0];
  expect(redirectUrl).toMatch(generatedUrl);
  await page.goto(redirectUrl!);
  await expect(page.getByRole("heading", { level: 1, name: "Proposta de Roteiro" })).toBeVisible();
  await expect(page).toHaveURL(generatedUrl);

  const proposalId = new URL(page.url()).searchParams.get("propostaGerada");
  expect(proposalId).toMatch(/^[0-9a-f-]{36}$/i);
  return proposalId as ItineraryProposalId;
}

test("gera Proposal a partir de WANT sem alterar o Itinerary", async ({ page }, testInfo) => {
  const fixture = await createSelectionFixture(
    `Geração por seleção ${testInfo.project.name} ${Date.now()}`,
  );
  const itineraryRepository = new DrizzleItineraryRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(fixture.tripId);
  expect(itineraryBefore).not.toBeNull();

  const proposalId = await generateProposalFromEmptyState(page, fixture.tripId);

  await expect(page.getByText("Proposta aguardando sua decisão").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: fixture.placeTitle })).toBeVisible();
  await expect(page.getByText("Lugar escolhido como Quero ir na Minha seleção.")).toBeVisible();

  const proposal = await new DrizzleItineraryProposalRepository().findById(
    fixture.tripId,
    proposalId,
  );
  expect(proposal).toMatchObject({
    id: proposalId,
    tripId: fixture.tripId,
    status: "ready",
    generationMethod: "deterministic-contextual-composition",
    generationVersion: "3",
  });
  expect(proposal?.proposedActivities).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        placeId: fixture.placeId,
        title: fixture.placeTitle,
        operationType: "add",
      }),
    ]),
  );
  expect(await itineraryRepository.findByTripId(fixture.tripId)).toEqual(itineraryBefore);
});

test("replaneja somente após escolha explícita e revisa o snapshot temporal antes do aceite", async ({
  page,
}, testInfo) => {
  const fixture = await createReplanningFixture(
    `Replanejamento explícito ${testInfo.project.name} ${Date.now()}`,
  );
  const itineraryRepository = new DrizzleItineraryRepository();

  await page.goto(`/viagens/${fixture.tripId}/roteiro`);
  const replanLink = page.getByRole("link", { name: "Replanejar dias futuros" });
  await expect(replanLink).toHaveAttribute(
    "href",
    `/viagens/${fixture.tripId}/roteiro/proposta?scope=REPLAN`,
  );
  await replanLink.click();

  await expect(
    page.getByRole("heading", { name: "Nenhuma proposta de replanejamento disponível" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Gerar proposta de replanejamento" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Gerar proposta de replanejamento" }).click();
  await expect(page).toHaveURL(/scope=REPLAN&propostaGerada=[0-9a-f-]+$/i);
  await expect(
    page.getByRole("heading", { name: "Recorte temporal desta proposta" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: fixture.placeTitle })).toBeVisible();
  await expect(page.getByText(/atividade\(s\) protegida\(s\)/)).toBeVisible();

  const proposalId = new URL(page.url()).searchParams.get("propostaGerada");
  expect(proposalId).toMatch(/^[0-9a-f-]{36}$/i);
  const proposal = await new DrizzleItineraryProposalRepository().findById(
    fixture.tripId,
    proposalId as ItineraryProposalId,
  );
  expect(proposal).toMatchObject({
    status: "ready",
    generationScope: "REPLAN",
    generationContext: {
      replanningWindow: {
        timeZone: "America/Fortaleza",
        eligibleDayIds: expect.arrayContaining([fixture.itinerary.days[0]!.id]),
        protectedActivityIds: expect.arrayContaining([
          fixture.itinerary.days[0]!.activities[0]!.id,
        ]),
      },
    },
  });
  expect(await itineraryRepository.findByTripId(fixture.tripId)).toEqual(fixture.itinerary);

  await page.getByText("Aceitar proposta", { exact: true }).click();
  await page.getByRole("checkbox", { name: /atualizará o Roteiro/i }).check();
  await page.getByRole("button", { name: "Confirmar e aceitar proposta" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/viagens/${fixture.tripId}/roteiro\\?propostaAceita=applied`),
  );
  const appliedItinerary = await itineraryRepository.findByTripId(fixture.tripId);
  expect(appliedItinerary?.days.flatMap((day) => day.activities)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ title: "Compromisso protegido do replanejamento" }),
      expect.objectContaining({ title: fixture.placeTitle }),
    ]),
  );
});

test("MAYBE fica fora por padrão", async ({ page }, testInfo) => {
  const fixture = await createSelectionFixture(
    `Talvez fora ${testInfo.project.name} ${Date.now()}`,
    "MAYBE",
  );

  const proposalId = await generateProposalFromEmptyState(page, fixture.tripId);

  await expect(page.getByText("Sem mudanças sugeridas").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: fixture.placeTitle })).toHaveCount(0);
  const proposal = await new DrizzleItineraryProposalRepository().findById(
    fixture.tripId,
    proposalId,
  );
  expect(proposal).toMatchObject({ status: "ready", proposedActivities: [] });
});

test("MAYBE entra somente após opt-in explícito", async ({ page }, testInfo) => {
  const fixture = await createSelectionFixture(
    `Talvez incluído ${testInfo.project.name} ${Date.now()}`,
    "MAYBE",
  );

  const proposalId = await generateProposalFromEmptyState(page, fixture.tripId, true);

  await expect(page.getByRole("heading", { name: fixture.placeTitle })).toBeVisible();
  await expect(
    page.getByText("Lugar marcado como Talvez e incluído explicitamente nesta geração."),
  ).toBeVisible();
  const proposal = await new DrizzleItineraryProposalRepository().findById(
    fixture.tripId,
    proposalId,
  );
  expect(proposal?.proposedActivities).toEqual(
    expect.arrayContaining([expect.objectContaining({ placeId: fixture.placeId })]),
  );
});

test("Recommendation sem TripPlacePreference não alimenta a Proposal", async ({
  page,
}, testInfo) => {
  const fixture = await createRecommendationOnlyFixture(
    `Recommendation isolada ${testInfo.project.name} ${Date.now()}`,
  );
  const recommendationRepository = new DrizzleRecommendationRepository();
  expect(await recommendationRepository.listByTripId(fixture.tripId)).toHaveLength(1);

  const proposalId = await generateProposalFromEmptyState(page, fixture.tripId);

  await expect(page.getByText("Sem mudanças sugeridas").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: fixture.placeTitle })).toHaveCount(0);
  const proposal = await new DrizzleItineraryProposalRepository().findById(
    fixture.tripId,
    proposalId,
  );
  expect(proposal).toMatchObject({ status: "ready", proposedActivities: [] });
  expect(await recommendationRepository.listByTripId(fixture.tripId)).toHaveLength(1);
});

test("respeita densidade diária usando somente a seleção explícita", async ({ page }, testInfo) => {
  const tripId = await createDensityFixture(
    `Densidade seleção ${testInfo.project.name} ${Date.now()}`,
    5,
  );
  const itineraryRepository = new DrizzleItineraryRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(tripId);
  expect(itineraryBefore).not.toBeNull();

  const proposalId = await generateProposalFromEmptyState(page, tripId);
  const proposal = await new DrizzleItineraryProposalRepository().findById(tripId, proposalId);

  expect(proposal).toMatchObject({
    status: "ready",
    generationVersion: "3",
  });
  expect(proposal?.proposedActivities).toHaveLength(3);
  expect(await itineraryRepository.findByTripId(tripId)).toEqual(itineraryBefore);
});

test("não propõe novamente Place que já está em Activity ativa", async ({ page }, testInfo) => {
  const fixture = await createSelectionFixture(
    `Seleção sem duplicata ${testInfo.project.name} ${Date.now()}`,
    "WANT",
    null,
    true,
  );
  const itineraryRepository = new DrizzleItineraryRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(fixture.tripId);
  expect(itineraryBefore).not.toBeNull();

  const proposalId = await generateProposalFromEmptyState(page, fixture.tripId);

  await expect(page.getByRole("heading", { name: fixture.placeTitle })).toHaveCount(0);
  const proposal = await new DrizzleItineraryProposalRepository().findById(
    fixture.tripId,
    proposalId,
  );
  expect(proposal).toMatchObject({ status: "ready" });
  expect(
    proposal?.proposedActivities?.some((activity) => activity.placeId === fixture.placeId),
  ).toBe(false);
  expect(await itineraryRepository.findByTripId(fixture.tripId)).toEqual(itineraryBefore);
});
