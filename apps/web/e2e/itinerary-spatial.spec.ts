import { expect, test } from "@playwright/test";

test("visualiza no mapa a sequência e comunica lacunas geográficas do Dia", async ({
  page,
}, testInfo) => {
  const tripName = `Mapa diário ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Explorar lugares" }).click();

  const firstPlace = page
    .getByRole("list", { name: "Lugares publicados" })
    .getByRole("listitem")
    .first();
  const placeName = (await firstPlace.locator("strong").textContent())?.trim();
  expect(placeName).toBeTruthy();
  await firstPlace.getByRole("link", { name: "Ver detalhes" }).click();
  await page.getByRole("button", { name: "Salvar lugar" }).click();
  await page.getByRole("link", { name: "Visão da viagem" }).click();
  await page.getByRole("link", { name: "Ver lugares salvos" }).click();

  await page.getByLabel("Adicionar ao dia").selectOption("2026-08-23");
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();
  await page.getByLabel("Dia da viagem").selectOption("2026-08-23");
  await page.getByLabel("Título").fill("Pausa manual");
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();
  await page.getByRole("link", { name: /Dia 2/i }).click();

  await expect(page).toHaveURL(/dia=2026-08-23/);
  await expect(page.getByRole("heading", { name: "Mapa do Dia 2" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: `Atividade 1: ${placeName}. Abrir detalhes.` }),
  ).toBeVisible();
  await expect(page.getByText("Hospedagem sem coordenadas disponíveis.")).toBeVisible();
  await expect(
    page
      .getByRole("list", { name: "Atividades do Dia 2" })
      .locator(`[aria-label="Etapa 1: ${placeName}"]`),
  ).toBeVisible();
  await expect(
    page.getByText(/Distâncias geodésicas em linha reta. Não representam trajeto por ruas/),
  ).toBeVisible();
  await expect(
    page.getByText(/Distância indisponível porque existe uma lacuna geográfica/),
  ).toBeVisible();
  await expect(page.getByText(/Total geodésico/)).toHaveCount(0);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
