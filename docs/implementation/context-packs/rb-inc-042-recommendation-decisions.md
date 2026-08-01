---
id: RB-CTX-042
title: Context Pack — Decisions e Ações sobre Recommendations
description: Contexto operacional obrigatório para implementar e revisar o RB-INC-042.
document_type: implementation-context-pack
owner: Decision Intelligence
status: Draft
version: "0.1.0"
created: "2026-07-30"
last_updated: "2026-07-30"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - decisions
  - recommendations
related_documents:
  - RB-INC-042
  - RB-INC-041
prerequisites:
  - RB-INC-041
next_documents: []
ai_context:
  priority: high
  index: true
---

# Context Pack — RB-INC-042

## Missão

Implementar decisões explícitas sobre Recommendations sem duplicação, inferência ou estado parcial.

## Fonte canônica

- issue #87;
- Draft PR #94;
- branch `feature/rb-inc-042-recommendation-decisions`;
- base `main` no merge commit consolidado `fb4b46e3881a8c1adb5f30c90a815593b47f0212`;
- incremento `RB-INC-042`.

## Contratos que devem ser reutilizados

- `Recommendation`, `acceptRecommendation` e `RecommendationRepository` em `@routebook/decision-intelligence`;
- unicidade `(TripId, PlaceId)` em `@routebook/saved-places`;
- `Trip`, participante `owner`, `Itinerary`, `Day`, `Activity` e `addActivity` em `@routebook/trip-management`;
- `Place` publicado em `@routebook/place-catalog`;
- executor transacional do adapter Drizzle.

Não duplicar regras desses módulos.

## Decisões arquiteturais

1. `Decision` pertence a Decision Intelligence e é imutável.
2. `DecisionRepository` é porta de domínio; Drizzle é apenas adapter.
3. A coordenação entre Recommendation, Decision e efeito canônico ocorre em uma transação de aplicação fornecida pelo adapter de banco.
4. A idempotência é dupla: chave da Decision por Trip e unicidade do efeito canônico.
5. A aceitação é a última mutação antes do commit.
6. O participante owner é resolvido da Trip persistida; não existe usuário autenticado fictício.

## Comandos

### Save Recommended Place

Entrada mínima: `tripId`, `recommendationId`, `placeId`, `idempotencyKey`, `decidedAt`.

Saída: Decision, Saved Place canônico e Recommendation aceita. Lugar já salvo continua sendo sucesso idempotente.

### Add Recommended Place to Itinerary

Entrada mínima: `tripId`, `recommendationId`, `placeId`, `dayId`, `idempotencyKey`, `decidedAt`; `startTime` e `durationMinutes` opcionais.

Saída: Decision, Activity canônica e Recommendation aceita.

## Erros esperados

- Trip, Place, Recommendation, Day ou owner ausente;
- vínculo cross-trip/cross-destination;
- Recommendation não apresentada, expirada ou terminal;
- idempotency key vazia;
- mesma chave com payload diferente;
- Free Period protegido;
- violação das invariantes de Activity;
- falha transacional.

Erros não podem deixar estado parcial.

## Sequência transacional

1. carregar Recommendation;
2. validar estado e validade;
3. carregar Trip, owner e Place;
4. validar relações de ownership;
5. procurar Decision pela chave;
6. retornar resultado anterior ou rejeitar conflito;
7. executar efeito canônico;
8. criar/persistir Decision e relação causal;
9. aceitar/persistir Recommendation;
10. commit.

## Restrições de implementação

- sem dependência de Next.js/React/Drizzle no domínio;
- sem inferir dia, horário, duração ou transporte;
- sem salvar Activity na ação Salvar Lugar;
- sem remover Saved Place ao adicionar ao Roteiro;
- sem `skip` para mascarar testes;
- sem writes fora dos caminhos permitidos sem justificativa explícita.

## Evidências obrigatórias

- testes de domínio de Decision e transições;
- testes do adapter com rollback e reenvio;
- constraints/migrations validadas;
- lint, typecheck, unit, persistence, smoke e build;
- Playwright desktop e mobile;
- SHAs e links dos workflows registrados na PR #94.

## Limitação conhecida

O ator local é o participante owner persistido na Trip. Isso não substitui autenticação/autorização real e deve permanecer explícito na interface e documentação técnica.
