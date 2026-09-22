---
id: RB-INC-212
title: Onboarding da preparação após criar viagem
description: Torna a entrada no wizard de preparação a continuação intuitiva da criação de uma Trip.
document_type: implementation-increment
owner: Experience
status: Draft
version: "0.1.0"
created: "2026-09-22"
last_updated: "2026-09-22"
authors: [RouteBook Team]
tags: [implementation, onboarding, wizard, preparation, experience]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-003, RB-ADR-027, RB-ADR-028, RB-INC-207, RB-INC-209, RB-INC-210, RB-INC-211, RB-CTX-212]
prerequisites: [RB-INC-211]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-212 — Onboarding da preparação após criar viagem

## Unidade de trabalho

- Issue: [#515](https://github.com/collapsy/Routebook/issues/515)
- Branch: `codex/rb-inc-212-preparation-onboarding`
- Base: `main@b73f39f3c7856dc7f2b185d88958edd3b57d4909`
- Merge: somente após autorização humana explícita.

## Problema

Após criar uma Trip, o usuário é enviado para “Minhas viagens” e precisa descobrir sozinho a ação “Preparar viagem”. Isso quebra a continuidade e torna o wizard uma capacidade escondida, em vez de um onboarding.

## Objetivo

Fazer a criação da Trip desembocar diretamente na Etapa 1 do wizard:

```text
Criar viagem
→ Vamos preparar sua viagem
→ Lugares
→ Contexto
→ Revisão
→ Proposta futura
```

O onboarding deve explicar a sequência, permitir sair e retomar pela Trip e não criar estado paralelo.

## Decisões

- O redirecionamento pós-criação usa o `trip.id` retornado pelo serviço canônico.
- `preparar=1` continua sendo contexto transitório da URL; `onboarding=1` apenas personaliza a primeira entrada.
- Nenhum `WizardState`, `WizardSession`, snapshot, tabela ou cookie de progresso será criado.
- O onboarding termina quando o usuário sai da preparação; a Trip continua acessível normalmente.
- A seleção continua sendo `TripPlacePreference`, não Activity ou Roteiro.

## Critérios de aceite

- após criar uma Trip válida, a URL leva à Etapa 1 do wizard;
- a primeira tela explica “Vamos preparar sua viagem” e os quatro passos;
- o usuário entende que Lugares é o primeiro passo e que nada entra automaticamente no Roteiro;
- links para Explorar, Minha seleção e Contexto preservam o fluxo;
- sair e abrir a Trip novamente oferece retomada clara da preparação;
- fluxo normal fora do wizard permanece compatível;
- acessibilidade, mobile e estados de erro permanecem cobertos;
- nenhuma Activity, Proposal ou recomendação automática é criada pela entrada no onboarding.

## Fora de escopo

Geração/aplicação de Proposal, novo estado persistido de onboarding, personalização baseada em analytics, mudanças de autenticação, mudanças em Production e redesign completo da visão da Trip.

## Validação

`node scripts/validate-docs.mjs`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e E2E aplicável. CI e Vercel Preview serão a evidência final.
