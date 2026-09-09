import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test.setTimeout(120_000);

test("descobre lugares em Florianópolis com zero seed sem expor lifecycle editorial", async ({
  page,
}) => {
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
  await expect(external.first().locator("[data-external-place-image-state]")).toBeVisible();
  await expect(external.first()).toContainText(/em linha reta do destino/);
  await expect(external.first()).toContainText(/Fonte: Overture/);
  await expect(page.getByLabel("Distância máxima")).toBeEnabled();
  await expect(page.getByText(/referência aproximada do destino/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver mapa e fotos" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Salvar lugar" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar para curadoria" })).toHaveCount(0);
  await expect(page.getByText(/Descoberta atual/i)).toHaveCount(0);
  await expect(page.getByText(/Candidato externo/i)).toHaveCount(0);
  await expect(page.getByText(/Curado pelo RouteBook/i)).toHaveCount(0);

  const legend = page.getByRole("list", { name: "Legenda do mapa" });
  await expect(legend).toContainText("Lugar");
  await expect(legend.getByText("Descoberta externa", { exact: true })).toHaveCount(0);

  const map = page.locator('[data-routebook-map="true"]');
  await expect(map).toHaveAttribute("data-map-published-count", "0");
  expect(Number(await map.getAttribute("data-map-external-count"))).toBeGreaterThan(0);
});
