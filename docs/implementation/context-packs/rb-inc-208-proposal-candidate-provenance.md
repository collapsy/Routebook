---
id: RB-CTX-208
title: Context Pack do RB-INC-208 — Origem e proveniência da Proposal
description: Delimita a evolução mínima dos contratos executáveis de candidatos da Itinerary Proposal sem implementar geração complementar.
document_type: implementation-context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-09-21"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [implementation, context-pack, itinerary-proposal, provenance]
related_documents: [RB-INC-208, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-INC-203, RB-INC-206, RB-INC-207, RB-CORE-0004, RB-DOM-001, RB-DOM-003, RB-ARC-002]
prerequisites: [RB-INC-207]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-208 — Origem e proveniência da Proposal

## 1. Missão

Evoluir os contratos existentes de Proposal Management para representar origem e proveniência mínima de candidatos, preservando compatibilidade e sem conectar ainda qualquer mecanismo que gere `ROUTEBOOK_RECOMMENDED`.

## 2. Unidade de trabalho

- Issue: [#507](https://github.com/collapsy/Routebook/issues/507).
- Branch: `codex/issue-507-proposal-candidate-provenance`.
- Base: `main@9d9f8b5c3e8315c0f2e40d94e9d8111e523928fc`.
- Incremento: RB-INC-208.
- Merge na `main` exige autorização humana explícita.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-ADR-027;
5. RB-ADR-028;
6. RB-ADR-029;
7. RB-INC-199 a RB-INC-207 e seus Context Packs;
8. documentos relacionados de Product, Domain, UX e Architecture;
9. implementação atual de Proposal Management, Trip Collection e persistência de Proposal.

## 4. Auditoria consolidada

- candidato executável existente: `ItineraryProposalGenerationCandidate`;
- owner: Proposal Management;
- origem/proveniência estruturada: ausente antes deste incremento;
- `reason?: string`: legado e não suficiente como proveniência estruturada;
- snapshot já existente: `ItineraryProposalGenerationContext`;
- persistência já existente: `generation_context jsonb`;
- menor mudança: adicionar origem/proveniência ao candidato e snapshot opcional de candidatos no contexto;
- compatibilidade: não alterar schemaVersion nem persistência física porque a evolução é aditiva e opcional.

## 5. Regras executáveis

```text
origin = USER_SELECTED | ROUTEBOOK_RECOMMENDED
```

- USER_SELECTED exige `provenance.sourceId`;
- ROUTEBOOK_RECOMMENDED exige `provenance.reasonCode`;
- proveniência sem origem é inválida;
- seleção autoritativa atual produz somente USER_SELECTED;
- WANT entra por padrão;
- MAYBE entra somente com `includeMaybe=true`;
- NOT_INTERESTED nunca entra nesse caminho;
- MUST_DO só qualifica WANT;
- não criar preferência, Activity ou mudança no Itinerary por representar candidato.

## 6. Persistência e compatibilidade

O novo `generationContext.candidates` é opcional.

Isso permite:

- ler snapshots históricos sem o campo;
- persistir snapshots novos no JSONB existente;
- preservar `schemaVersion: 1`;
- evitar migration;
- manter INITIAL/REPLAN e ReplanningWindow intactos.

Não inferir origem retroativamente para Proposal histórica.

## 7. Caminhos

Alterar somente os caminhos autorizados no RB-INC-208.

Qualquer arquivo adicional indispensável deve ser incluído primeiro no incremento e justificado na PR.

## 8. Proibições

- não conectar Recommendation/Discovery à geração autoritativa;
- não criar algoritmo complementar;
- não criar enum completo de reasonCode por antecipação;
- não criar estado de wizard;
- não alterar TripPlacePreference;
- não alterar Planning Role ou Place Category;
- não alterar schema/migration;
- não alterar UI;
- não tocar Production;
- não fazer push direto na main;
- não fazer merge sem autorização humana.

## 9. Verificações mínimas

- USER_SELECTED carrega sourceId da preferência;
- MAYBE continua condicionado ao opt-in;
- NOT_INTERESTED continua ausente;
- candidato ROUTEBOOK_RECOMMENDED é representável somente com razão estrutural;
- snapshot legado continua válido;
- snapshot novo normaliza e congela proveniência;
- round-trip JSONB preserva candidatos;
- REPLAN continua preservando ReplanningWindow;
- regressão integral permanece verde.

## 10. Gate humano

Após testes e CI integral, a PR permanece aberta até autorização explícita de merge.
