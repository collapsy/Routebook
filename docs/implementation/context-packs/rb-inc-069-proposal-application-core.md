---
id: RB-CTX-069
title: Context Pack do RB-INC-069
description: Fornece o contexto mínimo para implementar o núcleo de Proposal Application e seu fingerprint idempotente.
document_type: implementation-context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - proposal-management
  - proposal-application
  - idempotency
related_documents:
  - RB-INC-069
  - RB-CORE-0004
  - RB-DOM-003
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-027
  - RB-INC-068
prerequisites:
  - RB-ADR-027
  - RB-INC-068
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-069

## 1. Missão

Definir uma representação imutável e auditável de `Proposal Application`, além do fingerprint canônico que permitirá validar replay idempotente em incrementos posteriores.

## 2. Incremento

- ID: `RB-INC-069`;
- issue: `#159`;
- branch: `feature/rb-inc-069-proposal-application-core`;
- arquivo: `docs/implementation/increments/rb-inc-069-proposal-application-core.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/implementation/README.md`;
4. RB-ADR-027;
5. RB-DOM-003, regras RB-BR-PRP-006, RB-BR-PRP-009 e RB-BR-PRP-010;
6. RB-DATA-001, seção 67;
7. RB-DATA-002, seção 56;
8. RB-INC-068;
9. `modules/proposal-management/src/itinerary-proposal.ts`;
10. `modules/trip-management/src/proposal-application.ts`.

## 4. Contrato

```text
StartProposalApplication
├── proposalApplicationId
├── itineraryProposalId
├── itineraryId
├── idempotencyKey
├── applicationType
├── expectedItineraryVersion
├── actor
├── proposedActivityIds[]
├── requestFingerprint
└── startedAt

started
├── succeed(resultingItineraryVersion, completedAt)
└── fail(failureCode, completedAt)
```

## 5. Fingerprint

O payload possui versão `1` e é serializado como array JSON de posição estável antes do SHA-256.

A chave de idempotência fica fora do fingerprint:

```text
(itineraryProposalId, idempotencyKey) → replay candidato
requestFingerprint                 → equivalência do pedido
```

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os definidos na seção 8 do incremento.

## 7. Restrições

- não criar migration ou adapter;
- não importar `@routebook/trip-management`;
- não importar `@routebook/decision-intelligence`;
- não alterar o aggregate Itinerary Proposal;
- não aplicar Proposed Activities;
- não persistir tentativa;
- não coordenar transação;
- não criar Decision;
- não adicionar Provider ou dependência;
- não incluir `idempotencyKey` no fingerprint;
- não ordenar silenciosamente os Proposed Activity IDs.

## 8. Testes obrigatórios

- normalização e estabilidade;
- mudança de todos os campos relevantes;
- ordem da coleção;
- duplicidade;
- imutabilidade;
- cópia defensiva de datas;
- sucesso e falha;
- timeline;
- transição terminal.

## 9. Comandos

```bash
pnpm exec prettier --check modules/proposal-management/src/proposal-application.ts modules/proposal-management/src/proposal-application.test.ts modules/proposal-management/src/index.ts docs/implementation/increments/rb-inc-069-proposal-application-core.md docs/implementation/context-packs/rb-inc-069-proposal-application-core.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/proposal-management lint
pnpm --filter @routebook/proposal-management typecheck
pnpm --filter @routebook/proposal-management test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 10. Quando interromper e escalar

- a implementação exigir novo estado ou tipo não previsto;
- a equivalência do pedido depender de campo não documentado;
- for necessário alterar a semântica de ItineraryVersion;
- o recorte exigir persistência ou escrita cruzada entre módulos;
- surgir necessidade de alterar a estratégia aprovada no RB-ADR-027.
