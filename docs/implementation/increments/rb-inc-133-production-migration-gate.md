---
id: RB-INC-133
title: Gate de Migration antes da Promoção de Production
description: Separa integração, migration e promoção para impedir código dependente de schema antes do banco em Production.
document_type: implementation-increment
owner: Platform and Delivery
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, cicd, production, migrations, vercel, neon]
related_documents: [RB-CORE-0004, RB-CICD-001, RB-DATA-002, RB-ADR-006, RB-ADR-017, RB-ADR-018, RB-ADR-019, RB-INC-124, RB-INC-132]
prerequisites: [RB-INC-124, RB-INC-132]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-133 — Gate de Migration antes da Promoção de Production

## 1. Objetivo

Eliminar a janela em que a integração Git da Vercel pode promover código de `main`
antes da migration da qual esse código depende.

Issue: #308.

Branch: `codex/rb-inc-133-production-migration-gate`.

## 2. Problema

O RB-INC-132 expôs um race real: `places.price_range` foi consultado em Production
antes de a migration `0025_add_place_price_range` existir no banco. O CI validava
migrations apenas em PostgreSQL efêmero, enquanto a Vercel promovia `main`
automaticamente para Production.

A correção emergencial deixou ainda uma diferença operacional relevante: o schema de
Production contém a alteração da 0025, mas o ledger `drizzle.__drizzle_migrations`
permanece registrado até a 0024. O novo pipeline deve detectar esse estado e nunca
reaplicar silenciosamente uma migration classificada como de alto risco.

## 3. Escopo

- criar referência separada `codex/production-release` para promoção da Vercel;
- disparar release somente após Engineering Validation verde em `main`;
- fixar cada release em SHA imutável;
- impedir edição, remoção ou reordenação de migrations históricas;
- consultar o ledger real de Production sem registrar credenciais;
- classificar todas as migrations pendentes no banco, inclusive drift anterior ao diff;
- aplicar automaticamente somente migrations classificadas como seguras;
- exigir `workflow_dispatch` explícito para migrations destrutivas, DML ou de maior risco;
- executar `pnpm db:migrate` com concorrência exclusiva;
- verificar que nenhuma migration permaneceu pendente antes de avançar a referência de release;
- falhar fechado quando secret, ledger, ancestry, CI ou schema não puderem ser comprovados.

## 4. Fora de escopo

- alterar a política de acesso de Production da issue #305;
- alterar Provider de banco, hosting ou ORM;
- versionar ou imprimir `DATABASE_URL` ou qualquer secret;
- executar migration destrutiva automaticamente;
- reescrever migrations históricas;
- corrigir manualmente o ledger de Production neste incremento sem aprovação explícita.

## 5. Contrato de promoção

```text
main
  -> Engineering Validation verde no SHA
  -> validação append-only das migrations
  -> leitura do ledger de Production
  -> classificação de todas as migrations pendentes
  -> migration segura OU aprovação manual explícita para alto risco
  -> pnpm db:migrate
  -> ledger sem pendências
  -> fast-forward de codex/production-release para o SHA
  -> Vercel Production acompanha exclusivamente codex/production-release
```

A referência de release nunca pode avançar antes do schema. Um erro após a migration e
antes do `git push` mantém o código anterior em Production, preservando compatibilidade
pela política `expand-contract`.

## 6. Critérios de aceite

- [ ] `main` deixa de ser a Production Branch da Vercel antes do merge deste incremento;
- [ ] `codex/production-release` existe e começa no último SHA produtivo conhecido;
- [ ] release automático só aceita SHA validado de `main` e avanço fast-forward;
- [ ] migrations históricas são append-only e alterações retroativas falham;
- [ ] pipeline usa ledger real para localizar migrations pendentes;
- [ ] migrations de alto risco falham no automático e exigem despacho manual explícito;
- [ ] migration é aplicada antes da referência de release avançar;
- [ ] promoção só ocorre com zero migrations pendentes após o migrator;
- [ ] conexão direta de Production vem exclusivamente de GitHub Environment secret;
- [ ] política e leitura de ledger possuem testes automatizados;
- [ ] Engineering Validation e Documentation Validation passam no mesmo SHA da PR.

## 7. Configuração operacional requerida

O workflow espera o secret de environment GitHub `Production` chamado
`PRODUCTION_DATABASE_URL_DIRECT`. O valor deve ser uma conexão direta do projeto Neon
de Production e nunca deve ser exposto em logs, documentação ou PR.

A Vercel deve alterar a Production Branch de `main` para
`codex/production-release` antes de este incremento ser integrado. Enquanto essa troca
não ocorrer, o merge permanece bloqueado para evitar repetir o race da issue #308.

## 8. Testes obrigatórios

- testes Node da política de migrations;
- testes Vitest da interpretação do ledger;
- Prettier, documentação, lint e typecheck;
- migrations em PostgreSQL efêmero;
- suíte integral, build e E2E do Engineering Validation;
- validação segura do comportamento de migration fora de Production;
- comprovação fail-closed da 0025 pendente antes de qualquer ação produtiva;
- CI completo da PR.

## 9. Rollback

Antes da ativação, manter `codex/production-release` no SHA produtivo anterior. Depois
da ativação, rollback de aplicação ocorre promovendo somente um SHA compatível com o
schema já expandido. Migration destrutiva reversa não é automática; deve seguir
roll-forward ou procedimento operacional aprovado.

## 10. Riscos

- secret direto ausente ou incorreto bloqueia release, por design;
- drift entre ledger e journal bloqueia release para investigação;
- a primeira execução detectará a 0025 pendente no ledger e exigirá aprovação manual;
- proteção inadequada da referência de release pode enfraquecer o gate operacional;
- mudança da Production Branch da Vercel em ordem incorreta poderia reabrir a janela de race.

## 11. Evidências de execução

- estado inicial: `main` em `90c90cb8e95f48a6e799213486d71c63eca00634`;
- PRs #307 e #309 confirmadas como mergeadas;
- Vercel confirmada com deployments de `main` em target Production antes deste incremento;
- Neon Production `bitter-queen-90455085`, branch `br-rough-dew-axo9u82j`;
- leitura somente de Production: ledger com 25 registros e último `created_at`
  `1786301600000`, correspondente à migration 0024;
- `codex/production-release` criada no SHA `90c90cb8e95f48a6e799213486d71c63eca00634`;
- nenhuma escrita em Production foi executada durante a implementação.
