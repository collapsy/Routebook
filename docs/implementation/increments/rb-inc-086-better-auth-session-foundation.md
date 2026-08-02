---
id: RB-INC-086
title: Fundação Better Auth e Sessão Server-Side
description: Implementa identidade, autenticação e sessão server-side com Better Auth e PostgreSQL, sem introduzir autorização de Trip ou UI de login.
document_type: implementation-increment
owner: Identity and Access
status: Draft
version: "0.1.0"
created: "2026-08-02"
last_updated: "2026-08-02"
authors:
  - RouteBook Team
tags:
  - implementation
  - identity
  - authentication
  - session
  - better-auth
  - security
related_documents:
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
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-086 — Fundação Better Auth e Sessão Server-Side

## 1. Objetivo

Implementar a fundação de identidade, autenticação e sessão server-side do RouteBook com Better Auth e PostgreSQL, preparando os próximos adapters protegidos sem introduzir ainda autorização de Trip ou experiência de login.

Issue: [#197](https://github.com/collapsy/Routebook/issues/197).

Branch: `feature/rb-inc-086-better-auth-session-foundation`.

Pull request: [#198](https://github.com/collapsy/Routebook/pull/198).

## 2. Contexto

RB-ADR-007 determina Better Auth como solução oficial de autenticação e sessão. RB-ADR-008 separa autenticação de autorização e exige políticas server-side para recursos protegidos.

Até este incremento, o repositório possuía identidades de domínio em TripParticipant, mas não tinha usuário autenticado, cookie de sessão validado, rota de autenticação ou schema físico de identidade.

## 3. Resultado verificável

- Better Auth fica fixado na versão `1.6.14`;
- `auth_users`, `auth_sessions`, `auth_accounts` e `auth_verifications` são tabelas explícitas do schema Drizzle;
- migration `0020_create_better_auth_tables.sql` cria os contratos físicos;
- a auth instance usa o mesmo PostgreSQL e Drizzle do RouteBook;
- IDs de autenticação são UUIDs;
- email e senha são habilitados como mecanismo inicial;
- `/api/auth/[...all]` expõe os handlers oficiais GET e POST;
- `getRouteBookSession` valida cookies por `auth.api.getSession` no servidor;
- cookie ausente, inválido ou revogado resulta em sessão nula;
- ambiente de produção exige segredo e URL explícitos;
- build de produção e ambientes de desenvolvimento/teste usam fallbacks apenas para validação e execução local;
- nenhum segredo real é versionado.

## 4. Componentes

```mermaid
flowchart LR
    Browser[Cookie HttpOnly] --> Route[/api/auth/...]
    Route --> Auth[Better Auth]
    Auth --> Adapter[Drizzle Adapter]
    Adapter --> PostgreSQL[(auth_* tables)]
    Server[Server Component ou Action] --> Resolver[getRouteBookSession]
    Resolver --> Auth
    Auth --> Session[Contexto autenticado mínimo]
```

## 5. Schema físico

### 5.1 `auth_users`

Mantém identidade autenticável, email normalizado pelo Better Auth, estado de verificação e metadados mínimos de perfil.

### 5.2 `auth_sessions`

Mantém token único, validade, vínculo ao usuário e metadados técnicos opcionais. A remoção do usuário elimina as sessões por cascade.

### 5.3 `auth_accounts`

Mantém credenciais locais ou vínculos futuros com providers. O par provider/account é único.

### 5.4 `auth_verifications`

Mantém tokens temporários necessários aos fluxos de verificação e recuperação futuros, mesmo que esses fluxos ainda não tenham UI.

## 6. Configuração de ambiente

- `BETTER_AUTH_SECRET` é obrigatório em runtime de produção;
- `BETTER_AUTH_URL` é obrigatória em runtime de produção;
- `.env.example` contém apenas placeholders;
- o segredo determinístico de desenvolvimento não deve ser utilizado em produção;
- o build Next.js pode avaliar a configuração sem credencial real, mas o runtime de produção continua fail-fast.

## 7. Escopo

- dependência Better Auth fixada;
- schema e migration;
- auth instance;
- adapter Drizzle;
- handler oficial Next.js;
- resolver server-side;
- testes de configuração e mapeamento;
- teste PostgreSQL de cadastro, cookie, leitura e logout;
- `drizzle-orm` declarado como dependência de desenvolvimento do web para limpeza precisa do fixture PostgreSQL;
- export do schema de autenticação;
- documentação, Context Pack, registry e rastreabilidade.

## 8. Fora de escopo

- páginas de cadastro, login ou logout;
- OAuth e social login;
- envio de email;
- recuperação de senha;
- Account Membership;
- autorização de Trip;
- associação automática entre usuário e TripParticipant;
- Server Action de aceite;
- proxy ou middleware global de proteção.

## 9. Critérios de aceite

- [x] Better Auth fixado em versão exata;
- [x] schema Drizzle explícito implementado;
- [x] migration sequencial criada e registrada;
- [x] auth instance PostgreSQL implementada;
- [x] rota oficial Next.js implementada;
- [x] resolver server-side implementado;
- [x] produção sem configuração falha explicitamente;
- [x] `.env.example` não contém segredo real;
- [x] testes unitários de configuração e sessão implementados;
- [x] teste PostgreSQL real implementado;
- [ ] validações finais do CI aprovadas.

## 10. Testes obrigatórios

- segredo e URL configurados;
- fallback permitido fora de produção;
- produção sem segredo ou URL;
- sessão ausente;
- sessão autenticada mapeada para contexto mínimo;
- criação real de usuário com email e senha;
- emissão de cookie de sessão;
- resolução da sessão por headers reais;
- logout e revogação;
- cookie inválido;
- migration em banco limpo;
- build Next.js da rota oficial.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| segredo de desenvolvimento usado em produção | Crítico | fail-fast no runtime de produção |
| schema divergir do adapter | Alto | teste PostgreSQL real pelo Better Auth |
| cookie bruto ser tratado como identidade confiável | Crítico | resolução exclusiva por `auth.api.getSession` |
| autenticação ser confundida com autorização | Alto | RB-ADR-008 e fora de escopo explícito |
| atualização não controlada da biblioteca | Alto | versão exata no manifest e lockfile |
| vazamento de dados internos da sessão | Médio | contexto server-side reduzido e imutável |

## 12. Rollback

Remover Better Auth, rota, resolver, schema, migration `0020`, exports, testes e documentos. Como a funcionalidade ainda não possui UI ou dados de produção, o rollback não exige transformação de domínio.

## 13. Evidências

O escopo funcional, a migration `0020`, o teste PostgreSQL real, a rota Next.js, o resolver de sessão e a governança documental estão consolidados. As evidências numéricas serão registradas após a aprovação dos workflows definitivos do HEAD da PR #198.
