---
id: RB-INC-055
title: Persistência da Itinerary Proposal Ready
description: Persiste conteúdo revisável, proveniência e Proposed Activities de Proposal ready com migration aditiva e escrita transacional.
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
  - migration
related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-006
  - RB-INC-053
  - RB-INC-054
prerequisites:
  - RB-INC-054
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-055 — Persistência da Itinerary Proposal Ready

## 1. Objetivo

Persistir integralmente a transição `generating → ready`, incluindo conteúdo revisável, proveniência e Proposed Activities, sem alterar o Itinerary.

Issue: [#126](https://github.com/collapsy/Routebook/issues/126)

Decisão humana: [#123](https://github.com/collapsy/Routebook/issues/123)

Branch: `codex/rb-inc-055-ready-persistence`

Base empilhada: `codex/rb-inc-054-ready-data-contract`, PR #125.

Pull request: [#127](https://github.com/collapsy/Routebook/pull/127)

## 2. Problema

O Domínio conclui Proposal em `ready`, mas a tabela atual aceita apenas o ciclo inicial e não possui conteúdo, proveniência, validade ou Proposed Activities. Salvar a Proposal pronta falha na constraint e não existe round trip fiel.

## 3. Resultado verificável

- domínio carrega proveniência genérica de método e versão;
- migration `0014` adiciona campos e tabela sem remover dados;
- constraints preservam o ciclo inicial e exigem snapshot completo em `ready`;
- Proposed Activities são persistidas em tabela própria;
- save da Proposal e de seus itens ocorre na mesma transação;
- reidratação valida JSONB e reconstrói a operação pública do aggregate;
- listagem carrega Proposed Activities em lote;
- estados anteriores continuam com campos de conclusão nulos.

## 4. Invariantes

1. `ready` é o estado persistido da conclusão;
2. `generated` não é estado nem alias;
3. `generationMethod` e `generationVersion` são textos técnicos, não Provider canônico;
4. snapshots JSONB possuem `contentSchemaVersion = 1` nesta implementação;
5. critérios e justificativas são não vazios em `ready`;
6. limitações e conflitos conhecidos podem ser arrays vazios;
7. Proposed Activity não possui status próprio nem ActivityId canônico;
8. referência de Planning Conflict não cria FK cross-context;
9. nenhuma escrita altera Itinerary, Activity ou Planning Conflict;
10. falha durante itens não deixa Proposal parcialmente pronta.

## 5. Escopo

- proveniência no aggregate e testes;
- schema Drizzle da Proposal e Proposed Activities;
- migration SQL aditiva e journal;
- adapter, mapper e testes de integração;
- exports públicos do package database;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- comando de aplicação;
- Provider, modelo, prompt, output schema externo, job ou fila;
- API e UI;
- aceite total/parcial, rejeição ou aplicação;
- concorrência otimista e Outbox;
- backfill de conteúdo para estados anteriores.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-055-itinerary-proposal-ready-persistence.md`

## 8. Caminhos permitidos

```text
modules/proposal-management/src/itinerary-proposal.ts
modules/proposal-management/src/itinerary-proposal.test.ts
modules/proposal-management/src/index.ts
packages/database/src/proposal-schema.ts
packages/database/src/proposal-repository.ts
packages/database/src/proposal-repository.test.ts
packages/database/src/index.ts
packages/database/drizzle/0014_persist_ready_itinerary_proposals.sql
packages/database/drizzle/meta/_journal.json
docs/implementation/increments/rb-inc-055-itinerary-proposal-ready-persistence.md
docs/implementation/context-packs/rb-inc-055-itinerary-proposal-ready-persistence.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [ ] Proposal `ready` faz round trip sem perda de conteúdo ou proveniência;
- [ ] Proposed Activities são persistidas e carregadas em ordem estável;
- [ ] save de Proposal e itens é transacional;
- [ ] listagem busca itens em lote;
- [ ] JSONB inválido produz erro tipado do repository;
- [ ] constraint rejeita `ready` incompleta;
- [ ] estados anteriores preservam campos de conclusão nulos;
- [ ] migration é aditiva e mantém linhas existentes válidas;
- [ ] nenhum Provider ou bounded context externo é acoplado;
- [ ] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm --filter @routebook/proposal-management lint`;
- `pnpm --filter @routebook/proposal-management typecheck`;
- `pnpm --filter @routebook/proposal-management test`;
- `pnpm --filter @routebook/database lint`;
- `pnpm --filter @routebook/database typecheck`;
- migrations PostgreSQL e testes do package database no CI;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test` quando `DATABASE_URL` estiver disponível;
- `pnpm build`;
- regressão Playwright desktop e mobile no CI;
- `git diff --check`.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| escrita parcial de itens | Alto | transaction envolve update, delete e insert |
| JSONB antigo ou inválido | Alto | validação de runtime antes da reidratação |
| N+1 na listagem | Médio | consulta única com `inArray` e agrupamento em memória |
| precisão monetária | Médio | numeric persistido como string e conversão controlada no adapter |
| status inexistente de Proposed Activity | Alto | nenhuma coluna ou enum de status é criado |

## 12. Segurança e privacidade

O adapter persiste apenas conteúdo revisável e proveniência técnica. Não registra prompt, token, secret, payload bruto de Provider ou dado pessoal desnecessário.

## 13. Rollback

A migration é aditiva. Roll-forward preferencial: corrigir mapper ou constraint mantendo colunas e tabela. Antes de qualquer integração, a branch pode ser revertida integralmente sem dado externo produzido.

## 14. Evidências

- `@routebook/proposal-management`: lint e typecheck verdes; 45 testes verdes;
- `@routebook/database`: lint e typecheck verdes;
- workspace: lint, typecheck e build verdes;
- documentação: 151 documentos e 151 registros validados, com quatro avisos preexistentes;
- Prettier dos caminhos alterados e `git diff --check`: verdes;
- testes de integração PostgreSQL, migration, regressão Playwright e `format:check` integral: pendentes do workflow da pull request;
- teste database local não executado porque `DATABASE_URL` não está configurada e o daemon Docker está indisponível.
