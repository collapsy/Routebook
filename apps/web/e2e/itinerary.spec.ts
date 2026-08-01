import { expect, test, type Page } from "@playwright/test";

import {
  DrizzleItineraryRepository,
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { createSavedPlace } from "@routebook/saved-places";
import { addActivity, createItinerary, createTrip } from "@routebook/trip-management";

async function submitAndExpectActionRedirect(
  page: Page,
  submit: () => Promise<void>,
  expectedUrl: RegExp,
) {
  const actionPathname = new URL(page.url()).pathname;
  const actionResponse = page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === "POST" && new URL(request.url()).pathname === actionPathname;
  });

  await Promise.all([actionResponse, submit()]);
  await expect(page).toHaveURL(expectedUrl);
}

test("cria e preserva uma atividade no roteiro manual", async ({ page }, testInfo) => {
  const tripName = `Roteiro ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await expect(page).toHaveURL(/\/viagens\?created=1$/);
  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();

  await expect(page.getByRole("heading", { level: 1, name: tripName })).toBeVisible();
  await expect(page.getByText("8", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("dias", { exact: true })).toBeVisible();

  await page.getByLabel("Dia da viagem").selectOption("2026-08-22");
  await page.getByLabel("Título").fill("Praia ao amanhecer");
  await page.getByLabel("Horário opcional").fill("09:30");
  await page.getByLabel("Duração opcional").fill("180");
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();

  await expect(page).toHaveURL(/atividadeCriada=1$/);
  await expect(page.getByRole("status")).toContainText("Atividade adicionada");
  await expect(page.getByText("Praia ao amanhecer")).toBeVisible();
  await expect(page.getByText("09:30")).toBeVisible();
  await expect(page.getByText("3 h", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText("Praia ao amanhecer")).toBeVisible();
  await expect(page.getByText("09:30")).toBeVisible();
});

test("remove uma atividade do roteiro e preserva a remoção", async ({ page }, testInfo) => {
  const tripName = `Remoção ${testInfo.project.name} ${Date.now()}`;
  const activityTitle = "Atividade removível";

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();
  await page.getByLabel("Título").fill(activityTitle);
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();

  await expect(page.getByText(activityTitle, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: `Remover ${activityTitle} do roteiro` }).click();

  await expect(page).toHaveURL(/atividadeRemovida=1$/);
  await expect(page.getByRole("status")).toContainText("Atividade removida");
  await expect(page.getByText(activityTitle, { exact: true })).toHaveCount(0);

  await page.reload();
  await expect(page.getByText(activityTitle, { exact: true })).toHaveCount(0);
});

test("edita uma atividade preservando sua identidade no roteiro", async ({ page }, testInfo) => {
  const tripName = `Edição ${testInfo.project.name} ${Date.now()}`;
  const activityTitle = "Passeio inicial";
  const updatedTitle = "Passeio revisado";

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();
  await page.getByLabel("Título").fill(activityTitle);
  await page.getByLabel("Horário opcional").fill("10:00");
  await page.getByLabel("Duração opcional").fill("120");
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();

  await expect(page).toHaveURL(/atividadeCriada=1$/);
  await expect(page.getByText(activityTitle, { exact: true })).toBeVisible();
  await page.locator(`summary[aria-label="Editar ${activityTitle}"]`).click();
  const editForm = page.getByRole("form", { name: `Editar ${activityTitle}` });
  await expect(editForm).toBeVisible();
  await editForm.getByLabel("Título").fill(updatedTitle);
  await editForm.getByLabel("Horário opcional").fill("");
  await editForm.getByLabel("Duração opcional").fill("90");
  await submitAndExpectActionRedirect(
    page,
    () => editForm.getByRole("button", { name: "Salvar alterações" }).click(),
    /atividadeEditada=1$/,
  );

  await expect(page.getByRole("status")).toContainText("Atividade atualizada");
  await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible();
  await expect(page.getByText(activityTitle, { exact: true })).toHaveCount(0);
  await expect(page.getByText("Livre", { exact: true })).toBeVisible();
  await expect(page.getByText("1 h 30 min", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible();
  await expect(page.getByText("1 h 30 min", { exact: true })).toBeVisible();
});

test("reordena atividades dentro do mesmo período e preserva a sequência", async ({
  page,
}, testInfo) => {
  const tripName = `Ordem ${testInfo.project.name} ${Date.now()}`;
  const firstTitle = "Primeira decisão";
  const secondTitle = "Segunda decisão";
  const now = new Date();
  const trip = createTrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-29",
      ownerName: "RouteBook E2E",
    },
    now,
  );
  let itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);
  itinerary = addActivity(itinerary, { dayDate: "2026-08-22", title: firstTitle }, now);
  itinerary = addActivity(itinerary, { dayDate: "2026-08-22", title: secondTitle }, now);
  await new DrizzleTripRepository().create(trip);
  await new DrizzleItineraryRepository().save(itinerary);
  await page.goto(`/viagens/${trip.id}/roteiro`);

  const firstDay = page.locator(".itinerary-day-card").first();
  const activityTitles = firstDay.locator(".itinerary-activity-copy strong");
  await expect(activityTitles).toHaveText([firstTitle, secondTitle]);

  await submitAndExpectActionRedirect(
    page,
    () => page.getByRole("button", { name: `Subir ${secondTitle} no roteiro` }).click(),
    /atividadeReordenada=1$/,
  );
  await expect(page.getByRole("status")).toContainText("Ordem das atividades atualizada");
  await expect(activityTitles).toHaveText([secondTitle, firstTitle]);

  await page.reload();
  await expect(firstDay.locator(".itinerary-activity-copy strong")).toHaveText([
    secondTitle,
    firstTitle,
  ]);
});

test("move uma atividade para outro dia e preserva seus dados", async ({ page }, testInfo) => {
  const tripName = `Movimentação ${testInfo.project.name} ${Date.now()}`;
  const activityTitle = "Passeio para mover";

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();

  const composer = page.locator(".itinerary-form");
  await composer.getByLabel("Dia da viagem").selectOption("2026-08-22");
  await composer.getByLabel("Título").fill(activityTitle);
  await composer.getByLabel("Horário opcional").fill("11:15");
  await composer.getByLabel("Duração opcional").fill("150");
  await submitAndExpectActionRedirect(
    page,
    () => composer.getByRole("button", { name: "Adicionar ao roteiro" }).click(),
    /atividadeCriada=1$/,
  );

  const dayCards = page.locator(".itinerary-day-card");
  const firstDay = dayCards.nth(0);
  const secondDay = dayCards.nth(1);
  await expect(firstDay.locator(".itinerary-activity-copy strong")).toHaveText(activityTitle);
  await expect(secondDay.locator(".itinerary-activity-copy strong")).toHaveCount(0);

  await page.locator(`summary[aria-label="Mover ${activityTitle} para outro dia"]`).click();
  const moveForm = page.getByRole("form", { name: `Mover ${activityTitle} para outro dia` });
  await moveForm.getByLabel("Dia de destino").selectOption("2026-08-23");
  await submitAndExpectActionRedirect(
    page,
    () => moveForm.getByRole("button", { name: "Mover atividade" }).click(),
    /atividadeMovida=1$/,
  );

  await expect(page).toHaveURL(/atividadeMovida=1$/);
  await expect(page.getByRole("status")).toContainText("Atividade movida para outro dia");
  await expect(firstDay.locator(".itinerary-activity-copy strong")).toHaveCount(0);
  await expect(secondDay.locator(".itinerary-activity-copy strong")).toHaveText(activityTitle);
  await expect(secondDay.getByText("11:15", { exact: true })).toBeVisible();
  await expect(secondDay.getByText("2 h 30 min", { exact: true })).toBeVisible();

  await page.reload();
  await expect(firstDay.locator(".itinerary-activity-copy strong")).toHaveCount(0);
  await expect(secondDay.locator(".itinerary-activity-copy strong")).toHaveText(activityTitle);
  await expect(secondDay.getByText("11:15", { exact: true })).toBeVisible();
});

test("adiciona um lugar salvo ao roteiro sem removê-lo da seleção", async ({ page }, testInfo) => {
  const tripName = `Lugar no roteiro ${testInfo.project.name} ${Date.now()}`;
  const now = new Date();
  const trip = createTrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-29",
      ownerName: "RouteBook E2E",
    },
    now,
  );
  const [place] = await new DrizzlePlaceRepository().listPublished({
    destinationId: "pipa-rn-br",
  });
  expect(place).toBeDefined();
  await new DrizzleTripRepository().create(trip);
  await new DrizzleSavedPlaceRepository().save(
    createSavedPlace({ tripId: trip.id, placeId: place!.id }, now),
  );

  const placeName = place!.name;
  await page.goto(`/viagens/${trip.id}/lugares-salvos`);

  await page.getByLabel("Adicionar ao dia").selectOption("2026-08-23");
  await page.getByLabel("Horário opcional").fill("14:15");
  await page.getByLabel("Duração opcional").fill("120");
  await submitAndExpectActionRedirect(
    page,
    () => page.getByRole("button", { name: "Adicionar ao roteiro" }).click(),
    /adicionadoAoRoteiro=1$/,
  );

  await expect(page.getByRole("status")).toContainText("continua salvo");
  await expect(page.getByRole("heading", { name: placeName })).toBeVisible();

  await page.getByRole("link", { name: "Abrir roteiro" }).click();
  await expect(page).toHaveURL(/\/roteiro$/);
  const itineraryDays = page.getByRole("list", { name: "Dias do roteiro" });
  await expect(itineraryDays.getByText(placeName!, { exact: true })).toBeVisible();
  await expect(itineraryDays.getByText("14:15", { exact: true })).toBeVisible();
  await expect(itineraryDays.getByText("2 h", { exact: true })).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("list", { name: "Dias do roteiro" }).getByText(placeName, { exact: true }),
  ).toBeVisible();
});
