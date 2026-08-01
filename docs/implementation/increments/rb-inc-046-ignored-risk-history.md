---
id: RB-INC-046
title: Histórico de Riscos Ignorados
description: Torna visível na Revisão a rastreabilidade dos Planning Conflicts ignorados e das Decisions correlacionadas, sem restaurar ou alterar estado.
document_type: implementation-increment
owner: Planning Assurance
status: Draft
version: "0.1.0"
created: "2026-07-31"
last_updated: "2026-07-31"
authors:
  - RouteBook Team
tags:
  - planning-assurance
  - planning-conflict
  - decision
  - auditability
  - itinerary-review
  - vertical-slice
related_documents:
  - RB-DEL-001
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-UX-003
  - RB-UX-005
  - RB-ADR-003
  - RB-ADR-010
  - RB-ADR-011
  - RB-INC-045
prerequisites:
  - RB-INC-045
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-046 — Histórico de Riscos Ignorados

## 1. Objetivo

Apresentar na Revisão de Conflitos os Riscos atualmente em estado `ignored` e a `Decision` que autorizou cada transição, tornando a rastreabilidade compreensível sem restaurar, resolver ou alterar qualquer estado canônico.

## 2. Resultado utilizável

Após ignorar um Risco, o usuário continuará vendo que a condição é conhecida e foi aceita conscientemente. O histórico mostrará o conteúdo explicável do conflito, o instante da decisão e a autoria conhecida, separado da lista de conflitos abertos.

## 3. Composição

O read model deverá combinar, somente para apresentação:

- `PlanningConflict` em estado `ignored`;
- `Decision` referenciada por `ignoredDecisionId`;
- Itinerary para títulos de Dia e Activities;
- participantes da Trip para nome conhecido do ator.

Uma correlação ausente ou incompatível deverá falhar de forma recuperável. Participante histórico não localizado deverá ser apresentado como autoria indisponível, sem inferência.

## 4. Experiência

- separar “Conflitos abertos” de “Riscos ignorados”;
- manter histórico fora das contagens e filtros dos itens abertos;
- informar que ignorar não resolveu a condição;
- apresentar título, explicação, impacto, instante e autoria disponível;
- quando não houver conflito aberto e houver histórico, comunicar ambos os fatos;
- não exibir ações `Restaurar` ou `Resolver`;
- preservar teclado, foco, semântica e responsividade.

## 5. Critérios de aceite

- [ ] read model expõe coleção separada de Riscos ignorados;
- [ ] somente estado `ignored` e severidade `risk` entra no histórico atual;
- [ ] cada item valida a `Decision` correlacionada e pertencente à mesma Trip;
- [ ] nome conhecido do ator substitui seu ID interno;
- [ ] autoria indisponível é comunicada sem inferência;
- [ ] contagens e filtros continuam representando apenas conflitos `open`;
- [ ] estado combinado sem conflitos abertos e com histórico é correto;
- [ ] nenhuma mutação ou ação de restauração é introduzida;
- [ ] testes cobrem composição, integridade, interface e jornada responsiva.

## 6. Testes obrigatórios

- composição com `PlanningConflict`, `Decision`, Itinerary e participante;
- rejeição de correlação ausente, cross-trip ou incompatível;
- autoria indisponível;
- contagens abertas independentes do histórico;
- interface com itens abertos, somente histórico e vazio total;
- ausência de `Restaurar` e `Resolver`;
- E2E desktop e mobile após `IgnorePlanningRisk`;
- gates completos do monorepo.

## 7. Riscos

- esconder Risco ignorado no estado vazio;
- contar histórico como conflito aberto;
- expor ID interno do ator;
- inventar autoria;
- transformar leitura histórica em restauração implícita.

## 8. Fora de escopo

- `RestoreIgnoredPlanningRisk`;
- `resolved` ou `ResolvePlanningConflict`;
- reabertura ou novo agregado;
- histórico de estados terminais `invalidated` e `superseded`;
- edição do Roteiro;
- nova autenticação;
- Providers, IA, notificações ou analytics.

## 9. Evidências de conclusão

A implementação `3f0114b` foi validada na PR acumulada #105 pelos workflows Documentation Validation (`30679248776`) e Engineering Validation (`30679248768`, tentativa 2), incluindo migration, testes de integração e Playwright desktop/mobile. A primeira tentativa do workflow de engenharia não iniciou o checkout por timeout externo ao baixar a imagem PostGIS; a reexecução passou integralmente sem alteração de código.
