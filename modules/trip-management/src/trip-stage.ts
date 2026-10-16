import { randomUUID } from "node:crypto";

import { createGeoCoordinate } from "@routebook/geo-distance";

import { DESTINATION_TYPES, type Destination, type Trip } from "./trip";

export type TripStage = Readonly<{
  id: string;
  tripId: string;
  destination: Destination;
  startDate: string;
  endDate: string;
  createdAt: Date;
}>;

export type CreateTripStageInput = Readonly<{
  destination: Destination;
  startDate: string;
  endDate: string;
}>;

export type TripStageFieldErrors = Partial<Record<"destination" | "startDate" | "endDate", string>>;

export class TripStageValidationError extends Error {
  constructor(public readonly fieldErrors: TripStageFieldErrors) {
    super("A etapa da viagem possui dados inválidos.");
    this.name = "TripStageValidationError";
  }
}

function validLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function createTripStage(
  trip: Pick<Trip, "id" | "period">,
  input: CreateTripStageInput,
  now = new Date(),
): TripStage {
  const fieldErrors: TripStageFieldErrors = {};
  const destination: Destination = {
    ...input.destination,
    name: input.destination.name.trim(),
    countryCode: input.destination.countryCode.trim().toUpperCase(),
    timeZone: input.destination.timeZone.trim(),
  };

  if (
    destination.name.length < 2 ||
    !DESTINATION_TYPES.includes(destination.type) ||
    !/^[A-Z]{2}$/.test(destination.countryCode) ||
    !validTimeZone(destination.timeZone) ||
    destination.timeZone !== trip.period.timeZone
  ) {
    fieldErrors.destination = "Selecione um destino válido para a etapa.";
  }
  try {
    createGeoCoordinate({ latitude: destination.latitude, longitude: destination.longitude });
  } catch {
    fieldErrors.destination = "Selecione um destino com localização válida.";
  }

  if (!validLocalDate(input.startDate) || input.startDate < trip.period.startDate) {
    fieldErrors.startDate = "Escolha uma data inicial dentro da viagem.";
  }
  if (
    !validLocalDate(input.endDate) ||
    input.endDate > trip.period.endDate ||
    input.endDate < input.startDate
  ) {
    fieldErrors.endDate = "Escolha uma data final dentro da viagem.";
  }
  if (Object.keys(fieldErrors).length > 0) throw new TripStageValidationError(fieldErrors);

  return {
    id: randomUUID(),
    tripId: trip.id,
    destination,
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: new Date(now.getTime()),
  };
}

export function stagesForDate(stages: readonly TripStage[], date: string): TripStage[] {
  return stages.filter((stage) => stage.startDate <= date && date <= stage.endDate);
}
