import { expect, test } from "@playwright/test";

async function createTripAndOpenItinerary(page: import("@playwright/test").Page, tripName: string) {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();
}

test("cria e preserva um período livre protegido", async ({ page }, testInfo) => {
  const tripName = `Período livre ${testInfo.project.name} ${Date.now()}`;
  await createTripAndOpenItinerary(page, tripName);

  await page.getByLabel("Dia do período livre").selectOption("2026-08-23");
  await page.getByLabel("Proteção do espaço").selectOption("protected");
  await page.getByLabel("Horário do período livre (opcional)").fill("15:30");
  await page.getByLabel("Duração do período livre (opcional)").fill("90");
  await page.getByRole("button", { name: "Adicionar período livre" }).click();

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

  await page.getByLabel("Dia do período livre").selectOption("2026-08-23");
  await page.getByLabel("Proteção do espaço").selectOption("flexible");
  await page.getByLabel("Horário do período livre (opcional)").fill("14:00");
  await page.getByLabel("Duração do período livre (opcional)").fill("120");
  await page.getByRole("button", { name: "Adicionar período livre" }).click();

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

  await page.getByLabel("Dia do período livre").selectOption("2026-08-23");
  await page.getByLabel("Proteção do espaço").selectOption("flexible");
  await page.getByLabel("Horário do período livre (opcional)").fill("13:00");
  await page.getByRole("button", { name: "Adicionar período livre" }).click();

  await page.getByLabel("Dia do período livre").selectOption("2026-08-23");
  await page.getByLabel("Proteção do espaço").selectOption("protected");
  await page.getByLabel("Horário do período livre (opcional)").fill("16:00");
  await page.getByRole("button", { name: "Adicionar período livre" }).click();

  const secondDay = page.locator(".itinerary-day-card").nth(1);
  const flexiblePeriod = secondDay.getByRole("listitem").filter({
    hasText: "Período livre flexível",
  });
  await flexiblePeriod.getByRole("button", { name: /Remover período livre/ }).click();

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
