---
id: RB-CTX-116
title: Context Pack do RB-INC-116 — Aprovação Formal do RB-ADR-018
description: Contexto de governança e limites para registrar a aprovação humana do ADR do Provider PostgreSQL.
document_type: implementation-context
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
  - context-pack
related_documents:
  - RB-INC-116
  - RB-ADR-018
  - RB-ADR-017
  - RB-GOV-001
  - RB-GOV-002
prerequisites:
  - RB-INC-115
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-116 — Aprovação Formal do RB-ADR-018

## Objetivo

Delimitar a transição documental do RB-ADR-018 de `Proposed` para `Approved` sem antecipar provisionamento ou ação externa.

## Documentos obrigatórios

- RB-CORE-0004 — decisões de Provider exigem aprovação humana;
- RB-GOV-001 — autoridade e governança de decisão;
- RB-GOV-002 — estados, aprovação e rastreabilidade de ADR;
- RB-ADR-017 — plataforma Vercel aprovada;
- RB-ADR-018 — decisão de Neon;
- RB-INC-115 — aprovação formal da plataforma de deployment.

## Caminhos permitidos

- `docs/architecture/adrs/rb-adr-018-neon-as-managed-postgresql-and-postgis-provider.md`;
- documentos de implementação, registry e matriz do RB-INC-116.

## Alterações permitidas

- estado interno `Proposed` para `Approved`;
- versão e data de atualização;
- registro de aprovação com responsável, data, condições e evidência;
- rastreabilidade do incremento.

## Testes obrigatórios

- `node scripts/validate-docs.mjs`;
- Prettier nos arquivos alterados;
- `git diff --check`;
- Documentation e Engineering Validation no HEAD final.

## Fora de escopo

- provisionamento do Neon;
- configuração da Vercel;
- mudança para `Implementing` ou `Effective`;
- alteração do conteúdo material, alternativas ou controles do ADR;
- migrations ou ações de produção.
