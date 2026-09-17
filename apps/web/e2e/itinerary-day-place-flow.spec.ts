import { expect, test } from "@playwright/test";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("adiciona um Lugar ao Dia selecionado e retorna ao mesmo Dia", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Roteiro por Dia ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(`/viagens/${trip.id}/roteiro?dia=2026-08-23#dia-em-foco`);

  await expect(
    page.getByRole("heading", { name: "Dia 2 — domingo, 23 de agosto", exact: true }),
  ).toBeVisible();
  const addPlaceLink = page.getByRole("link", { name: "Adicionar lugar ao Dia 2" });
  await expect(addPlaceLink).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares?dia=2026-08-23`,
  );

  await addPlaceLink.click();
  await expect(page).toHaveURL(new RegExp(`/viagens/${trip.id}/lugares\\?dia=2026-08-23`));
  await expect(page.getByText("Planejando o Dia 2", { exact: true })).toBeVisible();

  await page.getByLabel("Nome ou termo").fill("Praia do Amor");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page).toHaveURL(/dia=2026-08-23/);
  await expect(page).toHaveURL(/busca=Praia(%20|\+)do(%20|\+)Amor/);

  const card = page
    .getByRole("list", { name: "Opções de lugares" })
    .locator('[data-place-source="published"]')
    .filter({ hasText: "Praia do Amor" })
    .first();
  await expect(card.getByRole("button", { name: "Adicionar ao Dia 2" })).toBeVisible();
  await expect(card.getByRole("button", { name: "Salvar para depois" })).toBeVisible();
  await expect(card.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares/praia-do-amor?dia=2026-08-23#adicionar-ao-roteiro`,
  );

  await card.getByRole("button", { name: "Adicionar ao Dia 2" }).click();

  await expect(page).toHaveURL(
    new RegExp(
      `/viagens/${trip.id}/roteiro\\?atividadeCriada=1&dia=2026-08-23#dia-em-foco$`,
    ),
  );
  await expect(page.getByRole("status")).toContainText("Atividade adicionada ao Dia 2");
  await expect(
    page.getByRole("heading", { name: "Dia 2 — domingo, 23 de agosto", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".itinerary-day-card").locator(".itinerary-activity-copy").filter({
      hasText: "Praia do Amor",
    }),
  ).toBeVisible();
});

test("Detalhes preserva o Dia de origem e mantém Salvar separado do Roteiro", async ({ page }) => {
  const { trip } = await createAuthenticatedE2ETrip({
    name: `Detalhes por Dia ${test.info().project.name} ${Date.now()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
    accommodationName: "Hospedagem central",
    accommodationAddress: "Pipa, Tibau do Sul — RN",
    accommodationLatitude: -6.2302,
    accommodationLongitude: -35.0503,
  });

  await page.goto(
    `/viagens/${trip.id}/lugares/praia-do-amor?dia=2026-08-24#adicionar-ao-roteiro`,
  );

  await expect(page.getByText("Planejando o Dia 3", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Adicionar ao dia")).toHaveValue("2026-08-24");
  await expect(page.getByRole("button", { name: "Adicionar ao Dia 3" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Salvar para depois" })).toBeVisible();
  await expect(page.getByRole("link", { name: "← Voltar para lugares" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares?dia=2026-08-24`,
  );

  await page.getByRole("button", { name: "Salvar para depois" }).click();

  await expect(page).toHaveURL(/dia=2026-08-24/);
  await expect(page.getByText(/Lugar salvo\. Ele continua fora do Roteiro/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Adicionar ao Dia 3" })).toBeVisible();
}
