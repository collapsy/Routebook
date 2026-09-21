"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { TripPlaceIntent, TripPlacePriority } from "@routebook/trip-collection";

import type { TripPlacePreferenceActionState } from "@/lib/trip-place-preference";

import styles from "./trip-place-preference-controls.module.css";

type PreferenceAction = (formData: FormData) => Promise<TripPlacePreferenceActionState>;

type Props = Readonly<{
  label: string;
  fields: Readonly<Record<string, string | undefined>>;
  currentIntent?: TripPlaceIntent | undefined;
  currentPriority?: TripPlacePriority | null | undefined;
  setAction: PreferenceAction;
  clearAction?: PreferenceAction;
  mustDoAction?: PreferenceAction;
  refreshOnSuccess?: boolean;
  className?: string | undefined;
}>;

const intentLabels: Readonly<Record<TripPlaceIntent, string>> = Object.freeze({
  WANT: "Quero ir",
  MAYBE: "Talvez",
  NOT_INTERESTED: "Não tenho interesse",
});

const subscribeToHydration = () => () => undefined;

function createFormData(
  fields: Props["fields"],
  values: Readonly<Record<string, string>>,
): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    if (value !== undefined) formData.set(name, value);
  }
  for (const [name, value] of Object.entries(values)) formData.set(name, value);
  return formData;
}

export function TripPlacePreferenceControls({
  label,
  fields,
  currentIntent,
  currentPriority = null,
  setAction,
  clearAction,
  mustDoAction,
  refreshOnSuccess = true,
  className,
}: Props) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [intent, setIntent] = useState<TripPlaceIntent | undefined>(currentIntent);
  const [priority, setPriority] = useState<TripPlacePriority | null>(currentPriority);
  const [feedback, setFeedback] = useState<TripPlacePreferenceActionState | null>(null);
  const [pendingOperation, setPendingOperation] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function mutate(
    operation: string,
    action: PreferenceAction,
    values: Readonly<Record<string, string>>,
  ) {
    if (isPending) return;

    const previousIntent = intent;
    const previousPriority = priority;
    if (operation === "clear") {
      setIntent(undefined);
      setPriority(null);
    } else if (operation === "must-do") {
      setPriority(values.enabled === "1" ? "MUST_DO" : null);
    } else {
      const nextIntent = values.intent as TripPlaceIntent;
      setIntent(nextIntent);
      if (nextIntent !== "WANT") setPriority(null);
    }
    setFeedback(null);
    setPendingOperation(operation);

    startTransition(async () => {
      try {
        const result = await action(createFormData(fields, values));
        setFeedback(result);
        if (result.status === "error") {
          setIntent(previousIntent);
          setPriority(previousPriority);
          return;
        }

        setIntent(result.preference?.intent);
        setPriority(result.preference?.priority ?? null);
        if (refreshOnSuccess) router.refresh();
      } catch {
        setIntent(previousIntent);
        setPriority(previousPriority);
        setFeedback({
          status: "error",
          message: "Não foi possível atualizar sua preferência agora. Tente novamente.",
        });
      } finally {
        setPendingOperation(null);
      }
    });
  }

  const disabled = !hydrated || isPending;

  return (
    <div
      aria-busy={isPending}
      aria-label={label}
      className={[styles.controls, className].filter(Boolean).join(" ")}
      data-trip-place-preference-controls="true"
    >
      {(["WANT", "MAYBE", "NOT_INTERESTED"] as const).map((nextIntent) => (
        <button
          aria-pressed={intent === nextIntent}
          className="product-secondary-action"
          disabled={disabled}
          key={nextIntent}
          onClick={() => mutate(nextIntent, setAction, { intent: nextIntent })}
          type="button"
        >
          {pendingOperation === nextIntent ? "Atualizando…" : intentLabels[nextIntent]}
        </button>
      ))}

      {mustDoAction ? (
        intent === "WANT" ? (
          <button
            aria-pressed={priority === "MUST_DO"}
            className="product-secondary-action"
            disabled={disabled}
            onClick={() =>
              mutate("must-do", mustDoAction, { enabled: priority === "MUST_DO" ? "0" : "1" })
            }
            type="button"
          >
            {pendingOperation === "must-do"
              ? "Atualizando…"
              : priority === "MUST_DO"
                ? "Remover de Imperdíveis"
                : "Marcar como Imperdível"}
          </button>
        ) : (
          <button
            aria-hidden="true"
            className={["product-secondary-action", styles.placeholder].join(" ")}
            data-must-do-placeholder="true"
            disabled
            tabIndex={-1}
            type="button"
          >
            Marcar como Imperdível
          </button>
        )
      ) : null}

      {intent && clearAction ? (
        <button
          className="product-inline-link"
          disabled={disabled}
          onClick={() => mutate("clear", clearAction, {})}
          type="button"
        >
          {pendingOperation === "clear" ? "Limpando…" : "Limpar preferência"}
        </button>
      ) : null}

      {feedback ? (
        <p
          aria-live="polite"
          className={[styles.status, feedback.status === "error" ? styles.error : ""]
            .filter(Boolean)
            .join(" ")}
          role={feedback.status === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
