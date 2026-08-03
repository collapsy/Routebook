---
id: RB-CTX-090
title: Context Pack do RB-INC-090
description: Contexto mínimo para manter o workspace autenticado e isolado de Trips do RouteBook.
document_type: implementation-context-pack
owner: Identity and Access
status: Draft
version: "0.1.0"
created: "2026-08-03"
last_updated: "2026-08-03"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - identity
  - authorization
  - trip
  - account
related_documents:
  - RB-INC-090
  - RB-SEC-001
  - RB-ADR-007
  - RB-ADR-008
  - RB-INC-086
  - RB-INC-087
  - RB-INC-088
  - RB-INC-089
prerequisites:
  - RB-INC-086
  - RB-INC-087
  - RB-INC-088
  - RB-INC-089
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-090

## 1. Missão

Manter a coleção, criação e navegação de páginas de Trip vinculadas à identidade server-side e ao isolamento por Account, sem confiar em UserId, owner ou Account fornecidos pelo navegador.

## 2. Incremento

- ID: `RB-INC-090`;
- issue: `#205`;
- PR: `#206`;
- branch: `feature/rb-inc-090-authenticated-trip-workspace`;
- documento: `docs/implementation/increments/rb-inc-090-authenticated-trip-workspace.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-SEC-001, RB-ADR-007 e RB-ADR-008;
3. RB-INC-086 a RB-INC-089;
4. `apps/web/lib/auth-session.ts`;
5. `apps/web/lib/trip-route-access.ts`;
6. `apps/web/app/viagens/page.tsx`;
7. `apps/web/app/viagens/nova/actions.ts`;
8. `apps/web/app/viagens/[tripId]/layout.tsx`;
9. `packages/database/src/authenticated-trip-query.ts`;
10. `packages/database/src/authenticated-trip-service.ts`;
11. `modules/identity-access/src/trip-authorization.ts`.

## 4. Contrato operacional

```text
Request
├── resolver sessão Better Auth
├── obter UserId server-side
├── coleção: filtrar por Account ativa + membership ativa
├── criação: provisionar/reutilizar Account pessoal e persistir Trip
└── recurso: autorizar trip:view antes da página descendente
```

## 5. Invariantes

- UserId vem somente da sessão;
- owner de Trip vem de `auth_users`;
- Account não vem de `FormData`;
- coleção não usa o repositório global legado;
- Trip sem `account_id` não aparece no workspace autenticado;
- Account ou membership inativa não concede leitura;
- qualquer role ativa pode executar `trip:view`;
- negações conhecidas de recurso são ocultadas como não encontrado;
- falha técnica desconhecida continua sendo erro técnico;
- layout protege páginas, mas não substitui autorização das Server Actions internas.

## 6. Restrições

- não reintroduzir `ownerName` no formulário;
- não aceitar UserId ou AccountId do navegador;
- não usar filtro em memória após listar todas as Trips;
- não tratar Trip legada sem Account como pertencente ao User;
- não transformar erro PostgreSQL em `notFound`;
- não ampliar este incremento para convites ou gestão de membership;
- não considerar layout suficiente para autorizar mutações server-side.

## 7. Testes mínimos

- User vê apenas Trips de memberships ativas;
- User não vê Trips de outro User;
- membership suspensa não concede visibilidade;
- Account suspensa não concede visibilidade;
- Trip sem Account não aparece;
- ausência de sessão interrompe antes da autorização;
- membership válida produz contexto autorizado;
- recurso ausente ou alheio fica oculto;
- falha técnica desconhecida é propagada;
- E2E cobre redirecionamento anônimo, criação autenticada e isolamento entre Users.

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

## 9. Próximo limite técnico

Autorizar individualmente as Server Actions de edição e decisão executadas dentro de `/viagens/[tripId]`, usando `trip:edit` ou `trip:accept-proposal` conforme a operação.

## 10. Quando escalar

- regras de roles precisarem mudar;
- Account compartilhada exigir seleção explícita;
- Trips legadas precisarem de backfill;
- coleção precisar de paginação ou busca;
- produto exigir distinção visual entre Accounts;
- novas ações de Trip não se encaixarem nas permissões canônicas.
