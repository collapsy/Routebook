---
id: RB-CTX-133
title: Context Pack do RB-INC-133 — Gate de Migration de Production
description: Delimita o pipeline que promove migrations antes do código dependente em Production.
document_type: implementation-context-pack
owner: Platform and Delivery
status: Draft
version: "0.1.1"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, cicd, production, migrations]
related_documents: [RB-INC-133, RB-CORE-0004, RB-CICD-001, RB-DATA-002, RB-ADR-006, RB-ADR-017, RB-ADR-018, RB-ADR-019, RB-INC-124, RB-INC-132]
prerequisites: [RB-INC-124, RB-INC-132]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-133 — Gate de Migration de Production

## Missão

Garantir que um SHA de aplicação só possa se tornar Production depois de o schema
compatível estar aplicado e verificado no banco correto, sem expor secrets e sem
misturar a política de acesso tratada pela issue #305.

## Caminhos permitidos

```text
.github/workflows/engineering-validation.yml
.github/workflows/production-release.yml
package.json
packages/database/package.json
packages/database/src/migration-ledger-status.ts
packages/database/src/migration-ledger-status.test.ts
scripts/release-migration-policy.mjs
scripts/release-migration-policy.test.mjs
docs/implementation/increments/rb-inc-133-production-migration-gate.md
docs/implementation/context-packs/rb-inc-133-production-migration-gate.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Documentos carregados

- RB-CORE-0004 — RouteBook Bible;
- `docs/README.md` e `docs/implementation/README.md`;
- RB-CICD-001 — integração, entrega e releases;
- RB-DATA-002 — estratégia física de migrations;
- RB-ADR-006 — Drizzle ORM e migrations;
- RB-ADR-017 — Vercel como plataforma de deployment;
- RB-ADR-018 — Neon como PostgreSQL gerenciado;
- RB-ADR-019 — GitHub Actions e governança de entrega;
- RB-INC-124 — bootstrap isolado de Production;
- RB-INC-132 — incidente que revelou a ordem incorreta de promoção.

## Estado operacional observado

- `main` canônica inicial: `90c90cb8e95f48a6e799213486d71c63eca00634`;
- PR #310 integrada por squash em `7c27ebe61c755ec267ad0d4a40b345a02b8c32f0`;
- Engineering Validation #1467 passou integralmente no SHA integrado de `main`;
- alteração da Production Branch da Vercel para `codex/production-release` foi confirmada operacionalmente pelo responsável, embora o conector disponível não exponha esse campo específico para leitura;
- environments GitHub `Preview` e `Production` existem;
- nomes de secrets GitHub não puderam ser enumerados pela integração;
- Neon Production está isolado do Preview;
- ledger Drizzle de Production termina na 0024, embora a alteração da 0025 já esteja no schema;
- `codex/production-release` permanece no SHA produtivo inicial `90c90cb8e95f48a6e799213486d71c63eca00634`;
- ruleset ativo aponta exatamente para `refs/heads/codex/production-release`, com `update`, `deletion`, `non_fast_forward` e bypass `DeployKey`;
- o App interno associado ao `GITHUB_TOKEN` não está disponível como ator selecionável na bypass list observada;
- a promoção usa Deploy Key dedicada para permitir `Restrict updates` sem bypass pessoal/admin;
- Production Release #1 (`31556534393`) confirmou os dois secrets existentes, mas falhou no checkout SSH com `error in libcrypto` antes de qualquer leitura do ledger ou migration;
- a correção passa a transportar a chave privada como Base64, decodificá-la somente no runner, validar formato e autenticação SSH antes de qualquer operação em Production e apagar os arquivos temporários no cleanup.

## Restrições

- nunca logar URL, senha, token, chave privada ou secret;
- não presumir que `PRODUCTION_DATABASE_URL_DIRECT` ou `PRODUCTION_RELEASE_SSH_KEY_B64` existe;
- Base64 é apenas transporte e não é mecanismo de proteção criptográfica;
- a chave decodificada deve ser validada com `ssh-keygen` e autenticação Git antes do ledger;
- chave com passphrase, Base64 inválido ou Deploy Key sem acesso devem falhar antes do banco;
- não usar URL pooled para migrations quando conexão direta for requerida;
- não permitir alteração de migration histórica;
- usar o ledger do banco, não apenas o diff Git, para descobrir pendências;
- tratar DML, drops, rename, mudança de tipo, `SET NOT NULL`, `CASCADE` e operações equivalentes como alto risco;
- não executar alto risco no gatilho automático;
- `workflow_dispatch` com SHA exato e flag explícita representa a aprovação humana do alto risco;
- promoção da referência de release é somente fast-forward;
- `codex/production-release` deve bloquear updates comuns e aceitar bypass pelo mecanismo de Deploy Key usado exclusivamente no workflow de release;
- não conceder bypass pessoal/admin como caminho normal de promoção;
- remover os arquivos temporários da Deploy Key mesmo quando o job falhar;
- #305 permanece integralmente fora deste Context Pack.

## Validação

Executar testes unitários da policy e do ledger, validação documental, lint, typecheck,
migration em PostgreSQL efêmero, suíte integral, build e E2E. Antes de qualquer write
em Production, validar que o Environment `Production` possui `PRODUCTION_DATABASE_URL_DIRECT`
e `PRODUCTION_RELEASE_SSH_KEY_B64`, que a chave decodificada autentica no repositório e
que o ruleset bloqueia updates comuns preservando bypass do mecanismo de Deploy Key.
A execução automática deve então alcançar o ledger e bloquear a 0025 como alto risco,
sem aplicar migration ou mover a release branch até aprovação humana explícita.
