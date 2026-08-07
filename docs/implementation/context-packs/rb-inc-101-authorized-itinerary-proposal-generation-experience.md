---
id: RB-CTX-101
title: Context Pack do RB-INC-101 — Experiência autorizada de geração de Itinerary Proposal
description: Contexto operacional para conectar a geração server-side à experiência de Proposta de Roteiro.
document_type: implementation-context
owner: Engineering
status: Draft
version: "0.1.0"
created: "2026-08-07"
last_updated: "2026-08-07"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - generation
  - experience
  - authorization
related_documents:
  - RB-INC-101
  - RB-INC-092
  - RB-INC-100
prerequisites:
  - RB-INC-100
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-101 — Experiência autorizada de geração de Itinerary Proposal

## Objetivo

Preservar as fronteiras entre experiência, autorização e geração autoritativa enquanto a capacidade do RB-INC-100 é exposta ao usuário.

## Fronteiras canônicas

- a experiência vive na rota de Proposal e em componentes web dedicados;
- `generateItineraryProposalAction` continua sendo a única Server Action de geração;
- `resolveTripRouteAccess` continua sendo a autoridade de acesso da Trip;
- a experiência consulta `trip:edit` apenas para decidir disponibilidade da ação, sem duplicar a autorização executada pela Server Action;
- Proposal Management continua proprietário de lifecycle e geração determinística.

## Invariantes

1. visitar a página nunca gera Proposal implicitamente;
2. geração exige ação explícita do usuário;
3. a ação deve permanecer segura mesmo se a UI for contornada;
4. submissões duplicadas são bloqueadas durante pending;
5. erros recuperáveis são exibidos sem destruir o Roteiro atual;
6. sucesso termina na experiência de revisão da Proposal persistida;
7. aceite e descarte continuam decisões separadas da geração.

## Implementação consolidada

- `apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx` resolve disponibilidade da affordance com `trip:edit`;
- `apps/web/components/itinerary-proposal-generation-control.tsx` contém a interação explícita, pending, bloqueio contra repetição e feedback acessível;
- `apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts` permanece a fronteira de mutação reutilizada;
- o fluxo existente de `itinerary-proposal-review.tsx` permanece separado para revisão, aceite e descarte.

## Evidências

- PR #230;
- SHA funcional validado: `90b6708a16d6f0e7abdcd7bee3ac95b59bff122e`;
- Documentation Validation #892 / run `31214526440`: success;
- Engineering Validation #1253 / run `31214526534`: success;
- nova validação é obrigatória no HEAD final após a consolidação documental.

## Estado

Issue #229 aberta e PR #230 permanece Draft enquanto a matriz de rastreabilidade e as evidências finais são consolidadas antes do merge.
