---
id: RB-CTX-140
title: Context Pack do RB-INC-140 — Densidade Útil do Roteiro
description: Delimita contratos, invariantes, caminhos e gates para tornar Itinerary Proposal consciente de densidade e Free Periods.
document_type: implementation-context-pack
owner: Proposal Management and Data
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors: [RouteBook Team]
tags: [implementation, context-pack, itinerary, proposal-management, free-period, density, m8]
related_documents: [RB-INC-140, RB-CORE-0004, RB-PRD-002, RB-DOM-003, RB-INC-094, RB-INC-096, RB-INC-098, RB-INC-131, RB-INC-136]
prerequisites: [RB-INC-094, RB-INC-096, RB-INC-098, RB-INC-131]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-140 — Densidade Útil do Roteiro

## 1. Missão

Implementar o RB-INC-140 sem redefinir Itinerary, Free Period, Recommendation ou Itinerary Proposal. A mudança deve permanecer determinística, conservadora e explicável.

## 2. Estado inicial

- issue: #327;
- branch: `codex/rb-inc-140-itinerary-density`;
- base sincronizada: `3a7c6d1d31523f0882987ffa76935dfd7c582114`;
- RB-INC-139 / #326 já integrado;
- M8 / #319 permanece aberto para validação humana posterior.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/product/mvp-definition.md`;
5. `docs/domain/business-rules-and-invariants.md`;
6. `docs/implementation/increments/rb-inc-094-deterministic-itinerary-proposal-generator.md`;
7. `docs/implementation/increments/rb-inc-096-itinerary-proposal-generation-input-assembler.md`;
8. `docs/implementation/increments/rb-inc-131-proposal-place-deduplication.md`;
9. RB-INC-140 e este Context Pack.

## 4. Regras canônicas que prevalecem

- RB-BR-ITN-005 — Dia vazio é válido;
- RB-BR-ITN-017 — Free Period `protected` não é preenchido automaticamente;
- RB-BR-ITN-018 — Free Period `flexible` aceita sugestão;
- RB-BR-DAT-002 — desconhecido não recebe valor falso;
- Recommendation não altera estado canônico;
- Proposal permanece isolada até aceite;
- usuário pode manter períodos livres sem penalização;
- estimativa não é confirmação.

## 5. Política permitida

Quando o contexto de Free Periods é conhecido para todos os Dias:

- meta: até 3 Activities por Dia elegível;
- ocupação efetiva = Activities existentes + Proposed Activities distribuídas + Free Periods `protected`;
- Dia vazio com `protected > 0` e `flexible = 0` permanece sem Proposed Activity;
- `flexible` não torna o Dia inelegível;
- escolher o Dia de menor ocupação efetiva;
- desempatar pela ordem canônica já existente;
- parar quando não houver Dia abaixo da meta;
- não fabricar candidato quando o conjunto acabar.

Quando o contexto de Free Periods estiver ausente em chamada interna legada:

- não assumir que não existem períodos;
- preservar balanceamento legado por Activities;
- incluir Limitation explícita.

## 6. Restrições

- não criar `proposedStartTime`;
- não afirmar manhã/tarde/noite sem evidência temporal;
- não remover ou alterar Free Period;
- não aplicar Proposal automaticamente;
- não alterar Recommendations nem seu score;
- não criar Place ou Recommendation para atingir a meta;
- não adicionar Provider, SDK ou chamada externa;
- não criar migration;
- não alterar schema;
- não preencher evidência humana do M8.

## 7. Caminhos autorizados

```text
modules/proposal-management/src/deterministic-itinerary-proposal-generator.ts
modules/proposal-management/src/deterministic-itinerary-proposal-generator.test.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.test.ts
modules/proposal-management/src/itinerary-proposal-generation-service.test.ts
packages/database/src/authoritative-itinerary-proposal-generation-context.ts
packages/database/src/authoritative-itinerary-proposal-generation-context-postgres.test.ts
packages/database/src/authoritative-itinerary-proposal-generation-service-postgres.test.ts
apps/web/e2e/itinerary-proposal-generation.spec.ts
docs/implementation/increments/rb-inc-140-itinerary-density.md
docs/implementation/context-packs/rb-inc-140-itinerary-density.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Alterações esperadas por camada

### Proposal Management

- estender snapshot interno de Dia com contagens opcionais de Free Periods;
- assembler deriva contagens a partir do snapshot autoritativo;
- adapter aplica política v2 somente quando o contexto estiver completo;
- bump de generationVersion para `2`;
- regressão do serviço de lifecycle acompanha a versão do adapter real;
- critérios/justificativas/limitations tornam a política auditável.

### Data

- ler `itinerary_free_periods` na mesma transação read-only/repeatable-read já usada;
- mapear apenas identidade e modo necessários à geração;
- regressão do serviço autoritativo PostgreSQL acompanha a generationVersion v2;
- nenhuma persistência nova.

### Web / E2E

- comprovar generationVersion `2`;
- manter Itinerary inalterado antes de aceite;
- adicionar cenário com espaço protegido se necessário para provar a jornada integral.

## 9. Testes mínimos

- underfilled conhecido;
- protected intentionally empty;
- flexible suggestion;
- overplanning cap;
- insufficient candidates;
- unknown free-period fallback;
- assembler counts e invalid mode;
- lifecycle do serviço alinhado à generationVersion v2;
- PostgreSQL snapshot;
- serviço autoritativo PostgreSQL alinhado à generationVersion v2;
- E2E version/isolation;
- suíte integral do repositório.

## 10. Gates

```text
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test:release-migration-policy
pnpm db:migrate
pnpm test
pnpm build
pnpm test:e2e
```

A fonte de verdade de validação neste ambiente é GitHub Actions no SHA da PR.

## 11. Quando escalar

Escalar apenas se for necessário:

- redefinir o significado de Free Period;
- criar novo estado ou relação de Domain;
- tornar horários inventados parte da Proposal;
- alterar política canônica de Recommendation;
- executar mudança destrutiva ou em Production.

Falhas de format, docs, lint, typecheck, testes, build e E2E devem ser corrigidas autonomamente.
