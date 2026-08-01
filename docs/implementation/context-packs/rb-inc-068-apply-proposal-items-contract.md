---
id: RB-CTX-068
title: Context Pack do RB-INC-068
description: Fornece o contexto mínimo para definir o contrato público ApplyProposalItems do Itinerary Planning.
document_type: implementation-context-pack
owner: Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - itinerary-planning
  - proposal-management
  - module-contract
related_documents:
  - RB-INC-068
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-DATA-001
  - RB-DATA-002
  - RB-INC-066
  - RB-INC-067
prerequisites:
  - RB-INC-066
  - RB-INC-067
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-068

## 1. Missão

Publicar a fronteira mínima `ApplyProposalItems` no módulo proprietário do Itinerary, sem aplicar itens, persistir estado ou escolher coordenação transacional.

## 2. Incremento

- ID: `RB-INC-068`;
- issue: `#152`;
- branch: `codex/rb-inc-068-apply-proposal-items-contract`;
- arquivo: `docs/implementation/increments/rb-inc-068-apply-proposal-items-contract.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. o incremento RB-INC-068;
6. RB-INC-066 e RB-INC-067;
7. RB-DOM-001, seções 59–61 e 80–81;
8. RB-DOM-003, regras RB-BR-ITN-015–019 e RB-BR-PRP-005–010;
9. RB-DOM-004, ciclo e eventos da Itinerary Proposal;
10. RB-ARC-002, seções 58–63 e 83–90;
11. RB-DATA-001, Proposed Activity e Proposal Application;
12. RB-DATA-002, seções 41–45;
13. código e testes atuais de Itinerary e Itinerary Proposal.

## 4. Contrato público

```text
ApplyProposalItemsCommand
├── tripId
├── itineraryId
├── itineraryProposalId
├── expectedItineraryVersion
├── idempotencyKey
└── items[]
    ├── add
    ├── move
    ├── update
    └── remove

ApplyProposalItems.execute(command)
→ resultingItineraryVersion
→ appliedProposedActivityIds
```

## 5. Operações

```text
add    → proposedActivityId + targetTripDayId + Activity draft
move   → proposedActivityId + sourceActivityId + targetTripDayId + targetOrder opcional
update → proposedActivityId + sourceActivityId + campos alteráveis
remove → proposedActivityId + sourceActivityId
```

Coleção vazia permanece válida neste contrato porque a documentação permite Proposal vazia; a semântica de aplicação e versionamento do caso vazio pertence ao adapter futuro.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 8 do incremento.

## 7. Restrições

- não importar `@routebook/proposal-management`;
- não alterar o aggregate Itinerary ou Itinerary Proposal;
- não criar adapter de banco ou migration;
- não coordenar Proposal, Itinerary e Decision;
- não afirmar que itens foram aplicados;
- não escolher estratégia da seção 44 de RB-DATA-002;
- não adicionar Provider ou dependência.

## 8. Testes obrigatórios

- cada variante válida é normalizada;
- objetos e coleção ficam congelados;
- raiz inválida é rejeitada com erro de fronteira;
- campos obrigatórios por operação são rejeitados quando ausentes;
- dados incompatíveis com os tipos de Activity são rejeitados;
- lista vazia é aceita sem efeito.

## 9. Comandos

```bash
pnpm exec prettier --check modules/trip-management/src/proposal-application.ts modules/trip-management/src/proposal-application.test.ts modules/trip-management/src/index.ts docs/implementation/increments/rb-inc-068-apply-proposal-items-contract.md docs/implementation/context-packs/rb-inc-068-apply-proposal-items-contract.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/trip-management lint
pnpm --filter @routebook/trip-management typecheck
pnpm --filter @routebook/trip-management test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 10. Quando interromper e escalar

- for necessário definir status não canônico de Proposal Application;
- a implementação exigir mutação ou persistência do Itinerary;
- surgir escolha entre transação local, Process Manager, reserva ou compensação;
- o contrato exigir novo conceito ou invariante de domínio.
