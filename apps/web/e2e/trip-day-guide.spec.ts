import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("abre o guia completo da viagem e mantém densidade leve nas pontas", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Guia completo ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}`);
  const guideLink = page.getByRole("link", { name: "Abrir guia da viagem" }).first();
  await expect(guideLink).toBeVisible();
  await guideLink.click();
  await expect(page).toHaveURL(`/viagens/${trip.id}/guia`);

  await expect(page.getByRole("heading", { name: "Um plano leve para cada dia em Pipa" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Dias do guia" }).getByRole("link")).toHaveCount(8);
  await expect(page.locator('section[id^="dia-"]')).toHaveCount(8);

  const firstDay = page.locator("#dia-1");
  const secondDay = page.locator("#dia-2");
  const lastDay = page.locator("#dia-8");
  await expect(firstDay.getByRole("list", { name: "Paradas sugeridas para o Dia 1" }).getByRole("listitem")).toHaveCount(2);
  await expect(secondDay.getByRole("list", { name: "Paradas sugeridas para o Dia 2" }).getByRole("listitem")).toHaveCount(3);
  await expect(lastDay.getByRole("list", { name: "Paradas sugeridas para o Dia 8" }).getByRole("listitem")).toHaveCount(2);

  await expect(page.getByText(/Guia editorial, não Roteiro aplicado/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Adicionar ao roteiro" })).toHaveCount(22);
  await expect(page.getByRole("link", { name: "Rota e tempo no Maps" })).toHaveCount(22);
  await expect(page.getByRole("link", { name: "Abrir sequência do dia no Google Maps" })).toHaveCount(8);

  const planLink = firstDay.getByRole("link", { name: "Adicionar ao roteiro" }).first();
  await expect(planLink).toHaveAttribute(
    "href",
    new RegExp(`/viagens/${trip.id}/lugares/.+\\?dia=2026-08-22#adicionar-ao-roteiro`),
  );
});

test("usa somente os dias existentes quando a viagem é mais curta", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Guia curto ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-24",
  });

  await page.goto(`/viagens/${trip.id}/guia`);

  await expect(page.getByRole("navigation", { name: "Dias do guia" }).getByRole("link")).toHaveCount(3);
  await expect(page.locator('section[id^="dia-"]')).toHaveCount(3);
  await expect(page.locator("#dia-4")).toHaveCount(0);
});

test("não finge rota quando a hospedagem não está geocodificada", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Guia sem coordenadas ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
  });

  await page.goto(`/viagens/${trip.id}/guia`);

  await expect(page.getByText("Hospedagem sem coordenadas")).toHaveCount(22);
  await expect(page.getByRole("link", { name: "Rota e tempo no Maps" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Abrir sequência do dia no Google Maps" })).toHaveCount(0);
  await expect(
    page.getByText(/Informe uma hospedagem com localização para abrir a sequência completa/).first(),
  ).toBeVisible();
});
