---
id: RB-INC-215
title: Etapa 7 — transição da preparação para operação
description: Encerra o onboarding inicial somente após aplicação explícita da Proposal e prioriza o Roteiro na experiência pós-geração.
document_type: implementation-increment
owner: Experience, Trip Management and Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-10-03"
last_updated: "2026-10-03"
authors: [RouteBook Team]
tags: [implementation, post-generation, trip-lifecycle, proposal-application, preparation]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-003, RB-DOM-004, RB-ADR-027, RB-ADR-028, RB-INC-207, RB-INC-212, RB-INC-213, RB-INC-214, RB-CTX-215]
prerequisites: [RB-INC-214]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-215 — Etapa 7: transição da preparação para operação

## Unidade de trabalho

- Issue: [#523](https://github.com/collapsy/Routebook/issues/523).
- Branch: `codex/rb-inc-215-post-generation`.
- Base: `main@18f8d9a390371695231416a8fa9891c848c3bbca`.
- Pull Request: a criar.
- Merge: somente após autorização humana explícita.

## Problema observado

RB-INC-212 define que o onboarding inicial termina quando o planejamento é aplicado e a Trip deixa `draft`. Na `main` desta etapa, páginas de Lugares continuam derivando a apresentação do wizard de `Trip.status === "draft"`, mas os fluxos de aceite integral e parcial aplicam a Proposal somente ao Itinerary/Proposal/Decision. Como a Trip não muda de estado, a visão geral mantém “Preparar viagem” como ação primária depois do aceite.

## Objetivo

Completar o pós-geração para a jornada inicial:

```text
Trip draft → gerar e revisar Proposal → aceite explícito → Trip planned → operar pelo Roteiro
```

A aplicação integral ou parcial bem-sucedida atualiza para `planned` uma Trip ainda `draft`, atomicamente com os efeitos da aplicação da Proposal. A visão da Trip passa a destacar a operação pelo Roteiro, sem remover acesso a Explorar, Minha seleção, contexto ou geração normal de Proposal.

## Regras e limites

- Proposal só altera estado canônico depois do aceite explícito existente.
- Apenas aplicação bem-sucedida de mudanças encerra a preparação inicial; gerar, revisar, descartar, falhar ou não aplicar não altera o status da Trip.
- A transição nova é estritamente `draft → planned`; status `planned`, `in-progress`, `completed`, `cancelled` ou `archived` não regridem nem são sobrescritos por esta regra.
- Aceite integral e parcial seguem idempotentes e a transição participa da mesma transação PostgreSQL já aprovada em RB-ADR-027.
- Nenhum WizardState, WizardSession, snapshot, cookie, tabela, coluna ou migration nova.
- O wizard inicial não deve reaparecer após a Trip tornar-se `planned`; criação/edição de Proposal fora do wizard permanece disponível.
- Não alterar conceitos de domínio, lifecycle temporal, autenticação, Providers ou Production.

## Fora de escopo

- Replanejamento `REPLAN` ou regras temporais de `ReplanningWindow`.
- Novas decisões, transições ou estados diferentes de `draft → planned` após aplicação explícita.
- Aplicação automática, mudança de comportamento de geração, ranking ou recomendações.
- Redesign completo da área da Trip.
- Migration/schema, mudanças de privacidade ou alteração de ADR.

## Caminhos permitidos

```text
modules/trip-management/src/trip.ts
modules/trip-management/src/trip.test.ts
modules/trip-management/src/service.ts
modules/trip-management/src/index.ts
packages/database/src/apply-itinerary-proposal-transaction.ts
packages/database/src/apply-itinerary-proposal-transaction.test.ts
packages/database/src/apply-itinerary-proposal-transaction-postgres.test.ts
packages/database/src/apply-itinerary-proposal-partially-transaction.ts
packages/database/src/apply-itinerary-proposal-partially-transaction.test.ts
packages/database/src/apply-itinerary-proposal-partially-transaction-postgres.test.ts
packages/database/src/itinerary-proposal-transaction-unit.ts
packages/database/src/itinerary-proposal-transaction-unit.test.ts
packages/database/src/trip-status-transaction-fragment.ts
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/contexto/page.tsx
apps/web/app/viagens/[tripId]/preparacao/revisao/page.tsx
apps/web/app/viagens/[tripId]/preparacao/proposta/page.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares-salvos/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx
apps/web/components/trip-planning-wizard.tsx
apps/web/components/trip-planning-wizard.test.tsx
apps/web/e2e/trip-preparation-proposal.spec.ts
apps/web/e2e/itinerary-proposal-review.spec.ts
apps/web/e2e/authenticated-trips.spec.ts
docs/implementation/increments/rb-inc-215-post-generation-experience.md
docs/implementation/context-packs/rb-inc-215-post-generation-experience.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Se a transação real usar outros arquivos indispensáveis, interrompa antes de editá-los e atualize formalmente os caminhos do incremento e Context Pack.

## Critérios de aceite

- [ ] Domínio puro permite a transição somente de `draft` para `planned`, sem regredir outros status.
- [ ] Aceite integral bem-sucedido aplica Itinerary, confirma Proposal/Decision e atualiza Trip na mesma transação.
- [ ] Aceite parcial bem-sucedido faz a mesma transição; replay mantém o resultado idempotente.
- [ ] Falha, conflito, Proposal vazia, rejeição/descartar ou geração sem aplicação deixam Trip inalterada.
- [ ] Trips `in-progress`, `completed`, `cancelled` ou `archived` nunca são sobrescritas por `planned`.
- [ ] Após aceitar, a visão da Trip prioriza “Abrir Roteiro” e não apresenta o onboarding inicial.
- [ ] Acesso planejado a lugares, seleção, contexto e fluxo padrão de Proposal continuam compatíveis e não mostram o wizard inicial.
- [ ] Trip `draft` continua podendo retomar o wizard a partir dos dados canônicos atuais.
- [ ] Testes unitários e de integração PostgreSQL cobrem transição, atomicidade, rollback e idempotência.
- [ ] E2E cobre preparação → Proposal → aceite integral/parcial → Roteiro → visão operacional, com viewport mobile e desktop.

## Validação obrigatória

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Engineering Validation, Documentation Validation e Vercel Preview da PR são evidências integradas. Registrar resultados efetivamente observados.

## Gate humano

Após PR e gates, parar antes do merge e informar SHA, CI, Preview, testes e riscos. Aguardar autorização humana explícita.
