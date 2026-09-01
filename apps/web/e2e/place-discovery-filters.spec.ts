import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

const uniqueOptionsHeading = /\d+ de \d+ lugar(?: único|es únicos) exibidos/;

test("pesquisa e combina filtros mantendo identidades únicas, lista e mapa sincronizados", async ({
  page,
}) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Descoberta ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}`);
  const catalogLink = page.getByRole("link", { name: "Explorar catálogo ampliado" }).first();
  await expect(catalogLink).toHaveAttribute("href", `/viagens/${trip.id}/lugares`);
  await page.goto((await catalogLink.getAttribute("href"))!);
  await expect(page.getByRole("heading", { name: /Lugares em Pipa/ })).toBeVisible({
    timeout: 20_000,
  });

  const options = page.getByRole("list", { name: "Opções de lugares" });
  const canonicalPlaces = options.locator('[data-place-source="published"]');
  const externalPlaces = options.locator('[data-place-source="external"]');
  const enrichedPlaces = options.locator('[data-place-state="enriched"]');

  await expect(canonicalPlaces).toHaveCount(30);
  const externalTotal = await externalPlaces.count();
  expect(externalTotal).toBeLessThanOrEqual(60);
  expect(await options.getByRole("listitem").count()).toBe(30 + externalTotal);
  expect(await enrichedPlaces.count()).toBeGreaterThan(0);

  await expect(page.getByRole("heading", { name: uniqueOptionsHeading })).toBeVisible();
  await expect(page.getByText("Um catálogo, identidades únicas")).toBeVisible();
  await expect(enrichedPlaces.first()).toContainText("Curado + atualizado");
  await expect(enrichedPlaces.first()).toContainText("RouteBook");
  await expect(enrichedPlaces.first()).toContainText("Overture");
  await expect(page.getByRole("link", { name: "Ocultar atualização externa" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares?descoberta=ocultar`,
  );

  const visibleOptionTotal = await options.getByRole("listitem").count();
  const mapLocations = page.getByRole("list", { name: "Locais exibidos no mapa" });
  expect(await mapLocations.getByRole("listitem").count()).toBe(visibleOptionTotal + 1);
  const discoveryMap = page.locator('[data-routebook-map="true"]');
  await expect(discoveryMap).toHaveAttribute(
    "data-map-point-count",
    String(visibleOptionTotal + 1),
  );
  await expect(discoveryMap).toHaveAttribute("data-map-published-count", "30");
  await expect(discoveryMap).toHaveAttribute("data-map-external-count", String(externalTotal));

  const enrichedCard = enrichedPlaces.first();
  const enrichedName = (
    await enrichedCard.locator(":scope > strong:not([class])").innerText()
  ).trim();
  const enrichedRouteHref = await enrichedCard
    .getByRole("link", { name: "Calcular rota real" })
    .getAttribute("href");
  expect(enrichedRouteHref).toBeTruthy();
  expect(
    new URL(enrichedRouteHref!).searchParams.get("destination")?.toLocaleLowerCase("pt-BR"),
  ).toContain(enrichedName.toLocaleLowerCase("pt-BR"));
  await expect(enrichedCard.getByRole("link", { name: "Ver detalhes" })).toBeVisible();
  await expect(enrichedCard.getByRole("link", { name: "Adicionar ao roteiro" })).toBeVisible();

  const praiaDoAmorCard = canonicalPlaces.filter({
    has: page.locator("strong").filter({ hasText: /^Praia do Amor$/ }),
  });
  const praiaDoAmorExternalCard = externalPlaces.filter({
    has: page.locator("strong:not([class])").filter({ hasText: /^Praia do Amor$/ }),
  });
  await expect(praiaDoAmorCard).toHaveCount(1);
  await expect(praiaDoAmorExternalCard).toHaveCount(0);
  await expect(praiaDoAmorCard.getByRole("link", { name: "Ver mapa e fotos" })).toHaveAttribute(
    "href",
    /google\.com\/maps\/search/,
  );
  await expect(praiaDoAmorCard.getByRole("link", { name: "Calcular rota real" })).toHaveAttribute(
    "href",
    /google\.com\/maps\/dir/,
  );

  const expandDiscoveryLink = page.getByRole("link", {
    name: /Mostrar todos os \d+ lugares descobertos/,
  });
  if ((await expandDiscoveryLink.count()) > 0) {
    await expect(expandDiscoveryLink).toHaveAttribute("href", /descoberta=todas/);
    await page.goto((await expandDiscoveryLink.getAttribute("href"))!);
    const expandedExternalTotal = await externalPlaces.count();
    expect(expandedExternalTotal).toBeGreaterThan(externalTotal);
    await expect(praiaDoAmorExternalCard).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Mostrar primeiras 60 descobertas externas" }),
    ).toBeVisible();
  }

  await page.route("**/api/place-image-preview**", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (
      requestUrl.pathname === "/api/place-image-preview" &&
      requestUrl.searchParams.get("name") === "Praia das Minas"
    ) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Nenhuma imagem externa segura no cenário E2E." }),
      });
      return;
    }
    await route.fallback();
  });

  await page.goto(`/viagens/${trip.id}/lugares`);
  await page.getByLabel("Nome ou termo").fill("minas");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page).toHaveURL(/busca=minas/);
  await expect(page.getByRole("heading", { name: uniqueOptionsHeading })).toBeVisible();
  await expect(options).toContainText("Praia das Minas");
  await expect(mapLocations).toContainText("Praia das Minas");
  const praiaDasMinasCard = page
    .locator('[data-place-source="published"]')
    .filter({ hasText: "Praia das Minas" })
    .first();
  const praiaDasMinasIllustration = praiaDasMinasCard.locator(
    '[data-category-illustration="beach"]',
  );
  await expect(praiaDasMinasIllustration.first()).toBeVisible();
  await expect(praiaDasMinasIllustration.first()).toContainText(/Ilustração de categoria/);

  await page.goto(`/viagens/${trip.id}/lugares`);
  await page.getByLabel("Nome ou termo").fill("gastronomico");
  await page.getByLabel("Faixa de preço").selectOption("moderate");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page).toHaveURL(/busca=gastronomico.*preco=moderate/);
  await expect(options).toContainText("Centro Gastronômico de Pipa");
  await expect(mapLocations).toContainText("Centro Gastronômico de Pipa");
  await expect(page.getByLabel("Filtros ativos")).toContainText("Busca: gastronomico");
  await expect(page.getByLabel("Filtros ativos")).toContainText("Preço: Moderado");

  await page.goto(`/viagens/${trip.id}/lugares`);
  await page.getByLabel("Categoria").selectOption("beach");
  await page.getByLabel("Distância máxima").selectOption("3");
  await page.getByLabel("Faixa de preço").selectOption("free");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(options).toContainText("Praia do Amor");
  await expect(mapLocations).toContainText("Praia do Amor");
  await expect(page.getByText(/em linha reta da hospedagem/).first()).toBeVisible();

  await page.goto(`/viagens/${trip.id}/lugares?descoberta=ocultar`);
  const rankingNav = page.getByRole("navigation", { name: "Ordenação dos lugares" });
  await expect(rankingNav.getByRole("link", { name: "Mais próximos" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(rankingNav.getByText("Recomendados")).toHaveAttribute("aria-disabled", "true");
  await expect(rankingNav.getByText("Melhor avaliados")).toHaveAttribute("aria-disabled", "true");
  await expect(rankingNav.getByText("Mais populares")).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator('[data-place-ranking-quality="true"]')).toHaveCount(0);
  await expect(page.getByText(/^Top /)).toHaveCount(0);

  await page.goto(`/viagens/${trip.id}/lugares?descoberta=ocultar&ordem=recommended`);
  await expect(page.locator('[data-place-ranking-order="distance"]')).toBeVisible();

  await page.goto(`/viagens/${trip.id}/lugares?descoberta=ocultar`);
  await expect(page.getByRole("heading", { name: "30 lugares curados" })).toBeVisible();
  await expect(options.locator('[data-place-source="published"]')).toHaveCount(30);
  await expect(options.locator('[data-place-source="external"]')).toHaveCount(0);
  await expect(
    page.getByText("Lista e mapa exibem o mesmo conjunto curado e filtrado."),
  ).toBeVisible();
});

test("mantém marcadores ancorados ao viewport durante pan e zoom", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Mapa ancorado ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}/lugares`);

  const map = page.locator('[data-routebook-map="true"]');
  await expect(map).toHaveAttribute("data-map-state", "ready", { timeout: 20_000 });
  await expect(map.getByRole("button", { name: "Aproximar mapa" })).toBeVisible();
  await expect(map.getByRole("button", { name: "Afastar mapa" })).toBeVisible();

  const marker = map.getByRole("link", {
    name: "Lugar publicado: Praia do Amor. Abrir detalhes.",
  });
  await expect(marker).toBeVisible();

  const centerBeforePan = await map.getAttribute("data-map-center-lng");
  const markerBeforePan = await marker.boundingBox();
  if (!markerBeforePan || centerBeforePan === null) {
    throw new Error("Mapa ou marker não disponibilizou geometria para a regressão de pan.");
  }

  await map.press("ArrowRight");
  await expect.poll(() => map.getAttribute("data-map-center-lng")).not.toBe(centerBeforePan);

  const markerAfterPan = await marker.boundingBox();
  if (!markerAfterPan) throw new Error("Marker desapareceu após movimentar o mapa.");
  expect(
    Math.hypot(markerAfterPan.x - markerBeforePan.x, markerAfterPan.y - markerBeforePan.y),
  ).toBeGreaterThan(20);

  const zoomBefore = Number(await map.getAttribute("data-map-zoom"));
  const markerBeforeZoom = await marker.boundingBox();
  if (!markerBeforeZoom || !Number.isFinite(zoomBefore)) {
    throw new Error("Mapa não disponibilizou estado de zoom para a regressão.");
  }

  await map.getByRole("button", { name: "Aproximar mapa" }).click();
  await expect
    .poll(async () => Number(await map.getAttribute("data-map-zoom")))
    .toBe(zoomBefore + 1);

  const markerAfterZoom = await marker.boundingBox();
  if (!markerAfterZoom) throw new Error("Marker desapareceu após aplicar zoom.");
  expect(
    Math.hypot(markerAfterZoom.x - markerBeforeZoom.x, markerAfterZoom.y - markerBeforeZoom.y),
  ).toBeGreaterThan(5);
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
