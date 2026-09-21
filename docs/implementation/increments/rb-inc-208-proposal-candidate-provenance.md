---
id: RB-INC-208
title: Proveniência executável de candidatos da Itinerary Proposal
description: Tipifica origem e proveniência mínima de candidatos da Proposal, preservando TripPlacePreference, snapshots legados e o pipeline autoritativo sem gerar complementos automaticamente.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-09-21"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [implementation, itinerary-proposal, candidate, provenance, trip-place-preference]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-INC-203, RB-INC-206, RB-INC-207, RB-CTX-208]
prerequisites: [RB-INC-207]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-208 — Proveniência executável de candidatos da Itinerary Proposal

## 1. Estado

`Draft`

- issue: [#505](https://github.com/collapsy/Routebook/issues/505);
- branch: `codex/issue-505-proposal-candidate-provenance`;
- base: `main@9d9f8b5c3e8315c0f2e40d94e9d8111e523928fc`;
- PR: a abrir;
- merge na `main`: gate humano explícito.

## 2. Resultado vertical

Proposal Management passa a possuir representação executável mínima para distinguir:

```text
USER_SELECTED
ROUTEBOOK_RECOMMENDED
```

A geração autoritativa vigente continua produzindo somente `USER_SELECTED`, derivados de `TripPlacePreference`.

Este incremento não descobre, busca, ranqueia nem injeta candidatos `ROUTEBOOK_RECOMMENDED`. Ele somente torna a origem e a proveniência representáveis, validáveis e persistíveis para incrementos posteriores.

## 3. Auditoria do estado executável

### 3.1 Contrato já existente de candidato

O contrato executável reutilizado é:

`ItineraryProposalGenerationCandidate`

em `modules/proposal-management/src/deterministic-itinerary-proposal-generator.ts`.

Não é criado um segundo `ProposalCandidate`.

### 3.2 Ownership

O Candidate pertence à composição da Itinerary Proposal e permanece em Proposal Management.

`TripPlacePreference` continua pertencendo a Trip Collection e não recebe ownership de Candidate.

### 3.3 Origem e proveniência anteriores

Antes deste incremento:

- Candidate possuía `candidateId`, `placeId` e sinais de composição;
- existia `reason?: string`, destinado à justificativa textual da Proposed Activity;
- não existia origem estruturada `USER_SELECTED | ROUTEBOOK_RECOMMENDED`;
- não existia proveniência de candidato persistida no snapshot da geração.

### 3.4 Justificativa existente

A Proposal possui `criteria[]`, `justifications[]` e Proposed Activity possui `reason?: string`.

Esses textos não são reutilizados como proveniência estrutural. Motivo de considerar um Candidate permanece separado de motivo de exclusão e de texto de UI.

### 3.5 Snapshot e versionamento reutilizados

RB-INC-206 já publicou:

```text
generationScope = INITIAL | REPLAN
generationContext.schemaVersion = 1
generationContext.selection[]
generationContext.replanningWindow?
```

e persiste `generationContext` em JSONB.

A menor evolução compatível é adicionar `candidateProvenance?` ao schema 1 como campo opcional e aditivo. Não há alteração de coluna, migration ou content schema.

### 3.6 Compatibilidade

- Proposal histórica sem `candidateProvenance` continua válida;
- nova geração autoritativa materializa `candidateProvenance`;
- repository existente persiste e reidrata o JSONB sem nova migration;
- `generationScope`, `includeMaybe` e ReplanningWindow não mudam.

## 4. Contratos executáveis

### 4.1 Origem

```text
ItineraryProposalCandidateOrigin
= USER_SELECTED
| ROUTEBOOK_RECOMMENDED
```

### 4.2 Fonte em memória

`ItineraryProposalCandidateSource` é uma união discriminada:

```text
USER_SELECTED
- sourcePreferenceId

ROUTEBOOK_RECOMMENDED
- reasonCode
```

`reasonCode` é estrutural, não texto de interface, e deve ser não vazio.

A taxonomia completa de códigos não é fechada neste incremento.

### 4.3 Proveniência persistível

`ItineraryProposalCandidateProvenance` registra:

- `candidateId`;
- `placeId`;
- `origin`;
- `sourcePreferenceId`, quando `USER_SELECTED`;
- `reasonCode`, quando `ROUTEBOOK_RECOMMENDED`.

Ela é persistida em:

```text
generationContext.candidateProvenance[]
```

## 5. Invariantes

### USER_SELECTED

- deve referenciar uma `TripPlacePreference` presente no snapshot;
- o Place deve ser o mesmo da preferência;
- `NOT_INTERESTED` não é elegível;
- `MAYBE` somente é válido quando `includeMaybe = true`;
- `MUST_DO` continua qualificador de `WANT`, sem superar restrições.

### ROUTEBOOK_RECOMMENDED

- exige `reasonCode` estrutural não vazio;
- não pode representar um Place que possua qualquer `TripPlacePreference` no snapshot;
- portanto não pode contornar `NOT_INTERESTED`;
- não cria ou altera `TripPlacePreference`;
- não cria Activity antes do aceite.

## 6. Candidate set vigente

O assembler baseado em seleção passa a anexar:

```text
provenance.origin = USER_SELECTED
provenance.sourcePreferenceId = preferenceId
```

para WANT e MAYBE opt-in elegíveis.

Recommendation e Discovery continuam fora da fonte autoritativa automática conforme RB-INC-203.

Nenhum caminho de produção cria `ROUTEBOOK_RECOMMENDED` neste incremento.

## 7. Persistência

Nenhuma migration é necessária.

`generation_context` já é JSONB e o campo `candidateProvenance` é opcional para backward compatibility.

O teste PostgreSQL de repository cobre round-trip com a nova proveniência.

## 8. Aceite e efeitos

Este incremento não altera aplicação integral ou parcial da Proposal.

A fronteira continua:

```text
Candidate
→ Proposal
→ aceite explícito
→ Activity
```

Nunca:

```text
ROUTEBOOK_RECOMMENDED
→ WANT automático
```

e nunca:

```text
Candidate
→ Activity sem aceite
```

## 9. Caminhos alterados

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
- documentação deste incremento, Registry e rastreabilidade.

## 10. Fora de escopo

- wizard visual ou estado de wizard;
- contexto mínimo da viagem;
- Planning Role novo ou duplicação de Place Category;
- geração efetiva de complementos;
- Discovery automática;
- scoring, ranking ou IA;
- preenchimento de dias;
- política nova de densidade;
- Provider;
- UI de Proposal;
- explicabilidade textual;
- taxonomia completa de `reasonCode`;
- schema/migration;
- Production.

## 11. Testes

Cobertura adicionada ou ampliada para:

- origens canônicas;
- USER_SELECTED derivado da seleção;
- WANT;
- MAYBE com opt-in;
- MAYBE sem opt-in;
- NOT_INTERESTED;
- MUST_DO;
- bloqueio de ROUTEBOOK_RECOMMENDED sobre Place com preferência;
- razão estrutural obrigatória para ROUTEBOOK_RECOMMENDED;
- snapshot autoritativo;
- snapshot legado sem proveniência;
- round-trip PostgreSQL do `generationContext`.

Gates esperados:

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Além dos testes focados de Proposal Management e Database.

## 12. Riscos e controles

### Campo opcional por compatibilidade

Proposals antigas não possuem proveniência. O campo permanece opcional no schema 1 para não reinterpretar histórico.

Novas gerações autoritativas exigem proveniência em todos os Candidates selecionados.

### Taxonomia de razão ainda aberta

`reasonCode` é obrigatório para candidatos recomendados, porém a lista completa não é congelada antes da etapa que efetivamente os produzir.

### Mapeamento Candidate → Proposed Activity

A proveniência registra `placeId` único no candidate set. Não é criada coluna paralela em Proposed Activity somente para antecipar UX futura.

## 13. Critérios de aceite

- [x] origem executável definida;
- [x] Candidate existente reutilizado;
- [x] USER_SELECTED conectado à TripPlacePreference;
- [x] MAYBE preserva opt-in;
- [x] NOT_INTERESTED não pode virar complemento;
- [x] MUST_DO preserva semântica;
- [x] proveniência mínima estruturada definida;
- [x] snapshot aditivo e backward-compatible;
- [x] nenhuma migration;
- [x] nenhum estado de wizard;
- [x] nenhuma geração real de complemento;
- [x] nenhuma Activity ou preferência criada por efeito colateral;
- [ ] testes e CI verdes no HEAD final;
- [ ] PR revisada para integração.

## 14. Próximo passo

Após integração desta etapa, a próxima conversa deve tratar exclusivamente da Etapa 3 — Wizard de escolha de lugares, consumindo os contratos aqui publicados sem reinventá-los.
