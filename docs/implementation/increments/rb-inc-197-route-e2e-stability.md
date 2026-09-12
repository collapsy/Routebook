---
id: RB-INC-197
title: Estabilizar E2E de rotas sem depender do evento global load
description: Torna o cenário de confiabilidade de rotas semanticamente orientado ao conteúdo renderizado, sem alterar código de produto.
document_type: implementation-increment
owner: Traveler Experience and Engineering Quality
status: Draft
version: "0.1.0"
created: "2026-09-11"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, e2e, playwright, reliability, routes, ci]
related_documents: [RB-CORE-0004, RB-INC-193, RB-INC-195, RB-CTX-197]
prerequisites: [RB-INC-195]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-197 — Estabilizar E2E de rotas sem depender do evento global load

## 1. Objetivo

Estabilizar o cenário `route-destination-reliability.spec.ts` para que a prontidão da página de detalhe seja validada pelo conteúdo traveler-facing realmente necessário ao teste, em vez de depender do evento global `load` do navegador.

Issue: `#466`.

Branch: `codex/rb-inc-197-route-e2e-stability`.

Base empilhada: RB-INC-195 / PR `#463` @ `6c64ec74a63965f68cad4cd077d9ac5526c6add9`.

## 2. Evidência

No mesmo SHA do RB-INC-195, o Engineering Validation reproduziu três vezes timeout em `page.goto(.../lugares/praia-do-amor)` enquanto aguardava o evento global `load`:

- tentativa 1: 151 E2E passaram, um cenário ficou flaky e `route-destination-reliability` falhou;
- tentativa 2: 151 passaram, outro cenário ficou flaky e o mesmo teste de rota falhou;
- tentativa 3: 152 passaram e somente o teste de rota falhou;
- em todas as três tentativas, retries do teste de rota também excederam 90 segundos no mesmo `page.goto`;
- formatting, documentação, lint, typecheck, migrations, testes de domínio/componentes, normalizador Overture, imagens, smoke e build ficaram verdes;
- o SHA-base do RB-INC-193 / PR `#461` foi reexecutado no ambiente corrente e completou a suíte E2E com sucesso.

O delta funcional do RB-INC-195 no detalhe publicado adiciona apenas rótulos estáticos para `tour` e `shopping`; não altera a leitura, identidade ou renderização da Praia do Amor. A correção deste incremento é, portanto, limitada à semântica de prontidão do teste.

## 3. Decisão

Para a navegação que abre o detalhe da Praia do Amor:

1. usar `waitUntil: "domcontentloaded"` no `page.goto`;
2. aguardar explicitamente o heading traveler-facing `Praia do Amor` ficar visível;
3. somente então ler `Rota a pé` e `Rota de carro` e preservar as asserções atuais de destino.

O teste deixa de exigir que todos os recursos não essenciais da página concluam o evento global `load`, mas continua exigindo que a própria experiência necessária ao cenário esteja renderizada e utilizável.

## 4. Escopo

- alterar apenas `apps/web/e2e/route-destination-reliability.spec.ts`;
- adicionar documentação e registro do incremento;
- preservar as asserções existentes dos destinos do Google Maps;
- preservar cobertura desktop/mobile da suíte configurada;
- validar pelo Engineering Validation.

## 5. Fora de escopo

- alterar código de produto;
- alterar Place, Discovery, ranking, mídia, Recommendation, Saved Place, Activity ou Proposal;
- aumentar timeout como solução primária;
- mascarar falhas com `try/catch`, `skip`, `fixme` ou remoção de asserções;
- alterar configuração global do Playwright;
- Production;
- merge na `main` sem gate humano.

## 6. Caminhos autorizados

```text
apps/web/e2e/route-destination-reliability.spec.ts
docs/implementation/increments/rb-inc-197-route-e2e-stability.md
docs/implementation/context-packs/rb-inc-197-route-e2e-stability.md
docs/registry.md
```

## 7. Critérios de aceite

- [ ] a navegação ao detalhe da Praia do Amor não depende do evento global `load`;
- [ ] o teste exige que o heading `Praia do Amor` esteja visível antes de ler os links de rota;
- [ ] as asserções de `Rota a pé` e `Rota de carro` continuam verificando o destino completo atual;
- [ ] nenhum código de produto é alterado;
- [ ] não há aumento artificial de timeout, skip ou relaxamento das asserções funcionais;
- [ ] Documentation Validation e Engineering Validation passam no mesmo SHA;
- [ ] a correção permanece isolada e rastreável sobre o RB-INC-195.

## 8. Riscos e mitigação

**Prontidão cedo demais:** `domcontentloaded` sozinho não é considerado suficiente; o teste também espera explicitamente o heading traveler-facing do detalhe.

**Mascarar regressão real:** as asserções de rota não são removidas nem flexibilizadas. Se o detalhe não renderizar ou os links não existirem, o teste continua falhando.

**Expansão de escopo:** nenhum código de produto é autorizado neste incremento.
