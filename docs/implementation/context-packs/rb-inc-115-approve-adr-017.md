---
id: RB-CTX-115
title: Context Pack do RB-INC-115 — Aprovação Formal do RB-ADR-017
description: Contexto de governança e limites para registrar a aprovação humana do ADR de deployment.
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
  - RB-INC-115
  - RB-ADR-017
  - RB-GOV-001
  - RB-GOV-002
prerequisites:
  - RB-INC-114
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-115 — Aprovação Formal do RB-ADR-017

## Objetivo

Delimitar a transição documental do RB-ADR-017 de `Proposed` para `Approved` sem antecipar implementação ou ação externa.

## Documentos obrigatórios

- RB-CORE-0004 — decisões arquiteturais exigem aprovação humana;
- RB-GOV-001 — autoridade e governança de decisão;
- RB-GOV-002 — estados, aprovação e rastreabilidade de ADR;
- RB-ADR-017 — decisão de plataforma;
- RB-INC-114 — última entrega provider-neutral antes da decisão.

## Caminhos permitidos

- `docs/architecture/adrs/rb-adr-017-vercel-as-initial-web-deployment-platform.md`;
- documentos de implementação, registry e matriz do RB-INC-115.

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

- configuração da Vercel;
- mudança para `Implementing` ou `Effective`;
- alteração do conteúdo material, alternativas ou controles do ADR;
- ações de produção.
