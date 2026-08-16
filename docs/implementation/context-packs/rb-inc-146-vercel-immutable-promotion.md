---
id: RB-CTX-146
title: Context Pack — RB-INC-146 Promoção Imutável de Staged Production Deployment
description: Contexto mínimo e limites para implementar criação, validação e promoção controlada de staged Production Deployment na Vercel.
document_type: implementation-context-pack
owner: Platform and Reliability
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - cicd
  - vercel
  - production
  - deployment
related_documents:
  - RB-INC-146
  - RB-CORE-0004
  - RB-CICD-001
  - RB-ADR-017
  - RB-ADR-019
  - RB-INC-145
prerequisites:
  - RB-INC-145
next_documents:
  - RB-INC-136
ai_context:
  priority: critical
  index: true
---

# RB-CTX-146 — Context Pack do RB-INC-146

## Objetivo

Implementar somente o mecanismo governado que cria um **Production Deployment staged** com configuração de Production, valida sua identidade imutável e o torna o único deployment elegível para promoção posterior ao domínio público.

A implementação deve separar explicitamente autorização de merge e autorização de Production: integrar o código não dispara promoção produtiva.

## Evidência de origem

Production Release #22 comprovou:

- candidate `184b6cd259c6ec23b4b2c7b0078614a7f46cd0fb` validado;
- zero migrations pendentes;
- release branch avançada ao candidate;
- Preview do candidate READY;
- nenhum novo `target=production` criado;
- 60 respostas 404 no endpoint público de release;
- release corretamente encerrado como failure.

## Documentos obrigatórios

1. `AGENTS.md`
2. `docs/core/routebook-bible.md` — RB-CORE-0004
3. `docs/README.md`
4. `docs/cicd/continuous-integration-delivery-and-release-strategy.md` — RB-CICD-001
5. `docs/architecture/adrs/rb-adr-017-vercel-as-initial-web-deployment-platform.md` — RB-ADR-017, decisão Approved
6. `docs/architecture/adrs/rb-adr-019-github-actions-for-continuous-integration-and-delivery-governance.md` — RB-ADR-019, decisão interna ainda Proposed; consultar como contexto, não como autoridade para ampliar permissões
7. `docs/implementation/increments/rb-inc-145-production-release-verification.md`
8. `docs/implementation/increments/rb-inc-146-vercel-immutable-promotion.md`

## Restrições canônicas relevantes

- GitHub continua fonte canônica do código e das referências aprovadas.
- Vercel continua Provider de deployment aprovado.
- Preview e Production permanecem ambientes separados.
- Secrets são separados por ambiente.
- Migrations não rodam no startup da aplicação.
- Promoção e rollback são baseados em deployments imutáveis.
- Não há mudança de domínio ou conceito de produto.
- Nenhum secret pode ser versionado ou logado.
- Autorização de merge não autoriza staged deployment, migration ou promoção de tráfego.

## Caminhos permitidos

```text
.github/workflows/engineering-validation.yml
.github/workflows/production-release.yml
.github/workflows/rb-inc-146-registry-helper.yml  # temporário; remover antes da PR final
scripts/verify-vercel-staged-deployment.mjs
scripts/verify-vercel-staged-deployment.test.mjs
package.json
docs/implementation/increments/rb-inc-146-vercel-immutable-promotion.md
docs/implementation/context-packs/rb-inc-146-vercel-immutable-promotion.md
docs/registry.md
```

## Estratégia técnica autorizada pelo incremento

- `Production Release` acionado somente por `workflow_dispatch`;
- SHA candidato obrigatório e exato;
- `confirm_production_promotion=true` obrigatório para executar o fluxo produtivo;
- Engineering Validation de push em `main` para o SHA informado deve existir e estar verde;
- Vercel CLI com versão fixada;
- `deploy --prod --skip-domain` para materializar staged Production Deployment;
- `VERCEL_API_TOKEN` somente via GitHub Environment `Production`;
- `VERCEL_PROJECT_ID` e `VERCEL_ORG_ID` como configuração não sensível;
- inspeção por Vercel REST API para validar metadata do deployment;
- health do staged deployment antes de `promote`;
- promoção pelo URL/ID exato validado;
- reutilização do verificador público por SHA do RB-INC-145;
- smoke operacional público após confirmação do SHA.

## Proibido

- autoexecutar Production a partir de `push`, `pull_request` ou `workflow_run`;
- promover Preview `target=null` diretamente;
- usar Preview DATABASE_URL/configuração no domínio público;
- usar `latest` ou seleção implícita de deployment;
- registrar token em log, output ou summary;
- usar `vercel@latest` no release;
- alterar migration/schema;
- mudar Provider;
- executar promoção real durante a PR;
- integrar na `main` sem aprovação humana explícita;
- manter o helper temporário de Registry no diff final.

## Testes

Comandos esperados no CI:

```text
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test:release-migration-policy
pnpm test:production-deployment-verification
pnpm test:vercel-staged-deployment
pnpm db:migrate
pnpm test
pnpm test:overture-place-normalizer
pnpm test:place-images
pnpm build
pnpm test:e2e
```

## Critérios de saída

- contrato staged validado por testes;
- workflow produtivo somente por dispatch explícito;
- workflow somente promove deployment explicitamente validado;
- deploy staged usa Production sem domínio;
- health staged antecede promoção;
- public SHA + smoke sucedem promoção;
- configuração do token documentada sem valor sensível;
- helper temporário removido;
- Documentation e Engineering Validation verdes no mesmo SHA;
- PR vinculada à #341 e mantida sem merge até autorização.