---
id: RB-INC-061
title: Revisão Histórica da Itinerary Proposal Expired
description: Permite consultar uma Itinerary Proposal expirada como referência histórica, sem oferecer aplicação ou alterar o Roteiro atual.
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
  - frontend
  - accessibility
  - expiration
related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-UX-001
  - RB-UX-002
  - RB-UX-003
  - RB-UX-004
  - RB-INC-057
  - RB-INC-058
  - RB-INC-059
  - RB-INC-060
prerequisites:
  - RB-INC-057
  - RB-INC-059
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-061 — Revisão Histórica da Itinerary Proposal Expired

## 1. Objetivo

Permitir que a pessoa consulte o conteúdo preservado de uma Itinerary Proposal `expired`, entendendo sua validade e sua expiração, sem apresentar a Proposta como aplicável e sem alterar o Roteiro atual.

Issue: [#138](https://github.com/collapsy/Routebook/issues/138)

Branch: `codex/rb-inc-061-expired-review`.

Pull request: pendente.

## 2. Problema

A persistência já conserva conteúdo, proveniência, `validUntil` e `expiredAt`, mas a experiência de revisão seleciona apenas Propostas `ready`. Assim, uma Proposta expirada desaparece da jornada embora continue útil para auditoria e referência histórica.

## 3. Resultado verificável

- uma Proposal `ready` permanece prioritária e mantém a experiência existente;
- na ausência de `ready`, a Proposal `expired` mais recente pode ser aberta pelo Roteiro;
- o estado histórico informa claramente que a validade terminou e que a Proposal não pode ser aplicada;
- `generatedAt`, `validUntil` e `expiredAt` são apresentados no fuso do Roteiro;
- conteúdo, critérios, justificativas, limitações e proveniência continuam revisáveis;
- nenhuma ação de aceitar, aplicar, descartar ou gerar novamente é introduzida;
- estados sem Proposal revisável continuam recuperáveis.

## 4. Invariantes

1. Proposal `expired` não é aplicável;
2. revisão não altera o Itinerary;
3. Proposal `ready` tem prioridade sobre qualquer histórico expirado;
4. snapshot histórico incompleto é rejeitado em vez de ter conteúdo inventado;
5. datas são apresentadas como fatos registrados, sem inferir um novo lifecycle;
6. a seleção de leitura não dispara expiração nem persistência.

## 5. Escopo

- seleção de Proposal revisável `ready` ou `expired`;
- view model discriminado pelo lifecycle;
- conteúdo e semântica visual do modo histórico;
- link contextual no Roteiro;
- testes unitários, de componente e E2E;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- disparar expiração temporal;
- scheduler, job, fila, retry, relógio ou Provider;
- aceitar ou aplicar Proposal;
- rejeitar, descartar, regenerar ou substituir Proposal;
- novo estado, transição, evento ou invariante de domínio;
- schema, migration, repository ou adapter;
- edição dos documentos canônicos de Product, Domain, UX ou Architecture.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-061-itinerary-proposal-expired-review.md`

## 8. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx
apps/web/components/itinerary-proposal-review.tsx
apps/web/components/itinerary-proposal-review.test.tsx
apps/web/components/itinerary-proposal-review.module.css
apps/web/lib/itinerary-proposal-experience.ts
apps/web/lib/itinerary-proposal-experience.test.ts
apps/web/e2e/itinerary-proposal-review.spec.ts
docs/implementation/increments/rb-inc-061-itinerary-proposal-expired-review.md
docs/implementation/context-packs/rb-inc-061-itinerary-proposal-expired-review.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] Proposal `ready` continua sendo selecionada antes de `expired`;
- [x] sem `ready`, a Proposal `expired` mais recente é selecionada de forma estável;
- [x] snapshot `expired` incompleto produz erro de integridade;
- [x] modo histórico informa que a Proposal expirou e não pode ser aplicada;
- [x] `validUntil` e `expiredAt` ficam compreensíveis e acessíveis;
- [x] link do Roteiro diferencia uma Proposal ativa de uma expirada;
- [x] nenhuma ação de decisão aparece na revisão histórica;
- [x] estados `ready` e sem Proposal não sofrem regressão;
- [x] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- prioridade de `ready` sobre `expired`;
- seleção estável da `expired` mais recente;
- rejeição de snapshot `expired` incompleto;
- view model com status e `expiredAt` formatado;
- componente histórico com semântica e conteúdo não aplicável;
- ausência de ações de decisão;
- E2E da navegação do Roteiro para o histórico expirado;
- regressão do fluxo `ready`, estado vazio e monorepo.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| histórico esconder Proposal ativa | Alto | priorizar qualquer `ready` antes de ordenar `expired` |
| conteúdo parecer aplicável | Alto | estado, título e nota explícitos; nenhuma ação de decisão |
| datas incompletas ou inválidas | Médio | validar snapshot antes de construir a revisão |
| leitura produzir efeito colateral | Alto | manter seleção e view model como funções puras |

## 12. Segurança e privacidade

A experiência reutiliza apenas o snapshot já autorizado da própria viagem. Não envia dados a Provider, não registra conteúdo adicional e não concede autoridade para alterar o Roteiro.

## 13. Rollback

Reverter view model, componentes, rotas, testes e documentação. Não há migration, dependência ou efeito externo novo.

## 14. Evidências

- Prettier dos caminhos alterados e `git diff --check`: verdes;
- documentação: 163 documentos e 163 registros validados, com quatro avisos preexistentes;
- `@routebook/web`: lint e typecheck verdes; 59 testes verdes;
- workspace: lint, typecheck e build verdes;
- E2E PostgreSQL não executado localmente porque `DATABASE_URL` não está configurada e o daemon Docker está indisponível; será coberto pelo CI;
- PR e evidências finais de CI pendentes.
