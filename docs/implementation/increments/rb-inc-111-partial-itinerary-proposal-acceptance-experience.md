---
id: RB-INC-111
title: Experiência de Seleção e Aceite Parcial de Itinerary Proposal
description: Permite selecionar Proposed Activities explicitamente e aplicar somente o subconjunto confirmado na revisão da Proposal.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - partial-acceptance
  - experience
  - accessibility
related_documents:
  - RB-PRD-006
  - RB-UX-005
  - RB-INC-110
prerequisites:
  - RB-INC-110
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-111 — Experiência de Seleção e Aceite Parcial de Itinerary Proposal

## 1. Objetivo

Disponibilizar na revisão da `Itinerary Proposal` uma seleção explícita e acessível para aplicar somente as `Proposed Activities` confirmadas pelo usuário por meio da Server Action do RB-INC-110.

Issue: #253.

Branch: `codex/rb-inc-111-partial-acceptance-experience`.

PR: #254.

## 2. Dependência canônica

O RB-INC-108 definiu a seleção parcial, o RB-INC-109 garantiu a transação atômica e o RB-INC-110 expôs a fronteira web autorizada. Este incremento conecta essa cadeia à revisão visual sem alterar domínio, lifecycle ou persistência.

## 3. Escopo implementado

- opção distinta `Aceitar parte da proposta`;
- disponibilidade somente para Proposal aplicável com ao menos duas mudanças;
- checkbox acessível por Proposed Activity, com título e Dia;
- seleção vazia bloqueada com orientação;
- seleção integral bloqueada e direcionada ao aceite integral;
- payload restrito a IDs selecionados, Proposal ID, versão e idempotency key;
- aceite integral, parcial e descarte mutuamente bloqueados durante processamento;
- seleção preservada enquanto um erro recuperável é apresentado;
- feedback anunciado para loading, erro, aplicação e replay;
- navegação ao Roteiro com sinalização `partial-applied` ou `partial-replay`;
- banner específico no Roteiro para aceite parcial;
- comportamento responsivo e foco visível;
- testes de componente da decisão e da revisão.

## 4. Fora de escopo

- seleção agregada por Dia ou bloco;
- mudança no comando, fingerprint, lifecycle ou transação;
- aplicação posterior dos itens restantes;
- E2E específico do aceite parcial;
- regeneração da Proposal.

## 5. Interação

O aceite parcial permanece separado do aceite integral. O usuário abre a opção parcial, escolhe um subconjunto e confirma. Nenhum item vem pré-selecionado. A UI informa quantos itens foram escolhidos e impede que zero ou todos sejam submetidos pelo fluxo parcial.

Itens não selecionados não são enviados como conteúdo aplicável. O formulário envia somente `selectedProposedActivityId` repetido para os IDs escolhidos, além dos campos de controle exigidos pela Server Action.

## 6. Concorrência e feedback

Enquanto qualquer decisão está em andamento, os controles integral, parcial e descarte ficam bloqueados. Erros permanecem na mesma superfície com `role=alert`. Sucesso e replay são anunciados antes da navegação para o Roteiro.

O Roteiro diferencia aceite integral de parcial e comunica que somente as mudanças confirmadas foram aplicadas.

## 7. Critérios de aceite

- [x] viewer sem decisão não vê controles de aceite;
- [x] Proposal stale ou expirada não oferece aceite parcial;
- [x] Proposal com um item não oferece seleção parcial;
- [x] seleção vazia não é submetida;
- [x] seleção integral orienta o aceite integral;
- [x] seleção parcial envia somente IDs e campos de controle;
- [x] ações concorrentes são bloqueadas;
- [x] loading, erro, applied e replay são anunciados;
- [x] Roteiro apresenta feedback específico do aceite parcial;
- [x] testes de componente aprovados;
- [x] lint e typecheck aprovados;
- [x] Engineering Validation técnico aprovado;
- [x] registry, Context Pack e matriz sincronizados;
- [ ] Documentation Validation e Engineering Validation aprovados no HEAD canônico antes do merge.

## 8. Evidências

- controles: `apps/web/components/itinerary-proposal-decision-actions.tsx`;
- estilos: `apps/web/components/itinerary-proposal-decision-actions.module.css`;
- integração da revisão: `apps/web/components/itinerary-proposal-review.tsx`;
- feedback do Roteiro: `apps/web/app/viagens/[tripId]/roteiro/page.tsx`;
- testes focados: 19 aprovados;
- SHA técnico: `55e45ac30f2674e21903e884e17ce893324a9fb3`;
- Engineering Validation: run `31494965592`, job `93790262730`, success integral;
- Playwright técnico: 79 testes aprovados sem retry flaky.

## 9. Próximo recorte esperado

O próximo incremento deve cobrir a jornada de aceite parcial pelo navegador, desde a seleção autorizada até a persistência do Itinerary, Proposal Application, Decision e Proposal `partially-accepted`.
