---
id: RB-CTX-087
title: Context Pack do RB-INC-087
description: Contexto mínimo para implementar Account Membership, escopo de Trip e autorização server-side deny-by-default.
document_type: implementation-context-pack
owner: Identity and Access
status: Draft
version: "0.1.0"
created: "2026-08-02"
last_updated: "2026-08-02"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - authorization
  - account
  - membership
  - trip
related_documents:
  - RB-INC-087
  - RB-CORE-0004
  - RB-SEC-001
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-007
  - RB-ADR-008
  - RB-INC-085
  - RB-INC-086
prerequisites:
  - RB-ADR-008
  - RB-INC-086
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-087

## 1. Missão

Publicar a primeira fronteira concreta de autorização do RouteBook, ligando User autenticado, Trip, Account Membership e ação solicitada sem misturar autenticação, UI ou execução do caso de uso protegido.

## 2. Incremento

- ID: `RB-INC-087`;
- issue: `#199`;
- PR: `#200`;
- branch: `feature/rb-inc-087-account-membership-trip-authorization`;
- documento: `docs/implementation/increments/rb-inc-087-account-membership-trip-authorization.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-ADR-007 e RB-ADR-008;
3. RB-SEC-001 e RB-DATA-001–002;
4. RB-INC-085–086;
5. `modules/identity-access/src/identity.ts`;
6. `modules/identity-access/src/trip-authorization.ts`;
7. `packages/database/src/identity-schema.ts`;
8. `packages/database/src/trip-authorization-repository.ts`;
9. migration `0021_create_accounts_and_trip_authorization.sql`.

## 4. Contrato operacional

```text
User autenticado + TripId + TripAction
→ carregar Trip scope
→ exigir accountId
→ carregar membership por accountId + userId
→ exigir status active
→ avaliar role + action
→ AuthorizedTripContext ou erro allowlisted
```

## 5. Invariantes

- autenticação não concede acesso por si só;
- Account é a fronteira de tenant;
- membership deve pertencer simultaneamente à Account e ao User;
- membership deve estar ativa;
- viewer não executa mutações;
- owner e editor ativos podem aceitar Itinerary Proposal;
- Trip sem Account é negada;
- Trip inexistente não é confundida com Trip sem Account;
- role ou status desconhecido no banco é falha técnica;
- nenhuma regra usa mensagem livre ou valor enviado pelo cliente;
- acesso é negado por padrão.

## 6. Restrições

- não criar UI de membros;
- não criar convite;
- não provisionar Account no sign-up;
- não atribuir Trip legada automaticamente;
- não usar `TripParticipant` como substituto de membership;
- não criar Server Action de aceite;
- não colocar autorização dentro do Better Auth;
- não adicionar RLS neste incremento;
- não permitir fallback para owner em contexto incompleto.

## 7. Testes mínimos

- criação de Account pessoal e owner membership;
- validação de IDs e nome;
- matriz completa de owner, editor e viewer;
- Trip inexistente;
- Trip sem Account;
- membership ausente;
- membership inativa;
- permissão insuficiente;
- membership de outra Account;
- owner e editor autorizados;
- PostgreSQL real com FK para auth user;
- cross-account negado;
- viewer negado;
- Trip unscoped negada.

## 8. Comandos

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm db:migrate
pnpm test
pnpm build
pnpm test:e2e
```

## 9. Quando escalar

- uma ação exigir regra além de role e recurso;
- Trip precisar ser obrigatoriamente escopada antes do rollout progressivo;
- provisioning de Account precisar ser atômico com sign-up;
- o modelo de TripParticipant precisar ser reconciliado com memberships;
- autorização exigir novo código público;
- RLS se tornar requisito imediato.
