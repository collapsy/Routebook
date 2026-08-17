import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("apresenta guia prático rastreável para um Place publicado", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Guia prático ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}/lugares/baia-dos-golfinhos`);

  await expect(page.getByRole("heading", { name: "Baía dos Golfinhos" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Como encaixar este lugar na viagem" }),
  ).toBeVisible();
  await expect(page.getByText(/janela de maré compatível/)).toBeVisible();
  await expect(page.getByText(/tábua de marés/)).toBeVisible();
  await expect(page.getByText(/Orientação editorial revisada em 16\/08\/2026/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Prefeitura de Tibau do Sul/ })).toHaveAttribute(
    "href",
    "https://tibaudosul.rn.gov.br/o-municipio/turismo-e-lazer/",
  );
  await expect(page.getByRole("link", { name: "Rota real a pé" })).toHaveAttribute(
    "href",
    /google\.com\/maps\/dir/,
  );
});

test("orienta confirmação atual para estabelecimento", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Guia gastronômico ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
  });

  await page.goto(`/viagens/${trip.id}/lugares/camarao-na-fazenda-pipa`);

  await expect(page.getByText(/Confirme horário, reserva, cardápio/)).toBeVisible();
  await expect(page.getByText(/Base editorial: catálogo publicado do RouteBook/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver mapa e fotos" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Rota real a pé" })).toHaveCount(0);
});
