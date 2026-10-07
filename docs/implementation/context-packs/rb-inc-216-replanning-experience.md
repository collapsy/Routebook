---
id: RB-CTX-216
title: Context Pack do RB-INC-216 — Replanejamento durante a viagem
description: Delimita a entrada explícita no fluxo REPLAN existente e a apresentação do snapshot temporal da Proposal.
document_type: implementation-context-pack
owner: Experience, Proposal Management and Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-10-07"
last_updated: "2026-10-07"
authors: [RouteBook Team]
tags: [implementation, context-pack, replanning, itinerary-proposal]
related_documents:
  [
    RB-INC-216,
    RB-INC-206,
    RB-INC-207,
    RB-INC-215,
    RB-ADR-027,
    RB-ADR-028,
    RB-CORE-0004,
    RB-DOM-001,
    RB-DOM-003,
    RB-DOM-004,
  ]
prerequisites: [RB-INC-206, RB-INC-215]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-216 — Replanejamento durante a viagem

## 1. Missão

Expor ao usuário a escolha explícita de `REPLAN` sobre o pipeline canônico e tornar compreensível o recorte temporal persistido, preservando a fronteira entre Proposal e Itinerary aplicado.

## 2. Unidade

- Incremento: `RB-INC-216`.
- Issue: [#525](https://github.com/collapsy/Routebook/issues/525).
- Branch: `codex/rb-inc-216-replanning-experience`.
- Base: `main@a09bf9f2b45366f7374b9e82108800c19408e901`.

## 3. Leitura obrigatória

1. `AGENTS.md`, `docs/core/routebook-bible.md`, `docs/README.md`;
2. `docs/product/user-journeys.md` (jornadas de planejamento e de execução/replanejamento);
3. `docs/domain/domain-model.md`, `docs/domain/business-rules-and-invariants.md`, `docs/domain/domain-events-and-lifecycles.md`;
4. `docs/architecture/architecture-overview.md`, `docs/architecture/modules-and-bounded-contexts.md`;
5. RB-ADR-027 e RB-ADR-028;
6. RB-INC/CTX-206, RB-INC/CTX-207, RB-INC/CTX-215 e este incremento;
7. geração autoritativa, `ReplanningWindow`, acesso à Trip, UI de Proposal e E2E de geração/revisão;
8. `docs/registry.md` e `docs/implementation/traceability-matrix.md`.

## 4. Contratos e semântica já existentes

- `ItineraryProposal.generationScope` é `INITIAL | REPLAN`; `INITIAL` é o default legado.
- Geração `REPLAN` exige `generationContext.replanningWindow`.
- A janela armazena `capturedAt`, `timeZone`, `localDate`, `localTime`, `eligibleDayIds`, `eligibleActivityIds`, `protectedActivityIds` e `reasonByActivityId`.
- O adapter calcula a janela com o relógio explícito e o timezone persistido da Trip.
- A Proposal é revisada e aceita/rejeitada explicitamente; geração não aplica o Itinerary.
- `Trip.status` tem `draft`, `planned`, `in-progress`, `completed`, `cancelled`, `archived`.

## 5. Regra de disponibilidade

- A ação nova é uma escolha explícita e separada, oferecida somente quando status é `planned` ou `in-progress`.
- O servidor revalida o scope e o status; não confia na rota/query/form do cliente.
- Não inferir `REPLAN` por data, status ou existência de dias elegíveis.
- Não criar transição para `in-progress`; lifecycle/status ficam inalterados.
- Não oferecer REPLAN para `draft`, `completed`, `cancelled` ou `archived`.

## 6. Restrições de domínio e UX

- Respeite RB-ADR-028 e a `ReplanningWindow`; nunca calcule uma regra temporal paralela na interface.
- Use somente o snapshot persistido pela Proposal ao explicar o recorte daquela geração.
- Correlacione `eligibleDayIds` aos Dias do Itinerary carregado; não invente datas nem transforme ausência em zero/fato confirmado.
- Explique em linguagem de produto o trecho protegido; use `reasonByActivityId` apenas para detalhes que a tela consegue mapear com segurança.
- `includeMaybe` permanece opt-in explícito e separado do escopo REPLAN.
- Use as ações existentes de aceite total/parcial, descarte e rejeição. Não crie aplicação silenciosa.
- Se o snapshot estiver ausente/inconsistente em Proposal REPLAN, trate como indisponibilidade/erro de integridade; não mostre um recorte presumido.

## 7. Caminhos

Altere somente “Caminhos permitidos” em RB-INC-216. Para qualquer caminho adicional necessário, pause e atualize o incremento e este Context Pack antes de editar código.

## 8. Critérios verificáveis

- testes de lib cobrem status/scope, autorização, compatibilidade INITIAL e encaminhamento REPLAN;
- testes de componente cobrem rotulagem/ação distinta e leitura de snapshot válida/vazia/inconsistente;
- E2E cobre escolha explícita, revisão e decisão sem mutação anterior ao aceite;
- validação documental e checks integrados são registrados sem extrapolar seus resultados.

## 9. Interromper e escalar

Pare antes de implementar caso seja necessária alteração de domínio/lifecycle, migration/schema, novo contrato de persistência, regras temporais além de RB-ADR-028, novo comportamento de aceite, ou alteração dos caminhos permitidos.

## 10. Gate

Não fazer merge desta PR sem autorização humana explícita.
