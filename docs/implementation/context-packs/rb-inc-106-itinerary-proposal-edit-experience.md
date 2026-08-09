---
id: RB-CTX-106
title: Context Pack do RB-INC-106 — Experiência de Edição de Itinerary Proposal
description: Contexto operacional para a edição visual de Proposed Activity sem alterar diretamente o Itinerary confirmado.
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
  - experience
  - context-pack
related_documents:
  - RB-INC-106
  - RB-INC-105
  - RB-INC-104
  - RB-UX-005
prerequisites:
  - RB-INC-105
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-106 — Experiência de Edição de Itinerary Proposal

## Objetivo

Preservar as decisões da experiência visual que consome a fronteira autorizada de edição do RB-INC-105.

## Fronteira atual

A edição é uma operação sobre a Proposal revisável. Ela não é uma edição direta do Itinerary e não substitui a decisão de aceite.

## Condições de edição

Um editor só pode ser apresentado quando todas as condições são verdadeiras:

1. a Proposal está `ready`;
2. o usuário possui `trip:edit`;
3. a Proposal foi baseada na versão atual do Itinerary.

Proposal `expired` ou stale permanece referência somente leitura.

## Independência de permissões

`trip:edit` e `trip:accept-proposal` não devem ser colapsadas. Um participante pode possuir capacidade de edição sem capacidade de decisão, ou capacidade de decisão sem capacidade de edição, de acordo com o modelo de autorização.

## Dados do review model

A UI não deve tentar reconstruir valores de formulário a partir de strings de apresentação. O model fornece:

- `operationType`;
- `editValues.targetTripDayId` quando existente;
- título;
- descrição;
- horário bruto normalizado para `HH:mm`;
- duração em minutos como valor de formulário;
- flexibilidade;
- custo estimado como valor bruto;
- moeda;
- `dayOptions` ordenadas deterministicamente pelo Itinerary.

## Semântica orientada à operação

### Add

Pode editar Dia e conteúdo revisável.

### Move

Pode editar Dia. Não expor `proposedOrder` zero-based como input técnico.

### Update

Pode editar conteúdo revisável, sem trocar identidade/origem.

### Remove

Não possui editor visual neste incremento.

## Campos imutáveis na experiência

Nunca apresentar como inputs editáveis:

- `proposedActivityId`;
- `operationType`;
- `sourceActivityId`;
- `placeId`;
- `reason`.

Os IDs necessários à Server Action podem existir como inputs hidden, mas não como valores controláveis pelo usuário.

## Feedback

### Pending

- desabilitar envio;
- rótulo `Salvando edição…`;
- anúncio contextual.

### Erro

- manter formulário/contexto;
- anunciar a mensagem recuperável com `role="alert"`;
- não navegar nem aplicar o Itinerary.

### Sucesso

- anunciar que a edição foi salva na Proposal;
- declarar explicitamente que o Itinerary confirmado ainda não foi alterado;
- executar `router.refresh()` para reidratar os valores persistidos.

## Acessibilidade

Como podem existir vários editores na mesma página, o disclosure precisa identificar a atividade, por exemplo `Editar sugestão: Mirante ao pôr do sol`.

## Responsividade

O editor permanece inline no card da Proposed Activity. Fields usam grid fluido em desktop e uma coluna em mobile. Ações passam a ocupar a largura disponível em telas pequenas.

## Evidência técnica

O SHA `ffc6fc4e214c76c0241303ab7a80c51376fbfc48` passou no Engineering Validation #1319 / run `31326575512`, incluindo format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo.

## Próxima lacuna

A próxima prova necessária é E2E de navegador real para a edição: abrir Proposal autenticada, editar um campo, persistir pelo PostgreSQL, reidratar a página e confirmar que o Itinerary permaneceu inalterado em desktop e mobile.
