---
id: RB-CTX-113
title: Context Pack do RB-INC-113 — Liveness e Readiness Operacionais
description: Contexto mínimo, caminhos permitidos e testes dos health checks provider-neutral da aplicação web.
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
  - health-checks
  - context-pack
related_documents:
  - RB-INC-113
  - RB-DEL-001
  - RB-OBS-001
  - RB-INFRA-001
  - RB-CICD-001
  - RB-OPS-001
prerequisites:
  - RB-INC-112
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-113 — Liveness e Readiness Operacionais

## Objetivo

Delimitar a primeira entrega de Operational Hardening sem escolher Provider ou plataforma de deployment.

## Documentos obrigatórios e seções aplicáveis

- RB-CORE-0004 — invariantes de segurança, privacidade e arquitetura;
- RB-DEL-001 — Fase 8, seções 86–90, e marco M7;
- RB-OBS-001 — Parte VIII, seções 61–68; anti-pattern 208; seção 217;
- RB-INFRA-001 — seções 44 e 56;
- RB-CICD-001 — seções 50–52;
- RB-OPS-001 — runbook RB-RUN-API-001, seções 58–64.

## Caminhos permitidos

- `apps/web/app/api/health/live/route.ts`;
- `apps/web/app/api/health/ready/route.ts`;
- testes sob `apps/web/app/api/health/`;
- `apps/web/lib/operational-health.ts`;
- `apps/web/lib/operational-health.test.ts`;
- documentos de implementação, registry e matriz do RB-INC-113.

## Contrato de liveness

- não consulta banco ou Provider;
- responde 200 enquanto o processo consegue atender HTTP;
- retorna estado fixo e sanitizado;
- não é prova de readiness.

## Contrato de readiness

- executa somente consulta PostgreSQL constante e sem dados de negócio;
- responde 200 quando a consulta conclui dentro do limite;
- responde 503 em rejeição, exceção ou timeout;
- identifica `database` apenas como `available` ou `unavailable`;
- nunca retorna a exceção original.

## Cache e segurança

Ambas as respostas devem usar `Cache-Control: no-store`. Não incluir URL de banco, ambiente, hostname, commit, stack trace, query, latência detalhada, Account ou identificador pessoal.

## Timeout

O timeout deve existir na fronteira de readiness, ser testável por injeção e permanecer curto. O teste não pode depender de espera real longa.

## Testes obrigatórios

- liveness 200 e sem dependência;
- readiness disponível;
- readiness rejeitada;
- readiness com exceção;
- readiness com timeout determinístico;
- headers e payloads públicos;
- formatação, documentação, lint, typecheck e build.

## Fora de escopo

- configuração de Vercel ou outro Provider;
- alteração ou aprovação de ADR;
- observabilidade distribuída;
- migrations, backup e restore;
- health de cache, fila, storage, mapas ou IA.
