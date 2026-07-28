import { describe, expect, it } from "vitest";

import { deriveTripDays } from "./trip-days";

describe("deriveTripDays", () => {
  it("deriva todos os dias do período de forma inclusiva", () => {
    expect(
      deriveTripDays({
        startDate: "2026-08-22",
        endDate: "2026-08-29",
        timeZone: "America/Fortaleza",
      }),
    ).toEqual([
      { index: 1, date: "2026-08-22" },
      { index: 2, date: "2026-08-23" },
      { index: 3, date: "2026-08-24" },
      { index: 4, date: "2026-08-25" },
      { index: 5, date: "2026-08-26" },
      { index: 6, date: "2026-08-27" },
      { index: 7, date: "2026-08-28" },
      { index: 8, date: "2026-08-29" },
    ]);
  });
});
