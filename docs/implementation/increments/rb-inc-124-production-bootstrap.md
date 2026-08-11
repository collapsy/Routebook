---
id: RB-INC-124
title: Bootstrap Isolado de Production
description: Provisiona Neon e Vercel para Production, aplica o schema versionado e comprova o deploy automático da main.
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
  - neon
  - production
related_documents:
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

# RB-INC-124 — Bootstrap Isolado de Production

## 1. Objetivo

Provisionar o primeiro ambiente de Production do RouteBook com banco e credenciais
isolados de Preview, integrar a pilha aprovada na `main` e comprovar o deploy automático.

Issue: #286.

Branch: `codex/rb-inc-124-production-bootstrap`.

## 2. Estado inicial

- projeto Vercel `routebook` vinculado a `collapsy/Routebook`;
- `main` declarada como branch de produção;
- Preview automático saudável e validado pelo RB-INC-123;
- projeto Neon `routebook-preview` exclusivo de Preview;
- nenhuma variável de aplicação cadastrada no target Production.

## 3. Escopo

- criar projeto Neon exclusivo para Production;
- habilitar as extensões exigidas pelo schema e aplicar as migrations versionadas;
- cadastrar `DATABASE_URL` e `BETTER_AUTH_SECRET` como valores sensíveis somente em Production;
- integrar a pilha de PRs aprovada na `main`;
- observar o Production Deployment automático;
- executar liveness, readiness e inspeção de logs;
- registrar apenas IDs, nomes e resultados não secretos.

## 4. Fora de escopo

- migração destrutiva ou carga de dados reais;
- seed de produção;
- domínio customizado;
- mudança de aplicação, produto, domínio ou arquitetura;
- reutilização de banco ou credenciais de Preview.

## 5. Critérios de aceite

- [x] Production usa projeto Neon separado de Preview;
- [x] extensões e migrations do repositório estão aplicadas;
- [x] `DATABASE_URL` e `BETTER_AUTH_SECRET` são sensíveis e restritas a Production;
- [ ] a pilha aprovada está integrada na `main`;
- [ ] Production Deployment automático está pronto;
- [ ] liveness e readiness estão verdes, com banco disponível;
- [ ] não há erro crítico de runtime após o smoke;
- [ ] documentação e CI estão verdes.

## 6. Testes obrigatórios

- `pnpm docs:validate`;
- validação do schema e do histórico de migrations no Neon;
- auditoria dos nomes, targets e sensibilidade das variáveis Vercel;
- Documentation Validation e Engineering Validation;
- `GET /api/health/live` autenticado quando necessário;
- `GET /api/health/ready` autenticado quando necessário;
- inspeção de erros de runtime após o smoke.

## 7. Evidências

- Neon Production: projeto `routebook-production` / `bitter-queen-90455085`;
- branch principal: `main` / `br-rough-dew-axo9u82j`, estado `ready`;
- isolamento: projeto distinto de `routebook-preview` / `rapid-brook-02474789`;
- schema: 25 migrations registradas, 21 tabelas públicas e tabela de histórico Drizzle;
- banco vazio: 0 registros em `trips`; nenhum seed ou dado de Preview copiado;
- Vercel: `DATABASE_URL` e `BETTER_AUTH_SECRET` cadastradas como `Sensitive` somente
  para Production, preservando os valores separados de Preview;
- deploy, health, logs e CI: pendentes da integração da pilha na `main`.

Nenhum valor de secret, token ou connection string foi registrado.

## 8. Rollback

Reverter a documentação e o merge pelo fluxo Git. Desativar ou remover recursos de
Production é ação externa potencialmente destrutiva e exige aprovação específica.
