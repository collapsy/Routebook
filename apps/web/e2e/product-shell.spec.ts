import { expect, test } from "@playwright/test";

test("exibe Minhas viagens com ação de criação", async ({ page }) => {
  await page.goto("/viagens");

  await expect(page.getByRole("heading", { name: "Minhas viagens" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Criar (primeira|nova) viagem/ }),
  ).toBeVisible();
});

test("cria e mantém uma viagem persistida", async ({ page }, testInfo) => {
  const tripName = `Pipa persistida ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("Ronaldo Gentil");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await expect(page).toHaveURL(/\/viagens\?created=1$/);
  await expect(page.getByRole("status")).toContainText("Viagem criada e salva");
  await expect(page.getByRole("heading", { name: tripName })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: tripName })).toBeVisible();
  await expect(page.getByText("Condomínio Solar Água").first()).toBeVisible();
});

test("apresenta erro quando o período é invertido", async ({ page }) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Responsável pela viagem").fill("Ronaldo Gentil");
  await page.getByLabel("Data de início").fill("2026-08-29");
  await page.getByLabel("Data de término").fill("2026-08-22");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await expect(page.getByText("A data final não pode ser anterior à data inicial.")).toBeVisible();
  await expect(page).toHaveURL(/\/viagens\/nova$/);
});

test("mantém a navegação global e a recuperação de 404", async ({ page }) => {
  await page.goto("/viagens/nova");
  await page.getByRole("link", { name: "Minhas viagens", exact: true }).click();
  await expect(page).toHaveURL(/\/viagens$/);

  await page.goto("/rota-inexistente");
  await expect(page.getByRole("heading", { name: "Essa página saiu do roteiro." })).toBeVisible();
  await page.getByRole("link", { name: "Voltar para Minhas viagens" }).click();
  await expect(page).toHaveURL(/\/viagens$/);
});
