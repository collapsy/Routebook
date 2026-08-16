---
id: RB-CTX-150
title: Context Pack do RB-INC-150 — Bypass de Proteção para Smoke do Staged Production
description: Delimita a correção que usa Protection Bypass for Automation nos health checks do staged Production Deployment sem expor o segredo ou alterar a governança de promoção.
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
  - deployment-protection
  - security
related_documents:
  - RB-INC-150
  - RB-CORE-0004
  - RB-CICD-001
  - RB-ADR-017
  - RB-INC-146
  - RB-INC-149
prerequisites:
  - RB-INC-149
next_documents:
  - RB-INC-136
ai_context:
  priority: critical
  index: true
---

# RB-CTX-150 — Context Pack do RB-INC-150

## 1. Missão

Corrigir somente a autenticação dos health checks do staged Production Deployment: substituir `vercel curl` por requests diretas ao `STAGED_URL` exato, enviando o segredo de automação no header `x-vercel-protection-bypass`.

## 2. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`;
5. `docs/architecture/adrs/rb-adr-017-vercel-as-initial-web-deployment-platform.md`;
6. `docs/architecture/adrs/rb-adr-019-github-actions-for-continuous-integration-and-delivery-governance.md`, somente como contexto porque a decisão continua Proposed;
7. `docs/implementation/increments/rb-inc-146-vercel-immutable-promotion.md`;
8. `docs/implementation/context-packs/rb-inc-146-vercel-immutable-promotion.md`;
9. `docs/implementation/increments/rb-inc-149-vercel-system-alias.md`;
10. `docs/implementation/context-packs/rb-inc-149-vercel-system-alias.md`;
11. `.github/workflows/production-release.yml`;
12. `scripts/verify-vercel-staged-deployment.test.mjs`;
13. `docs/implementation/increments/rb-inc-150-vercel-protection-bypass.md`;
14. este Context Pack.

## 3. Evidência

- candidate: `9231a7acdc278049f42faf366d935eeac289ea13`;
- run: `31960658365`;
- staged: `dpl_GdznZf94mVNuujUyfzC1Y4TYLvHw`;
- URL: `https://routebook-jo01iwae5-rnd10.vercel.app`;
- estado: READY;
- target: Production;
- projectId e SHA: exatos;
- migration ledger: zero pendências;
- falha: `Error: User not found.` no primeiro `vercel curl`;
- branch de release, domínio canônico e promoção: não alterados.

## 4. Invariantes

- Deployment Protection permanece habilitada.
- O bypass é limitado ao projeto RouteBook e ao job protegido pelo Environment `Production`.
- O valor do bypass nunca aparece em arquivos, logs, outputs ou resumo.
- O smoke usa somente o `STAGED_URL` produzido e verificado no mesmo run.
- Requests não seguem redirect com o header sensível.
- Release exige o SHA candidato exato.
- Liveness, readiness e dependência de banco continuam obrigatórios.
- A branch de release só avança após o smoke staged.
- A promoção continua manual, explícita e auditável.
- Falha de request, autenticação ou JSON continua sendo falha do release.

## 5. Caminhos permitidos

```text
.github/workflows/production-release.yml
scripts/verify-vercel-staged-deployment.test.mjs
docs/implementation/increments/rb-inc-150-vercel-protection-bypass.md
docs/implementation/context-packs/rb-inc-150-vercel-protection-bypass.md
docs/registry.md
```

## 6. Caminhos somente leitura

```text
scripts/verify-vercel-staged-deployment.mjs
scripts/verify-production-deployment.mjs
docs/implementation/increments/rb-inc-146-vercel-immutable-promotion.md
docs/implementation/context-packs/rb-inc-146-vercel-immutable-promotion.md
docs/implementation/increments/rb-inc-149-vercel-system-alias.md
docs/implementation/context-packs/rb-inc-149-vercel-system-alias.md
packages/database/**
apps/web/**
```

## 7. Proibido

- versionar, imprimir ou resumir o valor do bypass;
- desabilitar Vercel Authentication ou Deployment Protection;
- expor o bypass como variável do runtime da aplicação;
- usar `--location` ou reenviar o header a outro host;
- remover validações de SHA, READY, target, projectId ou domínio canônico;
- alterar migration, schema, Provider ou domínio;
- avançar a branch de release antes do smoke;
- promover o staged do run #25;
- integrar na `main` sem autorização humana explícita;
- disparar nova Production Release como efeito do merge.

## 8. Implementação esperada

- declarar `VERCEL_PROTECTION_BYPASS_SECRET` a partir de `secrets` no job de Production;
- falhar fechado quando o segredo estiver ausente;
- chamar os três endpoints com `curl --fail --silent --show-error`;
- enviar `x-vercel-protection-bypass` em cada request;
- preservar as validações `jq -e` atuais;
- adicionar teste estático para secret, header, URLs exatas e ausência de `vercel curl`.

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

O CI final precisa demonstrar Documentation Validation e Engineering Validation verdes no mesmo SHA.

## 10. Quando interromper

Interromper e escalar se a correção exigir remoção da proteção, mudança de escopo do secret, redirect autenticado, relaxamento de identidade, migration, novo Provider, alteração de domínio ou ação direta em Production.
