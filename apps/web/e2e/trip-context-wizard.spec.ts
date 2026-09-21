import { expect, test } from "@playwright/test";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleTravelerProfileRepository,
} from "@routebook/database";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("preenche Contexto progressivamente sem criar Activity ou Proposal", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Wizard de contexto ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  const itineraryRepository = new DrizzleItineraryRepository();
  const proposalRepository = new DrizzleItineraryProposalRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(trip.id);
  const proposalsBefore = await proposalRepository.listByTripId(trip.id);

  await page.goto(`/viagens/${trip.id}/lugares-salvos?preparar=1`);
  await expect(page.getByRole("link", { name: "Continuar para Contexto" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/contexto?preparar=1`,
  );

  await page.getByRole("link", { name: "Continuar para Contexto" }).click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/contexto\\?preparar=1$`));
  await expect(page.locator('[data-planning-wizard-step="context"]')).toBeVisible();
  await expect(page.getByText("Preparar viagem · Etapa 2 de 4")).toBeVisible();

  const known = page.getByRole("definition").filter({ hasText: trip.destination.name });
  await expect(known).toHaveCount(1);
  await expect(page.getByText("Hospedagem central").first()).toBeVisible();

  await page.getByLabel("Quantidade de viajantes").fill("3");
  await page.getByRole("button", { name: "Salvar e continuar" }).click();
  await expect(page).toHaveURL(/grupo=preferencias/);

  await page.getByLabel("Praias").check();
  await page.getByLabel("Gastronomia").check();
  await page.getByLabel("Ritmo da viagem").selectOption("balanced");
  await page.getByRole("button", { name: "Salvar e continuar" }).click();
  await expect(page).toHaveURL(/grupo=logistica/);

  await page.getByLabel("Transporte preferencial").selectOption("mixed");
  await page.getByLabel("Orçamento total estimado").fill("4.500,00");
  await page.getByRole("button", { name: "Salvar contexto" }).click();
  await expect(page).toHaveURL(/preparar=1/);
  await expect(page).toHaveURL(/grupo=logistica/);
  await expect(page.getByRole("status")).toContainText("Contexto salvo");

  const profile = await new DrizzleTravelerProfileRepository().findByTripId(trip.id);
  expect(profile).toMatchObject({
    travelerCount: 3,
    interests: ["beaches", "gastronomy"],
    pace: "balanced",
    transportPreference: "mixed",
    budget: { totalCents: 450000, currency: "BRL", kind: "estimate" },
  });

  await page
    .getByRole("link", { name: /Lugares/ })
    .first()
    .click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares-salvos\\?preparar=1import { expect, test } from "@playwright/test";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleTravelerProfileRepository,
} from "@routebook/database";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("preenche Contexto progressivamente sem criar Activity ou Proposal", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Wizard de contexto ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  const itineraryRepository = new DrizzleItineraryRepository();
  const proposalRepository = new DrizzleItineraryProposalRepository();
  const itineraryBefore = await itineraryRepository.findByTripId(trip.id);
  const proposalsBefore = await proposalRepository.listByTripId(trip.id);

  await page.goto(`/viagens/${trip.id}/lugares-salvos?preparar=1`);
  await expect(page.getByRole("link", { name: "Continuar para Contexto" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/contexto?preparar=1`,
  );

  await page.getByRole("link", { name: "Continuar para Contexto" }).click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/contexto\\?preparar=1$`));
  await expect(page.locator('[data-planning-wizard-step="context"]')).toBeVisible();
  await expect(page.getByText("Preparar viagem · Etapa 2 de 4")).toBeVisible();

  const known = page.getByRole("definition").filter({ hasText: trip.destination.name });
  await expect(known).toHaveCount(1);
  await expect(page.getByText("Hospedagem central").first()).toBeVisible();

  await page.getByLabel("Quantidade de viajantes").fill("3");
  await page.getByRole("button", { name: "Salvar e continuar" }).click();
  await expect(page).toHaveURL(/grupo=preferencias/);

  await page.getByLabel("Praias").check();
  await page.getByLabel("Gastronomia").check();
  await page.getByLabel("Ritmo da viagem").selectOption("balanced");
  await page.getByRole("button", { name: "Salvar e continuar" }).click();
  await expect(page).toHaveURL(/grupo=logistica/);

  await page.getByLabel("Transporte preferencial").selectOption("mixed");
  await page.getByLabel("Orçamento total estimado").fill("4.500,00");
  await page.getByRole("button", { name: "Salvar contexto" }).click();
  await expect(page).toHaveURL(/preparar=1/);
  await expect(page).toHaveURL(/grupo=logistica/);
  await expect(page.getByRole("status")).toContainText("Contexto salvo");

  const profile = await new DrizzleTravelerProfileRepository().findByTripId(trip.id);
  expect(profile).toMatchObject({
    travelerCount: 3,
    interests: ["beaches", "gastronomy"],
    pace: "balanced",
    transportPreference: "mixed",
    budget: { totalCents: 450000, currency: "BRL", kind: "estimate" },
  });

));
  await page.goto(`/viagens/${trip.id}/contexto?preparar=1&grupo=preferencias`);
  await expect(page.getByLabel("Praias")).toBeChecked();
  await expect(page.getByLabel("Gastronomia")).toBeChecked();
  await expect(page.getByLabel("Ritmo da viagem")).toHaveValue("balanced");

  expect(await itineraryRepository.findByTripId(trip.id)).toEqual(itineraryBefore);
  expect(await proposalRepository.listByTripId(trip.id)).toEqual(proposalsBefore);

  await page.goto(`/viagens/${trip.id}/contexto?grupo=preferencias`);
  await expect(page.locator('[data-planning-wizard-step="context"]')).toHaveCount(0);
  await expect(page.getByLabel("Praias")).toBeChecked();
});
