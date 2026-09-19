---
id: RB-CTX-203
title: Context Pack do RB-INC-203 — TripPlacePreference na Itinerary Proposal
description: Delimita a troca da origem automática de candidatos da Proposal para a seleção explícita da Trip.
document_type: implementation-context-pack
owner: Proposal Management and Trip Collection
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip-collection, itinerary-proposal, selection]
related_documents: [RB-INC-203, RB-ADR-028, RB-INC-199, RB-INC-200, RB-INC-201, RB-INC-202, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002]
prerequisites: [RB-INC-202]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-203 — TripPlacePreference na Itinerary Proposal

## 1. Missão

Implementar o passo 5 do RB-ADR-028: TripPlacePreference passa a ser a origem autoritativa dos candidatos automáticos da Itinerary Proposal.

## 2. Unidade de trabalho

- issue: [#492](https://github.com/collapsy/Routebook/issues/492);
- PR: [#493](https://github.com/collapsy/Routebook/pull/493);
- branch: `codex/issue-492-trip-selection-proposal-candidates`;
- base: `main@8818b948d0d0de478ae16965d4681586ac4f7c8f`;
- merge na main permanece gate humano.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-DOM-001;
5. RB-DOM-002;
6. RB-DOM-003;
7. RB-DOM-004;
8. RB-ARC-002;
9. RB-ADR-028;
10. RB-INC-199;
11. RB-INC-200;
12. RB-INC-201;
13. RB-INC-202;
14. RB-INC-191 e RB-INC-196 para compreender o pipeline histórico que será substituído.

## 4. Invariantes

- preferência não cria Activity;
- Proposal não é estado aplicado;
- WANT participa por padrão;
- MAYBE exige `includeMaybe=true`;
- NOT_INTERESTED e ausência não participam;
- MUST_DO só existe sobre WANT e recebe precedência;
- Place já planejado não deve ser duplicado;
- gerar Proposal não cria TripPlacePreference;
- Recommendation/Discovery não equivalem a escolha do viajante;
- seleção vazia ou pequena é válida.

## 5. Orquestração alvo

```text
TripPlacePreference
→ snapshot autoritativo
→ filtro WANT / MAYBE opt-in
→ facts do Place
→ ItineraryProposalGenerationCandidate
→ compositor determinístico existente
→ Itinerary Proposal
→ aceite explícito
```

Não executar Discovery na mutação de geração.

## 6. Ordenação mínima

A ordem de candidatos deve ser estável:

1. WANT + MUST_DO;
2. WANT sem prioridade;
3. MAYBE quando habilitado;
4. ordem persistida/identidade estável como desempate.

A precedência não substitui as regras de capacidade, diversidade e proximidade do compositor.

## 7. Activities já planejadas

Ao montar o snapshot, Places presentes em Activities ativas são excluídos da fonte candidata.

Estados removidos/cancelados não devem transformar um Place em “planejado” ativo.

## 8. includeMaybe

- booleano de geração;
- default `false`;
- controlado explicitamente pelo usuário;
- não persistido como alteração da TripPlacePreference;
- `contextSnapshotId` registra `selection:want` ou `selection:want-maybe`;
- quando MAYBE entrar, a justificativa do candidato explicita que houve inclusão intencional.

## 9. Caminhos

Alterar somente os caminhos declarados no RB-INC-203. O teste PostgreSQL do serviço autoritativo também integra o escopo porque precisa deixar de preparar Recommendation como fonte da geração e passar a preparar TripPlacePreference explícita.

## 10. Proibições

- não alterar Domain;
- não alterar schema;
- não criar migration;
- não implementar ReplanningWindow;
- não introduzir Provider;
- não inferir preferência por Recommendation/Discovery;
- não aplicar Proposal automaticamente;
- não tocar Production;
- não fazer push direto na main;
- não fazer merge sem autorização humana.

## 11. Verificações mínimas

- WANT entra;
- MAYBE default não entra;
- MAYBE com opt-in entra;
- NOT_INTERESTED não entra;
- MUST_DO aparece antes de WANT comum;
- duplicata já planejada é omitida;
- Recommendation existente sem preferência não entra;
- Discovery loader não é chamado pela ação;
- UI envia includeMaybe corretamente;
- Proposal vazia permanece tratada;
- CI completo verde.

## 12. Gate humano

Após implementação, testes e CI, a PR permanece aberta até autorização explícita para merge.
