---
id: RB-IMP-001
title: Operação de Implementação por Incrementos
description: Define como o RouteBook transforma documentação publicada em incrementos verticais executáveis por pessoas e agentes de IA.
document_type: implementation
owner: Delivery
status: Published
version: "1.0.0"
created: "2026-07-28"
last_updated: null
authors:
  - RouteBook Team
tags:
  - implementation
  - delivery
  - increments
  - context-pack
  - vibe-coding
related_documents:
  - RB-CORE-0004
  - RB-DEL-001
  - RB-DEV-001
  - RB-QA-001
  - RB-CICD-001
prerequisites:
  - RB-DEL-001
  - RB-DEV-001
next_documents:
  - RB-IMP-002
  - RB-IMP-003
  - RB-IMP-004
  - RB-INC-000
ai_context:
  priority: critical
  index: true
---

# RB-IMP-001 — Operação de Implementação por Incrementos

## Objetivo

Transformar a documentação do RouteBook em trabalho pequeno, verificável e seguro para desenvolvimento humano e assistido por IA.

## Unidade oficial de entrega

A unidade oficial é o **Incremento Vertical**, identificado como `RB-INC-NNN`.

Um incremento deve entregar um comportamento ou capacidade observável de ponta a ponta. Ele pode atravessar domínio, aplicação, adapter, persistência e UI quando isso for necessário para gerar valor, mas deve permanecer pequeno e revisável.

## Princípio de vibe coding governado

Vibe coding no RouteBook não significa alterar o repositório a partir de uma intenção vaga.

Significa fornecer ao agente um pacote explícito com:

- objetivo;
- problema;
- critérios de aceite;
- documentos aplicáveis;
- caminhos permitidos;
- restrições;
- testes;
- itens fora de escopo;
- decisões humanas já tomadas.

O agente implementa dentro desse envelope e produz um diff revisável.

## Fluxo

```text
Issue
→ Incremento
→ Context Pack
→ Branch
→ Implementação
→ Testes
→ Atualização documental
→ Pull request
→ Revisão humana
→ Integração
→ Evidência
```

## Definition of Ready

Um incremento está pronto para implementação quando:

- o problema está descrito;
- os critérios de aceite são verificáveis;
- dependências e bloqueios são conhecidos;
- documentos e ADRs aplicáveis estão listados;
- caminhos permitidos estão definidos;
- a estratégia de testes está definida;
- riscos e fora de escopo estão registrados;
- decisões de domínio e arquitetura necessárias já foram tomadas.

## Definition of Done

Um incremento está concluído quando:

- critérios de aceite foram satisfeitos;
- testes aplicáveis passaram;
- qualidade, acessibilidade, segurança e privacidade foram avaliadas;
- documentação foi atualizada;
- a matriz de rastreabilidade possui evidências;
- nenhum secret foi introduzido;
- o PR foi revisado;
- pendências restantes estão explicitamente separadas.

## Context Pack

O Context Pack é o conjunto mínimo de contexto necessário para executar um incremento.

Ele não deve incluir toda a documentação do RouteBook por padrão. Contexto excessivo aumenta custo, conflito e interpretação incorreta.

O template oficial está em [`context-pack-template.md`](./context-pack-template.md).

## Ordem inicial de incrementos

| ID | Incremento | Estado |
| --- | --- | --- |
| RB-INC-000 | Implementation Readiness | Em execução |
| RB-INC-001 | Bootstrap do monorepo | Planejado |
| RB-INC-002 | Shell da aplicação e Design System mínimo | Planejado |
| RB-INC-003 | Identidade, Account e sessão | Planejado |
| RB-INC-004 | Criar e visualizar Viagem | Planejado |
| RB-INC-005 | Hospedagem, Preferências e contexto | Planejado |
| RB-INC-006 | Catálogo curado de Pipa | Planejado |
| RB-INC-007 | Exploração, filtros e detalhe de Lugar | Planejado |
| RB-INC-008 | Mapa, distância e mobilidade | Planejado |
| RB-INC-009 | Lugares salvos | Planejado |
| RB-INC-010 | Roteiro manual | Planejado |
| RB-INC-011 | Recomendações determinísticas | Planejado |
| RB-INC-012 | Conflitos e Planning Assurance | Planejado |
| RB-INC-013 | Propostas de Roteiro assistidas por IA | Planejado |
| RB-INC-014 | Hardening, deploy e validação do MVP | Planejado |

Somente os incrementos `000` e `001` são formalizados nesta etapa. Os demais serão detalhados no momento adequado para evitar especificação desatualizada.

## Regras de corte

Um incremento deve ser dividido quando:

- possui mais de uma jornada principal independente;
- exige decisões arquiteturais ainda não tomadas;
- altera muitos bounded contexts sem necessidade;
- não pode ser revisado com clareza;
- mistura infraestrutura futura com valor atual;
- depende de Provider que ainda pode ser simulado por contrato local.

## Evidências

As evidências podem incluir:

- saída de testes;
- screenshots ou vídeos;
- exemplos de request/response;
- migrations verificadas;
- relatório de acessibilidade;
- logs de validação;
- link de preview;
- decisão registrada em ADR.

Evidência deve representar execução real, não apenas intenção.

## Restrições

- não implementar todos os ADRs no bootstrap;
- não criar microserviços;
- não ativar infraestrutura sem caso real;
- não usar IA para substituir regras determinísticas já conhecidas;
- não alterar documentos canônicos para acomodar implementação incorreta;
- não integrar diretamente na `main`.