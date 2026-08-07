---
id: RB-INC-100
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

PR: #228.

## 2. Decisão de autorização

A geração altera o estado de planejamento da Trip ao criar e evoluir uma Itinerary Proposal, portanto reutiliza a permissão canônica existente `trip:edit`. Este incremento não amplia a matriz de roles nem cria uma permissão paralela específica sem necessidade de produto comprovada.

## 3. Escopo concluído

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

- [x] usuário não autenticado não executa geração;
- [x] acesso negado permanece indistinguível de recurso inexistente;
- [x] Trip e Itinerary são lidos de fontes autoritativas;
- [x] versões e IDs do comando não são aceitos do cliente;
- [x] `trip:edit` é a autorização canônica reutilizada;
- [x] serviço concreto do RB-INC-099 é reutilizado;
- [x] IDs e relógio permanecem injetáveis em testes;
- [x] falhas oficiais são mapeadas para códigos estáveis;
- [x] sucesso revalida o estado relevante e permite navegação;
- [x] registry, Context Pack e matriz de rastreabilidade estão sincronizados;
- [x] Documentation Validation #885 e Engineering Validation #1246 passaram no mesmo HEAD `709a9cbc319b581914a9e82199d12402dcb09347` antes da consolidação documental final.

## 6. Evidência de qualidade

O HEAD `709a9cbc319b581914a9e82199d12402dcb09347` passou Documentation Validation run `31206406827` e Engineering Validation run `31206407309`. O merge permanece condicionado a uma nova execução verde de ambos os workflows no mesmo HEAD produzido pela consolidação final da governança.
