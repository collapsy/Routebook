---
id: RB-INC-156
title: Descoberta Unificada de Lugares
description: Integra Places publicados e candidatos Overture na mesma grade e no mesmo mapa, preservando origem, estado canônico e degradação segura.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, pipa, discovery, overture, map, ux]
related_documents: [RB-CORE-0004, RB-INC-139, RB-INC-153, RB-INC-154, RB-INC-155, RB-CTX-156]
prerequisites: [RB-INC-139, RB-INC-153, RB-INC-154, RB-INC-155]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-156 — Descoberta Unificada de Lugares

## 1. Contexto

Issue: `#361`.

Branch: `codex/rb-inc-156-unified-place-discovery`.

Baseline empilhada: `09e0f73f296aa04e64a4069b41435ee9d336caa5`, preview do RB-INC-155.

Após o RB-INC-154, o topo passou a somar Places publicados e candidatos externos, mas a
navegação real continuou parecendo limitada a 30 Places. A contagem estava correta quando
existiam candidatos, porém a estrutura visual mantinha os 30 canônicos em uma primeira grade,
os candidatos Overture em uma seção posterior e o mapa restrito ao conjunto publicado.

O problema não é apenas numérico: o layout exige percorrer todo o catálogo para encontrar a
descoberta externa e os testes aceitam `30 + 0`, sem provar cobertura externa útil.

Na validação real do preview em 17/08, os logs mostraram navegação pela Viagem, Recommendations
e detalhes de Places, mas nenhum acesso à rota unificada `/lugares`. A visão principal mantinha
o mapa de 30 publicados e deixava a entrada de descoberta no final da página. Além disso, limitar
a consulta Overture aos 40 primeiros resultados antes da reconciliação podia consumir a janela
com Places já vinculados ou possíveis duplicatas e deixar zero candidatos novos para exibição.

## 2. Objetivo

Apresentar uma experiência única de descoberta sem apagar diferenças semânticas:

- combinar os itens publicados e externos efetivamente visíveis na mesma grade;
- ordenar as duas fontes pela mesma referência espacial;
- identificar origem e estado em cada card;
- representar no mapa exatamente o conjunto da grade, com tipos de marcador distintos;
- preservar ações, Provenance, filtros e fallback do catálogo publicado.
- tornar a descoberta ampliada acessível no topo da Viagem;
- varrer uma janela governada maior antes da reconciliação e limitar a exibição a 60 externos;
- registrar contagens estruturadas da consulta e da reconciliação no runtime.

## 3. Decisões de experiência

### 3.1 Grade única, estados distintos

A tela usa uma única lista `Opções de lugares`. Cada item declara um dos estados:

- `Publicado no RouteBook`: Place canônico, com detalhe interno, conteúdo curado e imagem
  quando disponível;
- `Descoberta externa`: candidato Overture ainda não publicado, com Provenance e verificação
  externa recomendada.

A união é somente de apresentação. Candidato externo não recebe `PlaceId`, detalhe interno,
salvamento ou inclusão no Roteiro por efeito da leitura.

### 3.2 Ordenação e distância

Com Hospedagem geocodificada, todos os itens são ordenados por distância geodésica crescente
a partir dela. Sem Hospedagem, o centro de Pipa é a referência explícita de exploração. Empates
usam origem e identidade estável para manter resultado determinístico.

A distância continua rotulada como `em linha reta`. Rotas, duração e trânsito são consultados
externamente no Google Maps no momento da ação.

### 3.3 Lista e mapa

O mapa recebe o mesmo conjunto efetivamente exibido na lista, além da Hospedagem quando
disponível. Marcadores de candidatos usam o tipo `Descoberta externa` e não oferecem detalhe
interno. O mapa não promove, persiste ou transforma o candidato em Place canônico.

A legenda informa a contagem de cada tipo e o resumo declara o total de pontos representados.
Mapas com mais de 25 pontos entram em modo denso: os rótulos deixam de ficar permanentemente
abertos e continuam disponíveis em hover/foco, reduzindo sobreposição sem esconder marcadores.
O mapa da visão geral declara explicitamente que representa apenas os Places publicados; o mapa
da descoberta informa no título e na descrição a composição publicada + externa.

### 3.4 Falha e ocultação

Quando a fonte Overture estiver oculta ou indisponível, a grade e o mapa degradam para os
Places publicados. A falha externa não bloqueia filtros, detalhes ou ações do catálogo.

### 3.5 Encontrabilidade e janela externa

A visão principal oferece `Explorar catálogo ampliado` no topo e repete a ação na seção de
descoberta. O mapa dessa visão continua canônico; a ação leva à grade que identifica as duas fontes.

A consulta lê no máximo 200 candidatos dentro dos mesmos limites de raio e tiles, reconcilia todos
e exibe no máximo 60 candidatos novos. A promoção server-side usa a mesma janela de 200 para poder
reencontrar qualquer candidato exibido. Essa mudança aumenta diversidade sem alterar o custo de
tiles, publicar automaticamente ou transformar candidato em Place.

## 4. Escopo

- modelo determinístico da grade unificada;
- composição da lista, badges de origem e microcopy;
- CTA proeminente na visão principal da Viagem;
- janela de consulta e exibição governadas após reconciliação;
- logs estruturados de cobertura externa;
- candidatos externos no mapa com tipo e legenda próprios;
- contagens por fonte, total de pontos e modo visual denso no mapa;
- contratos unitários e E2E;
- documentação e Registry.

## 5. Fora de escopo

- publicar, salvar ou adicionar candidato externo ao Roteiro automaticamente;
- alterar reconciliação, raio, confiança ou taxonomia Overture;
- persistir resultados de leitura;
- criar migration, secret, SDK, Provider ou API paga;
- afirmar que todo candidato possui foto, horário, preço ou disponibilidade confirmados;
- merge do RB-INC-155, merge deste incremento ou promoção para Production.

## 6. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/actions.ts
apps/web/app/viagens/[tripId]/lugares/actions.test.ts
apps/web/app/viagens/[tripId]/lugares/place-discovery.module.css
apps/web/components/trip-map.tsx
apps/web/components/trip-map.module.css
apps/web/components/trip-map.test.tsx
apps/web/lib/trip-map.ts
apps/web/lib/trip-map.test.ts
apps/web/lib/place-discovery-feed.ts
apps/web/lib/place-discovery-feed.test.ts
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/accommodation-proximity.spec.ts
docs/implementation/increments/rb-inc-156-unified-place-discovery.md
docs/implementation/context-packs/rb-inc-156-unified-place-discovery.md
docs/registry.md
```

## 7. Critérios de aceite

- [ ] heading informa total e composição entre publicado e externo;
- [ ] uma única lista contém todos os itens efetivamente visíveis;
- [ ] origem e estado canônico são inequívocos em cada card;
- [ ] ordenação por distância combina as fontes de forma determinística;
- [ ] mapa contém o mesmo conjunto da lista, com marker e legenda distintos;
- [ ] legenda e resumo do mapa tornam as contagens publicada e externa verificáveis;
- [ ] mapas densos reduzem sobreposição de rótulos sem remover pontos;
- [ ] busca e categoria filtram as duas fontes;
- [ ] preço continua aplicável somente ao catálogo, com disclosure;
- [ ] Overture oculto ou indisponível degrada para Places publicados;
- [ ] visão da Viagem oferece acesso proeminente ao catálogo ampliado;
- [ ] reconciliação ocorre antes do limite de 60 externos visíveis;
- [ ] promoção revalida usando a mesma janela de consulta da leitura;
- [ ] runtime registra contagens da fonte, reconciliação e exibição;
- [ ] nenhum candidato é publicado, salvo ou inserido no Roteiro por leitura;
- [ ] documentação e CI passam no mesmo SHA.

## 8. Testes obrigatórios

- unitário da união, ordenação, desempate e fallback sem externos;
- unitário do novo tipo de ponto do mapa;
- componente comprova legenda e rótulo acessível de descoberta externa;
- E2E comprova uma lista unificada e a composição variável das fontes;
- E2E parte da visão da Viagem e comprova a entrada proeminente;
- E2E comprova sincronização entre lista e mapa;
- E2E preserva filtros, ações externas, promoção explícita e modo somente publicado;
- format, docs, lint, typecheck, testes, build e Playwright.

## 9. Riscos e mitigação

- **confusão canônica:** badge, copy, legenda e ausência de detalhe interno diferenciam o
  candidato;
- **volume sem utilidade:** ordenação espacial e filtros continuam priorizando contexto;
- **cobertura externa variável:** contagem não fixa o total Overture e o fallback é explícito;
- **primeiros resultados já reconciliados:** janela de 200 é reconciliada antes de limitar os 60
  novos exibidos;
- **mapa poluído:** somente itens visíveis recebem marcador e a fonte pode ser ocultada;
- **latência/indisponibilidade:** o catálogo publicado permanece utilizável.

## 10. Rollback

Reverter o commit restaura as grades separadas e o mapa canônico. Não há migration, escrita de
dados externos ou estado de Provider para desfazer.
