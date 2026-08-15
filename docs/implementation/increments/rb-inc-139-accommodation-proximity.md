---
id: RB-INC-139
title: Proximidade da Hospedagem em Discovery e Recommendations
description: Prioriza Places próximos da Hospedagem no Discovery e comprova o uso determinístico e explicável da proximidade em Recommendations.
document_type: implementation-increment
owner: Place Catalog and Decision Intelligence
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors: [RouteBook Team]
tags: [implementation, place-catalog, discovery, recommendation, proximity, m8]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-DOM-001, RB-INC-039, RB-INC-041, RB-INC-132, RB-INC-136]
prerequisites: [RB-INC-039, RB-INC-041, RB-INC-132]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-139 — Proximidade da Hospedagem em Discovery e Recommendations

Issue: `#326`

Branch: `codex/rb-inc-139-accommodation-proximity`

## 1. Contexto

Durante a preparação da validação real M8, a proximidade da Hospedagem foi identificada como um sinal espacial relevante para reduzir esforço na descoberta de Places. O produto já calculava distância geodésica no Discovery e a política determinística de Recommendations do RB-INC-039 já atribuía pesos por faixas de distância, mas o catálogo filtrado não priorizava explicitamente os Places mais próximos.

Este incremento torna essa preferência observável sem tratá-la como evidência humana de valor do M8.

## 2. Objetivo

Usar a Hospedagem geocodificada como referência espacial para ordenar o conjunto já filtrado do Discovery do Place mais próximo ao mais distante, mantendo a política existente de Recommendations, os contratos de explicabilidade e um fallback estável quando a coordenada da Hospedagem não estiver disponível.

## 3. Decisões

- o Discovery filtra primeiro e ordena depois; busca, categoria, Price Range e distância máxima continuam definindo o conjunto elegível;
- com coordenada de Hospedagem, a ordenação do Discovery usa distância geodésica crescente;
- empate de distância usa `Place.slug` como desempate determinístico;
- sem coordenada de Hospedagem, o Discovery preserva a ordem recebida do catálogo e não inventa distância;
- o mapa continua recebendo exatamente o mesmo conjunto filtrado da lista;
- Places mais distantes não são excluídos por proximidade quando nenhum filtro de distância os remove;
- a UI identifica a distância como geodésica/em linha reta e declara que ela não representa rota, duração ou trânsito;
- Recommendations reutilizam a política `place-ranking-v1` já definida no RB-INC-039, sem novo peso, score ou algoritmo;
- o incremento apenas adiciona regressão explícita para comprovar que proximidade influencia a ordem de Recommendations quando disponível e que a ausência de Hospedagem mantém o comportamento válido.

## 4. Escopo implementado

- ordenação do resultado de `filterPlaces` por distância crescente quando existe Hospedagem geocodificada;
- desempate estável por slug;
- preservação da ordem original quando não existe coordenada de Hospedagem;
- microcopy do Discovery explicando a priorização espacial e seus limites;
- teste unitário do Discovery para proximidade e fallback;
- teste de Decision Intelligence para o peso de proximidade sem exclusão de candidato distante;
- E2E autenticado para ordem do Discovery, distância apresentada e fallback sem coordenadas.

## 5. Fora de escopo

- roteamento em tempo real;
- tráfego ao vivo;
- duração de deslocamento calculada por provider;
- excluir automaticamente Places distantes;
- alterar taxonomia ou dados do Place Catalog;
- mudar os pesos da política `place-ranking-v1`;
- criar nova política de Recommendation;
- migration ou alteração de schema;
- declarar H3 ou qualquer hipótese do M8 como validada.

## 6. Critérios de aceite

- [x] com Hospedagem válida, Places próximos recebem preferência explícita no Discovery sem alterar o conjunto filtrado;
- [x] busca, categoria, Price Range e distância máxima continuam compatíveis com a ordenação;
- [x] Recommendations usam proximidade como sinal determinístico e explicável pela política existente;
- [x] mesma entrada mantém ordem determinística;
- [x] ausência de coordenadas não quebra Discovery nem Recommendations;
- [x] UI distingue distância geográfica estimada de rota, duração e trânsito;
- [x] Places distantes continuam disponíveis quando relevantes e não filtrados;
- [x] testes automatizados cobrem ranking e fallback;
- [ ] Registry e rastreabilidade atualizados;
- [ ] Documentation Validation verde;
- [ ] Engineering Validation verde no mesmo SHA;
- [ ] PR integrada.

## 7. Arquivos principais

```text
apps/web/app/viagens/[tripId]/lugares/filters.ts
apps/web/app/viagens/[tripId]/lugares/filters.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/e2e/accommodation-proximity.spec.ts
modules/decision-intelligence/src/deterministic-recommendations-proximity.test.ts
docs/implementation/increments/rb-inc-139-accommodation-proximity.md
docs/implementation/context-packs/rb-inc-139-accommodation-proximity.md
docs/registry.md
docs/implementation/traceability-matrix.md
```

## 8. Testes e gates

O mesmo SHA deve passar por:

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Engineering Validation permanece a fonte canônica para PostgreSQL efêmero e Playwright responsivo.

## 9. Riscos

- confundir distância geodésica com rota real;
- apresentar a ordem por proximidade como qualidade absoluta do Place;
- introduzir ordenação instável em empates;
- quebrar a composição entre filtros e ordenação;
- duplicar a política de Recommendation em uma segunda implementação.

As mitigações são microcopy explícita, desempate determinístico, filtro antes da ordenação e reutilização da política canônica do RB-INC-039.

## 10. Relação com M8

RB-INC-139 prepara uma hipótese observável para a Fase B do RB-INC-136. Durante o uso real de 22 a 29 de agosto de 2026, deve ser registrado separadamente se a proximidade da Hospedagem alterou decisões, reduziu pesquisa externa ou aumentou a utilidade percebida. Testes técnicos deste incremento não constituem evidência humana para H3.
