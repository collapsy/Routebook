import { expect, test, type Page } from "@playwright/test";

import { DrizzleItineraryRepository } from "@routebook/database";
import { addFreePeriod, createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

type FreePeriodFixtureInput = Readonly<{
  mode: "flexible" | "protected";
  startTime?: string;
  durationMinutes?: number;
}>;

async function createFreePeriodFixture(
  tripName: string,
  freePeriods: readonly FreePeriodFixtureInput[] = [],
): Promise<string> {
  const now = new Date();
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-29",
    },
    now,
  );
  let itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);
  for (const freePeriod of freePeriods) {
    itinerary = addFreePeriod(
      itinerary,
      {
        dayDate: "2026-08-23",
        mode: freePeriod.mode,
        ...(freePeriod.startTime !== undefined ? { startTime: freePeriod.startTime } : {}),
        ...(freePeriod.durationMinutes !== undefined
          ? { durationMinutes: freePeriod.durationMinutes }
          : {}),
      },
      now,
    );
  }

  await new DrizzleItineraryRepository().save(itinerary);
  return trip.id;
}

async function openFreePeriodComposer(page: Page) {
  await page
    .locator("summary")
    .filter({ hasText: /^Adicionar período livre$/ })
    .click();
  await expect(page.getByRole("heading", { name: "Adicione um período livre" })).toBeVisible();
}

async function submitFreePeriod(
  page: Page,
  input: {
    dayDate: string;
    mode: "flexible" | "protected";
    startTime?: string;
    durationMinutes?: string;
  },
) {
  await openFreePeriodComposer(page);
  const existingPeriods = page.locator('ol[aria-label="Períodos livres do dia"] > li');
  const initialCount = await existingPeriods.count();
  const form = page.locator("form").filter({
    has: page.getByRole("button", { name: "Adicionar período livre" }),
  });

  await form.getByLabel("Dia do período livre").selectOption(input.dayDate);
  await form.getByLabel("Proteção do espaço").selectOption(input.mode);
  await form.getByLabel("Horário do período livre (opcional)").fill(input.startTime ?? "");
  await form.getByLabel("Duração do período livre (opcional)").fill(input.durationMinutes ?? "");
  const actionPathname = new URL(page.url()).pathname;
  const actionResponse = page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === "POST" && new URL(request.url()).pathname === actionPathname;
  });
  const [response] = await Promise.all([
    actionResponse,
    form.getByRole("button", { name: "Adicionar período livre" }).click(),
  ]);
  const redirectUrl = response.headers()["x-action-redirect"]?.split(";")[0];
  expect(redirectUrl).toMatch(new RegExp(`periodoLivreCriado=1.*dia=${input.dayDate}`));
  await page.goto(redirectUrl!);
  await expect(existingPeriods).toHaveCount(initialCount + 1);
}

test("cria e preserva um período livre protegido no Dia selecionado", async ({
  page,
}, testInfo) => {
  const tripName = `Período livre ${testInfo.project.name} ${Date.now()}`;
  const tripId = await createFreePeriodFixture(tripName);
  await page.goto(`/viagens/${tripId}/roteiro?dia=2026-08-23`);

  await submitFreePeriod(page, {
    dayDate: "2026-08-23",
    mode: "protected",
    startTime: "15:30",
    durationMinutes: "90",
  });

  await expect(page).toHaveURL(/periodoLivreCriado=1.*dia=2026-08-23/);
  await expect(page.getByRole("status")).toContainText("Período livre adicionado");
  const focusedDay = page.locator(".itinerary-day-card");
  await expect(focusedDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
  await expect(focusedDay.getByText("15:30", { exact: true })).toBeVisible();
  await expect(focusedDay.getByText(/1 h 30 min/)).toBeVisible();
  await expect(focusedDay.getByText("Protegido", { exact: true })).toBeVisible();
  await expect(focusedDay.getByText("Planejamento aberto", { exact: true })).toHaveCount(0);

  await page.reload();
  await expect(focusedDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
  await expect(focusedDay.getByText("15:30", { exact: true })).toBeVisible();
});

test("edita e limpa os dados temporais preservando o Dia em foco", async ({ page }, testInfo) => {
  const tripName = `Editar período livre ${testInfo.project.name} ${Date.now()}`;
  const tripId = await createFreePeriodFixture(tripName, [
    { mode: "flexible", startTime: "14:00", durationMinutes: 120 },
  ]);
  await page.goto(`/viagens/${tripId}/roteiro?dia=2026-08-23`);

  const focusedDay = page.locator(".itinerary-day-card");
  const freePeriodItem = focusedDay.getByRole("listitem").filter({
    hasText: "Período livre flexível",
  });
  const editor = freePeriodItem.locator("details");
  await editor.locator("summary").click();
  await editor.getByLabel("Proteção do espaço").selectOption("protected");
  await editor.getByLabel("Horário do período livre (opcional)").fill("");
  await editor.getByLabel("Duração do período livre (opcional)").fill("");
  const saveButton = editor.getByRole("button", { name: "Salvar período livre" });
  await expect(saveButton).toBeEnabled();

  const actionPathname = new URL(page.url()).pathname;
  const actionResponse = page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === "POST" && new URL(request.url()).pathname === actionPathname;
  });
  const [response] = await Promise.all([actionResponse, saveButton.click()]);
  const redirectUrl = response.headers()["x-action-redirect"]?.split(";")[0];
  expect(redirectUrl).toMatch(/periodoLivreEditado=1.*dia=2026-08-23/);
  await page.goto(redirectUrl!);

  await expect(page).toHaveURL(/periodoLivreEditado=1.*dia=2026-08-23/);
  await expect(focusedDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
  await expect(focusedDay.getByText("Horário aberto", { exact: true })).toBeVisible();
  await expect(focusedDay.getByText(/duração aberta/)).toBeVisible();

  await page.reload();
  await expect(focusedDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
  await expect(focusedDay.getByText("Horário aberto", { exact: true })).toBeVisible();
});

test("remove somente o período livre selecionado e preserva os demais no Dia", async ({
  page,
}, testInfo) => {
  const tripName = `Remover período livre ${testInfo.project.name} ${Date.now()}`;
  const tripId = await createFreePeriodFixture(tripName, [
    { mode: "flexible", startTime: "13:00" },
    { mode: "protected", startTime: "16:00" },
  ]);
  await page.goto(`/viagens/${tripId}/roteiro?dia=2026-08-23`);

  const focusedDay = page.locator(".itinerary-day-card");
  const flexiblePeriod = focusedDay.getByRole("listitem").filter({
    hasText: "Período livre flexível",
  });
  const removeButton = flexiblePeriod.getByRole("button", {
    name: "Remover Período livre flexível às 13:00 do roteiro",
  });
  await expect(removeButton).toBeEnabled();
  const actionPathname = new URL(page.url()).pathname;
  const removalResponse = page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === "POST" && new URL(request.url()).pathname === actionPathname;
  });
  const [response] = await Promise.all([removalResponse, removeButton.click()]);
  const redirectUrl = response.headers()["x-action-redirect"]?.split(";")[0];
  expect(redirectUrl).toMatch(/periodoLivreRemovido=1.*dia=2026-08-23/);
  await page.goto(redirectUrl!);

  await expect(page).toHaveURL(/periodoLivreRemovido=1.*dia=2026-08-23/);
  await expect(focusedDay.getByText("Período livre flexível", { exact: true })).toHaveCount(0);
  await expect(focusedDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
  await expect(focusedDay.getByText("16:00", { exact: true })).toBeVisible();
  await expect(page.locator("#dia-em-foco")).toContainText("0 atividades · 1 período livre");

  await page.reload();
  await expect(focusedDay.getByText("Período livre flexível", { exact: true })).toHaveCount(0);
  await expect(focusedDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
});
