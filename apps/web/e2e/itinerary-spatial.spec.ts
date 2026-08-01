import { expect, test } from "@playwright/test";

import {
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { createSavedPlace } from "@routebook/saved-places";
import { createTrip } from "@routebook/trip-management";

test("abre uma rota externa entre etapas válidas sem ocultar lacunas", async ({
  page,
}, testInfo) => {
  const tripName = `Rota externa ${testInfo.project.name} ${Date.now()}`;
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
  const places = await new DrizzlePlaceRepository().listPublished({
    destinationId: "pipa-rn-br",
  });
  expect(places.length).toBeGreaterThanOrEqual(2);
  const [firstPlace, secondPlace] = places;
  expect(firstPlace).toBeDefined();
  expect(secondPlace).toBeDefined();

  await new DrizzleTripRepository().create(trip);
  const savedPlaceRepository = new DrizzleSavedPlaceRepository();
  await savedPlaceRepository.save(
    createSavedPlace({ tripId: trip.id, placeId: firstPlace!.id }, now),
  );
  await savedPlaceRepository.save(
    createSavedPlace({ tripId: trip.id, placeId: secondPlace!.id }, now),
  );

  const tripPath = `/viagens/${trip.id}`;
  const firstPlaceName = firstPlace!.name;
  const secondPlaceName = secondPlace!.name;
  await page.goto(`${tripPath}/lugares-salvos`);
  await expect(page.getByRole("heading", { name: "Lugares salvos", exact: true })).toBeVisible();

  const savedPlacesPath = new URL(page.url()).pathname;
  const addSavedPlaceToDay = async (placeName: string) => {
    await page.goto(savedPlacesPath);

    const savedPlaceCard = page.locator("ul.place-catalog-grid > li").filter({
      has: page.getByRole("heading", { name: placeName, exact: true }),
    });
    await expect(savedPlaceCard).toHaveCount(1);
    await savedPlaceCard.getByLabel("Adicionar ao dia").selectOption("2026-08-23");
    await Promise.all([
      page.waitForURL(/adicionadoAoRoteiro=1$/),
      savedPlaceCard.getByRole("button", { name: "Adicionar ao roteiro" }).click(),
    ]);
    await expect(page.getByRole("status")).toContainText("Lugar adicionado ao roteiro");
  };

  await addSavedPlaceToDay(firstPlaceName!);
  await addSavedPlaceToDay(secondPlaceName!);

  await page.goto(`${tripPath}/roteiro`);
  await page.getByLabel("Dia da viagem").selectOption("2026-08-23");
  await page.locator("#title").fill("Pausa manual");
  await Promise.all([
    page.waitForURL(/atividadeCriada=1$/),
    page.getByRole("button", { name: "Adicionar ao roteiro" }).click(),
  ]);
  await page.getByRole("link", { name: /Dia 2/i }).click();

  await expect(page).toHaveURL(/dia=2026-08-23/);
  await expect(page.getByRole("heading", { name: "Mapa do Dia 2" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: `Atividade 1: ${firstPlaceName}. Abrir detalhes.` }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: `Atividade 2: ${secondPlaceName}. Abrir detalhes.` }),
  ).toBeVisible();
  await expect(page.getByText("Hospedagem sem coordenadas disponíveis.")).toBeVisible();
  await expect(
    page.getByText(/Distâncias geodésicas em linha reta. Não representam trajeto por ruas/),
  ).toBeVisible();
  await expect(
    page.getByText(/Distância indisponível porque existe uma lacuna geográfica/),
  ).toBeVisible();
  await expect(page.getByText(/Total geodésico/)).toHaveCount(0);

  const routeLinks = page.getByRole("link", { name: /Abrir rota externa de/ });
  await expect(routeLinks).toHaveCount(1);
  const routeLink = page.getByRole("link", {
    name: `Abrir rota externa de ${firstPlaceName} para ${secondPlaceName}`,
  });
  await expect(routeLink).toHaveAttribute("target", "_blank");
  await expect(routeLink).toHaveAttribute("rel", "noopener noreferrer");

  const routeHref = await routeLink.getAttribute("href");
  expect(routeHref).toBeTruthy();
  const routeUrl = new URL(routeHref!);
  expect(routeUrl.protocol).toBe("https:");
  expect(routeUrl.hostname).toBe("www.google.com");
  expect(routeUrl.pathname).toBe("/maps/dir/");
  expect(routeUrl.searchParams.get("api")).toBe("1");
  expect(routeUrl.searchParams.get("origin")).toBeTruthy();
  expect(routeUrl.searchParams.get("destination")).toBeTruthy();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
