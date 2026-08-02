---
id: RB-CTX-086
title: Context Pack do RB-INC-086
description: Contexto mínimo para implementar a fundação Better Auth, persistir sessões em PostgreSQL e expor identidade autenticada no servidor.
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
  - identity
  - authentication
  - session
  - better-auth
  - security
related_documents:
  - RB-INC-086
  - RB-CORE-0004
  - RB-SEC-001
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-007
  - RB-ADR-008
  - RB-INC-085
prerequisites:
  - RB-ADR-007
  - RB-ADR-008
  - RB-INC-085
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-086

## 1. Missão

Implementar a fundação de identidade autenticada e sessão server-side do RouteBook com Better Auth, PostgreSQL e Drizzle, sem antecipar autorização de Account ou Trip.

## 2. Incremento

- ID: `RB-INC-086`;
- issue: `#197`;
- PR: `#198`;
- branch: `feature/rb-inc-086-better-auth-session-foundation`;
- documento: `docs/implementation/increments/rb-inc-086-better-auth-session-foundation.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-ADR-007 e RB-ADR-008;
3. RB-SEC-001 e RB-DATA-001–002;
4. RB-INC-085;
5. `apps/web/lib/auth.ts`;
6. `apps/web/lib/auth-session.ts`;
7. `packages/database/src/auth-schema.ts`;
8. `packages/database/drizzle/0020_create_better_auth_tables.sql`.

## 4. Contrato operacional

```text
requisição HTTP
├── /api/auth/[...all]
│   └── handler oficial Better Auth
└── código server-side
    └── getRouteBookSession
        ├── headers reais ou injetados
        ├── auth.api.getSession
        └── contexto mínimo de User + Session
```

## 5. Invariantes

- autenticação confirma identidade, não autorização;
- Better Auth permanece um componente técnico do web;
- tabelas técnicas de autenticação utilizam prefixo físico `auth_`;
- o adapter usa o PostgreSQL e o Drizzle oficiais do monorepo;
- IDs técnicos são UUID;
- cookies são interpretados exclusivamente pelo servidor;
- segredo real nunca é versionado;
- produção normal sem segredo ou URL explícitos falha;
- build de produção pode usar valores determinísticos sem servir tráfego;
- sessão ausente, expirada, revogada ou inválida resulta em `null`;
- o contexto publicado não expõe campos técnicos desnecessários.

## 6. Restrições

- não criar UI de login, cadastro ou logout;
- não implementar OAuth neste incremento;
- não criar Account Membership;
- não autorizar acesso a Trip;
- não alterar `TripParticipant`;
- não proteger páginas por proxy global;
- não criar Server Action de aceite;
- não transportar senha ou token de sessão para Client Components;
- não depender de mensagem livre para classificar falha de autenticação.

## 7. Testes mínimos

- segredo e URL configurados explicitamente;
- valores determinísticos fora do runtime normal de produção;
- rejeição de produção sem configuração;
- sessão ausente retorna `null`;
- contexto autenticado contém somente os campos publicados;
- migration cria as quatro tabelas técnicas;
- cadastro por email e senha persiste usuário e conta;
- resposta de cadastro emite cookie de sessão;
- cookie válido é resolvido no servidor;
- logout revoga a sessão;
- cookie ausente ou inválido retorna `null`.

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

- Better Auth exigir alteração incompatível no schema físico;
- a sessão não puder ser validada sem expor token ao cliente;
- o build precisar de segredo real;
- autenticação e autorização precisarem ser misturadas;
- a criação do User de autenticação precisar criar Account ou membership atomicamente;
- um Provider externo precisar ser habilitado antes da fundação ficar estável.
