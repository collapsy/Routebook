---
id: RB-CTX-107
title: Context Pack do RB-INC-107 — E2E da Edição de Itinerary Proposal
description: Contexto operacional da prova E2E que valida edição autorizada de Proposal, persistência PostgreSQL e preservação do Itinerary.
document_type: implementation-context
owner: Engineering
status: Draft
version: "0.1.0"
created: "2026-08-09"
last_updated: "2026-08-09"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - proposal-editing
  - e2e
  - playwright
  - context-pack
related_documents:
  - RB-INC-107
  - RB-INC-106
  - RB-INC-105
  - RB-INC-104
prerequisites:
  - RB-INC-106
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-107 — E2E da Edição de Itinerary Proposal

## Objetivo

Preservar a estratégia de prova integral da edição de Proposed Activity e os invariantes que futuros testes E2E dessa cadeia devem manter.

## Fronteira comprovada

O RB-INC-107 atravessa, sem mocks de negócio:

1. navegador Playwright autenticado;
2. página de revisão da Proposal;
3. editor do RB-INC-106;
4. Server Action autorizada do RB-INC-105;
5. application service do RB-INC-104;
6. `DrizzleItineraryProposalRepository`;
7. PostgreSQL;
8. reidratação server-side da Proposal;
9. nova renderização no navegador.

## Invariantes E2E

1. editar Proposal não é editar Itinerary;
2. sucesso deve alterar a Proposed Activity persistida e avançar `updatedAt`;
3. reload deve preservar os valores editados;
4. Itinerary deve manter id, versão e Activities;
5. operação, razão e identidade da Proposed Activity não podem ser alteradas pela UI;
6. a query SQL de evidência deve confirmar os mesmos valores observados pelo repository;
7. horário pode ser reidratado pelo PostgreSQL como `HH:mm:ss`;
8. valor monetário pode retornar em precisão de coluna, sem mudança semântica;
9. o teste deve funcionar nos projetos responsivos canônicos, sem lógica específica para desktop ou mobile.

## Fixture

A fixture deve criar dados novos por execução para evitar dependência entre projetos Playwright. Ela usa `createAuthenticatedE2ETrip`, salva um Itinerary confirmado e persiste o lifecycle completo da Proposal `requested → generating → ready`.

## Cenário concorrente

Para provar stale state real, a Proposal é carregada como `ready` pelo navegador e depois transicionada para `rejected` no PostgreSQL antes do submit.

A edição subsequente precisa:

- falhar como `proposal-not-ready`;
- manter o formulário em contexto;
- não restaurar a Proposal para `ready`;
- não persistir os valores locais digitados;
- não alterar o Itinerary.

Essa prova deve permanecer server-authoritative: a UI não é fonte de verdade para o status da Proposal.

## Locators

O Next.js cria `#__next-route-announcer__` com `role="alert"`. Assertions de erro do editor devem selecionar o alerta do formulário de forma precisa, por exemplo `p[role="alert"]`, para evitar conflito de strict mode com o announcer de rota.

## Evidência técnica

O SHA `35b4b75859ffa6e4decd7b498189da84ff3a6a76` passou no Engineering Validation #1329 / run `31327843734`, incluindo os novos cenários no Playwright responsivo.

## Próxima lacuna

Com geração, edição e aceite integralmente cobertos, a próxima implementação deve ser escolhida a partir dos requisitos funcionais/UX ainda não materializados da Itinerary Proposal, priorizando requisito MVP canônico e evitando sobreposição com capacidades já provadas.
