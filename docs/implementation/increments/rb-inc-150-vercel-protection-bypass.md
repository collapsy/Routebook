---
id: RB-INC-150
title: Bypass de Proteção para Smoke do Staged Production
description: Autentica os health checks do staged Production Deployment com Protection Bypass for Automation, sem ampliar o token da Vercel nem expor o segredo.
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
  - deployment-protection
  - smoke-test
  - security
related_documents:
  - RB-CORE-0004
  - RB-CICD-001
  - RB-ADR-017
  - RB-INC-146
  - RB-INC-149
  - RB-CTX-150
prerequisites:
  - RB-INC-149
next_documents:
  - RB-INC-136
ai_context:
  priority: critical
  index: true
---

# RB-INC-150 — Bypass de Proteção para Smoke do Staged Production

## 1. Resultado vertical

O `Production Release` autentica os health checks do staged Production Deployment com o segredo **Protection Bypass for Automation** do projeto RouteBook. Os endpoints de release, liveness e readiness são consultados no `STAGED_URL` exato por `curl`, com o header `x-vercel-protection-bypass`, antes de qualquer avanço da branch de release ou promoção de tráfego.

A identidade imutável do deployment, o SHA candidato, a política de migrations, a promoção explícita, a verificação pública e o smoke pós-promoção permanecem inalterados.

## 2. Issue e branch

- Issue: `#349`.
- Branch: `codex/rb-inc-150-vercel-protection-bypass`.
- Base: `main` em `9231a7acdc278049f42faf366d935eeac289ea13`.
- Evidência: Production Release `#25`, run `31960658365`.

## 3. Problema observado

O run #25 validou o candidate, confirmou zero migrations pendentes e criou o staged Production Deployment `dpl_GdznZf94mVNuujUyfzC1Y4TYLvHw`. READY, projeto, target Production e SHA exato foram confirmados.

O passo `Smoke staged Production deployment` falhou fechado antes da promoção porque `vercel curl` tentou resolver internamente um bypass de Deployment Protection com o token de API restrito ao projeto e retornou `Error: User not found.`.

A branch `codex/production-release`, o domínio canônico e a promoção Vercel não foram alterados.

## 4. Contrato operacional

- `VERCEL_API_TOKEN` continua restrito às operações de deploy, inspeção e promoção.
- `VERCEL_PROTECTION_BYPASS_SECRET` existe somente no GitHub Environment `Production` e é usado apenas como valor do header de bypass.
- O segredo não é versionado, impresso, incluído em outputs ou registrado no Step Summary.
- `curl --fail --silent --show-error` consulta diretamente o locator imutável do staged, sem redirecionamento.
- Os três payloads continuam validados com `jq -e`; o endpoint de release deve identificar o SHA candidato exato.

## 5. Caminhos permitidos

```text
.github/workflows/production-release.yml
scripts/verify-vercel-staged-deployment.test.mjs
docs/implementation/increments/rb-inc-150-vercel-protection-bypass.md
docs/implementation/context-packs/rb-inc-150-vercel-protection-bypass.md
docs/registry.md
```

## 6. Critérios de aceite

- [ ] O job de Production recebe e exige `VERCEL_PROTECTION_BYPASS_SECRET`.
- [ ] A ausência do segredo interrompe o release antes de operações produtivas.
- [ ] Release, liveness e readiness são consultados no `STAGED_URL` exato.
- [ ] Cada request envia o header `x-vercel-protection-bypass`.
- [ ] Nenhuma request imprime o segredo ou segue redirect para outro host.
- [ ] O SHA exato e as validações JSON permanecem obrigatórios.
- [ ] `vercel curl` deixa de ser usado no smoke staged.
- [ ] Documentation Validation e Engineering Validation passam no mesmo SHA.
- [ ] Merge e nova promoção de Production permanecem decisões humanas separadas.

## 7. Fora de escopo

- executar nova Production Release;
- promover manualmente o staged do run #25;
- alterar token, domínio, Provider, aplicação, schema ou migration;
- desabilitar Deployment Protection;
- disponibilizar o bypass ao runtime da aplicação;
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

CI final:

- Documentation Validation;
- Engineering Validation no SHA final.

## 9. Riscos e mitigação

**Exposição do bypass:** o valor fica somente no GitHub Environment `Production`; o workflow referencia o secret, não seu conteúdo, e não habilita tracing do shell.

**Vazamento por redirect:** as chamadas não usam `--location`; qualquer resposta de redirecionamento falha em vez de reenviar o header.

**Bypass aplicado fora do artefato validado:** cada URL é derivada do `STAGED_URL` produzido e verificado imediatamente antes do smoke.

**Relaxamento do health:** as mesmas condições de release, liveness, readiness, banco disponível e SHA exato continuam exigidas por `jq -e`.

## 10. Governança

- sem migration;
- sem novo Provider ou domínio;
- secret configurado fora do repositório e nunca versionado;
- sem promoção automática;
- merge somente mediante autorização humana explícita;
- nova operação em Production exige dispatch e autorização separados.

## 11. Definition of Done

O incremento fica pronto para revisão quando os testes obrigatórios e o CI estiverem verdes no mesmo SHA, a PR estiver vinculada à issue #349 e a mudança permanecer limitada à autenticação do smoke staged. A integração na `main` e uma nova promoção produtiva não fazem parte da autorização de implementação.
