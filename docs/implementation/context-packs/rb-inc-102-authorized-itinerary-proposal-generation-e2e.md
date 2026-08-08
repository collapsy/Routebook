---
id: RB-CTX-102
title: Context Pack do RB-INC-102 — Integração E2E da Geração Autorizada de Itinerary Proposal
description: Contexto operacional para validar a geração autorizada da UI ao PostgreSQL sem alterar as fronteiras canônicas.
document_type: implementation-context
owner: Engineering
status: Draft
version: "0.1.0"
created: "2026-08-08"
last_updated: "2026-08-08"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - generation
  - e2e
  - quality
related_documents:
  - RB-INC-102
  - RB-INC-093
  - RB-INC-099
  - RB-INC-100
  - RB-INC-101
prerequisites:
  - RB-INC-099
  - RB-INC-100
  - RB-INC-101
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-102 — Integração E2E da Geração Autorizada de Itinerary Proposal

## Objetivo

Preservar as fronteiras e invariantes da geração autoritativa enquanto o fluxo completo é validado pela interface real e pelo PostgreSQL real da suíte E2E.

## Fronteiras canônicas

- a UI dispara somente `generateItineraryProposalAction`;
- `resolveTripRouteAccess` continua sendo a autoridade server-side de `trip:edit`;
- a composition root do RB-INC-099 continua responsável por contexto, generator e persistência;
- o teste pode criar fixtures diretamente no banco, mas não pode executar o caso de uso de geração diretamente;
- a confirmação de persistência deve usar repositories e dados reais, não mocks ou snapshots artificiais;
- geração e aceite permanecem decisões independentes.

## Invariantes

1. nenhuma Proposal é gerada apenas por visitar a página;
2. o usuário autenticado precisa acionar explicitamente a geração;
3. uma Recommendation elegível deve chegar à Proposed Activity por meio da cadeia produtiva real;
4. a geração não altera o Itinerary confirmado;
5. reload deve reidratar a mesma Proposal persistida;
6. ausência de candidatos continua sendo um resultado válido do generator determinístico, não um erro inventado pela experiência;
7. o teste deve rodar sob os mesmos projetos desktop e mobile usados pelo gate canônico.

## Estratégia de teste

O arquivo `apps/web/e2e/itinerary-proposal-generation.spec.ts` cria uma Trip autenticada, persiste o Itinerary e, no cenário positivo, persiste Place e Recommendation elegível. A geração é iniciada pelo botão da página de Proposal, o redirecionamento fornece o identificador persistido e o repository confirma `ready`, conteúdo gerado e preservação do Itinerary.

Um segundo cenário mantém o contexto sem Recommendation elegível e comprova o contrato determinístico de Proposal `ready` com zero mudanças e limitação explícita, também sem mutar o Itinerary.

## Evidências esperadas

- issue #231;
- PR #234;
- `apps/web/e2e/itinerary-proposal-generation.spec.ts`;
- Documentation Validation e Engineering Validation verdes no mesmo HEAD final;
- execução Playwright responsiva incluída no Engineering Validation.

## Próxima lacuna

Após este incremento, a cadeia de geração estará coberta da fonte autoritativa até a revisão web. Qualquer próximo incremento deve ser derivado de lacuna observável de produto ou operação, sem reabrir contratos já validados de generation lifecycle.
