---
id: RB-INC-179
title: Validação multi-destino sem seed e regressão Pipa
description: Valida São Paulo como destino urbano zero-seed e remove Pipa como pré-requisito de catálogo, Guia, Hoje, timezone e Recommendation.
document_type: implementation-increment
owner: Traveler Experience and Platform
status: Draft
version: "0.1.0"
created: "2026-09-03"
last_updated: "2026-09-03"
authors: [RouteBook Team]
tags: [implementation, routebook-anywhere, multi-destination, sao-paulo, pipa]
related_documents: [RB-CORE-0004, RB-ARC-001, RB-ADR-013, RB-ADR-015, RB-INC-175, RB-INC-176, RB-INC-177, RB-INC-178, RB-CTX-179]
prerequisites: [RB-INC-175, RB-INC-176, RB-INC-177, RB-INC-178]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-179 — Validação multi-destino sem seed e regressão Pipa

## 1. Contexto

- Epic: #411.
- Issue: #419.
- Branch: `codex/rb-inc-179-multi-destination-validation`.
- Base: `main@846ea72ab4d87cc3b0164cd43414343a5282ec1e`.
- São Paulo, SP é o segundo cenário obrigatório por densidade urbana, categorias diferentes de praia e risco de homônimos/filiais.
- Florianópolis permanece fixture técnica zero-seed; não substitui a validação urbana.
- Pipa permanece catálogo curado e regressão, mas deixa de controlar a disponibilidade estrutural da experiência.

## 2. Resultado esperado

Uma Viagem para São Paulo, com Hospedagem geocodificada e sem seed, código ou configuração
regional, deve conseguir:

1. abrir Visão, Hoje e Guia por dia;
2. descobrir candidatos externos próximos da Hospedagem;
3. exibir categorias urbanas suportadas, como Gastronomia e Vida noturna;
4. degradar Quality e Media sem inventar nota, foto ou tempo;
5. salvar um candidato revalidado;
6. adicionar o Place global ao Roteiro;
7. representar Hospedagem e Place salvo no mapa;
8. refletir no Guia somente decisões persistidas.

## 3. Generalizações entregues

- a navegação `Hoje` passa a existir para toda Viagem;
- Hoje e Guia por dia deixam de responder 404 fora de Pipa;
- destinos sem guia editorial recebem uma visão derivada apenas de Roteiro e Salvos;
- catálogo curado e Recommendation são resolvidos por Region/proximidade, não por substring do nome;
- o catálogo de Pipa ativa sua experiência editorial somente quando a cobertura espacial possui um único vínculo editorial `pipa-rn-br`;
- mapas da Visão passam a consultar Places publicados da Region, independentemente do nome do Destination;
- timestamps de Quality usam o timezone persistido do Destination;
- Itinerary restaura `time_zone` da própria linha, sem assumir `America/Fortaleza`.

Nenhum seed, alias, branch condicional ou configuração de Provider específica de São Paulo é
adicionada ao produto.

## 4. Evidência de regressão

- Pipa mantém catálogo publicado, mídia e Guia editorial existentes;
- testes Playwright existentes de Pipa permanecem como regressão funcional;
- Florianópolis continua cobrindo Discovery zero-seed com fallback visual;
- o novo cenário São Paulo percorre Visão → Discovery → Salvos → mapa → Roteiro → Hoje → Guia por dia;
- o teste de persistência cobre explicitamente `America/Sao_Paulo`.

## 5. Providers, fallback e custo

O incremento não ativa Provider, billing ou Production. Usa as políticas do RB-INC-177:

- Overture: até 2 invocações lógicas por render de Discovery, raio máximo de 8 km e até 100 tiles por tentativa;
- Quality: opcional, com kill switch e budgets de até 40 requests Google ou 8 Foursquare no teto teórico;
- Media: opcional, até 12 previews lazy e 2 tentativas por preview;
- para São Paulo, o adapter Wikimedia específico do catálogo de Pipa permanece desabilitado e a UI usa ilustração explicitamente identificada, sem fingir fotografia;
- Guia/Hoje genéricos não fazem requests adicionais de Provider: consultam somente Trip, Itinerary, Saved Place e catálogo local por proximidade.

O custo observado continua expresso em request units; preço monetário depende do contrato vigente e
permanece fora do código. Falhas e tentativas são emitidas pelos logs agregados do bootstrap, sem
coordenadas, hospedagem, secrets ou PII.

## 6. Escopo

```text
.gitignore
README.md
apps/web/README.md
apps/web/app/viagens/[tripId]/layout.tsx
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/guia/page.tsx
apps/web/app/viagens/[tripId]/guia/dias/page.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/components/destination-trip-guide.tsx
apps/web/components/destination-trip-guide.test.tsx
apps/web/components/place-ranking-meta.tsx
apps/web/components/place-ranking-meta.test.tsx
apps/web/components/trip-context-nav.tsx
apps/web/e2e/multi-destination-validation.spec.ts
apps/web/lib/recommendation-experience.ts
apps/web/lib/trip-curated-catalog.ts
apps/web/lib/trip-destination.ts
packages/database/src/itinerary-repository.ts
packages/database/src/itinerary-repository.test.ts
docs/implementation/increments/rb-inc-179-multi-destination-validation.md
docs/implementation/context-packs/rb-inc-179-multi-destination-validation.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 7. Fora de escopo

- seed, catálogo editorial ou regra especial para São Paulo;
- generalizar o conteúdo editorial ou a mídia curada de Pipa;
- aceitar RB-ADR-013 ou RB-ADR-015;
- instalar Inngest, fila ou worker;
- novo Provider, billing ou Production;
- ampliar a taxonomia canônica de Place;
- alterar privacidade, retenção ou consentimento;
- integrar na `main` sem autorização humana.

## 8. Critérios de aceite

- [ ] São Paulo funciona com zero seed/código/configuração regional;
- [ ] Hospedagem é a referência prioritária de proximidade;
- [ ] Discovery retorna candidatos e categorias urbanas úteis;
- [ ] Quality e Media degradam sem inventar evidência;
- [ ] candidato pode ser salvo e adicionado ao Roteiro;
- [ ] mapa representa Hospedagem e Place salvo;
- [ ] Hoje e Guia por dia funcionam sem conteúdo exclusivo de Pipa;
- [ ] timezone do Destination é preservado no ranking e no Roteiro;
- [ ] Pipa mantém seu Guia editorial e testes de regressão;
- [ ] CI e Preview estão verdes no mesmo SHA.
