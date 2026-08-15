---
id: RB-CTX-139
title: Context Pack do RB-INC-139 — Proximidade da Hospedagem
description: Delimita os contratos, caminhos permitidos e gates para priorizar proximidade da Hospedagem em Discovery e comprovar sua participação em Recommendations.
document_type: implementation-context-pack
owner: Place Catalog and Decision Intelligence
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors: [RouteBook Team]
tags: [implementation, context-pack, place-catalog, recommendation, proximity, m8]
related_documents: [RB-INC-139, RB-CORE-0004, RB-PRD-002, RB-DOM-001, RB-INC-039, RB-INC-041, RB-INC-132, RB-INC-136]
prerequisites: [RB-INC-039, RB-INC-041, RB-INC-132]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-139 — Proximidade da Hospedagem

## 1. Missão do executor

Fortalecer a Hospedagem como referência espacial do Discovery quando suas coordenadas estiverem disponíveis, preservando filtros, determinismo, explicabilidade e o contrato existente de Recommendations sem inventar rota, trânsito ou duração.

## 2. Incremento

- ID: `RB-INC-139`;
- Issue: `#326`;
- branch: `codex/rb-inc-139-accommodation-proximity`;
- base inicial: `7fb470488b93854ee3d4a1859ec02bbe621d31ed`;
- relação com M8: backlog pré-validação vinculado a `#319`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/product/mvp-definition.md`;
5. `docs/domain/domain-model.md`;
6. `docs/implementation/increments/rb-inc-039-deterministic-recommendations.md`;
7. `docs/implementation/increments/rb-inc-041-recommendations-experience.md`;
8. `docs/implementation/increments/rb-inc-132-place-discovery-filters.md`;
9. `docs/implementation/increments/rb-inc-136-m8-real-validation.md`;
10. RB-INC-139 e este Context Pack.

## 4. Invariantes

- estimativa não significa confirmação;
- distância geodésica é linha reta e não representa rota, trânsito, duração ou Meio de transporte;
- Recommendation não é Decision;
- ordenação de Discovery não transforma resultados em Recommendation personalizada;
- filtros definem o conjunto elegível antes da ordenação por proximidade;
- lista e mapa continuam derivados do mesmo conjunto filtrado;
- Places distantes não são excluídos apenas por terem distância maior;
- ausência de coordenada da Hospedagem é um estado válido e não deve bloquear a descoberta;
- mesma entrada deve produzir a mesma ordem;
- a política determinística de Recommendations continua sendo `place-ranking-v1` do RB-INC-039;
- nenhuma evidência técnica deste incremento valida H3 do M8.

## 5. Contratos existentes reutilizados

- `calculateGeodesicDistance` e `createGeoCoordinate` de `@routebook/geo-distance`;
- `filterPlaces` e os filtros do RB-INC-132;
- `Trip.accommodation.coordinate` como referência espacial opcional;
- `generateDeterministicPlaceRecommendations` do RB-INC-039;
- pesos nomeados de distância e desempate por `Place.slug` em Recommendations;
- Reasons, Limitations e Confidence já apresentados pela experiência do RB-INC-041;
- catálogo publicado de Pipa preparado para M8.

## 6. Estratégia de Discovery

Quando a Hospedagem possuir coordenadas:

1. calcular distância para cada Place;
2. aplicar busca e filtros existentes;
3. manter no resultado todos os Places elegíveis;
4. ordenar o conjunto filtrado por distância crescente;
5. usar slug como desempate estável;
6. renderizar lista e mapa a partir desse mesmo conjunto.

Sem coordenadas:

- não calcular distância;
- não habilitar filtro de distância;
- preservar a ordem recebida do catálogo;
- manter mensagem de recuperação existente.

## 7. Estratégia de Recommendations

Não criar um novo algoritmo. A política atual já aplica:

- interesse compatível: peso 100;
- até 2 km: peso 30;
- acima de 2 km até 5 km: peso 20;
- acima de 5 km até 10 km: peso 10;
- acima de 10 km: peso 0.

A regressão deste incremento deve comprovar que um candidato próximo ganha preferência sem excluir candidato relevante mais distante e que a ausência de Hospedagem produz Limitation explícita com ordenação determinística válida.

## 8. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/lugares/filters.ts
apps/web/app/viagens/[tripId]/lugares/filters.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/e2e/accommodation-proximity.spec.ts
apps/web/e2e/itinerary-spatial.spec.ts
modules/decision-intelligence/src/deterministic-recommendations-proximity.test.ts
docs/implementation/increments/rb-inc-139-accommodation-proximity.md
docs/implementation/context-packs/rb-inc-139-accommodation-proximity.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Testes obrigatórios

- unitário do Discovery para ordenação por distância;
- unitário do Discovery para fallback sem coordenadas;
- regressão de filtros combinados;
- Decision Intelligence para preferência por proximidade e manutenção de candidato distante;
- Decision Intelligence para fallback sem Hospedagem e Limitation correspondente;
- E2E autenticado com Hospedagem geocodificada;
- E2E autenticado sem coordenadas;
- estabilização de seletores E2E espaciais quando lista e marcador compartilham o mesmo nome acessível;
- format, docs, lint, typecheck, testes e build;
- Engineering Validation e Documentation Validation no mesmo SHA.

## 10. Fora de escopo

- provider novo;
- API de Directions;
- trânsito;
- Tempo de deslocamento;
- alteração dos pesos da Recommendation;
- migration;
- alteração de Place Catalog;
- mudança da taxonomia;
- preenchimento de evidência da Fase B do M8.

## 11. Critérios de aceite

Os sete critérios da issue #326 devem ser comprovados por código, testes e gates do CI. O merge não deve ser tratado como evidência de valor humano.

## 12. Quando interromper e escalar

Interromper apenas se:

- a implementação exigir redefinir distância geodésica como rota;
- houver necessidade de mudar a política de Recommendation em vez de apenas reutilizá-la;
- surgir conflito documental material sobre a Hospedagem como referência;
- for necessária alteração destrutiva ou em dados de Production;
- a validação exigir afirmar resultado humano do M8 antes da Fase B.

Não interromper para correções de format, docs, lint, typecheck, testes, build ou E2E resolvíveis dentro dos contratos existentes.
