import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("pesquisa e combina filtros mantendo lista e mapa sincronizados", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Descoberta ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}/lugares`);
  await expect(page.getByRole("heading", { name: /Lugares em Pipa/ })).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Lugares publicados" }).getByRole("listitem"),
  ).toHaveCount(13);

  await page.getByLabel("Nome ou termo").fill("gastronomico");
  await page.getByLabel("Faixa de preço").selectOption("moderate");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page).toHaveURL(/busca=gastronomico.*preco=moderate/);
  await expect(page.getByRole("heading", { name: "1 lugar encontrado" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Lugares publicados" })).toContainText(
    "Centro Gastronômico de Pipa",
  );
  await expect(page.getByRole("list", { name: "Locais exibidos no mapa" })).toContainText(
    "Centro Gastronômico de Pipa",
  );
  await expect(page.getByLabel("Filtros ativos")).toContainText("Busca: gastronomico");
  await expect(page.getByLabel("Filtros ativos")).toContainText("Preço: Moderado");

  await page.getByRole("link", { name: /Busca: gastronomico.*Remover filtro/ }).click();
  await expect(page).not.toHaveURL(/busca=/);
  await expect(page).toHaveURL(/preco=moderate/);

  await page.getByLabel("Categoria").selectOption("beach");
  await page.getByLabel("Distância máxima").selectOption("3");
  await page.getByLabel("Faixa de preço").selectOption("free");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page.getByRole("list", { name: "Lugares publicados" })).toContainText(
    "Praia do Amor",
  );
  await expect(page.getByRole("list", { name: "Locais exibidos no mapa" })).toContainText(
    "Praia do Amor",
  );
  await expect(page.getByText(/em linha reta da hospedagem/).first()).toBeVisible();

  await page.getByRole("link", { name: "Limpar filtros" }).first().click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares$`));
  await expect(page.getByRole("heading", { name: "13 lugares encontrados" })).toBeVisible();
});

test("orienta recuperação quando os filtros não retornam lugares", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Descoberta vazia ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-24",
  });

  await page.goto(`/viagens/${trip.id}/lugares?busca=termo-sem-resultado`);
  await expect(
    page.getByRole("heading", { name: "Nenhum lugar corresponde aos filtros" }),
  ).toBeVisible();
  await expect(page.getByText(/filtro de distância fica disponível/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Limpar filtros" }).first()).toBeVisible();
  await expect(page.getByText("indisponível")).toHaveCount(0);
});
