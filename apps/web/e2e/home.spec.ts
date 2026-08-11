import { expect, test } from "@playwright/test";

test("exibe a proposta de valor e a prévia do guia", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Decisões melhores para cada momento da sua viagem." }),
  ).toBeVisible();
  await expect(page.getByLabel("Prévia visual do futuro guia de viagem")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pipa, Rio Grande do Norte" })).toBeVisible();
});

test("mantém a explicação institucional acessível", async ({ page }) => {
  await page.goto("/");

  const action = page.getByRole("link", { name: "Entender o projeto" });
  await expect(action).toBeVisible();
  await action.click();
  await expect(
    page.getByRole("heading", { name: "Menos listas. Mais contexto para decidir." }),
  ).toBeVisible();
});

test("abre a área de produto a partir da landing", async ({ page }) => {
  await page.goto("/");
  const tripsHeading = page.getByRole("heading", { name: "Minhas viagens" });
  await Promise.all([
    tripsHeading.waitFor(),
    page.getByRole("link", { name: "Abrir o RouteBook" }).first().click(),
  ]);

  await expect(page).toHaveURL(/\/viagens$/);
  await expect(tripsHeading).toBeVisible();
});
