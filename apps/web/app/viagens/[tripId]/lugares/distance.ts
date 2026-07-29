import { calculateGeodesicDistance, createGeoCoordinate } from "@routebook/geo-distance";

export type AccommodationDistancePresentation = {
  label: string;
  description: string;
};

export function presentAccommodationDistance(
  accommodationCoordinate: { latitude: number; longitude: number } | undefined,
  placeCoordinate: { latitude: number; longitude: number },
): AccommodationDistancePresentation | null {
  if (!accommodationCoordinate) return null;

  const distance = calculateGeodesicDistance(
    createGeoCoordinate(accommodationCoordinate),
    createGeoCoordinate(placeCoordinate),
  );

  const label =
    distance.meters < 1_000
      ? `${Math.round(distance.meters)} m`
      : `${new Intl.NumberFormat("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(distance.kilometers)} km`;

  return {
    label,
    description: "Distância estimada em linha reta a partir da hospedagem.",
  };
}
