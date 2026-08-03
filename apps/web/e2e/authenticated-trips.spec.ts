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
  await page.getByRole("button", { name: "Criar viagem" }).click();

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

  const forbiddenResponse = await page.goto(tripHref!);
  expect(forbiddenResponse?.status()).toBe(404);
});
