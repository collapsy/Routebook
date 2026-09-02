import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test.setTimeout(120_000);

test("descobre candidatos em Florianópolis com zero seed regional", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Anywhere Florianópolis ${test.info().project.name} ${Date.now()}`,
    destination: {
      name: "Florianópolis, SC",
      type: "city",
      countryCode: "BR",
      latitude: -27.5949,
      longitude: -48.5482,
      timeZone: "America/Sao_Paulo",
    },
    startDate: "2026-11-10",
    endDate: "2026-11-17",
  });

  await page.goto(`/viagens/${trip.id}/lugares`);

  await expect(page.getByRole("heading", { name: /Lugares em Florianópolis/ })).toBeVisible({
    timeout: 20_000,
  });
  const options = page.getByRole("list", { name: "Opções de lugares" });
  const published = options.locator('[data-place-source="published"]');
  const external = options.locator('[data-place-source="external"]');

  await expect(published).toHaveCount(0);
  await expect(external.first()).toBeVisible({ timeout: 30_000 });
  expect(await external.count()).toBeGreaterThan(0);
  await expect(external.first()).toContainText(/em linha reta do destino/);
  await expect(page.getByLabel("Distância máxima")).toBeEnabled();
  await expect(page.getByText(/referência aproximada do destino/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar para curadoria" })).toHaveCount(0);
  await expect(
    page.getByText(/promoção editorial aguarda uma identidade canônica deste Destino/).first(),
  ).toBeVisible();

  const map = page.locator('[data-routebook-map="true"]');
  await expect(map).toHaveAttribute("data-map-published-count", "0");
  expect(Number(await map.getAttribute("data-map-external-count"))).toBeGreaterThan(0);
});
