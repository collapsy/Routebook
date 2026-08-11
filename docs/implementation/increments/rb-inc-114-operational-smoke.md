---
id: RB-INC-114
title: Smoke Operacional Pós-deployment
description: Automatiza a validação provider-neutral dos sinais de liveness e readiness após uma implantação.
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
  - smoke-test
related_documents:
  - RB-DEL-001
  - RB-CICD-001
  - RB-OBS-001
  - RB-INFRA-001
  - RB-INC-113
prerequisites:
  - RB-INC-113
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-114 — Smoke Operacional Pós-deployment

## 1. Objetivo

Transformar os sinais HTTP do RB-INC-113 em uma verificação pós-deployment repetível, segura e independente da plataforma de hospedagem.

Issue: #266.

Branch: `codex/rb-inc-114-operational-smoke`.

PR: #267.

## 2. Escopo

- comando `pnpm smoke:operational -- <base-url>`;
- validação sequencial de liveness e readiness;
- status HTTP, política de cache e payload mínimo obrigatórios;
- timeout por requisição;
- falhas com códigos fixos, sem imprimir resposta ou URL;
- testes determinísticos sem rede externa.

## 3. Fora de escopo

- deployment ou escolha de Provider;
- workflow acoplado a ambiente específico;
- autenticação, Trip ou jornada de negócio;
- monitoramento contínuo, alertas e SLOs;
- alteração de domínio ou ADR.

## 4. Critérios de aceite

- [x] base URL é explícita e validada;
- [x] liveness e readiness exigem HTTP 200 e contrato esperado;
- [x] respostas precisam declarar `no-store`;
- [x] timeout produz falha determinística;
- [x] erros não incluem corpo, URL, credencial ou detalhe de rede;
- [x] testes cobrem sucesso, indisponibilidade, contrato inválido e timeout;
- [x] validações locais executadas e limitações de ambiente registradas;
- [ ] Documentation e Engineering Validation verdes no HEAD final.

## 5. Riscos e controles

- falso positivo: validar semântica mínima e não apenas HTTP 200;
- vazamento: emitir somente códigos definidos pelo script;
- processo pendurado: usar timeout em cada chamada;
- flakiness: injetar `fetch` e não acessar rede nos testes.

## 6. Rollback

Remover o script, seu teste, os comandos do package e esta documentação. Não há ação externa, dado ou infraestrutura a reverter.

## 7. Evidências locais

- 5 testes do smoke aprovados sem rede externa;
- 268 documentos encontrados e registrados, com 8 avisos preexistentes;
- lint, typecheck e build aprovados;
- suíte web: 173 testes aprovados e 2 testes PostgreSQL impossibilitados pela ausência do serviço local;
- Prettier e `git diff --check` aprovados.
