---
id: RB-INC-052
title: Contrato Canônico de Itinerary Proposal Ready
description: Alinha o contrato documental da API ao estado canônico ready e explicita que a conclusão da geração não aceita nem aplica a Proposta.
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
  - api-contract
  - documentation
related_documents:
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

# RB-INC-052 — Contrato Canônico de Itinerary Proposal Ready

## 1. Objetivo

Alinhar o exemplo mínimo de resposta da Itinerary Proposal no contrato documental da API ao ciclo de vida canônico, usando `ready` após a conclusão da geração.

Issue: [#119](https://github.com/collapsy/Routebook/issues/119)

Decisão humana: [#118](https://github.com/collapsy/Routebook/issues/118)

Branch: `codex/rb-inc-052-ready-contract`

Base empilhada: `codex/issue-116-traceability-integration`.

## 2. Problema

O Domínio define `generating → ready`, enquanto o exemplo de resposta da API usava `generated`. A divergência permitiria que consumidores criassem um estado alternativo para a mesma etapa do ciclo de vida.

## 3. Resultado verificável

- resposta mínima da API usa `status: "ready"`;
- `ready` significa apenas Proposta pronta para revisão humana;
- aceitação e aplicação continuam operações explícitas e posteriores;
- `generated` permanece permitido em nomes de evento e timestamp, mas não como estado ou alias persistido;
- divergência e decisão ficam rastreáveis pelas issues #118 e #119.

## 4. Invariantes

1. o ciclo de vida oficial continua definido pelo Domínio;
2. a conclusão da geração transiciona de `generating` para `ready`;
3. `ready` não altera o Itinerary;
4. nenhuma Proposal é aceita ou aplicada sem ação humana explícita;
5. `generated` não é estado nem alias persistido;
6. nomes factuais como `ItineraryProposalGenerated` e `generatedAt` não redefinem o estado.

## 5. Escopo

- corrigir o exemplo de Itinerary Proposal em `RB-API-001`;
- explicitar a semântica de `ready` no contrato;
- registrar incremento, Context Pack e rastreabilidade.

## 6. Fora de escopo

- código de domínio, aplicação, API ou persistência;
- migration ou compatibilidade com alias legado;
- Provider, modelo, prompt, job ou fila;
- conteúdo de Proposed Activity;
- aceite, aplicação ou alteração do Itinerary;
- mudança de estado, evento ou invariante canônica.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-052-itinerary-proposal-ready-contract.md`

## 8. Caminhos permitidos

```text
docs/data/api-guidelines-and-contracts.md
docs/implementation/increments/rb-inc-052-itinerary-proposal-ready-contract.md
docs/implementation/context-packs/rb-inc-052-itinerary-proposal-ready-contract.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] o contrato da API usa `status: "ready"`;
- [x] a semântica de revisão humana fica explícita;
- [x] nenhum novo estado ou alias é introduzido;
- [x] evento e timestamp de geração permanecem semanticamente distintos do estado;
- [x] somente caminhos documentais permitidos são alterados;
- [x] formatação, validação documental e diff permanecem verdes.

## 10. Testes obrigatórios

- `pnpm exec prettier --check` nos cinco arquivos alterados;
- `pnpm docs:validate`;
- `git diff --check`;
- busca documental para confirmar a ausência de `status: "generated"` no contrato de Proposal.

Lint, typecheck, testes de código, build e E2E não são necessários porque este incremento altera apenas documentação e não modifica comportamento executável.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| consumidor interpretar `ready` como aplicado | Alto | semântica explícita junto ao exemplo |
| criar alias legado desnecessário | Médio | declarar que `generated` não é estado persistido |
| confundir evento com estado | Médio | preservar e explicar a distinção factual |

## 12. Segurança, privacidade, acessibilidade e observabilidade

O incremento não processa dados, não altera interface e não adiciona telemetria. A separação entre geração e aplicação reforça o controle humano sobre alterações canônicas.

## 13. Rollback

Reverter os arquivos documentais desta branch. Não existe migration, dado ou estado externo a desfazer.

## 14. Evidências

Evidências locais:

- Prettier dos cinco arquivos alterados aprovado;
- 145 documentos registrados e validados;
- quatro avisos documentais preexistentes, sem novo erro ou aviso;
- `git diff --check` aprovado;
- nenhuma ocorrência de `status: "generated"` permanece em `RB-API-001`.

Workflows da pull request pendentes.
