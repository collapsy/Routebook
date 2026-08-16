import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

const integratedOptionsHeading = /\d+ opç(?:ão|ões) para explorar/;
const overtureDiscoveryCount = /\d+ descoberta(?: atualizada|s atualizadas) no Overture/;

function integratedCount(publishedCount: number): RegExp {
  const publishedLabel = publishedCount === 1 ? "lugar publicado" : "lugares publicados";
  return new RegExp(
    `${publishedCount} ${publishedLabel} no RouteBook \\+ ${overtureDiscoveryCount.source}`,
  );
}

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
  ).toHaveCount(30);
  await expect(
    page
      .getByRole("list", { name: "Lugares publicados" })
      .getByRole("img", { name: /^Imagem não disponível para / }),
  ).toHaveCount(24);
  await expect(
    page.getByRole("img", {
      name: "Vista da Praia do Amor em Pipa, cercada por falésias e vegetação costeira.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Imagem não disponível para Praia das Minas" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Ocultar descobertas atualizadas" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares?descoberta=ocultar`,
  );
  await expect(
    page.getByRole("heading", { name: "Descobertas atualizadas no Overture" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: integratedOptionsHeading })).toBeVisible();
  await expect(page.getByText(integratedCount(30))).toBeVisible();
  const praiaDoAmorCard = page
    .getByRole("list", { name: "Lugares publicados" })
    .getByRole("listitem")
    .filter({ has: page.getByText("Praia do Amor", { exact: true }) });
  await expect(praiaDoAmorCard.getByRole("link", { name: "Ver mapa e fotos" })).toHaveAttribute(
    "href",
    /google\.com\/maps\/search/,
  );
  await expect(praiaDoAmorCard.getByRole("link", { name: "Calcular rota real" })).toHaveAttribute(
    "href",
    /google\.com\/maps\/dir/,
  );

  await page.getByLabel("Nome ou termo").fill("minas");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page).toHaveURL(/busca=minas/);
  await expect(page.getByRole("heading", { name: integratedOptionsHeading })).toBeVisible();
  await expect(page.getByText(integratedCount(1))).toBeVisible();
  await expect(page.getByRole("list", { name: "Lugares publicados" })).toContainText(
    "Praia das Minas",
  );
  await expect(page.getByRole("list", { name: "Locais exibidos no mapa" })).toContainText(
    "Praia das Minas",
  );

  await page.getByRole("link", { name: "Limpar filtros" }).first().click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares$`));

  await page.getByLabel("Nome ou termo").fill("gastronomico");
  await page.getByLabel("Faixa de preço").selectOption("moderate");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page).toHaveURL(/busca=gastronomico.*preco=moderate/);
  await expect(page.getByRole("heading", { name: integratedOptionsHeading })).toBeVisible();
  await expect(page.getByText(integratedCount(1))).toBeVisible();
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
  await expect(page.getByRole("heading", { name: integratedOptionsHeading })).toBeVisible();
  await expect(page.getByText(integratedCount(30))).toBeVisible();

  await page.goto(`/viagens/${trip.id}/lugares?descoberta=ocultar`);
  await expect(page.getByRole("heading", { name: "30 lugares publicados" })).toBeVisible();
  await expect(
    page.getByText("Lista e mapa exibem o mesmo conjunto publicado e filtrado."),
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
