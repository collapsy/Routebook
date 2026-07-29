import { randomUUID } from "node:crypto";

import { createGeoCoordinate, type GeoCoordinate } from "@routebook/geo-distance";

export type TripStatus =
  "draft" | "planned" | "in-progress" | "completed" | "cancelled" | "archived";
export type TripRole = "owner" | "editor" | "viewer";

export type Destination = {
  name: string;
  type: "district";
  countryCode: "BR";
  latitude: number;
  longitude: number;
  timeZone: "America/Fortaleza";
};

export type TripPeriod = {
  startDate: string;
  endDate: string;
  timeZone: "America/Fortaleza";
};

export type Accommodation = {
  name: string;
  address?: string;
  coordinate?: GeoCoordinate;
};

export type TripParticipant = {
  userId: string;
  displayName: string;
  role: TripRole;
};

export type Trip = {
  id: string;
  name: string;
  destination: Destination;
  period: TripPeriod;
  accommodation?: Accommodation;
  status: TripStatus;
  participants: TripParticipant[];
  contextVersion: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTripInput = {
  name: string;
  startDate: string;
  endDate: string;
  ownerName: string;
  accommodationName?: string;
  accommodationAddress?: string;
  accommodationLatitude?: number;
  accommodationLongitude?: number;
};

export type TripFieldErrors = Partial<Record<keyof CreateTripInput, string>>;

export class TripValidationError extends Error {
  constructor(public readonly fieldErrors: TripFieldErrors) {
    super("A viagem possui dados inválidos.");
    this.name = "TripValidationError";
  }
}

const PIPA_DESTINATION: Destination = {
  name: "Pipa, Tibau do Sul - RN",
  type: "district",
  countryCode: "BR",
  latitude: -6.2302,
  longitude: -35.0503,
  timeZone: "America/Fortaleza",
};

function isLocalDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function createTrip(input: CreateTripInput, now = new Date()): Trip {
  const name = input.name.trim();
  const ownerName = input.ownerName.trim();
  const accommodationName = input.accommodationName?.trim();
  const accommodationAddress = input.accommodationAddress?.trim();
  const hasAccommodationLatitude = input.accommodationLatitude !== undefined;
  const hasAccommodationLongitude = input.accommodationLongitude !== undefined;
  const fieldErrors: TripFieldErrors = {};

  if (name.length < 3) fieldErrors.name = "Informe um nome com pelo menos 3 caracteres.";
  if (!isLocalDate(input.startDate)) fieldErrors.startDate = "Informe uma data inicial válida.";
  if (!isLocalDate(input.endDate)) fieldErrors.endDate = "Informe uma data final válida.";
  if (
    isLocalDate(input.startDate) &&
    isLocalDate(input.endDate) &&
    input.endDate < input.startDate
  ) {
    fieldErrors.endDate = "A data final não pode ser anterior à data inicial.";
  }
  if (ownerName.length < 2) fieldErrors.ownerName = "Informe o nome do responsável pela viagem.";
  if (accommodationAddress && !accommodationName) {
    fieldErrors.accommodationName = "Informe o nome da hospedagem antes do endereço.";
  }
  if ((hasAccommodationLatitude || hasAccommodationLongitude) && !accommodationName) {
    fieldErrors.accommodationName = "Informe o nome da hospedagem antes das coordenadas.";
  }
  if (hasAccommodationLatitude !== hasAccommodationLongitude) {
    if (!hasAccommodationLatitude) {
      fieldErrors.accommodationLatitude = "Informe latitude e longitude da hospedagem juntas.";
    }
    if (!hasAccommodationLongitude) {
      fieldErrors.accommodationLongitude = "Informe latitude e longitude da hospedagem juntas.";
    }
  }

  let accommodationCoordinate: GeoCoordinate | undefined;
  if (hasAccommodationLatitude && hasAccommodationLongitude) {
    try {
      accommodationCoordinate = createGeoCoordinate({
        latitude: input.accommodationLatitude,
        longitude: input.accommodationLongitude,
      });
    } catch {
      fieldErrors.accommodationLatitude = "Informe uma latitude válida entre -90 e 90.";
      fieldErrors.accommodationLongitude = "Informe uma longitude válida entre -180 e 180.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) throw new TripValidationError(fieldErrors);

  const owner: TripParticipant = {
    userId: randomUUID(),
    displayName: ownerName,
    role: "owner",
  };

  return {
    id: randomUUID(),
    name,
    destination: PIPA_DESTINATION,
    period: {
      startDate: input.startDate,
      endDate: input.endDate,
      timeZone: PIPA_DESTINATION.timeZone,
    },
    ...(accommodationName
      ? {
          accommodation: {
            name: accommodationName,
            ...(accommodationAddress ? { address: accommodationAddress } : {}),
            ...(accommodationCoordinate ? { coordinate: accommodationCoordinate } : {}),
          },
        }
      : {}),
    status: "draft",
    participants: [owner],
    contextVersion: 1,
    createdAt: now,
    updatedAt: now,
  };
}
