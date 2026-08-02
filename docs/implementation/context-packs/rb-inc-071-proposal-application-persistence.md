---
id: RB-CTX-071
title: Context Pack do RB-INC-071
description: Fornece o contexto mínimo para persistir e reidratar Proposal Application com idempotência canônica no PostgreSQL.
document_type: implementation-context-pack
owner: Data and Persistence
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
  - persistence
  - idempotency
related_documents:
  - RB-INC-071
  - RB-CORE-0004
  - RB-DOM-003
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-006
  - RB-ADR-027
  - RB-INC-069
  - RB-INC-070
prerequisites:
  - RB-ADR-027
  - RB-INC-069
  - RB-INC-070
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-071

## 1. Missão

Implementar a persistência PostgreSQL de `Proposal Application`, mantendo o lifecycle e o fingerprint idempotente definidos pelo domínio como fonte semântica.

## 2. Incremento

- ID: `RB-INC-071`;
- issue: `#165`;
- PR: `#166`;
- branch: `feature/rb-inc-071-proposal-application-persistence`;
- arquivo: `docs/implementation/increments/rb-inc-071-proposal-application-persistence.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/implementation/README.md`;
4. RB-ADR-006 e RB-ADR-027;
5. RB-DOM-003;
6. RB-DATA-001 e RB-DATA-002;
7. RB-INC-069;
8. RB-INC-070;
9. `modules/proposal-management/src/proposal-application.ts`;
10. migrations e repositories existentes em `packages/database`.

## 4. Contrato operacional

```text
PostgresProposalApplicationRepository
├── create
│   ├── INSERT com unicidade idempotente
│   ├── created
│   ├── replay
│   └── fingerprint-conflict
├── findById
├── findByIdempotencyKey
└── saveTerminal
    ├── succeeded
    ├── failed
    └── retry equivalente
```

## 5. Invariantes

- uma Proposal e chave possuem no máximo uma tentativa canônica;
- fingerprint persistido corresponde ao payload canônico;
- estado `started` não possui conclusão ou resultado;
- estado `succeeded` possui versão resultante e conclusão, sem failure code;
- estado `failed` possui failure code e conclusão, sem versão resultante;
- uma conclusão terminal não é sobrescrita por resultado divergente;
- reidratação usa operações públicas do domínio;
- o domínio não importa Drizzle ou PostgreSQL.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os definidos na seção 9 do incremento.

## 7. Restrições

- não alterar o Itinerary;
- não finalizar a Itinerary Proposal como `accepted`;
- não registrar Decision;
- não implementar transação compartilhada;
- não criar Server Action ou UI;
- não tratar fingerprint divergente como replay;
- não reconstruir objetos de domínio por cast bruto;
- não permitir update terminal sem condição `status = 'started'`;
- não remover as constraints de lifecycle para simplificar o adapter.

## 8. Decisões locais

- `request_payload` usa JSONB para auditoria e recomputação do fingerprint;
- a unicidade é `itinerary_proposal_id + idempotency_key`;
- o repository recebe um executor SQL, permitindo reutilização em futura transação física;
- conflito da chave é resolvido carregando a tentativa canônica;
- conclusão repetida é aceita somente quando o resultado terminal é equivalente;
- divergência persistida produz erro de corrupção ou concorrência, conforme a origem.

## 9. Testes obrigatórios

- migration e constraints;
- round trip dos três estados;
- replay equivalente;
- fingerprint divergente;
- conflito concorrente sem linha carregável;
- resultado terminal idempotente;
- resultado terminal divergente;
- payload corrompido;
- validações de criação e conclusão.

## 10. Comandos

```bash
pnpm exec prettier --check packages/database/drizzle/0018_create_proposal_applications.sql packages/database/src/proposal-application-migration.test.ts packages/database/src/proposal-application-repository.ts packages/database/src/proposal-application-repository.test.ts docs/implementation/increments/rb-inc-071-proposal-application-persistence.md docs/implementation/context-packs/rb-inc-071-proposal-application-persistence.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/database lint
pnpm --filter @routebook/database typecheck
pnpm --filter @routebook/database test
pnpm db:migrate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

## 11. Quando interromper e escalar

- a persistência exigir mudar o fingerprint canônico;
- o lifecycle precisar de estado diferente de `started`, `succeeded` ou `failed`;
- o recorte exigir alterar o Itinerary ou a Proposal na mesma transação;
- for necessário registrar Decision neste incremento;
- a solução exigir quebrar a estratégia aprovada no RB-ADR-027;
- surgir necessidade de aceitar payload divergente com a mesma chave.
