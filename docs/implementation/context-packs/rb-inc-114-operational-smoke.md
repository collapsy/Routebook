---
id: RB-CTX-114
title: Context Pack do RB-INC-114 — Smoke Operacional Pós-deployment
description: Contexto, limites e testes do smoke provider-neutral dos sinais operacionais.
document_type: implementation-context
owner: Engineering
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - operational-hardening
  - smoke-test
  - context-pack
related_documents:
  - RB-INC-114
  - RB-INC-113
  - RB-DEL-001
  - RB-CICD-001
  - RB-OBS-001
  - RB-INFRA-001
prerequisites:
  - RB-INC-113
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-114 — Smoke Operacional Pós-deployment

## Objetivo

Delimitar a verificação automática dos health checks após deployment, sem selecionar ou configurar Provider.

## Documentos obrigatórios

- RB-CORE-0004 — invariantes de segurança, privacidade e arquitetura;
- RB-DEL-001 — Fase 8, seções 86–90, e M7;
- RB-CICD-001 — seções 50–52;
- RB-OBS-001 — health checks e sanitização;
- RB-INFRA-001 — workloads HTTP;
- RB-INC-113 e RB-CTX-113 — contrato implementado.

## Caminhos permitidos

- `scripts/operational-smoke.mjs`;
- `scripts/operational-smoke.test.mjs`;
- `package.json`;
- documentos de implementação, registry e matriz do RB-INC-114.

## Contrato

- receber a base URL como argumento;
- aceitar somente HTTP ou HTTPS, sem credenciais, query ou fragmento;
- consultar `/api/health/live` e `/api/health/ready`;
- exigir HTTP 200, `Cache-Control: no-store` e payload mínimo do RB-INC-113;
- aplicar timeout individual;
- retornar exit code diferente de zero na primeira falha;
- registrar apenas o nome do check e um código de falha estável.

## Testes obrigatórios

- sucesso dos dois sinais e caminhos consultados;
- readiness indisponível sem vazamento de corpo;
- payload incompatível;
- timeout determinístico;
- rejeição de URL com informação sensível;
- formatação, documentação e Engineering Validation.

## Fora de escopo

- rede real nos testes;
- workflow ou secret de ambiente;
- execução de deployment;
- monitoramento sintético contínuo;
- endpoints autenticados ou dados de negócio.
