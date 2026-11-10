import { describe, expect, it } from "vitest";
import { discoveryQuery, discoveryReturnHref } from "./discovery-navigation";

describe("Discovery navigation", () => {
  it("preserva filtros sem repetir banners de mutações", () => {
    expect(
      discoveryQuery("etapa=stage&busca=caf%C3%A9&ordem=rating&promocao=salva&erroPromocao=x"),
    ).toBe("etapa=stage&busca=caf%C3%A9&ordem=rating");
  });
  it("não aceita destino externo ou outra Viagem como retorno", () => {
    expect(discoveryReturnHref("trip", "https://example.com/viagens/another?next=evil")).toBe(
      "/viagens/trip/lugares",
    );
  });
  it("limita tamanho dos valores", () => {
    expect(discoveryQuery(`busca=${"a".repeat(121)}&dia=2026-11-13`)).toBe("dia=2026-11-13");
  });
});
