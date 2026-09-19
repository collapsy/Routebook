---
id: RB-INC-206
title: Proposal REPLAN autoritativa e snapshot temporal
description: Integra ReplanningWindow ao pipeline autoritativo de Itinerary Proposal, persiste generationScope e snapshot e limita REPLAN aos Dias elegíveis.
document_type: implementation-increment
owner: Proposal Management and Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-09-19"
last_updated: "2026-09-19"
authors: [RouteBook Team]
tags: [implementation, itinerary-proposal, replanning, snapshot, migration]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002, RB-ADR-028, RB-INC-203, RB-INC-204, RB-INC-205, RB-CTX-206]
prerequisites: [RB-INC-205]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-206 — Proposal REPLAN autoritativa e snapshot temporal

## 1. Estado

`Draft`

- issue: [#499](https://github.com/collapsy/Routebook/issues/499);
- PR: [#500](https://github.com/collapsy/Routebook/pull/500);
- branch: `codex/issue-499-proposal-replan-snapshot`;
- base: `main@9a37084ca36da79e74c89328a57a4d2585c4d660`.

## 2. Resultado vertical

O mesmo pipeline autoritativo de Itinerary Proposal passa a distinguir `INITIAL` de `REPLAN`.

Uma geração `REPLAN`:

1. carrega seleção e Itinerary autoritativos;
2. calcula ReplanningWindow com `asOf` explícito e timezone do Itinerary;
3. registra snapshot da seleção e da janela;
4. envia ao compositor somente Dias elegíveis;
5. gera somente novas operações `add` para Places selecionados ainda não planejados;
6. persiste a Proposal sem alterar o Itinerary até aceite explícito.

## 3. Escopo da geração

```text
generationScope = INITIAL | REPLAN
```

Compatibilidade:

- ausência explícita no input legado equivale a `INITIAL`;
- linhas existentes são migradas para `INITIAL`;
- INITIAL preserva o comportamento vigente.

## 4. Snapshot de geração

Nova Proposal pode registrar:

```text
generationContext
- schemaVersion: 1
- includeMaybe
- selection[]
  - preferenceId
  - placeId
  - intent
  - priority
- replanningWindow? 
  - capturedAt
  - timeZone
  - localDate
  - localTime
  - eligibleDayIds
  - eligibleActivityIds
  - protectedActivityIds
  - reasonByActivityId
```

REPLAN exige `replanningWindow`. INITIAL pode registrar seleção sem janela.

## 5. Política REPLAN deste incremento

O compositor existente continua sendo usado.

- somente `eligibleDayIds` participam;
- Activity protegida permanece somente como contexto/densidade e nunca é alvo automático;
- Place já presente em Activity ativa continua excluído da seleção de candidatos;
- novos WANT e MAYBE opt-in podem produzir `add`;
- `move | update | remove` não são gerados automaticamente neste incremento;
- nenhuma política de reordenação automática é inferida.

Esse recorte atende ao caso canônico: no Dia 3 da Viagem, um novo Place selecionado e replanejado só pode entrar do Dia 3 elegível em diante.

## 6. Persistência

Migration `0035_persist_itinerary_proposal_generation_context.sql`:

- adiciona `generation_scope varchar(16) NOT NULL DEFAULT 'INITIAL'`;
- adiciona `generation_context jsonb` nullable para compatibilidade histórica;
- adiciona check `INITIAL | REPLAN`.

A migration é aditiva; não remove nem reescreve conteúdo de Proposal existente além do default da nova coluna.

## 7. Caminhos autorizados

```text
modules/proposal-management/src/itinerary-proposal.ts
modules/proposal-management/src/itinerary-proposal.test.ts
modules/proposal-management/src/index.ts
modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts
modules/proposal-management/src/authoritative-itinerary-proposal-generation.test.ts
packages/database/src/authoritative-itinerary-proposal-generation-context.ts
packages/database/src/authoritative-itinerary-proposal-generation-context-postgres.test.ts
packages/database/src/authoritative-itinerary-proposal-generation-service-postgres.test.ts
packages/database/src/proposal-schema.ts
packages/database/src/proposal-repository.ts
packages/database/src/proposal-repository.test.ts
packages/database/src/proposal-replanning-migration.test.ts
packages/database/drizzle/0035_persist_itinerary_proposal_generation_context.sql
packages/database/drizzle/meta/_journal.json
docs/implementation/increments/rb-inc-206-proposal-replan-snapshot.md
docs/implementation/context-packs/rb-inc-206-proposal-replan-snapshot.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Somente leitura

```text
modules/trip-management/**
modules/trip-collection/**
apps/web/**
docs/core/**
docs/domain/**
docs/architecture/**
```

## 9. Fora de escopo

- UI/CTA de replanejamento;
- inferência automática de scope pela data da Viagem;
- geração automática de move/update/remove;
- aplicação automática;
- alteração do lifecycle canônico;
- Provider;
- Production;
- merge sem autorização humana.

## 10. Testes obrigatórios

```bash
pnpm --filter @routebook/proposal-management test
pnpm --filter @routebook/database test
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O CI continua como evidência autoritativa para migration policy, PostgreSQL, smoke e Playwright.

## 11. Critérios de aceite

- [ ] scope INITIAL/REPLAN pertence ao agregado;
- [ ] input legado continua INITIAL;
- [ ] snapshot da seleção é imutável e validado;
- [ ] REPLAN exige snapshot de ReplanningWindow;
- [ ] repository round-trip preserva scope/context;
- [ ] migration 0035 é aditiva e aplicável;
- [ ] contexto PostgreSQL usa timezone e Activities reais;
- [ ] REPLAN restringe o compositor aos eligibleDayIds;
- [ ] passado e trecho protegido do Dia atual não recebem add;
- [ ] INITIAL não sofre regressão;
- [ ] move/update/remove não são inventados;
- [ ] Proposal continua separada do Itinerary;
- [ ] Documentation e Engineering Validation ficam verdes no mesmo SHA.

## 12. Próximo passo

Expor o replanejamento na jornada de Roteiro durante a Viagem, escolhendo `REPLAN` explicitamente, apresentando o recorte temporal e preservando aceite/rejeição da Proposal.

## 13. Rollback

A lógica pode retornar a INITIAL sem perda. As colunas aditivas podem permanecer inertes; rollback destrutivo de schema não faz parte do incremento.
