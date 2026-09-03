import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test.setTimeout(180_000);

test("valida São Paulo sem seed e preserva Discovery, Salvos, Roteiro, mapa e Guia", async ({
  page,
}) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Anywhere São Paulo ${test.info().project.name} ${Date.now()}`,
    destination: {
      name: "São Paulo, SP",
      type: "city",
      countryCode: "BR",
      latitude: -23.5505,
      longitude: -46.6333,
      timeZone: "America/Sao_Paulo",
    },
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    accommodationName: "Hospedagem na Avenida Paulista",
    accommodationAddress: "Avenida Paulista, São Paulo — SP",
    accommodationLatitude: -23.5615,
    accommodationLongitude: -46.6559,
  });

  await page.goto(`/viagens/${trip.id}`);
  await expect(page.getByText("São Paulo, SP", { exact: true })).toBeVisible();
  await expect(page.getByText("Hospedagem na Avenida Paulista", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Hoje" })).toBeVisible();
  await expect(page.getByText(/Hoje em São Paulo, SP/)).toBeVisible();

  await page.goto(`/viagens/${trip.id}/lugares`);
  await expect(page.getByRole("heading", { name: /Lugares em São Paulo/ })).toBeVisible({
    timeout: 30_000,
  });
  const options = page.getByRole("list", { name: "Opções de lugares" });
  const published = options.locator('[data-place-source="published"]');
  const external = options.locator('[data-place-source="external"]');
  await expect(published).toHaveCount(0);
  await expect(external.first()).toBeVisible({ timeout: 45_000 });
  expect(await external.count()).toBeGreaterThan(0);
  await expect(options).toContainText(/Gastronomia|Vida noturna/);
  await expect(external.first()).toContainText(/em linha reta da hospedagem/);
  await expect(
    external.first().locator('[data-external-place-image-state="fallback"]'),
  ).toBeVisible();

  const selectedName = (await external.first().locator(":scope > strong").innerText()).trim();
  await external.first().getByRole("button", { name: "Salvar na viagem" }).click();
  await expect(page.getByText(/Lugar salvo na viagem com a origem externa preservada/)).toBeVisible(
    {
      timeout: 45_000,
    },
  );

  await page.goto(`/viagens/${trip.id}/lugares-salvos`);
  await expect(page.getByRole("heading", { name: "Lugares salvos" })).toBeVisible();
  const savedCard = page.locator(".place-card").filter({ hasText: selectedName }).first();
  await expect(savedCard).toBeVisible();
  await expect(page.locator('[data-routebook-map="true"]')).toHaveAttribute(
    "data-map-point-count",
    "2",
  );

  await savedCard.getByLabel("Adicionar ao dia").selectOption("2026-11-11");
  await savedCard.getByRole("button", { name: "Adicionar ao roteiro" }).click();
  await expect(page.getByText(/Lugar adicionado ao roteiro/)).toBeVisible();

  await page.goto(`/viagens/${trip.id}/roteiro?dia=2026-11-11`);
  await expect(page.getByText(selectedName, { exact: true })).toBeVisible();

  await page.goto(`/viagens/${trip.id}/guia?dia=2026-11-11`);
  await expect(page.getByRole("heading", { name: /Dia 2/ })).toBeVisible();
  await expect(page.getByText(selectedName, { exact: true })).toBeVisible();

  await page.goto(`/viagens/${trip.id}/guia/dias?dia=2026-11-11`);
  await expect(
    page.getByRole("heading", { name: "Guia da viagem em São Paulo, SP" }),
  ).toBeVisible();
  await expect(page.getByText("1 atividade confirmada", { exact: true })).toBeVisible();
});
