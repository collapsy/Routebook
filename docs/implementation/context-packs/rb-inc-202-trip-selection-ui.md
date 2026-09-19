---
id: RB-CTX-202
title: Context Pack do RB-INC-202 — Minha seleção
description: Delimita a exposição de TripPlacePreference em Explorar, Detalhes e Minha seleção sem alterar Proposal ou persistência.
document_type: implementation-context-pack
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip-collection, ux, selection]
related_documents: [RB-INC-202, RB-INC-201, RB-ADR-028, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-UX-001, RB-UX-002, RB-UX-005]
prerequisites: [RB-INC-201]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-202 — Minha seleção

## 1. Missão

Tornar TripPlacePreference utilizável na interface sem introduzir novo conceito de domínio, sem alterar a persistência e sem conectar ainda a coleção à geração de Proposal.

## 2. Unidade de trabalho

- issue: [#489](https://github.com/collapsy/Routebook/issues/489);
- incremento: RB-INC-202;
- branch: `codex/issue-489-trip-selection-ui`;
- base: `d2887427aa84834d8074c538f091fcb5898f86f6`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-DOM-001;
5. RB-DOM-002;
6. RB-DOM-003;
7. RB-DOM-004;
8. RB-UX-001;
9. RB-UX-002;
10. RB-UX-005;
11. RB-ADR-028;
12. RB-INC-200;
13. RB-INC-201 / RB-CTX-201;
14. implementação vigente de Lugares, Detalhes e Lugares Salvos.

## 4. Decisões normativas

- UI oficial da Trip Collection: **Minha seleção**;
- WANT: **Quero ir**;
- MAYBE: **Talvez**;
- NOT_INTERESTED: **Não tenho interesse**;
- MUST_DO: **Imperdível**;
- ausência: não avaliado;
- preferência e Activity são independentes;
- Planejado é derivado do Roteiro;
- rota física antiga permanece temporariamente.

## 5. Regras de implementação

- usar `DrizzleTripPlacePreferenceRepository`;
- usar funções puras do módulo Trip Collection por meio do helper de aplicação web;
- gerar ID/tempo na fronteira de aplicação, não no domínio;
- não escrever diretamente em `saved_places`;
- não usar `DrizzleSavedPlaceRepository` nas superfícies migradas;
- validar autorização antes de mutation;
- revalidar as superfícies afetadas;
- não criar/remover Activity ao alterar preferência.

## 6. Estado planejado

Derivar exclusivamente de Itinerary:

```text
plannedPlaceIds =
  Activities
  where placeId exists
  and status not in [removed, cancelled]
```

Não criar coluna, enum ou evento novo.

## 7. Candidatos externos

A preferência só é persistida depois da revalidação server-side e materialização canônica do Place.

Form fields externos não são fonte confiável para nome, coordenada, categoria ou provenance.

## 8. Caminhos

Alterar somente os caminhos declarados no RB-INC-202.

## 9. Restrições

- não alterar Domain;
- não alterar Database;
- não criar migration;
- não alterar Proposal;
- não implementar ReplanningWindow;
- não remover compatibilidade Saved Places;
- não executar deploy/migration de Production;
- não renomear rota física.

## 10. Verificações

- intenção troca sem criar nova preferência;
- Imperdível falha fora de WANT;
- clear remove apenas preferência;
- Explorar usa preferência canônica;
- candidato externo preserva intenção;
- Minha seleção inclui NOT_INTERESTED;
- estado Planejado ignora removed/cancelled;
- mutações usam trip:edit;
- textos visíveis evitam Salvos como conceito principal;
- CI completo verde.

## 11. Gate humano

Merge na `main` exige aprovação humana explícita.

## 12. Relatório final

Informar arquivos, comportamento, testes, riscos, issue, PR e confirmar ausência de ação em Production.
