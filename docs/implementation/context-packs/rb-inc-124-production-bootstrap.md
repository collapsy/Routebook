---
id: RB-CTX-124
title: Context Pack do RB-INC-124 — Bootstrap Isolado de Production
description: Delimita o provisionamento seguro e verificável do primeiro ambiente de Production.
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
  - neon
  - production
related_documents:
  - RB-INC-124
  - RB-ADR-017
  - RB-ADR-018
  - RB-CICD-001
  - RB-OBS-001
  - RB-INC-114
  - RB-INC-117
  - RB-INC-123
prerequisites:
  - RB-INC-123
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-124 — Bootstrap Isolado de Production

## Missão

Provisionar e comprovar Production sem compartilhar banco ou credenciais com Preview.

## Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible e `docs/README.md`;
3. RB-ADR-017 e RB-ADR-018;
4. RB-CICD-001 e RB-OBS-001;
5. RB-INC-114, RB-INC-117 e RB-INC-123.

## Caminhos permitidos

```text
docs/implementation/increments/rb-inc-124-production-bootstrap.md
docs/implementation/context-packs/rb-inc-124-production-bootstrap.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Estado externo permitido

- criar um projeto Neon vazio e exclusivo para Production;
- aplicar extensões e migrations não destrutivas do repositório;
- cadastrar secrets sensíveis no target Production da Vercel;
- integrar as PRs aprovadas e observar o deployment automático da `main`;
- executar health checks e consultar logs.

## Restrições

- nunca imprimir, registrar ou versionar secrets, tokens ou connection strings;
- não copiar dados de Preview para Production;
- não executar seed ou migração destrutiva;
- não alterar código ou configuração versionada da aplicação;
- não remover recursos externos durante rollback sem nova aprovação.

## Validação

Validar documentação, schema e CI; auditar o isolamento das variáveis; comprovar a
proveniência Git do Production Deployment; executar health checks e inspecionar erros.
