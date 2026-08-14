---
id: RB-INC-137
title: Expansão de Cobertura do Catálogo de Pipa para o Piloto M8
description: Amplia de forma curada e aditiva o catálogo real de Pipa para reduzir lacunas de escolha antes da validação humana do MVP no marco M8.
document_type: implementation-increment
owner: Place Catalog and Product
status: Draft
version: "0.1.0"
created: "2026-08-14"
last_updated: "2026-08-14"
authors: [RouteBook Team]
tags: [implementation, place-catalog, pipa, m8, data-curation, coverage, migrations]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-DATA-002, RB-QA-001, RB-CICD-001, RB-INC-133, RB-INC-135, RB-INC-136]
prerequisites: [RB-INC-133, RB-INC-135]
next_documents: [RB-INC-136]
ai_context:
  priority: critical
  index: true
---

# RB-INC-137 — Expansão de Cobertura do Catálogo de Pipa para o Piloto M8

## 1. Objetivo

Expandir o catálogo publicado de `pipa-rn-br` de 13 para 30 Places curados antes da Fase B do RB-INC-136, aumentando a variedade útil para decisões reais durante uma viagem de sete dias sem transformar o RouteBook em um diretório não governado.

Issue: #321.

Branch: `codex/rb-inc-137-pipa-catalog-coverage`.

Baseline de implementação: `3a9d9643d52bda31e48fd933be3246ba2d354f7b`.

## 2. Problema

Production possui 13 Places publicados:

| Categoria | Quantidade inicial |
| --- | ---: |
| `beach` | 3 |
| `gastronomy` | 4 |
| `nature` | 3 |
| `nightlife` | 3 |
| **total** | **13** |

A cobertura é suficiente para exercitar a jornada técnica, mas pequena para avaliar o RouteBook como guia pessoal durante sete dias. Se o usuário precisar abandonar o produto apenas porque faltam opções, a validação M8 passa a medir insuficiência de catálogo em vez de valor e usabilidade da experiência.

## 3. Princípios de curadoria

A expansão respeita `valor antes de volume` da RouteBook Bible:

- adicionar somente Places cuja existência e localização sejam verificáveis;
- manter as quatro categorias já existentes, sem criar conceito novo de domínio;
- priorizar variedade de decisão: praias distintas, refeições, café/brunch, sobremesa e noite;
- preferir fontes oficiais/institucionais para praias e natureza;
- preferir fonte do estabelecimento, diretório local atual e cadastro empresarial atual para negócios;
- não persistir rating, review count, horários, preço monetário ou ranking;
- usar coordenadas como referência aproximada do Place ou de seu ponto de acesso, não como garantia de entrada física;
- preservar `price_range=null` quando não houver classificação qualitativa suficientemente estável;
- preservar integralmente os 13 Places existentes.

## 4. Curadoria externa

Curadoria revisada em 2026-08-14.

### Praias e natureza

Fontes principais:

- Prefeitura de Tibau do Sul — Turismo e Lazer: `https://tibaudosul.rn.gov.br/o-municipio/turismo-e-lazer/`;
- Visit RN — Tibau do Sul: `https://visit-rn.com/tibau-do-sul/`;
- Guia Pipa/Tur e Pipa.com.br para referência geográfica local de praias e Lagoa de Guaraíras.

### Gastronomia e cafés

Fontes atuais usadas para existência/endereço, combinadas conforme disponibilidade:

- Caxangá: site oficial e índice local;
- Macoco Cozinha Artesanal: Pipa.com.br e índice local;
- Aprecíe Restaurante: Pipa.com.br e perfil atual do estabelecimento;
- El Farolito: Pipa.com.br e Vive Pipa;
- Moka Cafés Especiais: guia Pipa.tur.br e cadastro empresarial ativo;
- Caju: perfil atual do estabelecimento/índice gastronômico;
- Sorveteria Real de 14: site oficial e Pipa.com.br;
- Pipa Beach Club: Pipa.com.br e índice local da unidade de Pipa/RN.

### Vida noturna

- Tribus Bar: Pipa.com.br e índice atual;
- Bakana: cadastro empresarial ativo e índice atual;
- UMI Bar: Google Maps/índices atuais;
- Alma Pipa: perfil atual e evento de inauguração em 2026.

Um candidato inicialmente considerado para vida noturna foi descartado porque fontes atuais divergiam sobre seu funcionamento. A migration não versiona Place cuja existência atual permaneça ambígua.

## 5. Catálogo alvo

A migration 0027 adiciona 17 Places:

| Slug | Nome | Categoria |
| --- | --- | --- |
| `praia-das-minas` | Praia das Minas | `beach` |
| `praia-de-cacimbinhas` | Praia de Cacimbinhas | `beach` |
| `praia-de-sibauma` | Praia de Sibaúma | `beach` |
| `praia-de-tibau-do-sul` | Praia de Tibau do Sul | `beach` |
| `caxanga-restaurante` | Caxangá Restaurante | `gastronomy` |
| `macoco-cozinha-artesanal` | Macoco Cozinha Artesanal | `gastronomy` |
| `aprecie-restaurante` | Aprecíe Restaurante | `gastronomy` |
| `el-farolito` | El Farolito | `gastronomy` |
| `moka-cafes-especiais` | Moka Cafés Especiais | `gastronomy` |
| `caju-cafeteria` | Caju — Cafeteria, Casa de Mate e Lavanderia | `gastronomy` |
| `sorveteria-real-de-14` | Sorveteria Real de 14 | `gastronomy` |
| `pipa-beach-club` | Pipa Beach Club | `gastronomy` |
| `lagoa-de-guarairas` | Lagoa de Guaraíras | `nature` |
| `tribus-bar` | Tribus Bar | `nightlife` |
| `bakana` | Bakana | `nightlife` |
| `umi-bar` | UMI Bar | `nightlife` |
| `alma-pipa` | Alma Pipa | `nightlife` |

Resultado esperado:

| Categoria | Quantidade esperada |
| --- | ---: |
| `beach` | 7 |
| `gastronomy` | 12 |
| `nature` | 4 |
| `nightlife` | 7 |
| **total** | **30** |

Esse total é um piso específico do piloto M8, não uma regra permanente do produto.

## 6. Identidade e persistência

A auditoria read-only em Production confirmou, antes da criação da migration, que:

- UUIDs `10000000-0000-4000-8000-000000000014` a `10000000-0000-4000-8000-000000000030` estão livres;
- os 17 slugs da seção anterior estão livres.

A migration será `0027_expand_pipa_catalog_coverage` e seguirá:

- somente `INSERT`;
- `ON CONFLICT DO NOTHING`;
- nenhum `UPDATE`;
- nenhum `DELETE`;
- nenhum DDL;
- timestamps explícitos;
- IDs e slugs estáveis;
- `publication_status=published`;
- journal append-only.

## 7. Escopo

- criar migration 0027 e journal correspondente;
- ampliar teste PostgreSQL para total e distribuição 30 / 7-12-4-7;
- atualizar contratos E2E que representem deterministicamente o catálogo publicado;
- preservar a regressão de ancoragem do mapa entregue pela #322/#323;
- documentar Increment, Context Pack, Registry e rastreabilidade;
- executar Documentation Validation e Engineering Validation no mesmo SHA;
- integrar por squash quando verde;
- comprovar fail-closed do Production Release antes de qualquer DML;
- solicitar aprovação humana explícita para a 0027 vinculada ao SHA candidato.

## 8. Fora de escopo

- ratings e reviews;
- horários em tempo real;
- preços monetários/cardápios;
- reservas/compras;
- nova categoria de Place;
- novo Provider de Places;
- scraping ou ingestão remota em runtime;
- alterações em mapa, distância, rota ou autenticação;
- declarar M8 validado sem uso humano real.

## 9. Risco de Production

A migration é aditiva, mas contém DML. Pelo RB-INC-133, deve ser classificada como `high` e bloquear o release automático antes de `pnpm db:migrate`.

Fluxo obrigatório:

```text
PR verde
  -> squash merge em main
  -> Engineering Validation verde no SHA
  -> Production Release encontra 0027 pendente
  -> classificação high risk
  -> bloqueio antes de write
  -> aprovação humana explícita para o SHA candidato
  -> workflow_dispatch aprovado
  -> migration 0027
  -> ledger sem pendências
  -> promoção de codex/production-release
  -> Vercel Production
```

A aprovação de merge não equivale à aprovação da migration.

## 10. Critérios de aceite

- [x] baseline Production 13 / 3-4-3-3 auditado;
- [x] pool de curadoria revisada com fontes atuais;
- [x] candidato com situação ambígua removido;
- [x] 17 slugs e UUIDs novos comprovados livres em Production por consulta read-only;
- [ ] migration 0027 aditiva/idempotente criada;
- [ ] journal append-only recebe somente idx 27;
- [ ] PostgreSQL efêmero comprova 30 Places e distribuição 7/12/4/7;
- [ ] 30 slugs são únicos e coordenadas válidas;
- [ ] E2Es dependentes do catálogo são atualizados sem remover regressões existentes;
- [ ] Registry e rastreabilidade atualizados;
- [ ] Documentation e Engineering Validation verdes no mesmo SHA;
- [ ] PR integrada por squash;
- [ ] Engineering Validation pós-merge verde;
- [ ] Production Release bloqueia 0027 como high-risk antes de qualquer write;
- [ ] responsável aprova explicitamente a 0027 para o SHA exato;
- [ ] workflow manual aplica 0027 e deixa zero migrations pendentes;
- [ ] `codex/production-release` avança somente após ledger limpo;
- [ ] novo deployment Production fica READY;
- [ ] Production comprova 30 Places / 7-12-4-7;
- [ ] live/ready e runtime permanecem verdes.

## 11. Rollback

Antes da aprovação produtiva, rollback é não promover a 0027. Depois da aplicação, os registros permanecem como expansão compatível; remoção em massa não é executada automaticamente. Correções devem seguir roll-forward governado.
