---
id: RB-INC-210
title: Wizard de preparação — contexto da viagem
description: Integra TravelerProfile ao segundo passo do wizard com coleta progressiva, reutilização de dados da Trip e projeção derivada para a futura Revisão.
document_type: implementation-increment
owner: Experience and Traveler Profile
status: Draft
version: "0.1.0"
created: "2026-09-21"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [implementation, wizard, traveler-profile, trip-context, progressive-personalization, review]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-003, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-INC-005, RB-INC-207, RB-INC-208, RB-INC-209, RB-CTX-210]
prerequisites: [RB-INC-209]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-210 — Wizard de preparação: contexto da viagem

## 1. Unidade de trabalho

- Issue: [#511](https://github.com/collapsy/Routebook/issues/511).
- Branch: `codex/issue-511-trip-context-wizard`.
- Base: `main@1267507c82f706c2cf812300e2552ebcff524947`.
- Merge na `main`: gate humano explícito.

## 2. Objetivo

Implementar o segundo passo funcional da preparação:

```text
Lugares
→ Contexto
→ futura Revisão
→ futura Proposta
```

O wizard continua sendo apenas orquestração. A fonte canônica do contexto adicional é o `TravelerProfile` já existente; destino, período, hospedagem e participantes continuam pertencendo à `Trip`.

## 3. Auditoria

A auditoria confirmou:

- `RB-INC-210` e `RB-CTX-210` estavam livres na `main`;
- `/viagens/[tripId]/contexto` já persistia `TravelerProfile`;
- o contrato existente possui quantidade de viajantes, interesses, ritmo, transporte e orçamento estimado;
- `traveler_profiles` já representa todos os dados necessários; nenhuma migration é necessária;
- quantidade de viajantes entre 1 e 20 é a única obrigatoriedade estrutural do perfil;
- interesses, ritmo, transporte e orçamento são opcionais;
- participantes com acesso à Trip e quantidade de viajantes são conceitos distintos;
- RB-INC-209 já usa `preparar=1` como contexto transitório do wizard.

## 4. Experiência

O passo Contexto organiza somente campos já existentes em três grupos:

1. **Grupo** — quantidade de viajantes;
2. **Interesses e ritmo** — interesses e ritmo;
3. **Deslocamento e orçamento** — transporte preferencial e orçamento estimado.

Cada grupo é salvo antes de avançar. A Server Action recompõe o input completo com o estado persistido para que editar um grupo não apague outro.

A Trip apresenta como resumo, sem perguntar novamente:

- destino;
- período;
- hospedagem;
- responsável.

## 5. Opcionalidade

Não existe percentual mínimo nem quantidade mínima de respostas opcionais.

A quantidade de viajantes permanece obrigatória porque é uma invariante formal de `TravelerProfile`, não uma regra criada pelo wizard.

Ausência de ritmo, transporte e orçamento permanece ausência. Interesses continuam aceitando coleção vazia conforme o contrato existente.

## 6. Navegação do wizard

```text
Preparar viagem · Etapa 2 de 4

1 Lugares      ← navegável para edição
2 Contexto     ← ativo
3 Revisão      ← informativo
4 Proposta     ← informativo
```

Todas as rotas do fluxo preservam `preparar=1`.

O fim de Lugares passa a permitir avanço para Contexto mesmo com seleção vazia ou pequena, coerente com a ausência de mínimo canônico.

## 7. Preparação da Revisão

`deriveTripPreparationReviewModel` é uma projeção pura e não persistida que consolida:

```text
Trip
+ TripPlacePreference[]
+ TravelerProfile
→ TripPreparationReviewModel
```

A projeção expõe dados conhecidos da Trip, contagens da seleção, contexto informado e campos opcionais ainda ausentes.

Ela não cria nova fonte de verdade e não gera Proposal.

## 8. Invariantes preservadas

- `TripPlacePreference ≠ Activity`;
- Contexto não cria Activity;
- Contexto não cria ou altera Itinerary;
- concluir Contexto não cria ItineraryProposal;
- não existe geração de `ROUTEBOOK_RECOMMENDED`;
- `USER_SELECTED ≠ ROUTEBOOK_RECOMMENDED`;
- nenhuma tabela, aggregate, session ou JSON de wizard foi criado;
- nenhuma migration foi criada.

## 9. Compatibilidade

A rota de Contexto continua funcional fora do wizard. Explorar, Minha seleção, detalhe, Roteiro, Guia, recomendações e fluxo manual permanecem independentes.

## 10. Caminhos alterados

```text
apps/web/app/viagens/[tripId]/contexto/**
apps/web/app/viagens/[tripId]/lugares-salvos/page.tsx
apps/web/components/traveler-context-form.tsx
apps/web/components/trip-planning-wizard*
apps/web/lib/trip-preparation-review*
apps/web/e2e/trip-context-wizard.spec.ts
docs/implementation/increments/rb-inc-210-trip-context-wizard.md
docs/implementation/context-packs/rb-inc-210-trip-context-wizard.md
docs/registry.md
docs/implementation/traceability-matrix.md
```

## 11. Testes

Cobertura prevista:

- Lugares → Contexto preserva `preparar=1`;
- seleção vazia não bloqueia avanço;
- dados conhecidos da Trip aparecem sem nova persistência;
- três grupos persistem progressivamente;
- editar/navegar não perde respostas;
- voltar a Lugares não perde seleção;
- alteração de contexto não cria Activity;
- alteração de contexto não cria Proposal;
- projeção de Revisão deriva seleção e contexto;
- rota normal de Contexto continua sem moldura do wizard;
- E2E executa nos viewports responsivos do projeto.

Gates:

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

GitHub Actions é a evidência canônica dos gates integrados.

## 12. Preview e merge

O Vercel Preview deve ser validado no HEAD funcional.

Mesmo com CI, Preview e mergeabilidade verdes, o merge permanece bloqueado até autorização humana explícita.

## 13. Fora de escopo

- tela funcional de Revisão;
- geração, aceite ou aplicação de Proposal;
- montagem automática dos dias;
- recomendações complementares;
- geração de `ROUTEBOOK_RECOMMENDED`;
- replanejamento;
- alterações em Production;
- nova arquitetura de autenticação.
