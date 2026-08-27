import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

function googleMapsDestination(href: string | null): string | null {
  expect(href).toBeTruthy();
  return new URL(href!).searchParams.get("destination");
}

test("usa nome e endereço nos destinos individuais do catálogo, detalhe e Guia", async ({
  page,
}) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Rotas confiáveis ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}/lugares?descoberta=ocultar`);

  const publishedPlaces = page
    .getByRole("list", { name: "Opções de lugares" })
    .locator('[data-place-source="published"]');
  const praiaDoAmorCard = publishedPlaces.filter({
    has: page.locator("strong").filter({ hasText: /^Praia do Amor$/ }),
  });
  await expect(praiaDoAmorCard).toHaveCount(1);

  const cardRouteHref = await praiaDoAmorCard
    .getByRole("link", { name: "Calcular rota real" })
    .getAttribute("href");
  expect(googleMapsDestination(cardRouteHref)).toBe("Praia do Amor, Pipa, Tibau do Sul — RN");

  await page.goto(`/viagens/${trip.id}/lugares/praia-do-amor`);
  const walkingHref = await page.getByRole("link", { name: "Rota real a pé" }).getAttribute("href");
  const drivingHref = await page
    .getByRole("link", { name: "Rota real de carro" })
    .getAttribute("href");
  expect(googleMapsDestination(walkingHref)).toBe("Praia do Amor, Pipa, Tibau do Sul — RN");
  expect(googleMapsDestination(drivingHref)).toBe("Praia do Amor, Pipa, Tibau do Sul — RN");

  await page.goto(`/viagens/${trip.id}/guia`);
  const chapadaoCard = page.locator("li").filter({
    has: page.locator("h3").filter({ hasText: /^Chapadão de Pipa$/ }),
  });
  await expect(chapadaoCard).toHaveCount(1);
  const chapadaoRoute = chapadaoCard.locator("a").filter({ hasText: "Rota e tempo no Maps" });
  await expect(chapadaoRoute).toHaveCount(1);
  const guideHref = await chapadaoRoute.getAttribute("href");
  expect(googleMapsDestination(guideHref)).toContain("Chapadão de Pipa");
});
