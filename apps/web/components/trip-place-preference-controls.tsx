import type { TripPlacePreference } from "@routebook/trip-collection";

type PreferenceAction = (formData: FormData) => Promise<void>;

export function TripPlacePreferenceControls({
  tripId,
  placeSlug,
  preference,
  action,
}: Readonly<{
  tripId: string;
  placeSlug: string;
  preference?: TripPlacePreference | null;
  action: PreferenceAction;
}>) {
  const currentIntent = preference?.intent;
  const isMustDo = preference?.priority === "MUST_DO";

  const options = [
    { intent: "WANT", label: "Quero ir" },
    { intent: "MAYBE", label: "Talvez" },
    { intent: "NOT_INTERESTED", label: "Não tenho interesse" },
  ] as const;

  return (
    <div aria-label="Preferência para este lugar" className="trip-place-preference-controls">
      <div className="section-heading-row">
        {options.map((option) => (
          <form action={action} key={option.intent}>
            <input name="tripId" type="hidden" value={tripId} />
            <input name="placeSlug" type="hidden" value={placeSlug} />
            <input name="intent" type="hidden" value={option.intent} />
            <button
              aria-pressed={currentIntent === option.intent}
              className={
                currentIntent === option.intent ? "product-button" : "product-secondary-action"
              }
              type="submit"
            >
              {option.label}
            </button>
          </form>
        ))}
      </div>

      {currentIntent === "WANT" ? (
        <form action={action}>
          <input name="tripId" type="hidden" value={tripId} />
          <input name="placeSlug" type="hidden" value={placeSlug} />
          <input name="intent" type="hidden" value="WANT" />
          <input name="priority" type="hidden" value={isMustDo ? "" : "MUST_DO"} />
          <button
            aria-pressed={isMustDo}
            className={isMustDo ? "product-button" : "product-secondary-action"}
            type="submit"
          >
            {isMustDo ? "Imperdível ✓" : "Marcar como imperdível"}
          </button>
        </form>
      ) : null}

      {preference ? (
        <form action={action}>
          <input name="tripId" type="hidden" value={tripId} />
          <input name="placeSlug" type="hidden" value={placeSlug} />
          <input name="intent" type="hidden" value="" />
          <button className="product-secondary-action" type="submit">
            Limpar escolha
          </button>
        </form>
      ) : null}
    </div>
  );
}
