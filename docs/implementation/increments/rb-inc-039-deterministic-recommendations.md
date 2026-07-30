---
id: RB-INC-039
title: Geração Determinística e Explicável de Recommendations
description: Define a geração reproduzível de Recommendations de Lugares com interesses, distância geodésica e limitações explícitas.
document_type: implementation-increment
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-07-30"
last_updated: "2026-07-30"
authors:
  - RouteBook Team
tags:
  - implementation
  - decision-intelligence
  - deterministic-ranking
  - recommendation
related_documents:
  - RB-INC-038
  - RB-PRD-006
  - RB-PRD-007
  - RB-DOM-003
  - RB-ARC-002
  - RB-DEL-001
prerequisites:
  - RB-INC-038
next_documents:
  - RB-INC-040
ai_context:
  priority: critical
  index: true
---

# RB-INC-039 — Geração Determinística e Explicável de Recommendations

## Estado

`Draft`

Issue: [#84](https://github.com/collapsy/Routebook/issues/84)

Branch: `feature/rb-inc-039-deterministic-recommendations`

## Resultado vertical

Gerar Recommendations ordenadas de Places publicados do Destination da Trip usando somente Contexto conhecido, com Reasons e Limitations verificáveis, sem persistência ou efeito canônico.

## Decisões

1. Mapeamento permitido: `beaches → beach`, `gastronomy → gastronomy`, `nature → nature`, `nightlife → nightlife`.
2. `culture`, `rest`, `adventure` e `shopping` não recebem equivalência inventada.
3. A distância usa exclusivamente `calculateGeodesicDistance` de `@routebook/geo-distance`.
4. Distância é geodésica em linha reta; não representa rota, duração, trânsito ou transporte.
5. Places salvos ou planejados continuam candidatos, sem exclusão e sem penalidade; seus estados são apenas metadados contextuais.
6. Pesos são constantes nomeadas e o desempate final usa `Place.slug`.
7. Score permanece interno; Confidence deriva da completude do Contexto e critérios aplicados.
8. IDs e instantes entram por portas controláveis para que a geração seja reproduzível em testes.

## Política inicial de score

| Critério | Peso |
| --- | ---: |
| categoria corresponde a interesse informado | 100 |
| distância até 2 km | 30 |
| distância maior que 2 km e até 5 km | 20 |
| distância maior que 5 km e até 10 km | 10 |
| distância acima de 10 km | 0 |

A ausência de coordenadas não reduz o score: o critério simplesmente não participa e produz Limitation explícita.

## Confidence

- `high`: interesses utilizáveis e distância avaliável;
- `medium`: apenas um dos dois critérios contextuais pode ser aplicado;
- `low`: Contexto mínimo, com ordenação estável por atributos canônicos e limitações explícitas.

Confidence não depende do valor do score.

## Critérios de aceite

- [ ] somente Places publicados do Destination da Trip participam;
- [ ] geração é isolada por TripId;
- [ ] toda Recommendation possui Reason conhecido;
- [ ] limitações registram critérios relevantes indisponíveis;
- [ ] não existem afirmações sobre preço, avaliação, funcionamento, disponibilidade, rota, trânsito ou duração;
- [ ] pesos são constantes nomeadas e testadas;
- [ ] desempate usa slug;
- [ ] mesma entrada produz a mesma ordem;
- [ ] coordenada zero é válida;
- [ ] falha em distância opcional não bloqueia a geração;
- [ ] salvos e planejados não alteram silenciosamente o score;
- [ ] Contexto mínimo e completo são testados.

## Caminhos permitidos

```text
modules/decision-intelligence/**
pnpm-lock.yaml
docs/implementation/increments/rb-inc-039-deterministic-recommendations.md
docs/implementation/context-packs/rb-inc-039-deterministic-recommendations.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Testes

Correspondência das quatro categorias, interesse sem categoria, distância disponível/indisponível, coordenada zero, empate, estabilidade, Contexto mínimo/completo, Place não publicado, outro Destination, salvos/planejados, ausência de afirmação não suportada e repetição da entrada.

## Riscos

- tratar geodésica como rota;
- confundir score com avaliação ou confiança;
- inventar equivalências ou dados;
- deixar UUID ou relógio quebrar a reprodução;
- excluir salvos/planejados sem decisão explícita.

## Fora de escopo

Persistência, interface, IA, LLM, preço, avaliação pública, funcionamento, disponibilidade, duração, trânsito, acessibilidade detalhada, idade, alteração de Saved Place ou Itinerary.