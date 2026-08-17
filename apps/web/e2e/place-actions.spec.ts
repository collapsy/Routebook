import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("salva no catálogo preservando filtros e abre o compositor do Lugar", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Ações de Lugar ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(
    `/viagens/${trip.id}/lugares?descoberta=ocultar&busca=Praia%20do%20Amor&categoria=beach`,
  );

  const card = page.getByRole("listitem").filter({ hasText: "Praia do Amor" });
  await expect(card.getByRole("button", { name: "Salvar lugar" })).toBeVisible();
  await expect(card.getByRole("link", { name: "Adicionar ao roteiro" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares/praia-do-amor#adicionar-ao-roteiro`,
  );

  await card.getByRole("button", { name: "Salvar lugar" }).click();

  await expect(page).toHaveURL(/descoberta=ocultar/);
  await expect(page).toHaveURL(/busca=Praia(%20|\+)do(%20|\+)Amor/);
  await expect(page).toHaveURL(/categoria=beach/);
  await expect(card.getByRole("button", { name: "Remover dos salvos" })).toBeVisible();

  await card.getByRole("link", { name: "Adicionar ao roteiro" }).click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares/praia-do-amor#?`));
  await expect(page.getByRole("heading", { name: "Adicionar ao roteiro" })).toBeVisible();
});

test("adiciona Place publicado ao Roteiro sem salvar automaticamente", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Roteiro direto ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
  });

  await page.goto(`/viagens/${trip.id}/lugares/chapadao-de-pipa#adicionar-ao-roteiro`);

  await expect(page.getByRole("heading", { name: "Salvar como opção" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Salvar lugar" })).toBeVisible();

  await page.getByLabel("Adicionar ao dia").selectOption("2026-08-23");
  await page.getByLabel("Horário opcional").fill("16:30");
  await page.getByLabel("Duração opcional").fill("60");
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();

  await expect(page.getByText(/Chapadão de Pipa foi adicionado ao Dia 2/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Salvar lugar" })).toBeVisible();
  const itineraryLink = page.getByRole("link", { name: "Ver Dia no roteiro" });
  await expect(itineraryLink).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/roteiro?dia=2026-08-23#dia-em-foco`,
  );

  await itineraryLink.click();
  await expect(
    page.getByRole("heading", { name: "Dia 2 — domingo, 23 de agosto", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Tarde").getByText("Chapadão de Pipa", { exact: true }),
  ).toBeVisible();
});
