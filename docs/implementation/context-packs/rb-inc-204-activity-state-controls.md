---
id: RB-CTX-204
title: Context Pack do RB-INC-204 — Controles de estado de Activity
description: Delimita as transições puras de lifecycle de Activity que antecedem ReplanningWindow.
document_type: implementation-context-pack
owner: Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-09-19"
last_updated: "2026-09-19"
authors: [RouteBook Team]
tags: [implementation, context-pack, itinerary, activity, lifecycle]
related_documents: [RB-INC-204, RB-ADR-028, RB-INC-203, RB-INC-070, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002]
prerequisites: [RB-INC-203]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-204 — Controles de estado de Activity

## 1. Missão

Implementar somente o núcleo puro dos controles explícitos de Activity exigidos pelo passo 6 do RB-ADR-028, preparando o agregado para a futura classificação temporal de ReplanningWindow.

## 2. Unidade de trabalho

- issue: [#495](https://github.com/collapsy/Routebook/issues/495);
- PR: [#496](https://github.com/collapsy/Routebook/pull/496);
- branch: `codex/issue-495-activity-state-controls`;
- base: `main@9de76487959adc3ebfa96bb2bbd4f7711af71115`;
- merge na `main` permanece gate humano.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-DOM-001;
5. RB-DOM-002;
6. RB-DOM-003;
7. RB-DOM-004;
8. RB-ARC-002;
9. RB-ADR-028;
10. RB-INC-070 como precedente de mutações puras de Itinerary;
11. RB-INC-203 como pré-requisito imediato.

## 4. Transições autorizadas

```text
markActivityTentative: planned -> tentative
completeActivity: planned | tentative -> completed
skipActivity: planned | tentative -> skipped
cancelActivity: planned | tentative | needs-review -> cancelled
```

Nenhuma outra transição pode ser inferida ou adicionada neste incremento.

## 5. Invariantes

- Activity deve pertencer ao Itinerary;
- transição inválida falha antes de expor resultado;
- input não é mutado;
- identidade e posição permanecem;
- campos não relacionados ao status permanecem;
- `updatedAt` muda somente para a Activity alvo e o Itinerary;
- `ItineraryVersion` incrementa uma vez;
- passagem de tempo não conclui Activity;
- `cancelled` permanece semanticamente distinto de `removed`.

## 6. Proibições

- não criar `ConfirmActivity` sem contrato arquitetural;
- não implementar `unavailable` ou `needs-review` por inferência;
- não implementar ReplanningWindow;
- não alterar Proposal;
- não tocar schema/migration;
- não alterar Domain/ADR;
- não alterar UI ou Server Actions;
- não tocar a página de Roteiro concorrente da PR #480;
- não fazer push direto na `main`;
- não fazer merge sem autorização humana.

## 7. Caminhos

Alterar somente os caminhos declarados no RB-INC-204. Arquivo adicional indispensável exige atualização prévia do incremento e justificativa na PR.

## 8. Verificações mínimas

- transições válidas por cada estado de origem;
- transições inválidas;
- Activity inexistente e ID vazio;
- imutabilidade do agregado de entrada;
- preservação de atributos;
- incremento único de versão;
- validação documental e regressão integral.

## 9. Gate humano

Depois de implementação e CI, a PR permanece aberta até autorização explícita para merge.
