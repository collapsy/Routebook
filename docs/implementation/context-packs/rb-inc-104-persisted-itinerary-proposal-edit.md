---
id: RB-CTX-104
title: Context Pack do RB-INC-104 — Edição Persistida de Itinerary Proposal
description: Contexto operacional para persistir edições de Proposed Activity preservando lifecycle, estado atual e separação do Itinerary confirmado.
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
  - postgresql
  - context-pack
related_documents:
  - RB-INC-104
  - RB-INC-103
  - RB-PRD-006
  - RB-UX-005
prerequisites:
  - RB-INC-103
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-104 — Edição Persistida de Itinerary Proposal

## Objetivo

Preservar as decisões de implementação que devem orientar a futura fronteira web de edição de Itinerary Proposal após a introdução da persistência canônica.

## Fronteira atual

O RB-INC-104 é um application service persistido. Ele recebe identificadores e mudanças, recarrega a Proposal pelo repository, aplica a primitiva pura do RB-INC-103 e persiste o resultado validado. Não existe autorização, parsing de formulário ou UI neste recorte.

## Invariantes

1. a Proposal deve ser carregada por `tripId` e `itineraryProposalId` antes de qualquer edição;
2. somente Proposal `ready` pode ser editada, conforme RB-INC-103;
3. o service nunca deve aceitar uma Proposal arbitrária fornecida pela camada web como fonte de verdade;
4. `repository.save` somente ocorre após a validação de domínio;
5. falha de load ou edição não pode produzir escrita parcial;
6. comandos consecutivos devem partir do estado persistido mais recente;
7. o Itinerary confirmado não participa da operação e permanece imutável;
8. Proposal `ready` pode ter `updatedAt` posterior a `generatedAt` devido à revisão do viajante;
9. demais estados do lifecycle não tiveram suas constraints temporais relaxadas;
10. reidratação de Proposal `ready` deve preservar o `updatedAt` persistido;
11. normalização de `TIME` pelo PostgreSQL não altera a semântica do horário proposto;
12. uma futura Server Action deve reutilizar este service, nunca escrever diretamente no repository ou no banco.

## API introduzida

- `editAndPersistItineraryProposalProposedActivity`;
- `EditAndPersistItineraryProposalProposedActivityCommand`.

## Erros relevantes

### `proposal-not-found`

Continua sendo produzido por `ItineraryProposalApplicationError` quando a Proposal não existe para a Trip fornecida. A futura fronteira web deve traduzi-lo para um estado recuperável ou navegação segura, sem criar Proposal implicitamente.

### Erros do RB-INC-103

`proposal-not-ready`, `proposed-activity-not-found` e `ItineraryProposalValidationError` atravessam o service sem serem mascarados. Isso preserva a semântica do domínio e permite tradução consistente pela camada de aplicação web.

## Evolução de persistência

### Migration 0023

A constraint `itinerary_proposals_lifecycle_check` foi alterada apenas no ramo `ready`:

- antes: `updated_at = generated_at`;
- agora: `updated_at >= generated_at`.

Essa mudança é necessária porque uma Proposal pronta pode ser revisada antes de aceite ou descarte. Não implica que estados terminais sejam reabertos.

### Reidratação

A transição `completeItineraryProposalGeneration` continua sendo usada para reconstruir os dados de geração. Depois disso, quando o estado persistido é `ready`, o repository restaura explicitamente `row.updatedAt`, desde que ele não seja anterior a `generatedAt`.

## Estratégia de teste

### Application service controlado

Valida load → edit → save, ausência sem save, estados/payloads inválidos sem save e uso do estado mais recente em comandos consecutivos.

### PostgreSQL real

Valida migration, persistência, substituição das Proposed Activities, reidratação do `updatedAt`, normalização do horário e preservação do Itinerary confirmado.

## Próxima lacuna

A próxima fronteira recomendada é uma Server Action autorizada para edição de Proposed Activity. Ela deve resolver acesso com `trip:edit`, interpretar payload web, chamar `editAndPersistItineraryProposalProposedActivity`, revalidar a experiência de Proposal e traduzir erros sem duplicar as invariantes de domínio.
