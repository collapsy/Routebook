import { expect, test, type Page } from "@playwright/test";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  getDatabase,
  places,
  recommendations,
} from "@routebook/database";
import type { ItineraryProposalId } from "@routebook/proposal-management";
import { addActivity, createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test.setTimeout(120_000);

type GenerationFixture = Readonly<{
  tripId: string;
  placeId?: string;
  placeTitle?: string;
}>;

async function createGenerationFixture(
  tripName: string,
  withEligibleRecommendation: boolean,
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

  if (!withEligibleRecommendation) return Object.freeze({ tripId: trip.id });

  const database = getDatabase();
  const placeId = crypto.randomUUID();
  const recommendationId = crypto.randomUUID();
  const placeTitle = `Praia do Amor E2E ${placeId.slice(0, 8)}`;

  await database.insert(places).values({
    id: placeId,
    destinationId: "pipa-rn",
    slug: `praia-do-amor-e2e-${placeId}`,
    name: placeTitle,
    summary: "Praia com falésias e ondas para validar a geração integral.",
    category: "beach",
    latitude: -6.235,
    longitude: -35.045,
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
    contextSnapshot: { schemaVersion: 1, tripId: trip.id },
    contextFingerprint: "e".repeat(64),
    reasons: [
      {
        code: "scenic",
        message: "Boa opção para compor o roteiro gerado.",
        evidence: {},
      },
    ],
    limitations: [],
    score: 0.9,
    confidenceLevel: "high",
    confidenceBasis: ["published-place"],
    validFrom: new Date(now.getTime() - 60_000),
    expiresAt: new Date(now.getTime() + 86_400_000),
    generator: "deterministic",
    policyVersion: "rb-inc-102",
    generatedAt: new Date(now.getTime() - 120_000),
    presentedAt: new Date(now.getTime() - 60_000),
    resolvedAt: null,
    linkedDecisionId: null,
    statusReason: null,
    supersededByRecommendationId: null,
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

async function generateProposalFromEmptyState(
  page: Page,
  tripId: string,
): Promise<ItineraryProposalId> {
  await page.goto(`/viagens/${tripId}/roteiro`);
  const proposalEntryPoint = page.getByRole("link", { name: "Gerar proposta" });
  const proposalPath = `/viagens/${tripId}/roteiro/proposta`;
  await expect(proposalEntryPoint).toHaveAttribute("href", proposalPath);
  await page.goto(proposalPath);
  await expect(page.getByRole("heading", { name: "Nenhuma proposta disponível" })).toBeVisible();

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
  await expect(page.getByText("Sugestão — ainda não aplicada")).toBeVisible();
  await expect(page.getByRole("heading", { name: fixture.placeTitle! })).toBeVisible();
  await expect(page.getByText("Boa opção para compor o roteiro gerado.")).toBeVisible();

  const proposal = await new DrizzleItineraryProposalRepository().findById(
    fixture.tripId,
    proposalId,
  );
  expect(proposal).toMatchObject({
    id: proposalId,
    tripId: fixture.tripId,
    status: "ready",
    generationMethod: "deterministic-candidate-balancing",
    generationVersion: "1",
    proposedActivities: [
      expect.objectContaining({
        placeId: fixture.placeId,
        title: fixture.placeTitle,
        operationType: "add",
      }),
    ],
  });
  expect(await itineraryRepository.findByTripId(fixture.tripId)).toEqual(itineraryBefore);

  await page.reload();
  await expect(page.getByRole("heading", { name: fixture.placeTitle! })).toBeVisible();
  expect(
    await new DrizzleItineraryProposalRepository().findById(fixture.tripId, proposalId),
  ).toEqual(proposal);
  expect(await itineraryRepository.findByTripId(fixture.tripId)).toEqual(itineraryBefore);
});

test("gera Proposal ready sem mudanças quando não há Recommendation elegível", async ({
  page,
}, testInfo) => {
  const fixture = await createGenerationFixture(
    `Geração sem candidatos ${testInfo.project.name} ${Date.now()}`,
    false,
  );
  const itineraryRepository = new DrizzleItineraryRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(fixture.tripId);
  expect(itineraryBefore).not.toBeNull();

  const proposalId = await generateProposalFromEmptyState(page, fixture.tripId);

  await expect(page.getByText("Nenhuma mudança adequada foi proposta")).toBeVisible();
  await expect(
    page.getByText(
      "Nenhum candidato elegível foi recebido; a proposta não contém mudanças e o Roteiro atual permanece preservado.",
    ),
  ).toBeVisible();

  const proposal = await new DrizzleItineraryProposalRepository().findById(
    fixture.tripId,
    proposalId,
  );
  expect(proposal).toMatchObject({ status: "ready", proposedActivities: [] });
  expect(await itineraryRepository.findByTripId(fixture.tripId)).toEqual(itineraryBefore);

  await page.reload();
  await expect(page.getByText("Nenhuma mudança adequada foi proposta")).toBeVisible();
  expect(await itineraryRepository.findByTripId(fixture.tripId)).toEqual(itineraryBefore);
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

  await expect(page.getByText("Nenhuma mudança adequada foi proposta")).toBeVisible();
  await expect(page.getByRole("heading", { name: fixture.placeTitle! })).toHaveCount(0);
  expect(
    await new DrizzleItineraryProposalRepository().findById(fixture.tripId, proposalId),
  ).toMatchObject({ status: "ready", proposedActivities: [] });
  expect(await itineraryRepository.findByTripId(fixture.tripId)).toEqual(itineraryBefore);
});
