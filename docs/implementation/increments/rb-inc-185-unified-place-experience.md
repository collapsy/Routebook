---
id: RB-INC-185
title: Experiência unificada de Lugar provider-first
description: Remove da experiência a distinção entre Place publicado e candidato externo, mantendo uma única linguagem de Lugar e proveniência como metadado técnico.
document_type: implementation-increment
owner: Place Discovery and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-07"
authors: [RouteBook Team]
tags: [implementation, places, discovery, routebook-anywhere, provider-first, ux]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-ARC-003, RB-INC-164, RB-INC-175, RB-INC-182, RB-INC-183, RB-INC-184, RB-CTX-185]
prerequisites: [RB-INC-184]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-185 — Experiência unificada de Lugar provider-first

## 1. Resultado vertical

O RouteBook deixa de apresentar ao viajante dois tipos concorrentes de Lugar (`Place publicado` e `Descoberta externa`).

Para o usuário existe apenas **Lugar**. A origem do dado permanece disponível como Fonte/Provenance quando útil, mas não define uma taxonomia de produto.

A cobertura de destinos passa a ser explicitamente provider-first: o produto não depende de uma operação editorial contínua de alimentação manual de Places para que mapa, Discovery e Sugestões sejam úteis em um destino novo.

## 2. Issue, branch e base

- Issue: `#440`.
- Branch: `codex/rb-inc-185-unified-place-experience`.
- Base empilhada: `dd996a4dcb99fc2068a63bc0c74b54ca1c282632` do RB-INC-184 / PR `#439`.
- Cadeia: `#431 -> #434 -> #436 -> #439 -> RB-INC-185`.
- `main` permanece sem push direto.
- Production e merge permanecem gates humanos.

## 3. Decisão de produto confirmada

A distinção editorial deixou de representar o produto desejado.

Regra de experiência:

```text
Lugar
  nome
  categoria
  localização
  dados conhecidos
  Fonte/Provenance
```

Não existe para o usuário:

```text
Lugar publicado vs. Lugar externo
Curado vs. Descoberto
Candidato externo
Somente leitura por ser externo
```

A proveniência responde **de onde veio o dado**, não **que tipo de Lugar é**.

## 4. Compatibilidade com o domínio canônico

A RouteBook Bible já define Lugar como "uma opção descoberta ou catalogada". Portanto, a experiência unificada não cria um novo conceito de domínio.

Este incremento não remove a necessidade interna de:

- identidade canônica;
- reconciliação;
- deduplicação;
- Provenance;
- materialização/cache quando uma ação persistente exigir um `PlaceId`.

`ExternalPlaceCandidate`, estados de reconciliação e lifecycle de persistência podem permanecer como detalhes internos de Ports/Adapters e aplicação. Eles não devem vazar para a linguagem da interface.

## 5. Modelo provider-first

A fonte primária de cobertura de destinos novos é Discovery por Provider.

Fluxo esperado:

```text
Provider
-> candidato com Provenance
-> reconciliação/deduplicação
-> Lugar apresentado
-> ação explícita do usuário
-> materialização/normalização interna quando necessária
```

O usuário não publica um Lugar para então poder usá-lo.

A materialização interna é uma necessidade técnica, não uma etapa da jornada.

## 6. Escopo de experiência

### Visão geral e mapa

- legenda usa `Hospedagem`, `Lugar`, `Lugar salvo` e `Atividade planejada` quando aplicável;
- não usa `Lugar publicado` nem `Descoberta externa`;
- descrição não conta Places canônicos e externos separadamente;
- falha do Provider é comunicada como indisponibilidade temporária de atualização/cobertura, sem sugerir dois catálogos.

### Explorar Lugares

- cards usam categoria + nome + dados + Fonte;
- remover badges `Curado pelo RouteBook`, `Curado + atualizado`, `Descoberta atual` e `Candidato externo`;
- remover CTA de `enviar para curadoria/publicar` da jornada do viajante;
- salvar um Lugar descoberto continua podendo materializar sua identidade internamente sem expor promoção;
- filtros/ranking operam sobre a coleção unificada.

### Sugestões

- seção usa linguagem `Lugares para considerar` ou equivalente;
- não usa `Descoberta externa`, `Places publicados`, `Recommendations canônicas` como diferenciação visível de origem;
- Fonte permanece disponível no detalhe do card;
- limitações falam somente sobre dados ausentes/estimados, não sobre lifecycle editorial.

## 7. Fora de escopo

- remover tabelas ou migrations existentes;
- renomear todos os tipos internos `External*` neste incremento;
- alterar Provider ou billing;
- mudar Production;
- eliminar Provenance;
- inventar dados ausentes;
- alterar silenciosamente `RecommendationTarget` ou outras invariantes persistidas;
- merge em `main` sem autorização humana.

A remoção futura da exigência técnica de `Place publicado` em contratos persistidos deve ser tratada como evolução explícita de domínio/aplicação, mas não deve voltar a aparecer na UX.

## 8. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/actions.ts
apps/web/app/viagens/[tripId]/recomendacoes/page.tsx
apps/web/components/trip-map.tsx
apps/web/components/trip-map.test.tsx
apps/web/lib/recommendation-discovery-suggestions.ts
apps/web/lib/recommendation-discovery-suggestions.test.ts
apps/web/e2e/place-discovery.spec.ts
apps/web/e2e/recommendations-anywhere.spec.ts
apps/web/e2e/trip-overview.spec.ts
docs/implementation/increments/rb-inc-185-unified-place-experience.md
docs/implementation/context-packs/rb-inc-185-unified-place-experience.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Arquivos adicionais exigem atualização deste incremento antes da alteração.

## 9. Critérios de aceite

- [ ] Nenhuma superfície principal de Places usa `Place publicado`, `Descoberta externa`, `Candidato externo` ou `Curado` como tipo visível de Lugar.
- [ ] Mapa diferencia Hospedagem de Lugar, sem diferenciar a origem como tipo de marcador.
- [ ] Explorar Lugares apresenta uma coleção coerente e única.
- [ ] CTA editorial de promoção/publicação não aparece para o viajante.
- [ ] Salvar Lugar de Provider continua funcional por materialização interna automática.
- [ ] Sugestões usam linguagem única de Lugar e preservam Fonte/Provenance.
- [ ] Limitações descrevem apenas fatos realmente ausentes ou estimados.
- [ ] Pipa e destinos zero-seed usam a mesma linguagem.
- [ ] Nenhum hardcode de Pipa, Gramado ou Florianópolis entra em produção.
- [ ] Documentation e Engineering Validation passam no mesmo SHA final.
- [ ] Preview Vercel confirma Gramado sem taxonomia publicado/externo.

## 10. Testes

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

E2E deve validar explicitamente ausência da taxonomia antiga nas jornadas de mapa, Discovery e Sugestões.
