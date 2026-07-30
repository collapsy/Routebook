import { expect, test, type Page } from "@playwright/test";

async function createTripAndOpenItinerary(page: Page, tripName: string) {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();
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
  const existingPeriods = page.locator('ol[aria-label="Períodos livres do dia"] > li');
  const initialCount = await existingPeriods.count();
  const form = page.locator("form").filter({
    has: page.getByRole("button", { name: "Adicionar período livre" }),
  });

  await form.getByLabel("Dia do período livre").selectOption(input.dayDate);
  await form.getByLabel("Proteção do espaço").selectOption(input.mode);
  await form.getByLabel("Horário do período livre (opcional)").fill(input.startTime ?? "");
  await form.getByLabel("Duração do período livre (opcional)").fill(input.durationMinutes ?? "");
  await form.getByRole("button", { name: "Adicionar período livre" }).click();
  await expect(existingPeriods).toHaveCount(initialCount + 1);
}

test("cria e preserva um período livre protegido", async ({ page }, testInfo) => {
  const tripName = `Período livre ${testInfo.project.name} ${Date.now()}`;
  await createTripAndOpenItinerary(page, tripName);

  await submitFreePeriod(page, {
    dayDate: "2026-08-23",
    mode: "protected",
    startTime: "15:30",
    durationMinutes: "90",
  });

  await expect(page).toHaveURL(/periodoLivreCriado=1$/);
  await expect(page.getByRole("status")).toContainText("Período livre adicionado");
  const secondDay = page.locator(".itinerary-day-card").nth(1);
  await expect(secondDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
  await expect(secondDay.getByText("15:30", { exact: true })).toBeVisible();
  await expect(secondDay.getByText(/1 h 30 min/)).toBeVisible();
  await expect(secondDay.getByText("Protegido", { exact: true })).toBeVisible();
  await expect(secondDay.getByText("Planejamento aberto", { exact: true })).toHaveCount(0);

  await page.reload();
  await expect(secondDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
  await expect(secondDay.getByText("15:30", { exact: true })).toBeVisible();
});

test("edita e limpa os dados temporais de um período livre", async ({ page }, testInfo) => {
  const tripName = `Editar período livre ${testInfo.project.name} ${Date.now()}`;
  await createTripAndOpenItinerary(page, tripName);

  await submitFreePeriod(page, {
    dayDate: "2026-08-23",
    mode: "flexible",
    startTime: "14:00",
    durationMinutes: "120",
  });

  const secondDay = page.locator(".itinerary-day-card").nth(1);
  const freePeriodItem = secondDay.getByRole("listitem").filter({
    hasText: "Período livre flexível",
  });
  const editor = freePeriodItem.locator("details");
  await editor.locator("summary").click();
  await editor.getByLabel("Proteção do espaço").selectOption("protected");
  await editor.getByLabel("Horário do período livre (opcional)").fill("");
  await editor.getByLabel("Duração do período livre (opcional)").fill("");
  await editor.getByRole("button", { name: "Salvar período livre" }).click();

  await expect(page).toHaveURL(/periodoLivreEditado=1$/);
  await expect(page.getByRole("status")).toContainText("Período livre atualizado");
  await expect(secondDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
  await expect(secondDay.getByText("Horário aberto", { exact: true })).toBeVisible();
  await expect(secondDay.getByText(/duração aberta/)).toBeVisible();

  await page.reload();
  await expect(secondDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
  await expect(secondDay.getByText("Horário aberto", { exact: true })).toBeVisible();
});

test("remove somente o período livre selecionado e preserva os demais", async ({
  page,
}, testInfo) => {
  const tripName = `Remover período livre ${testInfo.project.name} ${Date.now()}`;
  await createTripAndOpenItinerary(page, tripName);

  await submitFreePeriod(page, {
    dayDate: "2026-08-23",
    mode: "flexible",
    startTime: "13:00",
  });
  await submitFreePeriod(page, {
    dayDate: "2026-08-23",
    mode: "protected",
    startTime: "16:00",
  });

  const secondDay = page.locator(".itinerary-day-card").nth(1);
  const flexiblePeriod = secondDay.getByRole("listitem").filter({
    hasText: "Período livre flexível",
  });
  await flexiblePeriod
    .getByRole("button", { name: "Remover Período livre flexível às 13:00 do roteiro" })
    .click();

  await expect(page).toHaveURL(/periodoLivreRemovido=1$/);
  await expect(page.getByRole("status")).toContainText("Período livre removido");
  await expect(secondDay.getByText("Período livre flexível", { exact: true })).toHaveCount(0);
  await expect(secondDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
  await expect(secondDay.getByText("16:00", { exact: true })).toBeVisible();
  await expect(secondDay.locator("header small")).toContainText("1 período livre");

  await page.reload();
  await expect(secondDay.getByText("Período livre flexível", { exact: true })).toHaveCount(0);
  await expect(secondDay.getByText("Período livre protegido", { exact: true })).toBeVisible();
});
