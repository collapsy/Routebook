import { randomUUID } from "node:crypto";

export const INTEREST_CATEGORIES = [
  "beaches",
  "gastronomy",
  "nightlife",
  "nature",
  "culture",
  "rest",
  "adventure",
  "shopping",
] as const;

export const PACE_OPTIONS = ["relaxed", "balanced", "intense"] as const;
export const TRANSPORT_OPTIONS = [
  "walking",
  "rental-car",
  "ride-hailing",
  "public-transport",
  "mixed",
] as const;

export type InterestCategory = (typeof INTEREST_CATEGORIES)[number];
export type Pace = (typeof PACE_OPTIONS)[number];
export type TransportPreference = (typeof TRANSPORT_OPTIONS)[number];

export type Budget = {
  totalCents: number;
  currency: "BRL";
  kind: "estimate";
};

export type TravelerProfile = {
  id: string;
  tripId: string;
  travelerCount: number;
  interests: InterestCategory[];
  pace?: Pace;
  transportPreference?: TransportPreference;
  budget?: Budget;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SaveTravelerProfileInput = {
  tripId: string;
  travelerCount: number;
  interests: string[];
  pace?: string;
  transportPreference?: string;
  budgetTotalCents?: number;
};

export type TravelerProfileFieldErrors = Partial<
  Record<"travelerCount" | "interests" | "pace" | "transportPreference" | "budget", string>
>;

export class TravelerProfileValidationError extends Error {
  constructor(public readonly fieldErrors: TravelerProfileFieldErrors) {
    super("O contexto da viagem possui dados inválidos.");
    this.name = "TravelerProfileValidationError";
  }
}

function isInterest(value: string): value is InterestCategory {
  return INTEREST_CATEGORIES.includes(value as InterestCategory);
}

function isPace(value: string): value is Pace {
  return PACE_OPTIONS.includes(value as Pace);
}

function isTransport(value: string): value is TransportPreference {
  return TRANSPORT_OPTIONS.includes(value as TransportPreference);
}

export function saveTravelerProfile(
  input: SaveTravelerProfileInput,
  current?: TravelerProfile,
  now = new Date(),
): TravelerProfile {
  const errors: TravelerProfileFieldErrors = {};
  const travelerCount = Number(input.travelerCount);
  const interests = [...new Set(input.interests)].filter(isInterest);

  if (!Number.isInteger(travelerCount) || travelerCount < 1 || travelerCount > 20) {
    errors.travelerCount = "Informe entre 1 e 20 viajantes.";
  }
  if (interests.length !== new Set(input.interests).size) {
    errors.interests = "Uma ou mais opções de interesse são inválidas.";
  }
  if (input.pace && !isPace(input.pace)) errors.pace = "Selecione um ritmo válido.";
  if (input.transportPreference && !isTransport(input.transportPreference)) {
    errors.transportPreference = "Selecione um transporte válido.";
  }
  if (
    input.budgetTotalCents !== undefined &&
    (!Number.isInteger(input.budgetTotalCents) || input.budgetTotalCents <= 0)
  ) {
    errors.budget = "Informe um orçamento estimado maior que zero.";
  }

  if (Object.keys(errors).length > 0) throw new TravelerProfileValidationError(errors);

  return {
    id: current?.id ?? randomUUID(),
    tripId: input.tripId,
    travelerCount,
    interests,
    ...(input.pace && isPace(input.pace) ? { pace: input.pace } : {}),
    ...(input.transportPreference && isTransport(input.transportPreference)
      ? { transportPreference: input.transportPreference }
      : {}),
    ...(input.budgetTotalCents !== undefined
      ? {
          budget: {
            totalCents: input.budgetTotalCents,
            currency: "BRL",
            kind: "estimate",
          },
        }
      : {}),
    version: current ? current.version + 1 : 1,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };
}
