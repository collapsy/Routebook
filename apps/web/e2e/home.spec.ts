import { expect, test } from "@playwright/test";

test("exibe a proposta de valor e a prévia do guia", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Decisões melhores para cada momento da sua viagem." }),
  ).toBeVisible();
  await expect(page.getByLabel("Prévia visual do futuro guia de viagem")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pipa, Rio Grande do Norte" })).toBeVisible();
});

test("mantém a ação principal utilizável", async ({ page }) => {
  await page.goto("/");

  const action = page.getByRole("link", { name: "Entender o RouteBook" });
  await expect(action).toBeVisible();
  await action.click();
  await expect(page.getByRole("heading", { name: "Menos listas. Mais contexto para decidir." })).toBeVisible();
});
