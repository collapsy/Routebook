---
id: RB-CTX-091
title: Context Pack do RB-INC-091
description: Contexto operacional para a Server Action autorizada de aceite de Itinerary Proposal.
document_type: implementation-context-pack
owner: Identity and Access
status: Draft
version: "0.1.0"
created: "2026-08-03"
last_updated: "2026-08-03"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - itinerary-proposal
  - authorization
  - server-action
related_documents:
  - RB-INC-091
  - RB-SEC-001
  - RB-ADR-007
  - RB-ADR-008
  - RB-ADR-027
  - RB-INC-085
  - RB-INC-087
  - RB-INC-090
prerequisites:
  - RB-INC-085
  - RB-INC-087
  - RB-INC-090
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-091 — Context Pack do RB-INC-091

## Objetivo operacional

Implementar e validar somente a fronteira server-side que autoriza e executa o aceite integral de uma Itinerary Proposal. Não adicionar UI neste incremento.

## Estado de entrada

- `createPostgresAcceptItineraryProposal` está publicado e executa uma única transação física;
- `trip:accept-proposal` está permitido para roles owner e editor e negado para viewer;
- `resolveTripRouteAccess` resolve sessão, escopo e membership;
- a página de revisão carrega Proposal e Itinerary, mas possui apenas ação de descarte;
- Proposed Activities persistidas usam `proposedOrder` não negativo e horários `HH:mm` ou `HH:mm:ss`;
- `ApplyProposalItem` usa `targetOrder` positivo e horários `HH:mm`.

## Contratos obrigatórios

### Identidade

- `tripId` vem da rota;
- UserId vem da sessão;
- Participant ator é resolvido na Trip pelo UserId;
- `actorType` é sempre `participant`;
- `actorId` não pode vir de `FormData`.

### Payload aceito

- `itineraryProposalId` UUID;
- `expectedItineraryVersion` inteiro positivo;
- `idempotencyKey` não vazia e limitada;
- nenhuma coleção de itens enviada pelo cliente.

### Dados autoritativos

- Trip via repository;
- Itinerary Proposal via `findById(tripId, proposalId)`;
- Itinerary via `findByTripId(tripId)`;
- itens convertidos de `proposal.proposedActivities`.

### Saída

- sucesso `applied` ou `replay` com identidades, fingerprint, versão resultante e IDs aplicados;
- erro serializável com código estável;
- falha desconhecida registrada no servidor e exposta como `technical-error`.

## Regras de conversão

| Proposed Activity | Apply Proposal Item |
| --- | --- |
| `operationType` | preservado |
| `proposedActivityId` | preservado |
| `targetTripDayId` | preservado quando exigido |
| `sourceActivityId` | preservado quando exigido |
| `proposedOrder` | `targetOrder = proposedOrder + 1` |
| `proposedStartTime` | normalizado para `HH:mm` |
| `title`, `durationMinutes`, `placeId`, `flexibility` | preservados quando suportados |
| descrição, custo e reason | não pertencem ao contrato de mutação do Itinerary |

## Códigos públicos

- fronteira: `unauthenticated`, `not-found`, `invalid-request`, `technical-error`;
- domínio/aplicação: `fingerprint-conflict`, `proposal-not-found`, `proposal-not-ready`, `proposal-expired`, `proposal-items-mismatch`, `itinerary-not-found`, `itinerary-version-mismatch`, `application-in-progress`, `application-failed`.

## Caminhos principais

- `apps/web/app/viagens/[tripId]/roteiro/proposta/accept-action.ts`;
- `apps/web/lib/itinerary-proposal-acceptance.ts`;
- `packages/database/src/accept-itinerary-proposal-service.ts`;
- `packages/database/src/apply-itinerary-proposal-transaction.ts`;
- `apps/web/lib/trip-route-access.ts`.

## Testes mínimos

- payload inválido antes de acesso a repositories;
- sessão ausente;
- autorização negada;
- User autorizado sem Participant correspondente;
- Proposal ausente, não pronta, expirada ou sem itens;
- Itinerary ausente ou com versão divergente;
- construção autoritativa dos itens;
- ator derivado do servidor;
- resultado `applied`;
- resultado `replay`;
- todos os códigos oficiais;
- revalidação apenas em sucesso;
- falha técnica normalizada no wrapper.

## Fora de escopo

- renderização de botão;
- confirmação;
- loading e prevenção de clique duplicado;
- microcopy da experiência;
- E2E do fluxo integral;
- mudanças de banco ou de domínio.

## Definição de concluído

- issue #207 ligada à PR #208;
- código e testes publicados;
- documento do incremento e este Context Pack registrados;
- matriz de rastreabilidade atualizada;
- workflows de documentação e engenharia verdes;
- squash merge realizado;
- issue encerrada.
