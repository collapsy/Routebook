import { expect, test, type Page } from "@playwright/test";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  getDatabase,
  places,
  savedPlaces,
} from "@routebook/database";
import type { ItineraryProposalId } from "@routebook/proposal-management";
import { addActivity, createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test.setTimeout(120_000);

const PROPOSAL_FIXTURE_CENTER = Object.freeze({
  latitude: 1,
  longitude: 1,
});

type GenerationFixture = Readonly<{
  tripId: string;
  placeId?: string;
  placeTitle?: string;
}>;

async function createGenerationFixture(
  tripName: string,
  withEligiblePreference: boolean,
  withPlaceAlreadyPlanned = false,
  intent: "WANT" | "MAYBE" = "WANT",
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

  if (!withEligiblePreference) return Object.freeze({ tripId: trip.id });

  const database = getDatabase();
  const placeId = crypto.randomUUID();
  const preferenceId = crypto.randomUUID();
  const placeTitle = `Praia do Amor E2E ${placeId.slice(0, 8)}`;

  await database.insert(places).values({
    id: placeId,
    destinationId: "pipa-rn",
    slug: `praia-do-amor-e2e-${placeId}`,
    name: placeTitle,
    summary: "Praia com falésias e ondas para validar a geração integral.",
    category: "beach",
    latitude: PROPOSAL_FIXTURE_CENTER.latitude,
    longitude: PROPOSAL_FIXTURE_CENTER.longitude,
    addressLabel: "Pipa, Tibau do Sul - RN",
    publicationStatus: "published",
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(savedPlaces).values({
    id: preferenceId,
    tripId: trip.id,
    placeId,
    intent,
    priority: null,
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
  const itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);
  await new DrizzleItineraryRepository().save(itinerary);

  const database = getDatabase();
  for (let index = 0; index < candidateCount; index += 1) {
    const placeId = crypto.randomUUID();
    const preferenceId = crypto.randomUUID();
    await database.insert(places).values({
      id: placeId,
      destinationId: "pipa-rn",
      slug: `density-place-${index}-${placeId}`,
      name: `Lugar de densidade ${index + 1}`,
      summary: "Opção elegível para validar o teto diário da Proposal.",
      category: "beach",
      latitude: PROPOSAL_FIXTURE_CENTER.latitude + index * 0.001,
      longitude: PROPOSAL_FIXTURE_CENTER.longitude + index * 0.001,
      addressLabel: "Pipa, Tibau do Sul - RN",
      publicationStatus: "published",
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(savedPlaces).values({
      id: preferenceId,
      tripId: trip.id,
      placeId,
      intent: "WANT",
      priority: index === 0 ? "MUST_DO" : null,
      createdAt: new Date(now.getTime() + index),
      updatedAt: now,
    });
  }

  return trip.id;
}

async function createFullDensityEmptyFixture(tripName: string): Promise<string> {
  const now = new Date();
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-22",
    },
    now,
  );
  let itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);
  for (let index = 0; index < 3; index += 1) {
    itinerary = addActivity(
      itinerary,
      {
        dayDate: "2026-08-22",
        title: `Atividade existente ${index + 1}`,
      },
      new Date(now.getTime() + index + 1),
    );
  }
  await new DrizzleItineraryRepository().save(itinerary);
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

  const maybeOption = page.getByRole("checkbox", {
    name: "Incluir lugares marcados como Talvez nesta proposta",
  });
  await expect(maybeOption).not.toBeChecked();
  if (includeMaybe) await maybeOption.check();

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

test("gera uma Proposal ready da UI ao PostgreSQL sem alterar o Itinerary", async ({
  page,
}, testInfo) => {
  const fixture = await createGenerationFixture(
    `Geração integral ${testInfo.project.name} ${Date.now()}`,
    true,
  );
  const itineraryRepository = new DrizzleItineraryRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(fixture.tripId);
  expect(itineraryBefore).not.toBeNull();

  const proposalId = await generateProposalFromEmptyState(page, fixture.tripId);

  await expect(page.getByRole("heading", { level: 1, name: "Proposta de Roteiro" })).toBeVisible();
  await expect(page.getByText("Proposta aguardando sua decisão").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: fixture.placeTitle! })).toBeVisible();

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

  await page.reload();
  await expect(page.getByRole("heading", { name: fixture.placeTitle! })).toBeVisible();
  expect(
    await new DrizzleItineraryProposalRepository().findById(fixture.tripId, proposalId),
  ).toEqual(proposal);
  expect(await itineraryRepository.findByTripId(fixture.tripId)).toEqual(itineraryBefore);
});

test("Talvez só participa quando o usuário ativa a opção da geração", async ({ page }, testInfo) => {
  const withoutMaybe = await createGenerationFixture(
    `Talvez desativado ${testInfo.project.name} ${Date.now()}`,
    true,
    false,
    "MAYBE",
  );
  const proposalWithoutMaybeId = await generateProposalFromEmptyState(page, withoutMaybe.tripId);
  const proposalWithoutMaybe = await new DrizzleItineraryProposalRepository().findById(
    withoutMaybe.tripId,
    proposalWithoutMaybeId,
  );
  expect(proposalWithoutMaybe?.proposedActivities).toEqual([]);

  const withMaybe = await createGenerationFixture(
    `Talvez ativado ${testInfo.project.name} ${Date.now()}`,
    true,
    false,
    "MAYBE",
  );
  const proposalWithMaybeId = await generateProposalFromEmptyState(page, withMaybe.tripId, true);
  const proposalWithMaybe = await new DrizzleItineraryProposalRepository().findById(
    withMaybe.tripId,
    proposalWithMaybeId,
  );
  expect(proposalWithMaybe?.proposedActivities).toEqual(
    expect.arrayContaining([expect.objectContaining({ placeId: withMaybe.placeId })]),
  );
});

test("limita a densidade diária sem alterar o Itinerary antes do aceite", async ({
  page,
}, testInfo) => {
  const tripId = await createDensityFixture(
    `Densidade Proposal ${testInfo.project.name} ${Date.now()}`,
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
  expect(proposal?.limitations).toContain(
    "5 candidato(s) elegível(is) não foram propostos porque os Dias disponíveis atingiram a densidade desejada ou foram preservados como vazios intencionais.",
  );
  await expect(
    page.getByText(
      "5 candidato(s) elegível(is) não foram propostos porque os Dias disponíveis atingiram a densidade desejada ou foram preservados como vazios intencionais.",
    ),
  ).toBeVisible();
  expect(await itineraryRepository.findByTripId(tripId)).toEqual(itineraryBefore);
});

test("Proposal ready vazia continua auditável sem parecer uma decisão aplicável", async ({
  page,
}, testInfo) => {
  const tripId = await createFullDensityEmptyFixture(
    `Geração sem espaço ${testInfo.project.name} ${Date.now()}`,
  );
  const itineraryRepository = new DrizzleItineraryRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(tripId);
  expect(itineraryBefore).not.toBeNull();

  const proposalId = await generateProposalFromEmptyState(page, tripId);

  await expect(page.getByText("Sem mudanças sugeridas").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nenhuma mudança para aplicar" })).toBeVisible();
  await expect(page.getByText("Nenhuma mudança adequada foi proposta")).toBeVisible();
  await expect(page.getByText("Aceitar proposta")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Descartar proposta" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Descartar e gerar outra" })).toBeVisible();

  const proposal = await new DrizzleItineraryProposalRepository().findById(tripId, proposalId);
  expect(proposal).toMatchObject({ status: "ready", proposedActivities: [] });
  expect(proposal?.limitations).toContain(
    "Nenhum candidato elegível foi recebido; a proposta não contém mudanças e o Roteiro atual permanece preservado.",
  );
  expect(await itineraryRepository.findByTripId(tripId)).toEqual(itineraryBefore);

  await page.reload();
  await expect(page.getByText("Sem mudanças sugeridas").first()).toBeVisible();
  expect(await itineraryRepository.findByTripId(tripId)).toEqual(itineraryBefore);
});

test("não propõe novamente Place que já está no Roteiro", async ({ page }, testInfo) => {
  const fixture = await createGenerationFixture(
    `Geração sem duplicata ${testInfo.project.name} ${Date.now()}`,
    true,
    true,
  );
  const itineraryRepository = new DrizzleItineraryRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(fixture.tripId);
  expect(itineraryBefore).not.toBeNull();

  const proposalId = await generateProposalFromEmptyState(page, fixture.tripId);

  await expect(page.getByRole("heading", { name: fixture.placeTitle! })).toHaveCount(0);
  const proposal = await new DrizzleItineraryProposalRepository().findById(
    fixture.tripId,
    proposalId,
  );
  expect(proposal).toMatchObject({ status: "ready" });
  const proposedActivities = proposal?.proposedActivities ?? [];
  expect(proposedActivities.some((activity) => activity.placeId === fixture.placeId)).toBe(false);
  expect(await itineraryRepository.findByTripId(fixture.tripId)).toEqual(itineraryBefore);
});
