---
id: RB-INC-211
title: Wizard de preparação — revisão da viagem
description: Implementa a Etapa 3 de 4 como projeção somente leitura das fontes canônicas da preparação.
document_type: implementation-increment
owner: Experience
status: Draft
version: "0.1.0"
created: "2026-09-22"
last_updated: "2026-09-22"
authors: [RouteBook Team]
tags: [implementation, wizard, preparation, review]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-INC-207, RB-INC-208, RB-INC-209, RB-INC-210, RB-CTX-211]
prerequisites: [RB-INC-210]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-211 — Wizard de preparação: revisão da viagem

## Unidade de trabalho

- Issue: [#513](https://github.com/collapsy/Routebook/issues/513)
- Branch: `codex/rb-inc-211-trip-preparation-review`
- Base: `main@e56afb11a989efd867a640faa8da53ae3da760c2`
- Merge: somente após autorização humana explícita.

## Objetivo

Entregar a Etapa 3 de 4 do wizard, permitindo revisar Trip, intenções de Places e TravelerProfile antes da futura Proposta.

## Regra de dados

`TripPreparationReviewModel` permanece uma projeção pura, determinística e não persistida de `Trip + TripPlacePreference[] + TravelerProfile`. A tela reconstrói o modelo a cada acesso; nomes dos Places são resolução de leitura para apresentação.

## Experiência e aceite

- Revisão aparece como Etapa 3 de 4 e preserva `preparar=1`.
- Trip exibe destino, período, hospedagem e responsável, sem cópia no wizard.
- `WANT`, `MAYBE` e `NOT_INTERESTED` são semanticamente separados; `MUST_DO` é destacado.
- TravelerProfile exibe valores informados e `Não informado` para opcionais ausentes.
- A única pendência obrigatória é a quantidade de viajantes, conforme o contrato existente.
- Lugares e Contexto possuem edição por retorno ao wizard, e o modelo é atualizado ao recarregar.
- O CTA da próxima etapa permanece desabilitado/explicado enquanto Proposal ainda não pertence a este incremento.
- Nenhuma Activity, ItineraryProposal ou `ROUTEBOOK_RECOMMENDED` é criada.

## Fora de escopo

Geração/aplicação de Proposal, montagem de dias, ranking definitivo, complementação automática, replanejamento, WizardState/WizardSession, snapshot persistido, autenticação e Production.

## Caminhos

Implementação: `apps/web/app/viagens/[tripId]/preparacao/revisao/**`, `apps/web/app/viagens/[tripId]/contexto/page.tsx`, `apps/web/components/trip-planning-wizard.tsx`, `apps/web/lib/trip-preparation-review.*`, `apps/web/app/viagens/trip-overview.css`, testes correspondentes.

Documentação: este incremento, `docs/implementation/context-packs/rb-inc-211-trip-preparation-review.md`, `docs/registry.md` e `docs/implementation/traceability-matrix.md`.

## Validação

`node scripts/validate-docs.mjs`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e E2E aplicável. CI e Vercel Preview são evidência final; merge não é automático.
