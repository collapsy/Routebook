"use client";

import { useEffect, useRef, useState } from "react";

import type { DestinationSuggestion } from "@/lib/destination-suggestions";

type SuggestionsPayload = Readonly<{
  enabled?: boolean;
  suggestions?: readonly DestinationSuggestion[];
  attribution?: string;
  message?: string;
  error?: string;
}>;

type SuggestionState = "idle" | "loading" | "ready" | "empty" | "disabled" | "error";

function createSessionToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
}

function isSuggestion(value: unknown): value is DestinationSuggestion {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<DestinationSuggestion>;
  return (
    typeof candidate.reference === "string" &&
    candidate.reference.length > 0 &&
    typeof candidate.label === "string" &&
    candidate.label.length > 0 &&
    typeof candidate.primaryText === "string" &&
    candidate.primaryText.length > 0 &&
    (candidate.secondaryText === undefined || typeof candidate.secondaryText === "string") &&
    (candidate.provider === "google" || candidate.provider === "fixture")
  );
}

export function DestinationCombobox({
  invalid = false,
  describedBy,
  resetSelectionToken,
}: Readonly<{
  invalid?: boolean;
  describedBy?: string | undefined;
  resetSelectionToken?: string | undefined;
}>) {
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<DestinationSuggestion | undefined>();
  const [suggestions, setSuggestions] = useState<readonly DestinationSuggestion[]>([]);
  const [state, setState] = useState<SuggestionState>("idle");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [attribution, setAttribution] = useState<string | undefined>();
  const [sessionToken, setSessionToken] = useState(createSessionToken);
  const requestSequence = useRef(0);
  const lastResetSelectionToken = useRef(resetSelectionToken);
  const listboxId = "destination-suggestions-listbox";

  useEffect(() => {
    if (!resetSelectionToken || resetSelectionToken === lastResetSelectionToken.current) return;

    lastResetSelectionToken.current = resetSelectionToken;
    requestSequence.current += 1;
    setSelected(undefined);
    setSuggestions([]);
    setActiveIndex(-1);
    setAttribution(undefined);
    setSessionToken(createSessionToken());
    setState("idle");
  }, [resetSelectionToken]);

  useEffect(() => {
    const query = value.trim();
    if (selected?.label === value || query.length < 3) return;

    const sequence = ++requestSequence.current;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setState("loading");
      const queryParameters = new URLSearchParams({
        q: query,
        sessionToken,
      });

      void fetch(`/api/destination-suggestions?${queryParameters}`, {
        signal: controller.signal,
        cache: "no-store",
      })
        .then(async (response) => {
          const payload = (await response.json()) as SuggestionsPayload;
          if (!response.ok) throw new Error(payload.error || "destination-suggestions-failed");
          return payload;
        })
        .then((payload) => {
          if (sequence !== requestSequence.current) return;
          if (payload.enabled === false) {
            setSuggestions([]);
            setActiveIndex(-1);
            setAttribution(undefined);
            setState("disabled");
            return;
          }

          const nextSuggestions = Array.isArray(payload.suggestions)
            ? payload.suggestions.filter(isSuggestion).slice(0, 5)
            : [];
          setSuggestions(nextSuggestions);
          setActiveIndex(nextSuggestions.length > 0 ? 0 : -1);
          setAttribution(payload.attribution);
          setState(nextSuggestions.length > 0 ? "ready" : "empty");
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted || sequence !== requestSequence.current) return;
          console.warn("Falha ao buscar sugestões de destinos", error);
          setSuggestions([]);
          setActiveIndex(-1);
          setAttribution(undefined);
          setState("error");
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [selected?.label, sessionToken, value]);

  const selectSuggestion = (suggestion: DestinationSuggestion) => {
    setValue(suggestion.label);
    setSelected(suggestion);
    setSuggestions([]);
    setActiveIndex(-1);
    setAttribution(suggestion.provider === "google" ? "Google Maps" : undefined);
    setState("idle");
  };

  const clearSelectionForEdit = (nextValue: string) => {
    setValue(nextValue);
    setSelected(undefined);
    setSuggestions([]);
    setActiveIndex(-1);
    setAttribution(undefined);
    setState("idle");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const suggestion = suggestions[activeIndex];
      if (suggestion) selectSuggestion(suggestion);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setSuggestions([]);
      setActiveIndex(-1);
      setState("idle");
    }
  };

  const statusMessage =
    state === "loading"
      ? "Buscando destinos…"
      : state === "empty"
        ? "Nenhum destino encontrado. Tente incluir cidade, estado ou país."
        : state === "disabled"
          ? "As sugestões automáticas não estão disponíveis neste ambiente. Seu texto fica preservado para a busca textual disponível."
          : state === "error"
            ? "Não foi possível carregar sugestões agora. Seu texto foi preservado."
            : selected
              ? `Destino selecionado: ${selected.label}`
              : "Digite pelo menos 3 caracteres para ver sugestões.";

  return (
    <div className="destination-combobox">
      <input
        aria-activedescendant={
          activeIndex >= 0 && suggestions[activeIndex]
            ? `destination-suggestion-${activeIndex}`
            : undefined
        }
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-describedby={describedBy}
        aria-expanded={suggestions.length > 0}
        aria-invalid={invalid}
        autoComplete="off"
        id="destination"
        name="destination"
        onChange={(event) => clearSelectionForEdit(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ex.: São Paulo, SP"
        required
        role="combobox"
        type="text"
        value={value}
      />

      <input name="destinationProvider" type="hidden" value={selected?.provider ?? ""} />
      <input name="destinationReference" type="hidden" value={selected?.reference ?? ""} />
      <input name="destinationSelectedLabel" type="hidden" value={selected?.label ?? ""} />
      <input name="destinationSessionToken" type="hidden" value={sessionToken} />

      {suggestions.length > 0 ? (
        <div
          aria-label="Sugestões de destinos"
          className="destination-suggestions"
          id={listboxId}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <button
              aria-selected={index === activeIndex}
              className="destination-suggestion"
              id={`destination-suggestion-${index}`}
              key={`${suggestion.provider}:${suggestion.reference}`}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectSuggestion(suggestion)}
              role="option"
              type="button"
            >
              <strong>{suggestion.primaryText}</strong>
              {suggestion.secondaryText ? <span>{suggestion.secondaryText}</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      {attribution === "Google Maps" ? (
        <p className="destination-attribution" translate="no">
          Google Maps
        </p>
      ) : null}

      <p
        aria-live="polite"
        className="field-hint destination-status"
        id="destination-suggestions-status"
      >
        {statusMessage}
      </p>
    </div>
  );
}
