---
id: RB-INC-208
title: Contratos executáveis de origem e proveniência da Proposal
description: Evolui os contratos existentes da Itinerary Proposal para distinguir seleção do usuário de recomendação complementar sem implementar ainda a geração de complementos.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-09-21"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [implementation, itinerary-proposal, candidate, provenance, trip-place-preference]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-003, RB-ARC-002, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-INC-203, RB-INC-206, RB-INC-207, RB-CTX-208]
prerequisites: [RB-INC-207]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-208 — Contratos executáveis de origem e proveniência da Proposal

## 1. Unidade de trabalho

- Issue: [#507](https://github.com/collapsy/Routebook/issues/507).
- Branch: `codex/issue-507-proposal-candidate-provenance`.
- Base: `main@9d9f8b5c3e8315c0f2e40d94e9d8111e523928fc`.
- Pull Request: pendente na abertura deste incremento.
- Merge na `main`: gate humano explícito.

## 2. Resultado vertical

Proposal Management passa a possuir contratos executáveis mínimos para distinguir:

```text
USER_SELECTED
ROUTEBOOK_RECOMMENDED
```

sem criar novo agregado e sem alterar a persistência física.

O caminho autoritativo atual, derivado de `TripPlacePreference`, marca os candidatos como `USER_SELECTED` e registra a origem em um snapshot opcional de candidatos dentro de `generationContext`.

`ROUTEBOOK_RECOMMENDED` passa a ser representável e validável, porém nenhuma fonte automática de complemento é conectada neste incremento.

## 3. Auditoria e decisão mínima

O contrato já existente de candidato é `ItineraryProposalGenerationCandidate`. Ele pertence a Proposal Management e é reutilizado.

A Proposal já possui `generationContext` versionado e persistido em JSONB. Por isso, a menor evolução compatível é adicionar um snapshot opcional `candidates` ao schema lógico existente, sem migration.

O campo textual legado `reason` permanece compatível, mas não substitui a proveniência estruturada.

## 4. Contratos

```text
ProposalCandidateOrigin
= USER_SELECTED | ROUTEBOOK_RECOMMENDED

ProposalCandidateProvenance
- sourceId?
- reasonCode?
```

Regras mínimas:

- `USER_SELECTED` exige `sourceId`, atualmente o ID da `TripPlacePreference`;
- `ROUTEBOOK_RECOMMENDED` exige `reasonCode`;
- proveniência não existe sem origem explícita;
- candidato selecionado continua derivado somente de preferência elegível;
- candidato recomendado não cria `TripPlacePreference`;
- esta etapa não produz automaticamente candidatos recomendados.

## 5. Compatibilidade

- `generationContext.schemaVersion` permanece 1;
- `candidates` é aditivo e opcional;
- snapshots antigos sem `candidates` continuam válidos;
- `generationScope = INITIAL | REPLAN` permanece;
- `includeMaybe` permanece;
- lifecycle e aceite integral/parcial permanecem;
- nenhuma coluna, migration ou versão física de conteúdo é alterada.

## 6. Invariantes preservadas

- WANT participa normalmente;
- MAYBE exige opt-in;
- NOT_INTERESTED não participa do caminho automático atual;
- MUST_DO somente qualifica WANT;
- TripPlacePreference não cria Activity;
- Proposal não altera Itinerary antes do aceite;
- aceite não cria WANT implicitamente;
- Planning Role permanece separado de Place Category;
- ReplanningWindow continua protegendo REPLAN.

## 7. Caminhos autorizados

```text
modules/proposal-management/src/itinerary-proposal.ts
modules/proposal-management/src/itinerary-proposal.test.ts
modules/proposal-management/src/deterministic-itinerary-proposal-generator.ts
modules/proposal-management/src/deterministic-itinerary-proposal-generator.test.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.test.ts
modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts
modules/proposal-management/src/authoritative-itinerary-proposal-generation.test.ts
modules/proposal-management/src/index.ts
packages/database/src/proposal-repository.test.ts
docs/implementation/increments/rb-inc-208-proposal-candidate-provenance.md
docs/implementation/context-packs/rb-inc-208-proposal-candidate-provenance.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Somente leitura

```text
modules/trip-collection/**
modules/trip-management/**
apps/web/**
packages/database/src/proposal-schema.ts
docs/core/**
docs/product/**
docs/domain/**
docs/ux/**
docs/architecture/**
```

## 9. Fora de escopo

- wizard visual ou estado de wizard;
- política de contexto mínimo;
- geração real de ROUTEBOOK_RECOMMENDED;
- Discovery automática;
- busca de complementos;
- ranking, scoring ou IA;
- taxonomia completa de reasonCode;
- alteração de Proposed Activity persistida;
- schema ou migration;
- UX de explicabilidade;
- Production.

## 10. Testes obrigatórios

```bash
pnpm --filter @routebook/proposal-management test
pnpm --filter @routebook/database test
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O CI permanece evidência autoritativa para PostgreSQL, migrations, smoke e E2E.

## 11. Critérios de aceite

- [ ] origem USER_SELECTED e ROUTEBOOK_RECOMMENDED tipada;
- [ ] TripPlacePreference elegível produz USER_SELECTED;
- [ ] proveniência USER_SELECTED referencia a preferência;
- [ ] ROUTEBOOK_RECOMMENDED exige razão estrutural;
- [ ] NOT_INTERESTED não vira complemento automático;
- [ ] MAYBE continua opt-in;
- [ ] snapshot antigo sem candidates continua legível;
- [ ] snapshot novo preserva origem/proveniência no round-trip JSONB;
- [ ] nenhuma geração real de complemento foi conectada;
- [ ] nenhuma migration ou estado de wizard foi criado;
- [ ] documentação e CI ficam verdes.

## 12. Riscos

- a taxonomia de `reasonCode` ainda não é fechada; isso é deliberado para evitar antecipar a Etapa 5/6;
- `reason` textual legado continua existindo e não deve ser confundido com proveniência estruturada;
- Proposals históricas não possuem snapshot de candidatos e continuam interpretadas sem inferência retroativa.

## 13. Próximo passo

Etapa 3: construir o wizard de escolha de lugares usando `TripPlacePreference` e os contratos estabilizados, sem implementar ainda contexto progressivo ou geração de complementos.
