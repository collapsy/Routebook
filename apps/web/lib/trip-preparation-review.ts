import type { TravelerProfile } from "@routebook/traveler-profile";
import type { TripPlacePreference } from "@routebook/trip-collection";
import type { Trip } from "@routebook/trip-management";

export type TripPreparationReviewModel = Readonly<{
  trip: Readonly<{
    id: string;
    destinationName: string;
    startDate: string;
    endDate: string;
    accommodationName: string | null;
  }>;
  selection: Readonly<{
    evaluated: number;
    WANT: number;
    MAYBE: number;
    NOT_INTERESTED: number;
    mustDo: number;
    considered: number;
  }>;
  context: Readonly<{
    travelerCount: number | null;
    interests: readonly string[] | null;
    pace: string | null;
    transportPreference: string | null;
    budgetTotalCents: number | null;
    missingOptional: readonly string[];
  }>;
}>;

export function deriveTripPreparationReviewModel({
  trip,
  profile,
  preferences,
}: Readonly<{
  trip: Trip;
  profile: TravelerProfile | null;
  preferences: readonly TripPlacePreference[];
}>): TripPreparationReviewModel {
  const selection = preferences.reduce(
    (summary, preference) => {
      summary[preference.intent] += 1;
      if (preference.priority === "MUST_DO") summary.mustDo += 1;
      return summary;
    },
    { WANT: 0, MAYBE: 0, NOT_INTERESTED: 0, mustDo: 0 },
  );

  const missingOptional: string[] = [];
  if (!profile?.pace) missingOptional.push("ritmo");
  if (!profile?.transportPreference) missingOptional.push("transporte");
  if (!profile?.budget) missingOptional.push("orçamento");

  return Object.freeze({
    trip: Object.freeze({
      id: trip.id,
      destinationName: trip.destination.name,
      startDate: trip.period.startDate,
      endDate: trip.period.endDate,
      accommodationName: trip.accommodation?.name ?? null,
    }),
    selection: Object.freeze({
      evaluated: preferences.length,
      ...selection,
      considered: selection.WANT + selection.MAYBE,
    }),
    context: Object.freeze({
      travelerCount: profile?.travelerCount ?? null,
      interests: profile ? Object.freeze([...profile.interests]) : null,
      pace: profile?.pace ?? null,
      transportPreference: profile?.transportPreference ?? null,
      budgetTotalCents: profile?.budget?.totalCents ?? null,
      missingOptional: Object.freeze(missingOptional),
    }),
  });
}
