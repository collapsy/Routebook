---
id: RB-INC-219
title: Etapas geográficas da Viagem e descoberta por Destino
description: Permite planejar uma visita a outro Destino na mesma Viagem, vinculá-la a datas e explorar Lugares no contexto geográfico escolhido.
document_type: implementation-increment
owner: Trip Management and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-10-16"
last_updated: "2026-10-20"
authors: [RouteBook Team]
tags: [implementation, trip, destination, itinerary, discovery]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-PRD-006, RB-PRD-007, RB-UX-001, RB-DATA-001, RB-ARC-001, RB-ADR-012, RB-CTX-219]
prerequisites: [RB-INC-218]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-219 — Etapas geográficas da Viagem e descoberta por Destino

## Unidade de trabalho

- Pedido humano: viagem com base em Joinville e visita de um dia a Itapema, com Lugares de cada cidade apresentados separadamente.
- Issue: ainda não vinculada; este incremento delimita a unidade de trabalho.
- Branch: `codex/rb-inc-219-multi-destination-trip`.
- Base: `origin/main@3d42b704`.

## Objetivo e problema

A Viagem persiste um único Destination e uma Hospedagem principal. Discovery usa apenas essa referência espacial. Uma visita a outra cidade não tem data nem catálogo próprio dentro da mesma Viagem.

Entregar uma Etapa da Viagem adicional com Destination e Período dentro da Viagem. A Etapa pode representar um bate-volta sem Hospedagem. O Destino principal e a Hospedagem principal permanecem disponíveis. O usuário escolhe explicitamente qual Destino explorar; lista e mapa usam a mesma Region. O Dia do Roteiro mostra a Etapa planejada e abre Discovery no contexto correto.

## Escopo funcional

1. Adicionar e remover Etapa com Destino confirmado e datas incluídas no Período da Viagem.
2. Exibir Etapas na visão da Viagem e no Dia correspondente do Roteiro.
3. Selecionar Destino principal ou uma Etapa em Explorar Lugares, mantendo filtros no contexto selecionado.
4. Revalidar ações de Lugar no servidor contra a Region selecionada da própria Viagem.
5. Manter Hospedagem principal para um bate-volta; uma Hospedagem de Etapa será tratada em incremento posterior.

## Invariantes

- Etapa não cria segunda Viagem nem altera o Destino principal.
- Datas da Etapa pertencem ao Período da Viagem. Uma Etapa de um dia é válida.
- Nesta entrega, o fuso da Etapa deve ser igual ao fuso da Viagem; mudança de fuso exige incremento próprio.
- Hospedagem não é necessária para adicionar uma Etapa.
- Discovery da Etapa usa a coordenada do Destination da Etapa. Hospedagem principal não vira âncora de Itapema.
- Um Place é identificado independentemente da tela/Region. Salvar mantém a preferência na mesma Viagem e não cria Activity.
- Parâmetros de URL ou campos de formulário não autorizam acesso a outra Viagem ou Region não cadastrada.
- Adicionar ou remover Etapa incrementa a versão estrutural do contexto da Viagem.
- Nenhuma Proposal existente é aceita ou aplicada automaticamente.

## Caminhos permitidos

```text
modules/trip-management/src/trip-stage.ts
modules/trip-management/src/trip-stage.test.ts
modules/trip-management/src/index.ts
packages/database/src/schema.ts
packages/database/src/trip-stage-repository.ts
packages/database/src/trip-stage-repository.test.ts
packages/database/src/index.ts
packages/database/drizzle/0037_create_trip_stages.sql
packages/database/drizzle/meta/_journal.json
apps/web/lib/trip-stage-discovery.ts
apps/web/lib/trip-stage-discovery.test.ts
apps/web/lib/destination-suggestions.ts
apps/web/lib/destination-suggestions.test.ts
apps/web/app/viagens/[tripId]/etapas/page.tsx
apps/web/app/viagens/[tripId]/etapas/actions.ts
apps/web/app/viagens/[tripId]/etapas/actions.test.ts
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/actions.ts
apps/web/app/viagens/[tripId]/lugares/actions.test.ts
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/actions.ts
apps/web/app/viagens/[tripId]/lugares/place-discovery.module.css
apps/web/components/destination-combobox.tsx
apps/web/components/trip-place-preference-controls.tsx
apps/web/e2e/multi-destination-validation.spec.ts
docs/domain/domain-model.md
docs/domain/ubiquitous-language.md
docs/domain/business-rules-and-invariants.md
docs/product/functional-requirements.md
docs/product/business-rules.md
docs/ux/information-architecture.md
docs/data/logical-data-model.md
docs/implementation/increments/rb-inc-219-trip-stages-discovery.md
docs/implementation/context-packs/rb-inc-219-trip-stages-discovery.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Critérios de aceite

- [ ] Uma Viagem para Joinville aceita Etapa Itapema de um dia sem nova Hospedagem.
- [ ] Datas fora da Viagem, Destino inválido e Etapa de outra Viagem são rejeitados.
- [ ] Etapa aparece no resumo da Viagem e no Dia correto do Roteiro.
- [ ] Explorar alterna entre Joinville e Itapema com contexto explícito; lista e mapa não misturam resultados.
- [ ] Filtros, detalhe e ação de salvar mantêm o contexto escolhido; o servidor revalida a Region antes de gravar.
- [ ] Um Lugar salvo em Itapema pertence à mesma Viagem, sem virar Activity automaticamente.
- [ ] Ausência ou falha do Provider de Lugares apresenta degradação honesta.
- [ ] Leitura e escrita exigem autorização já existente para a Viagem.
- [ ] Testes unitários, integração e E2E da jornada passam; validação documental passa.

## Testes obrigatórios

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @routebook/trip-management test
pnpm --filter @routebook/database test
pnpm --filter @routebook/web test
pnpm --filter @routebook/web exec playwright test e2e/multi-destination-validation.spec.ts --project=desktop-chromium --project=mobile-chromium
pnpm build
```

## Riscos e fora de escopo

- Hospedagem da Etapa, troca de pernoite, cálculo de rota intermunicipal e fuso distinto serão incrementos próprios.
- Recommendation e geração de Proposal ainda usam o contexto principal; não afirmar que planejam automaticamente dias em outra cidade.
- Remover Etapa preserva preferências e Activities já criadas; a interface avisa o usuário antes da ação.
- Não ativar Provider, alterar billing, executar migration em Production nem integrar na main sem decisão humana.
- Rollback do código desabilita a UI; a tabela aditiva pode permanecer até decisão de remoção segura.

## Validação desta implementação

- `node scripts/validate-docs.mjs`: passou, com 10 avisos preexistentes.
- `pnpm lint` e `pnpm typecheck`: passaram.
- `pnpm --filter @routebook/trip-management test`: 108 testes passaram.
- Testes web focados em sugestões, escopo de Discovery e ações: 25 testes passaram.
- `pnpm --filter @routebook/web test`: 515 testes passaram; cinco suítes de Auth falharam ao importar por ausência de `DATABASE_URL`.
- `pnpm --filter @routebook/database test`: 118 testes passaram; 51 testes dependentes de Postgres falharam por ausência de `DATABASE_URL`.
- `pnpm build`: compilação e TypeScript passaram; coleta de dados de `/api/auth/[...all]` falhou por ausência de `DATABASE_URL`.
- Playwright da jornada: especificações carregadas com `--list`; execução impedida porque `next start` exige o build completo.
- `pnpm format:check`: falhou em 546 arquivos no baseline do repositório. Os arquivos novos de código deste incremento foram formatados isoladamente.

## Correção de busca textual — issue #540

Na etapa Itapema, um Place existente na fonte Overture podia ficar fora dos 200 candidatos gerais antes de a busca por nome ser aplicada. A busca textual agora seleciona candidatos dentro da mesma Region antes do limite, e a ação de salvar revalida o termo e a Region no servidor. Sem termo, o limite e o comportamento anteriores são preservados. A Categoria continua independente do texto: Hard Rock Cafe Itapema é classificado como Gastronomia pela fonte.

Validação da correção: 46 testes de Place Catalog, 22 testes web focados e 110 testes de Trip Management passaram; `pnpm lint`, `pnpm typecheck` e `node scripts/validate-docs.mjs` passaram. A consulta ao Overture público retornou Hard Rock Cafe Itapema em Gastronomia. A suíte web teve 527 testes aprovados e cinco suítes de Auth impedidas por ausência de `DATABASE_URL`; a suíte de banco teve 118 aprovados e 51 testes dependentes do banco impedidos pelo mesmo motivo. O build compilou e passou pelo TypeScript, mas parou na coleta de páginas sem `DATABASE_URL`. O Playwright listou a jornada desktop e mobile; sua execução exige build e banco de teste. `pnpm format:check` ainda falha no baseline (549 arquivos); os sete arquivos de código alterados passaram no Prettier isolado.
