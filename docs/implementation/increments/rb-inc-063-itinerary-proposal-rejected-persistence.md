---
id: RB-INC-063
title: Persistência da Itinerary Proposal Rejected
description: Persiste e reidrata a rejeição de uma Itinerary Proposal pronta sem perder seu snapshot auditável.
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
  - rejection
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
  - RB-INC-059
  - RB-INC-062
prerequisites:
  - RB-INC-055
  - RB-INC-062
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-063 — Persistência da Itinerary Proposal Rejected

## 1. Objetivo

Persistir e reidratar a transição `ready → rejected`, registrando `rejectedAt` e preservando integralmente o conteúdo revisável, as versões e a proveniência da Itinerary Proposal.

Issue: [#142](https://github.com/collapsy/Routebook/issues/142)

Branch: `codex/rb-inc-063-rejected-persistence`.

Pull request: pendente.

## 2. Problema

O aggregate já rejeita uma Proposal `ready`, mas o schema físico não possui `rejected_at`, não aceita `rejected` e o adapter não consegue salvar ou reidratar esse estado. A tentativa atual falha por constraint ou apresenta status não suportado.

## 3. Resultado verificável

- migration `0016` adiciona `rejected_at` sem remover dados;
- status `rejected` exige snapshot completo originado de `ready`;
- `rejected_at` é maior ou igual a `generated_at` e igual a `updated_at`;
- adapter salva e reidrata pela operação pública `rejectItineraryProposal`;
- Proposed Activities, critérios, justificativas, limitações, conflitos e proveniência permanecem inalterados;
- `findById` e `listByTripId` fazem round trip fiel;
- estados anteriores mantêm `rejected_at` nulo.

## 4. Invariantes

1. somente a transição `ready → rejected` integra este recorte;
2. Proposal `rejected` não altera o Itinerary;
3. `rejectedAt` não pode anteceder `generatedAt`;
4. conteúdo revisável e proveniência permanecem auditáveis;
5. reidratação usa operações públicas do aggregate;
6. nenhum Provider, relógio, comando ou bounded context externo é acoplado.

## 5. Escopo

- coluna e constraints físicas de rejeição;
- schema Drizzle;
- mapping, persistência e reidratação no repository;
- testes PostgreSQL de round trip, preservação e constraints;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- command handler, API, Server Action ou UI;
- motivo de rejeição não definido no contrato canônico;
- estados `partially-accepted`, `accepted` e `superseded`;
- aplicação total ou parcial da Proposal;
- Decision, Evento de Domínio persistido, Outbox ou migration de produção;
- alteração do Itinerary ou de outro bounded context.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-063-itinerary-proposal-rejected-persistence.md`

## 8. Caminhos permitidos

```text
packages/database/src/proposal-schema.ts
packages/database/src/proposal-repository.ts
packages/database/src/proposal-repository.test.ts
packages/database/drizzle/0016_persist_rejected_itinerary_proposals.sql
packages/database/drizzle/meta/_journal.json
docs/implementation/increments/rb-inc-063-itinerary-proposal-rejected-persistence.md
docs/implementation/context-packs/rb-inc-063-itinerary-proposal-rejected-persistence.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [ ] Proposal `rejected` faz round trip com `rejectedAt` e `updatedAt` preservados;
- [ ] conteúdo, referências, versões, proveniência e Proposed Activities permanecem inalterados;
- [ ] listagem reidrata Proposals `rejected` em ordem estável;
- [ ] constraint rejeita `rejected` incompleta ou sem `rejected_at`;
- [ ] constraint rejeita `rejected_at` anterior a `generated_at`;
- [ ] estados anteriores continuam válidos somente com `rejected_at` nulo;
- [ ] migration é aditiva e mantém linhas existentes válidas;
- [ ] nenhuma escrita altera Itinerary ou outro bounded context;
- [ ] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- round trip `ready → rejected` com conteúdo e Proposed Activities;
- listagem contendo Proposal `rejected`;
- constraint de `rejected_at` obrigatório;
- constraint de rejeição em ou depois de `generated_at`;
- constraint de conteúdo completo no estado `rejected`;
- regressão dos estados `requested`, `generating`, `ready`, `expired`, `failed` e `cancelled`;
- migrations PostgreSQL e testes do package database no CI;
- validações documentais e do monorepo.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| perder conteúdo histórico | Alto | tratar `ready`, `rejected` e `expired` como estados portadores do snapshot |
| reidratar sem validar o lifecycle | Alto | reconstruir `ready` e chamar `rejectItineraryProposal` |
| aceitar linha rejeitada inconsistente | Alto | constraints de lifecycle, conteúdo e timeline no PostgreSQL |
| remover itens durante o save | Alto | persistir Proposed Activities também em `rejected`, na transação existente |

## 12. Segurança e privacidade

O incremento adiciona somente um timestamp de lifecycle e preserva dados já permitidos. Não registra prompt, token, secret, payload bruto de Provider nem dado pessoal novo.

## 13. Rollback

A migration é aditiva. Antes da integração, branch e migration podem ser revertidas. Depois de aplicada, o roll-forward é preferível; remover a coluna exige operação destrutiva fora deste incremento.

## 14. Evidências

Evidências locais:

- 167 documentos registrados e validados, com quatro avisos preexistentes;
- lint e typecheck do package database aprovados;
- 63 testes de Proposal Management aprovados;
- lint, typecheck e build integrais aprovados;
- Prettier dos arquivos TypeScript, JSON e Markdown alterados e `git diff --check` aprovados;
- migration e testes PostgreSQL não executados localmente porque `DATABASE_URL` não está configurada e o Docker está indisponível.

Evidências de CI pendentes.
