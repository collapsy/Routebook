import { randomUUID } from "node:crypto";

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
    accommodation: accommodationName
      ? {
          name: accommodationName,
          ...(accommodationAddress ? { address: accommodationAddress } : {}),
        }
      : undefined,
    status: "draft",
    participants: [owner],
    contextVersion: 1,
    createdAt: now,
    updatedAt: now,
  };
}
