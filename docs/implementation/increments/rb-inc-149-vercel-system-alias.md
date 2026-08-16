---
id: RB-INC-149
title: Compatibilidade do Staged Production com Alias Padrão da Vercel
description: Distingue o domínio canônico de tráfego do alias padrão gerenciado pela Vercel para que o staged Production continue verificável e a promoção governada não seja bloqueada por um alias de plataforma.
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
  - staged-deployment
  - promotion
related_documents:
  - RB-CORE-0004
  - RB-INC-146
  - RB-CTX-149
prerequisites:
  - RB-INC-146
next_documents:
  - RB-INC-136
ai_context:
  priority: critical
  index: true
---

# RB-INC-149 — Compatibilidade do Staged Production com Alias Padrão da Vercel

## 1. Resultado vertical

O `Production Release` continua falhando fechado quando o domínio canônico `routebook-one.vercel.app` já recebeu tráfego antes da promoção, mas deixa de rejeitar um staged válido somente porque a Vercel atribuiu o alias padrão gerenciado `routebook-rnd10.vercel.app`.

READY, projeto, target Production, SHA exato, URL imutável, health staged, promoção explícita, verificação pública do SHA e smoke pós-promoção permanecem obrigatórios.

## 2. Issue e branch

- Issue: `#347`.
- Branch: `codex/rb-inc-149-vercel-system-alias`.
- Base: `main` em `cfb5847a88648a5d7639d8aab0b378a0f30fc382`.
- Evidência: Production Release `#24`, run `31958390566`.

## 3. Problema observado

O run real criou o deployment `dpl_C4PJqPGQWNW6xdU1oadKW9FnBzQq` com Vercel CLI `58.4.0` e `--prod --skip-domain`. O Provider confirmou build READY, target Production, projeto esperado e SHA candidato exato, mas também registrou:

```text
Aliased https://routebook-rnd10.vercel.app
```

O verificador tratava tanto `routebook-one.vercel.app` quanto `routebook-rnd10.vercel.app` como domínios canônicos proibidos e encerrou com `production_domain_already_assigned`. A branch de release, a promoção canônica e os smokes posteriores foram corretamente ignorados. O domínio canônico continuou servindo o SHA anterior.

## 4. Distinção operacional

- `routebook-one.vercel.app`: domínio canônico de tráfego do RouteBook; proibido no staged antes da promoção.
- `routebook-rnd10.vercel.app`: alias padrão gerenciado pela Vercel; sua atribuição automática não comprova promoção do domínio canônico e não invalida, sozinha, a identidade do artefato.
- URL única retornada pelo deploy: locator imutável usado para verificação e health staged.

Essa distinção não muda o domínio público canônico nem reduz as verificações do deployment.

## 5. Caminhos permitidos

```text
.github/workflows/production-release.yml
scripts/verify-vercel-staged-deployment.test.mjs
docs/implementation/increments/rb-inc-149-vercel-system-alias.md
docs/implementation/context-packs/rb-inc-149-vercel-system-alias.md
docs/registry.md
```

## 6. Critérios de aceite

- [ ] O workflow passa somente `routebook-one.vercel.app` como domínio proibido.
- [ ] O domínio canônico atribuído antes da promoção continua falhando fechado.
- [ ] O alias padrão isolado é aceito pelo contrato testado.
- [ ] READY, projectId, target, SHA e URL imutável continuam obrigatórios.
- [ ] O fluxo continua exclusivamente manual e exige confirmação humana explícita.
- [ ] Nenhuma migration, secret, Provider ou domínio novo é introduzido.
- [ ] Documentation Validation e Engineering Validation passam no mesmo SHA.
- [ ] Merge e nova promoção de Production permanecem decisões humanas separadas.

## 7. Fora de escopo

- promover manualmente o deployment do run que falhou;
- alterar o domínio canônico;
- permitir staged já associado a `routebook-one.vercel.app`;
- aprovar migration de alto risco;
- alterar lógica da aplicação ou banco;
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

**Alias padrão recebe o candidate antes do domínio canônico:** a diferença fica explícita e limitada ao domínio gerenciado pelo Provider; o domínio canônico continua bloqueado até health staged, promoção explícita e verificação pública.

**Relaxamento excessivo:** a mudança não ignora aliases em geral; somente retira o alias padrão da lista configurada como canônica. O verificador genérico e sua falha para qualquer domínio proibido permanecem intactos.

**Divergência de identidade:** projectId, target, READY e SHA exato continuam verificados diretamente na API da Vercel.

## 10. Governança

- sem migration;
- sem secret novo;
- sem promoção automática;
- merge somente mediante autorização humana explícita;
- nova operação em Production exige dispatch e autorização separados.

## 11. Definition of Done

O incremento fica pronto para revisão quando os testes obrigatórios e o CI estiverem verdes no mesmo SHA, a PR estiver vinculada à issue #347 e a alteração permanecer limitada à semântica do alias padrão observado. A integração na `main` e a nova promoção produtiva não fazem parte da autorização de implementação.
