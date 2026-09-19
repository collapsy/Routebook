---
id: RB-INC-203
title: TripPlacePreference como fonte autoritativa da Itinerary Proposal
description: Troca a origem automática dos candidatos da Itinerary Proposal para a seleção explícita da Trip, com WANT por padrão e MAYBE por opt-in.
document_type: implementation-increment
owner: Proposal Management and Trip Collection
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, trip-collection, itinerary-proposal, trip-place-preference, selection]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002, RB-ADR-028, RB-INC-199, RB-INC-200, RB-INC-201, RB-INC-202, RB-CTX-203]
prerequisites: [RB-INC-202]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-203 — TripPlacePreference como fonte autoritativa da Itinerary Proposal

## 1. Estado

`Draft`

- issue: [#492](https://github.com/collapsy/Routebook/issues/492);
- branch: `codex/issue-492-trip-selection-proposal-candidates`;
- base: `main@8818b948d0d0de478ae16965d4681586ac4f7c8f`.

## 2. Resultado vertical

A ação explícita de gerar uma Itinerary Proposal passa a usar somente a seleção explícita da Viagem como fonte automática de candidatos:

```text
WANT
+ MAYBE quando includeMaybe = true
- NOT_INTERESTED
- não avaliados
```

Recommendations e Discovery deixam de alimentar automaticamente a Proposal. Um Lugar descoberto externamente somente participa depois de existir como Place canônico e receber TripPlacePreference explícita do viajante.

## 3. Problema

RB-INC-202 tornou TripPlacePreference utilizável na interface, mas o gerador autoritativo ainda herda a ponte histórica do RB-INC-191:

```text
Recommendations persistidas
+ Discovery segura materializada durante a geração
→ Itinerary Proposal
```

Esse fluxo contradiz o RB-ADR-028, porque permite que lugares sem intenção explícita do viajante participem da composição.

## 4. Contrato de seleção

- `WANT` participa por padrão;
- `MAYBE` participa somente quando `includeMaybe = true`;
- `NOT_INTERESTED` nunca participa automaticamente;
- ausência de TripPlacePreference significa não avaliado e não participa;
- `MUST_DO` dá precedência entre candidatos elegíveis;
- `MUST_DO` não autoriza ultrapassar capacidade ou outras restrições;
- Place já representado por Activity ativa do Itinerary não é proposto novamente;
- ordem permanece determinística e estável.

## 5. UX de geração

A ação **Gerar proposta de roteiro** oferece uma opção explícita:

```text
[ ] Incluir lugares marcados como Talvez
```

O padrão é desativado.

A opção afeta somente aquela geração e não modifica TripPlacePreference.

## 6. Fronteira arquitetural

Proposal Management consome um snapshot de TripPlacePreference e fatos dos Places referenciados.

O contexto PostgreSQL autoritativo passa a carregar:

- Itinerary e seus Dias;
- Activities e Free Periods necessários à composição;
- TripPlacePreferences da Trip;
- Places referenciados pelas preferências elegíveis.

Recommendation e Discovery permanecem contextos separados. A ação de gerar Proposal não executa Discovery nem promove candidato externo.

## 7. Compatibilidade

- o compositor determinístico do RB-INC-196 permanece;
- o lifecycle de Proposal permanece;
- aceite integral/parcial permanece;
- Proposal vazia continua válida e não aplicável;
- Saved Places continua apenas como adapter legado da TripPlacePreference;
- Recommendation e Discovery continuam funcionando em suas próprias superfícies.

## 8. Caminhos autorizados

```text
modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts
modules/proposal-management/src/authoritative-itinerary-proposal-generation.test.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.test.ts
modules/proposal-management/src/index.ts
packages/database/src/authoritative-itinerary-proposal-generation-context.ts
packages/database/src/authoritative-itinerary-proposal-generation-context-postgres.test.ts
apps/web/lib/itinerary-proposal-generation.ts
apps/web/lib/itinerary-proposal-generation.test.ts
apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts
apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.test.ts
apps/web/components/itinerary-proposal-generation-control.tsx
apps/web/components/itinerary-proposal-generation-control.test.tsx
apps/web/e2e/itinerary-proposal-generation.spec.ts
docs/implementation/increments/rb-inc-203-trip-selection-proposal-candidates.md
docs/implementation/context-packs/rb-inc-203-trip-selection-proposal-candidates.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Somente leitura

```text
modules/trip-collection/**
modules/place-catalog/**
modules/trip-management/**
packages/database/src/schema.ts
docs/core/**
docs/domain/**
docs/architecture/**
```

## 10. Fora de escopo

- ReplanningWindow;
- `generationScope = REPLAN`;
- operações add/move/update/remove de replanejamento;
- persistência estruturada de ProposalCandidateOutcome;
- Planning Role especializado;
- migration/schema;
- Provider novo;
- Preview/Production;
- merge na main sem autorização humana.

## 11. Testes obrigatórios

```bash
pnpm install --frozen-lockfile
pnpm --filter @routebook/proposal-management test
pnpm --filter @routebook/database test
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

## 12. Critérios de aceite

- [ ] WANT é a fonte automática padrão da Proposal;
- [ ] MAYBE só entra com opt-in explícito;
- [ ] NOT_INTERESTED não entra;
- [ ] Place não avaliado não entra;
- [ ] MUST_DO precede WANT comum sem violar o compositor;
- [ ] Place já planejado não volta como nova Proposed Activity;
- [ ] Recommendation não alimenta mais automaticamente a geração;
- [ ] Discovery não é executada/materializada pela ação de gerar Proposal;
- [ ] geração vazia continua válida e explicada;
- [ ] UI oferece opt-in claro para MAYBE;
- [ ] alterar includeMaybe não altera preferências;
- [ ] Proposal não altera Itinerary antes do aceite;
- [ ] regressão integral permanece verde.

## 13. Riscos

- viagens sem seleção explícita podem gerar Proposal vazia; isso é comportamento correto e deve ser explicado;
- Recommendations antigas continuam persistidas, mas deixam de ser candidatas automáticas;
- o arquivo legado de ponte Discovery → Proposal pode permanecer no código até remoção posterior, desde que não esteja conectado à ação canônica;
- ReplanningWindow ainda não protege temporalmente geração durante a Viagem e permanece incremento posterior.

## 14. Rollback

Sem migration. O rollback restaura a origem anterior de candidatos por código, sem alterar TripPlacePreference, Itinerary ou Proposals existentes.
