---
id: RB-CTX-197
title: Context Pack do RB-INC-197 — Estabilidade do E2E de rotas
description: Delimita a correção de prontidão do E2E de rotas sem alterar comportamento de produto.
document_type: implementation-context-pack
owner: Traveler Experience and Engineering Quality
status: Draft
version: "0.1.0"
created: "2026-09-11"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, e2e, playwright, reliability, routes]
related_documents: [RB-INC-197, RB-CORE-0004, RB-INC-193, RB-INC-195]
prerequisites: [RB-INC-195]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-197 — Estabilidade do E2E de rotas

## 1. Missão

Corrigir a fragilidade de sincronização do cenário `route-destination-reliability.spec.ts` sem alterar produto, contratos de domínio ou asserções funcionais de destino.

## 2. Unidade de trabalho

- issue: `#466`;
- branch: `codex/rb-inc-197-route-e2e-stability`;
- base: RB-INC-195 / PR `#463` @ `6c64ec74a63965f68cad4cd077d9ac5526c6add9`;
- Production permanece fora de escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. RB-INC-193;
5. RB-INC-195;
6. RB-INC-197;
7. `apps/web/e2e/route-destination-reliability.spec.ts`;
8. `apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx`.

## 4. Fatos confirmados

- a página de detalhe renderiza `place.name` em um `<h1>` traveler-facing;
- o teste falha antes de inspecionar os links, enquanto `page.goto` espera o evento global `load`;
- o cenário precisa validar conteúdo e links de rota, não a conclusão de todos os recursos da página;
- o RB-INC-195 não mudou o fluxo de leitura/renderização da Praia do Amor;
- as três execuções do SHA do RB-INC-195 falharam no mesmo `page.goto`, incluindo retries;
- todos os demais gates de CI do RB-INC-195 passaram;
- a base RB-INC-193 completou o E2E em rerun contemporâneo.

## 5. Implementação autorizada

Apenas na navegação para `/viagens/${trip.id}/lugares/praia-do-amor`:

```ts
await page.goto(`/viagens/${trip.id}/lugares/praia-do-amor`, {
  waitUntil: "domcontentloaded",
});
await expect(page.getByRole("heading", { name: "Praia do Amor", level: 1 })).toBeVisible();
```

Depois disso, manter as leituras e asserções atuais de `Rota a pé` e `Rota de carro`.

## 6. Contratos preservados

- o destino esperado continua `Praia do Amor, Pipa, Tibau do Sul — RN`;
- o teste continua falhando se o detalhe não renderizar;
- o teste continua falhando se os links de rota não existirem ou apontarem para destino incorreto;
- nenhum timeout é aumentado;
- nenhum teste é pulado;
- nenhum código de produto é alterado.

## 7. Caminhos permitidos

```text
apps/web/e2e/route-destination-reliability.spec.ts
docs/implementation/increments/rb-inc-197-route-e2e-stability.md
docs/implementation/context-packs/rb-inc-197-route-e2e-stability.md
docs/registry.md
```

## 8. Validação

- Prettier/formatting;
- documentação;
- lint e typecheck;
- suíte unitária/integrada;
- build;
- E2E completo do Engineering Validation;
- sem regressão ou relaxamento das asserções do cenário de rota.

## 9. Handoff

Relatar issue, branch, SHA, arquivos alterados e resultado do Engineering Validation. A correção só pode ser considerada adequada se o E2E completo passar sem alteração de código de produto.
