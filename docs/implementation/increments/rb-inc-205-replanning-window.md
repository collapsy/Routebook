---
id: RB-INC-205
title: ReplanningWindow e elegibilidade temporal de delta
description: Implementa a janela temporal timezone-aware de replanejamento e valida operações add/move/update/remove contra sua elegibilidade.
document_type: implementation-increment
owner: Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-09-19"
last_updated: "2026-09-19"
authors: [RouteBook Team]
tags: [implementation, itinerary, replanning, timezone, proposal, delta]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002, RB-ADR-028, RB-INC-204, RB-CTX-205]
prerequisites: [RB-INC-204]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-205 — ReplanningWindow e elegibilidade temporal de delta

## 1. Estado

`Draft`

- issue: [#497](https://github.com/collapsy/Routebook/issues/497);
- PR: [#498](https://github.com/collapsy/Routebook/pull/498);
- branch: `codex/issue-497-replanning-window`;
- base: `main@61169a75249744743df8b65081f5a4d4712f91cc`.

## 2. Resultado vertical

O Itinerary Planning passa a publicar um núcleo puro e determinístico para capturar a janela temporal de replanejamento definida no RB-ADR-028 e para verificar se os deltas já existentes de Proposal podem tocar os Dias e Activities referenciados.

O recorte não cria um segundo pipeline de Proposal. Os contratos `add | move | update | remove` já existem; este incremento acrescenta a fronteira temporal que deverá ser consumida por geração/aplicação de replanejamento em incrementos posteriores.

## 3. ReplanningWindow

O snapshot mínimo contém:

```text
ReplanningWindow
- capturedAt
- timeZone
- localDate
- localTime
- eligibleDayIds
- eligibleActivityIds
- protectedActivityIds
- reasonByActivityId
```

O cálculo recebe relógio explícito e timezone IANA. O timezone do processo nunca substitui o timezone da Trip.

## 4. Classificação temporal

- Dia anterior à data local atual: todas as Activities protegidas.
- Dia atual: permanece elegível para planejamento futuro.
- Activity do Dia atual sem horário: protegida conservadoramente.
- Activity do Dia atual com início já alcançado: protegida, tenha terminado ou esteja em andamento.
- Activity do Dia atual com início futuro: elegível quando não for `fixed` nem terminal.
- Dia futuro: elegível.
- Activity `fixed`: protegida.
- `completed | skipped | cancelled | removed`: protegidas.
- `unavailable | needs-review` futuras podem ser elegíveis para Proposal explícita.
- passagem do tempo não muda `ActivityStatus`.

Os motivos de proteção são estruturados e determinísticos para permitir explicação futura.

## 5. Delta existente

A validação do delta usa os contratos já publicados por `ApplyProposalItems`:

| Operação | Regra temporal |
| --- | --- |
| `add` | Dia alvo deve ser elegível |
| `move` | Activity de origem e Dia alvo devem ser elegíveis |
| `update` | Activity de origem deve ser elegível |
| `remove` | Activity de origem deve ser elegível |

A validação não aplica a Proposal, não altera o Itinerary e não altera os itens recebidos.

## 6. Caminhos autorizados

```text
modules/trip-management/src/replanning-window.ts
modules/trip-management/src/replanning-window.test.ts
modules/trip-management/src/replanning-delta.ts
modules/trip-management/src/replanning-delta.test.ts
modules/trip-management/src/index.ts
docs/implementation/increments/rb-inc-205-replanning-window.md
docs/implementation/context-packs/rb-inc-205-replanning-window.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 7. Somente leitura

```text
docs/core/**
docs/domain/**
docs/architecture/**
modules/proposal-management/**
packages/database/**
apps/web/**
```

## 8. Fora de escopo

- persistir `generationScope = REPLAN`;
- alterar schema de Itinerary Proposal;
- gerar automaticamente deltas de replanejamento;
- persistir ReplanningWindow;
- migration/schema;
- PostgreSQL;
- UI/Server Actions;
- página de Roteiro;
- Preview/Production;
- alterar Domain/ADR;
- alterar status de Activity pela passagem do tempo;
- merge na `main` sem autorização humana.

## 9. Testes obrigatórios

```bash
pnpm --filter @routebook/trip-management test
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O CI continua como evidência autoritativa para migrations existentes, smoke e Playwright.

## 10. Critérios de aceite

- [ ] timezone IANA da Trip determina data/hora locais;
- [ ] fronteira de meia-noite é coberta;
- [ ] cenário DST é coberto sem depender do timezone do servidor;
- [ ] Dias passados ficam protegidos;
- [ ] Dia atual protege trecho transcorrido e Activities sem horário;
- [ ] Activities futuras elegíveis são identificadas;
- [ ] fixed e terminais são protegidas;
- [ ] unavailable/needs-review futuros podem ser elegíveis;
- [ ] add/move/update/remove respeitam a janela;
- [ ] validação inválida falha sem mutação;
- [ ] IDs e inputs inválidos falham de forma estruturada;
- [ ] implementação permanece pura e independente de banco/UI;
- [ ] Documentation e Engineering Validation ficam verdes no mesmo SHA.

## 11. Próximo passo

Integrar o snapshot temporal ao fluxo de geração `REPLAN`, persistir os metadados necessários na Itinerary Proposal e gerar deltas reais sem criar pipeline paralelo.

## 12. Rollback

Sem migration, persistência ou UI. O rollback remove os contratos puros e seus testes sem alterar estado persistido.
