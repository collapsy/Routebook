---
id: RB-INC-048
title: Solicitação e Geração Inicial de Itinerary Proposal
description: Ativa o núcleo independente de Proposal Management para solicitar, iniciar, falhar e cancelar a geração de uma Itinerary Proposal vinculada às versões base.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-07-31"
last_updated: "2026-07-31"
authors:
  - RouteBook Team
tags:
  - implementation
  - proposal-management
  - itinerary-proposal
  - domain
related_documents:
  - RB-CORE-0004
  - RB-PRD-006
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-DATA-001
  - RB-INC-047
prerequisites:
  - RB-INC-047
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-048 — Solicitação e Geração Inicial de Itinerary Proposal

## 1. Objetivo

Criar o primeiro contrato executável do bounded context Proposal Management, capaz de representar uma solicitação de Itinerary Proposal e suas transições iniciais sem gerar conteúdo, persistir dados ou alterar o Itinerary.

Issue: [#108](https://github.com/collapsy/Routebook/issues/108)

Branch: `codex/rb-inc-048-itinerary-proposal-request`

## 2. Problema

O domínio define Itinerary Proposal como agregado separado do Itinerary e exige referências à Itinerary Version e à Trip Context Version usadas como base. Ainda não existe um módulo que preserve essas identidades e o início do ciclo `requested -> generating -> failed`, com cancelamento explícito.

Sem esse contrato, uma integração futura poderia perder a base usada na geração, confundir Proposta com Roteiro canônico ou acoplar o domínio diretamente a Provider, banco ou interface.

## 3. Resultado verificável

- workspace `@routebook/proposal-management` sem dependências de runtime;
- `ItineraryProposalId` nominal e identidade própria;
- solicitação vinculada a Trip, Itinerary, versões base e Context Snapshot;
- estados oficiais publicados em contrato, com operações apenas para `requested`, `generating`, `failed` e `cancelled`;
- transições iniciais explícitas e imutáveis;
- falha e cancelamento não modificam o Itinerary;
- erros tipados de validação e transição;
- testes unitários das invariantes e estados cobertos.

## 4. Invariantes

1. toda Itinerary Proposal possui `ItineraryProposalId`;
2. TripId, ItineraryId e ContextSnapshotId são obrigatórios;
3. Itinerary Version e Trip Context Version base são inteiros positivos;
4. a solicitação nasce em `requested`;
5. somente `requested` pode iniciar geração;
6. somente `generating` pode falhar;
7. somente `requested` ou `generating` pode ser cancelada;
8. instantes de transição não retrocedem;
9. operações retornam nova representação e preservam o agregado recebido;
10. nenhuma operação altera o Itinerary ou outro agregado.

## 5. Escopo

- novo módulo `modules/proposal-management`;
- identidade, aggregate inicial, status oficiais e quatro operações de ciclo de vida;
- normalização de referências e instantes;
- erro tipado de validação e erro tipado de transição;
- testes unitários;
- lockfile, registro e rastreabilidade.

## 6. Limite canônico deliberado

O estado oficial do domínio após geração é `ready`, enquanto o exemplo de resposta mínima em `RB-API-001` usa `generated`. Este incremento não escolhe silenciosamente entre os dois contratos: não implementa conclusão de geração, Proposed Activity nem conteúdo revisável. A divergência deverá ser resolvida por decisão humana antes do incremento correspondente.

## 7. Fora de escopo

- Provider, modelo, prompt, schema de output ou chamada de IA;
- geração determinística de Proposed Activities;
- estado `ready` ou `generated` como conclusão;
- conteúdo, critérios, Reasons, limitações, validade ou Planning Conflicts da Proposta;
- aceite integral ou parcial, rejeição, expiração, nova solicitação ou supersessão;
- persistência, repository, migration, API, job, fila ou interface;
- alteração de qualquer agregado existente.

## 8. Context Pack

`docs/implementation/context-packs/rb-inc-048-itinerary-proposal-request.md`

## 9. Caminhos permitidos

```text
modules/proposal-management/**
pnpm-lock.yaml
docs/implementation/increments/rb-inc-048-itinerary-proposal-request.md
docs/implementation/context-packs/rb-inc-048-itinerary-proposal-request.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 10. Critérios de aceite

- [x] identidade e referências base obrigatórias são validadas;
- [x] status oficiais permanecem alinhados ao domínio;
- [x] somente as transições iniciais em escopo são expostas;
- [x] transições inválidas e instantes retroativos são rejeitados;
- [x] falha exige código técnico não vazio e não altera o Itinerary;
- [x] inputs e agregado anterior permanecem inalterados;
- [x] o módulo não importa banco, framework ou Provider;
- [x] testes unitários cobrem criação, validação, transições e imutabilidade;
- [ ] documentação, lint, tipagem, testes e build permanecem verdes.

## 11. Testes obrigatórios

- `pnpm install --frozen-lockfile`;
- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- regressão Playwright desktop e mobile no CI.

## 12. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| antecipar contrato de geração | Alto | parar antes de `ready`/`generated` e Proposed Activity |
| perder rastreabilidade da base | Alto | exigir as duas versões e ContextSnapshotId na solicitação |
| acoplar Provider ao domínio | Alto | workspace sem dependência de runtime ou adapter |
| mutar o Itinerary durante falha/cancelamento | Alto | operações puras limitadas ao agregado Proposal |

## 13. Rollback

Reverter o módulo e a documentação. O incremento não cria migration nem escreve estado persistido.

## 14. Evidências

Evidências locais:

- frozen install concluído;
- 15 testes do novo módulo aprovados;
- 154 testes de módulos e web aprovados;
- lint e typecheck integrais aprovados;
- build da aplicação aprovado;
- 137 documentos registrados e validados, com quatro avisos preexistentes;
- arquivos alterados aprovados no Prettier e em `git diff --check`.

PostgreSQL, formatação integral em ambiente Linux e Playwright serão registrados após os workflows da PR empilhada. Localmente, `pnpm test` não executa os 12 testes de integração sem `DATABASE_URL`, e `pnpm format:check` global encontra conversões LF/CRLF preexistentes no checkout Windows.
