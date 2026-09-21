---
id: RB-INC-209
title: Wizard de preparação — escolha de lugares
description: Orquestra Explorar e Minha seleção como o primeiro passo do wizard de preparação, usando TripPlacePreference sem criar estado paralelo nem Activity.
document_type: implementation-increment
owner: Experience and Trip Collection
status: Draft
version: "0.1.0"
created: "2026-09-21"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [implementation, wizard, planning-journey, trip-place-preference, place-discovery, mobile-first]
related_documents: [RB-CORE-0004, RB-PRD-004, RB-DOM-001, RB-DOM-003, RB-UX-001, RB-UX-002, RB-ARC-002, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-INC-207, RB-INC-208, RB-CTX-209]
prerequisites: [RB-INC-208]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-209 — Wizard de preparação: escolha de lugares

## 1. Unidade de trabalho

- Issue: [#509](https://github.com/collapsy/Routebook/issues/509).
- Branch: `codex/issue-509-place-selection-wizard`.
- Base: `main@a961028491c06586af040d37f817f2d9c3c39ac5`.
- Pull Request: [#510](https://github.com/collapsy/Routebook/pull/510).
- Merge na `main`: gate humano explícito.

## 2. Objetivo

Implementar somente o primeiro passo da jornada guiada de preparação:

```text
Preparar viagem
→ 1. Lugares
→ Explorar
→ Quero ir / Talvez / Não tenho interesse
→ revisar Minha seleção
→ fronteira para Contexto da viagem
```

O wizard é orquestração da experiência. A fonte canônica permanece `TripPlacePreference`.

## 3. Auditoria da implementação herdada

A `main` já possuía:

- catálogo em `/viagens/[tripId]/lugares` com busca, filtros, ranking, imagens, mapa, distância e descoberta externa;
- detalhe canônico em `/viagens/[tripId]/lugares/[placeSlug]`;
- `/viagens/[tripId]/lugares-salvos` como Minha seleção;
- persistência de WANT, MAYBE, NOT_INTERESTED e MUST_DO via `TripPlacePreference`;
- promoção/reconciliação de candidato externo antes da preferência;
- ação manual legada para adicionar Place ao Itinerary a partir de Minha seleção.

Também estava aberta a issue #501 / PR #502. Ela corrigia redirects que substituíam a grade e perdiam a posição de rolagem ao atualizar uma preferência. Como este comportamento é requisito direto da seleção rápida do wizard, a correção executável da #502 foi reconciliada nesta branch sem usar a PR aberta como base.

## 4. Experiência entregue

### Moldura do wizard

A experiência apresenta:

```text
Preparar viagem · Etapa 1 de 4

1 Lugares      ← ativa
2 Contexto     ← informativa, sem link falso
3 Revisão      ← informativa, sem link falso
4 Proposta     ← informativa, sem link falso
```

Dentro de Lugares existem duas superfícies do mesmo estado:

- **Explorar** — descobrir e avaliar Places;
- **Minha seleção** — revisar as preferências já registradas.

Nenhuma página futura fictícia foi criada.

### Seleção rápida

Cards do catálogo permitem atualizar WANT, MAYBE e NOT_INTERESTED sem abrir o detalhe e sem navegar para outra URL.

A interação usa estado otimista, feedback localizado, rollback visual em erro e `aria-pressed`.

O estado persistido continua sendo somente `TripPlacePreference`.

### Progresso da seleção

Explorar e Minha seleção exibem contagens de:

- Quero ir;
- Talvez;
- Não tenho interesse;
- Imperdíveis.

O resumo reage à alteração de preferência na própria página, sem exigir refresh da grade.

Quando não existe WANT nem MAYBE, a UI orienta a continuar explorando sem impor quantidade mínima.

## 5. MUST_DO

`MUST_DO` permanece prioridade sobre WANT, não uma quarta intenção.

A interação continua concentrada em Minha seleção e no detalhe do Place, onde existe contexto suficiente para marcar ou remover Imperdível.

## 6. External Places

Candidatos externos continuam usando o fluxo de promoção/reconciliação existente antes da criação de `TripPlacePreference`.

A atualização inline da preferência não cria vínculo direto entre Trip e uma entidade externa não canônica.

## 7. Seleção não cria Activity

O wizard não usa `addSelectionPlaceToItineraryAction`.

O formulário de adição direta ao roteiro foi removido da superfície Minha seleção durante o passo Lugares.

O detalhe de Place mantém a ação manual de planejamento preexistente como capacidade distinta e explicitamente rotulada, fora da ação de preferência.

A suíte E2E passa a comprovar:

```text
TripPlacePreference
≠ Activity
```

e não mais a exigir criação direta de Activity por Minha seleção.

## 8. Compatibilidade

- URLs existentes de Explorar, Detalhes e Minha seleção permanecem;
- catálogo, ranking, filtros, mapa, imagens e distância permanecem;
- nenhum schema, tabela ou migration foi criado;
- nenhum contrato de Proposal foi alterado;
- nenhuma geração de ROUTEBOOK_RECOMMENDED foi conectada;
- nenhum Provider ou Production foi alterado.

## 9. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/lugares/**
apps/web/app/viagens/[tripId]/lugares-salvos/**
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/**
apps/web/app/viagens/[tripId]/page.tsx
apps/web/components/trip-place-*
apps/web/components/trip-planning-wizard*
apps/web/e2e/itinerary.spec.ts
apps/web/e2e/place-actions.spec.ts
apps/web/e2e/multi-destination-validation.spec.ts
apps/web/e2e/place-discovery-anywhere.spec.ts
apps/web/lib/trip-place-preference.ts
docs/implementation/increments/rb-inc-209-place-selection-wizard.md
docs/implementation/context-packs/rb-inc-209-place-selection-wizard.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Arquivos adicionais indispensáveis devem ser registrados antes da alteração.

## 10. Testes

Cobertura adicionada/ajustada para:

- moldura do passo Lugares;
- ausência de links funcionais para etapas futuras;
- resumo inicial e sem mínimo arbitrário;
- atualização viva das contagens;
- WANT no catálogo sem navegação/scroll reset;
- persistência e feedback inline;
- Minha seleção sem mecanismo direto de criação de Activity;
- Roteiro permanece com zero Activities após apenas selecionar Place;
- regressões de descoberta externa, detalhe e múltiplos destinos.

Gates obrigatórios:

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

A execução local integral não é possível no ambiente do agente porque `github.com` não resolve para clone. O GitHub Actions permanece evidência canônica para os gates integrados, PostgreSQL, build, smoke, E2E e responsividade.

### Evidência

Pendente da PR e do CI deste incremento. Não registrar como verde antes do resultado real.

## 11. Critérios de aceite

- [x] experiência clara de primeiro passo Lugares;
- [x] Explorar e Minha seleção reutilizam o mesmo `TripPlacePreference`;
- [x] WANT, MAYBE e NOT_INTERESTED disponíveis no card;
- [x] estado não avaliado preservado;
- [x] atualização inline sem redirect de sucesso no catálogo;
- [x] resumo da seleção visível e atualizado na página;
- [x] MUST_DO preservado como prioridade de WANT;
- [x] nenhum mínimo arbitrário imposto;
- [x] nenhuma seleção não dispara geração automática;
- [x] candidato externo é promovido antes da preferência;
- [x] Minha seleção não cria Activity;
- [x] catálogo, detalhe, ranking, filtros, mapa, imagens e distância preservados;
- [x] nenhuma migration ou estado paralelo criado;
- [ ] gates de CI verdes;
- [ ] Vercel Preview READY.

## 12. Riscos e pendências

- a moldura do wizard ainda não decide automaticamente quando deve desaparecer após um planejamento aceito; este incremento mantém a estrutura isolada para a transição posterior;
- a ação legada `addSelectionPlaceToItineraryAction` pode permanecer no arquivo de Server Actions por compatibilidade técnica, mas não é exposta nem utilizada pelo wizard;
- o detalhe de Place continua permitindo planejamento manual explícito, separado da preferência;
- a Etapa 4 deve definir contexto progressivo e a preparação da revisão, sem gerar complementos automaticamente.

## 13. Próximo corte

Etapa 4:

> Contexto da viagem e preferências progressivas + preparação da revisão, reutilizando contratos existentes e sem gerar ainda recomendações complementares automaticamente.
