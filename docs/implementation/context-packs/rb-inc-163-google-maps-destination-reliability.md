---
id: RB-CTX-163
title: Context Pack do RB-INC-163 — Confiabilidade dos destinos no Google Maps
description: Delimita a correção de identificação de destinos nos links individuais de rota sem alterar catálogo, mapa interno ou Provider.
document_type: implementation-context-pack
owner: Traveler Experience and Spatial Context
status: Draft
version: "0.1.0"
created: "2026-08-20"
last_updated: "2026-08-20"
authors: [RouteBook Team]
tags: [implementation, context-pack, google-maps, routing, places, reliability]
related_documents: [RB-INC-163, RB-CORE-0004, RB-PRD-002, RB-ARC-003, RB-INC-139, RB-INC-153, RB-INC-156, RB-INC-160, RB-INC-161, RB-INC-136]
prerequisites: [RB-INC-139, RB-INC-153, RB-INC-156, RB-INC-160]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-163 — Confiabilidade dos destinos no Google Maps

## 1. Missão

Eliminar o caso em que uma rota individual aponta para um ponto vizinho por depender exclusivamente de coordenada aproximada. Preferir identidade `nome + endereço` já conhecida e manter coordenadas como fallback seguro.

## 2. Incremento

- issue: `#378`;
- branch: `codex/rb-inc-163-google-maps-destination-reliability`;
- baseline: `474ad3c8b23c10605f4223e32cc75fb7169bd947`;
- ambiente de aceite: Vercel Preview;
- merge e Production são gates separados.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/architecture/integration-architecture.md` quando aplicável;
5. `docs/implementation/increments/rb-inc-139-accommodation-proximity.md`;
6. `docs/implementation/increments/rb-inc-153-pipa-operational-guide.md`;
7. `docs/implementation/increments/rb-inc-156-unified-place-discovery.md`;
8. `docs/implementation/increments/rb-inc-160-pipa-trip-guide.md`;
9. `docs/implementation/increments/rb-inc-161-active-trip-mobile-experience.md`;
10. `docs/implementation/increments/rb-inc-163-google-maps-destination-reliability.md`.

## 4. Contratos preservados

- distância apresentada no RouteBook permanece geodésica quando assim qualificada;
- Google Maps continua sendo link externo para rota/tempo atual;
- origem da hospedagem usa a coordenada canônica já geocodificada;
- destino individual pode usar rótulo semântico sem persistir novo fato;
- coordenada do destino continua validada e serve como fallback;
- candidato externo continua não-canônico até promoção explícita;
- sequência multi-paradas do Guia não é alterada neste incremento;
- nenhuma leitura gera mutation;
- M8 não é concluído por esta correção técnica.

## 5. Regra operacional

Para uma rota individual:

```text
se name + addressLabel existir -> destination = "name, addressLabel"
senão -> destination = "latitude,longitude"
```

Não usar nome isolado quando houver endereço específico disponível. Não inventar endereço. Não corrigir coordenadas por inferência.

## 6. Caminhos permitidos

Somente os caminhos declarados em RB-INC-163. O helper transitório `.github/workflows/rb-inc-163-route-helper.yml` é permitido apenas para aplicar substituições determinísticas, formatar, reconciliar o Registry e remover a si próprio no mesmo ciclo.

## 7. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/route-destination-reliability.spec.ts
```

A suíte Playwright completa continua pertencendo ao Engineering Validation canônico. O spec focado acima valida as três superfícies de rota individual alteradas por este incremento.

Documentation Validation e Engineering Validation precisam passar no mesmo SHA. Preview Vercel deve estar READY no mesmo candidato.

## 8. Proibições

- não ativar Google Places API ou outro Provider pago;
- não criar secret;
- não executar geocoding em massa;
- não criar migration;
- não editar coordenadas do catálogo sem evidência de Provenance;
- não alterar Recommendation, Saved Place, Decision ou Itinerary por efeito colateral;
- não transformar resposta do Google Maps em verdade canônica;
- não manter helper temporário no diff final;
- não mergear nem promover Production sem gate humano separado.

## 9. Handoff

Relatar URLs corrigidas, superfícies afetadas, testes efetivamente executados, SHA final, CI, Preview, riscos residuais e qualquer caso que ainda dependa de Place ID ou correção factual do catálogo.