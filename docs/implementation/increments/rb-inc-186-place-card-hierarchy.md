---
id: RB-INC-186
title: Cards de Lugar com hierarquia visual progressiva
description: Simplifica os cards de Lugar da Discovery para priorizar nome, distância e próxima ação, movendo ranking, Provenance e ações secundárias para divulgação progressiva.
document_type: implementation-increment
owner: Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-08"
authors: [RouteBook Team]
tags: [implementation, places, discovery, ux, cards, progressive-disclosure, mobile]
related_documents: [RB-CORE-0004, RB-UX-006, RB-DS-002, RB-DS-003, RB-INC-185, RB-CTX-186]
prerequisites: [RB-INC-185]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-186 — Cards de Lugar com hierarquia visual progressiva

## 1. Resultado vertical

A tela Explorar Lugares deixa de apresentar cards densos, com múltiplos CTAs equivalentes e metadados concorrentes.

O card passa a responder rapidamente às perguntas essenciais do viajante:

1. qual é o Lugar;
2. por que ele merece atenção;
3. quão longe está;
4. qual é o próximo passo.

Informações secundárias permanecem acessíveis por divulgação progressiva, sem perda de Provenance ou precisão.

## 2. Issue, branch e base

- Issue: `#442`.
- Branch: `codex/rb-inc-186-place-card-hierarchy`.
- Base empilhada: `af12a9de42604487cc0a140acd45af776580fafb` do RB-INC-185 / PR `#441`.
- Cadeia atual: `#431 -> #434 -> #436 -> #439 -> #441 -> RB-INC-186`.
- `main` permanece sem push direto.
- Production e merge continuam gates humanos.

## 3. Diagnóstico

A implementação atual cumpre muitos requisitos simultaneamente dentro de cada card:

- posição no ranking;
- Top por categoria;
- Score RouteBook;
- rating;
- popularidade;
- Fonte e timestamp;
- razões do score;
- imagem;
- categoria;
- nome;
- resumo/endereço;
- preço;
- distância;
- Provenance;
- Salvar;
- Adicionar ao roteiro;
- Ver detalhes;
- Ver mapa e fotos;
- Calcular rota real.

Apesar de corretos isoladamente, esses elementos competem pelo mesmo nível de atenção. O resultado contraria RB-CMP-052, que define Nome e Distância como prioritários e determina que o Place Card não sobrecarregue ações.

## 4. Hierarquia autorizada

### Nível 1 — decisão rápida

Visível sem interação adicional:

- imagem;
- categoria;
- nome;
- resumo curto quando existir;
- distância;
- rating/Score somente quando realmente disponível;
- faixa de preço somente quando disponível;
- uma ação principal;
- uma ação rápida secundária quando aplicável.

### Nível 2 — contexto adicional

Disponível por divulgação progressiva:

- posição detalhada no ranking e ordenação ativa;
- razões do Score;
- popularidade relativa;
- Provider de qualidade e data de coleta;
- endereço completo quando não for informação principal;
- Fonte/Provenance;
- rota real e outras ações auxiliares.

### Nível 3 — decisão completa

A tela de Detalhes permanece o local preferencial para:

- adicionar ao Roteiro;
- explorar descrição extensa;
- consultar informação adicional;
- tomar decisões mais comprometidas.

## 5. Ações

Na Discovery:

- Lugar já materializado: ação principal `Ver detalhes`;
- Lugar vindo diretamente de Provider: ação principal de exploração (`Ver mapa e fotos`) enquanto não existe detalhe canônico consultável sem materialização;
- `Salvar` permanece ação secundária clara;
- `Adicionar ao roteiro` deixa de competir no card e continua disponível em Detalhes;
- `Calcular rota real`, Provenance e ações auxiliares ficam em `Mais informações`/divulgação progressiva.

A diferença técnica não deve ser explicada como `externo` vs. `publicado`.

## 6. Layout

- cards não devem ficar estreitos a ponto de transformar metadados em parede de texto;
- desktop usa largura mínima confortável para leitura;
- mobile usa uma coluna;
- imagem mantém proporção consistente;
- título e fatos principais usam ordem visual previsível;
- metadados secundários não devem ter peso semelhante ao título.

## 7. Acessibilidade

- `details/summary` deve permanecer operável por teclado;
- ações mantêm rótulos textuais;
- não depender apenas de cor;
- estados Salvo/Planejado continuam textuais quando exibidos;
- alvo de toque das ações continua adequado;
- conteúdo escondido por divulgação progressiva não pode conter a única forma de executar a ação principal.

## 8. Fora de escopo

- alterar Domain ou invariantes de Lugar;
- trocar Provider;
- alterar algoritmo de ranking;
- migrations ou persistência;
- redesenhar Detalhes, Salvos ou Roteiro;
- criar novo fluxo de materialização;
- Production;
- merge em `main` sem autorização humana.

## 9. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/place-discovery.module.css
apps/web/components/place-ranking-meta.tsx
apps/web/components/place-ranking-meta.module.css
apps/web/components/place-ranking-meta.test.tsx
apps/web/components/external-place-image-preview.tsx
apps/web/components/external-place-image-preview.test.tsx
apps/web/e2e/place-discovery-anywhere.spec.ts
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/place-actions.spec.ts
apps/web/e2e/accommodation-proximity.spec.ts
apps/web/e2e/authenticated-trips.spec.ts
apps/web/e2e/external-place-images.spec.ts
apps/web/e2e/recommendations-experience.spec.ts
apps/web/e2e/route-destination-reliability.spec.ts
apps/web/e2e/trip-day-guide.spec.ts
apps/web/e2e/multi-destination-validation.spec.ts
docs/implementation/increments/rb-inc-186-place-card-hierarchy.md
docs/implementation/context-packs/rb-inc-186-place-card-hierarchy.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Arquivos adicionais exigem atualização deste incremento antes da alteração.

`apps/web/e2e/recommendations-experience.spec.ts` foi incluído em 2026-09-08 após a suíte responsiva completa revelar uma asserção textual legada da taxonomia anterior ao RB-INC-185 (`Recomendações canônicas`/`Descobertas externas`). A correção é limitada à regressão de linguagem já autorizada pela experiência unificada de Lugar; não altera Recommendations, ranking, domínio ou persistência.

`apps/web/e2e/route-destination-reliability.spec.ts` foi incluído em 2026-09-08 após a suíte responsiva revelar seletores anteriores à nova anatomia do card e uma leitura direta de `Calcular rota real`, agora corretamente protegido por `Mais informações`. A correção é limitada ao contrato E2E da hierarquia progressiva; não altera destino, roteamento, Google Maps ou dados persistidos.

`apps/web/e2e/trip-day-guide.spec.ts` foi incluído em 2026-09-08 após a suíte responsiva revelar a legenda legada `Lugar publicado`. O componente de mapa unificado já apresenta `Lugar` para pontos materializados e provider-first, em linha com o RB-INC-185. A correção é limitada à asserção textual do E2E; não altera Guia, mapa, dados, roteamento ou persistência.

`apps/web/e2e/multi-destination-validation.spec.ts` foi incluído em 2026-09-08 após a suíte responsiva revelar o rótulo legado `Salvar na viagem` em um card provider-first. A nova anatomia mantém a ação secundária visível com o rótulo canônico `Salvar lugar`; a correção é limitada ao contrato E2E e não altera Discovery, materialização, Salvos, Roteiro, mapa, Guia ou persistência.

## 10. Critérios de aceite

- [ ] Nome e Distância são os fatos mais fáceis de localizar visualmente no card.
- [ ] Card não apresenta mais 4–5 CTAs com peso equivalente.
- [ ] `Adicionar ao roteiro` não compete com exploração inicial e permanece disponível em Detalhes.
- [ ] Ranking sem sinais reais não fabrica Score, rating ou Top.
- [ ] Evidência detalhada de ranking fica disponível sem dominar o card.
- [ ] Provenance continua consultável, mas não compete visualmente com a decisão.
- [ ] Cards provider-first e materializados compartilham a mesma anatomia visual.
- [ ] Desktop evita cards excessivamente estreitos; mobile usa leitura em uma coluna.
- [ ] Testes de componente e E2E cobrem hierarquia e ações críticas.
- [ ] Documentation e Engineering Validation passam no mesmo SHA final.
- [ ] Vercel Preview valida visualmente a hierarquia dos cards em desktop e mobile antes da integração.
- [ ] Production permanece intocada.

## 11. Testes

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```
