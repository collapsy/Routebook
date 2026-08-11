---
id: RB-INC-115
title: Aprovação Formal do RB-ADR-017
description: Registra a aprovação humana da Vercel como plataforma inicial de deployment web, sem criar infraestrutura externa.
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
  - vercel
related_documents:
  - RB-ADR-017
  - RB-GOV-001
  - RB-GOV-002
  - RB-INC-114
prerequisites:
  - RB-INC-114
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-115 — Aprovação Formal do RB-ADR-017

## 1. Objetivo

Registrar de forma versionada e rastreável a aprovação humana da Vercel como plataforma inicial de deployment da aplicação web.

Issue: #268.

Branch: `codex/rb-inc-115-approve-adr-017`.

PR: #269.

## 2. Decisão

O responsável humano e owner do projeto aprovou o prosseguimento após receber o link e a solicitação explícita de aprovação do RB-ADR-017. O estado interno da decisão passa de `Proposed` para `Approved`.

O frontmatter permanece `Published`, pois representa a publicação documental, não o estado arquitetural interno.

## 3. Condições preservadas

- implementação incremental;
- secrets separados por ambiente;
- Preview sem acesso a dados ou secrets de produção;
- migrations fora do startup;
- PostgreSQL e demais serviços desacoplados;
- portabilidade para outra plataforma preservada.

## 4. Fora de escopo

- criar projeto ou conta Vercel;
- configurar domínio, banco, secrets ou Providers;
- executar Preview ou Production Deployment;
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
