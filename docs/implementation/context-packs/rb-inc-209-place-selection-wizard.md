---
id: RB-CTX-209
title: Context Pack do RB-INC-209 — Wizard de escolha de lugares
description: Delimita a implementação visual e funcional do primeiro passo do wizard de preparação usando TripPlacePreference e as superfícies existentes de Explorar e Minha seleção.
document_type: implementation-context-pack
owner: Experience and Trip Collection
status: Draft
version: "0.1.0"
created: "2026-09-21"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [implementation, context-pack, wizard, trip-place-preference, place-discovery]
related_documents: [RB-INC-209, RB-INC-208, RB-INC-207, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-CORE-0004, RB-DOM-001, RB-DOM-003, RB-UX-001, RB-UX-002, RB-ARC-002]
prerequisites: [RB-INC-208]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-209 — Wizard de escolha de lugares

## 1. Missão

Construir somente a experiência do passo **Lugares** da preparação da Trip, reaproveitando catálogo, detalhe, Minha seleção e `TripPlacePreference`.

Não criar agregado, persistência, migration ou intenção de domínio específica para wizard.

## 2. Unidade de trabalho

- Issue: [#509](https://github.com/collapsy/Routebook/issues/509).
- Branch: `codex/issue-509-place-selection-wizard`.
- Base: `main@a961028491c06586af040d37f817f2d9c3c39ac5`.
- Incremento: RB-INC-209.
- Pull Request: [#510](https://github.com/collapsy/Routebook/pull/510).
- Merge exige autorização humana explícita.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-ADR-027;
5. RB-ADR-028;
6. RB-ADR-029;
7. RB-INC-207 / RB-CTX-207;
8. RB-INC-208 / RB-CTX-208;
9. Product, Domain, UX e Architecture relacionados;
10. implementação atual de Explorar, Minha seleção, detalhe e TripPlacePreference;
11. issue #501 / PR #502 por tocar a mesma interação de preferência.

## 4. Estado herdado

A `main` já fornece:

- `TripPlacePreference` persistido;
- WANT, MAYBE e NOT_INTERESTED;
- MUST_DO somente sobre WANT;
- catálogo com descoberta externa;
- promoção de candidato externo para Place canônico;
- Minha seleção;
- detalhe de Place;
- ranking, filtros, imagens, mapa e distância;
- Proposal separada de Activity;
- origem/proveniência USER_SELECTED e ROUTEBOOK_RECOMMENDED representável.

A geração automática de ROUTEBOOK_RECOMMENDED não existe e permanece fora deste incremento.

## 5. Decisões do corte

### Wizard

O wizard é somente uma moldura de UX.

Etapas futuras aparecem como progresso informativo, sem links para páginas ainda inexistentes.

### Explorar e Minha seleção

```text
Explorar = descobrir e avaliar
Minha seleção = revisar o que já foi avaliado
```

As duas superfícies leem e alteram a mesma preferência.

### Atualização inline

A solução de #501/#502 é absorvida porque redirect de sucesso durante seleção rápida quebra continuidade e posição de rolagem.

Server Actions retornam resultado tipado para o controle cliente. Erro faz rollback; sucesso mantém a URL.

### Resumo

A página deriva as contagens do estado persistido inicial e recebe eventos locais após mutações bem-sucedidas para atualizar o resumo sem substituir a grade.

Esse evento é estado de apresentação, não novo estado canônico.

### Activity

Nenhuma ação de preferência cria Activity.

Minha seleção deixa de expor o formulário `addSelectionPlaceToItineraryAction` durante o wizard.

## 6. Caminhos permitidos

Somente os caminhos declarados na seção 9 do RB-INC-209.

## 7. Proibições

- criar WizardSelectedPlace ou equivalente;
- criar migration/tabela para o wizard;
- transformar MUST_DO em intenção;
- criar preferência para entidade externa não canônica;
- gerar ROUTEBOOK_RECOMMENDED;
- gerar Proposal;
- criar Activity como efeito de preferência;
- implementar Contexto/Revisão/Proposta funcionalmente;
- alterar Domain/ADR por conveniência;
- tocar Production;
- integrar na main sem autorização.

## 8. Verificações mínimas

- WANT/MAYBE/NOT_INTERESTED funcionam no card;
- unrated permanece ausência de preferência;
- troca de intenção persiste;
- clear remove preferência;
- resumo reage a mudança;
- MUST_DO só aparece de forma acionável sobre WANT;
- external candidate é promovido antes da preferência;
- catálogo e detalhe continuam consistentes;
- Minha seleção reflete persistência;
- nenhum CTA de Minha seleção cria Activity;
- roteiro não recebe Activity ao apenas selecionar Place;
- controles possuem `aria-pressed`, feedback e alvos utilizáveis no mobile;
- etapas futuras não são links falsos.

## 9. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Usar CI como evidência canônica para PostgreSQL, smoke, E2E, responsividade, build e Preview.

## 10. Gate humano

Quando PR, CI e Preview estiverem prontos, parar antes do merge e informar Issue, branch, PR, HEAD, arquivos, comportamento, testes, CI, Vercel, riscos e decisões adiadas.
