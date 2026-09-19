---
id: RB-INC-203
title: TripPlacePreference como fonte autoritativa da Itinerary Proposal
description: Troca a origem automática dos candidatos da Itinerary Proposal para a seleção explícita da Viagem.
document_type: implementation-increment
owner: Proposal Management and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-19"
last_updated: "2026-09-19"
authors: [RouteBook Team]
tags: [implementation, itinerary-proposal, trip-place-preference, selection]
related_documents: [RB-CORE-0004, RB-ADR-028, RB-INC-196, RB-INC-200, RB-INC-201, RB-INC-202, RB-CTX-203]
prerequisites: [RB-INC-202]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-203 — TripPlacePreference como fonte autoritativa da Itinerary Proposal

## 1. Resultado vertical

A geração autoritativa de Itinerary Proposal deixa de promover Recommendation ou Discovery automaticamente e passa a usar somente a seleção explícita da própria Viagem.

## 2. Unidade de trabalho

- Issue: `#492`.
- Branch: `codex/rb-inc-203-trip-place-preference-proposal`.
- Base: `main` @ `8818b948d0d0de478ae16965d4681586ac4f7c8f`.
- Merge em `main` e Production permanecem gates humanos explícitos.

## 3. Contrato

- `WANT` participa por padrão.
- `MAYBE` participa somente com `includeMaybe = true`.
- `NOT_INTERESTED` e Place não avaliado não participam.
- `MUST_DO` possui precedência estável entre candidatos elegíveis, sem violar capacidade ou demais restrições.
- Place já presente em Activity ativa não é proposto novamente.
- Recommendation e Discovery deixam de ser fontes automáticas.
- Gerar Proposal não cria preferência, Activity, Decision ou Recommendation.
- Proposal continua sem alterar o Itinerary antes do aceite explícito.

## 4. UX

A ação de geração expõe uma opção explícita para incluir lugares marcados como **Talvez**. O padrão é desativado.

## 5. Caminhos autorizados

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
apps/web/components/itinerary-proposal-generation-control.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts
apps/web/e2e/itinerary-proposal-generation.spec.ts
docs/implementation/increments/rb-inc-203-trip-place-preference-proposal.md
docs/implementation/context-packs/rb-inc-203-trip-place-preference-proposal.md
docs/registry.md
```

## 6. Fora de escopo

- ReplanningWindow.
- operações de delta de replanejamento.
- Planning Role especializado.
- novo schema ou migration.
- Production.
- merge na `main` sem autorização humana.

## 7. Critérios de aceite

- [ ] WANT entra por padrão.
- [ ] MAYBE só entra com includeMaybe.
- [ ] NOT_INTERESTED não entra.
- [ ] MUST_DO precede WANT comum.
- [ ] Place já planejado é excluído.
- [ ] Recommendation e Discovery não alimentam mais a geração automática.
- [ ] a UX permite optar por incluir Talvez.
- [ ] Proposal não altera Itinerary antes do aceite.
- [ ] testes unitários, PostgreSQL e E2E cobrem o fluxo.
- [ ] Documentation e Engineering Validation verdes no mesmo SHA.

## 8. Validação

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 9. Rollback

Sem migration. O rollback restaura a origem de candidatos anterior sem alterar preferências persistidas.
