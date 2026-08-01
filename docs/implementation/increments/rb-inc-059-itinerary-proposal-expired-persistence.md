---
id: RB-INC-059
title: Persistência da Itinerary Proposal Expired
description: Persiste e reidrata a expiração temporal de uma Itinerary Proposal pronta sem perder seu conteúdo auditável.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - proposal-management
  - persistence
  - expiration
related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-006
  - RB-INC-055
  - RB-INC-058
prerequisites:
  - RB-INC-055
  - RB-INC-058
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-059 — Persistência da Itinerary Proposal Expired

## 1. Objetivo

Persistir e reidratar a transição temporal `ready → expired`, registrando `expiredAt` e preservando integralmente o conteúdo revisável, as versões e a proveniência da Itinerary Proposal.

Issue: [#134](https://github.com/collapsy/Routebook/issues/134)

Branch: `codex/rb-inc-059-expired-persistence`.

Pull request: [#135](https://github.com/collapsy/Routebook/pull/135).

## 2. Problema

O domínio já expira temporalmente uma Proposal `ready`, mas o schema físico aceita somente o ciclo até `ready`, não possui `expired_at` e o adapter não consegue salvar ou reidratar `expired`. A tentativa atual falha por constraint ou descarta o lifecycle esperado.

## 3. Resultado verificável

- migration `0015` adiciona `expired_at` sem remover dados;
- status `expired` exige snapshot completo originado de `ready`;
- `expired_at` é maior ou igual a `valid_until` e igual a `updated_at`;
- adapter salva e reidrata pela operação pública do domínio;
- Proposed Activities, critérios, justificativas, limitações, conflitos e proveniência permanecem inalterados;
- `findById` e `listByTripId` fazem round trip fiel;
- estados anteriores mantêm `expired_at` nulo.

## 4. Invariantes

1. somente a transição temporal `ready → expired` integra este recorte;
2. Proposal `expired` não é aplicável e não altera Itinerary;
3. `expiredAt` deve alcançar ou ultrapassar `validUntil`;
4. conteúdo revisável e proveniência permanecem auditáveis;
5. reidratação usa as operações públicas do aggregate;
6. nenhum Provider, relógio, job ou bounded context externo é acoplado.

## 5. Escopo

- coluna e constraints físicas de expiração;
- schema Drizzle;
- mapping, persistência e reidratação no repository;
- testes PostgreSQL de round trip, preservação e constraints;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- command handler, scheduler, job, fila, API ou UI;
- expiração por versão, Contexto, cancelamento de Trip ou substituição;
- estados `partially-accepted`, `accepted`, `rejected` e `superseded`;
- aplicação total ou parcial da Proposal;
- Evento de Domínio, Outbox ou migration de produção.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-059-itinerary-proposal-expired-persistence.md`

## 8. Caminhos permitidos

```text
packages/database/src/proposal-schema.ts
packages/database/src/proposal-repository.ts
packages/database/src/proposal-repository.test.ts
packages/database/drizzle/0015_persist_expired_itinerary_proposals.sql
packages/database/drizzle/meta/_journal.json
docs/implementation/increments/rb-inc-059-itinerary-proposal-expired-persistence.md
docs/implementation/context-packs/rb-inc-059-itinerary-proposal-expired-persistence.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] Proposal `expired` faz round trip com `expiredAt` e `updatedAt` preservados;
- [x] conteúdo, referências, versões, proveniência e Proposed Activities permanecem inalterados;
- [x] listagem reidrata Proposals `expired` em ordem estável;
- [x] constraint rejeita `expired` incompleta, antecipada ou sem `expired_at`;
- [x] estados anteriores continuam válidos somente com `expired_at` nulo;
- [x] migration é aditiva e mantém linhas existentes válidas;
- [x] nenhuma escrita altera Itinerary ou outro bounded context;
- [x] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- round trip `ready → expired` com conteúdo e Proposed Activities;
- listagem contendo Proposal `expired`;
- constraint de `expired_at` obrigatório;
- constraint de expiração em ou depois de `valid_until`;
- constraint de conteúdo completo no estado `expired`;
- regressão dos estados `requested`, `generating`, `ready`, `failed` e `cancelled`;
- migrations PostgreSQL e testes do package database no CI;
- validações documentais e do monorepo.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| perder conteúdo histórico | Alto | tratar `ready` e `expired` como estados portadores do mesmo snapshot |
| reidratar estado sem validar o tempo | Alto | reconstruir `ready` e chamar `expireItineraryProposalByTime` |
| aceitar linha expirada inconsistente | Alto | constraints de lifecycle, conteúdo e timeline no PostgreSQL |
| remover itens durante o save | Alto | persistir Proposed Activities também em `expired`, na transação existente |

## 12. Segurança e privacidade

O incremento adiciona somente um timestamp de lifecycle e preserva dados já permitidos. Não registra prompt, token, secret, payload bruto de Provider nem dado pessoal novo.

## 13. Rollback

A migration é aditiva. Antes da integração, branch e migration podem ser revertidas. Depois de aplicada, o roll-forward é preferível; remover a coluna exige operação destrutiva fora deste incremento.

## 14. Evidências

- Prettier dos caminhos alterados e `git diff --check`: verdes;
- documentação: 159 documentos e 159 registros validados, com quatro avisos preexistentes;
- `@routebook/database`: lint e typecheck verdes;
- `@routebook/proposal-management`: 53 testes verdes;
- workspace: lint, typecheck e build verdes;
- suíte PostgreSQL não executada localmente porque `DATABASE_URL` não está configurada; migration e testes de integração foram cobertos pelo CI.
- PR #135, run `30713827362`: formatação, documentação, lint, typecheck, migration PostgreSQL, suíte de componentes e domínio, smoke, build e 50 testes Playwright responsivos verdes.
