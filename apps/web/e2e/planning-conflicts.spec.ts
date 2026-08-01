import { expect, test } from "@playwright/test";

import { DrizzleItineraryRepository, DrizzleTripRepository } from "@routebook/database";
import { addActivity, createItinerary, createTrip } from "@routebook/trip-management";

test("revisa um conflito de horários e retorna ao dia afetado", async ({ page }, testInfo) => {
  const tripName = `Conflitos ${testInfo.project.name} ${Date.now()}`;
  const firstActivity = "Café demorado";
  const secondActivity = "Passeio de barco";
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
  itinerary = addActivity(
    itinerary,
    {
      dayDate: "2026-08-22",
      title: firstActivity,
      startTime: "09:00",
      durationMinutes: 120,
    },
    now,
  );
  itinerary = addActivity(
    itinerary,
    {
      dayDate: "2026-08-22",
      title: secondActivity,
      startTime: "10:00",
      durationMinutes: 60,
    },
    now,
  );

  await new DrizzleTripRepository().create(trip);
  await new DrizzleItineraryRepository().save(itinerary);
  await page.goto(`/viagens/${trip.id}/roteiro/revisao`);

  await expect(page).toHaveURL(/\/viagens\/[^/]+\/roteiro\/revisao$/);
  await expect(page.getByRole("heading", { level: 1, name: "Revisão de Conflitos" })).toBeVisible();
  const conflictList = page.getByRole("list", {
    name: "Conflitos de Planejamento encontrados",
  });
  await expect(conflictList.getByRole("heading", { name: "Horários sobrepostos" })).toBeVisible();
  await expect(conflictList.getByText(firstActivity, { exact: true })).toBeVisible();
  await expect(conflictList.getByText(secondActivity, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Erros 0/ }).click();
  await expect(page.getByText("Nenhum conflito desta severidade", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Riscos 1/ }).click();
  await Promise.all([
    page.waitForURL(/\/roteiro#[^#]+$/),
    conflictList.getByRole("link", { name: /Ver dia no Roteiro/ }).click(),
  ]);
  const affectedDayId = new URL(page.url()).hash.slice(1);
  expect(affectedDayId).not.toBe("");
  const affectedDay = page.locator(`.itinerary-day-card[id="${affectedDayId}"]`);
  await expect(affectedDay.getByText(firstActivity, { exact: true })).toBeVisible();
  await expect(affectedDay.getByText(secondActivity, { exact: true })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/viagens\/[^/]+\/roteiro\/revisao$/);
  await page.getByText("Ignorar risco", { exact: true }).click();
  await page
    .getByRole("checkbox", { name: /Entendo que este risco continuará no Roteiro/ })
    .check();
  await Promise.all([
    page.waitForURL(/riscoIgnorado=1$/),
    page.getByRole("button", { name: "Confirmar e ignorar risco" }).click(),
  ]);
  await expect(page.getByText(/Risco ignorado e Decision registrada/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nenhum conflito aberto" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Riscos ignorados" })).toBeVisible();
  const ignoredHistory = page.getByRole("list", { name: "Riscos ignorados registrados" });
  await expect(ignoredHistory.getByRole("heading", { name: "Horários sobrepostos" })).toBeVisible();
  await expect(ignoredHistory.getByText("RouteBook E2E", { exact: true })).toBeVisible();
  const ignoredActivities = ignoredHistory.locator("p").filter({ hasText: "Atividades:" });
  await expect(ignoredActivities).toContainText(firstActivity);
  await expect(ignoredActivities).toContainText(secondActivity);
  await expect(ignoredHistory.getByText("Restaurar", { exact: true })).toHaveCount(0);

  await Promise.all([
    page.waitForURL(/\/roteiro$/),
    page.getByRole("link", { name: "Voltar para o Roteiro" }).click(),
  ]);
  await expect(page.getByText(firstActivity, { exact: true })).toBeVisible();
  await expect(page.getByText(secondActivity, { exact: true })).toBeVisible();
});
