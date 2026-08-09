---
id: RB-CTX-105
title: Context Pack do RB-INC-105 — Server Action de Edição de Itinerary Proposal
description: Contexto operacional da fronteira web autorizada para editar Proposed Activity sem duplicar domínio ou persistência.
document_type: implementation-context
owner: Engineering
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
  - server-action
  - context-pack
related_documents:
  - RB-INC-105
  - RB-INC-104
  - RB-INC-103
  - RB-PRD-006
  - RB-UX-005
prerequisites:
  - RB-INC-104
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-105 — Server Action de Edição de Itinerary Proposal

## Objetivo

Preservar as decisões de implementação da fronteira server-side que expõe a edição persistida de Proposed Activity para a futura experiência visual.

## Fronteira atual

O RB-INC-105 não implementa UI. Ele introduz duas camadas:

1. um executor testável em `apps/web/lib`, responsável por parsing, autorização, tradução de erros e chamada ao application service;
2. uma Server Action fina na rota de Proposal, responsável por construir dependências concretas e revalidar cache após sucesso.

## Invariantes

1. `trip:edit` é a permissão canônica para editar conteúdo de uma Proposal;
2. input estruturalmente inválido deve falhar antes de resolver acesso;
3. acesso deve ser resolvido antes de qualquer load ou persistência de Proposal;
4. a camada web não escreve diretamente no repository nem no banco;
5. `editAndPersistItineraryProposalProposedActivity` continua sendo a única operação de aplicação para a edição persistida;
6. `DrizzleItineraryProposalRepository` é instanciado somente na fronteira concreta da Server Action;
7. IDs recebidos como string devem ser validados e convertidos para tipos canônicos antes de entrar no domínio;
8. campo omitido preserva o valor atual; campo opcional presente e vazio representa limpeza explícita;
9. `exactOptionalPropertyTypes` deve ser respeitado: propriedades opcionais não podem ser materializadas com `undefined`;
10. a Server Action só revalida a rota de Proposal após sucesso;
11. erro recuperável não navega, não revalida e não persiste;
12. erro técnico não deve vazar detalhes de banco, autorização ou domínio para o cliente;
13. o Itinerary confirmado permanece fora desta operação.

## Códigos de erro públicos

- `unauthenticated`: não há sessão válida;
- `not-found`: a Trip não está disponível para o usuário;
- `invalid-request`: IDs ou mudanças não são válidos;
- `proposal-not-found`: a Proposal não existe mais;
- `proposal-not-ready`: a Proposal saiu do estado editável;
- `proposed-activity-not-found`: a atividade não pertence mais à Proposal;
- `technical-error`: falha inesperada ou estado impossível.

## Parsing de campos

### Texto obrigatório

`title`, quando enviado, precisa produzir texto não vazio.

### Texto opcional

`description`, `flexibility` e moeda/campos equivalentes podem ser limpos explicitamente com valor vazio, resultando em `null` quando suportado pelo contrato do domínio.

### Horário

Aceita `HH:mm` ou `HH:mm:ss` e preserva a representação válida entregue ao domínio.

### Números

- duração: inteiro positivo;
- ordem: inteiro não negativo;
- custo: número finito não negativo.

### Moeda

Quando presente e não vazia, é normalizada em caixa alta e validada com três letras.

## Estratégia de teste

### Executor

Deve provar:

- validação antes da autorização;
- autorização antes do service;
- normalização de todos os campos editáveis;
- distinção entre omissão e limpeza;
- tradução de erros do application service;
- normalização de falhas técnicas;
- rejeição de status inesperado retornado pelo service.

### Server Action

Deve provar:

- delegação do `FormData` para o executor;
- uso das dependências concretas;
- revalidação exclusivamente no sucesso;
- preservação de erros recuperáveis;
- fallback seguro para exceção inesperada.

## Evidência técnica

O SHA `fdba3b2c2c2e88987936d04c673748f764b49f35` passou no Engineering Validation #1306 / run `31257205455`, incluindo format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo.

## Próxima lacuna

A próxima fronteira recomendada é a experiência visual de edição na página de revisão da Proposal. Ela deve consumir `editItineraryProposalAction`, tornar a alteração explícita para o viajante e manter o aceite como ação posterior e separada.
