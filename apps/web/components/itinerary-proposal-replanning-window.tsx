import type { ItineraryProposal } from "@routebook/proposal-management";

type ReplanningWindowSnapshot = NonNullable<
  NonNullable<ItineraryProposal["generationContext"]>["replanningWindow"]
>;

type Props = Readonly<{
  window: ReplanningWindowSnapshot;
  days: readonly Readonly<{ id: string; date: string; position: number }>[];
}>;

function formatCapture(window: ReplanningWindowSnapshot): string | null {
  const capturedAt = new Date(window.capturedAt);
  if (!Number.isFinite(capturedAt.getTime())) return null;

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: window.timeZone,
    }).format(capturedAt);
  } catch {
    return null;
  }
}

function formatDay(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(parsed);
}

export function ItineraryProposalReplanningWindow({ window, days }: Props) {
  const capturedAtLabel = formatCapture(window);
  const dayById = new Map(days.map((day) => [day.id, day]));
  const eligibleDays = window.eligibleDayIds.map((id) => dayById.get(id));
  const hasUnmatchedDay = eligibleDays.some((day) => !day);

  return (
    <section aria-labelledby="replanning-window-title" aria-live="polite">
      <h2 id="replanning-window-title">Recorte temporal desta proposta</h2>
      {capturedAtLabel ? (
        <p>
          Janela calculada em {capturedAtLabel} ({window.timeZone}; horário local {window.localDate}{" "}
          às {window.localTime}).
        </p>
      ) : (
        <p role="status">Não foi possível exibir o instante de cálculo desta janela.</p>
      )}
      {window.eligibleDayIds.length === 0 ? (
        <p>Nenhum Dia estava elegível para receber mudanças quando a proposta foi gerada.</p>
      ) : hasUnmatchedDay ? (
        <p role="status">
          Não foi possível associar todos os Dias elegíveis ao Roteiro atual. Revise a versão do
          Roteiro antes de decidir.
        </p>
      ) : (
        <>
          <p>Somente estes Dias podiam receber mudanças nesta geração:</p>
          <ul>
            {eligibleDays.flatMap((day) =>
              day
                ? [
                    <li key={day.id}>
                      Dia {day.position} — {formatDay(day.date)}
                    </li>,
                  ]
                : [],
            )}
          </ul>
        </>
      )}
      <p>
        Passado, trecho transcorrido do Dia atual e {window.protectedActivityIds.length}{" "}
        atividade(s) protegida(s) não foram elegíveis para replanejamento.
      </p>
    </section>
  );
}
