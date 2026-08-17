import { expect, test, type Page } from "@playwright/test";

import {
  DrizzleItineraryRepository,
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
} from "@routebook/database";
import { createSavedPlace } from "@routebook/saved-places";
import { addActivity, createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

async function submitAndExpectActionRedirect(
  page: Page,
  submit: () => Promise<void>,
  expectedUrl: RegExp,
  expectedStatus: string,
) {
  const actionPathname = new URL(page.url()).pathname;
  const actionResponse = page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === "POST" && new URL(request.url()).pathname === actionPathname;
  });

  const [response] = await Promise.all([actionResponse, submit()]);
  const redirectUrl = response.headers()["x-action-redirect"]?.split(";")[0];
  expect(redirectUrl).toMatch(expectedUrl);
  await page.goto(redirectUrl!);
  await expect(page.getByRole("status")).toContainText(expectedStatus);
  await expect(page).toHaveURL(expectedUrl);
}

async function openManualComposer(page: Page) {
  await page.getByText("Adicionar atividade manual", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Adicione uma decisão manual" })).toBeVisible();
}

test("orienta um dia vazio pela jornada antes das ações manuais", async ({ page }, testInfo) => {
  const tripName = `Jornada vazia ${testInfo.project.name} ${Date.now()}`;
  const { trip } = await createAuthenticatedE2ETrip({
    name: tripName,
    startDate: "2026-08-22",
    endDate: "2026-08-29",
  });

  await page.goto(`/viagens/${trip.id}/roteiro`);

  await expect(page.getByRole("heading", { level: 1, name: tripName })).toBeVisible();
  const journey = page.getByRole("navigation", { name: "Jornada de planejamento" });
  await expect(journey).toContainText("1. Explorar");
  await expect(journey).toContainText("2. Salvos");
  await expect(journey).toContainText("3. Roteiro");
  await expect(journey).toContainText("4. Revisar");
  await expect(page.getByRole("heading", { name: /Dia 1 —/ })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Escolha um Lugar para começar este Dia" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Explorar Lugares" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares`,
  );
  await expect(page.getByRole("link", { name: "Ver Lugares salvos" })).toHaveAttribute(
    "href",
    `/viagens/${trip.id}/lugares-salvos`,
  );
  await expect(page.getByText("Adicionar atividade manual", { exact: true })).toBeVisible();
  await expect(
    page.locator("summary").filter({ hasText: /^Adicionar período livre$/ }),
  ).toBeVisible();
  await expect(page.getByLabel("Título")).toBeHidden();
});

test("cria e preserva uma atividade no Dia em foco", async ({ page }, testInfo) => {
  const tripName = `Roteiro ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await expect(page).toHaveURL(/\/viagens\?created=1$/);
  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();

  await expect(page.getByRole("heading", { level: 1, name: tripName })).toBeVisible();
  await expect(page.getByText("8", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("dias", { exact: true })).toBeVisible();

  await openManualComposer(page);
  await page.getByLabel("Título").fill("Praia ao amanhecer");
  await page.getByLabel("Horário opcional").fill("09:30");
  await page.getByLabel("Duração opcional").fill("180");
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();

  await expect(page).toHaveURL(/atividadeCriada=1.*dia=2026-08-22/);
  await expect(page.getByRole("status")).toContainText("Atividade adicionada");
  await expect(page.getByText("Praia ao amanhecer")).toBeVisible();
  await expect(page.getByText("09:30")).toBeVisible();
  await expect(page.getByText("3 h", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/dia=2026-08-22/);
  await expect(page.getByText("Praia ao amanhecer")).toBeVisible();
  await expect(page.getByText("09:30")).toBeVisible();
});

test("remove uma atividade e mantém o mesmo Dia em foco", async ({ page }, testInfo) => {
  const tripName = `Remoção ${testInfo.project.name} ${Date.now()}`;
  const activityTitle = "Atividade removível";

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();
  await openManualComposer(page);
  await page.getByLabel("Título").fill(activityTitle);
  await submitAndExpectActionRedirect(
    page,
    () => page.getByRole("button", { name: "Adicionar ao roteiro" }).click(),
    /atividadeCriada=1.*dia=2026-08-22/,
    "Atividade adicionada",
  );

  await expect(page.getByText(activityTitle, { exact: true })).toBeVisible();
  await submitAndExpectActionRedirect(
    page,
    () => page.getByRole("button", { name: `Remover ${activityTitle} do roteiro` }).click(),
    /atividadeRemovida=1.*dia=2026-08-22/,
    "Atividade removida",
  );

  await expect(page.getByText(activityTitle, { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Escolha um Lugar para começar este Dia" }),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByText(activityTitle, { exact: true })).toHaveCount(0);
});

test("edita uma atividade preservando sua identidade e Dia", async ({ page }, testInfo) => {
  const tripName = `Edição ${testInfo.project.name} ${Date.now()}`;
  const activityTitle = "Passeio inicial";
  const updatedTitle = "Passeio revisado";

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();
  await openManualComposer(page);
  await page.getByLabel("Título").fill(activityTitle);
  await page.getByLabel("Horário opcional").fill("10:00");
  await page.getByLabel("Duração opcional").fill("120");
  await page.getByRole("button", { name: "Adicionar ao roteiro" }).click();

  await expect(page).toHaveURL(/atividadeCriada=1.*dia=2026-08-22/);
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
    /atividadeEditada=1.*dia=2026-08-22/,
    "Atividade atualizada",
  );

  await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible();
  await expect(page.getByText(activityTitle, { exact: true })).toHaveCount(0);
  await expect(page.getByText("Livre", { exact: true })).toBeVisible();
  await expect(page.getByText("1 h 30 min", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible();
});

test("reordena atividades dentro do mesmo período preservando Dia e sequência", async ({
  page,
}, testInfo) => {
  const tripName = `Ordem ${testInfo.project.name} ${Date.now()}`;
  const firstTitle = "Primeira decisão";
  const secondTitle = "Segunda decisão";
  const now = new Date();
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-29",
    },
    now,
  );
  let itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);
  itinerary = addActivity(itinerary, { dayDate: "2026-08-22", title: firstTitle }, now);
  itinerary = addActivity(itinerary, { dayDate: "2026-08-22", title: secondTitle }, now);
  await new DrizzleItineraryRepository().save(itinerary);
  await page.goto(`/viagens/${trip.id}/roteiro`);

  const focusedDay = page.locator(".itinerary-day-card");
  const activityTitles = focusedDay.locator(".itinerary-activity-copy strong");
  await expect(activityTitles).toHaveText([firstTitle, secondTitle]);

  await submitAndExpectActionRedirect(
    page,
    () => page.getByRole("button", { name: `Subir ${secondTitle} no roteiro` }).click(),
    /atividadeReordenada=1.*dia=2026-08-22/,
    "Ordem das atividades atualizada",
  );
  await expect(activityTitles).toHaveText([secondTitle, firstTitle]);

  await page.reload();
  await expect(focusedDay.locator(".itinerary-activity-copy strong")).toHaveText([
    secondTitle,
    firstTitle,
  ]);
});

test("move uma atividade para outro Dia e muda o foco para o destino", async ({
  page,
}, testInfo) => {
  const tripName = `Movimentação ${testInfo.project.name} ${Date.now()}`;
  const activityTitle = "Passeio para mover";

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByRole("button", { name: "Criar viagem" }).click();

  await page.getByRole("link", { name: tripName }).click();
  await page.getByRole("link", { name: "Abrir roteiro" }).click();
  await openManualComposer(page);

  const composer = page.locator(".itinerary-form");
  await composer.getByLabel("Título").fill(activityTitle);
  await composer.getByLabel("Horário opcional").fill("11:15");
  await composer.getByLabel("Duração opcional").fill("150");
  await submitAndExpectActionRedirect(
    page,
    () => composer.getByRole("button", { name: "Adicionar ao roteiro" }).click(),
    /atividadeCriada=1.*dia=2026-08-22/,
    "Atividade adicionada",
  );

  await expect(
    page.locator(".itinerary-day-card").getByText(activityTitle, { exact: true }),
  ).toBeVisible();

  await page.locator(`summary[aria-label="Mover ${activityTitle} para outro dia"]`).click();
  const moveForm = page.getByRole("form", { name: `Mover ${activityTitle} para outro dia` });
  await moveForm.getByLabel("Dia de destino").selectOption("2026-08-23");
  await submitAndExpectActionRedirect(
    page,
    () => moveForm.getByRole("button", { name: "Mover atividade" }).click(),
    /atividadeMovida=1.*dia=2026-08-23/,
    "Atividade movida para outro dia",
  );

  await expect(page.getByRole("heading", { name: /Dia 2 —/ })).toBeVisible();
  await expect(
    page.locator(".itinerary-day-card").getByText(activityTitle, { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".itinerary-day-card").getByText("11:15", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".itinerary-day-card").getByText("2 h 30 min", { exact: true }),
  ).toBeVisible();

  await page.getByRole("link", { name: /Dia 1/ }).click();
  await expect(page).toHaveURL(/dia=2026-08-22/);
  await expect(
    page.locator(".itinerary-day-card").getByText(activityTitle, { exact: true }),
  ).toHaveCount(0);

  await page.getByRole("link", { name: /Dia 2/ }).click();
  await expect(
    page.locator(".itinerary-day-card").getByText(activityTitle, { exact: true }),
  ).toBeVisible();
});

test("adiciona um lugar salvo ao roteiro sem removê-lo da seleção", async ({ page }, testInfo) => {
  const tripName = `Lugar no roteiro ${testInfo.project.name} ${Date.now()}`;
  const now = new Date();
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-29",
    },
    now,
  );
  const [place] = await new DrizzlePlaceRepository().listPublished({
    destinationId: "pipa-rn-br",
  });
  expect(place).toBeDefined();
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
    "continua salvo",
  );

  await expect(page.getByRole("status")).toContainText("continua salvo");
  await expect(page.getByRole("heading", { name: placeName })).toBeVisible();

  await page.getByRole("link", { name: "Abrir roteiro" }).click();
  await expect(page).toHaveURL(/\/roteiro$/);
  await page.getByRole("link", { name: /Dia 2/ }).click();
  await expect(page).toHaveURL(/dia=2026-08-23/);
  const focusedDay = page.locator(".itinerary-day-card");
  await expect(focusedDay.getByText(placeName!, { exact: true })).toBeVisible();
  await expect(focusedDay.getByText("14:15", { exact: true })).toBeVisible();
  await expect(focusedDay.getByText("2 h", { exact: true })).toBeVisible();

  await page.reload();
  await expect(focusedDay.getByText(placeName, { exact: true })).toBeVisible();
});
