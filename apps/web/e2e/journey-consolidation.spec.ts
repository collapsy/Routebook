import { expect, test, type Page } from "@playwright/test";
import { eq } from "drizzle-orm";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleTravelerProfileRepository,
  DrizzleTripPlacePreferenceRepository,
  getDatabase,
  places,
  trips,
} from "@routebook/database";
import type { ItineraryProposalId } from "@routebook/proposal-management";
import { createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test.setTimeout(120_000);

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

async function expectHeadingBelowStickyHeader(page: Page, headingName: string | RegExp) {
  const heading = page.getByRole("heading", { name: headingName, level: 2 });
  await expect(heading).toBeVisible();
  await expect
    .poll(async () => {
      const [headingBox, headerBox] = await Promise.all([
        heading.boundingBox(),
        page.locator(".app-header").boundingBox(),
      ]);
      return Boolean(headingBox && headerBox && headingBox.y >= headerBox.y + headerBox.height);
    })
    .toBe(true);
}

test("orienta uma Trip sem Itinerary sem criá-lo ao abrir o Roteiro", async ({
  page,
}, testInfo) => {
  const now = new Date();
  const startDate = addCalendarDays(dateInTimeZone(now, "America/Fortaleza"), 30);
  const endDate = addCalendarDays(startDate, 2);
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: `Roteiro não iniciado ${testInfo.project.name} ${crypto.randomUUID()}`,
      startDate,
      endDate,
    },
    now,
  );
  const itineraryRepository = new DrizzleItineraryRepository();
  expect(await itineraryRepository.findByTripId(trip.id)).toBeNull();

  await page.goto(`/viagens/${trip.id}/roteiro`);

  await expect(
    page.getByRole("heading", { level: 1, name: "Seu roteiro ainda não foi iniciado" }),
  ).toBeVisible();
  await expect(page.getByText(/ainda não tem um roteiro aplicado/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Começar roteiro" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continuar preparação" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares?preparar=1`,
  );
  await expect(page.getByRole("link", { name: "Voltar para a viagem" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}`,
  );
  expect(await itineraryRepository.findByTripId(trip.id)).toBeNull();

  await page.getByRole("link", { name: "Continuar preparação" }).click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares\\?preparar=1$`));
  await expect(page.locator('[data-planning-wizard-step="places"]')).toBeVisible();
  expect(await itineraryRepository.findByTripId(trip.id)).toBeNull();

  await page.goto(`/viagens/${trip.id}/roteiro`);
  const actionPathname = new URL(page.url()).pathname;
  const actionResponse = page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === "POST" && new URL(request.url()).pathname === actionPathname;
  });
  const [response] = await Promise.all([
    actionResponse,
    page.getByRole("button", { name: "Começar roteiro" }).click(),
  ]);
  expect(response.headers()["x-action-redirect"]?.split(";")[0]).toBe(
    `/viagens/${trip.id}/roteiro`,
  );
  await expect.poll(() => itineraryRepository.findByTripId(trip.id)).not.toBeNull();
  const startedItinerary = await itineraryRepository.findByTripId(trip.id);
  expect(startedItinerary).not.toBeNull();
  expect(startedItinerary?.days.every((day) => day.activities.length === 0)).toBe(true);

  const emptyItineraryTrip = await createAuthenticatedE2ETrip(
    {
      name: `Roteiro vazio existente ${testInfo.project.name} ${crypto.randomUUID()}`,
      startDate,
      endDate,
    },
    now,
  );
  const emptyItinerary = createItinerary(
    { tripId: emptyItineraryTrip.trip.id, period: emptyItineraryTrip.trip.period },
    now,
  );
  await itineraryRepository.save(emptyItinerary);
  await page.goto(`/viagens/${emptyItineraryTrip.trip.id}/roteiro`);

  await expect(page.getByRole("heading", { name: "Comece adicionando um lugar" })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Seu roteiro ainda não foi iniciado" }),
  ).toHaveCount(0);
  expect(await itineraryRepository.findByTripId(emptyItineraryTrip.trip.id)).toEqual(
    emptyItinerary,
  );
});

test("consolida a preparação até o Roteiro aplicado na mesma Trip", async ({ page }, testInfo) => {
  const now = new Date();
  const startDate = addCalendarDays(dateInTimeZone(now, "America/Fortaleza"), 30);
  const endDate = addCalendarDays(startDate, 2);
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: `Jornada integrada ${testInfo.project.name} ${crypto.randomUUID()}`,
      startDate,
      endDate,
    },
    now,
  );
  const [place] = await getDatabase()
    .select({ id: places.id, name: places.name })
    .from(places)
    .where(eq(places.slug, "praia-do-amor"))
    .limit(1);
  if (!place) throw new Error("Fixture publicada Praia do Amor não encontrada.");
  const { id: placeId, name: placeTitle } = place;

  const itineraryRepository = new DrizzleItineraryRepository();
  const proposalRepository = new DrizzleItineraryProposalRepository();
  const preferenceRepository = new DrizzleTripPlacePreferenceRepository();
  const itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);
  await itineraryRepository.save(itinerary);
  const itineraryBeforePreparation = await itineraryRepository.findByTripId(trip.id);
  expect(itineraryBeforePreparation).not.toBeNull();
  expect(await proposalRepository.listByTripId(trip.id)).toHaveLength(0);

  await page.goto(
    `/viagens/${trip.id}/lugares?preparar=1&descoberta=ocultar&busca=${encodeURIComponent(placeTitle)}&categoria=beach`,
  );
  await expect(page.locator('[data-planning-wizard-step="places"]')).toBeVisible();

  const placeCard = page
    .getByRole("list", { name: "Opções de lugares" })
    .locator('[data-place-source="published"]')
    .filter({ hasText: placeTitle })
    .first();
  await expect(placeCard).toBeVisible();
  const wantButton = placeCard.getByRole("button", { name: "Quero ir" });
  if (testInfo.project.name === "mobile-chromium") {
    await wantButton.tap();
  } else {
    await wantButton.focus();
    await page.keyboard.press("Enter");
  }
  await expect(wantButton).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() => preferenceRepository.find(trip.id, placeId))
    .toMatchObject({
      intent: "WANT",
      placeId,
    });
  expect(await itineraryRepository.findByTripId(trip.id)).toEqual(itineraryBeforePreparation);

  await page.getByRole("link", { name: "Revisar seleção" }).first().click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares-salvos\\?preparar=1$`));
  await expect(page.locator(".place-card").filter({ hasText: placeTitle })).toContainText(
    "Preferência: Quero ir",
  );
  await page.reload();
  await expect(page.locator(".place-card").filter({ hasText: placeTitle })).toContainText(
    "Preferência: Quero ir",
  );
  await expect(page.getByRole("link", { name: "Continuar para Contexto" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/contexto?preparar=1`,
  );
  await page.getByRole("link", { name: "Continuar para Contexto" }).click();

  await expect(page.locator('[data-planning-wizard-step="context"]')).toBeVisible();
  await expectHeadingBelowStickyHeader(page, "Conte o que ajuda a planejar esta viagem");
  await page.getByLabel("Quantidade de viajantes").fill("2");
  await page.getByRole("button", { name: "Salvar e continuar" }).click();
  await page.getByLabel("Praias").check();
  await page.getByLabel("Ritmo da viagem").selectOption("balanced");
  await page.getByRole("button", { name: "Salvar e continuar" }).click();
  await page.getByRole("button", { name: "Salvar contexto" }).click();
  await expect(page.getByRole("status")).toContainText("Contexto salvo");
  await expect
    .poll(() => new DrizzleTravelerProfileRepository().findByTripId(trip.id))
    .toMatchObject({ travelerCount: 2, interests: ["beaches"], pace: "balanced" });
  expect(await preferenceRepository.find(trip.id, placeId)).toMatchObject({ intent: "WANT" });
  expect(await itineraryRepository.findByTripId(trip.id)).toEqual(itineraryBeforePreparation);
  expect(await proposalRepository.listByTripId(trip.id)).toHaveLength(0);

  await page.getByRole("link", { name: "Continuar para Revisão" }).click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/preparacao/revisao\\?preparar=1$`));
  await expect(page.getByText("Preparar viagem · Etapa 3 de 4")).toBeVisible();
  await expectHeadingBelowStickyHeader(page, "Veja o que será considerado");
  await expect(page.getByRole("heading", { name: "Veja o que será considerado" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Montar proposta de roteiro" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/preparacao/proposta?preparar=1`,
  );
  expect(await proposalRepository.listByTripId(trip.id)).toHaveLength(0);
  await page.getByRole("link", { name: "Montar proposta de roteiro" }).click();
  await expect(page.getByText("Preparar viagem · Etapa 4 de 4")).toBeVisible();
  await expectHeadingBelowStickyHeader(page, "Gere uma proposta para revisar");

  const generateButton = page.getByRole("button", { name: "Gerar proposta de roteiro" });
  const actionPathname = new URL(page.url()).pathname;
  const actionResponse = page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === "POST" && new URL(request.url()).pathname === actionPathname;
  });
  const [response] = await Promise.all([actionResponse, generateButton.click()]);
  const redirectUrl = response.headers()["x-action-redirect"]?.split(";")[0];
  expect(redirectUrl).toMatch(
    new RegExp(`/viagens/${trip.id}/roteiro/proposta\\?preparar=1&propostaGerada=[0-9a-f-]+$`, "i"),
  );
  await page.goto(redirectUrl!);
  await expectHeadingBelowStickyHeader(page, "Revise a proposta antes de decidir o que aplicar");
  await expect(page.getByRole("heading", { level: 1, name: "Proposta de Roteiro" })).toBeVisible();
  await expect(page.getByText("Proposta aguardando sua decisão").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: placeTitle })).toBeVisible();

  const proposalId = new URL(page.url()).searchParams.get("propostaGerada");
  expect(proposalId).toMatch(/^[0-9a-f-]{36}$/i);
  const typedProposalId = proposalId as ItineraryProposalId;
  const proposal = await proposalRepository.findById(trip.id, typedProposalId);
  expect(proposal).toMatchObject({ status: "ready", tripId: trip.id });
  expect(proposal?.proposedActivities).toEqual(
    expect.arrayContaining([expect.objectContaining({ placeId, title: placeTitle })]),
  );
  expect(await itineraryRepository.findByTripId(trip.id)).toEqual(itineraryBeforePreparation);
  await expect(page.getByRole("button", { name: "Confirmar e aceitar proposta" })).toHaveCount(0);

  await page.getByText("Aceitar proposta", { exact: true }).click();
  await page.getByRole("checkbox", { name: /atualizará o Roteiro/i }).check();
  const acceptancePathname = new URL(page.url()).pathname;
  const acceptanceResponse = page.waitForResponse((nextResponse) => {
    const request = nextResponse.request();
    return request.method() === "POST" && new URL(request.url()).pathname === acceptancePathname;
  });
  const [acceptedResponse] = await Promise.all([
    acceptanceResponse,
    page.getByRole("button", { name: "Confirmar e aceitar proposta" }).click(),
  ]);
  const acceptedUrl = acceptedResponse.headers()["x-action-redirect"]?.split(";")[0];
  expect(acceptedUrl).toMatch(new RegExp(`/viagens/${trip.id}/roteiro\\?propostaAceita=applied$`));
  await page.goto(acceptedUrl!);

  await expect(page.getByRole("status")).toHaveText("Proposta aplicada ao Roteiro.");
  await expect(
    page.getByLabel("Timeline do Dia").getByText(placeTitle, { exact: true }),
  ).toBeVisible();
  const appliedItinerary = await itineraryRepository.findByTripId(trip.id);
  expect(appliedItinerary).toMatchObject({ id: itinerary.id, version: itinerary.version + 1 });
  expect(
    appliedItinerary?.days
      .flatMap(({ activities }) => activities)
      .find(({ title }) => title === placeTitle),
  ).toMatchObject({ title: placeTitle, placeId });
  const [plannedTrip] = await getDatabase()
    .select({ status: trips.status })
    .from(trips)
    .where(eq(trips.id, trip.id))
    .limit(1);
  expect(plannedTrip?.status).toBe("planned");

  await page.reload();
  await expect(
    page.getByLabel("Timeline do Dia").getByText(placeTitle, { exact: true }),
  ).toBeVisible();
  expect(await itineraryRepository.findByTripId(trip.id)).toEqual(appliedItinerary);
  expect(await proposalRepository.findById(trip.id, typedProposalId)).toMatchObject({
    status: "accepted",
  });
  await page.goto(`/viagens/${trip.id}`);
  await expect(page.getByRole("link", { name: "Abrir roteiro" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Preparar viagem" })).toHaveCount(0);
});
