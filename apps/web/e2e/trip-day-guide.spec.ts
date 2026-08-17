import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("apresenta um guia visual e sequenciado para 22 de agosto", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Guia do dia 22 ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}`);

  await expect(
    page.getByRole("heading", { name: /sábado, 22 de agosto — Primeiro dia em Pipa/ }),
  ).toBeVisible();
  await expect(page.getByText(/O que é real e o que é estimativa/)).toBeVisible();

  const stops = page.getByRole("list", { name: "Paradas sugeridas para o primeiro dia" });
  await expect(stops.getByRole("listitem")).toHaveCount(3);
  await expect(stops.getByRole("heading", { name: "Praia do Amor" })).toBeVisible();
  await expect(stops.getByRole("heading", { name: "Chapadão de Pipa" })).toBeVisible();
  await expect(stops.getByRole("heading", { name: "Camarão na Fazenda Pipa" })).toBeVisible();
  await expect(stops.getByLabel("Parada 1")).toBeVisible();
  await expect(stops.getByLabel("Parada 2")).toBeVisible();
  await expect(stops.getByLabel("Parada 3")).toBeVisible();
  await expect(stops.getByRole("img")).toHaveCount(3);
  await expect(stops.locator('[data-place-image-fallback="true"]')).toHaveCount(1);
  await expect(stops.getByText(/em linha reta/)).toHaveCount(3);
  await expect(stops.getByRole("link", { name: "Rota e tempo no Maps" })).toHaveCount(3);

  const itineraryLink = page.getByRole("link", {
    name: "Abrir sequência completa no Google Maps",
  });
  await expect(itineraryLink).toHaveAttribute("href", /google\.com\/maps\/dir/);
  await expect(itineraryLink).toHaveAttribute("href", /waypoints=/);
  await expect(page.getByText(/Chegou depois do almoço/)).toBeVisible();
});

test("não finge rota quando a hospedagem não está geocodificada", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Guia sem coordenadas ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
  });

  await page.goto(`/viagens/${trip.id}`);

  await expect(page.getByText("Hospedagem sem coordenadas")).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Rota e tempo no Maps" })).toHaveCount(0);
  await expect(
    page.getByText(/Informe uma hospedagem com localização para abrir a sequência completa/),
  ).toBeVisible();
});
