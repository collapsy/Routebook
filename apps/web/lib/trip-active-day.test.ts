import { describe, expect, it } from "vitest";

import {
  formatDateInTimeZone,
  resolvePreferredTripDay,
  resolveTripTodayDate,
} from "./trip-active-day";

const days = [
  { date: "2026-08-22", position: 1 },
  { date: "2026-08-23", position: 2 },
  { date: "2026-08-24", position: 3 },
];

describe("active trip day", () => {
  it("formata a data no timezone informado", () => {
    const instant = new Date("2026-08-23T01:30:00.000Z");

    expect(formatDateInTimeZone(instant, "America/Fortaleza")).toBe("2026-08-22");
    expect(formatDateInTimeZone(instant, "UTC")).toBe("2026-08-23");
  });

  it("identifica hoje somente quando a data pertence ao Período", () => {
    expect(
      resolveTripTodayDate(days, new Date("2026-08-23T12:00:00.000Z"), "America/Fortaleza"),
    ).toBe("2026-08-23");
    expect(
      resolveTripTodayDate(days, new Date("2026-08-21T12:00:00.000Z"), "America/Fortaleza"),
    ).toBeNull();
    expect(
      resolveTripTodayDate(days, new Date("2026-08-25T12:00:00.000Z"), "America/Fortaleza"),
    ).toBeNull();
  });

  it("prioriza seleção explícita válida sobre o Dia atual", () => {
    const selected = resolvePreferredTripDay(
      days,
      "2026-08-24",
      new Date("2026-08-23T12:00:00.000Z"),
      "America/Fortaleza",
    );

    expect(selected?.position).toBe(3);
  });

  it("usa o Dia atual quando não existe seleção explícita", () => {
    const selected = resolvePreferredTripDay(
      days,
      undefined,
      new Date("2026-08-23T12:00:00.000Z"),
      "America/Fortaleza",
    );

    expect(selected?.position).toBe(2);
  });

  it("mantém o primeiro Dia como fallback fora do Período ou com seleção inválida", () => {
    expect(
      resolvePreferredTripDay(
        days,
        undefined,
        new Date("2026-08-20T12:00:00.000Z"),
        "America/Fortaleza",
      )?.position,
    ).toBe(1);

    expect(
      resolvePreferredTripDay(
        days,
        "2026-09-10",
        new Date("2026-08-20T12:00:00.000Z"),
        "America/Fortaleza",
      )?.position,
    ).toBe(1);
  });
});
