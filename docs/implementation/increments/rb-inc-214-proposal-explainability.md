---
id: RB-INC-214
title: Explicabilidade dos resultados da Itinerary Proposal
description: Persiste outcomes verificáveis por candidato e explica origens, inclusões e exclusões na revisão da Proposal.
document_type: implementation-increment
owner: Proposal Management and Experience
status: Draft
version: "0.1.0"
created: "2026-10-02"
last_updated: "2026-10-02"
authors: [RouteBook Team]
tags: [implementation, itinerary-proposal, explainability, provenance]
related_documents: [RB-DOM-001, RB-DOM-003, RB-BR-PRP-014, RB-INC-207, RB-INC-208, RB-INC-213, RB-CTX-214]
prerequisites: [RB-INC-213]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-214 — Explicabilidade dos resultados da Itinerary Proposal

## Unidade de trabalho

- Issue: [#521](https://github.com/collapsy/Routebook/issues/521).
- Branch: `codex/rb-inc-214-proposal-explainability`.
- Base: `main@c838b1156ea7725cc3d81f566e58c814b6a1571f`.
- Merge na `main`: somente após autorização humana explícita.

## Objetivo

Materializar o contrato existente RB-BR-PRP-014: cada candidato elegível considerado pela geração terá outcome estruturado `INCLUDED` ou `EXCLUDED`, com código verificável, e a revisão apresentará a origem e a razão correspondente. A Proposal continuará sendo uma sugestão separada do Itinerary.

## Contratos e regras

- Usar `ProposalCandidateOutcome` e exclusivamente os reason codes já definidos em `docs/domain/domain-model.md`.
- Outcomes devem referenciar candidatos do snapshot da geração, sem inferir resultados a partir das preferências atuais.
- Candidatos incluídos devem corresponder a Places das Proposed Activities; candidatos excluídos devem preservar o motivo real da geração.
- O gerador determinístico registra `NO_CAPACITY` quando a densidade/capacidade disponível impede a inclusão.
- Preferências `MAYBE` excluídas por falta de opt-in registram `MAYBE_NOT_REQUESTED`; `NOT_INTERESTED` não é candidato considerado e não ganha outcome inventado.
- Origem é exibida a partir da proveniência capturada (`USER_SELECTED` ou `ROUTEBOOK_RECOMMENDED`); não conectar uma nova fonte de recomendação.
- Outcomes são aditivos no generationContext JSONB existente; sem migration e compatíveis com snapshots anteriores sem outcomes.
- Nenhum resultado da geração aplica mudanças ao Itinerary ou altera preferências.

## Fora de escopo

- Criar candidatos `ROUTEBOOK_RECOMMENDED`, ranking, Discovery ou IA.
- Acrescentar reason codes ou alterar conceitos/invariantes de domínio.
- Aplicar, aceitar, rejeitar ou editar a Proposal além do comportamento já existente.
- Nova tabela, coluna, migration, Provider ou alteração de política de privacidade.

## Caminhos permitidos

```text
modules/proposal-management/src/itinerary-proposal.ts
modules/proposal-management/src/itinerary-proposal.test.ts
modules/proposal-management/src/deterministic-itinerary-proposal-generator.ts
modules/proposal-management/src/deterministic-itinerary-proposal-generator.test.ts
modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts
modules/proposal-management/src/authoritative-itinerary-proposal-generation.test.ts
modules/proposal-management/src/index.ts
packages/database/src/proposal-repository.test.ts
apps/web/lib/itinerary-proposal-experience.ts
apps/web/lib/itinerary-proposal-experience.test.ts
apps/web/components/itinerary-proposal-review.tsx
apps/web/components/itinerary-proposal-review.test.tsx
apps/web/components/itinerary-proposal-review.module.css
apps/web/e2e/itinerary-proposal-review.spec.ts
docs/implementation/increments/rb-inc-214-proposal-explainability.md
docs/implementation/context-packs/rb-inc-214-proposal-explainability.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Critérios de aceite

- [ ] O contrato valida outcomes, códigos canônicos, identidade única e correspondência com os candidatos capturados.
- [ ] A geração produz outcomes para todos os candidatos elegíveis: incluídos e excluídos por capacidade; `MAYBE` sem opt-in é distinguido.
- [ ] Outcomes sobrevivem à persistência/reidratação pelo JSONB existente; snapshots legados continuam válidos.
- [ ] A projeção exibe origem por atividade e exclusões com motivo legível, inclusive em Proposal expirada.
- [ ] Nenhuma recomendação automática, mudança canônica no Itinerary ou novo conceito de domínio é introduzido.
- [ ] Testes unitários, de persistência, interface e E2E cobrem os estados relevantes.

## Validação

```bash
pnpm --filter @routebook/proposal-management test
pnpm --filter @routebook/database test
pnpm --filter @routebook/web test -- itinerary-proposal-experience itinerary-proposal-review
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
```

CI integrado, E2E e Vercel Preview são evidências adicionais. O gate humano de merge permanece obrigatório.
