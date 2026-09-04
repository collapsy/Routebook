import { expect, test } from "@playwright/test";

test("redireciona visitante anônimo para entrada", async ({ page }) => {
  await page.goto("/viagens");

  await expect(page).toHaveURL(/\/entrar\?next=%2Fviagens$/);
  await expect(page.getByRole("heading", { name: "Entre no RouteBook" })).toBeVisible();
});

test("cria Trip autenticada e impede leitura por outro User", async ({ page }, testInfo) => {
  const suffix = `${testInfo.project.name}-${Date.now()}`;
  const firstEmail = `rb-inc-090-owner-${suffix}@example.com`;
  const secondEmail = `rb-inc-090-other-${suffix}@example.com`;
  const password = "routebook-e2e-password";
  const tripName = `Pipa isolada ${suffix}`;

  await page.goto("/criar-conta?next=%2Fviagens");
  await page.getByLabel("Nome").fill("Owner RB-INC-090");
  await page.getByLabel("Email").fill(firstEmail);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/viagens$/);

  await page.goto("/viagens/nova");
  await expect(page.getByLabel("Responsável pela viagem")).toHaveCount(0);
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Para onde você vai?").fill("Pipa, RN");
  await page.getByLabel("Quando começa?").fill("2026-10-10");
  await page.getByLabel("Quando termina?").fill("2026-10-12");
  await page.getByRole("button", { name: "Criar meu guia" }).click();

  await expect(page).toHaveURL(/\/viagens\?created=1$/);
  const tripLink = page.getByRole("link", { name: tripName });
  await expect(tripLink).toBeVisible();
  const tripHref = await tripLink.getAttribute("href");
  expect(tripHref).toMatch(/^\/viagens\/[0-9a-f-]+$/);

  await tripLink.click();
  await expect(page).toHaveURL(new RegExp(`${tripHref}$`));
  await expect(page.getByRole("heading", { name: tripName })).toBeVisible();
  await expect(
    page.locator("#conteudo-principal").getByText("Owner RB-INC-090", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/criar-conta?next=%2Fviagens");
  await page.getByLabel("Nome").fill("Outro RB-INC-090");
  await page.getByLabel("Email").fill(secondEmail);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/viagens$/);
  await expect(page.getByText(tripName, { exact: true })).toHaveCount(0);

  await page.goto(tripHref!);
  await expect(page.getByRole("heading", { name: "Essa página saiu do roteiro." })).toBeVisible();
  await expect(page.getByText(tripName, { exact: true })).toHaveCount(0);
});

test("cria Trip para Florianópolis sem destino fixo na interface", async ({ page }, testInfo) => {
  const suffix = "rb-inc-174-" + testInfo.project.name + "-" + Date.now();
  const email = suffix + "@example.com";
  const password = "routebook-e2e-password";
  const tripName = "Florianópolis " + suffix;

  await page.goto("/criar-conta?next=%2Fviagens");
  await page.getByLabel("Nome").fill("Owner RB-INC-174");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/viagens$/);

  await page.goto("/viagens/nova");
  await expect(page.getByLabel("Para onde você vai?")).toBeEditable();
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Para onde você vai?").fill("Florianópolis, SC");
  await page.getByLabel("Quando começa?").fill("2026-11-10");
  await page.getByLabel("Quando termina?").fill("2026-11-17");
  await page.getByRole("button", { name: "Criar meu guia" }).click();

  await expect(page).toHaveURL(/\/viagens\?created=1$/);
  const card = page.getByRole("article").filter({ hasText: tripName });
  await expect(card).toContainText("Florianópolis, SC");
});

test(
  "cria Trip para São Paulo selecionando sugestão de Destination",
  async ({ page }, testInfo) => {
    const suffix = `rb-inc-180-${testInfo.project.name}-${Date.now()}`;
    const email = `${suffix}@example.com`;
    const password = "routebook-e2e-password";
    const tripName = `São Paulo sugerida ${suffix}`;

    await page.goto("/criar-conta?next=%2Fviagens");
    await page.getByLabel("Nome").fill("Owner RB-INC-180");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page).toHaveURL(/\/viagens$/);

    await page.goto("/viagens/nova");
    await page.getByLabel("Nome da viagem").fill(tripName);
    const destination = page.getByLabel("Para onde você vai?");
    await destination.fill("sao paulo");

    const suggestions = page.getByRole("listbox", { name: "Sugestões de destinos" });
    await expect(suggestions).toBeVisible({ timeout: 5_000 });
    const saoPaulo = suggestions.getByRole("option", { name: /São Paulo.*SP, Brasil/ });
    await expect(saoPaulo).toBeVisible();
    await saoPaulo.click();
    await expect(destination).toHaveValue("São Paulo, SP, Brasil");

    await page.getByLabel("Quando começa?").fill("2026-11-10");
    await page.getByLabel("Quando termina?").fill("2026-11-12");
    await page.getByRole("button", { name: "Criar meu guia" }).click();

    await expect(page).toHaveURL(/\/viagens\?created=1$/);
    const card = page.getByRole("article").filter({ hasText: tripName });
    await expect(card).toContainText("São Paulo, SP");
  },
);

test("owner cancela ou confirma a exclusão definitiva da própria Trip", async ({
  page,
}, testInfo) => {
  const suffix = `${testInfo.project.name}-${Date.now()}`;
  const email = `rb-inc-138-delete-${suffix}@example.com`;
  const password = "routebook-e2e-password";
  const tripName = `Viagem descartável ${suffix}`;

  await page.goto("/criar-conta?next=%2Fviagens");
  await page.getByLabel("Nome").fill("Owner RB-INC-138");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/viagens$/);

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Para onde você vai?").fill("Pipa, RN");
  await page.getByLabel("Quando começa?").fill("2026-12-01");
  await page.getByLabel("Quando termina?").fill("2026-12-03");
  await page.getByRole("button", { name: "Criar meu guia" }).click();
  await expect(page).toHaveURL(/\/viagens\?created=1$/);

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("button", { name: "Excluir viagem" }).click();
  await expect(page.getByText(`Excluir “${tripName}”?`)).toBeVisible();

  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("heading", { name: tripName })).toBeVisible();
  await expect(page.getByText(`Excluir “${tripName}”?`)).toHaveCount(0);

  await page.getByRole("button", { name: "Excluir viagem" }).click();
  await page.getByRole("button", { name: "Excluir definitivamente" }).click();

  await expect(page).toHaveURL(/\/viagens\?deleted=1$/);
  await expect(page.getByRole("status")).toContainText("Viagem excluída com sucesso.");
  await expect(page.getByRole("link", { name: tripName })).toHaveCount(0);
});
