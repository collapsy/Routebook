import type {
  TripPlaceIntent,
  TripPlacePreference,
} from "@routebook/trip-collection";

type PreferenceAction = (formData: FormData) => Promise<void> | Promise<never>;

type TripPlacePreferenceControlsProps = Readonly<{
  tripId: string;
  placeSlug: string;
  placeName: string;
  preference: TripPlacePreference | null;
  setAction: PreferenceAction;
  clearAction: PreferenceAction;
}>;

export const tripPlaceIntentLabels: Readonly<Record<TripPlaceIntent, string>> = Object.freeze({
  WANT: "Quero ir",
  MAYBE: "Talvez",
  NOT_INTERESTED: "Não tenho interesse",
});

const intents: readonly TripPlaceIntent[] = ["WANT", "MAYBE", "NOT_INTERESTED"];

export function TripPlacePreferenceControls({
  tripId,
  placeSlug,
  placeName,
  preference,
  setAction,
  clearAction,
}: TripPlacePreferenceControlsProps) {
  return (
    <div aria-label={`Preferência para ${placeName}`}>
      <div className="section-heading-row">
        {intents.map((intent) => {
          const selected = preference?.intent === intent;

          return (
            <form action={setAction} key={intent}>
              <input name="tripId" type="hidden" value={tripId} />
              <input name="placeSlug" type="hidden" value={placeSlug} />
              <input name="intent" type="hidden" value={intent} />
              <button
                aria-pressed={selected}
                className="product-secondary-action"
                disabled={selected}
                type="submit"
              >
                {tripPlaceIntentLabels[intent]}
              </button>
            </form>
          );
        })}
      </div>

      {preference?.intent === "WANT" ? (
        <form action={setAction}>
          <input name="tripId" type="hidden" value={tripId} />
          <input name="placeSlug" type="hidden" value={placeSlug} />
          <input name="intent" type="hidden" value="WANT" />
          {preference.priority === "MUST_DO" ? null : (
            <input name="priority" type="hidden" value="MUST_DO" />
          )}
          <button
            aria-pressed={preference.priority === "MUST_DO"}
            className="product-secondary-action"
            type="submit"
          >
            {preference.priority === "MUST_DO" ? "Remover Imperdível" : "Marcar como Imperdível"}
          </button>
        </form>
      ) : null}

      {preference ? (
        <form action={clearAction}>
          <input name="tripId" type="hidden" value={tripId} />
          <input name="placeSlug" type="hidden" value={placeSlug} />
          <button className="product-secondary-action" type="submit">
            Limpar preferência
          </button>
        </form>
      ) : null}
    </div>
  );
}
