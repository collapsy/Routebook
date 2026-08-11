---
id: RB-INC-118
title: Sincronização Determinística Pós-Server Action no E2E
description: Elimina duas esperas Playwright frágeis sincronizando submissões com a resposta POST observável antes das assertions de resultado.
document_type: implementation-increment
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - quality
  - playwright
  - flakiness
related_documents:
  - RB-CORE-0004
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-047
  - RB-INC-051
  - RB-INC-117
prerequisites:
  - RB-INC-117
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-118 — Sincronização Determinística Pós-Server Action no E2E

## 1. Objetivo

Eliminar duas flakies observadas após o merge do RB-INC-117, aguardando a resposta
POST da Server Action antes de validar URL, feedback, conteúdo e persistência.

Issue: #274.

Branch: `codex/rb-inc-118-deterministic-server-action-e2e`.

PR: #275.

## 2. Problema e evidência

O Engineering Validation `31513286871` concluiu com 79 cenários aprovados e dois
cenários aprovados somente após retry:

- remoção de período livre validou `periodoLivreRemovido=1` antes de observar a
  conclusão da submissão;
- aceite parcial iniciou a espera de navegação depois do click e expirou enquanto
  a Server Action ainda estava em processamento.

Ambos os testes já validam o resultado correto após o retry. A correção atua apenas
na sincronização observável, sem alterar produto ou ampliar tolerâncias.

## 3. Escopo

- registrar a espera pelo POST da rota atual antes do click;
- aguardar a submissão e a resposta em conjunto;
- preservar assertions de URL, feedback, conteúdo, persistência e idempotência;
- registrar evidências em duas execuções consecutivas do CI.

## 4. Fora de escopo

- produto, domínio, banco, componentes ou Server Actions;
- configuração do Playwright ou workflow;
- aumento de timeout, retry ou workers;
- sleep, quarentena ou remoção de assertion;
- refatoração de outros cenários E2E.

## 5. Critérios de aceite

- [x] remoção de período livre registra a espera pelo POST antes do click;
- [x] aceite parcial registra a espera pelo POST antes do click;
- [x] URL, feedback, conteúdo e persistência permanecem validados;
- [x] timeout, retry, workers e projetos permanecem inalterados;
- [ ] documentação, lint, tipagem, testes e build verdes;
- [ ] duas execuções consecutivas do Engineering Validation sem flaky annotation.

## 6. Testes obrigatórios

- `pnpm --filter @routebook/web test`;
- `pnpm --filter @routebook/web lint`;
- `pnpm --filter @routebook/web typecheck`;
- `pnpm docs:validate`;
- `pnpm --filter @routebook/web build`;
- `pnpm --filter @routebook/web exec playwright test --list`;
- Engineering Validation executado duas vezes no mesmo SHA.

## 7. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| capturar POST não relacionado | Médio | comparar método e pathname da rota da ação |
| ocultar erro de decisão | Alto | preservar leitura explícita do alerta antes da URL |
| flake possuir outra causa | Médio | exigir duas matrizes completas sem retry |

## 8. Rollback

Reverter somente os dois specs e a documentação deste incremento. Não existe
migration, alteração de produto ou efeito de produção.
