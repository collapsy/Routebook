---
id: RB-CTX-211
title: Context Pack do RB-INC-211 — Revisão da preparação
description: Delimita a implementação da Etapa 3 do wizard sem criar estado duplicado.
document_type: implementation-context-pack
owner: Experience
status: Draft
version: "0.1.0"
created: "2026-09-22"
last_updated: "2026-09-22"
authors: [RouteBook Team]
tags: [implementation, context-pack, wizard, review]
related_documents: [RB-INC-211, RB-INC-210, RB-INC-209, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003]
prerequisites: [RB-INC-210]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-211 — Revisão da preparação

## Missão

Implementar a Revisão como superfície somente leitura, derivada das fontes canônicas atuais.

## Leitura obrigatória

`AGENTS.md`, `RB-CORE-0004`, `docs/README.md`, `RB-INC/CTX-209`, `RB-INC/CTX-210`, `RB-INC-207`, `RB-INC-208`, `RB-ADR-027`, `RB-ADR-028`, `RB-ADR-029`, domínio de Trip, TravelerProfile, TripPlacePreference e Proposal, implementação do wizard e `TripPreparationReviewModel`.

## Contratos e invariantes

- Trip continua dona de destino, período, hospedagem e participantes.
- TravelerProfile continua dono do contexto adicional.
- TripPlacePreference continua dono das intenções e prioridades.
- `TripPlacePreference ≠ Activity`, `Proposal ≠ Roteiro aplicado`.
- `MUST_DO` só é válido como prioridade de `WANT`.
- `USER_SELECTED ≠ ROUTEBOOK_RECOMMENDED`.
- Campos opcionais ausentes não bloqueiam.

## Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/preparacao/revisao/**
apps/web/app/viagens/[tripId]/contexto/page.tsx
apps/web/components/trip-planning-wizard.tsx
apps/web/lib/trip-preparation-review.*
apps/web/app/viagens/trip-overview.css
apps/web/e2e/trip-preparation-review.spec.ts
docs/implementation/increments/rb-inc-211-trip-preparation-review.md
docs/implementation/context-packs/rb-inc-211-trip-preparation-review.md
docs/registry.md
docs/implementation/traceability-matrix.md
```

## Proibições

Não criar tabela, migration, WizardState, WizardSession, snapshot persistido, Activity, Proposal, origem `ROUTEBOOK_RECOMMENDED`, geração automática, alteração de autenticação ou Production.

## Critérios de aceite

- [ ] Revisão é Etapa 3 de 4 e preserva `preparar=1`.
- [ ] Trip, seleções e contexto são exibidos a partir das fontes atuais.
- [ ] WANT/MAYBE/NOT_INTERESTED e MUST_DO são compreensíveis.
- [ ] opcionais ausentes mostram `Não informado`.
- [ ] edição de Lugares e Contexto retorna ao wizard sem perder dados.
- [ ] retorno reflete alterações recentes.
- [ ] nenhuma Activity/Proposal/recomendação automática é criada.
- [ ] rota normal fora do wizard permanece compatível.
- [ ] mobile e acessibilidade são cobertos.

## Comandos

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Gate humano

Após PR, CI e Preview, parar antes do merge e informar evidências reais, riscos e SHA.
