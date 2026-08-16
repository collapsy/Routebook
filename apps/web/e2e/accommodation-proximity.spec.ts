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
    page.getByText(/Hospedagem geocodificada.*prioriza os Lugares mais próximos/),
  ).toBeVisible();
  const places = page.getByRole("list", { name: "Lugares publicados" }).getByRole("listitem");
  await expect(places).toHaveCount(30);
  await expect(places.first()).toContainText("Praia do Amor");
  await expect(places.first()).toContainText("0 m em linha reta da hospedagem");
  await expect(
    page.getByText(/Distâncias estimadas em linha reta.*não representam rota ou tempo/),
  ).toBeVisible();
});

test("mantém Discovery funcional sem coordenadas da hospedagem", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Fallback proximidade ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-24",
  });

  await page.goto(`/viagens/${trip.id}/lugares`);

  await expect(page.getByRole("heading", { name: /\d+ opções para explorar/ })).toBeVisible();
  await expect(
    page.getByText(
      /30 lugares publicados no RouteBook \+ \d+ descoberta(?: atualizada|s atualizadas) no Overture/,
    ),
  ).toBeVisible();
  await expect(page.getByLabel("Distância máxima")).toBeDisabled();
  await expect(page.getByText(/filtro de distância fica disponível/)).toBeVisible();
});
