---
id: RB-CTX-133
title: Context Pack do RB-INC-133 — Gate de Migration de Production
description: Delimita o pipeline que promove migrations antes do código dependente em Production.
document_type: implementation-context-pack
owner: Platform and Delivery
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-12"
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

- `main` canônica e candidate validado: `a9c0496eca45d90618808a853eaa692ccafc3702`;
- PRs #310 e #311 integradas; Documentation Validation #1049 e Engineering Validation #1471 verdes no SHA da correção;
- Vercel Production acompanha `codex/production-release`, comprovado pelo deployment produtivo após o fast-forward;
- GitHub Environment `Production` fornece conexão Direct do Neon e a Deploy Key em Base64; a existência e validade foram comprovadas pelo workflow sem enumerar ou expor valores;
- ruleset ativo aponta exatamente para `refs/heads/codex/production-release`, com `update`, `deletion`, `non_fast_forward` e bypass `DeployKey`;
- execução automática válida leu 25 registros no ledger, detectou a 0025 pendente e a bloqueou como alto risco por `drop-constraint` e `update-data`, sem migration e sem promoção;
- após aprovação humana explícita do SHA e da migration, Production Release #3 (`31596977124`) aplicou a 0025, verificou 26 registros, `latestAppliedAt=1786482000000` e zero pendências;
- `codex/production-release` avançou somente depois da verificação do schema e agora aponta para `a9c0496eca45d90618808a853eaa692ccafc3702`;
- Vercel deployment `dpl_FBfJuNxULQ64X7NaWzWDTXFAWu1x` está `READY`, `target=production`, originado de `codex/production-release` no mesmo SHA;
- Production respondeu HTTP 200 e não apresentou logs `error`/`fatal` na janela pós-release verificada;
- #305 permanece fora deste incremento.

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


A cadeia foi comprovada em execução real: CI verde em `main`, autenticação da Deploy Key,
leitura do ledger, bloqueio automático da 0025 sem write, aprovação humana explícita,
migration, verificação de zero pendências, fast-forward da referência protegida e
Production Vercel `READY` no mesmo SHA. O ledger final possui 26 registros e o smoke
produtivo respondeu HTTP 200 sem erros de runtime observados.
