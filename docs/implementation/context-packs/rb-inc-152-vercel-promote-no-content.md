---
id: RB-CTX-152
title: Context Pack do RB-INC-152 — Resposta sem Corpo na Promoção pela API da Vercel
description: Delimita a correção do contrato de resposta da promoção, aceitando somente HTTP 201 ou 202 sem conteúdo.
document_type: implementation-context-pack
owner: Platform and Reliability
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - cicd
  - production
  - vercel
  - promotion
related_documents:
  - RB-INC-152
  - RB-CORE-0004
  - RB-CICD-001
  - RB-ADR-017
  - RB-INC-151
prerequisites:
  - RB-INC-151
next_documents:
  - RB-INC-136
ai_context:
  priority: critical
  index: true
---

# RB-CTX-152 — Context Pack do RB-INC-152

## 1. Missão

Corrigir somente a validação da resposta do endpoint de promoção da Vercel: descartar o corpo vazio, capturar o status HTTP e aceitar apenas `201` ou `202`.

## 2. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`;
5. `docs/architecture/adrs/rb-adr-017-vercel-as-initial-web-deployment-platform.md`;
6. `docs/implementation/increments/rb-inc-151-vercel-promote-api.md`;
7. `docs/implementation/context-packs/rb-inc-151-vercel-promote-api.md`;
8. `.github/workflows/production-release.yml`;
9. `scripts/verify-vercel-staged-deployment.test.mjs`;
10. `docs/implementation/increments/rb-inc-152-vercel-promote-no-content.md`;
11. este Context Pack.

## 3. Evidência

- candidate: `51ed13672153ddc03120e9d85f3038f00aaf248a`;
- run: `31968581057`;
- staged: `dpl_DTB1k9jXencdrtJhDRWW7v9p18ec`;
- staged URL: `https://routebook-dcwvct3bg-rnd10.vercel.app`;
- identidade e três health checks do staged: aprovados;
- migration ledger: zero pendências;
- request de promoção: `curl` concluído;
- falha: exit code 4 do `jq` sobre resposta vazia;
- contrato oficial: sucesso `201` ou `202`, sem conteúdo;
- domínio público após a chamada: SHA candidato, liveness `ok`, readiness `ready`, database `available`.

## 4. Invariantes

- A autorização humana explícita de Production continua obrigatória.
- O deployment ID vem do verificador imutável.
- Bearer token, project ID, team ID e body `{}` permanecem.
- Erro HTTP continua falhando pelo `curl --fail`.
- Somente `201` ou `202` são aceitos.
- Nenhum corpo, token ou header é impresso.
- O SHA público continua sendo verificado por polling.
- O smoke operacional continua obrigatório.
- Falha em qualquer verificação interrompe o release.

## 5. Caminhos permitidos

```text
.github/workflows/production-release.yml
scripts/verify-vercel-staged-deployment.test.mjs
docs/implementation/increments/rb-inc-152-vercel-promote-no-content.md
docs/implementation/context-packs/rb-inc-152-vercel-promote-no-content.md
docs/registry.md
```

## 6. Caminhos somente leitura

```text
scripts/verify-vercel-staged-deployment.mjs
scripts/verify-production-deployment.mjs
docs/implementation/increments/rb-inc-151-vercel-promote-api.md
docs/implementation/context-packs/rb-inc-151-vercel-promote-api.md
packages/database/**
apps/web/**
```

## 7. Proibido

- repetir o run #27;
- promover manualmente qualquer deployment;
- aceitar `200`, `204` ou qualquer status não documentado;
- interpretar corpo JSON na resposta de sucesso;
- imprimir token, headers ou response body;
- remover verificações de staged, SHA público ou smoke;
- alterar migration, schema, Provider ou domínio;
- integrar na `main` sem autorização humana explícita.

## 8. Implementação esperada

- adicionar `--output /dev/null`;
- adicionar `--write-out '%{http_code}'`;
- preservar `--request POST`, Bearer token e `--data '{}'`;
- aceitar `201 | 202` com `case`;
- falhar com mensagem segura para qualquer outro status;
- substituir os testes que exigiam JSON por asserts do contrato sem conteúdo.

## 9. Validação

```bash
pnpm test:vercel-staged-deployment
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Documentation Validation e Engineering Validation devem passar no mesmo SHA final.

## 10. Quando interromper

Interromper e escalar se a correção exigir status não documentado, relaxamento do staged, exposição de resposta, mudança de domínio, migration, novo Provider ou ação direta em Production.
