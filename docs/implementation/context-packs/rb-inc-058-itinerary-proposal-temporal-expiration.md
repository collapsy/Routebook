---
id: RB-CTX-058
title: Context Pack do RB-INC-058
description: Fornece o contexto mínimo para implementar a expiração temporal da Itinerary Proposal no domínio.
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
  - expiration
related_documents:
  - RB-INC-058
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-INC-053
prerequisites:
  - RB-INC-053
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-058

## 1. Missão

Implementar a menor operação de domínio que materializa a causa temporal já documentada de expiração de uma Itinerary Proposal `ready`.

## 2. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/increments/rb-inc-058-itinerary-proposal-temporal-expiration.md`;
5. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-004 e RB-BR-PRP-008;
6. `docs/domain/domain-events-and-lifecycles.md`, estados e transição para `expired`;
7. `docs/domain/domain-model.md`, Itinerary Proposal;
8. `docs/data/logical-data-model.md`, atributos e constraints da Proposal;
9. `modules/proposal-management/src/itinerary-proposal.ts` e testes.

## 3. Contrato

```text
expireItineraryProposalByTime(proposal, expiredAt)
ready + expiredAt >= validUntil
→ expired
→ expiredAt = clone(expiredAt)
→ updatedAt = clone(expiredAt)
```

## 4. Caminhos permitidos

Exatamente os caminhos da seção 8 do incremento.

## 5. Restrições

- não alterar Itinerary;
- não usar `new Date()` internamente para decidir a transição;
- não expirar por versão, Contexto ou substituição;
- não implementar persistência, command handler, scheduler ou UI;
- não remover o conteúdo `ready`;
- não adicionar dependência, estado ou conceito novo.

## 6. Validações

- status precisa ser `ready`;
- `validUntil` precisa existir e ser válido;
- `expiredAt` precisa ser válido e monotônico;
- `expiredAt` precisa alcançar `validUntil`;
- erros usam os tipos públicos existentes de transição e validação.

## 7. Comandos

```bash
pnpm exec prettier --check modules/proposal-management/src/index.ts modules/proposal-management/src/itinerary-proposal.ts modules/proposal-management/src/itinerary-proposal.test.ts docs/implementation/increments/rb-inc-058-itinerary-proposal-temporal-expiration.md docs/implementation/context-packs/rb-inc-058-itinerary-proposal-temporal-expiration.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/proposal-management lint
pnpm --filter @routebook/proposal-management typecheck
pnpm --filter @routebook/proposal-management test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 8. Quando escalar

- for necessário decidir compatibilidade de versões ou Contexto;
- a operação precisar aplicar ou modificar Itinerary;
- surgir necessidade de persistência, transação, job ou Evento;
- o estado canônico não sustentar a transição temporal isolada.
