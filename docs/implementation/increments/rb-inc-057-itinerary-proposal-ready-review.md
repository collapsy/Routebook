---
id: RB-INC-057
title: Revisão Somente Leitura da Itinerary Proposal Ready
description: Apresenta a Itinerary Proposal ready separada do Roteiro canônico, com contexto, limitações, justificativas e mudanças propostas revisáveis.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - proposal-management
  - web
  - review
related_documents:
  - RB-CORE-0004
  - RB-PRD-004
  - RB-UX-003
  - RB-UX-004
  - RB-UX-005
  - RB-UX-006
  - RB-INC-055
  - RB-INC-056
prerequisites:
  - RB-INC-056
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-057 — Revisão Somente Leitura da Itinerary Proposal Ready

## 1. Objetivo

Entregar a versão simplificada da tela `RB-SCR-009 — Proposta de Roteiro` para revisar a Itinerary Proposal `ready` mais recente de uma Viagem, mantendo o Itinerary atual integralmente preservado.

Issue: [#130](https://github.com/collapsy/Routebook/issues/130)

Branch: `codex/rb-inc-057-ready-review`

Base empilhada: `codex/rb-inc-056-ready-command`, PR #129.

Pull request acumulada: [#131](https://github.com/collapsy/Routebook/pull/131), com RB-INC-056 e RB-INC-057 sobre a branch consolidada da PR #125.

## 2. Problema

O domínio e a persistência já representam conteúdo `ready`, mas ainda não existe uma superfície do produto onde o viajante consiga distinguir a sugestão do Roteiro confirmado e revisar critérios, justificativas, limitações e Proposed Activities antes de qualquer decisão.

## 3. Resultado verificável

- o Roteiro oferece acesso somente quando existe ao menos uma Proposal `ready`;
- a rota dedicada seleciona deterministicamente a Proposal `ready` mais recente;
- a tela identifica a Proposal como sugestão ainda não aplicada;
- critérios, limitações, justificativas e alertas conhecidos permanecem visíveis;
- mudanças propostas são agrupadas por dia conhecido e não aparecem como Activities canônicas;
- acesso direto sem Proposal `ready` recebe estado vazio e caminho de retorno;
- loading e erro preservam contexto e recuperação;
- nenhum comando de aceite, edição, descarte, regeneração ou aplicação é exposto.

## 4. Invariantes

1. `ready` significa pronta para revisão, nunca aceita nem aplicada;
2. a tela é somente leitura e não grava em Proposal, Itinerary, Activity ou Planning Conflict;
3. o Itinerary atual permanece a referência canônica durante toda a revisão;
4. dados indisponíveis não são inventados nem apresentados com falsa precisão;
5. a Proposal mais recente é selecionada por `generatedAt`, com desempate estável por identidade;
6. Proposed Activities são descritas como mudanças propostas;
7. esta UI não conhece Provider, modelo, prompt ou payload bruto de IA.

## 5. Escopo

- view model puro para seleção, integridade, agrupamento e formatação da revisão;
- componente sem estado de decisão para apresentar a Proposal;
- rota `/viagens/[tripId]/roteiro/proposta` com loading, vazio e erro;
- acesso condicional a partir da página do Roteiro;
- dependência workspace explícita de Proposal Management no app web;
- testes unitários, de componente e E2E;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- solicitar ou gerar Proposal;
- aceitar, aceitar parcialmente, editar, descartar, regenerar, expirar ou superseder;
- aplicar Proposed Activities ao Itinerary;
- comparar visualmente versões lado a lado;
- escolher Provider, modelo, prompt, schema externo, job, fila ou fallback;
- criar estado, regra, evento ou invariante de domínio;
- autorização ou compartilhamento multiusuário;
- telemetria ou analytics.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-057-itinerary-proposal-ready-review.md`

## 8. Caminhos permitidos

```text
apps/web/package.json
apps/web/app/itinerary.css
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/loading.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/error.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/error.test.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/proposal-page.module.css
apps/web/components/itinerary-proposal-review.tsx
apps/web/components/itinerary-proposal-review.test.tsx
apps/web/components/itinerary-proposal-review.module.css
apps/web/lib/itinerary-proposal-experience.ts
apps/web/lib/itinerary-proposal-experience.test.ts
apps/web/e2e/itinerary-proposal-review.spec.ts
pnpm-lock.yaml
docs/implementation/increments/rb-inc-057-itinerary-proposal-ready-review.md
docs/implementation/context-packs/rb-inc-057-itinerary-proposal-ready-review.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] a seleção considera somente Proposals `ready` e escolhe a mais recente de forma estável;
- [x] a revisão apresenta critérios, justificativas, limitações e quantidade de conflitos conhecidos;
- [x] Proposed Activities são agrupadas por dia do Itinerary quando a referência existe;
- [x] referências desconhecidas são tratadas como indisponíveis, sem inventar dados;
- [x] a UI declara que a sugestão ainda não foi aplicada e que o Roteiro atual foi preservado;
- [x] não existem controles de aceite, edição, descarte, regeneração ou aplicação;
- [x] o link no Roteiro existe somente quando uma Proposal `ready` pode ser revisada;
- [x] rota direta sem Proposal `ready` apresenta estado vazio recuperável;
- [x] loading, erro, semântica, teclado e layout responsivo permanecem adequados;
- [x] documentação, lint, tipagem, testes, E2E e build permanecem verdes.

## 10. Testes obrigatórios

- seleção da Proposal `ready` mais recente, ignorando outros estados;
- desempate determinístico e ausência de Proposal `ready`;
- integridade do conteúdo obrigatório de `ready`;
- agrupamento, ordenação e fallback de dia indisponível;
- renderização dos conteúdos e da separação entre sugestão e Roteiro;
- ausência de ações de decisão;
- estado sem Proposed Activities;
- E2E de acesso a partir do Roteiro e revisão da Proposal persistida;
- E2E confirma que a Proposed Activity não foi aplicada ao Roteiro;
- `pnpm format:check` nos caminhos alterados;
- `pnpm docs:validate`;
- `pnpm --filter @routebook/web lint`;
- `pnpm --filter @routebook/web typecheck`;
- `pnpm --filter @routebook/web test`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test` quando `DATABASE_URL` estiver disponível;
- `pnpm build`;
- Playwright desktop e mobile no CI;
- `git diff --check`.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| confundir Proposal com Roteiro confirmado | Alto | status e linguagem explícitos em toda a superfície |
| expor ações sem aplicação segura | Alto | incremento estritamente somente leitura |
| selecionar snapshot antigo | Médio | ordenar por `generatedAt` e desempatar por identidade |
| inventar dia ou dado ausente | Alto | fallback explícito de informação indisponível |
| acoplar UI ao Provider | Alto | consumir apenas o contrato público de Proposal Management |

## 12. Segurança e privacidade

A tela apresenta somente o snapshot revisável já persistido. Não recebe nem exibe prompt, token, secret, payload bruto, identificador técnico de Provider ou dado pessoal adicional. Nenhuma decisão é aplicada silenciosamente.

## 13. Rollback

Reverter rota, view model, componente, testes, acesso condicional, dependência workspace e documentação. Não existe migration nem escrita nova em dados de produto.

## 14. Evidências

- Prettier dos caminhos alterados e `git diff --check`: verdes;
- documentação: 155 documentos e 155 registros validados, com quatro avisos preexistentes;
- `@routebook/web`: lint e typecheck verdes; 54 testes verdes em 19 arquivos;
- workspace: lint, typecheck e build verdes;
- build confirmou a rota dinâmica `/viagens/[tripId]/roteiro/proposta`;
- suíte integral, migration PostgreSQL e Playwright desktop/mobile não executados localmente porque `DATABASE_URL` não está configurada e o daemon Docker está indisponível;
- PR #131, workflow de documentação: verde;
- PR #131, workflow de engenharia: migration, formatação, documentação, lint, tipagem, suíte integral, smoke, build e 50 testes Playwright responsivos verdes;
- a primeira execução E2E registrou um timeout global flutuante no retorno ao Roteiro e passou no retry; o teste foi alinhado ao timeout responsivo de 120 segundos e uma nova execução confirmou 50 testes verdes sem retry.
