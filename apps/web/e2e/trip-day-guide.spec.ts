import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

function pipaTripName(prefix: string) {
  return `${prefix} ${test.info().project.name} ${Date.now()}`;
}

function currentPipaDate(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: "year" | "month" | "day") =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function canonicalOpenDayIndex(): number {
  const today = currentPipaDate();
  if (today < "2026-08-22" || today > "2026-08-29") return 1;
  return Number(today.slice(-2)) - 21;
}

async function ensureDayOpen(page: Parameters<typeof test>[0] extends never ? never : never) {
  return page;
}

test("abre o Guia da viagem e cobre os oito Dias reais de Pipa", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: pipaTripName("Guia completo Pipa"),
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}`);
  const guideEntry = page.getByRole("link", { name: "Abrir Guia da viagem" });
  await expect(guideEntry).toBeVisible();
  await guideEntry.click();

  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/guia$`));
  await expect(page.getByRole("heading", { name: "Guia da viagem em Pipa" })).toBeVisible();
  await expect(page.getByText(/Editorial, não aplicado/)).toBeVisible();
  await expect(page.locator('[id^="guia-dia-"]')).toHaveCount(8);
  await expect(
    page.getByRole("navigation", { name: "Dias do Guia da viagem" }).getByRole("link"),
  ).toHaveCount(8);

  const guideMapHeadingIds = await page
    .locator("h2")
    .filter({ hasText: "Mapa do Dia" })
    .evaluateAll((headings) => headings.map((heading) => heading.id));
  expect(guideMapHeadingIds).toHaveLength(8);
  expect(new Set(guideMapHeadingIds).size).toBe(8);

  const openDayIndex = canonicalOpenDayIndex();
  await expect(page.locator(`#guia-dia-${openDayIndex}`)).toHaveAttribute("open", "");

  const firstDay = page.locator("#guia-dia-1");
  if (openDayIndex !== 1) await firstDay.locator("summary").click();
  const firstDayStops = firstDay.getByRole("list", { name: "Paradas sugeridas para o Dia 1" });
  await expect(firstDayStops.getByRole("listitem")).toHaveCount(2);
  await expect(firstDayStops.getByRole("heading", { name: "Chapadão de Pipa" })).toBeVisible();
  await expect(firstDayStops.getByLabel("Parada 1")).toBeVisible();
  await expect(firstDayStops.getByLabel("Parada 2")).toBeVisible();
  await expect(firstDayStops.getByRole("img")).toHaveCount(2);
  await expect(firstDayStops.getByText(/em linha reta/)).toHaveCount(2);
  await expect(firstDay.getByRole("link", { name: "Rota e tempo no Maps" })).toHaveCount(2);

  const firstDayLegend = firstDay.getByRole("list", { name: "Legenda do mapa" });
  await expect(firstDayLegend).toContainText("Lugar publicado");
  await expect(firstDayLegend).not.toContainText("Atividade planejada");
  await expect(firstDay.getByRole("list", { name: "Locais exibidos no mapa" })).toContainText(
    "Parada sugerida 1: Chapadão de Pipa",
  );
  await expect(
    firstDay.getByRole("link", { name: "Abrir sequência do Dia no Google Maps" }),
  ).toHaveAttribute("href", /google\.com\/maps\/dir/);

  const planLink = firstDay.getByRole("link", { name: "Planejar neste Dia" }).first();
  await expect(planLink).toHaveAttribute(
    "href",
    new RegExp(`dia=2026-08-22#adicionar-ao-roteiro$`),
  );

  const lastDay = page.locator("#guia-dia-8");
  if (openDayIndex !== 8) await lastDay.locator("summary").click();
  await expect(lastDay.getByText("Despedida leve no centro")).toBeVisible();
  await expect(
    lastDay.getByRole("list", { name: "Paradas sugeridas para o Dia 8" }).getByRole("listitem"),
  ).toHaveCount(2);
});

test("não inventa Dias ausentes e usa uma despedida leve na viagem curta", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: pipaTripName("Guia curto Pipa"),
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}/guia`);

  await expect(page.locator('[id^="guia-dia-"]')).toHaveCount(3);
  await expect(page.locator("#guia-dia-4")).toHaveCount(0);
  await expect(page.locator("#guia-dia-3").locator("summary")).toContainText(
    "Despedida leve no centro",
  );
});

test("não finge rota quando a hospedagem não está geocodificada", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: pipaTripName("Guia sem coordenadas"),
    startDate: "2026-08-22",
    endDate: "2026-08-29",
  });

  await page.goto(`/viagens/${trip.id}/guia`);

  await expect(page.getByText("Hospedagem sem coordenadas")).toHaveCount(22);
  await expect(page.getByRole("link", { name: "Rota e tempo no Maps" })).toHaveCount(0);
  await expect(
    page.getByText(/Informe uma hospedagem com localização para abrir a sequência do Dia/),
  ).toHaveCount(8);
});

test("mantém a ação principal utilizável em viewport mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { trip } = await createAuthenticatedE2ETrip({
    name: pipaTripName("Guia mobile Pipa"),
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}/guia`);

  await expect(page.getByRole("heading", { name: "Guia da viagem em Pipa" })).toBeVisible();
  const firstDay = page.locator("#guia-dia-1");
  if ((await firstDay.getAttribute("open")) === null) await firstDay.locator("summary").click();
  await expect(firstDay.getByRole("link", { name: "Planejar neste Dia" }).first()).toBeVisible();
});
