import { expect, test } from "@playwright/test";
import { DrizzleItineraryRepository, getDatabase, places } from "@routebook/database";
import { createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test.setTimeout(180_000);

test("separa Joinville e Itapema na mesma viagem e planeja um lugar no dia da visita", async ({
  page,
}) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Joinville e Itapema ${test.info().project.name} ${Date.now()}`,
    destination: {
      name: "Joinville, SC",
      type: "city",
      countryCode: "BR",
      latitude: -26.3044,
      longitude: -48.8464,
      timeZone: "America/Sao_Paulo",
    },
    startDate: "2026-11-13",
    endDate: "2026-11-16",
    accommodationName: "Base em Joinville",
    accommodationAddress: "Centro, Joinville — SC",
    accommodationLatitude: -26.3044,
    accommodationLongitude: -48.8464,
  });
  await new DrizzleItineraryRepository().save(
    createItinerary({ tripId: trip.id, period: trip.period }),
  );

  const joinvillePlace = `Passeio Joinville ${crypto.randomUUID().slice(0, 8)}`;
  const itapemaPlace = `Praia Itapema ${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date();
  await getDatabase()
    .insert(places)
    .values([
      {
        id: crypto.randomUUID(),
        destinationId: "joinville-sc-br",
        slug: `joinville-stage-e2e-${crypto.randomUUID()}`,
        name: joinvillePlace,
        summary: "Passeio publicado em Joinville para validar o contexto da viagem.",
        category: "attraction",
        latitude: -26.3044,
        longitude: -48.8464,
        addressLabel: "Joinville, SC",
        publicationStatus: "published",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        destinationId: "itapema-sc-br",
        slug: `itapema-stage-e2e-${crypto.randomUUID()}`,
        name: itapemaPlace,
        summary: "Praia publicada em Itapema para validar o contexto da visita.",
        category: "beach",
        latitude: -27.0905,
        longitude: -48.6112,
        addressLabel: "Itapema, SC",
        publicationStatus: "published",
        createdAt: now,
        updatedAt: now,
      },
    ]);

  await page.goto(`/viagens/${trip.id}/etapas`);
  await expect(
    page.getByRole("heading", { name: "Planeje visitas a outros lugares" }),
  ).toBeVisible();
  await page.getByRole("combobox", { name: "Destino da visita" }).fill("Itapema");
  await page.getByRole("option", { name: /Itapema.*SC, Brasil/ }).click();
  await page.getByLabel("Primeiro dia da visita").fill("2026-11-14");
  await page.getByLabel("Último dia da visita").fill("2026-11-14");
  await page.getByRole("button", { name: "Adicionar destino à viagem" }).click();
  await expect(page.getByText("Etapa adicionada à viagem.")).toBeVisible();
  const stageLink = page.getByRole("link", { name: "Explorar lugares em Itapema, SC" });
  await expect(stageLink).toBeVisible();
  const stageHref = await stageLink.getAttribute("href");
  expect(stageHref).toMatch(/etapa=/);

  await page.goto(`/viagens/${trip.id}/roteiro?dia=2026-11-14`);
  await expect(page.getByText(/Destino deste Dia: Itapema, SC/)).toBeVisible();

  await page.goto(
    `/viagens/${trip.id}/lugares?descoberta=ocultar&busca=${encodeURIComponent(joinvillePlace)}`,
  );
  await expect(page.getByRole("heading", { name: "Lugares em Joinville, SC" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Opções de lugares" })).toContainText(joinvillePlace);
  await expect(page.getByRole("list", { name: "Opções de lugares" })).not.toContainText(
    itapemaPlace,
  );
  await expect(page.locator('[data-routebook-map="true"]')).toHaveAttribute(
    "data-map-point-count",
    "2",
  );

  await page
    .getByRole("navigation", { name: "Destinos para explorar" })
    .getByRole("link", { name: "Itapema, SC" })
    .click();
  await expect(page.getByRole("heading", { name: "Lugares em Itapema, SC" })).toBeVisible();
  await page.getByLabel("Nome ou termo").fill(itapemaPlace);
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.getByRole("list", { name: "Opções de lugares" })).toContainText(itapemaPlace);
  await expect(page.getByRole("list", { name: "Opções de lugares" })).not.toContainText(
    joinvillePlace,
  );
  await expect(page.locator('[data-routebook-map="true"]')).toHaveAttribute(
    "data-map-point-count",
    "1",
  );
  await page
    .getByRole("list", { name: "Opções de lugares" })
    .getByRole("button", { name: "Quero ir" })
    .click();
  await expect(
    page.getByRole("list", { name: "Opções de lugares" }).getByRole("button", { name: "Quero ir" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto(`/viagens/${trip.id}/lugares-salvos`);
  await expect(page.getByRole("heading", { name: "Minha seleção" })).toBeVisible();
  await expect(page.locator(".place-card").filter({ hasText: itapemaPlace })).toBeVisible();
  await page.goto(`${stageHref}&descoberta=ocultar&busca=${encodeURIComponent(itapemaPlace)}`);
  await page
    .getByRole("list", { name: "Opções de lugares" })
    .getByRole("link", { name: "Ver detalhes" })
    .click();
  await expect(page.getByRole("heading", { name: itapemaPlace })).toBeVisible();
  await expect(page.getByLabel("Adicionar ao dia").locator("option")).toHaveCount(1);
  await expect(page.getByLabel("Adicionar ao dia")).toHaveValue("2026-11-14");
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();
  await expect(page.getByText(/foi adicionado ao Dia 2/)).toBeVisible();
  await page.goto(`/viagens/${trip.id}/roteiro?dia=2026-11-14`);
  await expect(page.locator(".itinerary-day-card").getByText(itapemaPlace)).toBeVisible();

  await page.goto(`/viagens/${trip.id}/etapas`);
  await page.getByRole("link", { name: "Adicionar hospedagem à etapa" }).click();
  await page.getByLabel("Nome da hospedagem").fill("Pousada em Itapema");
  await page.getByLabel("Endereço").fill("Centro, Itapema — SC");
  await page.getByText("Opções avançadas de localização").click();
  await page.getByLabel("Latitude").fill("-27.0905");
  await page.getByLabel("Longitude").fill("-48.6112");
  await page.getByRole("button", { name: "Salvar hospedagem" }).click();
  await expect(page.getByText(/Hospedagem da etapa salva/)).toBeVisible();
  await page.goto(`/viagens/${trip.id}/etapas`);
  await expect(page.getByText("Hospedagem principal: Base em Joinville")).toBeVisible();
  await expect(page.getByText("Hospedagem desta etapa: Pousada em Itapema")).toBeVisible();

  await page.goto(`${stageHref}&descoberta=ocultar&busca=${encodeURIComponent(itapemaPlace)}`);
  await expect(page.getByText(/hospedagem desta etapa/).first()).toBeVisible();
  await expect(page.locator('[data-routebook-map="true"]')).toHaveAttribute(
    "data-map-point-count",
    "2",
  );
  await page.goto(`/viagens/${trip.id}/etapas`);
  await page.getByRole("link", { name: "Editar hospedagem da etapa" }).click();
  await page.getByLabel("Nome da hospedagem").fill("");
  await page.getByLabel("Endereço").fill("");
  await page.getByRole("button", { name: "Salvar hospedagem" }).click();
  await page.goto(`/viagens/${trip.id}/etapas`);
  await expect(page.getByText("Hospedagem principal: Base em Joinville")).toBeVisible();
  await expect(page.getByText(/Hospedagem desta etapa: Não informada/)).toBeVisible();
  await page.goto(`${stageHref}&descoberta=ocultar&busca=${encodeURIComponent(itapemaPlace)}`);
  await expect(page.locator('[data-routebook-map="true"]')).toHaveAttribute(
    "data-map-point-count",
    "1",
  );
});

test("valida São Paulo sem seed e preserva Discovery, Minha seleção, Roteiro, mapa e Guia", async ({
  page,
}) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Anywhere São Paulo ${test.info().project.name} ${Date.now()}`,
    destination: {
      name: "São Paulo, SP",
      type: "city",
      countryCode: "BR",
      latitude: -23.5505,
      longitude: -46.6333,
      timeZone: "America/Sao_Paulo",
    },
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    accommodationName: "Hospedagem na Avenida Paulista",
    accommodationAddress: "Avenida Paulista, São Paulo — SP",
    accommodationLatitude: -23.5615,
    accommodationLongitude: -46.6559,
  });
  await new DrizzleItineraryRepository().save(
    createItinerary({ tripId: trip.id, period: trip.period }),
  );

  await page.goto(`/viagens/${trip.id}`);
  await expect(page.getByText("São Paulo, SP", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("definition").filter({ hasText: "Hospedagem na Avenida Paulista" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Hoje", exact: true })).toBeVisible();
  await expect(page.getByText(/Hoje em São Paulo, SP/)).toBeVisible();

  await page.goto(`/viagens/${trip.id}/lugares`);
  await expect(page.getByRole("heading", { name: /Lugares em São Paulo/ })).toBeVisible({
    timeout: 30_000,
  });
  const options = page.getByRole("list", { name: "Opções de lugares" });
  const published = options.locator('[data-place-source="published"]');
  const external = options.locator('[data-place-source="external"]');
  await expect(published).toHaveCount(0);
  await expect(external.first()).toBeVisible({ timeout: 45_000 });
  expect(await external.count()).toBeGreaterThan(0);
  await expect(options).toContainText(/Gastronomia|Vida noturna/);
  await expect(external.first()).toContainText(/em linha reta da hospedagem/);
  const externalMedia = external.first().locator("[data-external-place-image-state]");
  await expect(externalMedia).toBeVisible();
  await expect(externalMedia).toHaveAttribute(
    "data-external-place-image-state",
    /^(idle|loading|ready|fallback)$/,
  );

  const promotable = options
    .locator('[data-place-source="external"]:not([data-place-category="unmapped"])')
    .first();
  await expect(promotable).toBeVisible();
  await promotable.evaluate((element) => element.scrollIntoView({ block: "center" }));
  const wantButton = promotable.getByRole("button", { name: "Quero ir" });
  await wantButton.scrollIntoViewIfNeeded();
  const discoveryUrl = page.url();
  const discoveryScrollY = await page.evaluate(() => window.scrollY);
  await wantButton.click();
  await expect(
    page.getByText("Preferência atualizada. O lugar entrou em Minha seleção.", { exact: true }),
  ).toBeVisible({ timeout: 45_000 });
  expect(page.url()).toBe(discoveryUrl);
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - discoveryScrollY))
    .toBeLessThanOrEqual(2);

  await page.goto(`/viagens/${trip.id}/lugares-salvos`);
  await expect(page.getByRole("heading", { name: "Minha seleção", exact: true })).toBeVisible();
  const savedCard = page.locator(".place-card").first();
  await expect(savedCard).toBeVisible();
  const selectedName = (await savedCard.getByRole("heading").innerText()).trim();
  expect(selectedName).not.toBe("");
  await expect(page.locator('[data-routebook-map="true"]')).toHaveAttribute(
    "data-map-point-count",
    "2",
  );

  await savedCard.getByLabel("Adicionar ao dia").selectOption("2026-11-11");
  await savedCard.getByRole("button", { name: "Adicionar ao roteiro" }).click();
  await expect(page.getByText(/Lugar adicionado ao roteiro/)).toBeVisible();
  await expect(savedCard).toContainText("Roteiro: Planejado");

  await page.goto(`/viagens/${trip.id}/roteiro?dia=2026-11-11`);
  await expect(
    page.locator(".itinerary-day-card").getByText(selectedName, { exact: true }),
  ).toBeVisible();

  await page.goto(`/viagens/${trip.id}/guia?dia=2026-11-11`);
  await expect(page.getByRole("heading", { name: /Dia 2/ })).toBeVisible();
  await expect(page.getByText(selectedName, { exact: true })).toBeVisible();

  await page.goto(`/viagens/${trip.id}/guia/dias?dia=2026-11-11`);
  await expect(
    page.getByRole("heading", { name: "Guia da viagem em São Paulo, SP" }),
  ).toBeVisible();
  await expect(page.getByText("1 atividade confirmada", { exact: true })).toBeVisible();
});
