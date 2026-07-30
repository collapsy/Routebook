import {
  ItineraryValidationError,
  type Itinerary,
  type ItineraryFieldErrors,
} from "./itinerary";

export type RemoveFreePeriodInput = {
  freePeriodId: string;
};

export function removeFreePeriod(
  itinerary: Itinerary,
  input: RemoveFreePeriodInput,
  now = new Date(),
): Itinerary {
  const freePeriodId = input.freePeriodId.trim();
  const sourceDay = itinerary.days.find((day) =>
    day.freePeriods.some((freePeriod) => freePeriod.id === freePeriodId),
  );
  const fieldErrors: ItineraryFieldErrors = {};

  if (!freePeriodId) fieldErrors.freePeriodId = "Informe um período livre válido.";
  else if (!sourceDay) {
    fieldErrors.freePeriodId = "O período livre não pertence a este roteiro.";
  }

  if (Object.keys(fieldErrors).length > 0 || !sourceDay) {
    throw new ItineraryValidationError(fieldErrors);
  }

  return {
    ...itinerary,
    days: itinerary.days.map((day) => {
      if (day.id !== sourceDay.id) return day;

      const freePeriods = day.freePeriods
        .filter((freePeriod) => freePeriod.id !== freePeriodId)
        .map((freePeriod, index) => {
          const order = index + 1;
          return freePeriod.order === order
            ? freePeriod
            : { ...freePeriod, order, updatedAt: now };
        });

      return { ...day, freePeriods };
    }),
    version: itinerary.version + 1,
    updatedAt: now,
  };
}
