---
id: RB-INC-204
title: Controles canônicos de estado de Activity
description: Implementa as transições puras explícitas de Activity necessárias antes da janela temporal de replanejamento.
document_type: implementation-increment
owner: Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-09-19"
last_updated: "2026-09-19"
authors: [RouteBook Team]
tags: [implementation, itinerary, activity, lifecycle, replanning]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002, RB-ADR-028, RB-INC-070, RB-INC-203, RB-CTX-204]
prerequisites: [RB-INC-203]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-204 — Controles canônicos de estado de Activity

## 1. Estado

`Draft`

- issue: [#495](https://github.com/collapsy/Routebook/issues/495);
- PR: pendente;
- branch: `codex/issue-495-activity-state-controls`;
- base: `main@9de76487959adc3ebfa96bb2bbd4f7711af71115`.

## 2. Resultado vertical

O Itinerary Planning passa a expor operações puras e determinísticas para as transições de Activity já publicadas pela arquitetura e necessárias ao passo 6 do RB-ADR-028:

```text
planned -> tentative
planned | tentative -> completed
planned | tentative -> skipped
planned | tentative | needs-review -> cancelled
```

Cada transição preserva o conteúdo da Activity, altera somente `status` e `updatedAt`, incrementa `ItineraryVersion` uma vez e falha sem mutação quando o lifecycle não permite a mudança.

## 3. Problema

O tipo `ActivityStatus` já representa o lifecycle canônico, mas o agregado atual só possui operações de conteúdo, ordenação, movimentação e remoção. Isso impede que o passo posterior de ReplanningWindow diferencie de forma operacional Activities concluídas, ignoradas ou canceladas usando comandos de domínio existentes.

## 4. Contrato das transições

| Operação | Origem permitida | Destino |
| --- | --- | --- |
| `markActivityTentative` | `planned` | `tentative` |
| `completeActivity` | `planned`, `tentative` | `completed` |
| `skipActivity` | `planned`, `tentative` | `skipped` |
| `cancelActivity` | `planned`, `tentative`, `needs-review` | `cancelled` |

A Activity deve pertencer ao Itinerary. Uma transição inválida produz `ItineraryValidationError` estruturado e não expõe estado parcial.

## 5. Invariantes preservadas

- identidade, Dia, ordem, Place, título, tipo, horário, duração e flexibilidade não mudam;
- somente a Activity alvo recebe novo `updatedAt`;
- o Itinerary recebe o mesmo `updatedAt` da transição;
- `ItineraryVersion` incrementa exatamente uma vez;
- o Itinerary de entrada não é mutado;
- nenhum estado deriva automaticamente da passagem do tempo;
- concluir, pular ou cancelar continua sendo mudança explícita.

## 6. Limites deliberados

O lifecycle documental também representa `tentative -> planned`, `unavailable` e `needs-review`, porém a arquitetura publicada não expõe um comando `ConfirmActivity`, `MarkActivityUnavailable` ou `MarkActivityForReview` na mesma categoria de controles humanos deste recorte.

Este incremento não inventa novos comandos de domínio. As transições externas/de revisão permanecem para incremento posterior com contrato explícito.

## 7. Caminhos autorizados

```text
modules/trip-management/src/itinerary.ts
modules/trip-management/src/itinerary.test.ts
docs/implementation/increments/rb-inc-204-activity-state-controls.md
docs/implementation/context-packs/rb-inc-204-activity-state-controls.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Somente leitura

```text
docs/core/**
docs/domain/**
docs/architecture/**
apps/web/**
packages/database/**
modules/proposal-management/**
```

## 9. Fora de escopo

- ReplanningWindow;
- `generationScope = REPLAN`;
- operações delta `add/move/update/remove` de replanejamento;
- automação de `unavailable` ou `needs-review`;
- novo comando de confirmação `tentative -> planned`;
- UI ou Server Actions desses controles;
- alteração da página de Roteiro;
- schema ou migration;
- alteração de Domain ou ADR;
- Preview ou Production;
- merge na `main` sem autorização humana.

A PR #480 altera a página de Roteiro. Este incremento evita essa superfície intencionalmente.

## 10. Testes obrigatórios

```bash
pnpm --filter @routebook/trip-management test
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O CI também executa migrations, smoke e Playwright conforme a validação canônica do repositório.

## 11. Critérios de aceite

- [ ] `planned -> tentative` funciona;
- [ ] `planned|tentative -> completed` funciona;
- [ ] `planned|tentative -> skipped` funciona;
- [ ] `planned|tentative|needs-review -> cancelled` funciona;
- [ ] transições inválidas são rejeitadas sem mutação;
- [ ] Activity inexistente falha de forma estruturada;
- [ ] atributos não relacionados são preservados;
- [ ] versão incrementa uma vez por mudança válida;
- [ ] implementação é pura e independente de banco/UI;
- [ ] Documentation e Engineering Validation ficam verdes no mesmo SHA.

## 12. Próximo passo

Após este núcleo, o RB-ADR-028 autoriza avançar para o passo 7: `ReplanningWindow` timezone-aware e operações de delta de replanejamento em incremento próprio.

## 13. Rollback

Sem migration ou UI. O rollback remove as novas operações e testes sem alterar Activities persistidas.
