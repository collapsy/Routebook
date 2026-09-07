---
id: RB-INC-182
title: Categorias contextuais na Discovery por viagem
description: Faz o filtro de Categoria expor somente categorias com cobertura real na Discovery da Trip, sem hardcode regional.
document_type: implementation-increment
owner: Place Catalog
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-07"
authors: [RouteBook Team]
tags: [implementation, place, discovery, filters, categories, routebook-anywhere]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-OBS-001, RB-INC-175, RB-INC-179, RB-INC-181, RB-CTX-182]
prerequisites: [RB-INC-181]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-182 — Categorias contextuais na Discovery por viagem

## 1. Contexto

- Issue canônica: #432.
- Branch: `codex/rb-inc-182-contextual-place-categories`.
- Base empilhada inicial: RB-INC-181 em `16c1e74f04a3bac64439181c0488aa8570e5b52a`.
- A validação humana do RouteBook Anywhere em Gramado em 2026-09-07 mostrou que o filtro de Categoria continua expondo `Praias` mesmo quando a região não possui cobertura `beach`.
- A causa atual é a renderização direta de `PLACE_CATEGORIES` no dropdown, isto é, a taxonomia canônica global está sendo usada como se fosse disponibilidade contextual da Trip.

## 2. Resultado vertical

A pessoa abre Lugares de uma Trip e vê no filtro apenas categorias representadas pelos Places/candidatos efetivamente disponíveis na Discovery daquela região. A taxonomia canônica continua estável no domínio; a UI passa a funcionar como uma facet contextual.

Exemplos de comportamento esperado:

- Gramado sem cobertura `beach` não oferece `Praias`;
- Pipa com cobertura `beach` continua oferecendo `Praias`;
- um novo Destination não precisa de configuração regional para determinar opções do filtro.

## 3. Decisões de desenho

### 3.1 Taxonomia não é disponibilidade

`PLACE_CATEGORIES` continua sendo a lista canônica de categorias reconhecidas pelo domínio. Ela pode ser usada para validação e ordenação determinística das facets, mas não como lista automática de opções visíveis.

### 3.2 Facets derivadas da mesma cobertura da Discovery

As categorias disponíveis são derivadas do read model da região:

1. Places publicados dentro da região governada;
2. candidatos externos reconciliados e seguros para apresentação;
3. somente categorias canônicas realmente representadas nesse conjunto.

Nenhuma regra consulta o nome do Destination para decidir se uma categoria existe.

### 3.3 Selecionar uma categoria não destrói as demais facets

A consulta externa da região não deve ser restringida antecipadamente à categoria selecionada apenas para montar a lista. A seleção é aplicada ao read model depois da cobertura contextual ser conhecida. Assim, ao escolher Gastronomia, Natureza e outras categorias reais continuam disponíveis no dropdown.

Essa estratégia preserva uma única chamada governada de Discovery por renderização e evita uma segunda consulta somente para descobrir facets.

### 3.4 Degradação segura

Se a fonte externa estiver desabilitada ou falhar, as opções são derivadas somente dos Places publicados disponíveis. Ausência de uma categoria continua ausência; o RouteBook não inventa disponibilidade.

## 4. UX

- `Todas` continua como opção neutra;
- abaixo dela aparecem somente categorias disponíveis na Trip;
- labels continuam vindo de `categoryLabels`;
- ordem das opções segue `PLACE_CATEGORIES` para permanecer determinística;
- filtros existentes de busca, distância, preço e ordenação continuam interoperáveis;
- URL manipulada manualmente com categoria sem cobertura pode produzir estado vazio, mas essa categoria não é oferecida como opção contextual.

## 5. Escopo

```text
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/filters.ts
apps/web/app/viagens/[tripId]/lugares/filters.test.ts
apps/web/e2e/place-discovery-filters.spec.ts
docs/implementation/increments/rb-inc-182-contextual-place-categories.md
docs/implementation/context-packs/rb-inc-182-contextual-place-categories.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Mudança fora desses caminhos exige atualização deste incremento antes do commit.

## 6. Fora de escopo

- criar/remover categorias canônicas;
- alterar mapeamento taxonômico dos Providers;
- inferir categoria pelo nome da cidade/região;
- introduzir Provider, secret ou billing;
- migration/schema;
- alterar ranking ou algoritmo de qualidade;
- ativação ou alteração de Production;
- merge na `main` sem autorização humana.

## 7. Critérios de aceite

- [ ] dropdown não renderiza a taxonomia global completa por padrão;
- [ ] opções refletem cobertura real da Trip;
- [ ] categoria publicada entra na facet mesmo sem fonte externa;
- [ ] categoria de candidato externo seguro entra na facet;
- [ ] categoria ausente não aparece;
- [ ] selecionar uma categoria não remove indevidamente as demais facets disponíveis;
- [ ] Gramado sem `beach` não oferece `Praias`;
- [ ] Pipa com `beach` continua oferecendo `Praias`;
- [ ] falha/disable do Provider degrada para facets do catálogo publicado;
- [ ] busca, distância, preço, ranking, lista e mapa mantêm contratos atuais;
- [ ] nenhuma regra depende de string de Destination;
- [ ] testes unitários cobrem derivação, ordenação, deduplicação e ausência;
- [ ] E2E cobre destino sem praia e regressão Pipa;
- [ ] Documentation e Engineering Validation verdes no mesmo SHA;
- [ ] Vercel Preview READY no mesmo SHA;
- [ ] Production permanece intocada;
- [ ] merge permanece gate humano explícito.

## 8. Riscos

| Risco | Mitigação |
| --- | --- |
| dropdown encolher para a categoria ativa | derivar facets antes de aplicar `categoria` ao read model |
| aumentar chamadas externas | reutilizar a mesma consulta regional; nenhuma chamada extra para facets |
| categoria de candidato inseguro aparecer | derivar do feed reconciliado, não de payload bruto |
| perder categoria quando Provider falha | incluir cobertura publicada como fallback |
| recriar viés regional | proibir regras por nome/ID específico de Destination |

## 9. Rollback

Não há migration. Rollback restaura a renderização global de `PLACE_CATEGORIES`; nenhum dado persistido é alterado por este incremento.
