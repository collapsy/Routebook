---
id: RB-INC-049
title: Persistência do Ciclo Inicial de Itinerary Proposal
description: Persiste e recupera o ciclo requested, generating, failed e cancelled de Itinerary Proposal sem gerar conteúdo ou alterar o Itinerary.
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
  - drizzle
related_documents:
  - RB-CORE-0004
  - RB-PRD-006
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-006
  - RB-INC-048
prerequisites:
  - RB-INC-048
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-049 — Persistência do Ciclo Inicial de Itinerary Proposal

## 1. Objetivo

Persistir o ciclo inicial de Itinerary Proposal entregue pelo RB-INC-048, permitindo recuperar uma solicitação após reinício do processo sem gerar conteúdo, escolher o estado final da geração ou alterar o Itinerary.

Issue: [#110](https://github.com/collapsy/Routebook/issues/110)

Branch: `codex/rb-inc-049-proposal-persistence`

## 2. Problema

O agregado inicial existe somente em memória. Sem um port e um adapter de persistência, as referências às versões base, ao Context Snapshot e aos instantes de transição são perdidas, e uma futura execução assíncrona não pode retomar ou auditar a solicitação.

## 3. Resultado verificável

- port `ItineraryProposalRepository` pertencente ao módulo Proposal Management;
- migration `0013_create_itinerary_proposals.sql`;
- schema Drizzle privado do adapter;
- criação, atualização, busca por identidade e listagem por Trip;
- validação de Trip e Itinerary relacionados;
- round trip fiel dos estados `requested`, `generating`, `failed` e `cancelled`;
- isolamento de leitura por TripId;
- testes de integração contra PostgreSQL.

## 4. Invariantes

1. o domínio não importa Drizzle, PostgreSQL ou tipos de tabela;
2. uma Proposal persistida referencia Trip e Itinerary existentes e compatíveis;
3. somente uma Proposal `requested` pode ser criada pelo repository;
4. `save` não cria uma Proposal ausente;
5. a reidratação usa as operações públicas do agregado;
6. status e metadados de lifecycle devem ser coerentes;
7. leituras por identidade exigem TripId e não atravessam Viagens;
8. persistir uma Proposal não altera o Itinerary.

## 5. Escopo

- port e erro tipado no módulo `proposal-management`;
- tabela pública `itinerary_proposals`, preservando ownership lógico de Proposal Management no monólito atual;
- constraints de status, versões positivas, coerência temporal e lifecycle;
- adapter e mapeamento Drizzle;
- testes de referências, round trip, isolamento e cascata;
- lockfile, registro e rastreabilidade.

## 6. Decisões locais e reversíveis

- `context_snapshot_id` é armazenado como `varchar(160)` sem foreign key porque ainda não existe store canônico de Context Snapshot e o contrato público atual aceita identificadores opacos;
- `requested_at`, `updated_at`, `failed_at` e `failure_code` preservam o agregado do RB-INC-048; os campos mais amplos do modelo físico futuro permanecem fora deste recorte;
- a tabela permanece no schema PostgreSQL padrão, seguindo as migrations já executáveis do monólito. O ownership continua explícito em arquivos separados.

## 7. Limite canônico preservado

A divergência entre `ready` no domínio e `generated` no exemplo de API permanece intocada. A constraint da migration aceita somente os quatro estados iniciais implementados.

## 8. Fora de escopo

- `ready`, `generated`, Proposed Activity ou conteúdo revisável;
- geração, Provider, modelo, prompt, job ou fila;
- aceite, rejeição, expiração, retry ou supersessão;
- API, Server Action, read model de interface ou UI;
- aplicação ou qualquer escrita no Itinerary;
- store de Context Snapshot;
- mudança de documentos canônicos ou ADR.

## 9. Context Pack

`docs/implementation/context-packs/rb-inc-049-itinerary-proposal-persistence.md`

## 10. Caminhos permitidos

```text
modules/proposal-management/**
packages/database/package.json
packages/database/src/index.ts
packages/database/src/proposal-schema.ts
packages/database/src/proposal-repository.ts
packages/database/src/proposal-repository.test.ts
packages/database/drizzle/0013_create_itinerary_proposals.sql
packages/database/drizzle/meta/_journal.json
pnpm-lock.yaml
docs/implementation/increments/rb-inc-049-itinerary-proposal-persistence.md
docs/implementation/context-packs/rb-inc-049-itinerary-proposal-persistence.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 11. Critérios de aceite

- [ ] o domínio permanece independente de Drizzle e PostgreSQL;
- [ ] create persiste somente Proposal `requested` com referências válidas;
- [ ] save atualiza somente Proposal existente na mesma Trip;
- [ ] find e list isolam dados por TripId;
- [ ] round trip preserva versões, ContextSnapshotId, status, instantes e failureCode;
- [ ] constraints limitam status e metadados aos quatro estados em escopo;
- [ ] exclusão da Trip ou do Itinerary remove a Proposal por cascata;
- [ ] testes de integração cobrem sucesso e falhas de referência;
- [ ] documentação, lint, tipagem, testes, migrations e build permanecem verdes.

## 12. Testes obrigatórios

- `pnpm install --frozen-lockfile`;
- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm db:migrate` com PostgreSQL;
- `pnpm test` com PostgreSQL;
- `pnpm build`;
- regressão Playwright desktop e mobile no CI.

## 13. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| reidratar estado incoerente | Alto | constraints no banco e operações públicas do agregado |
| atravessar limite de Trip | Alto | TripId obrigatório em todas as leituras e updates |
| antecipar geração completa | Alto | constraint restrita aos quatro estados iniciais |
| adapter alterar Itinerary | Alto | somente validação de referência, sem update em tabelas externas |

## 14. Rollback

Reverter o adapter, o port e a migration antes de dados reais. O incremento não possui deploy de produção nem ação destrutiva sobre tabelas existentes.

## 15. Evidências

Serão registradas após execução local e workflows da PR.
