import { expect, test } from "@playwright/test";

test("cria e preserva um período livre protegido", async ({ page }, testInfo) => {
  const tripName = `Período livre ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();

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
