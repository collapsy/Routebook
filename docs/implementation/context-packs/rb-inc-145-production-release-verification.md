---
id: RB-CTX-145
title: Context Pack do RB-INC-145 — Verificação Efetiva do Production Deployment
description: Delimita contratos, caminhos, testes e restrições para provar o SHA efetivamente servido em Production após a promoção da referência de release.
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
  - production
  - deployment
  - verification
related_documents:
  - RB-INC-145
  - RB-CORE-0004
  - RB-CICD-001
  - RB-INFRA-001
  - RB-OPS-001
  - RB-ADR-017
  - RB-ADR-019
  - RB-INC-144
prerequisites:
  - RB-INC-144
next_documents:
  - RB-INC-136
ai_context:
  priority: critical
  index: true
---

# RB-CTX-145 — Verificação Efetiva do Production Deployment

## 1. Missão do executor

Corrigir o gap operacional da issue #339 sem substituir o mecanismo de deployment aprovado: após promover o candidate para `codex/production-release`, o workflow deve aguardar evidência de que o domínio público serve exatamente o SHA promovido e só então executar o smoke operacional e concluir o release.

## 2. Incremento

- ID: `RB-INC-145`
- Issue: `#339`
- Branch: `codex/rb-inc-145-production-release-verification`
- Base: `main` em `6fdcf19a9c81bbde281ead3d59fc794427973975`
- Increment: `docs/implementation/increments/rb-inc-145-production-release-verification.md`

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`;
5. `docs/infrastructure/infrastructure-environments-and-deployment-strategy.md`;
6. `docs/operations/runbooks-and-operational-procedures.md`;
7. `docs/architecture/adrs/rb-adr-017-vercel-as-initial-web-deployment-platform.md`;
8. `docs/architecture/adrs/rb-adr-019-github-actions-for-continuous-integration-and-delivery-governance.md`;
9. `docs/implementation/increments/rb-inc-144-contextual-decision-view.md`;
10. `.github/workflows/production-release.yml`;
11. `apps/web/lib/operational-health.ts`;
12. `apps/web/lib/operational-health.test.ts`;
13. `scripts/operational-smoke.mjs`;
14. `scripts/operational-smoke.test.mjs`;
15. `docs/implementation/increments/rb-inc-145-production-release-verification.md`;
16. este Context Pack.

## 4. Evidência do problema

Estado observado em 2026-08-15:

- `main`: `6fdcf19a9c81bbde281ead3d59fc794427973975`;
- `codex/production-release`: mesmo SHA;
- workflow `Production Release` #21: success;
- Preview do SHA `6fdcf19...`: READY;
- status Vercel no GitHub para `6fdcf19...`: failure por `build-rate-limit`;
- deployment Vercel `target=production`: ainda em `e92e2d7fc0b547055bc1917fd12f9c28dd5b08af`;
- domínio público operacional, porém sem o RB-INC-144.

Conclusão: promoção de ref e deployment efetivo são estados distintos e o workflow atual verifica apenas o primeiro.

## 5. Invariantes

- GitHub continua a fonte canônica de código e histórico.
- Vercel Git Integration continua responsável pelo deployment web.
- O workflow não deve adicionar deploy manual por Vercel CLI/API.
- O release só pode ser declarado concluído após deployment e verificação.
- SHA servido deve ser comparado por igualdade exata com o candidate imutável.
- Sinal de release não contém secret, sessão, dado pessoal ou conexão de banco.
- Provider failure não é sucesso degradado.
- Polling deve ter tentativas, intervalo e timeout limitados.
- Liveness/readiness existentes continuam a ser os sinais operacionais finais.

## 6. Contratos existentes

- `VERCEL_GIT_COMMIT_SHA` como metadado não secreto de build na Vercel;
- `/api/health/live` para liveness;
- `/api/health/ready` para readiness e banco;
- `operationalHealthResponse` para resposta sem cache;
- `scripts/operational-smoke.mjs` para verificação operacional;
- `codex/production-release` como referência protegida promovida pelo workflow;
- `Production` GitHub Environment para etapas sensíveis;
- Vercel Git Integration para observar push na referência aprovada.

## 7. Caminhos permitidos

```text
.github/workflows/production-release.yml
apps/web/app/api/health/release/route.ts
apps/web/lib/operational-health.ts
apps/web/lib/operational-health.test.ts
scripts/verify-production-deployment.mjs
scripts/verify-production-deployment.test.mjs
package.json
docs/implementation/increments/rb-inc-145-production-release-verification.md
docs/implementation/context-packs/rb-inc-145-production-release-verification.md
docs/registry.md
```

## 8. Caminhos somente leitura

```text
scripts/operational-smoke.mjs
scripts/operational-smoke.test.mjs
docs/cicd/**
docs/infrastructure/**
docs/operations/**
docs/architecture/adrs/rb-adr-017-*.md
docs/architecture/adrs/rb-adr-019-*.md
packages/database/**
```

A documentação canônica já exige deployment seguido de verificação; este incremento alinha a implementação e não altera a decisão arquitetural.

## 9. Caminhos proibidos

```text
packages/database/drizzle/**
.vercel/**
```

Também é proibido:

- criar ou alterar secret de Production;
- adicionar Vercel token;
- trocar plano/quota da Vercel;
- executar deployment manual;
- alterar banco de Production;
- alterar domínio ou regras de negócio.

## 10. Contrato de health/release

O endpoint deve:

- ser dinâmico;
- responder JSON;
- usar `Cache-Control: no-store`;
- publicar `commitSha` somente se `VERCEL_GIT_COMMIT_SHA` corresponder a `/^[0-9a-f]{40}$/i`;
- normalizar SHA válido para lowercase;
- retornar `status: identified` quando válido;
- retornar `status: unknown` e `commitSha: null` quando ausente/inválido;
- não consultar banco nem Providers.

## 11. Contrato do verificador

O verificador deve receber URL de release e SHA esperado.

Em cada tentativa:

1. requisitar JSON com timeout;
2. impedir cache com parâmetro de consulta e header apropriado;
3. registrar observação sanitizada;
4. concluir somente em HTTP 200 + contrato válido + SHA exato;
5. retentar estados transitórios enquanto houver tentativas.

Estados transitórios incluem:

- 404 enquanto o endpoint novo ainda não foi publicado;
- SHA válido diferente do candidate;
- status `unknown`;
- HTTP não 200;
- erro de rede/timeout;
- JSON ou contrato inválido.

Após a última tentativa sem match, retornar erro determinístico com última observação não sensível.

## 12. Integração no Production Release

Após a promoção da referência:

1. limpar a deploy key como já ocorre;
2. aguardar o domínio público servir o SHA candidate;
3. executar `pnpm smoke:operational` no mesmo domínio;
4. registrar no Step Summary:
   - candidate SHA;
   - release branch;
   - domínio verificado;
   - confirmação de SHA;
   - confirmação de liveness/readiness.

Se a Vercel não publicar o candidate dentro da janela, o job deve falhar. O workflow não deve disparar deployment alternativo para mascarar a falha.

## 13. Testes obrigatórios

Prioridade local/específica:

```bash
pnpm --filter @routebook/web test -- operational-health.test.ts
node --test scripts/verify-production-deployment.test.mjs
pnpm test:operational-smoke
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

CI final:

- Documentation Validation;
- Engineering Validation;
- E2E existente quando executado pelo gate.

A verificação real de Production somente ocorrerá depois de integração autorizada na `main`; este incremento não pode produzir essa evidência antes do merge porque a própria mudança ainda não estará na referência de release.

## 14. Critérios de aceite

- [ ] Health/release identificado e não sensível.
- [ ] Testes cobrem SHA válido, inválido e ausência.
- [ ] Polling é bounded e testável sem espera real.
- [ ] Estados transitórios são retentados.
- [ ] Mismatch persistente falha de forma determinística.
- [ ] Workflow aguarda SHA exato após a promoção.
- [ ] Workflow roda smoke após match.
- [ ] Workflow não termina verde sob stale Production.
- [ ] Nenhum secret novo, migration ou deployment manual.
- [ ] Registry atualizado.
- [ ] CI verde no SHA final.

## 15. Quando interromper

Interromper e escalar se a correção exigir:

- aceitar/modificar ADR;
- Vercel token ou mudança de Provider;
- alterar plano comercial/quota;
- deployment manual em Production;
- migration;
- rollback destrutivo;
- mudança na política de release além de exigir a evidência já definida pelos documentos canônicos.

## 16. Definition of Done

Código, workflow, testes e documentação satisfazem os critérios; CI está verde; PR está pronta para revisão. Merge permanece condicionado à autorização humana explícita.