---
id: RB-INC-067
title: Persistência da Itinerary Proposal Accepted
description: Persiste e reidrata uma Itinerary Proposal accepted com seu snapshot auditável preservado.
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
  - acceptance
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
  - RB-INC-066
prerequisites:
  - RB-INC-055
  - RB-INC-066
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-067 — Persistência da Itinerary Proposal Accepted

## 1. Objetivo

Persistir e reidratar a finalização `ready → accepted`, registrando `acceptedAt` e preservando conteúdo, versões e proveniência da Itinerary Proposal integralmente aplicada.

Issue: [#150](https://github.com/collapsy/Routebook/issues/150).

Branch: `codex/rb-inc-067-accepted-persistence`.

Pull request: [#151](https://github.com/collapsy/Routebook/pull/151).

## 2. Problema

O aggregate finaliza uma aplicação válida em `accepted`, mas o schema físico não possui `accepted_at`, não admite o estado e o adapter não consegue salvá-lo ou reidratá-lo.

## 3. Resultado verificável

- migration `0017` adiciona `accepted_at` sem remover dados;
- estado `accepted` exige o snapshot completo originado de `ready`;
- `accepted_at` é igual a `updated_at`, não antecede `generated_at` e antecede `valid_until`;
- adapter salva e reidrata pela operação pública de finalização pós-aplicação;
- Proposed Activities, conteúdo, versões e proveniência permanecem inalterados;
- find e list fazem round trip fiel;
- estados anteriores mantêm `accepted_at` nulo.

## 4. Invariantes

1. `accepted` representa Proposal integralmente aplicada;
2. somente o resultado `ready → accepted` integra este recorte;
3. Proposal aceita mantém o snapshot auditável;
4. reidratação usa operações públicas do aggregate;
5. migration é aditiva e não altera Itinerary;
6. nenhum comando de aplicação, Provider ou bounded context externo é acoplado.

## 5. Escopo

- coluna e constraints físicas de aceite;
- schema Drizzle;
- mapping, persistência e reidratação no repository;
- testes PostgreSQL de round trip, preservação e constraints;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- `AcceptItineraryProposal`, `ApplyProposalItems` ou coordenação transacional;
- Proposal Application, Decision, evento persistido ou Outbox;
- aceite parcial;
- API, Server Action ou UI;
- alteração do Itinerary ou de outro bounded context.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-067-itinerary-proposal-accepted-persistence.md`

## 8. Caminhos permitidos

```text
packages/database/src/proposal-schema.ts
packages/database/src/proposal-repository.ts
packages/database/src/proposal-repository.test.ts
packages/database/drizzle/0017_persist_accepted_itinerary_proposals.sql
packages/database/drizzle/meta/_journal.json
docs/implementation/increments/rb-inc-067-itinerary-proposal-accepted-persistence.md
docs/implementation/context-packs/rb-inc-067-itinerary-proposal-accepted-persistence.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] Proposal `accepted` faz round trip com `acceptedAt` e `updatedAt` preservados;
- [x] conteúdo, referências, versões, proveniência e Proposed Activities permanecem inalterados;
- [x] listagem reidrata Proposals `accepted` em ordem estável;
- [x] constraints rejeitam `accepted` incompleta, sem `accepted_at` ou temporalmente inválida;
- [x] estados anteriores continuam válidos somente com `accepted_at` nulo;
- [x] migration é aditiva e mantém linhas existentes válidas;
- [x] nenhuma escrita altera Itinerary ou outro bounded context;
- [x] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- round trip `ready → accepted` com snapshot e Proposed Activities;
- listagem contendo Proposal `accepted`;
- `accepted_at` obrigatório, anterior a `valid_until` e coerente com `updated_at`;
- conteúdo completo obrigatório;
- `accepted_at` proibido nos demais estados;
- regressão dos estados persistidos anteriores;
- migrations e testes PostgreSQL no CI;
- validações documentais e do monorepo.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| perder snapshot histórico | Alto | tratar `accepted` como estado portador de conteúdo |
| reidratar por objeto manual | Alto | reconstruir `ready` e chamar a finalização pública |
| aceitar linha temporalmente inválida | Alto | constraints de lifecycle e timeline |
| remover itens no save | Alto | persistir Proposed Activities na transação existente |

## 12. Segurança e privacidade

O incremento adiciona somente timestamp canônico e preserva dados já permitidos, sem secret, payload de Provider ou dado pessoal novo.

## 13. Rollback

A migration é aditiva. Depois de aplicada, o roll-forward é preferível; remover a coluna seria operação destrutiva fora deste incremento.

## 14. Evidências

Evidências locais:

- 175 documentos e 175 registros validados, com quatro avisos preexistentes;
- lint e typecheck do package database aprovados;
- 77 testes do Proposal Management aprovados;
- lint, typecheck e build integrais aprovados;
- Prettier dos arquivos suportados e `git diff --check` aprovados;
- migration e testes PostgreSQL não executados localmente porque `DATABASE_URL` não está configurada e o Docker está indisponível.

Evidências de CI:

- run [30721948907](https://github.com/collapsy/Routebook/actions/runs/30721948907) validou a documentação;
- run [30721948930](https://github.com/collapsy/Routebook/actions/runs/30721948930) aplicou as migrations no PostgreSQL e aprovou formatação, documentação, lint, typecheck, suíte integral, smoke do servidor, build e 56 testes E2E responsivos.
