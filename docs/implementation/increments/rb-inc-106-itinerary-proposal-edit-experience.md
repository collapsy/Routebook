---
id: RB-INC-106
title: Experiência de Edição de Proposed Activity na Itinerary Proposal
description: Materializa a edição visual de Proposed Activity na revisão da Proposal, preservando autorização, proveniência e separação do Roteiro confirmado.
document_type: implementation-increment
owner: Experience
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
  - accessibility
related_documents:
  - RB-PRD-006
  - RB-UX-005
  - RB-INC-103
  - RB-INC-104
  - RB-INC-105
prerequisites:
  - RB-INC-105
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-106 — Experiência de Edição de Proposed Activity na Itinerary Proposal

## 1. Objetivo

Materializar a capacidade de editar uma Proposed Activity diretamente na página de revisão da Itinerary Proposal, consumindo a Server Action autorizada do RB-INC-105 e mantendo a Proposal explicitamente separada do Itinerary confirmado.

Issue: #241.

Branch: `feature/rb-inc-106-itinerary-proposal-edit-experience`.

PR: #242.

## 2. Escopo

- editor client por Proposed Activity;
- disponibilidade somente em Proposal `ready`, baseada na versão atual do Itinerary e com `trip:edit` autorizado;
- Proposal expirada, stale ou sem `trip:edit` permanece somente leitura;
- prefill a partir de valores brutos do snapshot, sem reconstrução por labels formatados;
- lista canônica de Dias do Itinerary para movimentação;
- comportamento orientado ao tipo de operação;
- feedback acessível de pendência, erro e sucesso;
- atualização da revisão por `router.refresh()` após persistência bem-sucedida;
- aceite e descarte permanecem ações separadas;
- testes do review model, editor e estados de integração;
- governança e CI.

## 3. Semântica por operação

### `add`

Permite revisar Dia, título, descrição, horário, duração, flexibilidade e estimativa registrada na Proposal.

### `move`

Permite alterar o Dia proposto. A ordem interna zero-based não é exposta como campo numérico para evitar uma UX técnica e enganosa; uma interação de reordenação adequada poderá evoluir separadamente.

### `update`

Permite revisar título, descrição, horário, duração, flexibilidade e estimativa registrada na Proposal.

### `remove`

Não oferece formulário de edição, pois a operação representa uma intenção de remoção cuja identidade/proveniência deve permanecer estável.

## 4. Invariantes preservadas

- `proposedActivityId`, `operationType`, `sourceActivityId`, `placeId` e `reason` não são editáveis pela UI;
- a experiência nunca escreve diretamente no banco;
- toda persistência passa pela Server Action do RB-INC-105;
- salvar uma edição não equivale a aceitar a Proposal;
- o Itinerary confirmado não é alterado pela edição;
- Proposal expirada não é editável;
- Proposal baseada em versão antiga do Itinerary não é editável;
- usuário sem `trip:edit` não recebe controles de edição;
- permissões de editar e decidir continuam independentes.

## 5. Review model

`ItineraryProposalReviewActivity` passou a expor `operationType` e `editValues` com os valores brutos necessários ao formulário. O review também expõe `dayOptions` derivados deterministicamente dos Dias do Itinerary.

Essa decisão evita parsing reverso de:

- labels de horário;
- duração formatada;
- moeda formatada;
- labels de Dia.

## 6. Acessibilidade e responsividade

- cada disclosure possui nome único incluindo o título da atividade;
- labels explícitos são usados em todos os campos;
- estado de processamento desabilita o envio e anuncia `Salvando edição…`;
- erros usam `role="alert"`;
- sucesso usa `role="status"` e reforça que o Roteiro não foi alterado;
- layout de campos usa grid responsivo e colapsa em mobile;
- o botão de salvar ocupa largura disponível em telas pequenas.

## 7. Critérios de aceite

- [x] Proposal `ready` com `trip:edit` e versão atual oferece edição;
- [x] Proposal stale não oferece edição;
- [x] Proposal expirada não oferece edição;
- [x] usuário sem `trip:edit` não oferece edição;
- [x] permissão de edição é independente de `trip:accept-proposal`;
- [x] valores atuais são pré-preenchidos por dados brutos;
- [x] Dias disponíveis derivam do Itinerary atual;
- [x] campos opcionais podem ser limpos pela Server Action existente;
- [x] `add`, `move`, `update` e `remove` recebem UX coerente com sua semântica;
- [x] IDs e proveniência imutáveis não são expostos como campos editáveis;
- [x] salvar edição não aplica o Itinerary;
- [x] sucesso atualiza a revisão;
- [x] feedback de pendência, erro e sucesso é acessível;
- [x] testes de model e componentes foram adicionados/atualizados;
- [x] Engineering Validation técnico aprovado;
- [ ] registry, Context Pack e matriz de rastreabilidade sincronizados;
- [ ] Documentation Validation e Engineering Validation aprovados no mesmo HEAD final.

## 8. Evidências técnicas

- editor: `apps/web/components/itinerary-proposal-activity-editor.tsx`;
- estilos: `apps/web/components/itinerary-proposal-activity-editor.module.css`;
- testes do editor: `apps/web/components/itinerary-proposal-activity-editor.test.tsx`;
- review: `apps/web/components/itinerary-proposal-review.tsx`;
- testes da review: `apps/web/components/itinerary-proposal-review.test.tsx`;
- review model: `apps/web/lib/itinerary-proposal-experience.ts`;
- testes do model: `apps/web/lib/itinerary-proposal-experience.test.ts`;
- página autorizada: `apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx`;
- SHA técnico validado: `ffc6fc4e214c76c0241303ab7a80c51376fbfc48`;
- Engineering Validation #1319 / run `31326575512`: success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo.

## 9. Próximo recorte esperado

O próximo incremento deve provar o fluxo de edição integral em navegador real — autenticação, Proposal persistida, alteração visual, Server Action, PostgreSQL e reidratação — cobrindo desktop e mobile sem aplicar o Itinerary confirmado.
