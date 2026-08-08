---
id: RB-INC-103
title: Núcleo de Edição de Proposed Activity em Itinerary Proposal
description: Introduz a primitiva de domínio para editar campos planejáveis de uma Proposed Activity em Proposal pronta sem alterar o Itinerary confirmado.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-08"
last_updated: "2026-08-08"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - proposal-editing
  - domain
related_documents:
  - RB-PRD-006
  - RB-UX-005
  - RB-INC-053
  - RB-INC-102
prerequisites:
  - RB-INC-053
  - RB-INC-102
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-103 — Núcleo de Edição de Proposed Activity em Itinerary Proposal

## 1. Objetivo

Criar a primitiva de domínio que permite editar campos planejáveis de uma `ProposedActivity` pertencente a uma `ItineraryProposal` pronta, estabelecendo a base canônica para o requisito crítico de edição de proposta (`RB-FR-094`) e para a ação `editar` prevista em `RB-INT-065`.

Issue: #235.

Branch: `feature/rb-inc-103-edit-itinerary-proposal-activity`.

PR: #236.

## 2. Lacuna canônica

A cadeia concluída até o RB-INC-102 permite gerar, revisar, aceitar e descartar uma Itinerary Proposal, mas a Proposal pronta ainda era imutável para o viajante. O produto exige edição antes da aplicação, preservando o princípio de que o Itinerary confirmado não muda sem aceite explícito.

O recorte atual resolve somente o núcleo de domínio. Persistência e experiência web permanecem separados para evitar acoplamento da regra de edição à infraestrutura ou à UI.

## 3. Escopo

- editar somente Proposal em status `ready`;
- localizar a atividade por `proposedActivityId`;
- permitir alteração de:
  - `targetTripDayId`;
  - `title`;
  - `description`;
  - `proposedStartTime`;
  - `durationMinutes`;
  - `proposedOrder`;
  - `flexibility`;
  - `estimatedCostAmount`;
  - `estimatedCostCurrency`;
- permitir limpeza explícita com `null` dos campos opcionais editáveis;
- preservar identidade e proveniência:
  - `proposedActivityId`;
  - `sourceActivityId`;
  - `placeId`;
  - `operationType`;
  - `reason`;
- validar horário local, duração, ordem, custo e moeda;
- impedir regressão de `updatedAt`;
- retornar novo objeto imutável sem mutar a Proposal original;
- erros estáveis para Proposal não editável e atividade inexistente;
- testes unitários e exports públicos do módulo.

## 4. Fora de escopo

- persistência da edição no PostgreSQL;
- Server Action;
- formulário ou experiência web;
- aceite parcial;
- regeneração de Proposal;
- alteração direta do Itinerary;
- migration ou alteração de schema.

## 5. Decisões de domínio

### 5.1 Proposal pronta é a única superfície editável

A edição é rejeitada para qualquer status diferente de `ready`. Isso impede alterações concorrentes com geração, após aceite, rejeição, expiração ou encerramento do lifecycle.

### 5.2 Identidade e proveniência não são editáveis

A edição altera somente intenção de planejamento. A origem da sugestão continua rastreável e não pode ser reescrita pelo comando de edição.

### 5.3 Limpeza de opcionais é explícita

`undefined` significa preservar o valor atual; `null` significa remover o valor opcional. Isso evita que payloads parciais apaguem dados silenciosamente.

### 5.4 O Itinerary permanece fora da operação

A função recebe e retorna exclusivamente `ItineraryProposal`. Nenhum repository ou entidade de Itinerary participa da transição.

## 6. Critérios de aceite

- [x] edição válida produz nova Proposal `ready`;
- [x] somente a Proposed Activity alvo é substituída;
- [x] identidade e proveniência são preservadas;
- [x] a Proposal original permanece inalterada;
- [x] campos opcionais editáveis podem ser removidos explicitamente;
- [x] estado diferente de `ready` produz erro estável;
- [x] atividade inexistente produz erro estável;
- [x] horário, duração, ordem, custo e moeda inválidos são rejeitados;
- [x] edição sem mudanças é rejeitada;
- [x] `updatedAt` não pode retroceder;
- [x] API pública exportada por `@routebook/proposal-management`;
- [x] format, lint, typecheck, migrations e testes de domínio validados no ciclo de implementação;
- [x] Documentation Validation e Engineering Validation aprovados no mesmo SHA de promoção pré-final;
- [x] registry, Context Pack e matriz de rastreabilidade sincronizados.

## 7. Evidências

- núcleo: `modules/proposal-management/src/edit-itinerary-proposal.ts`;
- testes: `modules/proposal-management/src/edit-itinerary-proposal.test.ts`;
- exports: `modules/proposal-management/src/index.ts`;
- requisito de produto: `RB-FR-094` em `docs/product/functional-requirements.md`;
- interação: `RB-INT-065` em `docs/ux/interaction-specifications.md`;
- SHA de promoção validado: `2644441b9558fbda74f2cc8257e943dcadccab8f`;
- Documentation Validation #912 / run `31254831772`: success;
- Engineering Validation #1279 / run `31254831771`: success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo;
- issue: #235;
- Draft PR: #236.

O commit documental final deve repetir os dois gates canônicos antes do merge, sem novas alterações posteriores.

## 8. Próximo recorte esperado

O próximo incremento deve materializar a persistência transacional da edição no repository de Itinerary Proposal, com concorrência e estado atual revalidados antes de uma futura fronteira web autorizada.
