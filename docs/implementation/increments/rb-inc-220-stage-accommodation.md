---
id: RB-INC-220
title: Hospedagem opcional por Etapa da Viagem
description: Permite informar uma Hospedagem para uma Etapa, mantendo distinta a Hospedagem principal e usando a referência geográfica correta em Discovery.
document_type: implementation-increment
owner: Trip Management and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-10-16"
last_updated: "2026-10-16"
authors: [RouteBook Team]
tags: [implementation, trip, accommodation, destination, discovery]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-PRD-006, RB-PRD-007, RB-UX-001, RB-DATA-001, RB-ARC-001, RB-ADR-012, RB-CTX-220]
prerequisites: [RB-INC-219]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-220 — Hospedagem opcional por Etapa da Viagem

## Unidade de trabalho

- Pedido humano: permitir mais de uma hospedagem ou lugar na mesma Viagem, sem confundir Joinville e Itapema.
- Issue: ainda não vinculada; este incremento delimita a unidade de trabalho.
- Branch: `codex/rb-inc-220-stage-accommodation`, baseada no commit `9ed8934e` do RB-INC-219.

## Objetivo e escopo

Uma Etapa da Viagem pode ter uma Hospedagem opcional. A Hospedagem principal permanece na Trip. O usuário pode informar, alterar e remover a Hospedagem de uma Etapa sem afetar a base da Viagem. Quando a localização da Hospedagem da Etapa está disponível, Discovery, mapa, distâncias e rotas de seus Lugares usam essa referência. Sem localização, a etapa continua usando seu Destination.

O formulário reutiliza a validação de Accommodation e o Geocoder configurado. Falha do Provider preserva o nome e o endereço, com estado de localização indisponível e mensagem clara. A escrita exige `trip:edit`, confere o StageId dentro da Trip e incrementa a Trip Context Version de modo transacional.

## Invariantes

- Uma Etapa tem no máximo uma Hospedagem nesta entrega; uma Viagem pode ter a Hospedagem principal e Hospedagens em Etapas distintas.
- A Hospedagem da Etapa não substitui a Hospedagem principal nem cria Activity, Place ou segunda Trip.
- Remover a Hospedagem da Etapa não remove a Etapa, preferências ou Activities.
- O mapa e a lista compartilham a mesma Region. Lugares do Destino principal não são misturados com os da Etapa.
- Um bate-volta permanece válido sem Hospedagem da Etapa.
- Recommendation e Proposal ainda consideram a referência principal; a UI não deve sugerir planejamento automático multicídades.

## Caminhos permitidos

```text
modules/trip-management/src/trip.ts
modules/trip-management/src/trip-stage.ts
modules/trip-management/src/trip-stage.test.ts
packages/database/src/schema.ts
packages/database/src/trip-stage-repository.ts
packages/database/src/trip-stage-repository.test.ts
packages/database/drizzle/0038_stage_accommodation.sql
packages/database/drizzle/meta/_journal.json
apps/web/lib/accommodation-geocoding.ts
apps/web/lib/trip-stage-discovery.ts
apps/web/lib/trip-stage-discovery.test.ts
apps/web/components/accommodation-form.tsx
apps/web/components/accommodation-form.test.tsx
apps/web/app/viagens/[tripId]/etapas/page.tsx
apps/web/app/viagens/[tripId]/etapas/[stageId]/hospedagem/page.tsx
apps/web/app/viagens/[tripId]/etapas/[stageId]/hospedagem/actions.ts
apps/web/app/viagens/[tripId]/etapas/[stageId]/hospedagem/actions.test.ts
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares-salvos/page.tsx
apps/web/app/viagens/[tripId]/lugares/distance.ts
apps/web/app/viagens/[tripId]/lugares/distance.test.ts
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/e2e/multi-destination-validation.spec.ts
apps/web/e2e/auth.setup.ts
docs/domain/domain-model.md
docs/domain/ubiquitous-language.md
docs/domain/business-rules-and-invariants.md
docs/product/functional-requirements.md
docs/product/business-rules.md
docs/ux/information-architecture.md
docs/data/logical-data-model.md
docs/implementation/increments/rb-inc-220-stage-accommodation.md
docs/implementation/context-packs/rb-inc-220-stage-accommodation.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Critérios de aceite

- [ ] Joinville mantém sua Hospedagem principal; uma Etapa em Itapema aceita Hospedagem própria.
- [ ] O bate-volta sem Hospedagem continua válido.
- [ ] Adição, atualização e remoção da Hospedagem da Etapa não alteram a Hospedagem principal.
- [ ] O servidor rejeita edição de Etapa de outra Viagem e exige `trip:edit`.
- [ ] Coordenadas inválidas são rejeitadas; falha de geocoding não finge localização confirmada.
- [ ] Discovery da Etapa usa sua Hospedagem localizada; sem ela, usa o Destination da Etapa. Lista, mapa e detalhe preservam o contexto.
- [ ] Minha seleção identifica a referência estimada dos Lugares de cada Etapa e usa a Hospedagem correspondente para distâncias e links de detalhe.
- [ ] A mudança incrementa a Trip Context Version e não aplica Proposal automaticamente.
- [ ] Testes unitários, integração, interface e E2E passam; validação documental passa.

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

- Não representa check-in/check-out, troca de Hospedagem dentro da mesma Etapa, transporte entre cidades nem fusos distintos.
- Sem coordenada, a Hospedagem é informativa e o Destination da Etapa continua sendo a referência espacial.
- Migração aditiva; não aplicar em Production sem aprovação e teste em ambiente isolado.
- O Postgres de teste foi um branch isolado do projeto Neon de preview (`rb-inc-220-validation-20261017`); nenhuma migração foi aplicada aos branches principais de Preview ou Production.
- O setup E2E compartilhado precisa aguardar a conclusão do cadastro no Postgres remoto; o tempo de espera foi ajustado sem alterar autenticação ou autorização.
- A referência de Destino em Minha seleção é estimada pela região geográfica atualmente configurada. Quando nenhuma Region da Viagem contém o Lugar, o cartão permanece visível sem link de detalhe ou distância indevida.

## Validação desta implementação

- `node scripts/validate-docs.mjs`: passou, 472 documentos registrados e 10 avisos preexistentes.
- `pnpm lint` e `pnpm typecheck`: passaram em 12 tarefas cada.
- `pnpm --filter @routebook/trip-management test`: 110 testes passaram.
- Testes web focados em formulário, geocoding, escopo de Discovery, ação da Etapa e distância: 24 testes passaram.
- Migração `0038_stage_accommodation.sql` aplicada com sucesso ao branch Neon isolado.
- `pnpm --filter @routebook/database exec vitest run --testTimeout 60000 --hookTimeout 60000 --maxWorkers 2`: 215 testes passaram em 39 arquivos.
- `pnpm --filter @routebook/web exec vitest run --testTimeout 60000 --hookTimeout 60000 --maxWorkers 4`: 539 testes passaram em 87 arquivos; a verificação focada de escopo também passou (quatro testes).
- `pnpm build`: passou, inclusive a rota da Hospedagem da Etapa e a página Minha seleção.
- Playwright, cenário Joinville–Itapema em desktop e mobile: três testes passaram, incluindo o setup de autenticação. A outra jornada da especificação, de São Paulo com busca externa, não foi executada neste incremento.
- `pnpm format:check`: falhou em 539 arquivos preexistentes do baseline; arquivos de código alterados nesta revisão foram formatados isoladamente.
- `git diff --check`: passou.
