---
id: RB-CTX-123
title: Context Pack do RB-INC-123 — Preview Automático pela Integração Git Vercel
description: Delimita a comprovação segura do Preview automático originado pelo GitHub.
document_type: implementation-context
owner: Platform
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - platform
  - vercel
  - github
related_documents:
  - RB-INC-123
  - RB-ADR-017
  - RB-ADR-018
  - RB-CICD-001
  - RB-OBS-001
  - RB-INC-114
  - RB-INC-117
prerequisites:
  - RB-INC-117
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-123 — Preview Automático pela Integração Git Vercel

## Missão

Comprovar o fluxo GitHub para Vercel em Preview sem habilitar ou promover Production.

## Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible e `docs/README.md`;
3. RB-ADR-017 e RB-ADR-018;
4. RB-CICD-001 e RB-OBS-001;
5. RB-INC-114 e RB-INC-117.

## Caminhos permitidos

```text
docs/implementation/increments/rb-inc-123-git-preview-deployment.md
docs/implementation/context-packs/rb-inc-123-git-preview-deployment.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Estado externo permitido

- manter o vínculo GitHub já autorizado no projeto Vercel;
- observar deployments e logs;
- acessar Preview protegido por autenticação Vercel;
- não cadastrar variáveis Production;
- não promover ou criar Production Deployment.

## Restrições

- nunca imprimir valores de secrets, tokens ou connection strings;
- registrar apenas nomes de variáveis, destinos e IDs públicos;
- não reutilizar Preview como Production;
- não desabilitar Deployment Protection;
- não alterar código ou configuração da aplicação.

## Validação

Validar documentação e CI, comprovar a proveniência Git do Preview, executar health
checks autenticados e inspecionar erros de runtime após o smoke.
