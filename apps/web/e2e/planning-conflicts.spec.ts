import { expect, test } from "@playwright/test";

test("revisa um conflito de horários e retorna ao dia afetado", async ({ page }, testInfo) => {
  const tripName = `Conflitos ${testInfo.project.name} ${Date.now()}`;
  const firstActivity = "Café demorado";
  const secondActivity = "Passeio de barco";

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();

  const composer = page.locator(".itinerary-form");
  await composer.getByLabel("Dia da viagem").selectOption("2026-08-22");
  await composer.getByLabel("Título").fill(firstActivity);
  await composer.getByLabel("Horário opcional").fill("09:00");
  await composer.getByLabel("Duração opcional").fill("120");
  await composer.getByRole("button", { name: "Adicionar ao roteiro" }).click();

  await expect(page).toHaveURL(/atividadeCriada=1$/);
  await composer.getByLabel("Dia da viagem").selectOption("2026-08-22");
  await composer.getByLabel("Título").fill(secondActivity);
  await composer.getByLabel("Horário opcional").fill("10:00");
  await composer.getByLabel("Duração opcional").fill("60");
  await composer.getByRole("button", { name: "Adicionar ao roteiro" }).click();

  await expect(page).toHaveURL(/atividadeCriada=1$/);
  await page.getByRole("link", { name: "Revisar conflitos" }).click();

  await expect(page).toHaveURL(/\/viagens\/[^/]+\/roteiro\/revisao$/);
  await expect(page.getByRole("heading", { level: 1, name: "Revisão de Conflitos" })).toBeVisible();
  const conflictList = page.getByRole("list", {
    name: "Conflitos de Planejamento encontrados",
  });
  await expect(conflictList.getByRole("heading", { name: "Horários sobrepostos" })).toBeVisible();
  await expect(conflictList.getByText(firstActivity, { exact: true })).toBeVisible();
  await expect(conflictList.getByText(secondActivity, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Erros 0/ }).click();
  await expect(page.getByText("Nenhum conflito desta severidade", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Riscos 1/ }).click();
  await conflictList.getByRole("link", { name: /Ver dia no Roteiro/ }).click();

  await expect(page).toHaveURL(/\/roteiro#[^#]+$/);
  const affectedDayId = new URL(page.url()).hash.slice(1);
  expect(affectedDayId).not.toBe("");
  const affectedDay = page.locator(`.itinerary-day-card[id="${affectedDayId}"]`);
  await expect(affectedDay.getByText(firstActivity, { exact: true })).toBeVisible();
  await expect(affectedDay.getByText(secondActivity, { exact: true })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/viagens\/[^/]+\/roteiro\/revisao$/);
  await page.getByText("Ignorar risco", { exact: true }).click();
  await page
    .getByRole("checkbox", { name: /Entendo que este risco continuará no Roteiro/ })
    .check();
  await page.getByRole("button", { name: "Confirmar e ignorar risco" }).click();

  await expect(page).toHaveURL(/riscoIgnorado=1$/);
  await expect(page.getByText(/Risco ignorado e Decision registrada/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nenhum conflito aberto" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Riscos ignorados" })).toBeVisible();
  const ignoredHistory = page.getByRole("list", { name: "Riscos ignorados registrados" });
  await expect(ignoredHistory.getByRole("heading", { name: "Horários sobrepostos" })).toBeVisible();
  await expect(ignoredHistory.getByText("RouteBook E2E", { exact: true })).toBeVisible();
  const ignoredActivities = ignoredHistory.locator("p").filter({ hasText: "Atividades:" });
  await expect(ignoredActivities).toContainText(firstActivity);
  await expect(ignoredActivities).toContainText(secondActivity);
  await expect(ignoredHistory.getByText("Restaurar", { exact: true })).toHaveCount(0);

  await page.getByRole("link", { name: "Voltar para o Roteiro" }).click();
  await expect(page.getByText(firstActivity, { exact: true })).toBeVisible();
  await expect(page.getByText(secondActivity, { exact: true })).toBeVisible();
});
