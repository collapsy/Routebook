---
id: RB-INC-093
title: Integração E2E do Aceite Integral de Itinerary Proposal
description: Valida o aceite integral da experiência web ao PostgreSQL, incluindo replay idempotente e persistência dos efeitos.
document_type: implementation-increment
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-03"
last_updated: "2026-08-04"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - acceptance
  - e2e
  - postgresql
  - idempotency
related_documents:
  - RB-QA-001
  - RB-CICD-001
  - RB-SEC-001
  - RB-ADR-007
  - RB-ADR-008
  - RB-ADR-027
  - RB-INC-084
  - RB-INC-085
  - RB-INC-091
  - RB-INC-092
prerequisites:
  - RB-INC-092
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-093 — Integração E2E do Aceite Integral de Itinerary Proposal

## 1. Objetivo

Validar o fluxo real de aceite da Itinerary Proposal da interface ao PostgreSQL, comprovando autorização, atomicidade, idempotência, persistência e atualização do Roteiro.

Issue: #211.

Branch: `feature/rb-inc-093-itinerary-proposal-acceptance-e2e`.

Pull request: #212.

## 2. Contexto

Os incrementos RB-INC-084, RB-INC-085, RB-INC-091 e RB-INC-092 publicaram, respectivamente, a composição PostgreSQL, a integração ao application service, a Server Action autorizada e a experiência de aceite. A cobertura integral banco–UI permaneceu fora de escopo.

A análise inicial deste incremento identificou ainda que o replay persistido não era alcançável pela Server Action: a validação web recusava uma Proposal já `accepted` e a versão resultante do Roteiro antes de delegar à reserva idempotente.

## 3. Resultado esperado

- aceite executado pela interface real;
- Itinerary atualizado uma única vez;
- Proposal finalizada como `accepted`;
- Proposal Application concluída;
- Decision persistida;
- recarregamento preserva o resultado;
- submissões concorrentes com a mesma chave resultam em `applied` e `replay`;
- replay não duplica Activity, Application ou Decision;
- Proposal `ready` com versão concorrente continua recusada;
- Proposal expirada ou usuário sem acesso não executam aceite;
- cenários críticos executam em desktop e mobile.

## 4. Decisão de correção

A fronteira web pode encaminhar uma Proposal `accepted` somente como candidata a replay. Nesse estado:

- identidade, ator, Proposal, itens e versão-base continuam derivados de dados autoritativos;
- a versão atual do Itinerary não bloqueia a tentativa antes da reserva idempotente;
- a transação decide entre `replay`, conflito de fingerprint ou `proposal-not-ready`;
- uma chave nova não reaplica a Proposal;
- Proposal `ready` mantém todas as validações atuais de validade e versão concorrente;
- fixtures E2E preservam o tipo nominal `ItineraryProposalId` ao consultar repositories;
- fixtures de aceite usam o vocabulário canônico de flexibilidade e `proposedOrder` zero-based compatível com a posição de aplicação;
- a Server Action de aceite é importada e vinculada diretamente na fronteira client-side que usa `useActionState`, preservando sua referência serializável sem atravessar uma cadeia intermediária de props;
- o sucesso é concluído por `redirect` autoritativo na Server Action, fora do bloco de captura, após invalidar Trip e Roteiro;
- as asserções E2E de erro localizam a mensagem exata do produto, evitando conflito com o `route announcer` acessível adicionado pelo Next.js.

## 5. Escopo

- correção do caminho de replay na Server Action;
- testes unitários da fronteira web;
- E2E PostgreSQL de `applied`, `replay`, persistência e recarregamento;
- verificação dos aggregates persistidos;
- governança documental.

## 6. Fora de escopo

- novos contratos de domínio;
- nova estratégia transacional;
- migrations;
- alteração da matriz de autorização;
- geração produtiva de Recommendation ou Proposal.

## 7. Critérios de aceite

- [ ] happy path integral aprovado;
- [ ] Itinerary atualizado exatamente uma vez;
- [ ] Proposal `accepted` persistida;
- [ ] Proposal Application `succeeded` persistida;
- [ ] Decision canônica persistida;
- [ ] reload preserva o Roteiro atualizado;
- [ ] replay real retorna sucesso idempotente;
- [ ] replay não duplica efeitos;
- [ ] chave nova em Proposal `accepted` não reaplica;
- [ ] versão concorrente de Proposal `ready` permanece erro recuperável;
- [ ] Proposal expirada não oferece aceite;
- [ ] usuário sem acesso não executa aceite;
- [ ] desktop e mobile aprovados;
- [ ] registry, Context Pack e matriz atualizados;
- [ ] CI integral verde.

## 8. Evidências

Validação E2E real em andamento na PR #212; runs finais serão registrados após todos os gates verdes.
