"use client";

import { useEffect, useState } from "react";

import type { TripPlaceIntent, TripPlacePriority } from "@routebook/trip-collection";

type Counts = {
  WANT: number;
  MAYBE: number;
  NOT_INTERESTED: number;
  mustDo: number;
};

export type TripPlacePreferenceChangedDetail = Readonly<{
  previousIntent?: TripPlaceIntent;
  nextIntent?: TripPlaceIntent;
  previousPriority?: TripPlacePriority | null;
  nextPriority?: TripPlacePriority | null;
}>;

export const tripPlacePreferenceChangedEvent = "routebook:trip-place-preference-changed";

export function TripPlaceSelectionSummary({
  initialCounts,
}: Readonly<{ initialCounts: Readonly<Counts> }>) {
  const [counts, setCounts] = useState<Counts>({ ...initialCounts });

  useEffect(() => {
    function handlePreferenceChange(event: Event) {
      const detail = (event as CustomEvent<TripPlacePreferenceChangedDetail>).detail;
      setCounts((current) => {
        const next = { ...current };

        if (detail.previousIntent) {
          next[detail.previousIntent] = Math.max(0, next[detail.previousIntent] - 1);
        }
        if (detail.nextIntent) next[detail.nextIntent] += 1;

        const wasMustDo =
          detail.previousIntent === "WANT" && detail.previousPriority === "MUST_DO";
        const isMustDo = detail.nextIntent === "WANT" && detail.nextPriority === "MUST_DO";
        if (wasMustDo && !isMustDo) next.mustDo = Math.max(0, next.mustDo - 1);
        if (!wasMustDo && isMustDo) next.mustDo += 1;

        return next;
      });
    }

    window.addEventListener(tripPlacePreferenceChangedEvent, handlePreferenceChange);
    return () => window.removeEventListener(tripPlacePreferenceChangedEvent, handlePreferenceChange);
  }, []);

  return (
    <dl
      aria-label="Resumo da seleção"
      className="trip-overview-summary"
      data-selection-summary="true"
    >
      <div>
        <dt>Quero ir</dt>
        <dd>{counts.WANT}</dd>
      </div>
      <div>
        <dt>Talvez</dt>
        <dd>{counts.MAYBE}</dd>
      </div>
      <div>
        <dt>Não tenho interesse</dt>
        <dd>{counts.NOT_INTERESTED}</dd>
      </div>
      <div>
        <dt>Imperdíveis</dt>
        <dd>{counts.mustDo}</dd>
      </div>
    </dl>
  );
}
