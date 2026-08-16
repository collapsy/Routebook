---
id: RB-INC-155
title: Guia Prático por Lugar em Pipa
description: Adiciona orientação operacional rastreável aos detalhes dos 30 Places publicados de Pipa, sem apresentar conteúdo editorial como dado em tempo real.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors: [RouteBook Team]
tags: [implementation, pipa, place, guide, traveler-experience, sources]
related_documents: [RB-CORE-0004, RB-INC-137, RB-INC-143, RB-INC-153, RB-INC-154, RB-CTX-155]
prerequisites: [RB-INC-137, RB-INC-153, RB-INC-154]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-155 — Guia Prático por Lugar em Pipa

## 1. Contexto

Issue: `#359`.

Branch: `codex/rb-inc-155-pipa-place-practical-guide`.

Baseline: `c46fdd1c190a0ad20d69cf19c6df00a17019c51e`.

Após RB-INC-153 e RB-INC-154, Discovery comunica a cobertura total, oferece ações de
mapa/fotos e abre rotas reais no Google Maps. O detalhe dos 30 Places publicados,
porém, ainda concentra resumo, endereço, coordenadas e distância geodésica. Para a
viagem de 22 a 29 de agosto de 2026, falta apoio para encaixar cada opção no dia.

## 2. Objetivo

Oferecer em cada Place publicado de Pipa um perfil operacional com:

- adequação da experiência;
- duração sugerida;
- janela recomendada;
- orientação de acesso;
- verificações antes de sair;
- referências e data de revisão.

## 3. Natureza da informação

O perfil é uma orientação editorial versionada, não um feed em tempo real. Duração e
melhor janela ajudam a planejar, mas não representam promessa de funcionamento,
maré, clima, preço, lotação, trânsito ou disponibilidade.

Para praias e atrativos naturais, o guia referencia a Prefeitura de Tibau do Sul e o
Visit Brasil. Para estabelecimentos, o conteúdo deriva do catálogo publicado e exige
confirmação operacional no dia pela ação externa já existente.

## 4. Decisões

- os 30 slugs são cobertos explicitamente por um catálogo tipado na aplicação;
- ausência de perfil degrada para um aviso honesto, sem bloquear o Place;
- o perfil não altera Place, Recommendation, Saved Place ou Itinerary;
- linha reta continua distinta de rota real;
- informações voláteis não são persistidas como atuais;
- links de fonte abrem em nova aba e preservam o conteúdo do RouteBook.

## 5. Escopo

- catálogo editorial tipado dos 30 Places;
- seção de planejamento prático no detalhe;
- referências institucionais para praias e natureza;
- contrato unitário de cobertura e incerteza;
- E2E de atrativo natural e estabelecimento;
- documentação e Registry.

## 6. Fora de escopo

- imagens, assets, licença de mídia ou migration;
- Provider de rotas, API key, billing ou SDK;
- horários, preços, cardápios, maré, clima e disponibilidade em tempo real;
- publicação automática de candidato externo;
- alteração do catálogo canônico.

## 7. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/lib/pipa-place-guide.ts
apps/web/lib/pipa-place-guide.test.ts
apps/web/e2e/place-details.spec.ts
docs/implementation/increments/rb-inc-155-pipa-place-practical-guide.md
docs/implementation/context-packs/rb-inc-155-pipa-place-practical-guide.md
docs/registry.md
```

## 8. Critérios de aceite

- [ ] os 30 slugs publicados possuem perfil explícito;
- [ ] duração e janela são identificadas como orientação;
- [ ] Baía dos Golfinhos apresenta dependência de maré para acesso e retorno;
- [ ] negócios exigem confirmação de funcionamento no dia;
- [ ] fontes institucionais e data de revisão ficam visíveis;
- [ ] ausência de perfil possui fallback honesto;
- [ ] rota real e distância geodésica preservam significados distintos;
- [ ] CI completa passa no mesmo SHA.

## 9. Testes obrigatórios

- teste unitário compara exatamente os 30 slugs;
- teste unitário valida conteúdo, HTTPS e data de revisão;
- teste unitário cobre slug desconhecido, maré e negócio;
- E2E comprova guia natural, fontes e rota;
- E2E comprova confirmação atual e ausência de rota sem hospedagem geocodificada;
- format, docs, lint, typecheck, testes, build e Playwright.

## 10. Riscos e mitigação

- **conteúdo ficar desatualizado:** data de revisão e confirmação no dia permanecem visíveis;
- **duração parecer precisa:** copy usa `sugerido` e disclosure editorial;
- **fonte geral parecer status atual:** fonte institucional fica separada da consulta operacional;
- **perfil ausente:** fallback preserva resumo e ações externas.

## 11. Rollback

Reverter o commit remove somente o catálogo editorial e sua seção visual. Não há
migration, Provider, secret, dependência ou dado para desfazer.
