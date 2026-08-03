import { expect, test } from "@playwright/test";

test("cadastra, encerra e recria a sessão pelo servidor", async ({ page }, testInfo) => {
  const email = `rb-inc-089-${testInfo.project.name}-${Date.now()}@example.com`;
  const password = "routebook-e2e-password";

  await page.goto("/criar-conta?next=%2Fviagens");
  await page.getByLabel("Nome").fill("RouteBook E2E");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/viagens$/);
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/entrar?next=%2Fviagens");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/viagens$/);
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
});

test("descarta destino externo após autenticação", async ({ page }, testInfo) => {
  const email = `rb-inc-089-safe-${testInfo.project.name}-${Date.now()}@example.com`;

  await page.goto("/criar-conta?next=https%3A%2F%2Fevil.example");
  await page.getByLabel("Nome").fill("Safe Redirect");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill("routebook-safe-password");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/viagens$/);
});
