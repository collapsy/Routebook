---
id: RB-CTX-151
title: Context Pack do RB-INC-151 — Promoção do Staged Production pela API Oficial da Vercel
description: Delimita a troca do Vercel CLI pelo endpoint oficial de promoção, usando a identidade imutável validada no mesmo Production Release.
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
  - RB-INC-151
  - RB-CORE-0004
  - RB-CICD-001
  - RB-ADR-017
  - RB-INC-146
  - RB-INC-150
prerequisites:
  - RB-INC-150
next_documents:
  - RB-INC-136
ai_context:
  priority: critical
  index: true
---

# RB-CTX-151 — Context Pack do RB-INC-151

## 1. Missão

Substituir somente `vercel promote` pelo endpoint oficial de promoção da Vercel, vinculando a request ao deployment ID que o verificador de identidade aprovou no mesmo job.

## 2. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`;
5. `docs/architecture/adrs/rb-adr-017-vercel-as-initial-web-deployment-platform.md`;
6. `docs/implementation/increments/rb-inc-146-vercel-immutable-promotion.md`;
7. `docs/implementation/context-packs/rb-inc-146-vercel-immutable-promotion.md`;
8. `docs/implementation/increments/rb-inc-150-vercel-protection-bypass.md`;
9. `docs/implementation/context-packs/rb-inc-150-vercel-protection-bypass.md`;
10. `.github/workflows/production-release.yml`;
11. `scripts/verify-vercel-staged-deployment.mjs`;
12. `scripts/verify-vercel-staged-deployment.test.mjs`;
13. `docs/implementation/increments/rb-inc-151-vercel-promote-api.md`;
14. este Context Pack.

## 3. Evidência

- candidate: `9a5fc5a432fca06372ccf2562713ccbe53acb195`;
- run: `31964673041`;
- staged: `dpl_FHwLEnj4VxajkkDwnPiXgyianoDJ`;
- URL: `https://routebook-4kxc9wc8j-rnd10.vercel.app`;
- estado: READY;
- target: Production;
- projectId, SHA e smoke staged: aprovados;
- migration ledger: zero pendências;
- branch de release: avançada para o candidato;
- falha: `Error: User not found. (404)` em `vercel promote`;
- domínio canônico: não alterado.

## 4. Invariantes

- A autorização humana explícita de Production continua obrigatória.
- O ID promovido é o mesmo aprovado pelo verificador.
- Projeto, SHA, READY, target e ausência do domínio canônico continuam obrigatórios.
- O smoke staged protegido ocorre antes do avanço da branch e da promoção.
- A API usa somente IDs governados e o token do Environment `Production`.
- O token nunca aparece em outputs, logs ou resumo.
- A resposta de promoção precisa corresponder ao projeto e deployment exatos.
- Verificação pública e smoke operacional continuam obrigatórios.
- Falha de rede, HTTP, JSON ou contrato interrompe o release.

## 5. Caminhos permitidos

```text
.github/workflows/production-release.yml
scripts/verify-vercel-staged-deployment.mjs
scripts/verify-vercel-staged-deployment.test.mjs
docs/implementation/increments/rb-inc-151-vercel-promote-api.md
docs/implementation/context-packs/rb-inc-151-vercel-promote-api.md
docs/registry.md
```

## 6. Caminhos somente leitura

```text
scripts/verify-production-deployment.mjs
docs/implementation/increments/rb-inc-146-vercel-immutable-promotion.md
docs/implementation/context-packs/rb-inc-146-vercel-immutable-promotion.md
docs/implementation/increments/rb-inc-150-vercel-protection-bypass.md
docs/implementation/context-packs/rb-inc-150-vercel-protection-bypass.md
packages/database/**
apps/web/**
```

## 7. Proibido

- promover o staged do run #26;
- disparar Production como efeito da implementação ou do merge;
- obter o deployment ID de fonte não validada;
- imprimir token, headers ou response body;
- remover verificações de identidade, SHA, READY, target ou smoke;
- alterar migration, schema, Provider ou domínio;
- integrar na `main` sem autorização humana explícita.

## 8. Implementação esperada

- aceitar `--github-output` no verificador;
- gravar `deployment_id` e `deployment_url` somente após sucesso;
- rejeitar outputs com quebra de linha;
- usar `curl --fail --silent --show-error --request POST`;
- enviar Bearer token, JSON e body vazio;
- validar `projectId` e `deploymentId` da resposta com `jq -e`;
- cobrir o contrato com testes unitários e estáticos.

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

Interromper e escalar se a correção exigir permissão além do token project-scoped, promoção manual, relaxamento de identidade, mudança de domínio, migration, novo Provider ou ação direta em Production.
