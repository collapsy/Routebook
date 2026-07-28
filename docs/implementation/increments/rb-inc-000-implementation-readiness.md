---
id: RB-INC-000
title: Implementation Readiness
description: Normaliza o repositório e cria a governança operacional necessária para iniciar a implementação do RouteBook por vibe coding governado.
document_type: implementation-increment
owner: Delivery
status: Published
version: "1.0.0"
created: "2026-07-28"
last_updated: "2026-07-28"
authors:
  - RouteBook Team
tags:
  - implementation
  - readiness
  - governance
  - vibe-coding
related_documents:
  - RB-CORE-0001
  - RB-CORE-0004
  - RB-IMP-001
  - RB-IMP-002
  - RB-IMP-003
  - RB-IMP-004
  - RB-DEL-001
  - RB-DEV-001
  - RB-CICD-001
prerequisites:
  - RB-DEL-001
  - RB-DEV-001
next_documents:
  - RB-INC-001
ai_context:
  priority: critical
  index: true
---

# RB-INC-000 — Implementation Readiness

## Metadados

| Campo | Valor |
| --- | --- |
| Estado operacional | Ready for Review |
| Issue | #2 |
| Pull request | #3 |
| Branch | `chore/rb-inc-000-readiness` |
| Base | `main` |

## Resultado vertical

O repositório passa a possuir uma entrada documental coerente, IDs constitucionais resolvidos, regras para agentes, templates de execução, rastreabilidade e validação automática básica.

## Problema

A documentação detalhava produto e arquitetura, mas o repositório ainda não fornecia um envelope operacional suficiente para transformar esse conhecimento em tarefas pequenas e seguras. O README também permanecia desatualizado e referências `RB-CORE-*` não possuíam arquivos registrados.

## Escopo

- atualizar README e estado do projeto;
- estabelecer o cenário correto de Pipa em agosto de 2026;
- criar `RB-CORE-0001` a `RB-CORE-0004`;
- criar `AGENTS.md` e `CONTRIBUTING.md`;
- criar templates de Incremento e Context Pack;
- criar matriz de rastreabilidade;
- formalizar `RB-INC-000` e `RB-INC-001`;
- criar templates de issue e PR;
- criar validação documental e workflow;
- atualizar o registro documental;
- normalizar dívidas documentais detectadas pela primeira execução do validador.

## Fora de escopo

- criar a aplicação Next.js;
- instalar pnpm ou Turborepo;
- adicionar dependências de runtime;
- criar módulos executáveis;
- provisionar banco, mapas, autenticação, IA ou observabilidade;
- aceitar automaticamente o status decisório de ADRs;
- integrar diretamente na `main`.

## Critérios de aceite

- [x] branch dedicada criada;
- [x] issue #2 criada;
- [x] README atualizado;
- [x] cenário canônico corrigido para 22 a 29 de agosto de 2026;
- [x] referências antigas de julho corrigidas nos documentos identificados;
- [x] frontmatter legado de `RB-AI-005` normalizado;
- [x] IDs `RB-CORE-*` materializados;
- [x] instruções de agentes criadas;
- [x] operação por incrementos documentada;
- [x] registro sincronizado;
- [x] templates GitHub criados;
- [x] validação automatizada criada;
- [x] pull request #3 aberto;
- [ ] check final do head aprovado;
- [ ] revisão e integração humanas concluídas.

A integração na `main` permanece uma decisão humana.

## Caminhos permitidos

```text
README.md
AGENTS.md
CONTRIBUTING.md
docs/**
scripts/validate-docs.mjs
.github/ISSUE_TEMPLATE/**
.github/PULL_REQUEST_TEMPLATE.md
.github/workflows/documentation-validation.yml
```

## Caminhos proibidos

```text
apps/**
modules/**
packages/**
infrastructure/**
```

## Validação

```bash
node scripts/validate-docs.mjs
```

Como a aplicação ainda não existe, comandos de lint, typecheck, testes e build de produto não se aplicam a este incremento.

## Achados da validação

A primeira execução do workflow detectou e permitiu corrigir:

- frontmatter de `RB-AI-005` cercado incorretamente por bloco de código;
- quatro documentos com a data histórica de julho de 2026;
- referências a documentos futuros ainda não materializados.

Referências futuras permanecem como avisos, pois representam `next_documents` planejados e não bloqueiam a integridade dos 102 documentos registrados.

## Riscos

| Risco | Mitigação |
| --- | --- |
| duplicação entre documentos Core e Foundation | documentos Core atuam como síntese constitucional e apontam para detalhamento |
| excesso de burocracia para projeto pessoal | templates pequenos e incrementos proporcionais ao risco |
| status de publicação confundido com status decisório de ADR | dimensões documentadas separadamente |
| documentação divergir do código futuro | validação e atualização no mesmo incremento |
| referência futura interpretada como documento existente | validador reporta aviso e exige registro quando o arquivo for criado |

## Rollback

A mudança é documental e operacional. O rollback pode ser realizado revertendo o pull request, sem efeito em runtime ou dados.

## Evidências

- issue #2;
- pull request #3;
- diff controlado da branch;
- primeira execução do workflow identificou uma falha real;
- normalização aplicada aos documentos afetados;
- check final deverá ser registrado antes da integração.