---
id: RB-INC-200
title: Núcleo puro de TripPlacePreference
description: Implementa o agregado Trip Collection e as invariantes executáveis de TripPlacePreference sem persistência ou integração.
document_type: implementation-increment
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, domain, trip-collection, trip-place-preference]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002, RB-ADR-028, RB-INC-199, RB-CTX-200]
prerequisites: [RB-INC-199]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-200 — Núcleo puro de TripPlacePreference

## 1. Estado

`Draft`

- issue: [#483](https://github.com/collapsy/Routebook/issues/483);
- branch: `codex/issue-483-trip-place-preference-core`;
- base: `origin/main@e7e8a3bee1ed774515f9e572cd2d0e23f67e4f48`.

## 2. Resultado vertical

O RouteBook passa a possuir um núcleo executável e independente de infraestrutura para representar a Trip Collection, definir, alterar, consultar e limpar TripPlacePreference e garantir as invariantes aprovadas no RB-ADR-028.

## 3. Problema

O contrato canônico existe, mas o código executável representa somente Saved Place binário. Evoluir banco, UI ou Proposal antes de materializar as invariantes permitiria estados inválidos, duplicação por Trip e Place e acoplamento prematuro à persistência.

## 4. Escopo

- workspace `@routebook/trip-collection`;
- `TripCollection` como agregado puro;
- `TripPlacePreference` como entidade contextual;
- intents `WANT`, `MAYBE` e `NOT_INTERESTED`;
- prioridade `MUST_DO | null`;
- factories com identidade e relógio injetáveis;
- normalização de identificadores;
- definição e alteração imutáveis;
- unicidade por `TripId + PlaceId` dentro da coleção;
- idempotência de definição e limpeza;
- consultas puras da coleção;
- testes unitários das invariantes.

## 5. Invariantes

1. ausência de entidade significa Place não avaliado;
2. não existe intent `UNRATED`;
3. `MUST_DO` somente é válido com `WANT`;
4. `MAYBE` e `NOT_INTERESTED` possuem prioridade nula;
5. uma coleção contém no máximo uma preferência por Place;
6. uma preferência pertence à mesma Trip da coleção;
7. definir a mesma preferência devolve o estado existente;
8. uma alteração preserva identidade e criação e atualiza `updatedAt`;
9. limpar uma preferência ausente é idempotente;
10. definir ou limpar preferência não cria, move ou remove Activity.

## 6. Caminhos permitidos

```text
modules/trip-collection/**
pnpm-lock.yaml
docs/implementation/increments/rb-inc-200-trip-place-preference-core.md
docs/implementation/context-packs/rb-inc-200-trip-place-preference-core.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 7. Caminhos somente leitura

```text
modules/saved-places/**
modules/trip-management/**
modules/place-catalog/**
modules/proposal-management/**
packages/database/**
apps/web/**
docs/core/**
docs/domain/**
docs/architecture/**
```

## 8. Fora de escopo

- repository port ou adapter;
- schema, migration ou backfill;
- alteração do módulo legado Saved Places;
- compatibilidade Save/Unsave;
- rota Minha seleção e ações de intenção;
- consumo pela Proposal;
- Planning Role;
- ReplanningWindow;
- Preview, Production ou merge na `main`.

## 9. Compatibilidade

O incremento não lê nem altera `saved_places`. O módulo legado permanece a superfície executável vigente até um incremento posterior introduzir adapters e persistência aditiva. Nenhuma Activity ou Proposal é afetada.

## 10. Estratégia de testes

- criação das três intenções;
- `MUST_DO` válido e combinações inválidas;
- ausência e normalização de identificadores;
- rejeição em runtime de valores fora do contrato;
- atualização imutável com preservação de identidade e criação;
- unicidade e upsert no agregado;
- idempotência de definição e limpeza;
- remoção isolada por Place;
- regressão integral do monorepo no CI.

## 11. Critérios de aceite

- [ ] módulo canônico não depende de framework, banco ou Provider;
- [ ] intents e prioridade seguem RB-ADR-028;
- [ ] não avaliado permanece ausência de entidade;
- [ ] unicidade por Trip e Place é preservada pelo agregado;
- [ ] operações são imutáveis e idempotentes;
- [ ] timestamps e identidades podem ser controlados nos testes;
- [ ] nenhum efeito externo ou Activity é produzido;
- [ ] testes unitários cobrem invariantes e transições;
- [ ] documentação, formatação, lint, typecheck, testes e build passam.

## 12. Riscos e controles

| Risco | Controle |
| --- | --- |
| competir com Saved Places legado | nenhum adapter ou consumidor é alterado neste incremento |
| persistir `UNRATED` futuramente | ausência permanece o único estado não avaliado |
| acoplar identidade e tempo | factories aceitam ID e relógio controlados |
| criar duplicidade | agregado faz atualização pela chave contextual |
| expandir para UI ou banco | caminhos de aplicação e database são proibidos |

## 13. Testes obrigatórios

```bash
pnpm install --frozen-lockfile
pnpm --filter @routebook/trip-collection test
pnpm --filter @routebook/trip-collection lint
pnpm --filter @routebook/trip-collection typecheck
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O pipeline do PR executará também migrations, smoke e Playwright.

## 14. Rollback

Como não há persistência nem consumidor, o rollback consiste em remover o workspace e reverter os documentos e o lockfile. Nenhum dado exige correção.

## 15. Evidências

- auditoria do working tree confirmou que `apps/web/next-env.d.ts` era alteração gerada fora do escopo e não integra o incremento;
- o núcleo não possui gerador de UUID nem relógio do sistema: identidade e instante são fornecidos explicitamente pelo chamador;
- compilação isolada do código-fonte com TypeScript passou após a revisão de pureza;
- verificação funcional isolada das invariantes principais passou;
- suíte Vitest, lint, typecheck, documentação, build e regressão integral permanecem como evidência autoritativa do CI do pull request.
