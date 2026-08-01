---
id: RB-INC-053
title: Conclusão Canônica de Itinerary Proposal Ready
description: Implementa no domínio a conclusão generating para ready com conteúdo revisável, sem persistência, Provider ou alteração do Itinerary.
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
  - domain
  - lifecycle
related_documents:
  - RB-CORE-0004
  - RB-PRD-006
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-ARC-002
  - RB-INC-050
  - RB-INC-052
prerequisites:
  - RB-INC-052
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-053 — Conclusão Canônica de Itinerary Proposal Ready

## 1. Objetivo

Implementar no aggregate de Proposal Management a transição canônica `generating → ready`, recebendo conteúdo revisável e mantendo o Itinerary inalterado.

Issue: [#121](https://github.com/collapsy/Routebook/issues/121)

Decisão humana: [#118](https://github.com/collapsy/Routebook/issues/118)

Branch: `codex/rb-inc-053-proposal-ready-domain`

Base empilhada: `codex/rb-inc-052-ready-contract`, PR #120.

## 2. Problema

O aggregate publica `ready` entre os estados oficiais, mas ainda interrompe o ciclo em `generating`. Sem uma operação de conclusão, não existe contrato de domínio capaz de garantir que uma Proposal pronta seja revisável conforme `RB-BR-PRP-004`.

## 3. Resultado verificável

- operação pura conclui somente Proposal `generating` em `ready`;
- conteúdo pronto carrega Proposed Activities, critérios, justificativas, limitações, Planning Conflicts conhecidos e validade;
- Proposed Activity permanece interna à Proposal e sem ActivityId canônico;
- Proposal vazia é permitida somente com justificativa;
- datas, coleções e objetos de entrada são copiados para impedir mutação indireta;
- nenhuma operação escreve em repository ou altera Itinerary.

## 4. Invariantes

1. `ready` é o único estado produzido pela conclusão da geração;
2. somente `generating` pode concluir em `ready`;
3. Proposed Activity não é Activity canônica;
4. itens propostos podem estar vazios quando a ausência de alteração adequada estiver justificada;
5. critérios e justificativas devem ser explícitos;
6. limitações e referências a Planning Conflicts conhecidos devem existir como coleções, ainda que vazias;
7. o instante da conclusão não pode anteceder a última transição;
8. conclusão não aceita, não aplica e não altera o Itinerary;
9. nenhum Provider ou método de geração é escolhido pelo domínio.

## 5. Escopo

- tipos públicos de Proposed Activity, operação e conteúdo pronto;
- validação mínima das referências, textos, números, moeda, horário e datas recebidas;
- transição `completeItineraryProposalGeneration`;
- cópia defensiva e congelamento das coleções e itens;
- exports públicos e testes unitários;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- repository, adapter, schema, migration ou round trip de `ready`;
- comando de aplicação ou API;
- Provider, modelo, prompt, output schema externo, job, fila ou retry;
- geração determinística de conteúdo;
- aceite total ou parcial, rejeição, expiração, supersessão ou aplicação;
- alteração de Itinerary, Activity ou Planning Conflict.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-053-itinerary-proposal-ready-domain.md`

## 8. Caminhos permitidos

```text
modules/proposal-management/src/itinerary-proposal.ts
modules/proposal-management/src/itinerary-proposal.test.ts
modules/proposal-management/src/index.ts
docs/implementation/increments/rb-inc-053-itinerary-proposal-ready-domain.md
docs/implementation/context-packs/rb-inc-053-itinerary-proposal-ready-domain.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] somente `generating` conclui em `ready`;
- [x] conteúdo pronto representa todos os grupos exigidos por `RB-BR-PRP-004`;
- [x] tipos não contêm ActivityId canônico;
- [x] Proposal sem itens exige justificativa explícita;
- [x] referências e textos obrigatórios rejeitam valores vazios;
- [x] números e datas inválidos são rejeitados;
- [x] mutação das entradas não altera a Proposal concluída;
- [x] a operação não depende de framework, repository ou Provider;
- [x] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- `pnpm exec prettier --check` nos arquivos alterados;
- `pnpm docs:validate`;
- `pnpm --filter @routebook/proposal-management lint`;
- `pnpm --filter @routebook/proposal-management typecheck`;
- `pnpm --filter @routebook/proposal-management test`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- `git diff --check`.

Regressão E2E local não é necessária porque o incremento não altera interface ou integração; o workflow acumulado continua responsável pela regressão integral.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| confundir Proposed Activity com Activity | Alto | tipo próprio sem ActivityId e sem dependência de Itinerary Planning |
| concluir conteúdo incompleto | Alto | validar grupos exigidos antes da transição |
| mutação posterior adulterar a Proposal | Médio | cópia defensiva e congelamento |
| antecipar persistência incompatível | Alto | repository e database fora do incremento |

## 12. Segurança, privacidade, acessibilidade e observabilidade

O domínio recebe apenas referências e conteúdo de Proposal, sem Provider, dado pessoal real, secret, log ou telemetria. Não há interface neste recorte. A separação entre `ready` e aceite preserva o controle humano.

## 13. Rollback

Reverter tipos, operação, testes, exports e documentação. Não existe migration, escrita externa ou estado de produção a desfazer.

## 14. Evidências

Evidências locais:

- Proposal Management: lint e typecheck aprovados; 43/43 testes aprovados;
- monorepo: lint e typecheck aprovados em 10 packages;
- testes sem o package database aprovados em nove packages, incluindo 46/46 testes do web;
- build de produção aprovado após execução serializada;
- 147 documentos registrados e validados, com quatro avisos preexistentes;
- Prettier dos arquivos alterados e `git diff --check` aprovados;
- testes do package database não executados com sucesso localmente porque `DATABASE_URL` não está configurada; a tentativa confirmou 18 falhas exclusivamente ambientais;
- E2E local não executado por não haver alteração de interface ou integração.

Workflows da pull request pendentes.
