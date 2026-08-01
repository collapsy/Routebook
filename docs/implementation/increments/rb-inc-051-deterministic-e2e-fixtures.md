---
id: RB-INC-051
title: Fixtures Determinísticas para Períodos Livres e Conflitos
description: Remove setup E2E redundante e esperas de navegação frágeis das jornadas de período livre, Lugar salvo e histórico de conflitos sem aumentar timeout ou retry.
document_type: implementation-increment
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
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
  - RB-INC-050
prerequisites:
  - RB-INC-050
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-051 — Fixtures Determinísticas para Períodos Livres e Conflitos

## 1. Objetivo

Eliminar causas recorrentes de flakiness observadas na matriz acumulada, focando cada jornada na ação de interface sob teste e validando navegação por estado observável.

Issue: [#114](https://github.com/collapsy/Routebook/issues/114)

Branch: `codex/rb-inc-051-deterministic-e2e-fixtures`

Base empilhada: `codex/rb-inc-050-proposal-commands`.

## 2. Problema e evidência

O Engineering run `30684760010` da PR #113 terminou verde somente após retry:

- `free-period.spec.ts` encontrou dois links porque o nome de uma Trip era prefixo de outra criada em paralelo;
- `planning-conflicts.spec.ts` atingiu o timeout aguardando o evento `load` no retorno ao Roteiro, embora a ação use navegação suave do App Router.

Uma tentativa anterior do run `30683595635` também marcou `free-period.spec.ts` como flaky ao criar dois períodos livres sequencialmente. O arquivo repetia criação de Trip, abertura de Itinerary e composição de estado já cobertas por jornadas próprias.

A primeira execução desta correção, run `30685050223`, expôs a mesma espera por `load` na jornada de adicionar Lugar salvo ao Roteiro em `itinerary.spec.ts`. O arquivo adicional é indispensável para corrigir a causa observada sem alterar produto ou configuração.

O run `30685246003` mostrou que remover somente a espera de navegação ainda permitia avançar antes do redirect da Server Action. O run `30685472090` confirmou que o redirect esperado não deve ser classificado pelo status HTTP como uma resposta comum de sucesso. A jornada passa a aguardar a URL no estágio `commit`, sem aguardar `load` nem inspecionar headers internos do framework. No histórico de conflitos, o `href` público do link é validado e aberto diretamente, sem depender do lifecycle do router.

O run final `30686141233` demonstrou que `waitForURL`, inclusive no estágio `commit`, ainda depende do lifecycle de navegação nas Server Actions. As submissões do Roteiro passam a aguardar o POST da própria rota e, depois da resposta, mantêm as assertions independentes de URL, feedback, conteúdo e persistência. O status HTTP do redirect não é tratado como falha.

## 3. Resultado verificável

- cada teste de período livre recebe Trip e Itinerary sintéticos independentes;
- criação continua executada pela UI no cenário de criação;
- edição começa com um período persistido e edita somente pela UI;
- remoção começa com dois períodos persistidos e remove somente pela UI;
- o retorno do histórico de conflitos valida URL e conteúdo observáveis sem aguardar `load`;
- as submissões do Roteiro aguardam a resposta POST observável antes de validar URL e conteúdo;
- a abertura posterior do Roteiro e o retorno do histórico validam `href`, URL e conteúdo finais;
- 46 cenários desktop/mobile permanecem listados;
- timeout, retries, workers e projetos permanecem inalterados;
- duas execuções consecutivas terminam sem flaky annotation.

## 4. Escopo

- `apps/web/e2e/free-period.spec.ts`;
- `apps/web/e2e/itinerary.spec.ts`;
- `apps/web/e2e/planning-conflicts.spec.ts`;
- incremento, Context Pack, registro e rastreabilidade;
- evidências de duas execuções consecutivas.

## 5. Fora de escopo

- comportamento de produto, domínio ou persistência;
- mudança de Server Action, rota ou componente;
- configuração Playwright ou workflow;
- aumento de timeout, sleep, retry ou serialização;
- remoção, quarentena ou relaxamento de assertion;
- alteração da quantidade de cenários.

## 6. Context Pack

`docs/implementation/context-packs/rb-inc-051-deterministic-e2e-fixtures.md`

## 7. Caminhos permitidos

```text
apps/web/e2e/free-period.spec.ts
apps/web/e2e/itinerary.spec.ts
apps/web/e2e/planning-conflicts.spec.ts
docs/implementation/increments/rb-inc-051-deterministic-e2e-fixtures.md
docs/implementation/context-packs/rb-inc-051-deterministic-e2e-fixtures.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Critérios de aceite

- [x] nomes ou estado de outras Trips não afetam os testes de período livre;
- [x] criação, edição e remoção continuam validadas pela interface;
- [x] edição e remoção não repetem composição de estado fora do comportamento sob teste;
- [x] retorno ao Roteiro valida a URL final observável;
- [x] nenhuma assertion de persistência ou feedback é removida;
- [x] 46 cenários continuam distribuídos em desktop e mobile;
- [x] configuração Playwright permanece inalterada;
- [x] duas execuções consecutivas ficam verdes sem flaky annotation;
- [x] documentação, lint, tipagem, testes e build permanecem verdes.

## 9. Testes obrigatórios

- `pnpm --filter @routebook/web test`;
- `pnpm --filter @routebook/web lint`;
- `pnpm --filter @routebook/web typecheck`;
- `pnpm docs:validate`;
- `pnpm --filter @routebook/web build`;
- `pnpm --filter @routebook/web exec playwright test --list`;
- Engineering Validation com PostgreSQL e Playwright em duas execuções consecutivas.

## 10. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| fixture deixar de representar estado real | Alto | usar factories de domínio e repositories Drizzle reais |
| remover cobertura de criação | Alto | manter criação de período livre pela UI no primeiro cenário |
| click concluir antes da navegação | Médio | aguardar a resposta POST da submissão ou validar o `href` público antes de abrir o destino |
| outra causa de flake permanecer | Médio | exigir duas matrizes consecutivas sem retry |

## 11. Rollback

Reverter apenas os três specs e a documentação. Não existe mudança de produto, migration ou efeito em produção.

## 12. Evidências

Evidências locais:

- 143 documentos registrados e validados, com quatro avisos preexistentes;
- 46 testes Vitest do web aprovados;
- lint e typecheck do web aprovados;
- build do web aprovado;
- Playwright listou 46 cenários em sete arquivos, distribuídos em desktop e mobile;
- Prettier dos arquivos alterados e `git diff --check` aprovados.

Evidências finais da PR acumulada #115 no SHA `ca7beb8`:

- Documentation Validation `30686369423` aprovada;
- Engineering Validation `30686369420`, tentativa 1: 46/46 cenários Playwright aprovados sem retry ou flaky annotation;
- Engineering Validation `30686369420`, tentativa 2: 46/46 cenários Playwright aprovados sem retry ou flaky annotation;
- nas duas tentativas, migrations PostgreSQL, lint, tipagem, testes de componente e domínio, smoke e build também foram aprovados.
