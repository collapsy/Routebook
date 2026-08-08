---
id: RB-CTX-103
title: Context Pack do RB-INC-103 — Núcleo de Edição de Proposed Activity
description: Contexto operacional para evoluir a edição de Itinerary Proposal preservando lifecycle, proveniência e separação do Itinerary confirmado.
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
  - proposal-editing
  - context-pack
related_documents:
  - RB-INC-103
  - RB-PRD-006
  - RB-UX-005
  - RB-INC-102
prerequisites:
  - RB-INC-102
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-103 — Núcleo de Edição de Proposed Activity

## Objetivo

Preservar as decisões e invariantes que devem orientar persistência, autorização e experiência futura de edição de Itinerary Proposal.

## Contexto de produto

`RB-FR-094` define edição da proposta como requisito crítico do MVP. `RB-INT-065` exige que uma Proposal disponível possa ser revisada, editada, aceita, aceita parcialmente, regenerada ou descartada. A edição deve continuar obedecendo `RB-BR-100`: o Roteiro atual não pode ser alterado sem confirmação.

## Fronteira do RB-INC-103

O incremento atual é exclusivamente domínio. Ele não persiste, não autoriza e não renderiza a edição. Sua responsabilidade é responder de forma determinística à pergunta: “dada uma Proposal pronta e uma Proposed Activity existente, qual é a nova Proposal após uma alteração válida de planejamento?”.

## Invariantes

1. somente status `ready` é editável;
2. a operação nunca recebe nem altera o Itinerary confirmado;
3. `proposedActivityId` identifica a atividade alvo e não pode mudar;
4. `sourceActivityId`, `placeId`, `operationType` e `reason` preservam proveniência e não são campos de edição;
5. `undefined` preserva campo opcional e `null` remove campo opcional editável;
6. campos de horário, duração, ordem, custo e moeda mantêm as mesmas restrições estruturais usadas pelas Proposed Activities geradas;
7. `updatedAt` é monotônico;
8. a Proposal e coleções retornadas são imutáveis;
9. atividade inexistente e estado não editável possuem códigos de erro estáveis;
10. uma futura camada de persistência deve reler e revalidar o estado atual antes de salvar a edição.

## API introduzida

- `editItineraryProposalProposedActivity`;
- `EditableItineraryProposalProposedActivityChanges`;
- `EditItineraryProposalProposedActivityInput`;
- `ItineraryProposalProposedActivityEditError`;
- `ItineraryProposalProposedActivityEditErrorCode`.

## Campos editáveis

- Dia alvo;
- título;
- descrição;
- horário proposto;
- duração;
- ordem;
- flexibilidade;
- custo estimado;
- moeda do custo estimado.

## Campos preservados

- identidade da Proposed Activity;
- identidade da Activity fonte, quando existente;
- Place de origem, quando existente;
- tipo da operação (`add`, `move`, `update`, `remove`);
- justificativa/origem (`reason`).

## Tratamento de erro

### `proposal-not-ready`

Indica tentativa de editar Proposal fora do estado de revisão. Camadas superiores não devem contornar esse erro com update direto no banco.

### `proposed-activity-not-found`

Indica que o identificador solicitado não pertence à Proposal atual. Camadas superiores devem tratar como estado desatualizado ou entrada inválida, nunca criar implicitamente uma nova atividade.

### `ItineraryProposalValidationError`

Continua responsável por payload estrutural inválido, edição vazia e regressão temporal.

## Testes obrigatórios preservados

- edição integral de campos planejáveis;
- limpeza explícita dos opcionais;
- imutabilidade da Proposal original;
- preservação da atividade não alvo;
- preservação de identidade/proveniência;
- estado inválido;
- atividade inexistente;
- payloads inválidos;
- edição vazia;
- `editedAt` regressivo.

## Próxima lacuna

A próxima camada recomendada é um application service de edição persistida que carregue a Proposal, aplique a primitiva do RB-INC-103 e salve atomicamente no repository PostgreSQL. A autorização web deve continuar fora desse service até uma fronteira própria.
