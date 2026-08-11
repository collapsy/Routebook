---
id: RB-INC-117
title: Bootstrap Vercel e Neon para Preview
description: Provisiona e verifica o primeiro ambiente Preview com Vercel, Neon, migrations e health checks.
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
  - vercel
  - neon
  - preview
related_documents:
  - RB-ADR-017
  - RB-ADR-018
  - RB-DEL-001
  - RB-CICD-001
  - RB-OBS-001
  - RB-INC-113
  - RB-INC-114
  - RB-INC-116
prerequisites:
  - RB-INC-116
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-117 — Bootstrap Vercel e Neon para Preview

## 1. Objetivo

Criar e verificar o primeiro ambiente Preview operacional do RouteBook, preservando isolamento, secrets e portabilidade.

Issue: #272.

Branch: `codex/rb-inc-117-vercel-neon-preview`.

PR: #273.

## 2. Recursos

- Vercel team: `RND` / `rnd10`;
- Vercel project: `routebook` / `prj_o7utdxB9SymdCL56AOH57B64NRec`;
- Neon project: `routebook-preview` / `rapid-brook-02474789`;
- Neon branch: `main` / `br-divine-heart-ay8hpdo1`;
- database: `neondb`.
- Preview Deployment: `dpl_UMDTJft2qDM7Q9fekLBrHxeRnuWY`;
- Preview URL: `https://routebook-1mrq6i9hi-rnd10.vercel.app`.

IDs e URLs públicas podem ser registrados. Credenciais, tokens e valores de variáveis são proibidos na documentação e nos logs.

## 3. Escopo

- vincular projeto Vercel;
- provisionar Neon vazio para Preview;
- habilitar PostGIS;
- aplicar migrations por conexão direta;
- configurar runtime com conexão pooled;
- configurar secrets somente no ambiente Preview;
- resolver URL dinâmica do Better Auth por `VERCEL_URL` validada;
- executar Preview Deployment e smoke operacional.

## 4. Fora de escopo

- Production Deployment ou dados de produção;
- domínio customizado;
- dados pessoais reais;
- Redis, R2, Inngest ou IA;
- Neon Auth ou Data API;
- promoção do ADR para `Effective`.

## 5. Critérios de aceite

- [x] projetos Vercel e Neon criados e identificados;
- [x] PostGIS habilitado;
- [x] 24 tabelas públicas criadas pelas migrations versionadas;
- [x] `DATABASE_URL` e `BETTER_AUTH_SECRET` cadastradas como sensíveis somente em Preview;
- [x] URL dinâmica da Vercel validada antes de configurar Better Auth;
- [x] testes locais e CI verdes;
- [x] Preview Deployment pronto;
- [x] liveness, readiness e smoke operacional verdes;
- [x] logs sem erro crítico.

## 6. Evidências de validação

- teste focado de Better Auth: 5 testes aprovados;
- validação documental: aprovada com 8 avisos preexistentes;
- lint e typecheck do monorepo: aprovados;
- build local e build remoto Vercel: aprovados;
- CI integral da PR #273: aprovado no run `31512711349`, incluindo migrations,
  testes de componentes e domínio, smoke, build e 81 testes responsivos;
- health protegido: `/api/health/live` retornou `ok` e `/api/health/ready`
  retornou `ready`, com database `available`, por acesso autenticado da Vercel;
- erros de runtime na última hora após o smoke: nenhum encontrado;
- suíte integral local contra Neon: inconclusiva sob paralelismo por timeouts de 5
  segundos em testes PostgreSQL remotos; a validação canônica permanece o CI;
- smoke HTTP público: bloqueado pela Deployment Protection, como esperado; o mesmo
  contrato foi validado pelo bypass autenticado da Vercel.

O build remoto registrou aviso porque a imagem Vercel ofereceu Node 24.15.0 enquanto
o repositório requer Node 24.18.0 ou superior. O build concluiu, mas a diferença deve
ser acompanhada até a imagem 24.x da plataforma alcançar o mínimo declarado.

## 7. Rollback

Antes de qualquer dado real, remover o Preview Deployment, desvincular o projeto Vercel e excluir o projeto Neon conforme autorização específica. Exclusão é destrutiva e não será executada automaticamente como rollback desta entrega.
