---
id: RB-INC-058
title: Expiração Temporal da Itinerary Proposal
description: Implementa a transição de domínio ready para expired quando a validade temporal da Itinerary Proposal termina.
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
  - expiration
related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-INC-053
  - RB-INC-057
prerequisites:
  - RB-INC-053
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-058 — Expiração Temporal da Itinerary Proposal

## 1. Objetivo

Adicionar ao aggregate a operação pública que expira uma Itinerary Proposal `ready` quando o instante informado alcança ou ultrapassa `validUntil`, preservando seu conteúdo auditável e sem alterar o Itinerary.

Issue: [#132](https://github.com/collapsy/Routebook/issues/132)

Branch: `codex/rb-inc-058-temporal-expiration`

Base empilhada: `codex/rb-inc-057-ready-review`, PR #131.

## 2. Problema

O estado `expired`, o instante `expiredAt` e a perda de validade temporal são canônicos, mas o aggregate ainda não oferece uma transição executável. Assim, consumidores não conseguem encerrar de forma uniforme uma Proposal pronta cuja validade terminou.

## 3. Resultado verificável

- `expiredAt` passa a integrar o snapshot do aggregate;
- operação pública aceita somente Proposal `ready`;
- `expiredAt` deve ser válido, não anterior à última atualização e maior ou igual a `validUntil`;
- a transição resulta em `expired` e atualiza `updatedAt`;
- conteúdo, versões e proveniência permanecem preservados;
- nenhuma escrita em Itinerary ou integração externa é introduzida.

## 4. Invariantes

1. Proposal `expired` não é aplicável;
2. expiração temporal ocorre somente após o fim da validade registrada;
3. este recorte não infere incompatibilidade de versão ou Contexto;
4. conteúdo revisável permanece auditável após a transição;
5. a operação é pura e independente de relógio, framework, banco ou Provider.

## 5. Escopo

- propriedade opcional `expiredAt`;
- operação `expireItineraryProposalByTime`;
- export público;
- testes unitários;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- persistence adapter, schema ou migration;
- comando de aplicação, API, UI, scheduler, job ou fila;
- expiração por versão, Contexto, cancelamento de Trip ou substituição;
- estado `partially-accepted` e aplicação total ou parcial;
- Evento de Domínio ou Outbox.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-058-itinerary-proposal-temporal-expiration.md`

## 8. Caminhos permitidos

```text
modules/proposal-management/src/index.ts
modules/proposal-management/src/itinerary-proposal.ts
modules/proposal-management/src/itinerary-proposal.test.ts
docs/implementation/increments/rb-inc-058-itinerary-proposal-temporal-expiration.md
docs/implementation/context-packs/rb-inc-058-itinerary-proposal-temporal-expiration.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] Proposal `ready` expira em `validUntil` ou depois;
- [x] `expiredAt` e `updatedAt` registram clones do instante informado;
- [x] expiração antes de `validUntil` é rejeitada;
- [x] Proposal fora de `ready` é rejeitada;
- [x] conteúdo, referências, versões e proveniência permanecem preservados;
- [x] a operação não conhece relógio, banco, Provider ou Itinerary;
- [x] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- sucesso exatamente em `validUntil`;
- sucesso após `validUntil`;
- instante anterior à validade;
- instante inválido;
- estado incompatível;
- imutabilidade do input e dos instantes;
- regressão do módulo e do monorepo.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| expirar antecipadamente | Alto | exigir `expiredAt >= validUntil` |
| perder conteúdo histórico | Alto | espalhar o snapshot e alterar somente estado e instantes |
| misturar causas de expiração | Médio | nome e contrato específicos para validade temporal |
| acoplar relógio ao domínio | Médio | receber o instante explicitamente |

## 12. Segurança e privacidade

A operação não recebe conteúdo novo, credencial, dado pessoal ou payload externo. Ela apenas transiciona um snapshot já validado e não aplica qualquer mudança canônica ao Roteiro.

## 13. Rollback

Reverter propriedade, operação, export, testes e documentação. Não há migration ou efeito externo.

## 14. Evidências

- Prettier dos caminhos alterados e `git diff --check`: verdes;
- documentação: 157 documentos e 157 registros validados, com quatro avisos preexistentes;
- `@routebook/proposal-management`: lint e typecheck verdes; 53 testes verdes;
- workspace: lint, typecheck e build verdes;
- suíte PostgreSQL e Playwright não executadas localmente porque `DATABASE_URL` não está configurada e o daemon Docker está indisponível;
- validação integral: pendente do workflow da pull request.
