---
id: RB-CTX-137
title: Context Pack do RB-INC-137 — Cobertura do Catálogo de Pipa
description: Fornece o contexto mínimo, as fontes de curadoria e os gates para expandir com segurança o catálogo real de Pipa antes da validação humana M8.
document_type: implementation-context-pack
owner: Place Catalog and Product
status: Draft
version: "0.1.0"
created: "2026-08-14"
last_updated: "2026-08-14"
authors: [RouteBook Team]
tags: [context-pack, place-catalog, pipa, m8, data-curation, migrations]
related_documents: [RB-INC-137, RB-CORE-0004, RB-PRD-002, RB-DATA-002, RB-QA-001, RB-CICD-001, RB-INC-133, RB-INC-135, RB-INC-136]
prerequisites: [RB-INC-133, RB-INC-135]
next_documents: [RB-INC-136]
ai_context:
  priority: critical
  index: true
---

# RB-CTX-137 — Cobertura do Catálogo de Pipa

## 1. Missão do executor

Expandir o catálogo publicado de Pipa de 13 para 30 Places curados sem alterar conceitos de domínio, sem substituir os 13 registros existentes e sem promover DML para Production antes dos gates definidos pelo RB-INC-133.

## 2. Incremento

- ID: `RB-INC-137`;
- Issue: `#321`;
- arquivo: `docs/implementation/increments/rb-inc-137-pipa-catalog-coverage.md`;
- branch: `codex/rb-inc-137-pipa-catalog-coverage`;
- baseline: `3a9d9643d52bda31e48fd933be3246ba2d354f7b`;
- catálogo inicial: 13 Places publicados;
- catálogo alvo: 30 Places publicados.

## 3. Leitura obrigatória

Antes de alterar o escopo, ler nesta ordem:

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/data/physical-data-model-and-migrations.md`;
5. `docs/quality/quality-and-testing-strategy.md`;
6. `docs/implementation/increments/rb-inc-133-production-migration-gate.md`;
7. `docs/implementation/increments/rb-inc-135-pipa-catalog-m8-readiness.md`;
8. `docs/implementation/increments/rb-inc-136-m8-real-validation.md`;
9. este Context Pack e o RB-INC-137.

## 4. Invariantes

- os 13 Places publicados do baseline permanecem existentes e inalterados;
- IDs e slugs novos são estáveis e únicos;
- categorias continuam restritas a `beach`, `gastronomy`, `nature` e `nightlife`;
- o alvo 30 / 7-12-4-7 é específico do piloto M8, não uma regra permanente do produto;
- dados voláteis como rating, quantidade de reviews, horário e preço monetário não são persistidos;
- coordenadas são referências aproximadas verificáveis do Place ou de seu acesso, não promessa de entrada física;
- ausência de faixa qualitativa estável permanece `price_range=null`;
- migration é aditiva e idempotente;
- nenhum write em Production ocorre antes do release gate aplicável.

## 5. Curadoria aprovada

Novos Places:

- praias: Praia das Minas, Praia de Cacimbinhas, Praia de Sibaúma e Praia de Tibau do Sul;
- gastronomia: Caxangá Restaurante, Macoco Cozinha Artesanal, Aprecíe Restaurante, El Farolito, Moka Cafés Especiais, Caju — Cafeteria, Casa de Mate e Lavanderia, Sorveteria Real de 14 e Pipa Beach Club;
- natureza: Lagoa de Guaraíras;
- vida noturna: Tribus In Pipa, Bakana, Birring in Paradise e UMI Bar.

A revisão de 2026-08-14 confirmou novamente Birring in Paradise como estabelecimento atual; ele permanece no pool original da Issue #321.

## 6. Fontes de curadoria

Fontes institucionais e locais utilizadas conforme o tipo de Place:

- Prefeitura de Tibau do Sul — Turismo e Lazer: `https://tibaudosul.rn.gov.br/o-municipio/turismo-e-lazer/`;
- Visit RN — Tibau do Sul: `https://visit-rn.com/tibau-do-sul/`;
- Pipa.com.br e Guia Pipa para referências locais;
- perfis oficiais dos estabelecimentos e cadastros atuais de mapas/diretórios para existência e endereço.

A curadoria é evidência de existência/categoria/localização; não importa avaliações ou ranking desses providers para o produto.

## 7. Contratos existentes reutilizados

- `places` e `DrizzlePlaceRepository`;
- `PlaceCategory` e `publicationStatus=published`;
- Place Discovery com pesquisa, categoria, preço e distância;
- mapa sincronizado com a lista;
- `generateDeterministicPlaceRecommendations` e política `place-ranking-v1`;
- migrations Drizzle e journal append-only;
- Production Release governado pelo RB-INC-133.

## 8. Caminhos permitidos

```text
packages/database/drizzle/0027_expand_pipa_catalog_coverage.sql
packages/database/drizzle/meta/_journal.json
packages/database/src/place-repository.test.ts
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/recommendations-experience.spec.ts
docs/implementation/increments/rb-inc-137-pipa-catalog-coverage.md
docs/implementation/context-packs/rb-inc-137-pipa-catalog-coverage.md
docs/registry.md
docs/implementation/traceability-matrix.md
```

## 9. Fora de escopo

- novo Provider de catálogo;
- scraping/ingestão em runtime;
- ratings, reviews, ranking externo e horários;
- preços monetários e cardápios;
- alteração do algoritmo de Recommendations;
- alteração estrutural de mapa/mobilidade;
- remoção dos 13 Places existentes;
- declaração de M8 validado sem uso humano real.

## 10. Estratégia de persistência

A migration `0027_expand_pipa_catalog_coverage` deve:

- adicionar UUIDs `10000000-0000-4000-8000-000000000014` a `...030`;
- adicionar os 17 slugs curados;
- usar somente `INSERT ... ON CONFLICT DO NOTHING`;
- não executar `UPDATE`, `DELETE` ou DDL;
- publicar os registros para `pipa-rn-br`;
- manter timestamps explícitos;
- preservar `price_range=null` nos novos dados quando não houver faixa qualitativa estável.

Consulta read-only em Production executada antes da implementação comprovou ausência de colisão entre esses UUIDs/slugs e o catálogo atual.

## 11. Estratégia de teste

O incremento deve comprovar:

- PostgreSQL efêmero com 30 Places publicados;
- distribuição `beach=7`, `gastronomy=12`, `nature=4`, `nightlife=7`;
- preservação dos 13 slugs anteriores;
- presença dos 17 slugs novos;
- unicidade de slug e coordenadas dentro de intervalos válidos;
- Place Discovery lista 30 e encontra `Praia das Minas` por pesquisa, mantendo lista/mapa sincronizados;
- Recommendation retorna 30 candidatos publicados no contexto E2E e inclui `Praia das Minas` com razão de compatibilidade de interesse e distância da hospedagem;
- regressão de pan/zoom do mapa continua executada.

## 12. Gate de Production

A aplicação em Production somente pode ocorrer depois de:

1. PR verde no HEAD definitivo;
2. merge governado em `main`;
3. validação do SHA candidato pelo Production Release;
4. classificação do risco da migration;
5. aprovação humana explícita para o DML quando exigida pelo gate;
6. execução da migration;
7. ledger sem pendências;
8. promoção de `codex/production-release`;
9. smoke de Production e auditoria read-only do catálogo.

A aprovação humana para prosseguir com esse DML foi registrada na sessão de implementação em 2026-08-14; o executor deve vinculá-la somente ao SHA final que passar pelos gates, sem aplicar um draft intermediário.

## 13. Critérios de aceite

- [x] baseline Production 13 / 3-4-3-3 confirmado por consulta read-only;
- [x] slugs e UUIDs 014–030 livres em Production;
- [x] curadoria atual dos 17 Places revisada;
- [x] migration 0027 criada de forma aditiva/idempotente;
- [x] journal append-only preparado com idx 27;
- [x] testes de persistência e E2E atualizados;
- [ ] Registry atualizado;
- [ ] rastreabilidade atualizada;
- [ ] Documentation Validation verde;
- [ ] Engineering Validation verde no mesmo SHA;
- [ ] PR integrada;
- [ ] release de Production concluído pelo gate;
- [ ] Production comprova 30 / 7-12-4-7 e health permanece verde.

## 14. Comandos/gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Engineering Validation é a fonte canônica para migrations em PostgreSQL efêmero e Playwright responsivo.

## 15. Quando interromper e escalar

Interromper apenas se:

- a migration deixar de ser estritamente aditiva;
- surgir colisão de identidade não resolvível pelos contratos existentes;
- uma fonte atual contradizer materialmente a existência/localização de um candidato;
- houver exposição de secret/dado pessoal;
- o Production Release não bloquear uma migration que sua política classifique como de aprovação obrigatória;
- smoke pós-release indicar regressão operacional.

Não interromper para correções de format, docs, lint, typecheck, testes, build ou E2E resolvíveis dentro dos contratos existentes.
