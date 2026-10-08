import { expect, test } from "@playwright/test";
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
  const itineraryBeforePreparation = await itineraryRepository.findByTripId(trip.id);
  expect(itineraryBeforePreparation).toBeNull();
  expect(await proposalRepository.listByTripId(trip.id)).toHaveLength(0);

  await page.goto(`/viagens/${trip.id}/roteiro`);
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares\\?preparar=1$`));
  expect(await itineraryRepository.findByTripId(trip.id)).toBeNull();

  await page.goto(`/viagens/${trip.id}`);
  await expect(page.getByRole("link", { name: "Preparar viagem" })).toBeVisible();
  await page.getByRole("link", { name: "Preparar viagem" }).click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares(?:\\?|$)`));
  await page.goto(
    `/viagens/${trip.id}/lugares?preparar=1&descoberta=ocultar&busca=${encodeURIComponent(placeTitle)}&categoria=beach`,
  );
  await expect(page.locator('[data-planning-wizard-step="places"]')).toBeVisible();
  await expect(
    page.getByLabel("Lugares da preparação").getByRole("link", { name: "Minha seleção" }),
  ).toHaveAttribute("href", `/viagens/${trip.id}/lugares-salvos?preparar=1`);

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
  await expect(page.getByRole("heading", { name: "Veja o que será considerado" })).toBeVisible();
  await expect(page.getByText(/A proposta continuará separada do roteiro/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Montar proposta de roteiro" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/preparacao/proposta?preparar=1`,
  );
  expect(await proposalRepository.listByTripId(trip.id)).toHaveLength(0);
  await page.getByRole("link", { name: "Montar proposta de roteiro" }).click();
  await expect(page.getByText("Preparar viagem · Etapa 4 de 4")).toBeVisible();

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
  await expect(page.getByRole("heading", { level: 1, name: "Proposta de Roteiro" })).toBeVisible();
  await expect(page.getByText("Proposta aguardando sua decisão").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: placeTitle })).toBeVisible();
  const itineraryBeforeAcceptance = await itineraryRepository.findByTripId(trip.id);
  expect(itineraryBeforeAcceptance).not.toBeNull();
  expect(itineraryBeforeAcceptance?.days.flatMap(({ activities }) => activities)).toHaveLength(0);

  const proposalId = new URL(page.url()).searchParams.get("propostaGerada");
  expect(proposalId).toMatch(/^[0-9a-f-]{36}$/i);
  const typedProposalId = proposalId as ItineraryProposalId;
  const proposal = await proposalRepository.findById(trip.id, typedProposalId);
  expect(proposal).toMatchObject({ status: "ready", tripId: trip.id });
  expect(proposal?.proposedActivities).toEqual(
    expect.arrayContaining([expect.objectContaining({ placeId, title: placeTitle })]),
  );
  expect(await itineraryRepository.findByTripId(trip.id)).toEqual(itineraryBeforeAcceptance);
  await expect(page.getByRole("button", { name: "Confirmar e aceitar proposta" })).toHaveCount(0);

  await page.goto(`/viagens/${trip.id}`);
  const resumeProposalLink = page.getByRole("link", { name: "Revisar proposta pendente" });
  await expect(resumeProposalLink).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/roteiro/proposta?preparar=1`,
  );
  await resumeProposalLink.click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/roteiro/proposta\\?preparar=1$`));
  await expect(page.getByText("Proposta aguardando sua decisão").first()).toBeVisible();
  await expect(proposalRepository.listByTripId(trip.id)).resolves.toHaveLength(1);

  await page.goto(`/viagens/${trip.id}/preparacao/revisao?preparar=1`);
  await expect(page.getByRole("heading", { name: "Sua proposta aguarda decisão" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Revisar proposta pendente" })).toBeVisible();
  await page.goto(`/viagens/${trip.id}/preparacao/proposta?preparar=1`);
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/roteiro/proposta\\?preparar=1$`));
  await expect(page.getByText("Proposta aguardando sua decisão").first()).toBeVisible();
  await expect(proposalRepository.listByTripId(trip.id)).resolves.toHaveLength(1);
  expect(await itineraryRepository.findByTripId(trip.id)).toEqual(itineraryBeforeAcceptance);

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
  expect(appliedItinerary).toMatchObject({
    id: itineraryBeforeAcceptance?.id,
    version: (itineraryBeforeAcceptance?.version ?? 0) + 1,
  });
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
