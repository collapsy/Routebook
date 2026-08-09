---
id: RB-INC-108
title: Núcleo de Aceite Parcial de Itinerary Proposal
description: Introduz seleção parcial canônica, comando idempotente e transição de domínio para Itinerary Proposal parcialmente aceita.
document_type: implementation-increment
owner: Proposal Management
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
  - domain
related_documents:
  - RB-PRD-006
  - RB-UX-005
  - RB-INC-107
prerequisites:
  - RB-INC-107
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-108 — Núcleo de Aceite Parcial de Itinerary Proposal

## 1. Objetivo

Materializar o núcleo de domínio do comando `AcceptItineraryProposalPartially`, alinhado ao contrato UX de aceite parcial e às regras de aplicação/idempotência, sem antecipar persistência PostgreSQL, Server Action ou seleção visual.

Issue: #245.

Branch: `feature/rb-inc-108-partial-itinerary-proposal-acceptance-core`.

PR: #246.

## 2. Lacuna canônica

A cadeia anterior consolidou geração, edição e aceite integral. O domínio já reconhecia o status `partially-accepted`, o tipo de Proposal Application `partial` e o comando/evento canônico de aceite parcial, mas não existia uma primitiva que validasse a seleção, produzisse fingerprint estável e preservasse explicitamente os itens ainda não aplicados.

## 3. Escopo

- seleção parcial por `proposedActivityId`;
- Proposal obrigatoriamente `ready` e temporalmente válida;
- seleção não vazia;
- rejeição de IDs duplicados ou desconhecidos;
- rejeição de seleção equivalente ao conjunto completo;
- partição determinística `selected` / `remaining` pela ordem canônica da Proposal;
- comando de aplicação com `applicationType: "partial"`;
- ordenação canônica dos `ApplyProposalItem` antes do fingerprint;
- fingerprint idempotente independente da ordem de chegada da seleção;
- `remainingProposedActivityIds` explícitos no comando;
- transição `ready → partially-accepted` preservando apenas itens ainda não aplicados;
- imutabilidade da Proposal original;
- exports públicos e testes de domínio.

## 4. Fora de escopo

- transação PostgreSQL;
- migration ou constraint de persistência para `partially-accepted`;
- gravação de Decision;
- gravação de Proposal Application parcial;
- Server Action;
- seleção visual;
- E2E;
- regeneração de Proposal.

## 5. Seleção canônica

A ordem enviada pela UI não define a ordem do aceite parcial. A seleção é normalizada pela ordem das Proposed Activities persistidas na própria Proposal. Assim, selecionar os mesmos IDs em ordens diferentes produz:

- os mesmos `proposedActivityIds`;
- os mesmos itens de aplicação ordenados;
- o mesmo fingerprint.

Isso evita divergência de idempotência causada apenas pela ordem de checkboxes ou payloads.

## 6. Regras de validação

A API expõe erros estáveis:

- `proposal-not-ready`;
- `proposal-expired`;
- `selection-empty`;
- `duplicate-selection`;
- `unknown-proposed-activity`;
- `full-selection`.

Selecionar todos os itens é rejeitado porque corresponde ao aceite integral já existente, e não ao comando parcial.

## 7. Comando parcial

`createAcceptItineraryProposalPartiallyCommand` reutiliza `createApplyProposalItemsCommand` para normalizar o contrato de aplicação e `createProposalApplicationRequestFingerprint` para produzir o fingerprint oficial com:

- Itinerary Proposal;
- Itinerary;
- `applicationType: "partial"`;
- versão esperada do Itinerary;
- ator;
- IDs selecionados em ordem canônica.

O comando também carrega `remainingProposedActivityIds` para a futura transação/persistência.

## 8. Transição da Proposal

`partiallyAcceptItineraryProposal`:

- exige Proposal `ready` e ainda válida;
- muda o status para `partially-accepted`;
- grava `acceptedAt` e `updatedAt` como cópias do instante da decisão;
- substitui `proposedActivities` pelos itens ainda não aplicados;
- preserva critérios, justificativas, limitações, conflitos e proveniência;
- não muta a Proposal de entrada;
- não toca no Itinerary.

## 9. Critérios de aceite

- [x] seleção parcial válida produz partição determinística;
- [x] ordem do payload não altera a ordem canônica da seleção;
- [x] seleção vazia é rejeitada;
- [x] seleção duplicada é rejeitada;
- [x] seleção desconhecida é rejeitada;
- [x] seleção integral é rejeitada;
- [x] Proposal não `ready` é rejeitada;
- [x] Proposal expirada é rejeitada;
- [x] comando usa `applicationType: "partial"`;
- [x] fingerprint é estável para a mesma seleção em ordens diferentes;
- [x] itens de aplicação são reordenados conforme a Proposal;
- [x] itens restantes são explícitos no comando;
- [x] transição retém somente Proposed Activities não aplicadas;
- [x] metadata/proveniência são preservadas;
- [x] Proposal original não é mutada;
- [x] API pública exportada;
- [x] Engineering Validation técnico aprovado;
- [x] registry, Context Pack e matriz de rastreabilidade sincronizados;
- [ ] Documentation Validation e Engineering Validation aprovados no HEAD canônico antes do merge.

## 10. Evidências técnicas

- núcleo: `modules/proposal-management/src/accept-itinerary-proposal-partially.ts`;
- testes: `modules/proposal-management/src/accept-itinerary-proposal-partially.test.ts`;
- exports: `modules/proposal-management/src/index.ts`;
- SHA técnico validado: `43ef85bc5f081622ab532648ab52a62620e0e196`;
- Engineering Validation #1342 / run `31329125333`: success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo.

## 11. Próximo recorte esperado

O próximo incremento deve materializar a transação PostgreSQL do aceite parcial: aplicar somente os itens selecionados, persistir Proposal Application/Decision parciais, atualizar a Proposal para `partially-accepted` com itens restantes e incrementar o Itinerary uma única vez de forma idempotente.
