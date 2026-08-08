---
id: RB-INC-102
title: Integração E2E da Geração Autorizada de Itinerary Proposal
description: Valida da experiência web ao PostgreSQL o fluxo autorizado de geração de Itinerary Proposal.
document_type: implementation-increment
owner: Quality
status: Draft
version: "0.1.0"
created: "2026-08-08"
last_updated: "2026-08-08"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - generation
  - e2e
  - postgresql
related_documents:
  - RB-QA-001
  - RB-QA-002
  - RB-CICD-001
  - RB-INC-093
  - RB-INC-099
  - RB-INC-100
  - RB-INC-101
prerequisites:
  - RB-INC-099
  - RB-INC-100
  - RB-INC-101
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-102 — Integração E2E da Geração Autorizada de Itinerary Proposal

## 1. Objetivo

Validar o fluxo integral de geração autorizada de Itinerary Proposal da experiência web ao PostgreSQL, cobrindo a affordance do RB-INC-101, a Server Action do RB-INC-100 e a composition root PostgreSQL do RB-INC-099 sem mocks na cadeia funcional.

Issue: #231.

Branch: `feature/rb-inc-102-authorized-itinerary-proposal-generation-e2e`.

PR: #234.

## 2. Lacuna canônica

Os incrementos RB-INC-099 a RB-INC-101 concluíram, respectivamente, a composição PostgreSQL, a fronteira server-side autorizada e a experiência explícita de geração. Faltava uma evidência E2E que atravessasse essas fronteiras pela UI real, validasse a persistência resultante e comprovasse que o Itinerary continua preservado até um aceite separado.

## 3. Escopo

- fixture autenticada com Trip e Itinerary reais;
- Place e Recommendation elegível persistidos no PostgreSQL;
- acionamento pela UI de Proposal sem chamada direta ao caso de uso;
- persistência do lifecycle até `ready`;
- Proposed Activity derivada do Place/Recommendation autoritativos;
- revisão da Proposal gerada na mesma experiência;
- preservação integral do Itinerary antes do aceite;
- persistência observável após reload;
- contrato sem Recommendation elegível: Proposal `ready` com zero mudanças e limitação explícita;
- execução nos projetos responsivos canônicos do Playwright;
- governança e rastreabilidade.

## 4. Fora de escopo

- alteração do algoritmo determinístico;
- Provider externo de IA;
- nova role ou política de autorização;
- aplicação automática da Proposal ao Itinerary;
- alteração de schema ou migration sem mudança real de contrato.

## 5. Critérios de aceite

- [x] o teste inicia a geração pela affordance real da página de Proposal;
- [x] autenticação e autorização reais da suíte E2E são preservadas;
- [x] Recommendation elegível produz Proposed Activity ligada ao Place autoritativo;
- [x] Proposal final é persistida como `ready`;
- [x] a Proposal persistida permanece revisável após reload;
- [x] o Itinerary permanece idêntico antes e depois da geração;
- [x] ausência de Recommendation elegível produz Proposal `ready` sem mudanças;
- [x] a limitação de ausência de candidatos permanece visível na revisão;
- [ ] Documentation Validation e Engineering Validation aprovados no mesmo HEAD final;
- [x] registry, Context Pack e matriz de rastreabilidade sincronizados.

## 6. Evidências

- teste E2E: `apps/web/e2e/itinerary-proposal-generation.spec.ts`;
- fluxo de UI: `apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx`;
- controle de geração: `apps/web/components/itinerary-proposal-generation-control.tsx`;
- Server Action: `apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts`;
- repository de Proposal: `packages/database/src/proposal-repository.ts`;
- composition root: `packages/database/src/authoritative-itinerary-proposal-generation-service.ts`;
- issue: #231;
- Draft PR: #234.
