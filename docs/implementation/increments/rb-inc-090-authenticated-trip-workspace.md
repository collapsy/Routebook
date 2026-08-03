---
id: RB-INC-090
title: Workspace Autenticado e Isolado de Trips
description: Conecta a sessão Better Auth à coleção, criação e navegação de Trips com isolamento por Account e autorização server-side.
document_type: implementation-increment
owner: Identity and Access
status: Draft
version: "0.1.0"
created: "2026-08-03"
last_updated: "2026-08-03"
authors:
  - RouteBook Team
tags:
  - implementation
  - identity
  - authorization
  - trip
  - account
  - session
  - web
related_documents:
  - RB-CORE-0004
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

# RB-INC-090 — Workspace Autenticado e Isolado de Trips

## 1. Objetivo

Conectar a sessão Better Auth ao workspace de Trips para que coleção, criação e páginas internas usem identidade server-side e isolamento por Account.

Issue: [#205](https://github.com/collapsy/Routebook/issues/205).

Branch: `feature/rb-inc-090-authenticated-trip-workspace`.

Pull request: a registrar após a criação.

## 2. Contexto

RB-INC-086 a RB-INC-089 publicaram autenticação, autorização de Trip, Account pessoal, criação autenticada e a experiência de cadastro, entrada e saída. A interface de Trips ainda usa o repositório legado global e permite que o navegador informe o owner da nova Trip.

Este incremento conecta essas fundações à jornada já existente sem alterar invariantes de domínio nem introduzir novos Providers.

## 3. Resultado verificável

- `/viagens` exige sessão e lista apenas Trips de Accounts acessíveis ao User;
- `/viagens/nova` exige sessão;
- criação usa `createPostgresAuthenticatedTrip` e deriva owner de `auth_users`;
- o formulário não recebe `ownerName`;
- Trips legadas sem Account não aparecem na coleção autenticada;
- membership ou Account inativa não concede visibilidade;
- `/viagens/[tripId]` e páginas descendentes exigem `trip:view`;
- recurso inexistente, sem escopo ou sem membership responde como não encontrado;
- falhas técnicas desconhecidas não são mascaradas como autorização negada.

## 4. Fluxo

```mermaid
flowchart TD
    Request[Request de /viagens] --> Session{Sessão válida?}
    Session -- não --> Login[Redirect para /entrar]
    Session -- sim --> Collection[Consultar Trips por membership ativa]
    Collection --> Workspace[Workspace isolado]

    Create[Formulário nova Trip] --> SessionCreate[Sessão server-side]
    SessionCreate --> AuthenticatedCreate[createPostgresAuthenticatedTrip]
    AuthenticatedCreate --> Personal[Resolver ou criar Account pessoal]
    Personal --> Persist[Persistir Trip escopada]

    Detail[/viagens/tripId] --> ViewAuth[authorizeTripAction trip:view]
    ViewAuth --> Allowed{Autorizado?}
    Allowed -- sim --> Page[Página descendente]
    Allowed -- não --> NotFound[notFound]
```

## 5. Escopo

- query PostgreSQL para listar Trips acessíveis por User;
- proteção server-side da coleção e criação;
- criação autenticada pela composition root existente;
- remoção do owner controlado pelo formulário;
- guard de leitura no layout dinâmico de Trip;
- testes unitários, PostgreSQL e E2E;
- Context Pack, registry e rastreabilidade.

## 6. Fora de escopo

- autorização individual das Server Actions internas de edição;
- backfill de Trips legadas;
- convites e gerenciamento de Accounts compartilhadas;
- alteração das roles owner, editor e viewer;
- proteção de rotas fora de `/viagens`;
- aceite de Itinerary Proposal pela interface.

## 7. Segurança

- UserId é obtido exclusivamente da sessão;
- owner não é aceito de `FormData`;
- a coleção exige Account e membership ativas;
- autorização de recurso é executada no servidor;
- falhas de acesso não distinguem recurso inexistente de recurso alheio;
- erros técnicos desconhecidos continuam observáveis internamente.

## 8. Critérios de aceite

- [ ] sessão obrigatória em `/viagens`;
- [ ] sessão obrigatória em `/viagens/nova`;
- [ ] coleção isolada por Account Membership ativa;
- [ ] Trips legadas sem Account excluídas;
- [ ] criação autenticada implementada;
- [ ] owner removido do formulário;
- [ ] layout de Trip protegido por `trip:view`;
- [ ] isolamento entre Users coberto em PostgreSQL;
- [ ] jornada autenticada coberta em E2E;
- [ ] registry e rastreabilidade atualizados;
- [ ] validações finais do CI aprovadas.

## 9. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| vazamento entre Accounts | Crítico | joins explícitos por Account e membership ativa |
| owner controlado pelo cliente | Crítico | derivação exclusiva da sessão e de `auth_users` |
| enumeração por URL | Alto | `notFound` para negações conhecidas |
| esconder falha técnica | Alto | somente erros de autorização conhecidos são normalizados |
| regressão da jornada existente | Alto | E2E completo de cadastro, criação e visualização |

## 10. Rollback

Restaurar a listagem e criação legadas, remover o guard de layout e a query escopada. Nenhuma migration nova é necessária neste incremento.

## 11. Evidências

As evidências serão registradas após a execução dos validadores e do E2E no HEAD final da PR.
