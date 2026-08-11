---
id: RB-INC-116
title: Aprovação Formal do RB-ADR-018
description: Registra a aprovação humana do Neon como Provider inicial de PostgreSQL e PostGIS gerenciado, sem provisionar infraestrutura externa.
document_type: implementation-increment
owner: Governance
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - governance
  - adr
  - neon
related_documents:
  - RB-ADR-018
  - RB-ADR-017
  - RB-GOV-001
  - RB-GOV-002
  - RB-INC-115
prerequisites:
  - RB-INC-115
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-116 — Aprovação Formal do RB-ADR-018

## 1. Objetivo

Registrar de forma versionada e rastreável a aprovação humana do Neon como Provider inicial de PostgreSQL e PostGIS gerenciado.

Issue: #270.

Branch: `codex/rb-inc-116-approve-adr-018`.

PR: a criar.

## 2. Decisão

O responsável humano e owner do projeto aprovou o prosseguimento após receber o link e a solicitação explícita de aprovação do RB-ADR-018. O estado interno da decisão passa de `Proposed` para `Approved`.

O frontmatter permanece `Published`, pois representa a publicação documental, não o estado arquitetural interno.

## 3. Condições preservadas

- implementação incremental;
- produção protegida e Preview isolado;
- runtime por conexão pooled;
- migrations por conexão direta e credencial apropriada;
- branches não substituem backup;
- restore deverá ser testado;
- portabilidade PostgreSQL preservada.

## 4. Fora de escopo

- criar projeto Neon;
- conectar Neon à Vercel;
- configurar secrets ou branches;
- executar migrations, restore ou deployment;
- marcar a decisão como `Implementing` ou `Effective`.

## 5. Critérios de aceite

- [x] estado interno alterado para `Approved`;
- [x] reviewer, approver, data, condições e evidência registrados;
- [x] versão documental incrementada;
- [x] registry e matriz atualizados;
- [x] validação documental verde;
- [ ] CI verde no HEAD final.

## 6. Rollback

Se a aprovação tiver sido interpretada incorretamente, a PR não deverá ser integrada. Depois da integração, qualquer reversão deverá seguir o fluxo de decisão do RB-GOV-002 e preservar o histórico.
