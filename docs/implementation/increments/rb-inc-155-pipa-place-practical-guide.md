---
id: RB-INC-155
title: Guia Diário Visual de Pipa
description: Combina Places publicados, imagens, mapa e orientação editorial num roteiro-base visual para o primeiro dia da viagem, preservando o detalhe prático dos 30 Places.
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

# RB-INC-155 — Guia Diário Visual de Pipa

## 1. Contexto

Issue: `#359`.

Branch: `codex/rb-inc-155-pipa-place-practical-guide`.

Baseline: `c46fdd1c190a0ad20d69cf19c6df00a17019c51e`.

Após RB-INC-153 e RB-INC-154, Discovery comunica a cobertura total, oferece ações de
mapa/fotos e abre rotas reais no Google Maps. A primeira versão deste incremento
enriqueceu o detalhe dos 30 Places, mas a validação no Preview mostrou que fichas
isoladas ainda não entregam uma experiência de guia para 22 a 29 de agosto de 2026.

## 2. Objetivo

Combinar os elementos existentes numa sugestão diária visual e acionável, começando
pelo primeiro dia da viagem, e preservar em cada Place publicado um perfil com:

- ordem sugerida e período de cada parada;
- mapa dedicado ao dia;
- imagem curada ou fallback honesto;
- acesso à rota individual e à sequência no Google Maps;
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

- o primeiro dia usa três Places canônicos selecionados explicitamente e não grava roteiro;
- lista e mapa do guia usam a mesma ordem;
- rota e tempo atuais são calculados somente quando o viajante abre o Google Maps;
- os 30 slugs são cobertos explicitamente por um catálogo tipado na aplicação;
- ausência de perfil degrada para um aviso honesto, sem bloquear o Place;
- o perfil não altera Place, Recommendation, Saved Place ou Itinerary;
- linha reta continua distinta de rota real;
- informações voláteis não são persistidas como atuais;
- links de fonte abrem em nova aba e preservam o conteúdo do RouteBook.

## 5. Escopo

- guia visual do primeiro dia na visão da viagem;
- mapa sequenciado, imagens, distâncias estimadas e links de rota atual;
- alternativa para chegada depois do almoço;
- catálogo editorial tipado dos 30 Places;
- seção de planejamento prático no detalhe;
- referências institucionais para praias e natureza;
- contrato unitário de cobertura e incerteza;
- E2E de atrativo natural e estabelecimento;
- documentação e Registry.

## 6. Fora de escopo

- novos assets, nova licença de mídia ou migration;
- Provider de rotas, API key, billing ou SDK;
- horários, preços, cardápios, maré, clima e disponibilidade em tempo real;
- publicação automática de candidato externo;
- alteração do catálogo canônico.

## 7. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/page.tsx
apps/web/components/trip-day-guide.tsx
apps/web/components/trip-day-guide.module.css
apps/web/lib/pipa-day-guide.ts
apps/web/lib/pipa-day-guide.test.ts
apps/web/lib/pipa-place-guide.ts
apps/web/lib/pipa-place-guide.test.ts
apps/web/lib/google-maps-links.ts
apps/web/lib/google-maps-links.test.ts
apps/web/e2e/place-details.spec.ts
apps/web/e2e/trip-day-guide.spec.ts
docs/implementation/increments/rb-inc-155-pipa-place-practical-guide.md
docs/implementation/context-packs/rb-inc-155-pipa-place-practical-guide.md
docs/registry.md
```

## 8. Critérios de aceite

- [ ] a visão da viagem apresenta o guia do primeiro dia antes da grade genérica;
- [ ] três paradas canônicas aparecem na mesma ordem na lista e no mapa;
- [ ] imagem curada e fallback preservam Provenance e significado;
- [ ] distância em linha reta não é apresentada como rota ou tempo;
- [ ] Google Maps recebe rota individual e sequência completa quando há hospedagem;
- [ ] chegada tardia e ausência de hospedagem possuem degradação honesta;
- [ ] os 30 slugs publicados possuem perfil explícito;
- [ ] duração e janela são identificadas como orientação;
- [ ] Baía dos Golfinhos apresenta dependência de maré para acesso e retorno;
- [ ] negócios exigem confirmação de funcionamento no dia;
- [ ] fontes institucionais e data de revisão ficam visíveis;
- [ ] ausência de perfil possui fallback honesto;
- [ ] rota real e distância geodésica preservam significados distintos;
- [ ] CI completa passa no mesmo SHA.

## 9. Testes obrigatórios

- teste unitário valida seleção, ordem e completude do primeiro dia;
- teste unitário valida URL Google Maps com waypoints;
- teste unitário compara exatamente os 30 slugs;
- teste unitário valida conteúdo, HTTPS e data de revisão;
- teste unitário cobre slug desconhecido, maré e negócio;
- E2E comprova o guia visual, mapa sequenciado, imagens e rotas do primeiro dia;
- E2E comprova guia natural, fontes e rota;
- E2E comprova confirmação atual e ausência de rota sem hospedagem geocodificada;
- format, docs, lint, typecheck, testes, build e Playwright.

## 10. Riscos e mitigação

- **sugestão parecer roteiro confirmado:** copy usa `roteiro-base` e não grava Itinerary;
- **rota externa parecer cálculo interno:** tempo atual só é prometido no Google Maps;
- **conteúdo ficar desatualizado:** data de revisão e confirmação no dia permanecem visíveis;
- **duração parecer precisa:** copy usa `sugerido` e disclosure editorial;
- **fonte geral parecer status atual:** fonte institucional fica separada da consulta operacional;
- **perfil ausente:** fallback preserva resumo e ações externas.

## 11. Rollback

Reverter o commit remove somente o catálogo editorial e sua seção visual. Não há
migration, Provider, secret, dependência ou dado para desfazer.
