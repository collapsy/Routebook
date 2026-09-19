---
id: RB-CTX-205
title: Context Pack do RB-INC-205 — ReplanningWindow e delta temporal
description: Delimita o cálculo puro da janela temporal de replanejamento e a elegibilidade das operações delta existentes.
document_type: implementation-context-pack
owner: Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-09-19"
last_updated: "2026-09-19"
authors: [RouteBook Team]
tags: [implementation, context-pack, itinerary, replanning, timezone]
related_documents: [RB-INC-205, RB-ADR-028, RB-INC-204, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002]
prerequisites: [RB-INC-204]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-205 — ReplanningWindow e delta temporal

## 1. Missão

Implementar somente o núcleo puro do passo 7 do RB-ADR-028 necessário para classificar a janela temporal de replanejamento e validar os deltas já existentes.

## 2. Unidade de trabalho

- issue: [#497](https://github.com/collapsy/Routebook/issues/497);
- PR: a abrir;
- branch: `codex/issue-497-replanning-window`;
- base: `main@61169a75249744743df8b65081f5a4d4712f91cc`;
- merge na `main` permanece gate humano.

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
10. RB-INC-204.

## 4. Decisões já tomadas

- `ReplanningWindow` é timezone-aware;
- relógio é injetado;
- passado é imutável;
- trecho transcorrido do Dia atual é protegido;
- ausência de horário no Dia atual é tratada conservadoramente;
- `fixed` e Activities terminais são protegidas;
- `unavailable` e `needs-review` futuras podem participar de Proposal explícita;
- passagem do tempo não muda status;
- `add | move | update | remove` já são os deltas canônicos existentes.

## 5. Não decidir neste incremento

- não criar novo `generationScope` persistido;
- não adicionar tabela/coluna;
- não criar gerador REPLAN paralelo;
- não inventar novo ActivityStatus;
- não alterar lifecycle;
- não decidir UI;
- não alterar contrato canônico de Proposal;
- não aplicar Proposal.

## 6. Caminhos

Alterar somente os caminhos do RB-INC-205.

## 7. Regras de implementação

- preferir funções puras;
- usar `Intl.DateTimeFormat`/timezone IANA ou mecanismo equivalente da plataforma, sem timezone local do servidor;
- validar `capturedAt` e timezone;
- normalizar data/hora locais de forma determinística;
- validar identidade única de Dia e Activity;
- preservar ordem determinística do snapshot;
- erro deve ser estruturado;
- delta inválido falha antes de qualquer mutação;
- não importar framework, ORM ou Provider.

## 8. Cobertura mínima

- America/Fortaleza ou outro timezone sem DST;
- timezone com DST, por exemplo America/New_York, em fronteira válida;
- instante UTC que cruza data local;
- Dia anterior;
- Dia atual com Activity encerrada;
- Dia atual em andamento;
- Dia atual sem duração com início passado;
- Dia atual sem horário;
- Activity futura;
- Dia futuro;
- fixed;
- completed/skipped/cancelled/removed;
- unavailable/needs-review futuros;
- add/move/update/remove;
- duplicidade de IDs;
- timezone inválido;
- `capturedAt` inválido;
- imutabilidade.

## 9. Gate humano

Após CI integral, a PR permanece aberta até autorização explícita para merge.
