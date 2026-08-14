"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  isValidTripMapPoint,
  type TripMapPoint,
  type TripMapPointKind,
} from "../lib/trip-map";

import styles from "./trip-map.module.css";

const LEAFLET_VERSION = "1.9.4";
const LEAFLET_CSS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_SCRIPT_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
const LEAFLET_CSS_INTEGRITY = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
const LEAFLET_SCRIPT_INTEGRITY = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const MAP_POINT_ICON_SIZE = 22;

type LeafletLatLng = [number, number];

type LeafletMap = {
  fitBounds(
    bounds: LeafletLatLng[],
    options?: { maxZoom?: number; padding?: [number, number] },
  ): LeafletMap;
  getCenter(): { lat: number; lng: number };
  getZoom(): number;
  on(event: string, handler: () => void): LeafletMap;
  remove(): void;
  setView(center: LeafletLatLng, zoom: number): LeafletMap;
};

type LeafletDivIcon = object;

type LeafletLayer = {
  addTo(map: LeafletMap): LeafletLayer;
};

type LeafletControl = {
  addTo(map: LeafletMap): LeafletControl;
};

type LeafletNamespace = {
  control: {
    zoom(options: {
      position?: "topleft" | "topright" | "bottomleft" | "bottomright";
      zoomInTitle?: string;
      zoomOutTitle?: string;
    }): LeafletControl;
  };
  divIcon(options: {
    className: string;
    html: HTMLElement;
    iconAnchor: [number, number];
    iconSize: [number, number];
  }): LeafletDivIcon;
  map(element: HTMLElement, options?: { zoomControl?: boolean }): LeafletMap;
  marker(
    position: LeafletLatLng,
    options: { icon: LeafletDivIcon; keyboard?: boolean },
  ): LeafletLayer;
  tileLayer(
    url: string,
    options: { attribution: string; maxZoom: number },
  ): LeafletLayer;
};

declare global {
  interface Window {
    L?: LeafletNamespace;
  }
}

let leafletLoader: Promise<LeafletNamespace> | undefined;

const kindLabels: Record<TripMapPointKind, string> = {
  accommodation: "Hospedagem",
  "published-place": "Lugar publicado",
  "saved-place": "Lugar salvo",
  "itinerary-activity": "Atividade planejada",
};

function describePoint(point: TripMapPoint): string {
  if (point.kind === "itinerary-activity" && point.sequence !== undefined) {
    return `Atividade ${point.sequence}: ${point.label}`;
  }

  return `${kindLabels[point.kind]}: ${point.label}`;
}

function ensureLeafletStylesheet(): void {
  if (document.querySelector(`link[data-routebook-leaflet="${LEAFLET_VERSION}"]`)) return;

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = LEAFLET_CSS_URL;
  stylesheet.integrity = LEAFLET_CSS_INTEGRITY;
  stylesheet.crossOrigin = "anonymous";
  stylesheet.dataset.routebookLeaflet = LEAFLET_VERSION;
  document.head.append(stylesheet);
}

function loadLeaflet(): Promise<LeafletNamespace> {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoader) return leafletLoader;

  ensureLeafletStylesheet();

  leafletLoader = new Promise<LeafletNamespace>((resolve, reject) => {
    const selector = `script[data-routebook-leaflet="${LEAFLET_VERSION}"]`;
    const existingScript = document.querySelector<HTMLScriptElement>(selector);
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => {
      if (!window.L) {
        leafletLoader = undefined;
        reject(new Error("Leaflet foi carregado sem expor o runtime esperado."));
        return;
      }

      resolve(window.L);
    };

    const handleError = () => {
      leafletLoader = undefined;
      reject(new Error("Não foi possível carregar a biblioteca cartográfica."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.src = LEAFLET_SCRIPT_URL;
      script.integrity = LEAFLET_SCRIPT_INTEGRITY;
      script.crossOrigin = "anonymous";
      script.dataset.routebookLeaflet = LEAFLET_VERSION;
      document.head.append(script);
    }
  });

  return leafletLoader;
}

function createMarkerContent(point: TripMapPoint): HTMLElement {
  const marker = document.createElement(point.href ? "a" : "span");
  marker.className = `${styles.marker} ${styles[point.kind]}`;
  marker.dataset.mapPointId = point.id;
  marker.dataset.mapPointKind = point.kind;
  marker.dataset.latitude = String(point.latitude);
  marker.dataset.longitude = String(point.longitude);

  const accessibleName = describePoint(point);

  if (point.href && marker instanceof HTMLAnchorElement) {
    marker.href = point.href;
    marker.setAttribute("aria-label", `${accessibleName}. Abrir detalhes.`);
  } else {
    marker.setAttribute("aria-label", accessibleName);
    marker.setAttribute("role", "img");
  }

  const dot = document.createElement("span");
  dot.className = styles.markerDot;
  dot.setAttribute("aria-hidden", "true");
  if (point.kind === "itinerary-activity" && point.sequence !== undefined) {
    dot.textContent = String(point.sequence);
  }

  const label = document.createElement("span");
  label.className = styles.markerLabel;
  label.textContent = point.label;

  marker.append(dot, label);
  return marker;
}

type TripMapProps = {
  points: readonly TripMapPoint[];
  title: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

type MapState = "loading" | "ready" | "error";

export function TripMap({
  points,
  title,
  description = "Use os marcadores para localizar a hospedagem e abrir os detalhes dos lugares.",
  emptyTitle = "Mapa ainda indisponível",
  emptyDescription = "Informe as coordenadas da hospedagem ou aguarde a publicação de lugares com localização para visualizar o mapa. As demais áreas da viagem continuam disponíveis normalmente.",
}: TripMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const [mapState, setMapState] = useState<MapState>("loading");
  const validPoints = useMemo(() => points.filter(isValidTripMapPoint), [points]);
  const visibleKinds = useMemo(
    () => Array.from(new Set(validPoints.map((point) => point.kind))),
    [validPoints],
  );

  useEffect(() => {
    const mapElement = mapElementRef.current;
    if (!mapElement || validPoints.length === 0) return;

    let disposed = false;
    let map: LeafletMap | undefined;
    setMapState("loading");
    mapElement.dataset.mapState = "loading";

    void loadLeaflet()
      .then((leaflet) => {
        if (disposed || !mapElementRef.current) return;

        map = leaflet.map(mapElement, { zoomControl: false });
        leaflet.control
          .zoom({
            position: "topleft",
            zoomInTitle: "Aproximar mapa",
            zoomOutTitle: "Afastar mapa",
          })
          .addTo(map);
        leaflet
          .tileLayer(OSM_TILE_URL, {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            maxZoom: 19,
          })
          .addTo(map);

        if (validPoints.length === 1) {
          const point = validPoints[0]!;
          map.setView([point.latitude, point.longitude], 14);
        } else {
          map.fitBounds(
            validPoints.map((point) => [point.latitude, point.longitude]),
            { maxZoom: 15, padding: [32, 32] },
          );
        }

        for (const point of validPoints) {
          const markerContent = createMarkerContent(point);
          const icon = leaflet.divIcon({
            className: styles.leafletMarkerIcon,
            html: markerContent,
            iconAnchor: [MAP_POINT_ICON_SIZE / 2, MAP_POINT_ICON_SIZE / 2],
            iconSize: [MAP_POINT_ICON_SIZE, MAP_POINT_ICON_SIZE],
          });

          leaflet
            .marker([point.latitude, point.longitude], {
              icon,
              keyboard: false,
            })
            .addTo(map);
        }

        const updateViewportEvidence = () => {
          if (!map || disposed) return;
          const center = map.getCenter();
          mapElement.dataset.mapCenterLat = center.lat.toFixed(6);
          mapElement.dataset.mapCenterLng = center.lng.toFixed(6);
          mapElement.dataset.mapZoom = String(map.getZoom());
        };

        map.on("moveend", updateViewportEvidence);
        map.on("zoomend", updateViewportEvidence);
        updateViewportEvidence();
        mapElement.dataset.mapState = "ready";
        setMapState("ready");
      })
      .catch(() => {
        if (disposed) return;
        mapElement.dataset.mapState = "error";
        setMapState("error");
      });

    return () => {
      disposed = true;
      map?.remove();
      mapElement.replaceChildren();
    };
  }, [validPoints]);

  if (validPoints.length === 0) {
    return (
      <section aria-labelledby="trip-map-title" className={styles.emptyState}>
        <p className={styles.eyebrow}>Contexto espacial</p>
        <h2 id="trip-map-title">{emptyTitle}</h2>
        <p>{emptyDescription}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="trip-map-title" className={styles.section}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Contexto espacial</p>
          <h2 id="trip-map-title">{title}</h2>
          <p>{description}</p>
        </div>
        <ul aria-label="Legenda do mapa" className={styles.legend}>
          {visibleKinds.map((kind) => (
            <li key={kind}>
              <span aria-hidden="true" className={`${styles.legendDot} ${styles[kind]}`} />
              {kindLabels[kind]}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.mapShell}>
        <div
          aria-label={`Mapa interativo: ${title}`}
          className={styles.mapCanvas}
          data-map-state={mapState}
          data-routebook-map="true"
          ref={mapElementRef}
          role="region"
        />
        {mapState === "error" ? (
          <p className={styles.mapFailure} role="status">
            A camada cartográfica está indisponível. Use a lista de locais abaixo para continuar.
          </p>
        ) : null}
      </div>

      <noscript>
        <p className={styles.notice}>Ative o JavaScript para carregar a camada cartográfica.</p>
      </noscript>

      <ul aria-label="Locais exibidos no mapa" className={styles.locationList}>
        {validPoints.map((point) => (
          <li key={`list-${point.kind}-${point.id}`}>
            <div>
              <span>{describePoint(point)}</span>
              <strong>{point.label}</strong>
            </div>
            {point.href ? <Link href={point.href}>Ver detalhes</Link> : null}
          </li>
        ))}
      </ul>

      <p className={styles.attribution}>
        Camada cartográfica por OpenStreetMap. Os marcadores representam coordenadas cadastradas e
        não indicam rota, trânsito ou tempo de deslocamento.
      </p>
    </section>
  );
}
