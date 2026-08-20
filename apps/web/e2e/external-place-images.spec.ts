import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

const preview = {
  previewUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/RouteBook_test.jpg/640px-RouteBook_test.jpg",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:RouteBook_test.jpg",
  sourceName: "Wikimedia Commons",
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  attribution: "Teste RouteBook",
  altText: "Fotografia licenciada do candidato externo.",
  matchEvidence: "Identidade e contexto local confirmados pelo teste.",
} as const;

test("enriquece candidato externo com foto licenciada sem substituir Overture nem a rota semântica", async ({
  page,
}) => {
  await page.route("**/api/place-image-preview/file?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "image/png",
      body: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    });
  });
  await page.route("**/api/place-image-preview?**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(preview) });
  });

  const { trip } = await createAuthenticatedE2ETrip({
    name: `Imagens externas ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}/lugares`);

  const externalCard = page.locator('[data-place-source="external"]').first();
  await expect(externalCard).toBeVisible({ timeout: 20_000 });
  await externalCard.scrollIntoViewIfNeeded();

  await expect(externalCard.locator('[data-external-place-image-state="ready"]')).toBeVisible({
    timeout: 20_000,
  });
  await expect(externalCard.getByRole("img", { name: preview.altText })).toBeVisible();
  await expect(externalCard).toContainText("Fonte: Overture");
  await expect(externalCard).toContainText("Candidato externo — ainda não publicado");
  await expect(externalCard).toContainText("Teste RouteBook");
  await expect(externalCard).toContainText("CC BY-SA 4.0");
  await expect(externalCard).toContainText("Wikimedia Commons");
  await expect(externalCard.getByRole("link", { name: "Ver fonte" })).toHaveAttribute(
    "href",
    preview.sourceUrl,
  );

  const name = (await externalCard.locator("strong").first().innerText()).trim();
  const routeHref = await externalCard
    .getByRole("link", { name: "Calcular rota real" })
    .getAttribute("href");
  expect(routeHref).toBeTruthy();
  expect(new URL(routeHref!).searchParams.get("destination")).toContain(name);
});
