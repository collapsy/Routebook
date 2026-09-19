---
id: RB-INC-202
title: Minha seleção e intenção por Lugar
description: Substitui a experiência binária de Salvos pela seleção canônica Quero ir, Talvez, Não tenho interesse e Imperdível.
document_type: implementation-increment
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, trip-collection, trip-place-preference, web, ux]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ADR-028, RB-INC-200, RB-INC-201, RB-CTX-202]
prerequisites: [RB-INC-201]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-202 — Minha seleção e intenção por Lugar

## 1. Estado

`Draft`

- issue: [#487](https://github.com/collapsy/Routebook/issues/487);
- branch: `codex/issue-487-trip-selection-ui`;
- base: `d2887427aa84834d8074c538f091fcb5898f86f6`.

## 2. Resultado vertical

A interface deixa de representar interesse como estado binário de “Salvo” e passa a expor o contrato canônico de Trip Collection:

```text
WANT           -> Quero ir
MAYBE          -> Talvez
NOT_INTERESTED -> Não tenho interesse
MUST_DO        -> Imperdível (somente com WANT)
ausência       -> não avaliado
```

A escolha não cria, move ou remove Activity.

## 3. Escopo

- adicionar `@routebook/trip-collection` ao app web;
- criar controle reutilizável de intenção/prioridade;
- ler `TripPlacePreference` no catálogo;
- Set/Clear de preferência no catálogo;
- usar a mesma preferência no detalhe do Place;
- trocar a navegação “Salvos” por “Minha seleção”;
- manter a rota técnica `/lugares-salvos`;
- listar WANT, MAYBE e NOT_INTERESTED na rota legada;
- permitir alteração e Clear na própria seleção;
- mostrar MUST_DO como “Imperdível”;
- permitir adição manual ao Roteiro somente quando a preferência atual for WANT na tela Minha seleção;
- materialização de candidato externo por “Quero ir” grava WANT;
- testes, documentação, registry e rastreabilidade.

## 4. Regras

- repetir a mesma intenção é idempotente pelo domínio;
- MUST_DO só pode coexistir com WANT;
- ao mudar de WANT + MUST_DO para MAYBE ou NOT_INTERESTED, prioridade vira null;
- Clear remove apenas a preferência;
- ausência de preferência é o estado não avaliado;
- nenhuma mutação de preferência altera o Roteiro;
- rota física legada não redefine o nome do conceito na interface.

## 5. Fora de escopo

- migration ou schema;
- remoção de `@routebook/saved-places`;
- renomear fisicamente `/lugares-salvos`;
- integrar preferências ao candidate set da Proposal;
- `includeMaybe`;
- PlanningRole;
- ReplanningWindow;
- replanejamento temporal;
- Preview ou Production.

## 6. Caminhos permitidos

```text
apps/web/package.json
apps/web/components/trip-context-nav.tsx
apps/web/components/trip-place-preference-controls.tsx
apps/web/app/viagens/[tripId]/lugares/**
apps/web/app/viagens/[tripId]/lugares-salvos/**
pnpm-lock.yaml
docs/implementation/increments/rb-inc-202-trip-selection-ui.md
docs/implementation/context-packs/rb-inc-202-trip-selection-ui.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 7. Critérios de aceite

- [ ] catálogo reflete preferência atual;
- [ ] Quero ir, Talvez e Não tenho interesse podem ser escolhidos;
- [ ] repetir a escolha é idempotente;
- [ ] Imperdível só aparece sobre Quero ir;
- [ ] trocar de WANT + MUST_DO para outra intenção remove prioridade;
- [ ] Clear retorna a não avaliado;
- [ ] preferência não cria/remove Activity;
- [ ] detalhe reflete o mesmo estado;
- [ ] Minha seleção lista as três intenções;
- [ ] navegação usa Minha seleção;
- [ ] rota técnica legada continua funcionando;
- [ ] candidato externo por Quero ir persiste WANT;
- [ ] nenhuma migration é criada;
- [ ] CI integral passa no HEAD final.

## 8. Validação

```bash
pnpm install --frozen-lockfile
pnpm --filter @routebook/web test
pnpm --filter @routebook/web lint
pnpm --filter @routebook/web typecheck
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O CI também executa smoke e Playwright.

## 9. Gate humano

Merge na main exige confirmação humana explícita. Nenhuma ação em Production faz parte deste incremento.

## 10. Evidências

Pendentes do pull request.
