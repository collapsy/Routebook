---
id: RB-INC-161
title: Experiência de viagem ativa e navegação mobile
description: Reduz a fricção entre Guia, Lugares, Salvos e Roteiro e prioriza o Dia atual durante a viagem, preservando decisões explícitas e o domínio existente.
document_type: implementation-increment
owner: Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-20"
last_updated: "2026-08-20"
authors: [RouteBook Team]
tags: [implementation, active-trip, navigation, mobile, guide, itinerary]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-UX-002, RB-UX-005, RB-INC-159, RB-INC-160, RB-INC-136, RB-CTX-161]
prerequisites: [RB-INC-159, RB-INC-160]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-161 — Experiência de viagem ativa e navegação mobile

## 1. Contexto

Issue: `#375`.

Branch: `codex/rb-inc-161-active-trip-mobile-experience`.

Baseline: `8aa9309ad8c7eea48674515a931da7df69029afe`, `main` sem diff funcional em relação ao release `7f68a5693ba405e599c00c497c5458b0b92f8640` após a reversão imediata de um arquivo temporário criado acidentalmente.

O RB-INC-160 colocou em Production o Guia diário completo de Pipa e o RB-INC-159 reduziu a fricção entre Place e Roteiro. A experiência ainda exige, porém, retornos frequentes à Visão da Viagem para alternar entre superfícies e o Roteiro apresenta muitas ações secundárias competindo com a leitura principal no celular.

RB-UX-002 estabelece que o sistema preserve contexto ao navegar entre áreas, que fluxos críticos funcionem em celular e inclui `RB-UF-022 — Consultar Dia atual`. RB-UX-005 exige comportamento mobile intencional, navegação previsível e estados compreensíveis sem depender de cor.

## 2. Objetivo

Tornar a Viagem ativa mais rápida de consultar e operar, especialmente no celular, sem alterar domínio, persistência ou Providers:

- permitir alternância direta entre Guia, Lugares, Salvos e Roteiro;
- priorizar o Dia atual quando ele pertence ao Período da Viagem;
- manter seleção explícita por URL com precedência sobre foco automático;
- tornar o marcador `Hoje` textual e acessível;
- reduzir competição visual das ações secundárias de Activity em viewport mobile;
- preservar todas as capacidades atuais de edição, movimentação, reordenação e remoção.

## 3. Decisões

### 3.1 Navegação contextual pertence à Viagem

A navegação é renderizada no layout autorizado da Viagem e acompanha as superfícies filhas. `Guia` aparece somente quando o Destino possui Guia editorial suportado; `Lugares`, `Salvos` e `Roteiro` permanecem sempre acessíveis.

A navegação não cria nova área de produto: ela oferece atalhos para superfícies já existentes.

### 3.2 Dia atual é preferência de apresentação, não estado

O Dia atual é derivado em runtime e nunca persistido. A regra é:

1. seleção explícita válida por URL vence;
2. se a data atual no timezone do Destino pertence ao Período, esse Dia recebe foco;
3. caso contrário, permanece o fallback determinístico para o primeiro Dia.

Para Pipa, a apresentação usa `America/Fortaleza`. Nenhuma mudança é feita no domínio de Trip ou Itinerary.

### 3.3 Guia continua editorial

O Guia pode abrir visualmente o Dia atual e marcá-lo como `Hoje`, mas a leitura não cria Activity, Saved Place, Decision, Recommendation ou Proposal.

### 3.4 Ações secundárias continuam disponíveis

No Roteiro, controles de manutenção da Activity continuam semanticamente idênticos. Em mobile, agrupamento e hierarquia visual reduzem ruído sem remover acesso por teclado, toque ou leitor de tela.

## 4. Escopo

- navegação contextual persistente da Viagem;
- estado ativo da navegação sem depender apenas de cor;
- regra pura e testável de Dia atual;
- foco automático no Dia atual no Guia e no Roteiro;
- marcador textual `Hoje` nos seletores aplicáveis;
- simplificação responsiva das ações secundárias de Activity;
- regressão unitária e E2E da jornada ativa;
- documentação, Context Pack e Registry.

## 5. Fora de escopo

- novo fluxo ou conceito de domínio;
- persistir Dia atual;
- autoaplicar Guia, Recommendation, Decision ou Proposal;
- criar, alterar ou remover Activity sem ação explícita;
- novo Provider, SDK, API paga, secret ou dependência;
- migration ou alteração de schema;
- clima, maré, trânsito ou disponibilidade em tempo real;
- redesenho completo do catálogo ou da Visão da Viagem;
- evidência humana da Fase B do M8;
- merge ou Production sem gates humanos separados.

## 6. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/layout.tsx
apps/web/app/viagens/[tripId]/guia/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/roteiro/itinerary-journey.module.css
apps/web/components/trip-context-nav.tsx
apps/web/components/trip-context-nav.module.css
apps/web/components/trip-day-guide.tsx
apps/web/components/trip-day-guide.module.css
apps/web/lib/trip-active-day.ts
apps/web/lib/trip-active-day.test.ts
apps/web/e2e/active-trip-experience.spec.ts
apps/web/e2e/trip-day-guide.spec.ts
apps/web/e2e/itinerary.spec.ts
docs/implementation/increments/rb-inc-161-active-trip-mobile-experience.md
docs/implementation/context-packs/rb-inc-161-active-trip-mobile-experience.md
docs/registry.md
```

Arquivo adicional indispensável exige atualização explícita desta seção e justificativa na PR.

## 7. Critérios de aceite

- [ ] dentro de uma Viagem, o usuário alterna diretamente entre Guia, Lugares, Salvos e Roteiro sem retornar à Visão da Viagem;
- [ ] `Guia` não é oferecido quando o Destino não possui Guia editorial suportado;
- [ ] navegação permanece legível e operável em viewport mobile;
- [ ] estado atual da navegação é semanticamente identificável;
- [ ] quando hoje pertence ao Período, Guia e Roteiro focam esse Dia na ausência de seleção explícita;
- [ ] seleção explícita válida por `dia` continua tendo precedência;
- [ ] quando hoje está fora do Período, o primeiro Dia permanece fallback determinístico;
- [ ] seletor identifica o Dia atual com texto `Hoje` sem depender apenas de cor;
- [ ] ações editar, mover, reordenar e remover continuam acessíveis;
- [ ] ações secundárias não dominam visualmente o card de Activity em mobile;
- [ ] navegação contextual e foco em `Hoje` não introduzem persistência ou mutation adicional; o comportamento preexistente do Roteiro permanece inalterado;
- [ ] CI completa passa no mesmo SHA e Preview Vercel correspondente fica READY.

## 8. Testes obrigatórios

- unitário cobre data atual dentro, antes e depois do Período;
- unitário cobre timezone `America/Fortaleza` e seleção explícita;
- E2E dedicado cobre navegação direta entre Guia, Lugares, Salvos e Roteiro;
- E2E dedicado cobre foco e marcador `Hoje` em Viagem que contém a data de execução;
- E2E dedicado cobre precedência de `dia` explícito no Roteiro;
- E2E mobile comprova navegação e acesso às ações secundárias;
- regressões existentes do Guia, Place Actions e Roteiro permanecem verdes;
- `node scripts/validate-docs.mjs`;
- `pnpm format:check`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- Playwright aplicável.

## 9. Riscos e mitigação

- **timezone selecionar Dia incorreto:** helper explícito usa timezone do Destino suportado e testes de fronteira;
- **foco automático sobrescrever intenção:** query `dia` válida sempre vence;
- **navegação mostrar rota inexistente:** disponibilidade de Guia é derivada do Destino no layout;
- **ações ficarem escondidas demais:** agrupamento mantém label textual, foco e acesso sem gesto exclusivo;
- **duplicar consultas no layout:** leitura adicional de Trip é limitada à composição visual e não altera estado;
- **regressão de E2E existente:** seletores e capacidades canônicas são preservados e suíte crítica é reexecutada.

## 10. Rollback

Reverter o incremento remove a navegação contextual, o foco automático no Dia atual e a hierarquia mobile adicional. Não existe migration, Provider, secret ou dado persistido novo para desfazer.
