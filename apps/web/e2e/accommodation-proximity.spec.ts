import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("prioriza no Discovery o lugar mais próximo da hospedagem geocodificada", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Proximidade ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    accommodationName: "Hospedagem de referência",
    accommodationAddress: "Praia do Amor, Pipa — RN",
    accommodationLatitude: -6.2366,
    accommodationLongitude: -35.0465,
  });

  await page.goto(`/viagens/${trip.id}/lugares`);

  await expect(
    page.getByText(/Distâncias estimadas em linha reta.*não representam rota ou tempo/),
  ).toBeVisible();
  const options = page.getByRole("list", { name: "Opções de lugares" });
  const publishedPlaces = options.locator('[data-place-source="published"]');
  const externalPlaces = options.locator('[data-place-source="external"]');
  await expect(publishedPlaces).toHaveCount(30);
  await expect(externalPlaces.first()).toBeVisible();
  await expect(publishedPlaces.first()).toContainText("Praia do Amor");
  await expect(publishedPlaces.first()).toContainText(
    /\d+(?:[.,]\d+)?\s*(?:m|km) em linha reta da hospedagem/,
  );
  expect(await options.getByRole("listitem").count()).toBeGreaterThan(30);
  await expect(page.getByRole("list", { name: "Legenda do mapa" })).toContainText(
    "Descoberta externa",
  );
});

test("mantém Discovery funcional sem coordenadas da hospedagem", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Fallback proximidade ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-24",
  });

  await page.goto(`/viagens/${trip.id}/lugares`);

  await expect(
    page.getByRole("heading", {
      name: /\d+ de \d+ (?:lugar único|lugares únicos) exibidos/,
    }),
  ).toBeVisible();
  await expect(page.getByText(/30 curados · \d+ descobertas atuais/)).toBeVisible();
  await expect(
    page
      .getByRole("list", { name: "Opções de lugares" })
      .locator('[data-place-source="external"]')
      .first(),
  ).toBeVisible();
  await expect(page.getByLabel("Distância máxima")).toBeDisabled();
  await expect(page.getByText(/filtro de distância fica disponível/)).toBeVisible();
});
