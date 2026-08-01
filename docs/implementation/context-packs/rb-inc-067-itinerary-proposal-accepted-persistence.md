---
id: RB-CTX-067
title: Context Pack do RB-INC-067
description: Fornece o contexto mínimo para persistir e reidratar uma Itinerary Proposal accepted.
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
  - persistence
  - acceptance
related_documents:
  - RB-INC-067
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-006
  - RB-INC-055
  - RB-INC-066
prerequisites:
  - RB-INC-055
  - RB-INC-066
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-067

## 1. Missão

Persistir e reidratar Proposal `accepted` como snapshot auditável, reutilizando a finalização pública pós-aplicação e preservando os demais estados.

## 2. Incremento

- ID: `RB-INC-067`;
- issue: `#150`;
- branch: `codex/rb-inc-067-accepted-persistence`;
- arquivo: `docs/implementation/increments/rb-inc-067-itinerary-proposal-accepted-persistence.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. o incremento RB-INC-067;
6. RB-INC-055, RB-INC-059, RB-INC-063 e RB-INC-066;
7. ciclo oficial, regras RB-BR-PRP-001, 004, 006, 008–009 e `ItineraryProposalAccepted`;
8. modelos lógico e físico de Itinerary Proposal;
9. RB-ADR-006;
10. aggregate, schema, repository, testes, migration `0016` e journal atuais.

## 4. Contrato físico

```text
status = accepted
accepted_at IS NOT NULL
updated_at = accepted_at
generated_at <= accepted_at < valid_until
snapshot ready completo
rejected_at, expired_at, failed_at e cancelled_at IS NULL
```

Nos demais estados, `accepted_at IS NULL`.

## 5. Reidratação obrigatória

```text
requestItineraryProposal
→ startItineraryProposalGeneration
→ completeItineraryProposalGeneration
→ finalizeAppliedItineraryProposalAcceptance(ready, acceptedAt)
```

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 8 do incremento.

## 7. Restrições

- não alterar o aggregate;
- não construir `accepted` por cast ou objeto manual;
- não remover ou renomear coluna existente;
- não criar comando, API, Server Action ou UI;
- não escrever no Itinerary ou outro bounded context;
- não adicionar Provider, dependência, evento ou Outbox;
- não ampliar schema para aceite parcial.

## 8. Testes obrigatórios

- save, find e list de `accepted` com snapshot completo;
- Proposed Activities preservadas;
- `accepted_at` ausente, fora da validade ou incoerente rejeitado;
- conteúdo incompleto rejeitado;
- `accepted_at` proibido nos demais estados;
- regressão dos estados anteriores.

## 9. Comandos

```bash
pnpm exec prettier --check --ignore-unknown packages/database/src/proposal-schema.ts packages/database/src/proposal-repository.ts packages/database/src/proposal-repository.test.ts packages/database/drizzle/0017_persist_accepted_itinerary_proposals.sql packages/database/drizzle/meta/_journal.json docs/implementation/increments/rb-inc-067-itinerary-proposal-accepted-persistence.md docs/implementation/context-packs/rb-inc-067-itinerary-proposal-accepted-persistence.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/database lint
pnpm --filter @routebook/database typecheck
pnpm --filter @routebook/proposal-management test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

PostgreSQL deve ser executado no CI quando `DATABASE_URL` local não estiver disponível.

## 10. Quando interromper e escalar

- a migration exigir transformação ou remoção de dado;
- o adapter não puder reidratar pela operação pública;
- surgir necessidade de coordenação com Itinerary ou Decision Intelligence;
- for necessário conceito ou estado não canônico.
