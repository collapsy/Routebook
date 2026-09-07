---
id: RB-CTX-182
title: Context Pack do RB-INC-182 — categorias contextuais na Discovery
description: Delimita a derivação de facets de Categoria a partir da cobertura real da Trip, preservando taxonomia canônica e ausência de hardcode regional.
document_type: implementation-context-pack
owner: Place Catalog
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-07"
authors: [RouteBook Team]
tags: [implementation, context-pack, place, discovery, filters, routebook-anywhere]
related_documents: [RB-INC-182, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-OBS-001, RB-INC-175, RB-INC-179, RB-INC-181]
prerequisites: [RB-INC-181]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-182 — categorias contextuais na Discovery

## 1. Missão

Fazer Categoria funcionar como facet da cobertura real da Trip, em vez de expor a taxonomia canônica completa em qualquer Destination.

## 2. Unidade de trabalho

- issue: #432;
- branch: `codex/rb-inc-182-contextual-place-categories`;
- base empilhada inicial: `16c1e74f04a3bac64439181c0488aa8570e5b52a` do RB-INC-181;
- base final esperada: `main` após integração da cadeia anterior;
- merge: gate humano;
- Production: fora de escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible;
3. `docs/README.md`;
4. RB-DOM-001 / RB-DOM-002;
5. RB-ARC-001;
6. RB-OBS-001;
7. RB-INC-175 / Context Pack correspondente;
8. RB-INC-179 / Context Pack correspondente;
9. RB-INC-181 / RB-CTX-181;
10. RB-INC-182 / este Context Pack.

## 4. Invariantes

- `PLACE_CATEGORIES` continua taxonomia canônica, não catálogo contextual;
- Place publicado e candidato externo preservam suas categorias canônicas existentes;
- UI não infere categoria pelo nome do Destination;
- ausência de categoria permanece ausência;
- candidato externo rejeitado ou sem categoria segura não cria facet;
- seleção de filtro não deve destruir a lista de facets disponíveis;
- falha externa degrada para cobertura publicada;
- lista e mapa continuam consumindo o mesmo conjunto filtrado;
- nenhuma leitura cria Place, Saved Place, Activity ou Decision;
- Production e merge permanecem gates humanos.

## 5. Alterações permitidas

Somente os caminhos listados no RB-INC-182.

## 6. Contrato da facet

### Fonte de cobertura

- Places publicados dentro da região da Discovery;
- candidatos externos reconciliados que podem participar do feed;
- mesma referência espacial já governada pelo RB-INC-175.

### Derivação

- extrair `PlaceCategory` de cada identidade apresentável;
- eliminar duplicatas;
- ordenar segundo `PLACE_CATEGORIES`;
- não transformar `providerCategory` desconhecida em categoria canônica nova.

### Aplicação do filtro

- primeiro obter/conciliar cobertura regional;
- derivar facets do conjunto não filtrado por Categoria;
- depois aplicar a categoria selecionada ao read model apresentado;
- busca/preço/distância continuam com seus contratos existentes.

## 7. UX obrigatória

- dropdown contém `Todas` + facets disponíveis;
- nenhum item sem resultado conhecido é oferecido;
- Pipa conserva categorias realmente cobertas;
- destino sem praia não exibe `Praias`;
- selecionar uma opção e aplicar filtros preserva as outras facets reais;
- estado vazio continua recuperável via remoção/limpeza de filtros.

## 8. Testes mínimos

- helper retorna somente categorias presentes;
- helper deduplica e respeita ordem canônica;
- entrada sem `beach` não retorna `beach`;
- categoria publicada funciona sem Provider externo;
- candidato externo seguro adiciona facet;
- Provider falho não fabrica facets;
- E2E Pipa mantém `Praias`;
- E2E destino sem praia não oferece `Praias`;
- após selecionar uma categoria, outras facets reais continuam no select.

## 9. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

CI e Vercel Preview do mesmo SHA são as evidências canônicas.

## 10. Gates humanos remanescentes

- integrar a cadeia RB-INC-180/181 antes da base final;
- qualquer mudança em Production;
- qualquer Provider/comercialização não previsto;
- integrar RB-INC-182 na `main`.

## 11. Handoff

Relatar SHA final, facets observadas em Pipa e destino sem praia, arquivos alterados, testes reais, Preview, degradação sem Provider, riscos e gates humanos restantes.
