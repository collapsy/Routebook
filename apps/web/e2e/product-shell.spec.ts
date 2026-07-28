import { expect, test } from "@playwright/test";

test("orienta o primeiro acesso em Minhas viagens", async ({ page }) => {
  await page.goto("/viagens");

  await expect(page.getByRole("heading", { name: "Minhas viagens" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Você ainda não criou nenhuma viagem" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar primeira viagem" })).toBeVisible();
});

test("navega até a preparação da criação sem persistir dados", async ({ page }) => {
  await page.goto("/viagens");
  await page.getByRole("link", { name: "Criar primeira viagem" }).click();

  await expect(page).toHaveURL(/\/viagens\/nova$/);
  await expect(
    page.getByRole("heading", { name: "A criação da sua viagem começa aqui." }),
  ).toBeVisible();
  await expect(page.getByText("Nenhum dado será salvo nesta etapa.")).toBeVisible();
});

test("mantém a navegação global utilizável", async ({ page }) => {
  await page.goto("/viagens/nova");
  await page.getByRole("link", { name: "Minhas viagens" }).click();

  await expect(page).toHaveURL(/\/viagens$/);
  await expect(page.getByRole("heading", { name: "Minhas viagens" })).toBeVisible();
});

test("oferece recuperação para rota inexistente", async ({ page }) => {
  await page.goto("/rota-inexistente");

  await expect(page.getByRole("heading", { name: "Essa página saiu do roteiro." })).toBeVisible();
  await page.getByRole("link", { name: "Voltar para Minhas viagens" }).click();
  await expect(page).toHaveURL(/\/viagens$/);
});
