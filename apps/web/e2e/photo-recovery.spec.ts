import { expect, test } from "@playwright/test";
import { getDatabase, places } from "@routebook/database";
import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("recupera falha de foto e mantém resolução no detalhe e Minha seleção", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Fotos ${crypto.randomUUID()}`,
    startDate: "2026-11-13",
    endDate: "2026-11-16",
  });
  const name = `Foto teste ${crypto.randomUUID()}`;
  await getDatabase()
    .insert(places)
    .values({
      id: crypto.randomUUID(),
      destinationId: "pipa-rn-br",
      slug: `photo-${crypto.randomUUID()}`,
      name,
      summary: "Fixture de fotografia",
      category: "nature",
      latitude: -6.2302,
      longitude: -35.0503,
      addressLabel: "Pipa",
      publicationStatus: "published",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  let requests = 0;
  await page.route("**/api/place-image-preview**", (route) => {
    if (new URL(route.request().url()).pathname === "/api/place-image-preview/file") {
      return route.fulfill({
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          "base64",
        ),
      });
    }
    requests++;
    if (requests === 1) return route.fulfill({ status: 503, json: { error: "temporary" } });
    return route.fulfill({
      json: {
        previewUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Fixture.jpg/640px-Fixture.jpg",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Fixture.jpg",
        sourceName: "Wikimedia Commons",
        license: "CC0",
        attribution: "Fixture",
        altText: "Foto de teste recuperada",
        matchEvidence: "Fixture de identidade segura",
      },
    });
  });
  await page.goto(
    `/viagens/${trip.id}/lugares?descoberta=ocultar&busca=${encodeURIComponent(name)}`,
  );
  const list = page.getByRole("list", { name: "Opções de lugares" });
  await list.scrollIntoViewIfNeeded();
  await expect(list.getByText("Não foi possível carregar a foto agora.")).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("photo-error.png") });
  await list.getByRole("button", { name: "Tentar carregar foto novamente" }).click();
  await expect(list.locator('[data-external-place-image-state="ready"]')).toBeVisible();
  expect(requests).toBe(2);
  await list.getByRole("button", { name: "Quero ir", exact: true }).click();
  await expect(list.getByRole("button", { name: "Quero ir", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await list.getByRole("link", { name: "Ver detalhes", exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page.locator("[data-external-place-image-state]").scrollIntoViewIfNeeded();
  await expect(page.locator('[data-external-place-image-state="ready"]')).toBeVisible();
  await page
    .getByRole("navigation", { name: "Navegação da viagem" })
    .getByRole("link", { name: "Minha seleção", exact: true })
    .click();
  const card = page.locator(".place-card").filter({ hasText: name });
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator('[data-external-place-image-state="ready"]')).toBeVisible();
  await expect(card.getByRole("img", { name: "Foto de teste recuperada" })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("photo-recovered.png") });
});
