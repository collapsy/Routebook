import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { TripMapPoint } from "../lib/trip-map";
import { TripMap } from "./trip-map";

const accommodationPoint: TripMapPoint = {
  id: "accommodation",
  label: "Condomínio Solar Água",
  kind: "accommodation",
  latitude: -6.2302,
  longitude: -35.0503,
};

const savedPlacePoint: TripMapPoint = {
  id: "praia-do-amor",
  label: "Praia do Amor",
  kind: "saved-place",
  latitude: -6.244,
  longitude: -35.041,
  href: "/viagens/trip-1/lugares/praia-do-amor",
};

const points: TripMapPoint[] = [accommodationPoint, savedPlacePoint];

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "L");
});

describe("TripMap", () => {
  it("shows an explicit empty state without valid points", () => {
    render(<TripMap points={[]} title="Mapa de Pipa" />);

    expect(screen.getByRole("heading", { name: "Mapa ainda indisponível" })).toBeInTheDocument();
    expect(screen.getByText(/demais áreas da viagem continuam disponíveis/i)).toBeInTheDocument();
  });

  it("uses one interactive map viewport instead of a detached iframe marker overlay", () => {
    render(<TripMap points={points} title="Mapa de Pipa" />);

    expect(screen.getByRole("region", { name: "Mapa interativo: Mapa de Pipa" })).toHaveAttribute(
      "data-routebook-map",
      "true",
    );
    expect(document.querySelector("iframe")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Marcadores do mapa")).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Legenda do mapa" })).toBeInTheDocument();
    expect(screen.getAllByText("Condomínio Solar Água").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute(
      "href",
      "/viagens/trip-1/lugares/praia-do-amor",
    );

    const leafletScript = document.head.querySelector<HTMLScriptElement>(
      'script[data-routebook-leaflet="1.9.4"]',
    );
    const leafletStylesheet = document.head.querySelector<HTMLLinkElement>(
      'link[data-routebook-leaflet="1.9.4"]',
    );

    expect(leafletScript).toHaveAttribute("src", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
    expect(leafletScript).toHaveAttribute(
      "integrity",
      "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=",
    );
    expect(leafletStylesheet).toHaveAttribute(
      "href",
      "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    );
    expect(leafletStylesheet).toHaveAttribute(
      "integrity",
      "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
    );
  });

  it("creates marker content as DOM text tied to the same map runtime", async () => {
    const markerContents: HTMLElement[] = [];
    const fakeMap = {
      fitBounds() {
        return fakeMap;
      },
      getCenter() {
        return { lat: -6.23, lng: -35.05 };
      },
      getZoom() {
        return 14;
      },
      on() {
        return fakeMap;
      },
      remove() {},
      setView() {
        return fakeMap;
      },
    };
    const fakeLayer = {
      addTo() {
        return fakeLayer;
      },
    };
    const fakeControl = {
      addTo() {
        return fakeControl;
      },
    };

    Object.defineProperty(window, "L", {
      configurable: true,
      value: {
        control: { zoom: () => fakeControl },
        divIcon: ({ html }: { html: HTMLElement }) => {
          markerContents.push(html);
          return {};
        },
        map: () => fakeMap,
        marker: () => fakeLayer,
        tileLayer: () => fakeLayer,
      },
    });

    render(
      <TripMap
        points={[
          accommodationPoint,
          {
            ...savedPlacePoint,
            label: "Praia </script><script>não executar</script> do Amor",
          },
        ]}
        title="Mapa de Pipa"
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole("region", { name: "Mapa interativo: Mapa de Pipa" })).toHaveAttribute(
        "data-map-state",
        "ready",
      ),
    );

    expect(markerContents).toHaveLength(2);
    expect(markerContents[1]).toBeInstanceOf(HTMLAnchorElement);
    expect(markerContents[1]).toHaveAttribute(
      "aria-label",
      "Lugar salvo: Praia </script><script>não executar</script> do Amor. Abrir detalhes.",
    );
    expect(markerContents[1]?.querySelector("script")).toBeNull();
    expect(markerContents[1]).toHaveTextContent(
      "Praia </script><script>não executar</script> do Amor",
    );
  });

  it("ignores malformed coordinates", () => {
    render(
      <TripMap
        points={[{ ...accommodationPoint, latitude: 120 }, savedPlacePoint]}
        title="Mapa de Pipa"
      />,
    );

    expect(screen.queryByText("Condomínio Solar Água")).not.toBeInTheDocument();
    expect(screen.getAllByText("Praia do Amor").length).toBeGreaterThan(0);
  });
});
