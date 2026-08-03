import { expect, test } from "@playwright/test";

test("exibe Minhas viagens com ação de criação", async ({ page }) => {
  await page.goto("/viagens");

  await expect(page.getByRole("heading", { name: "Minhas viagens" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Criar (primeira|nova) viagem/ })).toBeVisible();
});

test("cria, abre e mantém uma viagem persistida", async ({ page }, testInfo) => {
  const tripName = `Pipa persistida ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await expect(page).toHaveURL(/\/viagens\?created=1$/);
  await expect(page.getByRole("status")).toContainText("Viagem criada e salva");
  await expect(page.getByRole("heading", { name: tripName })).toBeVisible();

  await page.getByRole("link", { name: tripName }).click();
  await expect(page).toHaveURL(/\/viagens\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: tripName })).toBeVisible();
  await expect(page.getByRole("heading", { name: "8 dias de viagem" })).toBeVisible();
  await expect(page.getByText("Dia 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Dia 8", { exact: true })).toBeVisible();
  await expect(page.getByText("Condomínio Solar Água")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: tripName })).toBeVisible();
});

test("configura e mantém o contexto progressivo da viagem", async ({ page }, testInfo) => {
  const tripName = `Contexto Pipa ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByRole("button", { name: "Criar viagem" }).click();
  await page.getByRole("link", { name: tripName }).click();

  await page.getByRole("link", { name: "Configurar contexto" }).click();
  await page.getByLabel("Quantidade de viajantes").fill("3");
  await page.getByLabel("Praias").check();
  await page.getByLabel("Gastronomia").check();
  await page.getByLabel("Vida noturna").check();
  await page.getByLabel("Ritmo da viagem").selectOption("balanced");
  await page.getByLabel("Transporte preferencial").selectOption("ride-hailing");
  await page.getByLabel("Orçamento total estimado").fill("4.500,00");
  await page.getByRole("button", { name: "Salvar contexto" }).click();

  await expect(page).toHaveURL(/\/viagens\/[0-9a-f-]+\?contextUpdated=1$/);
  await expect(page.getByRole("status")).toContainText("Contexto da viagem salvo");
  await expect(page.getByText("Praias, Gastronomia, Vida noturna")).toBeVisible();
  await expect(page.getByText("Equilibrado", { exact: true })).toBeVisible();
  await expect(page.getByText("Aplicativos e táxi", { exact: true })).toBeVisible();
  await expect(page.getByText("R$ 4.500,00", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText("Praias, Gastronomia, Vida noturna")).toBeVisible();
  await page.getByRole("link", { name: "Editar contexto" }).click();
  await expect(page.getByLabel("Quantidade de viajantes")).toHaveValue("3");
  await expect(page.getByLabel("Praias")).toBeChecked();
});

test("apresenta erro quando o período é invertido", async ({ page }) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Data de início").fill("2026-08-29");
  await page.getByLabel("Data de término").fill("2026-08-22");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await expect(page.getByText("A data final não pode ser anterior à data inicial.")).toBeVisible();
  await expect(page).toHaveURL(/\/viagens\/nova$/);
});

test("trata TripId inexistente e mantém a navegação global", async ({ page }) => {
  await page.goto("/viagens/00000000-0000-0000-0000-000000000000");
  await expect(page.getByRole("heading", { name: "Essa página saiu do roteiro." })).toBeVisible();
  await page.getByRole("link", { name: "Voltar para Minhas viagens" }).click();
  await expect(page).toHaveURL(/\/viagens$/);

  await page.goto("/rota-inexistente");
  await expect(page.getByRole("heading", { name: "Essa página saiu do roteiro." })).toBeVisible();
});
