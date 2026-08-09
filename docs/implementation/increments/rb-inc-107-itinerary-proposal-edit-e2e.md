---
id: RB-INC-107
title: E2E Integral da Edição de Itinerary Proposal
description: Prova em navegador real a edição autorizada de Proposed Activity da UI ao PostgreSQL, com reidratação e preservação do Itinerary confirmado.
document_type: implementation-increment
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-09"
last_updated: "2026-08-09"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - proposal-editing
  - e2e
  - playwright
  - postgresql
related_documents:
  - RB-PRD-006
  - RB-UX-005
  - RB-INC-104
  - RB-INC-105
  - RB-INC-106
prerequisites:
  - RB-INC-106
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-107 — E2E Integral da Edição de Itinerary Proposal

## 1. Objetivo

Provar em navegador real que a experiência visual do RB-INC-106 percorre a Server Action autorizada do RB-INC-105, persiste a revisão da Proposal no PostgreSQL pelo contrato do RB-INC-104 e reidrata o estado editado sem alterar o Itinerary confirmado.

Issue: #243.

Branch: `feature/rb-inc-107-itinerary-proposal-edit-e2e`.

PR: #244.

## 2. Escopo

- fixture autenticada real com Trip, Itinerary e Proposal `ready` persistidos;
- navegação real até a página de revisão;
- abertura do editor de uma Proposed Activity;
- alteração de Dia, título, descrição, horário, duração, flexibilidade, custo e moeda;
- submit pela Server Action real;
- verificação da Proposal reidratada via repository;
- verificação direta das tabelas `itinerary_proposals` e `proposed_activities` por SQL;
- validação de avanço e preservação de `updatedAt`;
- reload da página e confirmação do prefill persistido;
- prova de que versão e Activities do Itinerary confirmado permanecem inalteradas;
- cenário concorrente em que a Proposal deixa de estar `ready` antes do submit;
- verificação de erro recuperável e ausência de sobrescrita nesse cenário;
- execução pelos projetos desktop e mobile do Playwright responsivo;
- governança e CI.

## 3. Cenário de sucesso integral

A fixture cria um Itinerary confirmado com `Café já confirmado` e uma Proposal `ready` contendo `Mirante ao pôr do sol` como operação `add`.

O navegador:

1. abre a página autenticada de Proposal;
2. expande `Editar sugestão: Mirante ao pôr do sol`;
3. move a sugestão para o segundo Dia;
4. altera conteúdo e estimativas;
5. salva pela Server Action;
6. observa a revisão reidratada com os novos valores;
7. recarrega a página e confirma o mesmo estado persistido.

O teste então confirma via repository e SQL que apenas a Proposal/Proposed Activity mudou.

## 4. Preservação do Itinerary

Antes e depois da edição são comparados:

- `itinerary.id`;
- `itinerary.version`;
- todas as Activities confirmadas por Dia;
- ausência do título editado entre as Activities do Itinerary.

A igualdade estrutural das Activities é obrigatória. A edição não pode produzir efeito colateral no Roteiro confirmado.

## 5. Concorrência recuperável

O segundo cenário abre o editor enquanto a Proposal ainda está `ready`, altera o formulário local e, antes do submit, rejeita a Proposal diretamente pelo repository para simular uma decisão concorrente.

Ao salvar:

- a Server Action deve retornar `proposal-not-ready` traduzido para mensagem recuperável;
- o alerta deve permanecer no contexto do formulário;
- o título digitado localmente não pode ser persistido;
- a Proposal deve permanecer `rejected`;
- a Proposed Activity persistida deve manter o conteúdo anterior;
- o Itinerary continua idêntico.

## 6. Assertions de persistência

O E2E valida tanto o repository quanto SQL bruto para evitar falso positivo de UI. A query confirma:

- status da Proposal;
- `updated_at`;
- `proposedActivityId`;
- `targetTripDayId`;
- título e descrição;
- horário PostgreSQL normalizado;
- duração;
- operação;
- flexibilidade;
- custo e moeda;
- `reason` preservado.

## 7. Responsividade

O spec não fixa projeto Playwright. Ele é executado pela suíte responsiva canônica e, portanto, cobre os projetos desktop e mobile configurados no monorepo.

## 8. Critérios de aceite

- [x] fluxo UI → Server Action → PostgreSQL → reidratação foi coberto em navegador real;
- [x] valores editados persistem após reload;
- [x] repository retorna a Proposal editada;
- [x] SQL confirma os valores persistidos;
- [x] `updatedAt` avança no sucesso;
- [x] operação, razão e identidade da Proposed Activity permanecem preservadas;
- [x] Itinerary mantém id, versão e Activities confirmadas;
- [x] cenário concorrente retorna erro recuperável;
- [x] cenário concorrente não sobrescreve a Proposed Activity;
- [x] cenário concorrente não altera o Itinerary;
- [x] Engineering Validation técnico passou incluindo Playwright responsivo;
- [x] registry, Context Pack e matriz de rastreabilidade sincronizados.

## 9. Evidências técnicas

- spec: `apps/web/e2e/itinerary-proposal-editing.spec.ts`;
- SHA técnico validado: `35b4b75859ffa6e4decd7b498189da84ff3a6a76`;
- Engineering Validation #1329 / run `31327843734`: success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo;
- cenário de sucesso valida persistência/reload e preservação do Itinerary;
- cenário concorrente valida `proposal-not-ready` sem escrita indevida.

## 10. Gate de promoção

Antes do merge, Documentation Validation e Engineering Validation devem passar no mesmo HEAD canônico contendo implementação e governança completas.

## 11. Próximo recorte esperado

Após consolidar a edição completa, o próximo incremento deve ser derivado da próxima lacuna funcional canônica de Itinerary Proposal ainda obrigatória no MVP, sem reabrir contratos já comprovados por esta cadeia.
