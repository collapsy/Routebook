---
id: RB-CTX-083
title: Context Pack do RB-INC-083
description: Contexto mínimo para implementar e validar o fragment transacional PostgreSQL da Decision de aceite de Itinerary Proposal.
document_type: implementation-context-pack
owner: Data and Persistence
status: Draft
version: "0.1.0"
created: "2026-08-02"
last_updated: "2026-08-02"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - database
  - transaction
  - decision-intelligence
related_documents:
  - RB-INC-083
  - RB-CORE-0004
  - RB-DATA-002
  - RB-ADR-006
  - RB-ADR-027
  - RB-INC-074
  - RB-INC-080
  - RB-INC-081
  - RB-INC-082
prerequisites:
  - RB-ADR-027
  - RB-INC-080
  - RB-INC-081
  - RB-INC-082
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-083

## 1. Missão

Encapsular a construção e persistência canônica da Decision `accept-itinerary-proposal` em um fragment reutilizável pela composição PostgreSQL do aceite integral, sem abrir nested transaction.

## 2. Incremento

- ID: `RB-INC-083`;
- issue: `#189`;
- PR: `#190`;
- branch: `feature/rb-inc-083-itinerary-proposal-decision-transaction-fragment`;
- arquivo: `docs/implementation/increments/rb-inc-083-itinerary-proposal-decision-transaction-fragment.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. RB-DATA-002, RB-ADR-006 e RB-ADR-027;
4. RB-INC-074, RB-INC-080, RB-INC-081 e RB-INC-082;
5. `modules/proposal-management/src/accept-itinerary-proposal.ts`;
6. `modules/decision-intelligence/src/decision.ts`;
7. `packages/database/src/decision-repository.ts`;
8. `packages/database/src/itinerary-proposal-transaction-unit.ts`;
9. fragments transacionais de Proposal Application, Itinerary Proposal e Itinerary.

## 4. Contrato operacional

```text
DecisionTransactionFragment.persist
├── AcceptItineraryProposalCommand
├── proposalApplicationId
├── actorParticipantId
├── resultingItineraryVersion
├── appliedProposedActivityIds
├── decisionId opcional
└── recommendationId opcional
    ↓
createDecision
    ↓
DecisionRepository.save
    ↓
Decision persistida ou replay idempotente
```

## 5. Invariantes

- o executor recebido é o único acesso ao PostgreSQL;
- o fragment não possui host nem runner transacional;
- Trip, Itinerary e Itinerary Proposal são as mesmas do comando;
- Proposal Application persistida é referenciada no effect;
- `baseItineraryVersion` é a versão esperada do comando;
- `resultingItineraryVersion` é exatamente a versão-base incrementada;
- option e effect preservam os mesmos IDs ordenados;
- fingerprint e `decidedAt` são copiados do comando;
- actorParticipantId é obrigatório;
- Recommendation só existe quando fornecida;
- replay é responsabilidade do repository escopado;
- erros de domínio e repository são propagados sem retry ou conversão.

## 6. Restrições

- não abrir transação;
- não usar `getDatabase` diretamente no fragment;
- não compor os outros fragments;
- não implementar `ApplyItineraryProposalTransaction`;
- não alterar schema ou migrations;
- não criar Server Action, autorização ou UI;
- não adicionar retry, compensação ou Outbox.

## 7. Decisões locais

- a factory recebe executor e factory de repository injetável para testes;
- a Decision é construída exclusivamente por `createDecision`;
- a validação de identidades, versões e ordem é centralizada no contrato de domínio;
- o replay é delegado ao repository para preservar a unique key por Trip;
- testes unitários verificam construção e falha pré-write;
- testes PostgreSQL comprovam executor escopado, replay, commit e rollback.

## 8. Testes obrigatórios

- construção integral de option, snapshot e effect;
- ID explícito e ID gerado;
- Recommendation opcional;
- replay idempotente;
- versão resultante incompatível;
- IDs aplicados divergentes ou fora de ordem;
- executor inválido;
- factory inválida;
- repository inválido;
- persistência real no PostgreSQL;
- ausência de nested transaction;
- rollback externo integral.

## 9. Comandos

```bash
pnpm exec prettier --check packages/database/src/decision-transaction-fragment.ts packages/database/src/decision-transaction-fragment.test.ts packages/database/src/decision-transaction-fragment-postgres.test.ts packages/database/src/index.ts docs/implementation/increments/rb-inc-083-itinerary-proposal-decision-transaction-fragment.md docs/implementation/context-packs/rb-inc-083-itinerary-proposal-decision-transaction-fragment.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/database lint
pnpm --filter @routebook/database typecheck
pnpm db:migrate
pnpm --filter @routebook/database test
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
git diff --check
```

## 10. Quando interromper e escalar

- a composição exigir dados não publicados pelos fragments anteriores;
- Recommendation precisar se tornar obrigatória;
- actorParticipantId não puder ser resolvido antes do fragment;
- a versão resultante não puder ser derivada deterministicamente;
- o repository precisar abrir transação própria;
- o fato de domínio exigir alteração de schema.
