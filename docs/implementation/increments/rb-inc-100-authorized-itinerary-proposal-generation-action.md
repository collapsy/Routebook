---
title: Server Action Autorizada para Gerar Itinerary Proposal
description: Expõe a geração autoritativa de Itinerary Proposal por uma fronteira server-side autenticada e autorizada da aplicação web.
document_type: implementation-increment
owner: Proposal Management
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
  - authorization
  - server-action
related_documents:
  - RB-SEC-001
  - RB-ADR-007
  - RB-ADR-008
  - RB-INC-087
  - RB-INC-090
  - RB-INC-099
prerequisites:
  - RB-INC-087
  - RB-INC-090
  - RB-INC-099
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-100 — Server Action Autorizada para Gerar Itinerary Proposal

## 1. Objetivo

Expor o serviço concreto de geração autoritativa concluído no RB-INC-099 por uma fronteira server-side autenticada e autorizada da aplicação web.

Issue: #226.

Branch: `feature/rb-inc-100-authorized-itinerary-proposal-generation-action`.

## 2. Decisão de autorização

A geração altera o estado de planejamento da Trip ao criar e evoluir uma Itinerary Proposal, portanto reutiliza a permissão canônica existente `trip:edit`. Este incremento não amplia a matriz de roles nem cria uma permissão paralela específica sem necessidade de produto comprovada.

## 3. Escopo

- caso de uso de fronteira testável separado da Server Action do Next.js;
- resolução de sessão e autorização via `resolveTripRouteAccess`;
- leitura autoritativa de Trip e Itinerary para formar versões e identificadores do comando;
- criação explícita e testável de IDs e instantes;
- chamada ao serviço PostgreSQL do RB-INC-099;
- contrato estável de sucesso e falha;
- revalidação e navegação apenas após sucesso;
- testes e governança canônica.

## 4. Fora de escopo

- UI para acionar a geração;
- nova role ou nova matriz de autorização;
- alterações no generator determinístico;
- Provider externo de IA;
- aceite/aplicação da Proposal;
- migrations sem mudança real de contrato de dados.

## 5. Critérios de aceite

- [ ] usuário não autenticado não executa geração;
- [ ] acesso negado permanece indistinguível de recurso inexistente;
- [ ] Trip e Itinerary são lidos de fontes autoritativas;
- [ ] versões e IDs do comando não são aceitos do cliente;
- [ ] `trip:edit` é a autorização canônica reutilizada;
- [ ] serviço concreto do RB-INC-099 é reutilizado;
- [ ] IDs e relógio permanecem injetáveis em testes;
- [ ] falhas oficiais são mapeadas para códigos estáveis;
- [ ] sucesso revalida o estado relevante e permite navegação;
- [ ] CI integral passa no mesmo SHA;
- [ ] registry, Context Pack e matriz de rastreabilidade são atualizados.
