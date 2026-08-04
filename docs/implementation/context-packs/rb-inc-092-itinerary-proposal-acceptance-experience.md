---
id: RB-CTX-092
title: Context Pack do RB-INC-092
description: Contexto operacional para integrar o aceite autorizado à experiência de revisão da Itinerary Proposal.
document_type: implementation-context-pack
owner: Experience
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
  - acceptance
  - experience
related_documents:
  - RB-INC-092
  - RB-UX-004
  - RB-UX-005
  - RB-UX-006
  - RB-DS-002
  - RB-DS-003
  - RB-SEC-001
  - RB-ADR-007
  - RB-ADR-008
  - RB-ADR-027
  - RB-INC-091
prerequisites:
  - RB-INC-091
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-092 — Context Pack do RB-INC-092

## Objetivo operacional

Conectar o contrato de aceite do RB-INC-091 à revisão da Proposal sem alterar domínio, persistência ou composição PostgreSQL.

## Estado de entrada

- a revisão separada apresenta Proposal `ready` ou `expired`;
- `acceptItineraryProposalAction` aceita Proposal, versão esperada e idempotency key;
- ator e itens são derivados no servidor;
- `trip:accept-proposal` é permitido para owner e editor e negado para viewer;
- o descarte existente não compartilhava estado pendente com o aceite;
- o Roteiro já suporta banners de feedback por query string.

## Estados da experiência

| Estado | Aceitar | Descartar | Mensagem |
| --- | --- | --- | --- |
| decisor + ready + versão atual | disponível após confirmação | disponível | proposta ainda não aplicada |
| decisor + versão obsoleta | oculto | disponível | Roteiro mudou após a Proposal |
| viewer | oculto | oculto | revisão somente leitura |
| expired | oculto | oculto | referência histórica |
| pending | desabilitado | desabilitado | processamento anunciado |
| applied | sucesso | indisponível durante navegação | Roteiro atualizado |
| replay | sucesso idempotente | indisponível durante navegação | resultado anterior reutilizado |
| erro recuperável | nova tentativa possível | disponível | mensagem estável da ação |

## Payload permitido

- `itineraryProposalId`;
- `expectedItineraryVersion`;
- `idempotencyKey`.

Não adicionar:

- `actorId`;
- `actorType`;
- Proposed Activities;
- itens de aplicação;
- permissões controladas pelo navegador.

## Regras de autorização

- a página resolve `trip:accept-proposal` apenas para decidir o que renderizar;
- a Server Action de aceite repete a autorização no servidor;
- a ação de descarte também deve repetir a autorização no servidor;
- ausência de permissão não depende apenas de ocultação visual;
- usuário sem acesso recebe semântica de recurso não encontrado.

## Regras de idempotência

- a chave é estável para a mesma Proposal e versão-base;
- clique repetido durante pendência é bloqueado;
- `replay` é apresentado como sucesso;
- o resultado anterior não é tratado como erro ou duplicidade.

## Acessibilidade

- confirmação acessível via `details`;
- checkbox obrigatório com rótulo explícito;
- processamento e sucesso em `aria-live=polite`;
- erros em `role=alert`;
- controles desabilitados durante pendência;
- foco visível e alvos com altura mínima adequada;
- controles empilhados em viewport estreito.

## Caminhos principais

- `apps/web/components/itinerary-proposal-decision-actions.tsx`;
- `apps/web/components/itinerary-proposal-decision-actions.module.css`;
- `apps/web/components/itinerary-proposal-review.tsx`;
- `apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx`;
- `apps/web/app/viagens/[tripId]/roteiro/proposta/actions.ts`;
- `apps/web/app/viagens/[tripId]/roteiro/page.tsx`.

## Testes mínimos

- payload sem ator ou itens;
- confirmação obrigatória;
- viewer sem mutações;
- Proposal obsoleta sem aceite;
- pendência desabilita aceite e descarte;
- erro recuperável não navega;
- `applied` navega para o Roteiro atualizado;
- `replay` navega como sucesso;
- descarte anônimo redireciona para entrada;
- descarte sem permissão responde como não encontrado;
- banner do Roteiro diferencia `applied` e `replay`.

## Fora de escopo

- Playwright do fluxo integral;
- fixtures reais de Proposal pronta;
- rollback PostgreSQL;
- alteração dos fragments;
- mudança da matriz de roles;
- Recommendation.

## Definição de concluído

- issue #209 vinculada à PR #210;
- implementação e testes publicados;
- documentos registrados;
- matriz atualizada;
- CI integral verde;
- squash merge executado;
- issue encerrada.
