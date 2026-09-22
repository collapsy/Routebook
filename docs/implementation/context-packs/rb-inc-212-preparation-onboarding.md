---
id: RB-CTX-212
title: Context Pack do RB-INC-212 — Onboarding da preparação
description: Delimita a entrada intuitiva no wizard após a criação da Trip.
document_type: implementation-context-pack
owner: Experience
status: Draft
version: "0.1.0"
created: "2026-09-22"
last_updated: "2026-09-22"
authors: [RouteBook Team]
tags: [implementation, context-pack, onboarding, wizard]
related_documents: [RB-INC-212, RB-INC-211, RB-INC-210, RB-INC-209, RB-INC-207, RB-ADR-027, RB-ADR-028, RB-CORE-0004, RB-DOM-001, RB-DOM-003]
prerequisites: [RB-INC-211]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-212 — Onboarding da preparação

## Missão

Transformar a criação de uma Trip na entrada natural da preparação, sem introduzir estado concorrente.

## Leitura obrigatória

`AGENTS.md`, `RB-CORE-0004`, `docs/README.md`, RB-INC/CTX-207, RB-INC/CTX-209, RB-INC/CTX-210, RB-INC/CTX-211, RB-ADR-027, RB-ADR-028, domínio de Trip, TripPlacePreference, TravelerProfile e Proposal, páginas de criação, visão da Trip e wizard.

## Contratos

- `createPostgresAuthenticatedTrip` retorna a Trip criada e continua sendo a fronteira canônica.
- `preparar=1` é contexto transitório do wizard.
- A moldura introdutória é derivada de `Trip.status=draft` em toda entrada no wizard, não da presença de `onboarding=1`.
- Retomar reabre em Lugares; as respostas existentes continuam derivadas de `TripPlacePreference` e `TravelerProfile`.
- A aplicação de planejamento que muda Trip para `planned` encerra a apresentação de onboarding.
- Trip, TripPlacePreference, TravelerProfile, Activity e Proposal mantêm responsabilidades distintas.

## Caminhos permitidos

```text
apps/web/app/viagens/nova/actions.ts
apps/web/app/viagens/nova/actions.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares-salvos/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/components/trip-planning-wizard.tsx
apps/web/e2e/authenticated-trips.spec.ts
apps/web/e2e/product-shell.spec.ts
apps/web/e2e/itinerary.spec.ts
apps/web/e2e/recommendations-anywhere.spec.ts
apps/web/e2e/recommendations-experience.spec.ts
docs/implementation/increments/rb-inc-212-preparation-onboarding.md
docs/implementation/context-packs/rb-inc-212-preparation-onboarding.md
docs/registry.md
docs/implementation/traceability-matrix.md
```

## Proibições

Não criar WizardState, WizardSession, cookie de progresso, migration, Activity, Proposal ou `ROUTEBOOK_RECOMMENDED`. Não mudar o fluxo normal de Trip já existente fora da preparação.

## Critérios de aceite

- [ ] criação válida redireciona à Etapa 1;
- [ ] onboarding apresenta sequência e próximo passo;
- [ ] uma Trip `draft` reabre o onboarding sem depender de parâmetro efêmero;
- [ ] retomar começa em Lugares e mantém seleções/contexto já persistidos;
- [ ] Trip planejada não reapresenta o onboarding inicial;
- [ ] links preservam `preparar=1`;
- [ ] retomada pela visão da Trip continua disponível;
- [ ] erros de criação permanecem na página de criação;
- [ ] E2E existente é atualizado sem mascarar regressões;
- [ ] mobile e acessibilidade permanecem válidos;
- [ ] nenhum estado canônico indevido é criado.

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

Após CI e Preview verdes, parar antes do merge e aguardar autorização explícita.
