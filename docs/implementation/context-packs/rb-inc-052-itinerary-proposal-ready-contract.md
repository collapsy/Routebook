---
id: RB-CTX-052
title: Context Pack do RB-INC-052
description: Fornece o contexto mínimo para alinhar o contrato da API ao estado canônico ready de Itinerary Proposal.
document_type: implementation-context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - proposal-management
  - api-contract
related_documents:
  - RB-INC-052
  - RB-CORE-0004
  - RB-API-001
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-INC-048
  - RB-INC-049
  - RB-INC-050
prerequisites:
  - RB-INC-050
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-052

## 1. Missão do executor

Corrigir a divergência documental do status final da geração sem alterar o Domínio, adicionar alias ou antecipar implementação.

## 2. Incremento

- ID: `RB-INC-052`;
- issue: `#119`;
- decisão humana: `#118`;
- branch: `codex/rb-inc-052-ready-contract`;
- base empilhada: `codex/issue-116-traceability-integration`;
- arquivo: `docs/implementation/increments/rb-inc-052-itinerary-proposal-ready-contract.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-052-itinerary-proposal-ready-contract.md`;
6. `docs/implementation/increments/rb-inc-050-itinerary-proposal-commands.md`;
7. `docs/domain/domain-model.md`, Parte XII;
8. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-002 a RB-BR-PRP-010;
9. `docs/domain/domain-events-and-lifecycles.md`, Parte XVII;
10. `docs/data/api-guidelines-and-contracts.md`, seção Itinerary Proposal;
11. `docs/architecture/modules-and-bounded-contexts.md`, Proposal Management.

## 4. Conceitos e decisões aplicáveis

| Termo oficial | Interpretação obrigatória |
| --- | --- |
| `ready` | geração concluída e Proposta pronta para revisão humana |
| `generated` | fato de geração em evento ou timestamp; nunca estado ou alias persistido |
| Itinerary Proposal | objeto revisável que não altera o Itinerary por existir |
| aceitação | ação humana explícita e posterior à revisão |

A issue #118 resolveu a divergência em favor do estado canônico `ready`; o executor não deve reabrir essa escolha.

## 5. Invariantes

- o Domínio é a autoridade do ciclo de vida;
- `generating → ready` é a transição de conclusão;
- `ready` não aceita nem aplica a Proposal;
- nenhum alias `generated` deve ser introduzido;
- o Itinerary permanece inalterado.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 8 do incremento.

## 7. Caminhos somente leitura

```text
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/data/api-contract-catalog.md
modules/**
packages/**
apps/**
```

## 8. Restrições

- não alterar documento canônico de Domínio;
- não criar estado ou compatibilidade legada;
- não editar código, schema ou migration;
- não implementar geração, Provider ou aceitação;
- não tratar `ready` como alteração do Itinerary;
- não expandir o recorte para conteúdo da Proposal.

## 9. Saídas esperadas

- exemplo de resposta da API alinhado a `ready`;
- nota semântica que separa estado, evento e timestamp;
- incremento, Context Pack, registry e rastreabilidade atualizados;
- evidências reais de validação documental.

## 10. Comandos

```bash
pnpm exec prettier --check docs/data/api-guidelines-and-contracts.md docs/implementation/increments/rb-inc-052-itinerary-proposal-ready-contract.md docs/implementation/context-packs/rb-inc-052-itinerary-proposal-ready-contract.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
git diff --check
```

## 11. Dados e privacidade

Nenhum dado pessoal, secret, fixture ou informação de produção é utilizado.

## 12. Quando interromper e escalar

- surgir necessidade de mudar o ciclo de vida canônico;
- `ready` precisar significar aceite ou aplicação;
- algum consumidor real exigir migration ou alias legado;
- for necessário alterar caminho fora do incremento;
- aparecer decisão de Provider, risco destrutivo ou de segurança.
