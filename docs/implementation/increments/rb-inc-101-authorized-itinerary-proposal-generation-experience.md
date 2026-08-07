---
id: RB-INC-101
title: Experiência Autorizada de Geração de Itinerary Proposal
description: Conecta a Server Action autorizada de geração à experiência web de Proposta de Roteiro.
document_type: implementation-increment
owner: Experience
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
  - RB-UX-004
  - RB-UX-005
  - RB-UX-006
  - RB-DS-002
  - RB-DS-003
  - RB-INC-057
  - RB-INC-092
  - RB-INC-100
prerequisites:
  - RB-INC-100
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-101 — Experiência Autorizada de Geração de Itinerary Proposal

## 1. Objetivo

Conectar a capacidade server-side entregue no RB-INC-100 à experiência de Proposta de Roteiro, permitindo geração explícita e autorizada quando ainda não existe uma Proposal revisável.

Issue: #229.

Branch: `feature/rb-inc-101-authorized-itinerary-proposal-generation-experience`.

PR: #230.

## 2. Lacuna canônica

A página `apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx` possuía revisão, aceite e descarte de Proposal revisável, mas o estado vazio apenas informava que nenhuma proposta estava disponível. O RB-INC-100 tornou a geração acessível por Server Action; este incremento conecta essa fronteira a uma affordance explícita de produto sem disparo implícito e sem duplicar política de autorização.

## 3. Escopo concluído

- ação visual explícita no estado de geração apropriado;
- autorização baseada em `trip:edit` antes de oferecer capacidade de geração;
- reutilização direta de `generateItineraryProposalAction`;
- feedback acessível para pending e erros recuperáveis;
- prevenção de submissões duplicadas;
- navegação para a Proposal gerada após sucesso;
- preservação integral do fluxo já existente de revisão, aceite e descarte;
- validação integral pelos workflows canônicos;
- registry e Context Pack sincronizados, com rastreabilidade final em consolidação antes do merge.

## 4. Fora de escopo

- geração automática ao carregar página;
- alteração do generator determinístico;
- Provider externo de IA;
- nova role ou nova permissão paralela;
- aceite automático após geração;
- migrations sem mudança real de contrato de dados.

## 5. Critérios de aceite

- [x] usuário autorizado a `trip:edit` pode iniciar geração explicitamente;
- [x] usuário sem `trip:edit` não recebe affordance ativa de geração;
- [x] abrir a página não gera Proposal automaticamente;
- [x] a UI reutiliza a Server Action do RB-INC-100;
- [x] estado pending previne submissões duplicadas;
- [x] erros estáveis são exibidos com feedback acessível;
- [x] sucesso conduz à Proposal pronta para revisão;
- [x] revisão, aceite e descarte existentes não regridem;
- [x] CI integral passou no mesmo SHA funcional `90b6708a16d6f0e7abdcd7bee3ac95b59bff122e`;
- [ ] matriz de rastreabilidade e evidências finais sincronizadas no HEAD de integração.

## 6. Evidências de validação funcional

- Documentation Validation #892 / run `31214526440`: success no SHA `90b6708a16d6f0e7abdcd7bee3ac95b59bff122e`;
- Engineering Validation #1253 / run `31214526534`: success no mesmo SHA;
- format, documentação, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo concluídos pelo Engineering Validation;
- PR #230 permanece Draft até a consolidação final de governança e nova validação no mesmo HEAD final.
