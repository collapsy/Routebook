import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("prepara a viagem escolhendo lugares sem criar Activity", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Wizard de lugares ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(
    `/viagens/${trip.id}/lugares?preparar=1&descoberta=ocultar&busca=Praia%20do%20Amor&categoria=beach`,
  );

  await expect(
    page.getByRole("heading", {
      name: "Escolha os lugares que fazem sentido para você",
      level: 2,
    }),
  ).toBeVisible();
  await expect(page.locator('[data-planning-wizard-step="places"]')).toBeVisible();
  await expect(page.getByRole("link", { name: "Minha seleção" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares-salvos?preparar=1`,
  );

  const card = page
    .getByRole("list", { name: "Opções de lugares" })
    .locator('[data-place-source="published"]')
    .filter({ hasText: "Praia do Amor" })
    .first();

  await expect(card).toBeVisible();
  await expect(card.getByRole("link", { name: "Adicionar ao roteiro" })).toHaveCount(0);

  await card.getByRole("button", { name: "Quero ir" }).click();
  await expect(card.getByRole("button", { name: "Quero ir" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  const summary = page.locator('[data-selection-summary="true"]');
  await expect(summary.locator("div").filter({ hasText: /^Quero ir1$/ })).toHaveCount(1);

  await page.getByRole("link", { name: "Revisar seleção" }).first().click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares-salvos\\?preparar=1$`));
  await expect(
    page.getByRole("heading", {
      name: "Escolha os lugares que fazem sentido para você",
      level: 2,
    }),
  ).toBeVisible();

  const selectedCard = page.locator(".place-card").filter({ hasText: "Praia do Amor" }).first();
  await expect(selectedCard).toBeVisible();
  await expect(selectedCard.getByRole("button", { name: "Adicionar ao roteiro" })).toHaveCount(0);
  await expect(selectedCard.getByText(/Preferência: Quero ir/)).toBeVisible();

  await selectedCard.getByRole("link", { name: "Ver detalhes" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/viagens/${trip.id}/lugares/praia-do-amor\\?preparar=1$`),
  );
  await expect(
    page.getByRole("heading", { name: "Escolher não é adicionar ao roteiro", level: 2 }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Adicionar ao roteiro", level: 2 })).toHaveCount(0);

  await page.goto(`/viagens/${trip.id}/roteiro`);
  await expect(
    page.locator(".itinerary-activity-copy").filter({ hasText: "Praia do Amor" }),
  ).toHaveCount(0);
});
