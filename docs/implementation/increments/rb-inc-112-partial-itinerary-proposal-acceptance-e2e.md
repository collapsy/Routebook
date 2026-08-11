---
id: RB-INC-112
title: E2E do Aceite Parcial de Itinerary Proposal
description: Valida no navegador a aplicação persistida de um subconjunto da Proposal e o replay idempotente da mesma decisão.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - partial-acceptance
  - e2e
  - idempotency
related_documents:
  - RB-PRD-006
  - RB-UX-005
  - RB-INC-111
prerequisites:
  - RB-INC-111
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-112 — E2E do Aceite Parcial de Itinerary Proposal

## 1. Objetivo

Comprovar da revisão no navegador até o PostgreSQL que somente o subconjunto confirmado de uma `Itinerary Proposal` é aplicado e que o replay da mesma decisão não duplica efeitos.

Issue: #256.

Branch: `codex/rb-inc-112-partial-acceptance-e2e`.

PR: #257.

## 2. Dependência canônica

O RB-INC-108 definiu o comando parcial, o RB-INC-109 implementou a transação atômica, o RB-INC-110 expôs a Server Action autorizada e o RB-INC-111 entregou a seleção explícita. Este incremento fecha a jornada com evidência E2E sem alterar regras de domínio ou persistência.

## 3. Escopo implementado

- fixture persistida com duas `Proposed Activities`;
- seleção e confirmação de exatamente uma atividade pela UI;
- navegação para o Roteiro com feedback específico de aceite parcial;
- comprovação de que somente a atividade escolhida integra o Itinerary;
- preservação da atividade não escolhida na Proposal `partially-accepted`;
- comprovação de uma única `Proposal Application` e uma única `Decision`;
- replay concorrente da mesma idempotency key sem reaplicar efeitos;
- correção mínima da Server Action para redirecionar no servidor após sucesso.

## 4. Correção revelada pelo E2E

A ação parcial revalidava a própria página de Proposal antes de o estado de sucesso alcançar o efeito de navegação do cliente. O remount descartava esse estado e mantinha o navegador na revisão.

O sucesso agora segue o padrão do aceite integral: revalida Trip e Roteiro e executa o redirect fora do `try/catch`, preservando a exceção de controle usada pelo Next.js. Falhas recuperáveis continuam retornando estado na página de revisão.

## 5. Fora de escopo

- nova regra, estado ou evento de domínio;
- mudança de schema ou migration;
- aplicação posterior dos itens restantes;
- seleção agregada por Dia ou bloco;
- alteração da UX definida no RB-INC-111.

## 6. Critérios de aceite

- [x] um subconjunto é selecionado pela UI e enviado pela Server Action;
- [x] somente a atividade selecionada aparece no Roteiro;
- [x] a atividade restante permanece na Proposal `partially-accepted`;
- [x] a versão do Itinerary avança uma única vez;
- [x] existe uma única `Proposal Application` parcial bem-sucedida;
- [x] existe uma única `Decision` com escolha e efeito rastreáveis;
- [x] replay da mesma decisão retorna feedback próprio sem duplicar efeitos;
- [x] lint e typecheck aprovados localmente;
- [x] Engineering Validation técnico aprovado;
- [x] registry, Context Pack e matriz sincronizados;
- [ ] Documentation Validation e Engineering Validation aprovados no HEAD canônico antes do merge.

## 7. Evidências

- E2E: `apps/web/e2e/itinerary-proposal-review.spec.ts`;
- correção de navegação: `apps/web/app/viagens/[tripId]/roteiro/proposta/partial-accept-action.ts`;
- SHA técnico: `d086a68fadaaef143c8dad863bd1d54103745e7d`;
- Engineering Validation técnico: run `31498339765`, job `93801596100`, success integral;
- Playwright técnico: 79 testes aprovados; o novo E2E parcial passou sem retry e duas jornadas preexistentes receberam anotação flaky.

## 8. Próximo recorte esperado

O próximo incremento deve ser definido a partir da lacuna prioritária ainda aberta no roadmap e não ampliar o lifecycle do aceite parcial implicitamente.
