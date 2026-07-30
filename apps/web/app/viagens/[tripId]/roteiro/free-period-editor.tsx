"use client";

import { useParams } from "next/navigation";

import type { FreePeriodMode } from "@routebook/trip-management";

import { updateItineraryFreePeriodAction } from "./actions";
import styles from "./free-periods.module.css";

export function FreePeriodEditor({
  freePeriodId,
  mode,
  startTime,
  durationMinutes,
}: {
  freePeriodId: string;
  mode: FreePeriodMode;
  startTime?: string;
  durationMinutes?: number;
}) {
  const { tripId } = useParams<{ tripId: string }>();

  return (
    <details className={styles.editDisclosure}>
      <summary aria-label={`Editar período livre ${freePeriodId}`}>Editar</summary>
      <form
        action={updateItineraryFreePeriodAction}
        aria-label={`Editar período livre ${freePeriodId}`}
        className={styles.editForm}
      >
        <input name="tripId" type="hidden" value={tripId} />
        <input name="freePeriodId" type="hidden" value={freePeriodId} />

        <div className={styles.field}>
          <label htmlFor={`free-period-mode-${freePeriodId}`}>Proteção do espaço</label>
          <select
            defaultValue={mode}
            id={`free-period-mode-${freePeriodId}`}
            name="freePeriodMode"
            required
          >
            <option value="flexible">Flexível — pode receber sugestões</option>
            <option value="protected">Protegido — preservar sem preenchimento automático</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor={`free-period-time-${freePeriodId}`}>
            Horário do período livre (opcional)
          </label>
          <input
            defaultValue={startTime ?? ""}
            id={`free-period-time-${freePeriodId}`}
            name="freePeriodStartTime"
            type="time"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`free-period-duration-${freePeriodId}`}>
            Duração do período livre (opcional)
          </label>
          <input
            defaultValue={durationMinutes ?? ""}
            id={`free-period-duration-${freePeriodId}`}
            min={1}
            name="freePeriodDurationMinutes"
            step={1}
            type="number"
          />
        </div>

        <button className="product-button" type="submit">
          Salvar período livre
        </button>
      </form>
    </details>
  );
}
