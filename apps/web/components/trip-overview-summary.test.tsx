import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TripCard } from "./trip-card";

describe("TripCard", () => {
  it("oferece abertura da viagem e apresenta o contexto básico", () => {
    render(
      <TripCard
        trip={{
          id: "11111111-1111-4111-8111-111111111111",
          name: "Pipa em agosto",
          destination: {
            name: "Pipa, Tibau do Sul - RN",
            type: "district",
            countryCode: "BR",
            latitude: -6.2302,
            longitude: -35.0503,
            timeZone: "America/Fortaleza",
          },
          period: {
            startDate: "2026-08-22",
            endDate: "2026-08-29",
            timeZone: "America/Fortaleza",
          },
          status: "draft",
          participants: [
            {
              userId: "22222222-2222-4222-8222-222222222222",
              displayName: "Ronaldo",
              role: "owner",
            },
          ],
          contextVersion: 1,
          createdAt: new Date("2026-07-28T12:00:00Z"),
          updatedAt: new Date("2026-07-28T12:00:00Z"),
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Abrir viagem" })).toHaveAttribute(
      "href",
      "/viagens/11111111-1111-4111-8111-111111111111",
    );
    expect(screen.getByText("Ainda não informada")).toBeInTheDocument();
    expect(screen.getByText("Ronaldo")).toBeInTheDocument();
  });
});
