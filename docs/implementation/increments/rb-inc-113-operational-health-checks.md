---
id: RB-INC-113
title: Liveness e Readiness Operacionais da Aplicação Web
description: Introduz sinais HTTP mínimos e sanitizados para distinguir processo vivo de aplicação pronta com PostgreSQL disponível.
document_type: implementation-increment
owner: Platform
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
  - liveness
  - readiness
related_documents:
  - RB-DEL-001
  - RB-OBS-001
  - RB-INFRA-001
  - RB-CICD-001
  - RB-OPS-001
  - RB-INC-112
prerequisites:
  - RB-INC-112
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-113 — Liveness e Readiness Operacionais da Aplicação Web

## 1. Objetivo

Iniciar a Fase 8 / M7 com sinais HTTP mínimos e provider-neutral que distingam o processo web vivo da aplicação pronta para receber tráfego com sua dependência essencial disponível.

Issue: #264.

Branch: `codex/rb-inc-113-operational-health-checks`.

PR: #265.

## 2. Problema

A aplicação não expõe health checks. O runbook de API indisponível exige liveness e readiness, enquanto as estratégias de infraestrutura e CI/CD exigem sinais verificáveis para workloads HTTP e smoke pós-deployment.

## 3. Escopo

- `GET /api/health/live` sem consulta a dependência externa;
- `GET /api/health/ready` com consulta PostgreSQL superficial;
- timeout curto e resposta 503 para rejeição, falha ou demora do banco;
- payload JSON estável e sanitizado;
- respostas não armazenáveis em cache;
- testes do contrato operacional e HTTP.

## 4. Contrato

Liveness comprova somente que o processo consegue responder. Readiness comprova que a aplicação consegue acessar o PostgreSQL, dependência essencial das jornadas atuais.

Os payloads podem identificar apenas serviço, tipo do sinal, estado geral e estado sanitizado da dependência. Credenciais, URLs, stack traces, mensagens de exceção, queries, versões internas e dados pessoais não podem ser retornados.

## 5. Fora de escopo

- escolher ou configurar plataforma de deployment;
- aceitar o RB-ADR-017, que permanece `Proposed`;
- ativar Sentry, OpenTelemetry, dashboards ou alertas;
- backup, restore ou migration;
- verificar Providers não essenciais;
- alterar domínio, schema ou dados persistidos.

## 6. Critérios de aceite

- [x] liveness responde 200 sem consultar banco;
- [x] readiness responde 200 quando a consulta superficial passa;
- [x] readiness responde 503 quando o banco rejeita, falha ou excede o timeout;
- [x] respostas usam `Cache-Control: no-store`;
- [x] respostas não expõem detalhes internos ou sensíveis;
- [x] testes focados, lint, typecheck e build aprovados;
- [x] documentação, registry e matriz sincronizados;
- [ ] Engineering Validation aprovado no HEAD final.

## 7. Riscos e controles

- health check pesado: limitar a uma consulta constante;
- resposta pendurada: aplicar timeout curto na fronteira;
- vazamento: mapear qualquer falha para estado público fixo;
- falso positivo por cache: proibir armazenamento da resposta.

## 8. Rollback

Remover as duas rotas, o serviço operacional, os testes e esta documentação. Não existem migration, Provider, dado ou ação externa a reverter.

## 9. Próximo recorte esperado

Após os sinais básicos, a próxima lacuna de M7 deve ser escolhida entre smoke pós-deployment, baseline de logs sanitizados, backup/restore ou runbook executável, respeitando as decisões humanas ainda pendentes de Provider.

## 10. Evidências locais

- 8 testes focados aprovados;
- documentação validada com 266 IDs encontrados e registrados;
- lint e typecheck aprovados;
- build Next.js aprovado com configuração descartável equivalente ao CI;
- rotas classificadas como dinâmicas no artefato de build.
