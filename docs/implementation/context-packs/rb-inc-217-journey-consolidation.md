---
id: RB-CTX-217
title: Context Pack do RB-INC-217 — Consolidação da jornada
description: Delimita a validação integrada e responsiva da jornada de preparação, sem redesign nem duplicação dos contratos já testados.
document_type: implementation-context-pack
owner: Experience and Quality
status: Draft
version: "0.1.0"
created: "2026-10-07"
last_updated: "2026-10-07"
authors: [RouteBook Team]
tags: [implementation, context-pack, journey-consolidation, responsive, e2e]
related_documents: [RB-INC-217, RB-INC-207, RB-INC-208, RB-INC-209, RB-INC-210, RB-INC-211, RB-INC-212, RB-INC-213, RB-INC-214, RB-INC-215, RB-INC-216, RB-PRD-004, RB-UX-001, RB-UX-002, RB-UX-005, RB-QA-001, RB-QA-002]
prerequisites: [RB-INC-216]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-217 — Consolidação da jornada

## 1. Missão

Adicionar a evidência integrada ausente entre a seleção explícita, a preparação, a Proposal e o Roteiro aplicado, usando os projetos Playwright desktop/mobile existentes.

## 2. Unidade

- Incremento: `RB-INC-217`.
- Issue: [#527](https://github.com/collapsy/Routebook/issues/527).
- Branch: `codex/rb-inc-217-journey-consolidation`.
- Base: `main@cfd8c460df9677a1618dc63c64c2cb60f04268ca`.

## 3. Leitura e fontes aplicáveis

1. `AGENTS.md`, RB-CORE-0004 e `docs/README.md`;
2. RB-INC-207 e RB-CTX-207, especialmente Etapa 9 e fluxo selection-first;
3. RB-PRD-004 e jornadas de criar Trip, configurar Contexto, construir Minha seleção, gerar Proposal e consultar Roteiro durante a viagem;
4. RB-UX-001, RB-UX-002 e RB-UX-005 para arquitetura, fluxos e interações;
5. RB-INC-208 a RB-INC-216 e Context Packs necessários para contratos implementados;
6. `apps/web/playwright.config.ts` e os E2Es de seleção, contexto, revisão, geração, aceite e Trip ativa;
7. RB-QA-001 e RB-QA-002, estratégia e plano mestre de testes;
8. `docs/registry.md` e `docs/implementation/traceability-matrix.md`.

## 4. Estado e lacuna

- O Playwright já configura `desktop-chromium` e `mobile-chromium` para specs autenticados.
- Specs separados já cobrem Lugar/WANT, Contexto progressivo, revisão antes da geração, geração sem alteração automática, aceite e REPLAN.
- A nova evidência deve conectar os passos para a mesma Trip, não substituir essas provas menores.
- A autorização E2E não inclui redesign. Assertivas devem refletir comportamento e UX canônicos existentes.

## 5. Invariantes

- `TripPlacePreference` é intenção; não cria Activity.
- Proposal é sugestão não aplicada.
- Itinerary muda somente após ação explícita de aceite.
- O estado e a persistência observados devem vir do sistema real de teste, não de mocks tratados como integração concluída.
- Trip, selection, Proposal e Itinerary permanecem nos contratos já existentes.

## 6. Fixtures, viewport e estabilidade

- Reutilizar `createAuthenticatedE2ETrip` e fixtures determinísticas existentes quando adequados.
- Criar/place fixtures com identificadores únicos e sem PII real.
- Não consultar Places externos, Provider de mapas nem fontes de rede variáveis.
- Deixar os projetos Playwright escolherem viewport/browser; não forçar o teste a outro tamanho para mascarar falha responsiva.
- Preferir rótulos semânticos, `aria` e estados persistidos a seletores frágeis de estilo.
- Minimizar o número de journeys para conter custo/tempo da suíte.

## 7. Caminhos e limites

Alterar somente os caminhos listados em RB-INC-217. Não alterar setup global de Playwright, helpers compartilhados, componentes, páginas ou CSS neste corte. Se o cenário precisar disso, parar e propor mudança de escopo antes.

## 8. Critérios verificáveis

- Mesma Trip percorre seleção → Contexto → Revisão → Proposal → aceite → Roteiro.
- Persistência e ausência de aplicação prévia são verificadas na fronteira correta.
- Cenário executa em `desktop-chromium` e `mobile-chromium`.
- E2Es existentes permanecem, sem cobertura removida.
- Documentação e comandos de validação registram resultados efetivamente observados.

## 9. Validação

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @routebook/web exec playwright test e2e/journey-consolidation.spec.ts --project=desktop-chromium --project=mobile-chromium
pnpm test:e2e
```

Os testes E2E completos exigem banco de teste, build e instalação de Chromium conforme CI.

## 10. Escalar/interromper

Pare se for necessária alteração de regra de produto, lifecycle, domínio, UX canônica, helper/configuração global, componente ou CSS fora do escopo. Registre o comportamento observado e solicite atualização do incremento ou issue específica.

## 11. Gate

Não fazer merge da PR sem autorização humana explícita.
