---
id: RB-INC-171
title: Navegação mobile e separação Hoje / Guia por dia
description: Reduz carga cognitiva separando o uso imediato do Dia do Guia editorial e alinha a navegação principal mobile ao padrão fixo inferior.
document_type: implementation-increment
owner: Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-28"
last_updated: "2026-08-28"
authors: [RouteBook Team]
tags: [implementation, navigation, mobile, guide, today, usability, pipa]
related_documents: [RB-CORE-0004, RB-UX-001, RB-UX-005, RB-INC-161, RB-INC-165, RB-INC-169, RB-INC-170, RB-CTX-171]
prerequisites: [RB-INC-161, RB-INC-169, RB-INC-170]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-171 — Navegação mobile e separação Hoje / Guia por dia

## 1. Contexto

Issue: `#399`.

Branch: `codex/rb-inc-171-mobile-navigation-focus`.

Base de Preview: PR #398 / SHA `e37a954a7065eab67828331d9c475fcd5517696d`, empilhada sobre #396 e #387.

Feedback funcional humano no Preview consolidado:

> Parece que tem muita coisa na mesma página a navegação está um pouco confusa.

A inspeção identificou duas causas objetivas:

1. `/guia` renderizava experiências imediatas do Dia e, logo abaixo, o Guia editorial inteiro de 8 Dias;
2. o `TripContextNav` usava scroller horizontal no topo em mobile, apesar de RB-INT-001 definir navegação principal fixa na parte inferior nas áreas centrais.

## 2. Objetivo

Reduzir carga cognitiva sem remover capacidades:

- `Hoje` responde ao que importa na data em foco;
- `Guia por dia` preserva o planejamento editorial multi-dia;
- navegação principal deixa claro como alternar entre Hoje, Lugares, Roteiro, Salvos e Viagem;
- mobile usa barra inferior fixa;
- desktop preserva navegação contextual superior.

## 3. Arquitetura de informação aplicada

```text
Viagem
├── Hoje                  /guia
│   └── Guia por dia      /guia/dias
├── Lugares
├── Roteiro
├── Salvos
└── Viagem                visão geral
```

`Guia por dia` é uma sub-superfície de `Hoje`, não um sexto destino primário.

## 4. Comportamento

### Hoje

`/viagens/[tripId]/guia` mantém:

- seleção explícita de `dia`;
- fallback para Hoje no timezone de Pipa;
- céu e horizonte;
- Rolês confirmados;
- mapa das experiências;
- ações que apenas pré-preenchem o Roteiro.

O Guia editorial multi-dia deixa de ser renderizado nessa URL.

### Guia por dia

`/viagens/[tripId]/guia/dias` mantém:

- todos os Dias editoriais;
- imagens, paradas, horários, distâncias e mapas;
- ações de planejamento explícito;
- Dia atual em destaque;
- `dia` explícito com precedência para o Dia inicialmente aberto.

### Navegação principal

Desktop continua superior.

Mobile passa a ser fixo na parte inferior:

```text
Hoje | Lugares | Roteiro | Salvos | Viagem
```

A barra respeita safe area e o layout recebe spacer para não esconder conteúdo.

## 5. Invariantes

- Recommendation continua não sendo Decision;
- Guia continua não sendo Roteiro;
- navegar não cria Activity, Saved Place ou Decision;
- `dia` continua sendo estado de apresentação, não persistência;
- nenhuma nova mutation;
- nenhum Provider, secret, billing, schema ou migration;
- conteúdo editorial e experiências temporais mantêm Provenance existente;
- #387 continua com gate humano de aceite funcional.

## 6. Escopo

- separar `/guia` e `/guia/dias`;
- navegação Hoje / Guia por dia;
- barra inferior mobile;
- item direto para Visão da Viagem;
- foco explícito do Dia no Guia editorial;
- entrada da Visão da Viagem para Hoje;
- E2E de navegação e regressão do Guia;
- documentação, Registry e rastreabilidade.

## 7. Caminhos autorizados

```text
apps/web/components/trip-context-nav.tsx
apps/web/components/trip-context-nav.module.css
apps/web/components/trip-guide-mode-nav.tsx
apps/web/components/trip-guide-mode-nav.module.css
apps/web/components/trip-day-guide.tsx
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/guia/page.tsx
apps/web/app/viagens/[tripId]/guia/dias/page.tsx
apps/web/e2e/active-trip-experience.spec.ts
apps/web/e2e/trip-day-guide.spec.ts
docs/implementation/increments/rb-inc-171-mobile-navigation-focus.md
docs/implementation/context-packs/rb-inc-171-mobile-navigation-focus.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Fora de escopo

- redesenho integral da Visão da Viagem;
- ranking visual/#390;
- novos eventos ou astronomia;
- Google Places Photos/#382;
- clima, maré ou trânsito;
- mudança de domínio/persistência;
- merge da #387/#396/#398 antes do aceite funcional.

## 9. Critérios de aceite

- [ ] `/guia` não contém mais os cards editoriais de todos os Dias;
- [ ] `/guia/dias` preserva o Guia editorial;
- [ ] Hoje/Guia por dia possuem alternância explícita;
- [ ] `dia` é preservado ao alternar modos;
- [ ] navegação principal tem cinco destinos no Preview de Pipa;
- [ ] mobile usa barra fixa inferior sem rolagem horizontal;
- [ ] conteúdo não fica coberto pela barra inferior;
- [ ] desktop mantém navegação superior;
- [ ] Visão da Viagem é acessível diretamente;
- [ ] `aria-current` identifica área/modo ativo;
- [ ] ações e semântica existentes permanecem;
- [ ] Documentation e Engineering/Playwright verdes no mesmo SHA;
- [ ] Vercel Preview READY no mesmo SHA.

## 10. Testes

- E2E ativo comprova cinco destinos, Hoje ativo e alternância para Guia por dia;
- E2E mobile comprova `position: fixed` da navegação;
- E2E do Guia comprova que `/guia` não contém Dias editoriais;
- E2E do Guia comprova cobertura de 8 Dias em `/guia/dias`;
- E2E preserva rotas, planejamento e experiências do RB-INC-169;
- gates completos do monorepo.

## 11. Riscos

**Barra cobrir conteúdo:** spacer dedicado + safe-area inset.

**Hoje parecer equivalente a Guia editorial:** alternância local explicita os dois modos.

**Perder data ao alternar:** query `dia` é propagada entre as duas URLs.

**Regressão de navegação existente:** rotas antigas de `/guia` permanecem válidas, apenas com responsabilidade reduzida.

## 12. Merge e aceite

Esta PR é empilhada sobre #398. Nenhuma PR da pilha deve ser mergeada antes do aceite funcional humano do Preview consolidado, respeitando o gate explícito da #387.
