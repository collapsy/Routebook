---
id: RB-CTX-088
title: Context Pack do RB-INC-088
description: Contexto mínimo para provisionar Account pessoal idempotente e criar Trip escopada em uma única transação PostgreSQL.
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
  - account
  - provisioning
  - trip
  - transaction
related_documents:
  - RB-INC-088
  - RB-CORE-0004
  - RB-SEC-001
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-007
  - RB-ADR-008
  - RB-INC-086
  - RB-INC-087
prerequisites:
  - RB-INC-086
  - RB-INC-087
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-088

## 1. Missão

Publicar uma composição PostgreSQL que transforme o User autenticado e dados válidos de Trip em uma Trip escopada à Account pessoal correta, sem confiar em identificadores de owner fornecidos pelo cliente.

## 2. Incremento

- ID: `RB-INC-088`;
- issue: `#201`;
- PR: `#202`;
- branch: `feature/rb-inc-088-personal-account-authenticated-trip`;
- documento: `docs/implementation/increments/rb-inc-088-personal-account-authenticated-trip.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-ADR-007 e RB-ADR-008;
3. RB-INC-086 e RB-INC-087;
4. `modules/trip-management/src/trip.ts`;
5. `modules/identity-access/src/identity.ts`;
6. `packages/database/src/auth-schema.ts`;
7. `packages/database/src/identity-schema.ts`;
8. `packages/database/src/authenticated-trip-service.ts`;
9. migration `0022_create_personal_account_ownerships.sql`.

## 4. Contrato operacional

```text
createPostgresAuthenticatedTrip
├── bloquear auth_users.id
├── rejeitar User ausente
├── criar Trip com ownerUserId canônico
├── resolver personal_account_ownerships
│   ├── existente: validar Account + owner membership
│   └── ausente: criar Account + membership + ownership
├── persistir Trip com account_id
└── commit ou rollback integral
```

## 5. Invariantes

- User autenticado é carregado do banco;
- `ownerUserId` não vem do formulário;
- User e Account pessoal possuem relação um-para-um persistente;
- Account pessoal possui owner membership ativa para o mesmo User;
- o User é bloqueado antes de verificar o vínculo;
- replay reutiliza Account e membership;
- concorrência não cria duplicatas;
- a Trip e o provisioning novo confirmam ou revertem juntos;
- Users diferentes não compartilham Account pessoal;
- fluxo legado continua funcional sem `ownerUserId`;
- erro técnico desconhecido não é mascarado.

## 6. Restrições

- não alterar a Server Action atual;
- não aceitar `ownerUserId` em FormData;
- não provisionar no sign-up;
- não mover Trips legadas;
- não inferir Account por nome ou email;
- não criar Account compartilhada;
- não realizar writes fora da transação;
- não criar Server Action de aceite;
- não transformar falha PostgreSQL desconhecida em regra de negócio.

## 7. Testes mínimos

- ownerUserId autenticado preservado;
- compatibilidade do owner técnico legado;
- ownerUserId inválido rejeitado;
- primeira execução cria Account pessoal;
- segunda execução reutiliza Account e membership;
- Users distintos recebem Accounts distintas;
- User inexistente não cria registros;
- duas chamadas concorrentes criam um único vínculo;
- falha condicionada no insert da Trip reverte Account, membership e ownership;
- Trip persistida recebe `account_id` correto.

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

- provisioning precisar ocorrer durante sign-up;
- Account pessoal precisar mudar de owner;
- uma Account pessoal precisar se tornar compartilhada;
- Trip precisar de `accountId` obrigatório no domínio;
- rollback não puder ser comprovado sem alterar contrato de produção;
- a criação autenticada precisar ser exposta ao formulário atual.
