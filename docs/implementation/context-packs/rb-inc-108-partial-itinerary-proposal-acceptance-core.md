---
id: RB-CTX-108
title: Context Pack do RB-INC-108 — Núcleo de Aceite Parcial de Itinerary Proposal
description: Contexto operacional para seleção parcial canônica, fingerprint idempotente e preservação dos itens não aplicados.
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
  - partial-acceptance
  - idempotency
  - context-pack
related_documents:
  - RB-INC-108
  - RB-PRD-006
  - RB-UX-005
prerequisites:
  - RB-INC-107
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-108 — Núcleo de Aceite Parcial de Itinerary Proposal

## Objetivo

Preservar as decisões de domínio que devem orientar a futura transação, persistência e experiência de aceite parcial.

## Comando canônico

O aceite parcial é um comando distinto do aceite integral. Seu tipo de aplicação é a constante `partialItineraryProposalAcceptanceApplicationType`, cujo valor canônico é `partial`.

## Invariantes de seleção

1. somente Proposal `ready` e não expirada aceita seleção;
2. a seleção deve conter ao menos uma Proposed Activity;
3. IDs duplicados são inválidos;
4. IDs desconhecidos são inválidos;
5. selecionar todos os itens deve ser tratado pelo aceite integral, portanto é inválido no comando parcial;
6. a ordem recebida do caller não é autoritativa;
7. `selected` e `remaining` seguem a ordem persistida na Proposal;
8. a partição não pode perder ou duplicar itens.

## Idempotência

O fingerprint parcial deve depender exatamente da seleção, mas não da ordem incidental do payload. Antes do fingerprint:

- `ApplyProposalItem`s são normalizados pelo contrato de Trip Management;
- itens selecionados são reordenados pela Proposal;
- `proposedActivityIds` usam essa mesma ordem canônica.

A mesma seleção enviada em ordens diferentes precisa produzir o mesmo fingerprint.

## Itens restantes

O comando carrega `remainingProposedActivityIds`. A futura transação deve usar essa informação para atualizar a Proposal de forma coerente com o que realmente foi aplicado, nunca recalculando a partir de um payload web não confiável.

## Transição de domínio

`partiallyAcceptItineraryProposal` produz uma nova Proposal:

- status `partially-accepted`;
- `acceptedAt` e `updatedAt` iguais ao instante da decisão, com cópias defensivas;
- `proposedActivities` contendo somente itens não aplicados;
- metadata de geração/proveniência preservada.

A função não altera o Itinerary e não persiste nada.

## Relação com RB-BR-PRP-007

A transação futura precisa complementar este núcleo garantindo atomicamente:

1. aplicar somente itens selecionados;
2. validar dependências entre itens antes do commit;
3. manter itens não aceitos na Proposal;
4. incrementar a versão do Itinerary exatamente uma vez por aplicação parcial.

## Relação com RB-BR-PRP-009

Idempotência parcial deve reutilizar o modelo de Proposal Application já existente. Repetição com mesma idempotency key e mesmo fingerprint deve virar replay; mesma key com fingerprint diferente deve ser conflito.

## Persistência ainda ausente

O schema PostgreSQL atual ainda não aceita `partially-accepted` na constraint de `itinerary_proposals`. O próximo incremento deverá evoluir essa persistência de forma mínima e explícita; este Context Pack não autoriza relaxar outros estados do lifecycle.

## Evidência técnica

O SHA `43ef85bc5f081622ab532648ab52a62620e0e196` passou no Engineering Validation #1342 / run `31329125333`, incluindo testes de seleção, fingerprint, temporalidade, imutabilidade e regressão geral.

## Próxima lacuna

Implementar `AcceptItineraryProposalPartially` como transação PostgreSQL idempotente, persistindo aplicação parcial, Decision, Proposal restante e a única nova versão do Itinerary.
