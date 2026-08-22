import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

function dateInPipa(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: "year" | "month" | "day") =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function shiftDate(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function activeTripName(prefix: string): string {
  return `${prefix} ${test.info().project.name} ${Date.now()}`;
}

async function createTripAroundToday() {
  const today = dateInPipa();
  const startDate = shiftDate(today, -1);
  const endDate = shiftDate(today, 1);
  const result = await createAuthenticatedE2ETrip({
    name: activeTripName("Viagem ativa Pipa"),
    startDate,
    endDate,
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  return { ...result, today, startDate, endDate };
}

test("preserva contexto entre áreas e prioriza Hoje sem sobrescrever seleção explícita", async ({
  page,
}) => {
  const { trip, today, startDate } = await createTripAroundToday();

  await page.goto(`/viagens/${trip.id}/guia`);

  const tripNav = page.getByRole("navigation", { name: "Navegação da viagem" });
  await expect(tripNav).toBeVisible();
  await expect(tripNav.getByRole("link")).toHaveCount(4);
  await expect(tripNav.getByRole("link", { name: "Guia" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#guia-dia-2")).toHaveAttribute("open", "");
  await expect(
    page
      .getByRole("navigation", { name: "Dias do Guia da viagem" })
      .locator('[aria-current="date"]'),
  ).toContainText("Hoje");

  await tripNav.getByRole("link", { name: "Lugares" }).click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares$`));
  await expect(
    page.getByRole("navigation", { name: "Navegação da viagem" }).getByRole("link", {
      name: "Lugares",
    }),
  ).toHaveAttribute("aria-current", "page");

  await page
    .getByRole("navigation", { name: "Navegação da viagem" })
    .getByRole("link", { name: "Salvos" })
    .click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares-salvos$`));

  await page
    .getByRole("navigation", { name: "Navegação da viagem" })
    .getByRole("link", { name: "Roteiro" })
    .click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/roteiro$`));

  const daySelector = page.getByRole("navigation", { name: "Selecionar Dia do roteiro" });
  const selectedDay = daySelector.locator('[aria-current="page"]');
  await expect(selectedDay).toContainText("Dia 2");
  await expect(selectedDay).toContainText("Hoje");
  await expect(page.getByRole("heading", { name: /Dia 2 —/ })).toBeVisible();

  await page.goto(`/viagens/${trip.id}/roteiro?dia=${startDate}#dia-em-foco`);
  await expect(page.getByRole("heading", { name: /Dia 1 —/ })).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Selecionar Dia do roteiro" })
      .locator(`[href*="dia=${today}"]`),
  ).toContainText("Hoje");
  await expect(
    page
      .getByRole("navigation", { name: "Selecionar Dia do roteiro" })
      .locator(`[href*="dia=${startDate}"]`),
  ).toHaveAttribute("aria-current", "page");
});

test("mantém navegação e ações secundárias operáveis em viewport mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { trip } = await createTripAroundToday();

  await page.goto(`/viagens/${trip.id}/roteiro`);

  const tripNav = page.getByRole("navigation", { name: "Navegação da viagem" });
  await expect(tripNav).toBeVisible();
  await expect(tripNav.getByRole("link", { name: "Roteiro" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.getByText("Adicionar atividade manual", { exact: true }).click();
  await page.getByLabel("Título").fill("Passeio do Dia atual");
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();
  await expect(page.getByRole("status")).toContainText("Atividade adicionada");

  const activity = page.locator(".itinerary-day-card").filter({ hasText: "Passeio do Dia atual" });
  await expect(activity).toBeVisible();
  await activity.locator('summary[aria-label="Opções de Passeio do Dia atual"]').click();
  await expect(
    activity.locator('summary[aria-label^="Editar Passeio do Dia atual"]'),
  ).toBeVisible();
  await expect(
    activity.locator('summary[aria-label^="Mover Passeio do Dia atual para outro dia"]'),
  ).toBeVisible();
  await expect(
    activity.getByRole("button", { name: "Remover Passeio do Dia atual do roteiro" }),
  ).toBeVisible();

  await tripNav.getByRole("link", { name: "Guia" }).click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/guia$`));
  await expect(page.getByText("Hoje", { exact: true }).first()).toBeVisible();
});
