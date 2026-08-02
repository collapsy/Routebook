---
id: RB-CTX-081
title: Context Pack do RB-INC-081
description: Contexto mínimo para ampliar Decision Intelligence com o aceite integral de Itinerary Proposal.
document_type: implementation-context-pack
owner: Decision Intelligence
status: Draft
version: "0.1.0"
created: "2026-08-02"
last_updated: "2026-08-02"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - decision-intelligence
  - proposal-management
  - itinerary-planning
related_documents:
  - RB-INC-081
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-003
  - RB-DOM-004
  - RB-ADR-027
  - RB-INC-072
  - RB-INC-079
  - RB-INC-080
prerequisites:
  - RB-DOM-001
  - RB-ADR-027
  - RB-INC-072
  - RB-INC-079
  - RB-INC-080
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-081

## 1. Missão

Adicionar ao aggregate Decision a representação canônica do aceite integral de Itinerary Proposal, sem introduzir persistência física ou coordenação transacional neste incremento.

## 2. Incremento

- ID: `RB-INC-081`;
- issue: `#185`;
- PR: `#186`;
- branch: `feature/rb-inc-081-itinerary-proposal-acceptance-decision`;
- arquivo: `docs/implementation/increments/rb-inc-081-itinerary-proposal-acceptance-decision.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. RB-DOM-001, RB-DOM-003 e RB-DOM-004;
4. RB-ADR-027;
5. RB-INC-072, RB-INC-079 e RB-INC-080;
6. `modules/decision-intelligence/src/decision.ts`;
7. `modules/decision-intelligence/src/decision.test.ts`;
8. `modules/proposal-management/src/accept-itinerary-proposal.ts`;
9. `modules/trip-management/src/proposal-application.ts`.

## 4. Contrato operacional

```text
createDecision(input)
├── normalize chosenOption
├── normalize contextSnapshot
├── validate Proposal identity
├── validate Trip identity
├── normalize effect
├── validate Itinerary identity
├── validate resultingVersion = baseVersion + 1
├── validate ordered applied IDs = chosen IDs
└── freeze Decision
```

## 5. Invariantes

- Decision registra escolha explícita e não uma recomendação automática;
- Recommendation é opcional;
- option e snapshot referenciam a mesma Proposal;
- snapshot e effect referenciam o mesmo Itinerary;
- fingerprint representa a solicitação aceita;
- versão-base é anterior ao efeito;
- versão resultante cresce uma única vez;
- IDs escolhidos e aplicados são únicos e ordenados;
- nenhum campo persistente ou schema é alterado;
- tipos anteriores continuam válidos.

## 6. Restrições

- não alterar `decision-schema.ts`;
- não criar migration;
- não adaptar repository ou serializer;
- não implementar Decision fragment;
- não importar Proposal Management ou Itinerary Planning no domínio de Decision Intelligence;
- não compor o aceite integral;
- não criar Server Action, autorização ou UI.

## 7. Decisões locais

- IDs de entidades externas permanecem strings no bounded context;
- snapshot usa `baseItineraryVersion` para distinguir causa e efeito;
- effect usa `resultingItineraryVersion` e `proposalApplicationId` como referência de execução;
- fingerprint é validado como SHA-256 hexadecimal;
- arrays são normalizados, deduplicados por validação e congelados;
- igualdade de IDs é posicional, não apenas por conjunto.

## 8. Testes obrigatórios

- fato válido e imutável;
- fingerprint em caixa alta normalizado;
- ausência de Recommendation;
- Proposal divergente;
- Itinerary divergente;
- versão diferente de `base + 1`;
- IDs aplicados reordenados;
- IDs escolhidos duplicados;
- fingerprint inválido;
- effect de outro tipo;
- suíte histórica de Decision.

## 9. Comandos

```bash
pnpm exec prettier --check modules/decision-intelligence/src/decision.ts modules/decision-intelligence/src/itinerary-proposal-decision.test.ts modules/decision-intelligence/src/index.ts docs/implementation/increments/rb-inc-081-itinerary-proposal-acceptance-decision.md docs/implementation/context-packs/rb-inc-081-itinerary-proposal-acceptance-decision.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/decision-intelligence lint
pnpm --filter @routebook/decision-intelligence typecheck
pnpm --filter @routebook/decision-intelligence test
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

## 10. Quando interromper e escalar

- o domínio oficial proibir referência à Proposal Application no efeito;
- a versão resultante puder crescer mais de uma vez no aceite integral;
- a Decision precisar aceitar actor não participante;
- o fingerprint canônico deixar de ser SHA-256;
- a persistência física exigir alteração incompatível do contrato.
