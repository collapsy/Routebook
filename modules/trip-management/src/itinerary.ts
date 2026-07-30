import { randomUUID } from "node:crypto";

import { deriveTripDays } from "./trip-days";
import type { TripPeriod } from "./trip";

export type ActivityType =
  | "place-visit"
  | "meal"
  | "tour"
  | "transport"
  | "rest"
  | "custom"
  | "check-in"
  | "check-out"
  | "free-form";

export type ActivityStatus =
  | "planned"
  | "tentative"
  | "completed"
  | "skipped"
  | "cancelled"
  | "unavailable"
  | "needs-review"
  | "removed";

export type ActivityFlexibility = "fixed" | "flexible" | "suggested";

export type Activity = {
  id: string;
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  flexibility: ActivityFlexibility;
  startTime?: string;
  durationMinutes?: number;
  order: number;
  placeId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ItineraryDay = {
  id: string;
  date: string;
  position: number;
  activities: Activity[];
};

export type Itinerary = {
  id: string;
  tripId: string;
  period: TripPeriod;
  days: ItineraryDay[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateItineraryInput = {
  tripId: string;
  period: TripPeriod;
};

export type AddActivityInput = {
  dayDate: string;
  title: string;
  type?: ActivityType;
  status?: ActivityStatus;
  flexibility?: ActivityFlexibility;
  startTime?: string;
  durationMinutes?: number;
  placeId?: string;
};

export type RemoveActivityInput = {
  activityId: string;
};

export type UpdateActivityInput = {
  activityId: string;
  title: string;
  startTime?: string;
  durationMinutes?: number;
};

export type ItineraryFieldErrors = Partial<
  Record<
    | "tripId"
    | "period"
    | "dayDate"
    | "activityId"
    | "title"
    | "startTime"
    | "durationMinutes"
    | "placeId",
    string
  >
>;

export class ItineraryValidationError extends Error {
  constructor(public readonly fieldErrors: ItineraryFieldErrors) {
    super("O roteiro possui dados inválidos.");
    this.name = "ItineraryValidationError";
  }
}

function isLocalDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isLocalTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;

  const [hours, minutes] = value.split(":").map(Number);
  return hours !== undefined && minutes !== undefined && hours <= 23 && minutes <= 59;
}

function validatePeriod(period: TripPeriod): ItineraryFieldErrors {
  if (!isLocalDate(period.startDate) || !isLocalDate(period.endDate)) {
    return { period: "Informe um período válido para criar o roteiro." };
  }

  if (period.endDate < period.startDate) {
    return { period: "A data final do roteiro não pode ser anterior à data inicial." };
  }

  return {};
}

function validateActivityDetails(
  title: string,
  startTime?: string,
  durationMinutes?: number,
): ItineraryFieldErrors {
  const fieldErrors: ItineraryFieldErrors = {};

  if (!title) fieldErrors.title = "Informe um título para a atividade.";
  if (startTime !== undefined && !isLocalTime(startTime)) {
    fieldErrors.startTime = "Informe um horário válido no formato HH:mm.";
  }
  if (
    durationMinutes !== undefined &&
    (!Number.isInteger(durationMinutes) || durationMinutes <= 0)
  ) {
    fieldErrors.durationMinutes = "A duração deve ser informada em minutos inteiros e positivos.";
  }

  return fieldErrors;
}

export function createItinerary(input: CreateItineraryInput, now = new Date()): Itinerary {
  const tripId = input.tripId.trim();
  const fieldErrors: ItineraryFieldErrors = {
    ...validatePeriod(input.period),
  };

  if (!tripId) fieldErrors.tripId = "A viagem é obrigatória para criar o roteiro.";
  if (Object.keys(fieldErrors).length > 0) {
    throw new ItineraryValidationError(fieldErrors);
  }

  return {
    id: randomUUID(),
    tripId,
    period: { ...input.period },
    days: deriveTripDays(input.period).map((day) => ({
      id: randomUUID(),
      date: day.date,
      position: day.index,
      activities: [],
    })),
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}

export function addActivity(
  itinerary: Itinerary,
  input: AddActivityInput,
  now = new Date(),
): Itinerary {
  const title = input.title.trim();
  const placeId = input.placeId?.trim();
  const targetDay = itinerary.days.find((day) => day.date === input.dayDate);
  const fieldErrors: ItineraryFieldErrors = {
    ...validateActivityDetails(title, input.startTime, input.durationMinutes),
  };

  if (!targetDay) fieldErrors.dayDate = "Selecione um dia válido da viagem.";
  if (input.placeId !== undefined && !placeId) {
    fieldErrors.placeId = "Informe um lugar válido ou remova o vínculo com o lugar.";
  }
  if (Object.keys(fieldErrors).length > 0 || !targetDay) {
    throw new ItineraryValidationError(fieldErrors);
  }

  const activity: Activity = {
    id: randomUUID(),
    title,
    type: input.type ?? "custom",
    status: input.status ?? "planned",
    flexibility: input.flexibility ?? "flexible",
    order: targetDay.activities.length + 1,
    createdAt: now,
    updatedAt: now,
    ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
    ...(input.durationMinutes !== undefined ? { durationMinutes: input.durationMinutes } : {}),
    ...(placeId ? { placeId } : {}),
  };

  return {
    ...itinerary,
    days: itinerary.days.map((day) =>
      day.id === targetDay.id ? { ...day, activities: [...day.activities, activity] } : day,
    ),
    version: itinerary.version + 1,
    updatedAt: now,
  };
}

export function updateActivity(
  itinerary: Itinerary,
  input: UpdateActivityInput,
  now = new Date(),
): Itinerary {
  const activityId = input.activityId.trim();
  const title = input.title.trim();
  const sourceDay = itinerary.days.find((day) =>
    day.activities.some((activity) => activity.id === activityId),
  );
  const fieldErrors: ItineraryFieldErrors = {
    ...validateActivityDetails(title, input.startTime, input.durationMinutes),
  };

  if (!activityId) fieldErrors.activityId = "Informe uma atividade válida.";
  else if (!sourceDay) fieldErrors.activityId = "A atividade não pertence a este roteiro.";

  if (Object.keys(fieldErrors).length > 0 || !sourceDay) {
    throw new ItineraryValidationError(fieldErrors);
  }

  return {
    ...itinerary,
    days: itinerary.days.map((day) => {
      if (day.id !== sourceDay.id) return day;

      return {
        ...day,
        activities: day.activities.map((activity) => {
          if (activity.id !== activityId) return activity;

          const { startTime: _startTime, durationMinutes: _durationMinutes, ...preserved } = activity;
          return {
            ...preserved,
            title,
            updatedAt: now,
            ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
            ...(input.durationMinutes !== undefined
              ? { durationMinutes: input.durationMinutes }
              : {}),
          };
        }),
      };
    }),
    version: itinerary.version + 1,
    updatedAt: now,
  };
}

export function removeActivity(
  itinerary: Itinerary,
  input: RemoveActivityInput,
  now = new Date(),
): Itinerary {
  const activityId = input.activityId.trim();
  const sourceDay = itinerary.days.find((day) =>
    day.activities.some((activity) => activity.id === activityId),
  );
  const fieldErrors: ItineraryFieldErrors = {};

  if (!activityId) fieldErrors.activityId = "Informe uma atividade válida.";
  else if (!sourceDay) fieldErrors.activityId = "A atividade não pertence a este roteiro.";

  if (Object.keys(fieldErrors).length > 0 || !sourceDay) {
    throw new ItineraryValidationError(fieldErrors);
  }

  return {
    ...itinerary,
    days: itinerary.days.map((day) => {
      if (day.id !== sourceDay.id) return day;

      const activities = day.activities
        .filter((activity) => activity.id !== activityId)
        .map((activity, index) => {
          const order = index + 1;
          return activity.order === order ? activity : { ...activity, order, updatedAt: now };
        });

      return { ...day, activities };
    }),
    version: itinerary.version + 1,
    updatedAt: now,
  };
}
