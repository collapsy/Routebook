import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

const uniqueOptionsHeading = /\d+ de \d+ lugar(?: único|es únicos) exibidos/;

function visibleIdentityKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .filter((token) => !["pipa", "rn", "tibau", "sul", "rio", "grande", "norte"].includes(token))
    .join(" ")
    .trim();
}

async function expectUniqueVisibleNames(options: ReturnType<Parameters<typeof test>[1]> extends never ? never : never) {
  void options;
}

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
  const expandedCatalogLink = page
    .getByRole("link", { name: "Explorar catálogo ampliado" })
    .first();
  await expect(expandedCatalogLink).toHaveAttribute("href", `/viagens/${trip.id}/lugares`);
  const expandedCatalogHref = await expandedCatalogLink.getAttribute("href");
  expect(expandedCatalogHref).toBeTruthy();
  await page.goto(expandedCatalogHref!);
  await expect(page).toHaveURL(`/viagens/${trip.id}/lugares`, { timeout: 20_000 });
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

  const visibleNames = await options.locator(":scope > li > strong").allInnerTexts();
  const visibleKeys = visibleNames.map(visibleIdentityKey);
  expect(new Set(visibleKeys).size).toBe(visibleKeys.length);

  await expect(
    page.getByRole("img", {
      name: "Vista da Praia do Amor em Pipa, cercada por falésias e vegetação costeira.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Vista da região central da Praia de Pipa observada a partir da encosta próxima à Praia do Amor.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Vista do Santuário Ecológico de Pipa, com vegetação e litoral da Praia de Pipa.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Vista elevada da Praia de Cacimbinhas a partir das formações rochosas de Tibau do Sul.",
    }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "Ocultar atualização externa" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares?descoberta=ocultar`,
  );
  await expect(page.getByRole("heading", { name: uniqueOptionsHeading })).toBeVisible();
  await expect(page.getByText("Um catálogo, identidades únicas")).toBeVisible();
  await expect(enrichedPlaces.first()).toContainText("Curado + atualizado");
  await expect(enrichedPlaces.first()).toContainText("RouteBook");
  await expect(enrichedPlaces.first()).toContainText("Overture");

  const mapLegend = page.getByRole("list", { name: "Legenda do mapa" });
  const mapLocations = page.getByRole("list", { name: "Locais exibidos no mapa" });
  const visibleOptionTotal = await options.getByRole("listitem").count();
  expect(await mapLocations.getByRole("listitem").count()).toBe(visibleOptionTotal + 1);
  const discoveryMap = page.locator('[data-routebook-map="true"]');
  await expect(discoveryMap).toHaveAttribute(
    "data-map-point-count",
    String(visibleOptionTotal + 1),
  );
  await expect(discoveryMap).toHaveAttribute("data-map-published-count", "30");
  await expect(discoveryMap).toHaveAttribute("data-map-external-count", String(externalTotal));
  await expect(discoveryMap).toHaveAttribute("data-map-density", "dense");
  if (externalTotal > 0) {
    await expect(mapLegend).toContainText("Descoberta externa");
    await expect(
      mapLegend.getByRole("listitem").filter({ hasText: "Descoberta externa" }),
    ).toContainText(String(externalTotal));
  }
  await expect(page.getByLabel("Resumo do mapa")).toContainText(
    `${visibleOptionTotal + 1} pontos representados`,
  );

  const expandDiscoveryLink = page.getByRole("link", {
    name: /Mostrar todos os \d+ lugares descobertos/,
  });
  if ((await expandDiscoveryLink.count()) > 0) {
    await expect(expandDiscoveryLink).toHaveAttribute("href", /descoberta=todas/);
    const expandDiscoveryHref = await expandDiscoveryLink.getAttribute("href");
    expect(expandDiscoveryHref).toContain("descoberta=todas");
    await page.goto(expandDiscoveryHref!);
    await expect(page).toHaveURL(/descoberta=todas/);
    const expandedExternalTotal = await externalPlaces.count();
    expect(expandedExternalTotal).toBeGreaterThan(externalTotal);
    const expandedVisibleTotal = await options.getByRole("listitem").count();
    await expect(discoveryMap).toHaveAttribute(
      "data-map-point-count",
      String(expandedVisibleTotal + 1),
    );
    await expect(discoveryMap).toHaveAttribute(
      "data-map-external-count",
      String(expandedExternalTotal),
    );
    const expandedNames = await options.locator(":scope > li > strong").allInnerTexts();
    const expandedKeys = expandedNames.map(visibleIdentityKey);
    expect(new Set(expandedKeys).size).toBe(expandedKeys.length);

    const collapseDiscoveryLink = page.getByRole("link", {
      name: "Mostrar primeiras 60 descobertas externas",
    });
    await expect(collapseDiscoveryLink).toBeVisible();
    const collapseDiscoveryHref = await collapseDiscoveryLink.getAttribute("href");
    expect(collapseDiscoveryHref).toBe(`/viagens/${trip.id}/lugares`);
    await page.goto(collapseDiscoveryHref!);
    await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares$`));
  }

  const praiaDoAmorCard = canonicalPlaces.filter({
    has: page.locator("strong").filter({ hasText: /^Praia do Amor$/ }),
  });
  await expect(praiaDoAmorCard).toHaveCount(1);
  await expect(praiaDoAmorCard.getByRole("link", { name: "Ver mapa e fotos" })).toHaveAttribute(
    "href",
    /google\.com\/maps\/search/,
  );
  await expect(praiaDoAmorCard.getByRole("link", { name: "Calcular rota real" })).toHaveAttribute(
    "href",
    /google\.com\/maps\/dir/,
  );

  const enrichedCard = enrichedPlaces.first();
  const enrichedName = (await enrichedCard.locator(":scope > strong").innerText()).trim();
  const enrichedRouteHref = await enrichedCard
    .getByRole("link", { name: "Calcular rota real" })
    .getAttribute("href");
  expect(enrichedRouteHref).toBeTruthy();
  expect(new URL(enrichedRouteHref!).searchParams.get("destination")).toContain(enrichedName);
  await expect(enrichedCard.getByRole("link", { name: "Ver detalhes" })).toBeVisible();
  await expect(enrichedCard.getByRole("link", { name: "Adicionar ao roteiro" })).toBeVisible();

  await page.getByLabel("Nome ou termo").fill("minas");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page).toHaveURL(/busca=minas/);
  await expect(page.getByRole("heading", { name: uniqueOptionsHeading })).toBeVisible();
  await expect(page.getByRole("list", { name: "Opções de lugares" })).toContainText(
    "Praia das Minas",
  );
  await expect(page.getByRole("list", { name: "Locais exibidos no mapa" })).toContainText(
    "Praia das Minas",
  );

  const clearSearchFiltersLink = page.getByRole("link", { name: "Limpar filtros" }).first();
  const clearSearchFiltersHref = await clearSearchFiltersLink.getAttribute("href");
  expect(clearSearchFiltersHref).toBe(`/viagens/${trip.id}/lugares`);
  await page.goto(clearSearchFiltersHref!);
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares$`));

  await page.getByLabel("Nome ou termo").fill("gastronomico");
  await page.getByLabel("Faixa de preço").selectOption("moderate");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page).toHaveURL(/busca=gastronomico.*preco=moderate/);
  await expect(page.getByRole("heading", { name: uniqueOptionsHeading })).toBeVisible();
  await expect(page.getByRole("list", { name: "Opções de lugares" })).toContainText(
    "Centro Gastronômico de Pipa",
  );
  await expect(page.getByRole("list", { name: "Locais exibidos no mapa" })).toContainText(
    "Centro Gastronômico de Pipa",
  );
  await expect(page.getByLabel("Filtros ativos")).toContainText("Busca: gastronomico");
  await expect(page.getByLabel("Filtros ativos")).toContainText("Preço: Moderado");

  const removeSearchFilter = page.getByRole("link", {
    name: /Busca: gastronomico.*Remover filtro/,
  });
  await expect(removeSearchFilter).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares?preco=moderate`,
  );
  await page.getByLabel("Nome ou termo").fill("");

  await page.getByLabel("Categoria").selectOption("beach");
  await page.getByLabel("Distância máxima").selectOption("3");
  await page.getByLabel("Faixa de preço").selectOption("free");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page.getByRole("list", { name: "Opções de lugares" })).toContainText(
    "Praia do Amor",
  );
  await expect(page.getByRole("list", { name: "Locais exibidos no mapa" })).toContainText(
    "Praia do Amor",
  );
  await expect(page.getByText(/em linha reta da hospedagem/).first()).toBeVisible();

  const clearCombinedFiltersLink = page.getByRole("link", { name: "Limpar filtros" }).first();
  const clearCombinedFiltersHref = await clearCombinedFiltersLink.getAttribute("href");
  expect(clearCombinedFiltersHref).toBe(`/viagens/${trip.id}/lugares`);
  await page.goto(clearCombinedFiltersHref!);
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares$`));
  await expect(page.getByRole("heading", { name: uniqueOptionsHeading })).toBeVisible();

  await page.goto(`/viagens/${trip.id}/lugares?descoberta=ocultar`);
  await expect(page.getByRole("heading", { name: "30 lugares curados" })).toBeVisible();
  await expect(
    page
      .getByRole("list", { name: "Opções de lugares" })
      .locator('[data-place-source="published"]'),
  ).toHaveCount(30);
  await expect(
    page.getByRole("list", { name: "Opções de lugares" }).locator('[data-place-source="external"]'),
  ).toHaveCount(0);
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
