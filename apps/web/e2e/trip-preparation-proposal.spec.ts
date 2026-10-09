import { expect, test } from "@playwright/test";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleTripPlacePreferenceRepository,
  getDatabase,
  places,
} from "@routebook/database";
import { createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("explica e inicia o Roteiro antes de gerar uma proposta", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Pré-condição da proposta ${test.info().project.name} ${Date.now()}`,
    startDate: "2027-08-22",
    endDate: "2027-08-23",
  });
  const itineraryRepository = new DrizzleItineraryRepository();
  const proposalRepository = new DrizzleItineraryProposalRepository();
  expect(await itineraryRepository.findByTripId(trip.id)).toBeNull();

  await page.goto(`/viagens/${trip.id}/preparacao/proposta?preparar=1`);
  await expect(page.getByText(/primeiro inicie o roteiro/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Começar roteiro" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Gerar proposta de roteiro" })).toHaveCount(0);
  expect(await proposalRepository.listByTripId(trip.id)).toHaveLength(0);
  expect(await itineraryRepository.findByTripId(trip.id)).toBeNull();

  await page.getByRole("button", { name: "Começar roteiro" }).click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/preparacao/proposta\\?preparar=1$`));
  await expect.poll(() => itineraryRepository.findByTripId(trip.id)).not.toBeNull();
  expect(await proposalRepository.listByTripId(trip.id)).toHaveLength(0);
});

test("leva a Revisão até a Proposta sem aplicar mudanças ao Roteiro", async ({ page }) => {
  const now = new Date();
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Wizard de proposta ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-23",
  });
  const itineraryRepository = new DrizzleItineraryRepository();
  await itineraryRepository.save(createItinerary({ tripId: trip.id, period: trip.period }, now));
  const placeId = crypto.randomUUID();
  const preferenceId = crypto.randomUUID();

  await getDatabase()
    .insert(places)
    .values({
      id: placeId,
      destinationId: "pipa-rn",
      slug: `wizard-proposal-${placeId}`,
      name: "Lugar selecionado para proposta",
      summary: "Lugar criado para validar a passagem da preparação.",
      category: "beach",
      latitude: trip.destination.latitude,
      longitude: trip.destination.longitude,
      addressLabel: trip.destination.name,
      publicationStatus: "published",
      createdAt: now,
      updatedAt: now,
    });
  await new DrizzleTripPlacePreferenceRepository().save({
    id: preferenceId,
    tripId: trip.id,
    placeId,
    intent: "WANT",
    priority: "MUST_DO",
    createdAt: now,
    updatedAt: now,
  });

  const proposalRepository = new DrizzleItineraryProposalRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(trip.id);

  await page.goto(`/viagens/${trip.id}/contexto?preparar=1`);
  await page.getByLabel("Quantidade de viajantes").fill("2");
  await page.getByRole("button", { name: "Salvar e continuar" }).click();
  await page.getByRole("button", { name: "Salvar e continuar" }).click();
  await page.getByRole("button", { name: "Salvar contexto" }).click();
  await page.getByRole("link", { name: "Continuar para Revisão" }).click();

  await expect(page.getByRole("link", { name: "Montar proposta de roteiro" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/preparacao/proposta?preparar=1`,
  );
  await page.getByRole("link", { name: "Montar proposta de roteiro" }).click();

  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/preparacao/proposta\\?preparar=1$`));
  await expect(page.getByText("Preparar viagem · Etapa 4 de 4")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gere uma proposta para revisar" })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Gerar proposta de roteiro" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Gerar proposta de roteiro" })).toBeVisible();
  expect(await proposalRepository.listByTripId(trip.id)).toHaveLength(0);
  expect(await itineraryRepository.findByTripId(trip.id)).toEqual(itineraryBefore);
});
