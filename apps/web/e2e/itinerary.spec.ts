import { expect, test } from "@playwright/test";

test("cria e preserva uma atividade no roteiro manual", async ({ page }, testInfo) => {
  const tripName = `Roteiro ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await expect(page).toHaveURL(/\/viagens\?created=1$/);
  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();

  await expect(page.getByRole("heading", { level: 1, name: tripName })).toBeVisible();
  await expect(page.getByText("8", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("dias", { exact: true })).toBeVisible();

  await page.getByLabel("Dia da viagem").selectOption("2026-08-22");
  await page.getByLabel("Título").fill("Praia ao amanhecer");
  await page.getByLabel("Horário opcional").fill("09:30");
  await page.getByLabel("Duração opcional").fill("180");
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();

  await expect(page).toHaveURL(/atividadeCriada=1$/);
  await expect(page.getByRole("status")).toContainText("Atividade adicionada");
  await expect(page.getByText("Praia ao amanhecer")).toBeVisible();
  await expect(page.getByText("09:30")).toBeVisible();
  await expect(page.getByText("3 h", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText("Praia ao amanhecer")).toBeVisible();
  await expect(page.getByText("09:30")).toBeVisible();
});
