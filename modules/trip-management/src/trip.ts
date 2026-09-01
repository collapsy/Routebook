import { randomUUID } from "node:crypto";

import { createGeoCoordinate, type GeoCoordinate } from "@routebook/geo-distance";

export type TripStatus =
  "draft" | "planned" | "in-progress" | "completed" | "cancelled" | "archived";
export type TripRole = "owner" | "editor" | "viewer";

export const DESTINATION_TYPES = [
  "city",
  "district",
  "region",
  "island",
  "park",
  "custom-region",
] as const;

export type DestinationType = (typeof DESTINATION_TYPES)[number];

export type Destination = {
  name: string;
  type: DestinationType;
  countryCode: string;
  latitude: number;
  longitude: number;
  timeZone: string;
};

export type TripPeriod = {
  startDate: string;
  endDate: string;
  timeZone: string;
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
  destination: Destination;
  startDate: string;
  endDate: string;
  ownerName: string;
  ownerUserId?: string;
  accommodationName?: string;
  accommodationAddress?: string;
  accommodationLatitude?: number;
  accommodationLongitude?: number;
};

export type UpdateAccommodationInput = {
  accommodationName: string;
  accommodationAddress?: string;
  accommodationLatitude?: number;
  accommodationLongitude?: number;
};

export type TripFieldErrors = Partial<
  Record<keyof CreateTripInput | keyof UpdateAccommodationInput, string>
>;

export class TripValidationError extends Error {
  constructor(public readonly fieldErrors: TripFieldErrors) {
    super("A viagem possui dados inválidos.");
    this.name = "TripValidationError";
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DESTINATION_TYPE_SET = new Set<string>(DESTINATION_TYPES);

function isIanaTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

function normalizeDestination(input: Destination): Destination {
  const name = input.name.trim();
  const countryCode = input.countryCode.trim().toUpperCase();
  const timeZone = input.timeZone.trim();
  const fieldErrors: TripFieldErrors = {};

  if (name.length < 2) fieldErrors.destination = "Informe um destino válido.";
  if (!DESTINATION_TYPE_SET.has(input.type)) {
    fieldErrors.destination = "Informe um tipo de destino válido.";
  }
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    fieldErrors.destination = "Informe um país válido para o destino.";
  }
  try {
    createGeoCoordinate({ latitude: input.latitude, longitude: input.longitude });
  } catch {
    fieldErrors.destination = "Informe coordenadas válidas para o destino.";
  }
  if (!timeZone || !isIanaTimeZone(timeZone)) {
    fieldErrors.destination = "Informe um fuso horário IANA válido para o destino.";
  }

  if (Object.keys(fieldErrors).length > 0) throw new TripValidationError(fieldErrors);

  return {
    name,
    type: input.type,
    countryCode,
    latitude: input.latitude,
    longitude: input.longitude,
    timeZone,
  };
}

function isLocalDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function createAccommodation(input: UpdateAccommodationInput): Accommodation | undefined {
  const accommodationName = input.accommodationName.trim();
  const accommodationAddress = input.accommodationAddress?.trim();
  const hasAccommodationLatitude = input.accommodationLatitude !== undefined;
  const hasAccommodationLongitude = input.accommodationLongitude !== undefined;
  const fieldErrors: TripFieldErrors = {};

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
  if (input.accommodationLatitude !== undefined && input.accommodationLongitude !== undefined) {
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
  if (!accommodationName) return undefined;

  return {
    name: accommodationName,
    ...(accommodationAddress ? { address: accommodationAddress } : {}),
    ...(accommodationCoordinate ? { coordinate: accommodationCoordinate } : {}),
  };
}

export function createTrip(input: CreateTripInput, now = new Date()): Trip {
  const name = input.name.trim();
  const destination = normalizeDestination(input.destination);
  const ownerName = input.ownerName.trim();
  const ownerUserId = input.ownerUserId?.trim();
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
  if (ownerUserId !== undefined && !UUID_PATTERN.test(ownerUserId)) {
    fieldErrors.ownerUserId = "Informe um identificador válido para o responsável pela viagem.";
  }
  if (Object.keys(fieldErrors).length > 0) throw new TripValidationError(fieldErrors);

  const accommodation = createAccommodation({
    accommodationName: input.accommodationName ?? "",
    ...(input.accommodationAddress !== undefined
      ? { accommodationAddress: input.accommodationAddress }
      : {}),
    ...(input.accommodationLatitude !== undefined
      ? { accommodationLatitude: input.accommodationLatitude }
      : {}),
    ...(input.accommodationLongitude !== undefined
      ? { accommodationLongitude: input.accommodationLongitude }
      : {}),
  });
  const owner: TripParticipant = {
    userId: ownerUserId ?? randomUUID(),
    displayName: ownerName,
    role: "owner",
  };

  return {
    id: randomUUID(),
    name,
    destination,
    period: {
      startDate: input.startDate,
      endDate: input.endDate,
      timeZone: destination.timeZone,
    },
    ...(accommodation ? { accommodation } : {}),
    status: "draft",
    participants: [owner],
    contextVersion: 1,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTripAccommodation(
  trip: Trip,
  input: UpdateAccommodationInput,
  now = new Date(),
): Trip {
  const accommodation = createAccommodation(input);

  if (accommodation) {
    return {
      ...trip,
      accommodation,
      contextVersion: trip.contextVersion + 1,
      updatedAt: now,
    };
  }

  const updatedTrip: Trip = {
    ...trip,
    contextVersion: trip.contextVersion + 1,
    updatedAt: now,
  };
  delete updatedTrip.accommodation;
  return updatedTrip;
}
