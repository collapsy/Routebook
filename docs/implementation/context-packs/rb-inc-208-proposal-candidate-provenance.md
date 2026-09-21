---
id: RB-CTX-208
title: Context Pack do RB-INC-208 — Proveniência executável de candidatos
description: Delimita a evolução mínima do Candidate e do generationContext da Itinerary Proposal para representar USER_SELECTED e ROUTEBOOK_RECOMMENDED sem gerar complementos.
document_type: implementation-context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-09-21"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [implementation, context-pack, itinerary-proposal, candidate, provenance]
related_documents: [RB-INC-208, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-INC-203, RB-INC-206, RB-INC-207, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002]
prerequisites: [RB-INC-207]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-208 — Proveniência executável de candidatos

## 1. Missão

Introduzir somente os contratos executáveis mínimos de origem/proveniência do Candidate da Itinerary Proposal, reutilizando o pipeline existente e preservando compatibilidade histórica.

## 2. Unidade de trabalho

- issue: [#505](https://github.com/collapsy/Routebook/issues/505);
- branch: `codex/issue-505-proposal-candidate-provenance`;
- base: `main@9d9f8b5c3e8315c0f2e40d94e9d8111e523928fc`;
- PR: a abrir;
- merge na main exige gate humano.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-ADR-027;
5. RB-ADR-028;
6. RB-ADR-029;
7. RB-INC-199 a RB-INC-207 e Context Packs;
8. RB-PRD-004 a RB-PRD-007;
9. RB-DOM-001 a RB-DOM-004;
10. RB-UX-001, RB-UX-002 e RB-UX-005;
11. RB-ARC-002;
12. RB-INC-191 e RB-INC-196.

## 4. Estado auditado

- Candidate executável: `ItineraryProposalGenerationCandidate`;
- ownership: Proposal Management;
- seleção autoritativa: `TripPlacePreference`;
- `WANT` entra por padrão;
- `MAYBE` exige `includeMaybe`;
- `NOT_INTERESTED` não entra;
- `MUST_DO` prioriza WANT;
- `generationContext` schema 1 já é persistido em JSONB;
- `reason?: string` e `justifications[]` são texto, não proveniência estruturada;
- Recommendation/Discovery não alimentam a geração autoritativa atual.

## 5. Contratos a evoluir

### Candidate

Adicionar proveniência opcional ao contrato existente, sem criar um segundo Candidate.

### Origem

```text
USER_SELECTED
ROUTEBOOK_RECOMMENDED
```

### Fonte

```text
USER_SELECTED
→ sourcePreferenceId obrigatório

ROUTEBOOK_RECOMMENDED
→ reasonCode estrutural obrigatório
```

### Snapshot

Adicionar de forma opcional e backward-compatible:

```text
generationContext.candidateProvenance[]
```

com identidade de Candidate, Place e origem.

## 6. Invariantes

- TripPlacePreference não cria Activity;
- Candidate não cria preferência;
- Candidate não cria Activity antes do aceite;
- `USER_SELECTED` precisa apontar para preferência elegível do mesmo Place;
- `MAYBE` só é elegível com opt-in;
- `NOT_INTERESTED` nunca é elegível;
- `ROUTEBOOK_RECOMMENDED` não pode usar Place presente em `selection[]`;
- `ROUTEBOOK_RECOMMENDED` exige `reasonCode`;
- `MUST_DO` não supera restrições;
- origem de Candidate não substitui Planning Role ou Place Category;
- motivos de inclusão não são motivos de exclusão.

## 7. Compatibilidade

- manter `generationContext.schemaVersion = 1`;
- `candidateProvenance` é opcional para leitura de snapshots anteriores;
- novas gerações autoritativas registram o campo;
- não alterar `contentSchemaVersion`;
- não alterar lifecycle;
- não alterar aceite integral/parcial;
- não alterar ReplanningWindow;
- não criar migration.

## 8. Caminhos permitidos

- `modules/proposal-management/src/itinerary-proposal.ts`;
- `modules/proposal-management/src/itinerary-proposal.test.ts`;
- `modules/proposal-management/src/deterministic-itinerary-proposal-generator.ts`;
- `modules/proposal-management/src/deterministic-itinerary-proposal-generator.test.ts`;
- `modules/proposal-management/src/itinerary-proposal-generation-input-assembler.ts`;
- `modules/proposal-management/src/itinerary-proposal-generation-input-assembler.test.ts`;
- `modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts`;
- `modules/proposal-management/src/authoritative-itinerary-proposal-generation.test.ts`;
- `modules/proposal-management/src/index.ts`;
- `packages/database/src/proposal-repository.test.ts`;
- `docs/implementation/increments/rb-inc-208-proposal-candidate-provenance.md`;
- `docs/implementation/context-packs/rb-inc-208-proposal-candidate-provenance.md`;
- `docs/registry.md`;
- `docs/implementation/traceability-matrix.md`.

## 9. Caminhos somente leitura

- `modules/trip-collection/**`;
- `modules/itinerary-planning/**`;
- `packages/database/src/proposal-repository.ts`;
- `packages/database/src/proposal-schema.ts`;
- `packages/database/drizzle/**`;
- `apps/web/**`;
- Product, Domain, UX e Architecture canônicos.

## 10. Proibições

- não criar tabela, coluna ou migration;
- não criar Wizard/PlanningSession/progresso persistido;
- não implementar algoritmo de complementos;
- não reativar Recommendation/Discovery como fonte automática;
- não adicionar scoring/ranking;
- não criar Provider;
- não aplicar Proposal automaticamente;
- não criar WANT ao aceitar candidato recomendado;
- não transformar texto de UI em contrato;
- não fechar taxonomia completa de explicabilidade.

## 11. Verificações mínimas

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Testes focados:

```bash
pnpm --filter @routebook/proposal-management test
pnpm --filter @routebook/database test
```

No CI, diferenciar regressão deste incremento de falha preexistente.

## 12. Gate humano

A PR pode ser implementada e validada autonomamente. Integração na `main` permanece gate humano conforme `AGENTS.md`.
