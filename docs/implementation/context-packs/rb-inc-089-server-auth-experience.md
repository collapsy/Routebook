---
id: RB-CTX-089
title: Context Pack do RB-INC-089
description: Contexto mínimo para manter a experiência server-side de cadastro, entrada e saída do RouteBook.
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
  - authentication
  - better-auth
  - server-actions
related_documents:
  - RB-INC-089
  - RB-SEC-001
  - RB-ADR-007
  - RB-INC-086
  - RB-INC-087
  - RB-INC-088
prerequisites:
  - RB-INC-086
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-089

## 1. Missão

Manter cadastro, entrada e saída como operações server-side, com cookies gerenciados pelo Better Auth, redirecionamentos internos restritos e mensagens de interface que não exponham detalhes técnicos.

## 2. Incremento

- ID: `RB-INC-089`;
- issue: `#203`;
- PR: `#204`;
- branch: `feature/rb-inc-089-server-auth-experience`;
- documento: `docs/implementation/increments/rb-inc-089-server-auth-experience.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-ADR-007 e RB-SEC-001;
3. RB-INC-086, RB-INC-087 e RB-INC-088;
4. `apps/web/lib/auth.ts`;
5. `apps/web/lib/auth-session.ts`;
6. `apps/web/lib/auth-experience.ts`;
7. `apps/web/app/auth-actions.ts`;
8. `apps/web/components/auth-form.tsx`;
9. `apps/web/components/app-shell.tsx`.

## 4. Contrato operacional

```text
FormData
├── normalizar nome/email
├── validar senha
├── resolver next seguro
├── chamar auth.api no servidor
├── nextCookies propagar cookie
└── redirecionar ou retornar estado estável
```

## 5. Invariantes

- credenciais não são processadas por API client-side;
- senha nunca entra no estado retornado;
- `next` externo ou fora de `/viagens` vira `/viagens`;
- somente códigos conhecidos são traduzidos para mensagens específicas;
- falha desconhecida é registrada tecnicamente e recebe fallback genérico;
- sessão autenticada redireciona para fora das páginas de auth;
- logout usa os headers da requisição atual;
- App Shell não concede autorização de recurso;
- autorização continua dependendo de RB-INC-087.

## 6. Restrições

- não adicionar OAuth, MFA, passkeys ou recuperação de senha;
- não proteger todas as rotas neste incremento;
- não provisionar Account no cadastro;
- não aceitar callback absoluto;
- não retornar email ou senha no estado da action;
- não mapear mensagens técnicas por substring;
- não transformar sessão em membership;
- não alterar fluxos de Trip ou Proposal.

## 7. Testes mínimos

- normalização de nome e email;
- validação de nome, email e senha;
- allowlist de retorno;
- rejeição de URL absoluta, protocol-relative e backslash;
- mapeamento de credencial inválida;
- mapeamento de conta existente;
- propagação de erro técnico desconhecido no núcleo;
- forwarding dos headers no logout;
- cadastro E2E cria sessão;
- logout revoga sessão;
- login E2E recria sessão;
- `next` externo não é seguido.

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

- produto exigir verificação de email;
- recuperação de senha entrar no escopo;
- OAuth ou MFA for necessário;
- rotas precisarem de proteção global;
- sessão precisar provisionar Account no cadastro;
- destinos além de `/viagens` precisarem ser permitidos;
- Better Auth alterar códigos ou contratos da API server-side.
