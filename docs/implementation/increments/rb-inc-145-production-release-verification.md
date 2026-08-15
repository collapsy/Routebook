---
id: RB-INC-145
title: Verificação Efetiva do Production Deployment
description: Fecha a lacuna entre promoção da referência de release e deployment efetivamente servido em Production, exigindo evidência do SHA imutável e smoke operacional pós-deployment.
document_type: implementation-increment
owner: Platform and Reliability
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors:
  - RouteBook Team
tags:
  - implementation
  - cicd
  - production
  - deployment
  - reliability
  - verification
related_documents:
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

# RB-INC-145 — Verificação Efetiva do Production Deployment

## 1. Resultado vertical

O fluxo de Production Release deixa de considerar a promoção Git como evidência suficiente de publicação e passa a concluir com sucesso somente quando o domínio público de Production servir exatamente o SHA candidato promovido e os sinais operacionais essenciais responderem corretamente.

## 2. Problema

Após o merge do RB-INC-144, o workflow `Production Release` promoveu com sucesso o SHA `6fdcf19a9c81bbde281ead3d59fc794427973975` para `codex/production-release`, porém a Vercel recusou o novo build por `build-rate-limit`. O workflow terminou verde enquanto o domínio público permaneceu no SHA anterior `e92e2d7fc0b547055bc1917fd12f9c28dd5b08af`.

Essa divergência viola a cadeia canônica do RB-CICD-001:

```text
promoção → deployment → verificação → evidência
```

A correção deve tornar a diferença observável e impedir falso sucesso sem assumir responsabilidade de deployment que pertence à integração Git aprovada da Vercel.

## 3. Princípios

- promoção Git e Production Deployment são estados distintos;
- build ou Preview READY não prova publicação em Production;
- a referência efetivamente servida deve ser verificável por SHA imutável;
- o verificador deve ser bounded, determinístico e tolerar propagação assíncrona;
- falha, quota ou indisponibilidade do Provider deve produzir falha explícita, nunca sucesso presumido;
- nenhum secret adicional deve ser necessário para verificar o domínio público;
- a integração Git da Vercel continua responsável pelo deployment;
- o workflow continua responsável por migrations controladas e governança da promoção;
- smoke pós-deployment complementa a identidade do release com liveness/readiness.

## 4. Escopo

- expor um sinal público e não sensível de identidade do release contendo somente o SHA Git do build quando disponível;
- garantir `Cache-Control: no-store` para a identidade de release;
- criar verificador CLI testável que consulta o domínio público até observar o SHA esperado;
- tratar 404, SHA anterior, erro transitório de rede e resposta inválida como estados de espera dentro de uma janela limitada;
- falhar após esgotar a janela sem confirmação do candidate;
- executar smoke operacional somente após confirmar o SHA esperado;
- integrar a verificação ao `Production Release` depois da promoção da branch protegida;
- executar o teste do verificador explicitamente no `Engineering Validation`;
- produzir evidência legível no GitHub Actions Step Summary;
- cobrir contrato e polling com testes automatizados;
- registrar Increment e Context Pack.

## 5. Fora de escopo

- trocar a Vercel por outro Provider;
- substituir a Vercel Git Integration por Vercel CLI/API;
- adicionar `VERCEL_TOKEN` ou outro secret para deployment;
- executar deployment manual por esta implementação;
- alterar configuração comercial, quota ou plano da Vercel;
- migration ou alteração de schema;
- rollback automático;
- fechar a validação humana do M8;
- integrar na `main` sem autorização humana explícita.

## 6. Contrato de identidade do release

A aplicação deverá oferecer um endpoint de health operacional com resposta equivalente a:

```json
{
  "service": "routebook-web",
  "signal": "release",
  "status": "identified",
  "commitSha": "<sha-git-de-40-caracteres>"
}
```

Quando o runtime não possuir uma identidade Git válida, a resposta deve permanecer não sensível e explícita, com `status: "unknown"` e `commitSha: null`.

O SHA deve ser lido de metadado de ambiente fornecido pela plataforma de build, sem acesso a banco, sessão ou secret.

## 7. Caminhos permitidos

```text
.github/workflows/engineering-validation.yml
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

Qualquer caminho adicional exige justificativa no PR e atualização do Context Pack.

## 8. Critérios de aceite

- [ ] Existe identidade pública de release sem dado sensível e sem dependência de banco.
- [ ] Somente SHA Git válido de 40 caracteres é publicado como `commitSha`.
- [ ] A resposta de release proíbe cache.
- [ ] O verificador aceita URL e SHA esperado explicitamente.
- [ ] SHA antigo, 404, falha de rede e contrato inválido são retentados dentro de uma janela limitada.
- [ ] O verificador conclui somente quando o SHA servido é exatamente o candidate.
- [ ] Esgotar a janela sem match retorna falha determinística e evidência do último estado observado.
- [ ] `Production Release` não conclui verde apenas porque `codex/production-release` avançou.
- [ ] Após o SHA correto ser observado, liveness e readiness passam pelo smoke existente.
- [ ] O workflow registra candidate e resultado de verificação no Step Summary.
- [ ] O `Engineering Validation` executa explicitamente o teste do verificador.
- [ ] Nenhum Vercel token, secret novo, Provider novo ou migration é introduzido.
- [ ] Testes do contrato e polling passam.
- [ ] Documentation Validation e Engineering Validation passam no SHA final.

## 9. Estratégia de testes

### Health/release

- ambiente com SHA válido retorna `identified` e o SHA exato;
- valor ausente ou inválido retorna `unknown` sem vazar conteúdo arbitrário;
- resposta HTTP usa `no-store`.

### Verificador

- candidate na primeira tentativa: sucesso;
- SHA anterior seguido do candidate: sucesso;
- 404/erro transitório seguido do candidate: sucesso;
- contrato inválido seguido do candidate: sucesso;
- candidate nunca aparece: falha após número exato de tentativas;
- SHA esperado inválido e URL inválida: falha antes de rede.

### Pipeline

- format, docs, lint, typecheck, unit/integration, build e E2E existentes;
- `pnpm test:production-deployment-verification` como gate explícito do Engineering Validation;
- após integração futura, uma execução real do `Production Release` deve provar o SHA servido e smoke operacional.

## 10. Riscos e mitigação

**Propagação assíncrona da Vercel:** polling com limite explícito evita falso negativo imediato sem esperar indefinidamente.

**Cache intermediário:** endpoint e requests usam política `no-store` e consulta com cache-busting.

**Metadado ausente fora da Vercel:** contrato retorna `unknown`; isso é informação explícita e não inventa identidade.

**Provider rate-limited:** o workflow falha de forma auditável em vez de marcar release concluído.

**Acoplamento ao Provider:** somente a origem do SHA utiliza `VERCEL_GIT_COMMIT_SHA`; o verificador consome contrato HTTP próprio do RouteBook e não API proprietária.

## 11. Governança

- issue: `#339`;
- branch: `codex/rb-inc-145-production-release-verification`;
- base: `main` em `6fdcf19a9c81bbde281ead3d59fc794427973975`;
- sem migration;
- sem secret novo;
- sem deployment manual;
- sem mudança de domínio;
- merge somente mediante autorização humana explícita.

## 12. Definition of Done

O incremento estará pronto para revisão quando os critérios de aceite forem satisfeitos, os testes aplicáveis tiverem evidência real, Documentation Validation e Engineering Validation estiverem verdes no mesmo SHA e a PR documentar riscos e comportamento. A integração na `main` permanece uma decisão humana.