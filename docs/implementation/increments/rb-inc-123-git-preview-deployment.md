---
id: RB-INC-123
title: Preview Automático pela Integração Git Vercel
description: Comprova o fluxo GitHub para Preview Deployment automático na Vercel sem promover produção.
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
  - platform
  - vercel
  - github
  - preview
related_documents:
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

# RB-INC-123 — Preview Automático pela Integração Git Vercel

## 1. Objetivo

Comprovar que uma mudança originada no repositório Git canônico produz um Preview
Deployment automático e verificável na Vercel.

Issue: #284.

Branch: `codex/rb-inc-123-git-preview-deployment`.

PR: #285.

## 2. Estado inicial

- projeto Vercel: `routebook` / `prj_o7utdxB9SymdCL56AOH57B64NRec`;
- repositório Git: `collapsy/Routebook`;
- branch de produção declarada no vínculo: `main`;
- root directory: `apps/web`;
- `DATABASE_URL` e `BETTER_AUTH_SECRET` sensíveis disponíveis somente em Preview;
- nenhuma variável de aplicação cadastrada para Production.

Somente nomes, destinos e IDs não secretos podem ser registrados.

## 3. Escopo

- registrar o vínculo GitHub do projeto Vercel;
- produzir uma branch e PR exclusivamente documentais;
- observar o Preview Deployment criado automaticamente;
- executar liveness e readiness pelo acesso autenticado da Vercel;
- inspecionar status e erros do deployment;
- preservar a separação entre Preview e Production.

## 4. Fora de escopo

- Production Deployment ou promoção;
- banco, migrations ou secrets de produção;
- domínio customizado;
- alteração de produto, aplicação ou infraestrutura versionada;
- desabilitar Deployment Protection.

## 5. Critérios de aceite

- [x] projeto Vercel vinculado a `collapsy/Routebook`;
- [x] `main` declarada como branch de produção;
- [x] root directory preservado em `apps/web`;
- [x] variáveis sensíveis continuam restritas a Preview;
- [x] Preview Deployment criado automaticamente para a branch/PR;
- [x] liveness e readiness verdes no Preview automático;
- [x] deployment pronto e sem erro crítico de runtime;
- [x] documentação e CI verdes.

## 6. Testes obrigatórios

- `pnpm docs:validate`;
- Documentation Validation e Engineering Validation;
- inspeção do deployment e de sua proveniência Git;
- `GET /api/health/live` autenticado;
- `GET /api/health/ready` autenticado;
- inspeção de erros de runtime após o smoke.

## 7. Evidências

- PR: #285;
- commit validado: `4f5233ad0163bbc42e6acf0931d3b0b0c535cb18`;
- Preview automático: `dpl_64cSW7kr8TDPZWAbSNkNUW8DYsye`;
- URL imutável: `https://routebook-8i2dm4p4x-rnd10.vercel.app`;
- proveniência: branch `codex/rb-inc-123-git-preview-deployment`, PR #285 e commit
  `4f5233a` reconhecidos pela Vercel;
- liveness: HTTP 200, `status: ok` e `Cache-Control: no-store`;
- readiness: HTTP 200, `status: ready`, database `available` e
  `Cache-Control: no-store`;
- logs de erro após o smoke: nenhum encontrado;
- Documentation Validation: aprovado;
- Engineering Validation `31527703958`: 81 testes responsivos aprovados, sem
  flaky annotation.

## 8. Rollback

Reverter somente esta documentação. Desvincular o repositório é uma alteração externa
com impacto no fluxo de entrega e exige uma decisão explícita separada.
