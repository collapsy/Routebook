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

function Marker({ point, bounds }: { point: TripMapPoint; bounds: TripMapBounds }) {
  const className = `${styles.marker} ${styles[point.kind]}`;
  const markerContent = (
    <>
      <span aria-hidden="true" className={styles.markerDot} />
      <span className={styles.markerLabel}>{point.label}</span>
    </>
  );

  if (point.href) {
    return (
      <Link
        aria-label={`${kindLabels[point.kind]}: ${point.label}. Abrir detalhes.`}
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
      aria-label={`${kindLabels[point.kind]}: ${point.label}`}
      className={className}
      role="img"
      style={calculateMarkerPosition(point, bounds)}
    >
      {markerContent}
    </span>
  );
}

export function TripMap({
  points,
  title,
}: {
  points: readonly TripMapPoint[];
  title: string;
}) {
  const validPoints = points.filter(isValidTripMapPoint);
  const bounds = deriveTripMapBounds(validPoints);

  if (!bounds) {
    return (
      <section aria-labelledby="trip-map-title" className={styles.emptyState}>
        <p className={styles.eyebrow}>Contexto espacial</p>
        <h2 id="trip-map-title">Mapa ainda indisponível</h2>
        <p>
          Informe as coordenadas da hospedagem ou aguarde a publicação de lugares com localização
          para visualizar o mapa. As demais áreas da viagem continuam disponíveis normalmente.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="trip-map-title" className={styles.section}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Contexto espacial</p>
          <h2 id="trip-map-title">{title}</h2>
          <p>Use os marcadores para localizar a hospedagem e abrir os detalhes dos lugares.</p>
        </div>
        <ul aria-label="Legenda do mapa" className={styles.legend}>
          {Object.entries(kindLabels).map(([kind, label]) => (
            <li key={kind}>
              <span
                aria-hidden="true"
                className={`${styles.legendDot} ${styles[kind]}`}
              />
              {label}
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
              <span>{kindLabels[point.kind]}</span>
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
