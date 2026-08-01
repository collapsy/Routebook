---
id: RB-INC-047
title: Contratos E2E Determinísticos
description: Corrige assertions Playwright acopladas à ordem de IDs canônicos e a eventos internos de navegação, sem ocultar flakiness com retries ou timeouts adicionais.
document_type: implementation-increment
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-07-31"
last_updated: "2026-07-31"
authors:
  - RouteBook Team
tags:
  - quality
  - playwright
  - e2e
  - ci
  - flakiness
related_documents:
  - RB-CORE-0004
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-046
prerequisites:
  - RB-INC-046
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-047 — Contratos E2E Determinísticos

## 1. Objetivo

Validar as jornadas Playwright pelo comportamento observável, sem depender da ordenação interna de IDs canônicos nem de um evento de navegação específico do App Router, mantendo cobertura, timeouts e retries existentes.

## 2. Problema e diagnóstico

Os workflows das PRs #103 e #105 ficaram verdes após retries. A hipótese inicial de concorrência foi testada no run `30680751411` com um único worker e refutada: 41 testes passaram, dois continuaram flaky e um falhou após todos os retries.

O log isolou dois contratos frágeis:

- o histórico exigia `Café demorado, Passeio de barco` nessa ordem, embora `PlanningConflict` normalize `relatedActivityIds` por identidade e não defina ordem semântica para os títulos;
- a adição de Lugar salvo aguardava `waitForURL` com `waitUntil: "commit"`, acoplando a jornada ao evento interno de uma navegação suave em vez da URL final observável.

Uma execução posterior da PR empilhada, run `30682213332`, revelou um terceiro fator: o setup dessa jornada consumiu o timeout global de 30 segundos antes da adição do Lugar salvo em desktop e mobile. O setup navegava pela interface por caminhos já cobertos por outros cenários. Ele passa a acessar diretamente as URLs obtidas da própria interface, preservando todas as operações e assertions específicas desta jornada sem aumentar timeout ou retry.

O run `30682439142` expôs os contratos restantes: a jornada espacial limitava duas Server Actions ao timeout de cinco segundos da assertion e a jornada de reordenação reutilizava a mesma URL de sucesso, permitindo que a verificação da segunda submissão retornasse antes do novo conteúdo. A correção aguarda a URL em paralelo quando ela realmente muda e aguarda o segundo título observável quando a URL permanece igual.

O run `30682700276` confirmou que jornadas extensas de mapa e revisão ainda disputavam o timeout por repetir criação e composição já cobertas em outros E2E. Esses setups passam a usar factories de domínio e repositories reais sobre o PostgreSQL efêmero da CI. A interface continua responsável por todas as ações e assertions que pertencem ao mapa e à revisão de conflito.

## 3. Resultado verificável

- configuração de paralelismo Playwright permanece original;
- os dois títulos do histórico são validados independentemente da ordem;
- a navegação aguarda a URL final observável, sem exigir um evento interno de commit;
- o setup reutiliza os `href` observáveis para evitar navegações redundantes já cobertas;
- submissões repetidas aguardam seu próprio resultado observável, mesmo quando a URL de sucesso é idêntica;
- jornadas extensas usam dados controlados e independentes no setup, sem repetir fluxos cobertos por outros E2E;
- desktop Chromium e Pixel 7 continuam executados;
- retries e timeouts não aumentam;
- nenhuma jornada ou requisito é removido ou relaxado;
- duas execuções completas consecutivas terminam sem annotation de flaky.

## 4. Escopo

- assertions e setups E2E identificados pelos logs das execuções repetidas;
- documentação e rastreabilidade;
- evidências do workflow Engineering Validation.

## 5. Fora de escopo

- comportamento de produto ou domínio;
- banco, migrations ou dados de produção;
- aumento de timeout, sleep ou retry;
- remoção, quarentena ou serialização permanente de testes;
- alterações em componentes, rotas, workflow, dependências ou Providers.

## 6. Context Pack

`docs/implementation/context-packs/rb-inc-047-deterministic-e2e.md`

## 7. Caminhos permitidos

```text
apps/web/e2e/itinerary.spec.ts
apps/web/e2e/itinerary-spatial.spec.ts
apps/web/e2e/planning-conflicts.spec.ts
docs/implementation/increments/rb-inc-047-deterministic-e2e.md
docs/implementation/context-packs/rb-inc-047-deterministic-e2e.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Critérios de aceite

- [x] nenhum teste depende da ordem dos IDs de Activities relacionadas;
- [x] os dois títulos continuam explicitamente validados no histórico;
- [x] a adição de Lugar salvo valida a URL final observável;
- [x] configuração, projetos, retries e timeouts do Playwright permanecem inalterados;
- [x] nenhuma jornada ou assertion de requisito é removida;
- [x] duas execuções consecutivas do workflow ficam verdes sem flaky annotation;
- [x] matriz e registro documental permanecem válidos.

## 9. Testes obrigatórios

- `pnpm format:check` no CI Linux;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test` com PostgreSQL no CI;
- `pnpm build`;
- Playwright desktop e mobile em duas execuções consecutivas.

## 10. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| correção aceitar conteúdo ausente | Alto | manter assertions separadas para os dois títulos |
| navegação continuar instável | Médio | aguardar a URL final observável e preservar trace |
| existir outra causa de flake | Médio | exigir duas execuções completas sem retry |

## 11. Rollback

Reverter somente as assertions e a documentação. Não existe migration, escrita de produto ou efeito em produção.

## 12. Evidências de conclusão

SHA validado: `371a0002179efc1821f65aa46062e56b0247b5e6`.

- Documentation Validation: run `30681587659`, concluído com sucesso;
- Engineering Validation: run `30681587692`, attempts 1 e 2 concluídos com sucesso;
- Playwright em cada attempt: 44 testes aprovados em desktop e mobile, sem retry e sem annotation de flaky.
