import { expect, test } from "@playwright/test";

test("abre uma rota externa entre etapas válidas sem ocultar lacunas", async ({
  page,
}, testInfo) => {
  const tripName = `Rota externa ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Explorar lugares" }).click();

  const publishedPlaces = page.getByRole("list", { name: "Lugares publicados" });
  const firstPublishedPlace = publishedPlaces.getByRole("listitem").first();
  const secondPublishedPlace = publishedPlaces.getByRole("listitem").nth(1);
  await expect(firstPublishedPlace).toBeVisible();
  await expect(secondPublishedPlace).toBeVisible();
  const firstPlaceName = (await firstPublishedPlace.locator("strong").textContent())?.trim();
  const secondPlaceName = (await secondPublishedPlace.locator("strong").textContent())?.trim();
  expect(firstPlaceName).toBeTruthy();
  expect(secondPlaceName).toBeTruthy();

  await firstPublishedPlace.getByRole("link", { name: "Ver detalhes" }).click();
  await page.getByRole("button", { name: "Salvar lugar" }).click();
  await expect(page.getByRole("status")).toContainText("Lugar salvo");
  await page.getByRole("link", { name: "Voltar para lugares" }).click();

  const secondPublishedPlaceByName = page
    .getByRole("list", { name: "Lugares publicados" })
    .getByRole("listitem")
    .filter({ hasText: secondPlaceName! });
  await expect(secondPublishedPlaceByName).toHaveCount(1);
  await secondPublishedPlaceByName.getByRole("link", { name: "Ver detalhes" }).click();
  await page.getByRole("button", { name: "Salvar lugar" }).click();
  await expect(page.getByRole("status")).toContainText("Lugar salvo");
  await page.getByRole("link", { name: "Visão da viagem" }).click();
  await page.getByRole("link", { name: "Ver lugares salvos" }).click();

  const savedPlacesPath = new URL(page.url()).pathname;
  const addSavedPlaceToDay = async (placeName: string) => {
    await page.goto(savedPlacesPath);

    const savedPlaceCard = page.locator("ul.place-catalog-grid > li").filter({
      has: page.getByRole("heading", { name: placeName, exact: true }),
    });
    await expect(savedPlaceCard).toHaveCount(1);
    await savedPlaceCard.getByLabel("Adicionar ao dia").selectOption("2026-08-23");
    await savedPlaceCard.getByRole("button", { name: "Adicionar ao roteiro" }).click();

    await expect(page).toHaveURL(/adicionadoAoRoteiro=1$/);
    await expect(page.getByRole("status")).toContainText("Lugar adicionado ao roteiro");
  };

  await addSavedPlaceToDay(firstPlaceName!);
  await addSavedPlaceToDay(secondPlaceName!);

  await page.getByRole("link", { name: "Abrir roteiro" }).click();
  await page.getByLabel("Dia da viagem").selectOption("2026-08-23");
  await page.locator("#title").fill("Pausa manual");
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();
  await page.getByRole("link", { name: /Dia 2/i }).click();

  await expect(page).toHaveURL(/dia=2026-08-23/);
  await expect(page.getByRole("heading", { name: "Mapa do Dia 2" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: `Atividade 1: ${firstPlaceName}. Abrir detalhes.` }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: `Atividade 2: ${secondPlaceName}. Abrir detalhes.` }),
  ).toBeVisible();
  await expect(page.getByText("Hospedagem sem coordenadas disponíveis.")).toBeVisible();
  await expect(
    page.getByText(/Distâncias geodésicas em linha reta. Não representam trajeto por ruas/),
  ).toBeVisible();
  await expect(
    page.getByText(/Distância indisponível porque existe uma lacuna geográfica/),
  ).toBeVisible();
  await expect(page.getByText(/Total geodésico/)).toHaveCount(0);

  const routeLinks = page.getByRole("link", { name: /Abrir rota externa de/ });
  await expect(routeLinks).toHaveCount(1);
  const routeLink = page.getByRole("link", {
    name: `Abrir rota externa de ${firstPlaceName} para ${secondPlaceName}`,
  });
  await expect(routeLink).toHaveAttribute("target", "_blank");
  await expect(routeLink).toHaveAttribute("rel", "noopener noreferrer");

  const routeHref = await routeLink.getAttribute("href");
  expect(routeHref).toBeTruthy();
  const routeUrl = new URL(routeHref!);
  expect(routeUrl.protocol).toBe("https:");
  expect(routeUrl.hostname).toBe("www.google.com");
  expect(routeUrl.pathname).toBe("/maps/dir/");
  expect(routeUrl.searchParams.get("api")).toBe("1");
  expect(routeUrl.searchParams.get("origin")).toBeTruthy();
  expect(routeUrl.searchParams.get("destination")).toBeTruthy();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
