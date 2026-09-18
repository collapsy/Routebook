---
id: RB-CTX-202
title: Context Pack do RB-INC-202 — Minha seleção e intenção por Lugar
description: Delimita a transição da interface Saved Places para TripPlacePreference no app web.
document_type: implementation-context-pack
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip-collection, trip-place-preference, ux, web]
related_documents: [RB-INC-202, RB-INC-201, RB-ADR-028, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-UX-002, RB-ARC-002]
prerequisites: [RB-INC-201]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-202 — Minha seleção e intenção por Lugar

## 1. Missão

Expor `TripPlacePreference` como experiência principal de seleção na web sem alterar schema, Proposal ou Roteiro automaticamente.

## 2. Unidade de trabalho

- issue: [#487](https://github.com/collapsy/Routebook/issues/487);
- incremento: RB-INC-202;
- branch: `codex/issue-487-trip-place-preference-ui`;
- base: `d2887427aa84834d8074c538f091fcb5898f86f6`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-DOM-001 — Trip Collection / TripPlacePreference;
5. RB-DOM-002 — linguagem canônica;
6. RB-DOM-003 — regras COL;
7. RB-DOM-004 — eventos;
8. RB-UX-002 — RB-UF-007, 008, 009 e fluxo selection-first;
9. RB-ARC-002;
10. RB-ADR-028;
11. RB-INC-199;
12. RB-INC-200;
13. RB-INC-201 e RB-CTX-201;
14. superfícies atuais de Lugares, detalhe e `/lugares-salvos`.

## 4. Decisões normativas

- Trip Collection é “Minha seleção” na interface;
- `WANT` = “Quero ir”;
- `MAYBE` = “Talvez”;
- `NOT_INTERESTED` = “Não tenho interesse”;
- `MUST_DO` = “Imperdível”;
- ausência = não avaliado;
- preferência não cria Activity;
- Clear não remove Activity;
- rota física `/lugares-salvos` permanece neste incremento;
- `DrizzleTripPlacePreferenceRepository` é a leitura/escrita canônica da UI nova;
- `DrizzleSavedPlaceRepository` é legado e não deve dirigir as novas superfícies.

## 5. Caminhos permitidos

Somente os caminhos listados na seção 10 do RB-INC-202.

## 6. Restrições

- nenhuma migration;
- nenhum schema;
- nenhuma mudança em `modules/trip-collection`;
- nenhuma mudança em `packages/database`;
- nenhum Provider;
- nenhuma alteração do gerador de Proposal;
- nenhuma implementação de Planning Role;
- nenhuma ReplanningWindow;
- nenhuma aplicação automática ao Roteiro;
- nenhum rename físico da rota.

## 7. Fronteira de escrita

Para Place canônico:

```text
UI
 ↓
Server Action
 ↓
autorização trip:edit
 ↓
resolver Place no contexto da Trip
 ↓
DrizzleTripPlacePreferenceRepository.find
 ↓
createTripPlacePreference | changeTripPlacePreference
 ↓
save/remove
 ↓
revalidate catálogo + detalhe + Minha seleção
```

Identidade nova pode ser gerada na camada de aplicação. As invariantes permanecem no domínio.

## 8. Componente de interface

Um único controle deve ser reutilizado por catálogo, detalhe e Minha seleção.

Ele oferece:

- Quero ir;
- Talvez;
- Não tenho interesse;
- Imperdível somente quando WANT;
- Limpar preferência quando existir estado persistido.

A opção atualmente ativa deve ser identificável semanticamente e não depender somente de cor.

## 9. Candidato externo

Candidato externo ainda não é Place canônico.

A ação “Quero ir” mantém a sequência vigente:

1. revalidar candidato;
2. materializar Place global;
3. persistir `WANT`;
4. navegar para Minha seleção.

Suporte às três intenções diretamente no card externo fica fora deste incremento para não duplicar identidade antes da materialização.

## 10. Minha seleção

A página deve incluir todas as preferências persistidas, não somente `WANT`.

A ordenação existente por criação pode ser mantida. Lugar sem preferência não aparece.

A adição manual ao Roteiro não altera a preferência.

## 11. Verificações

- `WANT`, `MAYBE`, `NOT_INTERESTED` persistem;
- `MUST_DO` só aparece e persiste com WANT;
- trocar intent remove prioridade incompatível;
- repetir escolha não grava novamente;
- Clear remove somente a preferência;
- catálogo e detalhe usam o mesmo repository;
- Minha seleção inclui os três intents;
- navegação não usa “Salvos” como conceito principal;
- nenhum arquivo de schema/migration é alterado;
- regressão integral permanece verde.

## 12. Gate humano

- merge na `main` exige confirmação humana;
- nenhuma ação de Production faz parte do incremento.

## 13. Relatório final

Informar:

- superfícies convertidas;
- compatibilidade mantida;
- testes reais;
- ausência de migration;
- issue e PR;
- pendências para Proposal/Planning Role/ReplanningWindow.
