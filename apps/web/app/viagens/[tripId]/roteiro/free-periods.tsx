import type { FreePeriod, Itinerary } from "@routebook/trip-management";

import { addItineraryFreePeriodAction } from "./actions";
import styles from "./free-periods.module.css";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

function freePeriodLabel(item: FreePeriod): string {
  return item.mode === "protected"
    ? "Período livre protegido"
    : "Período livre flexível";
}

function freePeriodDescription(item: FreePeriod): string {
  const duration = item.durationMinutes
    ? formatDuration(item.durationMinutes)
    : "duração aberta";
  return item.mode === "protected"
    ? `${duration}. Não deve receber sugestões automáticas sem sua confirmação.`
    : `${duration}. Pode receber sugestões futuras, sem alterar o roteiro automaticamente.`;
}

export function FreePeriodComposer({
  itinerary,
  tripId,
}: {
  itinerary: Itinerary;
  tripId: string;
}) {
  return (
    <section
      className={styles.composer}
      aria-labelledby="new-free-period-title"
    >
      <div>
        <p className="product-eyebrow">Espaço intencional</p>
        <h2 id="new-free-period-title">Adicione um período livre</h2>
        <p>
          Preserve descanso, margem de deslocamento ou tempo para decidir
          durante a viagem sem criar uma atividade artificial.
        </p>
      </div>

      <form className={styles.form} action={addItineraryFreePeriodAction}>
        <input name="tripId" type="hidden" value={tripId} />

        <div className={styles.field}>
          <label htmlFor="freePeriodDayDate">Dia da viagem</label>
          <select
            defaultValue={itinerary.days[0]?.date}
            id="freePeriodDayDate"
            name="freePeriodDayDate"
            required
          >
            {itinerary.days.map((day) => (
              <option key={day.id} value={day.date}>
                Dia {day.position} — {formatDate(day.date)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="freePeriodMode">Proteção do espaço</label>
          <select
            defaultValue="flexible"
            id="freePeriodMode"
            name="freePeriodMode"
            required
          >
            <option value="flexible">Flexível — pode receber sugestões</option>
            <option value="protected">
              Protegido — preservar sem preenchimento automático
            </option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="freePeriodStartTime">Horário opcional</label>
          <input
            id="freePeriodStartTime"
            name="freePeriodStartTime"
            type="time"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="freePeriodDurationMinutes">Duração opcional</label>
          <input
            id="freePeriodDurationMinutes"
            min={1}
            name="freePeriodDurationMinutes"
            placeholder="Minutos"
            step={1}
            type="number"
          />
        </div>

        <p className={styles.explanation}>
          Sem horário ou duração, o RouteBook mantém o espaço aberto sem
          inventar limites.
        </p>

        <div className={styles.actions}>
          <span>
            O período será registrado como decisão separada das atividades.
          </span>
          <button className="product-button" type="submit">
            Adicionar período livre
          </button>
        </div>
      </form>
    </section>
  );
}

export function FreePeriodList({
  freePeriods,
  dayId,
}: {
  freePeriods: FreePeriod[];
  dayId: string;
}) {
  if (freePeriods.length === 0) return null;

  return (
    <section
      className={styles.listSection}
      aria-labelledby={`${dayId}-free-periods`}
    >
      <h3 id={`${dayId}-free-periods`}>Períodos livres</h3>
      <ol className={styles.list} aria-label="Períodos livres do dia">
        {freePeriods.map((item) => (
          <li className={styles.item} key={item.id}>
            <span className={styles.time}>
              {item.startTime ?? "Horário aberto"}
            </span>
            <div className={styles.copy}>
              <strong>{freePeriodLabel(item)}</strong>
              <small>{freePeriodDescription(item)}</small>
              <span className={styles.badge}>
                {item.mode === "protected" ? "Protegido" : "Flexível"}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
