---
id: RB-INC-152
title: Resposta sem Corpo na Promoção pela API da Vercel
description: Valida a promoção do staged Production pelo status HTTP documentado, aceitando sucesso 201 ou 202 sem exigir corpo JSON.
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
  - http
related_documents:
  - RB-CORE-0004
  - RB-CICD-001
  - RB-ADR-017
  - RB-INC-151
  - RB-CTX-152
prerequisites:
  - RB-INC-151
next_documents:
  - RB-INC-136
ai_context:
  priority: critical
  index: true
---

# RB-INC-152 — Resposta sem Corpo na Promoção pela API da Vercel

## 1. Resultado vertical

O `Production Release` considera a promoção aceita somente quando o endpoint oficial da Vercel retorna HTTP `201` ou `202`, conforme o contrato documentado de sucesso sem conteúdo. O corpo é descartado e não é mais interpretado como JSON.

O polling do SHA no domínio público e o smoke operacional continuam responsáveis por confirmar a conclusão efetiva da promoção.

## 2. Issue e branch

- Issue: `#353`.
- Branch: `codex/rb-inc-152-vercel-promote-no-content`.
- Base: `main` em `51ed13672153ddc03120e9d85f3038f00aaf248a`.
- Evidência: Production Release `#27`, run `31968581057`.

## 3. Problema observado

O run #27 confirmou zero migrations pendentes, verificou o staged `dpl_DTB1k9jXencdrtJhDRWW7v9p18ec`, aprovou release, liveness e readiness e enviou a request de promoção. O `curl` terminou com sucesso, mas `jq` retornou exit code 4 ao tentar interpretar a resposta vazia.

A documentação oficial da Vercel define `201` ou `202` sem conteúdo para esse endpoint. Depois da chamada, o domínio público passou a servir o SHA autorizado `51ed13672153ddc03120e9d85f3038f00aaf248a`, com liveness `ok`, readiness `ready` e banco disponível.

## 4. Contrato operacional

- `curl --fail --silent --show-error` continua obrigatório;
- o body enviado permanece `{}`;
- o response body é descartado;
- o status HTTP é capturado por `--write-out`;
- somente `201` ou `202` são aceitos;
- qualquer erro HTTP ou status inesperado falha fechado;
- token, headers e body nunca são impressos;
- verificação pública do SHA e smoke operacional permanecem inalterados.

## 5. Caminhos permitidos

```text
.github/workflows/production-release.yml
scripts/verify-vercel-staged-deployment.test.mjs
docs/implementation/increments/rb-inc-152-vercel-promote-no-content.md
docs/implementation/context-packs/rb-inc-152-vercel-promote-no-content.md
docs/registry.md
```

## 6. Critérios de aceite

- [ ] O response body da promoção não é interpretado como JSON.
- [ ] HTTP `201` e `202` são os únicos resultados aceitos.
- [ ] Erros HTTP e outros status interrompem o release.
- [ ] IDs governados, Bearer token e body `{}` permanecem obrigatórios.
- [ ] Segredos e response body não aparecem em logs.
- [ ] Verificação pública e smoke operacional permanecem após a promoção.
- [ ] Testes e CI passam no mesmo SHA.
- [ ] Merge e novo Production Release exigem autorizações separadas.

## 7. Fora de escopo

- repetir ou editar o run #27;
- promover manualmente qualquer deployment;
- alterar domínio, migrations, Provider, token ou aplicação;
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

**Falso sucesso por qualquer 2xx:** o workflow aceita explicitamente apenas os dois status documentados.

**Promoção assíncrona incompleta:** o verificador público continua fazendo polling do SHA por até dez minutos antes do smoke operacional.

**Exposição de resposta:** o corpo é enviado diretamente para `/dev/null`, sem armazenamento ou impressão.

## 10. Governança

- sem migration, novo Provider ou mudança de domínio;
- sem relaxamento de identidade do staged;
- merge somente mediante autorização humana explícita;
- nova operação em Production exige autorização e dispatch separados.

## 11. Definition of Done

O incremento fica pronto para revisão quando testes e validações oficiais estiverem verdes no mesmo SHA, a PR estiver vinculada à issue #353 e o diff permanecer no escopo permitido.
