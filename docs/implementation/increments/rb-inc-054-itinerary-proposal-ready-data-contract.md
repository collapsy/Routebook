---
id: RB-INC-054
title: Contrato de Dados da Itinerary Proposal Ready
description: Alinha os modelos lógico e físico ao snapshot híbrido aprovado para persistir conteúdo revisável e proveniência de Proposal ready.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - proposal-management
  - data-model
  - persistence-contract
related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-006
  - RB-INC-053
prerequisites:
  - RB-INC-053
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-054 — Contrato de Dados da Itinerary Proposal Ready

## 1. Objetivo

Atualizar os modelos lógico e físico antes da migration para representar integralmente o conteúdo revisável de uma Itinerary Proposal `ready` e sua proveniência técnica.

Issue: [#124](https://github.com/collapsy/Routebook/issues/124)

Decisão humana: [#123](https://github.com/collapsy/Routebook/issues/123)

Branch: `codex/rb-inc-054-ready-data-contract`

Base empilhada: `codex/rb-inc-053-proposal-ready-domain`, PR #122.

## 2. Problema

`RB-BR-PRP-004` exige itens, critérios, Justificativas, limitações e Planning Conflicts conhecidos, mas o modelo físico não definia onde persistir os três grupos textuais. Também faltava separar a versão da geração do estado da Proposal e esclarecer a natureza das referências de conflitos.

## 3. Resultado verificável

- modelo lógico representa critérios, justificativas, limitações e IDs de conflitos conhecidos;
- modelo físico mantém Proposed Activities normalizadas;
- grupos textuais ordenados e referências de conflitos usam snapshots JSONB controlados;
- `generationMethod` e `generationVersion` registram proveniência independente de Provider;
- campos de conclusão permanecem nulos antes de `ready` e obrigatórios em `ready`;
- referências a Planning Conflict não criam FK cross-context nem transferem ownership.

## 4. Decisão aprovada

A Opção A da issue #123 define o snapshot híbrido:

1. Proposed Activities permanecem na tabela própria;
2. critérios, justificativas e limitações são arrays JSONB ordenados na Proposal;
3. Planning Conflict IDs conhecidos são snapshot JSONB de referências;
4. método e versão registram proveniência técnica sem escolher Provider;
5. `generatedAt` e `validUntil` delimitam conclusão e validade.

## 5. Invariantes

1. o snapshot pertence a Proposal Management;
2. Planning Assurance continua owner de Planning Conflict;
3. referência em snapshot não garante existência atual nem cria cascade;
4. `ready` exige conteúdo e proveniência completos;
5. estados anteriores não inventam conteúdo ainda indisponível;
6. `generationMethod` e `generationVersion` não são status nem Provider;
7. nenhuma coluna ou relação altera o Itinerary.

## 6. Escopo

- `RB-DATA-001`, Parte XII;
- `RB-DATA-002`, Parte XII e regras de JSONB;
- incremento, Context Pack, registry e rastreabilidade.

## 7. Fora de escopo

- código, schema Drizzle, migration, adapter ou teste de integração;
- backfill de dados;
- Provider, modelo, prompt, job ou fila;
- API, UI, aceite ou aplicação;
- alteração de Planning Conflict ou Itinerary.

## 8. Context Pack

`docs/implementation/context-packs/rb-inc-054-itinerary-proposal-ready-data-contract.md`

## 9. Caminhos permitidos

```text
docs/data/logical-data-model.md
docs/data/physical-data-model-and-migrations.md
docs/implementation/increments/rb-inc-054-itinerary-proposal-ready-data-contract.md
docs/implementation/context-packs/rb-inc-054-itinerary-proposal-ready-data-contract.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 10. Critérios de aceite

- [x] o modelo lógico representa todo o conteúdo exigido por `RB-BR-PRP-004`;
- [x] o modelo físico declara finalidade, shape e validação dos snapshots JSONB;
- [x] Proposed Activities continuam normalizadas;
- [x] proveniência é independente de estado e Provider;
- [x] nulabilidade e obrigatoriedade por lifecycle estão explícitas;
- [x] referências de conflito não transferem ownership;
- [x] somente caminhos documentais permitidos são alterados;
- [x] formatação, validação documental e diff permanecem verdes.

## 11. Testes obrigatórios

- `pnpm exec prettier --check` nos seis arquivos alterados;
- `pnpm docs:validate`;
- `git diff --check`;
- busca documental pelos novos atributos e regras.

Lint, typecheck, testes de código, build e E2E não são necessários porque o incremento não altera comportamento executável.

## 12. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| JSONB usado para ocultar entidade | Alto | somente grupos sem identidade própria usam JSONB; Proposed Activity permanece normalizada |
| referência de conflito parecer ownership | Alto | declarar snapshot sem FK cross-context |
| método de geração acoplar Provider | Médio | valor técnico livre e versionado, sem enum de fornecedor |
| conteúdo parcial chegar a `ready` | Alto | constraint de lifecycle e validação no adapter futuro |

## 13. Segurança e privacidade

Snapshots não devem incluir prompt, token, secret, dado pessoal desnecessário ou payload bruto de Provider. O conteúdo persistido é o mínimo revisável da Proposal.

## 14. Rollback

Reverter os documentos desta branch. Não existe migration ou dado externo a desfazer.

## 15. Evidências

Evidências locais:

- 149 documentos registrados e validados;
- quatro avisos documentais preexistentes, sem novo erro ou aviso;
- Prettier dos seis arquivos alterados aprovado;
- `git diff --check` aprovado;
- busca documental confirma atributos lógicos, colunas físicas, shapes JSONB e regras de lifecycle.

Workflows da pull request pendentes.
