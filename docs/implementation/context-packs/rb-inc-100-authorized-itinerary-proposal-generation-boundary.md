---
id: RB-CTX-100
title: Context Pack do RB-INC-100 — Fronteira autorizada para geração de Itinerary Proposal
description: Contexto operacional para expor geração autoritativa de Itinerary Proposal por uma fronteira server-side autenticada e autorizada.
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
  - authorization
  - server-side
related_documents:
  - RB-INC-100
  - RB-INC-086
  - RB-INC-087
  - RB-INC-090
  - RB-INC-099
prerequisites:
  - RB-INC-099
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-100 — Fronteira autorizada para geração de Itinerary Proposal

## Objetivo

Preservar as decisões e invariantes necessárias para conectar a composition root do RB-INC-099 à aplicação web sem deslocar autenticação/autorização para o domínio de Proposal Management.

## Estado de partida

- Better Auth e resolução server-side de sessão existem desde o RB-INC-086.
- Account Membership e autorização de Trip existem desde o RB-INC-087.
- O workspace autenticado e isolado existe desde o RB-INC-090.
- A composition root PostgreSQL de geração autoritativa existe desde o RB-INC-099.

## Invariantes

1. A fronteira deve negar por padrão quando não houver sessão válida.
2. A autorização da Trip deve ocorrer antes de carregar contexto de geração ou iniciar lifecycle de Proposal.
3. `actorId` e escopo de Account devem vir da sessão/autorização server-side, não de valores livres enviados pelo cliente.
4. O domínio de Proposal Management permanece agnóstico a Better Auth e à política de Membership.
5. A fronteira reutiliza o serviço concreto do RB-INC-099; não cria uma segunda composition root.
6. Falhas esperadas devem ser mapeadas por allowlist para um contrato estável da aplicação.
7. Valores temporais e factories não determinísticos continuam explícitos na composition boundary.

## Arquivos a localizar/reutilizar

- resolução server-side de sessão do RB-INC-086;
- autorização PostgreSQL de Trip do RB-INC-087;
- padrão de Server Action autorizada do RB-INC-091;
- `packages/database/src/authoritative-itinerary-proposal-generation-service.ts` do RB-INC-099.

## Próximos passos

1. localizar os contratos concretos usados na Server Action de aceite;
2. definir o contrato de entrada mínimo da geração autorizada;
3. implementar a fronteira sem aceitar identidade/Account do cliente;
4. cobrir autenticação ausente, autorização negada, sucesso e falhas estáveis;
5. sincronizar registry e matriz antes da validação final.
