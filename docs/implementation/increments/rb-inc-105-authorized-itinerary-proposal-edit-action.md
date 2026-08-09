---
id: RB-INC-105
title: Server Action Autorizada para Edição de Itinerary Proposal
description: Expõe a edição persistida de Proposed Activity por uma Server Action autorizada, segura e testável.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-08"
last_updated: "2026-08-09"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - proposal-editing
  - server-action
  - authorization
related_documents:
  - RB-PRD-006
  - RB-UX-005
  - RB-INC-103
  - RB-INC-104
prerequisites:
  - RB-INC-104
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-105 — Server Action Autorizada para Edição de Itinerary Proposal

## 1. Objetivo

Expor a edição persistida de uma `ProposedActivity` por uma fronteira web server-side autorizada, reutilizando o núcleo de domínio do RB-INC-103 e o application service persistido do RB-INC-104 sem duplicar invariantes ou escrever diretamente no banco.

Issue: #239.

Branch: `feature/rb-inc-105-authorized-itinerary-proposal-edit-action`.

PR: #240.

## 2. Escopo

- executor testável em `apps/web/lib/itinerary-proposal-editing.ts`;
- contrato de estado `idle | error | success` para a camada web;
- validação de `tripId`, `itineraryProposalId` e `proposedActivityId`;
- normalização de mudanças parciais de Proposed Activity;
- diferenciação entre campo omitido e limpeza explícita de campo opcional;
- autorização com `resolveTripRouteAccess({ action: "trip:edit" })` antes da persistência;
- criação do `ItineraryProposalId` canônico antes da chamada ao application service;
- uso exclusivo de `editAndPersistItineraryProposalProposedActivity`;
- repository concreto `DrizzleItineraryProposalRepository` somente na Server Action fina;
- tradução de erros conhecidos para códigos estáveis;
- normalização de falhas técnicas inesperadas;
- revalidação da rota de Proposal somente após sucesso;
- testes do executor e da Server Action;
- governança e CI.

## 3. Fora de escopo

- formulário ou componente visual de edição;
- alteração direta do Itinerary confirmado;
- aceite parcial;
- regeneração de Proposal;
- nova migration ou mudança de schema;
- escrita direta em tabelas pela camada web.

## 4. Contrato de autorização

A fronteira web usa `trip:edit`. A autorização deve ocorrer antes de qualquer chamada ao application service ou repository. Resultado sem sessão produz `unauthenticated`; Trip inacessível produz `not-found`. Nenhum desses estados pode gerar persistência.

## 5. Parsing e normalização

O executor recebe strings próprias de uma fronteira HTML e converte somente os campos explicitamente presentes. Campos omitidos permanecem ausentes do objeto `changes`; campos opcionais enviados vazios são convertidos para `null`, permitindo limpeza explícita no domínio.

São validados antes da autorização:

- UUIDs de Trip, Proposal e Proposed Activity;
- `targetTripDayId` quando fornecido;
- título não vazio;
- horário local `HH:mm` ou `HH:mm:ss`;
- duração inteira positiva;
- ordem inteira não negativa;
- custo numérico não negativo;
- moeda ISO-like com três letras.

Payload sem nenhuma mudança válida retorna `invalid-request` sem chamar acesso ou persistência.

## 6. Erros estáveis

A action expõe:

- `unauthenticated`;
- `not-found`;
- `invalid-request`;
- `proposal-not-found`;
- `proposal-not-ready`;
- `proposed-activity-not-found`;
- `technical-error`.

`ItineraryProposalApplicationError`, `ItineraryProposalProposedActivityEditError` e `ItineraryProposalValidationError` são traduzidos sem vazar detalhes internos. Erros inesperados retornam `technical-error`.

## 7. Critérios de aceite

- [x] input inválido é rejeitado antes da autorização;
- [x] autorização `trip:edit` ocorre antes do application service;
- [x] acesso não autenticado ou não autorizado não persiste;
- [x] Proposed Activity válida é editada pelo service canônico;
- [x] IDs são convertidos para contratos canônicos antes do domínio;
- [x] propriedades opcionais respeitam `exactOptionalPropertyTypes`;
- [x] omissão e limpeza explícita são semanticamente distintas;
- [x] erros conhecidos são traduzidos para códigos estáveis;
- [x] falhas técnicas são normalizadas;
- [x] a Server Action usa `DrizzleItineraryProposalRepository` sem escrita direta;
- [x] caches da Proposal são revalidados somente após sucesso;
- [x] testes do executor e da Server Action foram adicionados;
- [x] Engineering Validation técnico aprovado antes da promoção documental;
- [ ] registry, Context Pack e matriz de rastreabilidade sincronizados;
- [ ] Documentation Validation e Engineering Validation aprovados no mesmo HEAD final.

## 8. Evidências técnicas

- executor: `apps/web/lib/itinerary-proposal-editing.ts`;
- testes do executor: `apps/web/lib/itinerary-proposal-editing.test.ts`;
- Server Action: `apps/web/app/viagens/[tripId]/roteiro/proposta/edit-action.ts`;
- testes da Server Action: `apps/web/app/viagens/[tripId]/roteiro/proposta/edit-action.test.ts`;
- SHA técnico validado: `fdba3b2c2c2e88987936d04c673748f764b49f35`;
- Engineering Validation #1306 / run `31257205455`: success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo.

## 9. Próximo recorte esperado

O próximo incremento deve materializar a experiência visual de edição da Proposed Activity na tela de revisão da Proposal, consumindo esta Server Action e preservando a separação entre proposta revisável e Itinerary confirmado.
