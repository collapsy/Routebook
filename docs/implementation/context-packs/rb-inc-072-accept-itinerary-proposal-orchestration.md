---
id: RB-CTX-072
title: Context Pack do RB-INC-072
description: Fornece o contexto mínimo para implementar a fronteira de aplicação e o port transacional do aceite integral de Itinerary Proposal.
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
  - application-orchestration
  - idempotency
related_documents:
  - RB-INC-072
  - RB-CORE-0004
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-ARC-003
  - RB-ADR-027
  - RB-INC-068
  - RB-INC-069
  - RB-INC-070
  - RB-INC-071
prerequisites:
  - RB-ADR-027
  - RB-INC-068
  - RB-INC-069
  - RB-INC-070
  - RB-INC-071
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-072

## 1. Missão

Publicar `AcceptItineraryProposal` e `ApplyItineraryProposalTransaction` como fronteira explícita do aceite integral, sem antecipar a implementação PostgreSQL pertencente aos próximos incrementos.

## 2. Incremento

- ID: `RB-INC-072`;
- issue: `#167`;
- PR: `#170`;
- branch: `feature/rb-inc-072-accept-itinerary-proposal-orchestration`;
- arquivo: `docs/implementation/increments/rb-inc-072-accept-itinerary-proposal-orchestration.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/implementation/README.md`;
4. RB-ADR-027;
5. RB-DOM-003 e RB-DOM-004;
6. RB-ARC-002 e RB-ARC-003;
7. RB-INC-068 a RB-INC-071;
8. `modules/trip-management/src/proposal-application.ts`;
9. `modules/proposal-management/src/proposal-application.ts`;
10. exports públicos dos dois módulos.

## 4. Contrato operacional

```text
AcceptItineraryProposal.execute
├── construir AcceptItineraryProposalCommand
│   ├── normalizar IDs e ator
│   ├── validar itens por ApplyProposalItems
│   ├── copiar instante
│   ├── derivar Proposed Activity IDs
│   └── calcular fingerprint
└── ApplyItineraryProposalTransaction.execute
    ├── applied
    ├── replay
    └── erro
```

## 5. Invariantes

- o aceite deste recorte é sempre integral;
- fingerprint nasce antes da primeira escrita;
- ordem dos itens é semântica;
- orchestrator chama uma única operação transacional;
- nenhuma etapa individual de persistência é exposta;
- replay não produz nova mutação;
- falha pública usa código allowlisted;
- falha técnica desconhecida não é mascarada como Planning Conflict;
- comando e coleções são imutáveis.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os definidos na seção 9 do incremento.

## 7. Restrições

- não importar Database, Drizzle ou SQL;
- não abrir transação física;
- não carregar ou salvar aggregates diretamente;
- não criar repository genérico para o orchestrator;
- não implementar locks;
- não validar autorização de sessão;
- não criar Server Action ou UI;
- não aceitar `applicationType: partial`;
- não converter falha técnica em Planning Conflict;
- não recalcular fingerprint dentro do adapter futuro com semântica diferente.

## 8. Decisões locais

- os itens reutilizam o contrato público `ApplyProposalItems` de Itinerary Planning;
- Proposed Activity IDs são derivados após normalização;
- o fingerprint usa a mesma função canônica do núcleo de Proposal Application;
- o instante da decisão recebe cópia defensiva;
- os resultados incluem Proposal Application ID e Decision ID para replay observável;
- o port pertence à fronteira do caso de uso, enquanto sua implementação física será infraestrutura.

## 9. Testes obrigatórios

- comando normalizado;
- fingerprint canônico;
- instante copiado;
- envelope e coleções congelados;
- ator e instante inválidos;
- item inválido;
- delegação única;
- `applied` e `replay`;
- erro público;
- falha técnica;
- port ausente.

## 10. Comandos

```bash
pnpm exec prettier --check modules/proposal-management/src/accept-itinerary-proposal.ts modules/proposal-management/src/accept-itinerary-proposal.test.ts modules/proposal-management/src/index.ts docs/implementation/increments/rb-inc-072-accept-itinerary-proposal-orchestration.md docs/implementation/context-packs/rb-inc-072-accept-itinerary-proposal-orchestration.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/proposal-management lint
pnpm --filter @routebook/proposal-management typecheck
pnpm --filter @routebook/proposal-management test
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

## 11. Quando interromper e escalar

- o caso de uso exigir aceite parcial;
- o fingerprint precisar mudar de schema ou semântica;
- o port precisar expor etapas individuais da transação;
- surgir necessidade de transformar falha técnica em Planning Conflict;
- o recorte exigir autorização, Server Action ou UI;
- a implementação exigir contrariar a transação local aprovada no RB-ADR-027.
