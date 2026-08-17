import { describe, expect, it } from "vitest";

import { findPipaPlacePracticalGuide, PIPA_PLACE_GUIDE_SLUGS } from "./pipa-place-guide";

const publishedPipaSlugs = [
  "praia-do-amor",
  "baia-dos-golfinhos",
  "chapadao-de-pipa",
  "centro-gastronomico-de-pipa",
  "avenida-baia-dos-golfinhos-noite",
  "praia-do-centro",
  "praia-do-madeiro",
  "santuario-ecologico-de-pipa",
  "camarao-na-fazenda-pipa",
  "atelier-de-massas",
  "o-tal-do-escondidinho",
  "mirante-sunset-bar",
  "agora-club",
  "praia-das-minas",
  "praia-de-cacimbinhas",
  "praia-de-sibauma",
  "praia-de-tibau-do-sul",
  "caxanga-restaurante",
  "macoco-cozinha-artesanal",
  "aprecie-restaurante",
  "el-farolito",
  "moka-cafes-especiais",
  "caju-cafeteria",
  "sorveteria-real-de-14",
  "pipa-beach-club",
  "lagoa-de-guarairas",
  "tribus-in-pipa",
  "bakana",
  "birring-in-paradise",
  "umi-bar",
] as const;

describe("Pipa Place practical guide", () => {
  it("covers exactly the 30 published Pipa slugs", () => {
    expect([...PIPA_PLACE_GUIDE_SLUGS].sort()).toEqual([...publishedPipaSlugs].sort());
  });

  it.each(publishedPipaSlugs)("provides actionable and dated guidance for %s", (slug) => {
    const guide = findPipaPlacePracticalGuide(slug);

    expect(guide).toBeDefined();
    expect(guide?.goodFor.length).toBeGreaterThan(20);
    expect(guide?.suggestedDuration).toMatch(/orientação|hora|minuto/i);
    expect(guide?.bestWindow.length).toBeGreaterThan(10);
    expect(guide?.access.length).toBeGreaterThan(10);
    expect(guide?.checks.length).toBeGreaterThanOrEqual(2);
    expect(guide?.reviewedAt).toBe("2026-08-16");

    for (const source of guide?.sources ?? []) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.label.length).toBeGreaterThan(5);
    }
  });

  it("does not invent guidance for an unknown slug", () => {
    expect(findPipaPlacePracticalGuide("lugar-ainda-nao-curado")).toBeUndefined();
  });

  it("flags tide-dependent access for Baía dos Golfinhos", () => {
    const guide = findPipaPlacePracticalGuide("baia-dos-golfinhos");

    expect(guide?.bestWindow).toMatch(/maré/i);
    expect(guide?.checks.join(" ")).toMatch(/tábua de marés/i);
  });

  it("requires same-day verification for a business", () => {
    const guide = findPipaPlacePracticalGuide("camarao-na-fazenda-pipa");

    expect(guide?.checks.join(" ")).toMatch(/confirme.*horário/i);
  });
});
