---
id: RB-CTX-219
title: Context Pack do RB-INC-219 — Contexto temporal do Guia
description: Delimita a apresentação honesta do Dia em foco antes, durante e depois do Período da Trip.
document_type: implementation-context-pack
owner: Experience and Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-10-08"
last_updated: "2026-10-08"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip-guide, date-context]
related_documents: [RB-INC-219, RB-INC-217, RB-CTX-217, RB-CORE-0004, RB-UX-001]
prerequisites: [RB-INC-217]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-219 — Contexto temporal do Guia

## 1. Missão

Corrigir a impressão de que o Dia fallback da Trip é a data de hoje quando o Período não contém a data atual, preservando seleção e navegação existentes.

## 2. Unidade

- Incremento: `RB-INC-219`.
- Issue: [#532](https://github.com/collapsy/Routebook/issues/532).
- Branch: `codex/issue-532-trip-guide-date-context`.
- Base: `codex/issue-531-resume-proposal` (PR #533), dependente da PR #530.

## 3. Fontes aplicáveis

1. `AGENTS.md`, `docs/core/routebook-bible.md` e `docs/README.md`;
2. RB-INC-217 e RB-CTX-217, para contratos da Visão Geral e do Guia e disciplina de E2E;
3. RB-UX-001, seções 91 e 129: Dia atual recebe prioridade durante a Viagem; os modos da Trip não criam lifecycle novo;
4. `apps/web/lib/trip-active-day.ts` e seu teste, fonte de data no fuso e fallback do Dia;
5. Visão da Trip, Guia por Destino, experiências de Pipa e specs E2E relevantes;
6. `docs/registry.md` e `docs/implementation/traceability-matrix.md`.

## 4. Evidência e interpretação

- `resolveTripTodayDate` já retorna `null` se hoje não pertence aos Dias da Trip.
- A seleção existente usa o primeiro Dia como fallback nessa condição.
- `DestinationTripGuide` mostrava incondicionalmente “Hoje em {destino}”; a Visão Geral também oferecia “Ver Hoje” sem consultar o Período.
- A experiência específica de Pipa já distingue “Hoje” quando sua data coincide, mas precisa de contexto para diferenciar viagem futura/encerrada.
- A UX prioriza o Dia atual durante a viagem; para datas fora do Período, os rótulos devem explicitar próximo/encerrado, sem alterar estado canônico.

## 5. Invariantes

- Data atual é calculada no fuso do Destino.
- O Dia selecionado ou fallback conserva sua data real.
- “Hoje” só é usado para o Dia que corresponde à data local atual.
- Classificação antes/durante/depois é efêmera e não altera `Trip.status`, datas, Itinerary ou persistência.
- Navegação explicitamente escolhida continua prevalecendo sobre o fallback.

## 6. Limites e validação

Alterar apenas os caminhos listados em RB-INC-219. Adicionar teste unitário de classificação por fuso e E2E com períodos futuros e passados calculados em relação ao relógio do teste. Atualizar a expectativa do spec multi-destino que hoje fixa datas futuras. Não tornar os testes dependentes de 08/10/2026 ou de datas hard-coded já vencidas.

Não alterar regra de seleção, estados do domínio, lifecycle, banco, migrations ou Providers. A label “Guia por dia” permanece o modo alternativo; esta issue trata a identificação temporal do Dia em foco.

## 7. Fora de escopo e escalonamento

Não fazer redesign do Guia, alterar atividades/recomendações ou incluir novas áreas/status. Se a correção demandar alteração fora dos caminhos permitidos, atualizar o incremento antes.

Não fazer merge da PR sem autorização humana.
