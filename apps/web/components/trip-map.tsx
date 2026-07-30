import Link from "next/link";

import {
  deriveTripMapBounds,
  isValidTripMapPoint,
  type TripMapBounds,
  type TripMapPoint,
  type TripMapPointKind,
} from "../lib/trip-map";

import styles from "./trip-map.module.css";

const kindLabels: Record<TripMapPointKind, string> = {
  accommodation: "Hospedagem",
  "published-place": "Lugar publicado",
  "saved-place": "Lugar salvo",
  "itinerary-activity": "Atividade planejada",
};

function buildOpenStreetMapEmbedUrl(bounds: TripMapBounds): string {
  const bbox = [bounds.west, bounds.south, bounds.east, bounds.north].join(",");
  const params = new URLSearchParams({ bbox, layer: "mapnik" });

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

function calculateMarkerPosition(point: TripMapPoint, bounds: TripMapBounds) {
  const longitudeRange = bounds.east - bounds.west;
  const latitudeRange = bounds.north - bounds.south;

  return {
    left: `${((point.longitude - bounds.west) / longitudeRange) * 100}%`,
    top: `${((bounds.north - point.latitude) / latitudeRange) * 100}%`,
  };
}

function describePoint(point: TripMapPoint): string {
  if (point.kind === "itinerary-activity" && point.sequence !== undefined) {
    return `Atividade ${point.sequence}: ${point.label}`;
  }

  return `${kindLabels[point.kind]}: ${point.label}`;
}

function Marker({ point, bounds }: { point: TripMapPoint; bounds: TripMapBounds }) {
  const className = `${styles.marker} ${styles[point.kind]}`;
  const markerContent = (
    <>
      <span aria-hidden="true" className={styles.markerDot}>
        {point.kind === "itinerary-activity" ? point.sequence : null}
      </span>
      <span className={styles.markerLabel}>{point.label}</span>
    </>
  );
  const accessibleName = describePoint(point);

  if (point.href) {
    return (
      <Link
        aria-label={`${accessibleName}. Abrir detalhes.`}
        className={className}
        href={point.href}
        style={calculateMarkerPosition(point, bounds)}
      >
        {markerContent}
      </Link>
    );
  }

  return (
    <span
      aria-label={accessibleName}
      className={className}
      role="img"
      style={calculateMarkerPosition(point, bounds)}
    >
      {markerContent}
    </span>
  );
}

type TripMapProps = {
  points: readonly TripMapPoint[];
  title: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function TripMap({
  points,
  title,
  description = "Use os marcadores para localizar a hospedagem e abrir os detalhes dos lugares.",
  emptyTitle = "Mapa ainda indisponível",
  emptyDescription = "Informe as coordenadas da hospedagem ou aguarde a publicação de lugares com localização para visualizar o mapa. As demais áreas da viagem continuam disponíveis normalmente.",
}: TripMapProps) {
  const validPoints = points.filter(isValidTripMapPoint);
  const bounds = deriveTripMapBounds(validPoints);
  const visibleKinds = Array.from(new Set(validPoints.map((point) => point.kind)));

  if (!bounds) {
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
        <iframe
          className={styles.mapFrame}
          loading="lazy"
          src={buildOpenStreetMapEmbedUrl(bounds)}
          title={`Mapa de ${title}`}
        />
        <div aria-label="Marcadores do mapa" className={styles.markerLayer}>
          {validPoints.map((point) => (
            <Marker bounds={bounds} key={`${point.kind}-${point.id}`} point={point} />
          ))}
        </div>
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
