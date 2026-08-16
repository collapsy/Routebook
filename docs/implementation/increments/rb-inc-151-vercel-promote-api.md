---
id: RB-INC-151
title: Promoção do Staged Production pela API Oficial da Vercel
description: Promove o staged Production Deployment já verificado pelo endpoint oficial da Vercel, sem depender do lookup de usuário do Vercel CLI.
document_type: implementation-increment
owner: Platform and Reliability
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors:
  - RouteBook Team
tags:
  - implementation
  - cicd
  - production
  - vercel
  - promotion
  - security
related_documents:
  - RB-CORE-0004
  - RB-CICD-001
  - RB-ADR-017
  - RB-INC-146
  - RB-INC-150
  - RB-CTX-151
prerequisites:
  - RB-INC-150
next_documents:
  - RB-INC-136
ai_context:
  priority: critical
  index: true
---

# RB-INC-151 — Promoção do Staged Production pela API Oficial da Vercel

## 1. Resultado vertical

O `Production Release` promove pela API oficial da Vercel o deployment staged cuja identidade já foi validada no mesmo job. O verificador publica o `deployment_id` e a `deployment_url` no `GITHUB_OUTPUT`; a promoção usa somente esse ID validado, o project ID e o team ID governados pelo workflow.

As validações de candidato, migrations, staged deployment, smoke protegido, branch de release, verificação pública e smoke operacional permanecem obrigatórias.

## 2. Issue e branch

- Issue: `#351`.
- Branch: `codex/rb-inc-151-vercel-promote-api`.
- Base: `main` em `9a5fc5a432fca06372ccf2562713ccbe53acb195`.
- Evidência: Production Release `#26`, run `31964673041`.

## 3. Problema observado

O run #26 confirmou zero migrations pendentes, criou o staged `dpl_FHwLEnj4VxajkkDwnPiXgyianoDJ` e aprovou identidade, SHA, estado READY, target Production, release, liveness e readiness. A branch `codex/production-release` avançou para o candidato aprovado.

A etapa `vercel promote` falhou com `User not found. (404)` porque o CLI executou um lookup de usuário incompatível com o token project-scoped. O domínio canônico não foi alterado e as verificações públicas foram puladas.

## 4. Contrato operacional

- o deployment ID é produzido somente após validação de projeto, SHA, READY, target e aliases;
- o verificador grava outputs por append no arquivo fornecido pelo GitHub Actions;
- a promoção usa `POST /v10/projects/{projectId}/promote/{deploymentId}?teamId={teamId}`;
- a request usa Bearer token, `Content-Type: application/json` e body `{}`;
- a resposta deve conter `projectId` e `deploymentId` exatos;
- nenhum token ou response body é impresso;
- falha HTTP ou incompatibilidade da resposta interrompe o release.

## 5. Caminhos permitidos

```text
.github/workflows/production-release.yml
scripts/verify-vercel-staged-deployment.mjs
scripts/verify-vercel-staged-deployment.test.mjs
docs/implementation/increments/rb-inc-151-vercel-promote-api.md
docs/implementation/context-packs/rb-inc-151-vercel-promote-api.md
docs/registry.md
```

## 6. Critérios de aceite

- [ ] O verificador publica `deployment_id` e `deployment_url` no `GITHUB_OUTPUT`.
- [ ] Quebras de linha são rejeitadas nos outputs.
- [ ] A promoção usa o endpoint oficial e o ID validado.
- [ ] Project ID e deployment ID retornados são validados.
- [ ] `vercel promote` deixa de ser usado.
- [ ] Segredos não aparecem em outputs, logs ou documentação.
- [ ] Testes obrigatórios e CI passam no mesmo SHA.
- [ ] Merge e novo Production Release permanecem decisões humanas separadas.

## 7. Fora de escopo

- promover manualmente o staged do run #26;
- executar nova Production Release;
- alterar domínio, Provider, token, aplicação, schema ou migration;
- concluir M8.

## 8. Testes obrigatórios

```bash
pnpm test:vercel-staged-deployment
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## 9. Riscos e mitigação

**Promoção do deployment errado:** o ID vem do verificador que confirmou o artefato imutável, em vez de ser reextraído do URL.

**Injeção em outputs:** deployment ID e URL são validados e valores com quebra de linha são rejeitados.

**Resposta inesperada:** `curl --fail` exige sucesso HTTP e `jq -e` exige os IDs exatos antes das verificações públicas.

**Exposição de token:** tracing permanece desabilitado e nem headers nem payloads são impressos.

## 10. Governança

- sem migration, novo Provider ou mudança de domínio;
- sem promoção automática fora do dispatch humano;
- merge somente mediante autorização humana explícita;
- nova operação em Production exige autorização e dispatch separados.

## 11. Definition of Done

O incremento fica pronto para revisão quando os testes e os dois workflows de validação estiverem verdes no mesmo SHA, a PR estiver vinculada à issue #351 e o diff permanecer no escopo permitido. Integração na `main` e promoção produtiva não pertencem à autorização de implementação.
