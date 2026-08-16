---
id: RB-CTX-149
title: Context Pack do RB-INC-149 — Compatibilidade do Staged Production com Alias Padrão da Vercel
description: Delimita a correção que separa o domínio canônico de tráfego do alias padrão gerenciado pela Vercel durante a validação do staged Production Deployment.
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
related_documents:
  - RB-INC-149
  - RB-CORE-0004
  - RB-INC-146
prerequisites:
  - RB-INC-146
next_documents:
  - RB-INC-136
ai_context:
  priority: critical
  index: true
---

# RB-CTX-149 — Context Pack do RB-INC-149

## 1. Missão

Corrigir somente o falso bloqueio identificado no Production Release #24: aceitar o alias padrão `routebook-rnd10.vercel.app` no staged sem permitir que o domínio canônico `routebook-one.vercel.app` seja associado antes da promoção governada.

## 2. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/increments/rb-inc-146-vercel-immutable-promotion.md`;
5. `docs/implementation/context-packs/rb-inc-146-vercel-immutable-promotion.md`;
6. `.github/workflows/production-release.yml`;
7. `scripts/verify-vercel-staged-deployment.mjs`;
8. `scripts/verify-vercel-staged-deployment.test.mjs`;
9. `docs/implementation/increments/rb-inc-149-vercel-system-alias.md`;
10. este Context Pack.

## 3. Evidência

- candidate: `cfb5847a88648a5d7639d8aab0b378a0f30fc382`;
- run: `31958390566`;
- staged: `dpl_C4PJqPGQWNW6xdU1oadKW9FnBzQq`;
- estado: READY;
- target: Production;
- projectId e SHA: exatos;
- migration ledger: zero pendências;
- alias automático: `routebook-rnd10.vercel.app`;
- domínio canônico: permaneceu no release anterior;
- falha: `production_domain_already_assigned` antes de smoke/promoção.

## 4. Invariantes

- `routebook-one.vercel.app` é o domínio canônico protegido.
- O staged não pode possuir o domínio canônico antes da promoção.
- O alias padrão não substitui a URL imutável como locator do staged.
- O SHA deve corresponder exatamente ao candidate.
- READY, target Production e projectId correto continuam obrigatórios.
- Health staged deve passar antes da branch de release e da promoção.
- A promoção continua manual, explícita e auditável.
- Falha do Provider continua sendo falha do release.

## 5. Caminhos permitidos

```text
.github/workflows/production-release.yml
scripts/verify-vercel-staged-deployment.test.mjs
docs/implementation/increments/rb-inc-149-vercel-system-alias.md
docs/implementation/context-packs/rb-inc-149-vercel-system-alias.md
docs/registry.md
```

## 6. Caminhos somente leitura

```text
scripts/verify-vercel-staged-deployment.mjs
docs/implementation/increments/rb-inc-146-vercel-immutable-promotion.md
docs/implementation/context-packs/rb-inc-146-vercel-immutable-promotion.md
packages/database/**
```

## 7. Proibido

- retirar `routebook-one.vercel.app` da lista de domínios proibidos;
- aceitar qualquer target diferente de Production;
- afrouxar SHA, projectId, READY ou URL imutável;
- alterar secret, banco, migration, Provider ou domínio;
- promover manualmente o staged do run #24;
- integrar na `main` sem autorização humana explícita;
- disparar nova Production Release como efeito do merge.

## 8. Implementação esperada

- configurar `--forbidden-domains` somente com o domínio canônico;
- preservar o verificador genérico;
- adaptar a fixture base do teste à lista canônica;
- adicionar caso positivo explícito para o alias padrão isolado;
- manter o caso negativo do domínio canônico;
- fixar por teste estático a configuração do workflow.

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

Interromper e escalar se a correção exigir mudança no domínio canônico, remoção de verificação de identidade, migration, aprovação de alto risco, novo secret, mudança de Provider ou ação direta em Production.
