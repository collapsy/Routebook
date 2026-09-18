---
id: RB-CTX-199
title: Context Pack do RB-INC-199 — Contrato canônico de seleção e replanejamento
description: Delimita a atualização documental de TripPlacePreference, Minha seleção, origem da Proposal e janela temporal de replanejamento.
document_type: implementation-context-pack
owner: Domain, Product, Experience and Architecture
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip-place-preference, itinerary-proposal, replanning]
related_documents: [RB-INC-199, RB-ADR-028, RB-CORE-0004, RB-PRD-004, RB-PRD-005, RB-PRD-006, RB-PRD-007, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-UX-001, RB-UX-002, RB-UX-005, RB-ARC-002, RB-ADR-027]
prerequisites: [RB-INC-196]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-199 — Contrato canônico de seleção e replanejamento

## 1. Missão

Publicar a decisão de domínio e experiência que transforma Salvos em Minha seleção, sem implementar a mudança e sem enfraquecer os limites Place → preferência → Proposal → aceite → Activity.

## 2. Unidade de trabalho

- issue: [#481](https://github.com/collapsy/Routebook/issues/481);
- pull request: [#482](https://github.com/collapsy/Routebook/pull/482);
- branch: `codex/issue-481-selection-replanning-contract`;
- base: `origin/main@3beceb737edfc390c9e56eecf90f006fac8342b0`;
- decisão humana: pacote aprovado em `2026-09-18`;
- implementação, migration, Preview, Production e merge permanecem fora do escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004 — RouteBook Bible;
3. `docs/README.md`;
4. RB-PRD-004 — Jornadas do Usuário;
5. RB-PRD-005 — Casos de Uso;
6. RB-PRD-006 — Requisitos Funcionais;
7. RB-PRD-007 — Regras de Negócio;
8. RB-DOM-001 — Modelo de Domínio;
9. RB-DOM-002 — Linguagem Ubíqua;
10. RB-DOM-003 — Regras e Invariantes;
11. RB-DOM-004 — Eventos e Ciclos de Vida;
12. RB-UX-001 — Arquitetura da Informação;
13. RB-UX-002 — Fluxos do Usuário;
14. RB-UX-005 — Especificações de Interação;
15. RB-ARC-002 — Módulos e Contextos Delimitados;
16. RB-ADR-027 — aplicação transacional de Proposal;
17. RB-INC-191 e RB-INC-196 — origem e composição atuais da Proposal;
18. RB-ADR-028, RB-INC-199 e este Context Pack.

## 4. Hierarquia aplicada

- a Bible preserva controle humano, Proposal não aplicada e Saved Place distinto de Activity;
- RB-ADR-028 evolui a associação contextual sem alterar Place ou Activity;
- documentos canônicos de Domain definem termos e invariantes;
- Product e UX descrevem a jornada;
- Architecture atribui ownership;
- este incremento não autoriza implementação.

## 5. Contratos normativos

### TripPlacePreference

```text
intent = WANT | MAYBE | NOT_INTERESTED
priority = MUST_DO | null
unrated = ausência de registro
```

`MUST_DO` exige `WANT`. Limpar a preferência retorna a não avaliado.

### Candidate set

```text
WANT
+ MAYBE apenas com includeMaybe=true
- NOT_INTERESTED
- não avaliados
```

Recommendation e Discovery não são fontes autoritativas sem ação explícita do usuário.

### Planning Role

```text
EXPERIENCE | FOOD | NIGHTLIFE | OTHER
```

O papel é derivado por política versionada e não substitui Place Category.

### ReplanningWindow

Usa timezone IANA da Trip e relógio injetável. Passado, trecho transcorrido, Activity em andamento, sem horário no Dia atual, terminal ou `fixed` são protegidos. Futuro elegível continua sujeito a conflitos, Free Periods e aceite.

## 6. Compatibilidade obrigatória

- Saved Place existente futuramente equivale a `WANT` sem prioridade.
- Nenhuma linha, ID ou Activity pode ser perdida na migração futura.
- Save/Unsave podem existir temporariamente apenas como adaptadores.
- `/lugares-salvos` pode permanecer como alias durante a transição.
- Proposal persistida antes da evolução deve continuar legível.

## 7. Limite entre contextos

- Place Catalog possui fatos do Place e sua categoria.
- Trip Collection possui TripPlacePreference.
- Recommendation/Discovery apresentam opções, sem criar preferência.
- Proposal Management consome snapshot explícito da seleção e calcula Proposal.
- Itinerary Planning fornece Activities, Free Periods e versão atual e aplica somente operações aceitas.
- Trip Management fornece timezone IANA e Período.

## 8. Caminhos permitidos

Somente os caminhos declarados na seção 6 do RB-INC-199.

## 9. Proibições

- não alterar código, schema ou migration;
- não criar sinônimo de TripPlacePreference;
- não representar não avaliado como linha persistida;
- não fazer Recommendation virar escolha automática;
- não criar Activity ao expressar intenção;
- não transformar densidade em meta obrigatória;
- não inferir conclusão de Activity pelo relógio;
- não usar timezone do servidor;
- não tocar Preview ou Production;
- não fazer merge na `main`.

## 10. Verificações mínimas

- IDs e relações documentais válidos;
- linguagem coerente entre Domain, Product, UX e Architecture;
- ausência de conflito com RB-CORE-0004 e RB-ADR-027;
- transição Saved → WANT explícita;
- janela temporal completa e conservadora;
- `node scripts/validate-docs.mjs` verde;
- `pnpm format:check` verde.

## 11. Gate humano seguinte

Após a publicação documental, um novo incremento deverá ser aprovado antes de qualquer mudança de domínio executável. O candidato recomendado é o núcleo puro de TripPlacePreference, ainda sem persistence.
