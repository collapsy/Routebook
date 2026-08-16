---
id: RB-INC-146
title: Promoção Imutável de Staged Production Deployment na Vercel
description: Materializa um Production Deployment staged com configuração de Production, valida o artefato imutável e somente então o promove ao domínio público com evidência por SHA.
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
  - vercel
  - staged-deployment
  - promotion
  - reliability
related_documents:
  - RB-CORE-0004
  - RB-CICD-001
  - RB-INFRA-001
  - RB-OPS-001
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

# RB-INC-146 — Promoção Imutável de Staged Production Deployment na Vercel

## 1. Resultado vertical

O `Production Release` passa a materializar explicitamente um **Production Deployment staged** do SHA candidato, usando o ambiente Production da Vercel sem atribuir os domínios públicos. Esse deployment é validado antes da promoção e somente depois recebe tráfego, seguido pela verificação pública por SHA e pelo smoke operacional.

## 2. Problema

O RB-INC-145 tornou impossível concluir um release sem evidência do SHA efetivamente servido. A execução real do Production Release #22 mostrou que mover `codex/production-release` para um SHA já construído em `main` não materializou um novo `target=production` na Vercel.

O release terminou corretamente em failure depois de 60 respostas 404 no endpoint de identidade do release. O domínio público permaneceu no deployment anterior.

O Preview de `main` não pode ser promovido cegamente porque RouteBook separa configuração e dados de Preview e Production. A promoção precisa partir de um deployment construído como Production.

## 3. Base canônica

`RB-CICD-001` define a cadeia:

```text
Código → validação → build → artefato imutável → promoção → deployment → verificação → evidência
```

`RB-ADR-017` está Approved e determina:

- Vercel como plataforma inicial;
- secrets separados por ambiente;
- produção a partir de referências aprovadas;
- promoção e rollback baseados em deployments imutáveis;
- operação manual controlada permitida para promoção/rollback.

A Vercel oferece staged Production Deployments via `--prod --skip-domain`, permitindo construir com configuração Production sem apontar ainda os domínios públicos.

## 4. Fluxo alvo

```text
Engineering Validation verde em main
→ candidate SHA imutável
→ validar histórico e migration policy
→ aplicar migrations pendentes autorizadas
→ exigir zero pending migrations
→ criar Production Deployment staged (--prod --skip-domain)
→ verificar READY + projectId + target=production + SHA exato
→ validar release/liveness/readiness no staged deployment
→ avançar codex/production-release
→ promover deployment staged
→ verificar candidate SHA no domínio público
→ smoke público
→ evidência
```

## 5. Segurança

O GitHub Environment `Production` deverá fornecer `VERCEL_API_TOKEN` com o menor escopo possível para operar o projeto RouteBook.

O token:

- nunca é versionado;
- nunca é impresso;
- não integra o runtime da aplicação;
- não deve aparecer em outputs ou Step Summary;
- fica limitado ao job associado ao Environment `Production`.

IDs de projeto/time não são secrets e podem ser configuração explícita do workflow.

## 6. CLI e determinismo

A Vercel CLI deverá usar versão fixada. O incremento não utiliza `@latest` em release.

O deploy staged será criado com configuração equivalente a:

```text
vercel deploy --prod --skip-domain --yes
```

A promoção utilizará o deployment URL exato retornado pela criação staged.

Nenhuma operação deverá selecionar implicitamente “o último deployment”.

## 7. Contrato de verificação do staged deployment

Antes de promoção, a API da Vercel deve comprovar que o deployment:

- pertence ao `VERCEL_PROJECT_ID` esperado;
- está `READY`;
- possui `target=production`;
- carrega o Git SHA exato do candidate;
- não possui o domínio público de Production já atribuído;
- possui URL imutável válida.

Divergência ou metadata insuficiente falham fechado.

## 8. Caminhos permitidos

```text
.github/workflows/engineering-validation.yml
.github/workflows/production-release.yml
scripts/verify-vercel-staged-deployment.mjs
scripts/verify-vercel-staged-deployment.test.mjs
package.json
docs/implementation/increments/rb-inc-146-vercel-immutable-promotion.md
docs/implementation/context-packs/rb-inc-146-vercel-immutable-promotion.md
docs/registry.md
```

## 9. Fora de escopo

- trocar Provider;
- usar Preview DB/configuração em Production;
- apontar Production diretamente para `target=null`;
- migration/schema change;
- rollback automático;
- alterar domínio público;
- alterar funcionalidade do produto;
- declarar M8 concluído;
- executar promoção real durante a PR;
- merge sem autorização humana explícita.

## 10. Critérios de aceite

- [ ] Staged Production Deployment é criado do checkout exato do candidate.
- [ ] A Vercel CLI está fixada em versão explícita.
- [ ] O staged deployment não recebe domínio público antes da promoção.
- [ ] READY, projeto, target e SHA são validados por contrato testável.
- [ ] Divergências falham fechado.
- [ ] Staged release/liveness/readiness passam antes de promoção.
- [ ] Migrations continuam governadas pelo fluxo existente e devem estar zeradas antes do deploy staged.
- [ ] `codex/production-release` continua como referência auditável.
- [ ] Somente o deployment staged validado pode ser promovido.
- [ ] Após promoção, o domínio público deve servir o candidate SHA exato.
- [ ] Smoke público executa somente após confirmação do SHA.
- [ ] `VERCEL_API_TOKEN` não é exposto.
- [ ] Falha/quota/permissão da Vercel falha o release explicitamente.
- [ ] Nenhuma migration/schema change é adicionada.
- [ ] Documentation Validation e Engineering Validation passam no mesmo SHA.

## 11. Testes obrigatórios

- contrato válido de staged Production Deployment;
- SHA divergente;
- metadata Git conflitante;
- projeto divergente;
- Preview `target=null` rejeitado;
- deployment não READY rejeitado;
- domínio público prematuramente atribuído rejeitado;
- erro HTTP/JSON inválido sem body sensível nos detalhes;
- inputs inválidos e token ausente falham antes da rede;
- pipeline existente completo, incluindo build e Playwright/E2E.

## 12. Riscos e mitigação

**Build quota:** o deploy staged pode ser recusado pela Vercel. O release permanece failure e nenhum tráfego é alterado.

**Configuração de ambiente:** `--prod` é obrigatório para evitar Preview configuration em Production.

**Promoção errada:** URL/ID exatos do staged deployment são validados antes de `promote`; seleção por “latest” é proibida.

**Secret de automação:** token fica no GitHub Environment Production e não é propagado à aplicação.

**Deployment válido mas aplicação indisponível:** health staged precede a promoção; health público e smoke pós-promoção complementam a evidência.

## 13. Governança

- issue: `#341`;
- branch: `codex/rb-inc-146-vercel-immutable-promotion`;
- base: `main` em `184b6cd259c6ec23b4b2c7b0078614a7f46cd0fb`;
- sem migration;
- secret novo somente como configuração do GitHub Environment Production, nunca no repositório;
- promoção real e merge permanecem operações controladas.

## 14. Definition of Done

O incremento fica pronto para revisão quando documentação e implementação estiverem consistentes, os testes do contrato passarem, o pipeline completo estiver verde no mesmo SHA e a PR registrar explicitamente que a promoção real dependerá da configuração segura de `VERCEL_API_TOKEN` e de autorização para integração/Production.