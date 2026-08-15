import { expect, test } from "@playwright/test";

import { DrizzleItineraryRepository, DrizzlePlaceRepository } from "@routebook/database";
import { addActivity, createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test("abre uma rota externa entre etapas válidas sem ocultar lacunas", async ({
  page,
}, testInfo) => {
  const tripName = `Rota externa ${testInfo.project.name} ${Date.now()}`;
  const now = new Date();
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: tripName,
      startDate: "2026-08-22",
      endDate: "2026-08-29",
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

  let itinerary = createItinerary({ tripId: trip.id, period: trip.period }, now);
  itinerary = addActivity(
    itinerary,
    {
      dayDate: "2026-08-23",
      title: firstPlace!.name,
      type: "place-visit",
      placeId: firstPlace!.id,
    },
    now,
  );
  itinerary = addActivity(
    itinerary,
    {
      dayDate: "2026-08-23",
      title: secondPlace!.name,
      type: "place-visit",
      placeId: secondPlace!.id,
    },
    now,
  );
  itinerary = addActivity(
    itinerary,
    {
      dayDate: "2026-08-23",
      title: "Pausa manual",
    },
    now,
  );

  await new DrizzleItineraryRepository().save(itinerary);

  const firstPlaceName = firstPlace!.name;
  const secondPlaceName = secondPlace!.name;
  await page.goto(`/viagens/${trip.id}/roteiro?dia=2026-08-23`);
  await expect(page.getByRole("heading", { name: "Mapa do Dia 2" })).toBeVisible();
  const map = page.getByRole("region", { name: "Mapa interativo: Mapa do Dia 2" });
  await expect(
    map.getByRole("link", { name: `Atividade 1: ${firstPlaceName}. Abrir detalhes.` }),
  ).toBeVisible();
  await expect(
    map.getByRole("link", { name: `Atividade 2: ${secondPlaceName}. Abrir detalhes.` }),
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
