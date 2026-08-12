---
id: RB-INC-133
title: Gate de Migration antes da Promoção de Production
description: Separa integração, migration e promoção para impedir código dependente de schema antes do banco em Production.
document_type: implementation-increment
owner: Platform and Delivery
status: Draft
version: "0.1.1"
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

Branch original: `codex/rb-inc-133-production-migration-gate`.

Correção operacional: `codex/rb-inc-133-release-key-base64`.

## 2. Problema

O RB-INC-132 expôs um race real: `places.price_range` foi consultado em Production
antes de a migration `0025_add_place_price_range` existir no banco. O CI validava
migrations apenas em PostgreSQL efêmero, enquanto a Vercel promovia `main`
automaticamente para Production.

A correção emergencial deixou ainda uma diferença operacional relevante: o schema de
Production contém a alteração da 0025, mas o ledger `drizzle.__drizzle_migrations`
permanece registrado até a 0024. O novo pipeline deve detectar esse estado e nunca
reaplicar silenciosamente uma migration classificada como de alto risco.

A primeira execução real do pipeline, após a PR #310, também demonstrou que transportar
a chave privada SSH como secret multiline pode produzir `error in libcrypto` no runner.
A correção usa Base64 como transporte opaco, decodifica a chave somente no runner e
valida sua autenticação antes de qualquer acesso ao banco de Production.

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
- proteger `codex/production-release` com ruleset que restrinja updates;
- autenticar o avanço da release branch por Deploy Key de escrita dedicada ao repositório;
- transportar a chave privada em Base64 no GitHub Environment `Production`;
- validar formato e autenticação da Deploy Key antes de ler ou modificar Production;
- remover os arquivos temporários da chave no final do job, inclusive em falhas;
- falhar fechado quando secret, ledger, ancestry, CI, autenticação de release ou schema não puderem ser comprovados.

## 4. Fora de escopo

- alterar a política de acesso de Production da issue #305;
- alterar Provider de banco, hosting ou ORM;
- versionar ou imprimir `DATABASE_URL`, chave SSH ou qualquer secret;
- executar migration destrutiva automaticamente;
- reescrever migrations históricas;
- corrigir manualmente o ledger de Production neste incremento sem aprovação explícita.

## 5. Contrato de promoção

```text
main
  -> Engineering Validation verde no SHA
  -> validação append-only das migrations
  -> decodificação e validação da Deploy Key de release
  -> autenticação SSH contra o repositório
  -> leitura do ledger de Production
  -> classificação de todas as migrations pendentes
  -> migration segura OU aprovação manual explícita para alto risco
  -> pnpm db:migrate
  -> ledger sem pendências
  -> fast-forward autenticado de codex/production-release para o SHA
  -> Vercel Production acompanha exclusivamente codex/production-release
```

A referência de release nunca pode avançar antes do schema. Um erro após a migration e
antes do `git push` mantém o código anterior em Production, preservando compatibilidade
pela política `expand-contract`.

## 6. Critérios de aceite

- [ ] `main` deixa de ser a Production Branch da Vercel antes da ativação deste incremento;
- [x] `codex/production-release` existe e começa no último SHA produtivo conhecido;
- [x] release automático só aceita SHA validado de `main` e avanço fast-forward;
- [x] migrations históricas são append-only e alterações retroativas falham;
- [x] pipeline usa ledger real para localizar migrations pendentes;
- [x] migrations de alto risco falham no automático e exigem despacho manual explícito;
- [x] migration é executada antes da referência de release avançar;
- [x] promoção só ocorre com zero migrations pendentes após o migrator;
- [x] conexão direta de Production vem exclusivamente de GitHub Environment secret;
- [ ] `PRODUCTION_RELEASE_SSH_KEY_B64` contém Base64 dos bytes exatos da chave privada da Deploy Key dedicada;
- [x] ruleset de `codex/production-release` contém `Restrict updates`, `Restrict deletions` e `Block force pushes`;
- [x] bypass do ruleset é concedido ao mecanismo de Deploy Key, sem bypass pessoal/admin usado como caminho normal;
- [x] política e leitura de ledger possuem testes automatizados;
- [ ] execução real comprova autenticação SSH, bloqueio da 0025 e ausência de write sem aprovação;
- [ ] Engineering Validation e Documentation Validation passam no mesmo SHA da correção.

## 7. Configuração operacional requerida

O workflow espera dois secrets no GitHub Environment `Production`:

- `PRODUCTION_DATABASE_URL_DIRECT`: conexão direta do projeto Neon de Production;
- `PRODUCTION_RELEASE_SSH_KEY_B64`: Base64 dos bytes exatos da chave privada da Deploy Key dedicada à promoção.

A chave pública correspondente deve ser cadastrada em `Settings > Deploy keys` do
repositório com `Allow write access`. A chave deve ser exclusiva deste repositório e
não deve ser reutilizada. O Base64 é somente um envelope de transporte para preservar
integralmente newlines e bytes da chave; ele não substitui o sigilo do secret.

O runner decodifica a chave em arquivo temporário, valida o formato com `ssh-keygen`,
carrega os host keys do GitHub via endpoint HTTPS oficial, comprova acesso ao repositório
com `git ls-remote` e somente depois continua para o ledger de Production. O arquivo da
chave é removido em cleanup `always()`.

O ruleset de `codex/production-release` deve conceder bypass a Deploy Keys e habilitar
`Restrict updates`; assim, pushes humanos normais permanecem bloqueados enquanto o job
autenticado pela chave consegue fazer somente o fast-forward validado pelo pipeline.

Nenhum valor de secret deve ser exposto em logs, documentação ou PR.

A Vercel deve manter a Production Branch em `codex/production-release`; `main` não pode
voltar a promover código diretamente para Production.

## 8. Testes obrigatórios

- testes Node da política de migrations;
- testes Vitest da interpretação do ledger;
- Prettier, documentação, lint e typecheck;
- migrations em PostgreSQL efêmero;
- suíte integral, build e E2E do Engineering Validation;
- validação segura do comportamento de migration fora de Production;
- comprovação fail-closed da 0025 pendente antes de qualquer ação produtiva;
- validação real da Deploy Key antes de qualquer leitura ou write em Production;
- CI completo da PR.

## 9. Rollback

Antes da ativação, manter `codex/production-release` no SHA produtivo anterior. Depois
da ativação, rollback de aplicação ocorre promovendo somente um SHA compatível com o
schema já expandido. Migration destrutiva reversa não é automática; deve seguir
roll-forward ou procedimento operacional aprovado.

## 10. Riscos

- secret direto ausente ou incorreto bloqueia release, por design;
- Base64 inválido, chave inválida, chave com passphrase ou Deploy Key sem acesso bloqueiam release antes do banco, por design;
- drift entre ledger e journal bloqueia release para investigação;
- a primeira execução válida detectará a 0025 pendente no ledger e exigirá aprovação manual;
- proteção inadequada da referência de release pode enfraquecer o gate operacional;
- conceder bypass pessoal/admin como caminho normal enfraquece a separação entre operação humana e promoção automatizada;
- mudança da Production Branch da Vercel em ordem incorreta poderia reabrir a janela de race.

## 11. Evidências de execução

- estado inicial: `main` em `90c90cb8e95f48a6e799213486d71c63eca00634`;
- PRs #307 e #309 confirmadas como mergeadas;
- PR #310 integrada por squash em `7c27ebe61c755ec267ad0d4a40b345a02b8c32f0`;
- Engineering Validation #1467 verde no SHA de `main` após a integração;
- Neon Production `bitter-queen-90455085`, branch `br-rough-dew-axo9u82j`;
- leitura anterior de Production: ledger com 25 registros e último `created_at`
  `1786301600000`, correspondente à migration 0024;
- `codex/production-release` permanece em `90c90cb8e95f48a6e799213486d71c63eca00634`;
- ruleset ativo direcionado exatamente a `refs/heads/codex/production-release`, com `update`, `deletion`, `non_fast_forward` e bypass `DeployKey`;
- Production Release #1 (`31556534393`) comprovou fail-closed: secrets presentes, mas a chave multiline falhou em `actions/checkout` com `error in libcrypto`;
- nessa falha, leitura do ledger, migration e promoção ficaram `skipped`;
- correção passa a transportar a chave como Base64 e validar SSH antes de qualquer operação em Production;
- nenhuma escrita em Production foi executada pelo novo pipeline até esta revisão.
