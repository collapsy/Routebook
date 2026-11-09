import { expect, test } from "@playwright/test";
import { DrizzleTripStageRepository, getDatabase, places } from "@routebook/database";
import { createTripStage } from "@routebook/trip-management";
import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("mostra espera ao trocar destino e preserva exploração nos retornos", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Navegação ${crypto.randomUUID()}`,
    startDate: "2026-11-13",
    endDate: "2026-11-16",
  });
  const stage = createTripStage(trip, {
    destination: {
      name: "Destino de teste",
      type: "city",
      countryCode: "BR",
      latitude: -6.27,
      longitude: -35.04,
      timeZone: trip.period.timeZone,
    },
    startDate: "2026-11-14",
    endDate: "2026-11-15",
  });
  await new DrizzleTripStageRepository().add(stage, {
    provider: "fixture",
    externalReference: stage.id,
    sourceLicense: "test",
    collectedAt: new Date(),
    method: "test",
    confidenceLevel: "confirmed",
  });
  const name = `Lugar navegação ${crypto.randomUUID()}`;
  await getDatabase()
    .insert(places)
    .values({
      id: crypto.randomUUID(),
      destinationId: "pipa-rn-br",
      slug: `navigation-${crypto.randomUUID()}`,
      name,
      summary: "Fixture de navegação",
      category: "nature",
      latitude: -6.27,
      longitude: -35.04,
      addressLabel: "Destino de teste",
      publicationStatus: "published",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  await page.route("**/api/place-image-preview?**", (route) =>
    route.fulfill({ status: 404, json: { error: "fixture-miss" } }),
  );
  await page.goto(
    `/viagens/${trip.id}/lugares?descoberta=ocultar&busca=${encodeURIComponent(name)}&categoria=nature&dia=2026-11-13`,
  );
  let release!: () => void;
  let gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**/viagens/${trip.id}/lugares?**`, async (route) => {
    if (new URL(route.request().url()).searchParams.get("etapa") === stage.id) {
      await gate;
    }
    await route.continue();
  });
  const destination = page
    .getByRole("navigation", { name: "Destinos para explorar" })
    .getByRole("link", { name: "Destino de teste", exact: true });
  try {
    await destination.click();
    await expect(
      page.getByRole("status").filter({ hasText: "Carregando lugares de Destino de teste…" }),
    ).toBeVisible();
    await page.screenshot({ path: test.info().outputPath("navigation-pending.png") });
  } finally {
    release();
  }
  await expect(page.getByRole("heading", { name: "Lugares em Destino de teste" })).toBeVisible();
  const selectedUrl = new URL(page.url());
  expect(selectedUrl.searchParams.get("busca")).toBe(name);
  expect(selectedUrl.searchParams.get("categoria")).toBe("nature");
  expect(selectedUrl.searchParams.has("dia")).toBe(false);
  await page.getByRole("link", { name: "Ver detalhes", exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page.getByRole("link", { name: "← Voltar para lugares", exact: true }).click();
  await expect(page.getByLabel("Nome ou termo")).toHaveValue(name);
  await page.screenshot({ path: test.info().outputPath("navigation-restored.png") });
  await expect(page.getByLabel("Categoria", { exact: true })).toHaveValue("nature");
  const mainNav = page.getByRole("navigation", { name: "Navegação da viagem" });
  await mainNav.getByRole("link", { name: "Minha seleção", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Minha seleção", exact: true })).toBeVisible();
  await mainNav.getByRole("link", { name: "Lugares", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Lugares em Destino de teste" })).toBeVisible();
  await expect(page.getByLabel("Nome ou termo")).toHaveValue(name);
  gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.getByLabel("Distância máxima").selectOption("5");
  try {
    await page.getByRole("button", { name: "Aplicar filtros", exact: true }).click();
    await expect(page.getByRole("button", { name: "Aplicando filtros…" })).toBeDisabled();
    await expect(
      page.getByRole("status").filter({ hasText: "Atualizando a lista de lugares…" }),
    ).toBeVisible();
  } finally {
    release();
  }
  await expect(page.getByRole("button", { name: "Aplicar filtros", exact: true })).toBeEnabled();
  await expect(page).toHaveURL(/distancia=5/);
});
