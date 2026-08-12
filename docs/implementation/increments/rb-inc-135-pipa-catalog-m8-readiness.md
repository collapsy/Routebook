---
id: RB-INC-135
title: Catálogo Real de Pipa para Validação M8
description: Expande de forma curada e aditiva o catálogo de Places de Pipa para preparar o MVP para a validação em cenário real prevista no marco M8.
document_type: implementation-increment
owner: Place Catalog and Platform
status: Draft
version: "0.1.0"
created: "2026-08-12"
last_updated: "2026-08-12"
authors: [RouteBook Team]
tags: [implementation, place-catalog, pipa, mvp, m8, data-curation, migrations]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-DEL-001, RB-DATA-002, RB-QA-001, RB-CICD-001, RB-ADR-018, RB-INC-129, RB-INC-132, RB-INC-133, RB-INC-134]
prerequisites: [RB-INC-129, RB-INC-132, RB-INC-133, RB-INC-134]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-135 — Catálogo Real de Pipa para Validação M8

## 1. Objetivo

Preparar o catálogo de Places de Pipa para o marco **M8 — MVP validado em cenário real**,
expandindo o seed técnico mínimo para um conjunto curado de lugares reais que permita
explorar alternativas representativas de praias, gastronomia, natureza e vida noturna.

Issue: #316.

Branch: `codex/rb-inc-135-pipa-catalog-m8-readiness`.

Baseline: `013dccd77a50b9c296efd5b7f1f3199e7dd7d93d`.

## 2. Origem

O `RB-DEL-001` define a Fase 9 como validação do MVP em cenário real e estabelece a
viagem pessoal para Pipa como cenário inicial de uso. O `RB-INC-129` comprovou a jornada
crítica em Production com dados sintéticos, mas deliberadamente não declarou validação
qualitativa real.

A auditoria de Production em 2026-08-12 encontrou somente cinco Places publicados para
`pipa-rn-br`:

| Categoria | Quantidade inicial |
| --- | ---: |
| `beach` | 1 |
| `gastronomy` | 1 |
| `nature` | 2 |
| `nightlife` | 1 |
| **total** | **5** |

O conjunto é adequado como fixture funcional, mas não oferece diversidade suficiente
para avaliar o produto como guia pessoal de Pipa.

## 3. Princípios de curadoria

A expansão segue estas regras:

- registrar somente Place cuja existência e localização sejam verificáveis;
- preferir fontes oficiais de turismo para praias e atrativos naturais;
- preferir fonte oficial do estabelecimento e índice local atual para negócios;
- usar avaliações, rankings e opiniões somente como descoberta, nunca como verdade canônica;
- não persistir nota, quantidade de reviews, horário ou preço monetário sujeito a mudança;
- não afirmar que um Place é “o melhor”, “imperdível” ou equivalente como dado factual;
- manter `price_range` qualitativo somente quando a classificação é defensável;
- preservar `null` quando custo não for conhecido com segurança;
- manter coordenadas como referência geoespacial aproximada do Place, não como garantia de entrada física;
- preservar os cinco registros históricos sem UPDATE, DELETE ou archive.

## 4. Fontes externas consultadas

Curadoria realizada em 2026-08-12.

### Destino, praias e natureza

- Prefeitura Municipal de Tibau do Sul — `Turismo e Lazer`:
  `https://tibaudosul.rn.gov.br/o-municipio/turismo-e-lazer/`;
- Visit Brasil / Embratur — `Pipa`:
  `https://visitbrasil.com/location/pipa-pt/`;
- Santuário Ecológico de Pipa — referência local:
  `https://pipa.com.br/santuarioecologico/`;
- Wikimedia Commons — referência geográfica complementar do Santuário:
  `https://commons.wikimedia.org/wiki/Category:Santu%C3%A1rio_Ecol%C3%B3gico_de_Pipa`.

As fontes oficiais destacam Praia do Amor, Baía dos Golfinhos, Praia do Madeiro e Praia
do Centro como praias centrais do destino e identificam o Santuário Ecológico como
atração de natureza.

### Gastronomia

- Camarão na Fazenda Pipa:
  `https://pipa.com.br/camaraonafazendanoite/`;
- Atelier de Massas:
  `https://pipa.com.br/atelier-de-massas/`;
- O Tal do Escondidinho:
  `https://pipa.com.br/otaldoescondidinho/`;
- índices atuais de negócios/mapas foram usados como verificação complementar de
  endereço e localização.

### Vida noturna

- Mirante Sunset Bar:
  `https://mirantesunsetbar.com.br/`;
- diretório local do Mirante:
  `https://pipa.com.br/mirantesunsetbar/`;
- Ágora Lounge Bar:
  `https://pipa.com.br/agorabar/`;
- índices atuais de negócios/mapas foram usados como verificação complementar de
  endereço e localização.

As fontes externas são evidência de curadoria, não dependência de runtime. O RouteBook
continua determinístico e não faz scraping ou consulta remota para montar o catálogo.

## 5. Catálogo alvo

A migration 0026 acrescenta oito Places e preserva os cinco existentes.

| Slug | Nome | Categoria | Price Range |
| --- | --- | --- | --- |
| `praia-do-centro` | Praia do Centro | `beach` | `free` |
| `praia-do-madeiro` | Praia do Madeiro | `beach` | `free` |
| `santuario-ecologico-de-pipa` | Santuário Ecológico de Pipa | `nature` | desconhecido |
| `camarao-na-fazenda-pipa` | Camarão na Fazenda Pipa | `gastronomy` | `moderate` |
| `atelier-de-massas` | Atelier de Massas | `gastronomy` | `moderate` |
| `o-tal-do-escondidinho` | O Tal do Escondidinho | `gastronomy` | `moderate` |
| `mirante-sunset-bar` | Mirante Sunset Bar | `nightlife` | `moderate` |
| `agora-club` | Agora Club | `nightlife` | `moderate` |

Após a migration, a expectativa é:

| Categoria | Quantidade esperada |
| --- | ---: |
| `beach` | 3 |
| `gastronomy` | 4 |
| `nature` | 3 |
| `nightlife` | 3 |
| **total** | **13** |

O catálogo não pretende ser exaustivo. Ele deve apenas atingir diversidade suficiente
para o piloto M8 sem transformar o banco em um diretório não governado.

## 6. Estratégia de persistência

A expansão é implementada em:

`packages/database/drizzle/0026_expand_pipa_catalog_for_m8.sql`

Características:

- DML exclusivamente aditiva;
- IDs UUID estáveis no namespace histórico do seed de Pipa;
- slugs estáveis;
- `publication_status=published`;
- `ON CONFLICT DO NOTHING` para tolerância a reexecução;
- nenhum UPDATE dos cinco registros existentes;
- nenhum DELETE;
- nenhum DROP/ALTER de schema;
- nenhum dado pessoal;
- journal Drizzle acrescentado de forma append-only.

## 7. Risco de Production

Embora a alteração seja aditiva, ela é DML em Production. Pelo contrato do `RB-INC-133`,
qualquer migration com escrita de dados deve ser classificada como **high risk** pelo
pipeline e não pode ser aplicada automaticamente.

Fluxo obrigatório:

```text
PR verde
  -> squash merge em main
  -> Engineering Validation verde em main
  -> Production Release detecta 0026 pendente
  -> classificação high risk
  -> bloqueio antes de qualquer write
  -> aprovação humana explícita para o SHA candidato
  -> workflow_dispatch aprovado
  -> migration
  -> ledger sem pendências
  -> promoção de codex/production-release
  -> Vercel Production
```

A aprovação de merge do código não equivale à aprovação da migration em Production.

## 8. Escopo

- acrescentar os oito Places curados;
- registrar migration e journal;
- validar catálogo via integração PostgreSQL;
- preservar compatibilidade com Explorar, mapa, filtros, distância, Salvos e Recommendations;
- registrar documentação, Registry e rastreabilidade;
- executar CI integral;
- comprovar fail-closed do gate de Production antes de pedir aprovação da migration;
- depois da aprovação, validar ledger, catálogo real, deployment, health e runtime.

## 9. Fora de escopo

- ratings e reviews;
- horários de funcionamento em tempo real;
- preço monetário ou cardápio em tempo real;
- reservas e compras;
- scraping ou ingestão remota em runtime;
- busca semântica;
- provider novo de Places;
- ativar Product Analytics/PostHog;
- declarar o M8 como validado sem uso pessoal real;
- incluir dados pessoais da viagem na documentação pública.

## 10. Critérios de aceite

- [x] baseline de Production auditado com cinco Places publicados;
- [x] oito novos Places definidos com slugs/UUIDs estáveis;
- [x] IDs novos verificados como livres em Production antes da migration;
- [x] migration é aditiva e idempotente e preserva todos os registros anteriores;
- [x] catálogo esperado possui múltiplas opções nas quatro categorias;
- [x] praias centrais de Pipa citadas pelas fontes oficiais ficam representadas pelo conjunto final;
- [x] gastronomia passa a conter estabelecimentos específicos;
- [x] vida noturna passa a conter estabelecimentos específicos;
- [x] teste PostgreSQL valida total, contagem por categoria, slugs e coordenadas válidas;
- [ ] Documentation Validation e Engineering Validation passam no mesmo SHA final da PR;
- [ ] PR integrada por squash em `main`;
- [ ] Engineering Validation pós-merge permanece verde;
- [ ] Production Release detecta 0026 e bloqueia antes de qualquer write como migration high risk;
- [ ] responsável aprova explicitamente a 0026 para o SHA candidato exato;
- [ ] workflow manual aplica 0026 e termina com zero migrations pendentes;
- [ ] `codex/production-release` avança somente depois do ledger ficar limpo;
- [ ] Vercel cria deployment Production READY do SHA aprovado;
- [ ] Production contém 13 Places publicados com distribuição 3/4/3/3;
- [ ] liveness/readiness e runtime permanecem verdes.

## 11. Testes

Automação obrigatória:

- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- política de migration;
- aplicação de migrations em PostgreSQL efêmero;
- testes de domínio e componentes;
- integração PostgreSQL do `DrizzlePlaceRepository`;
- smoke de desenvolvimento;
- build;
- Playwright responsivo;
- Documentation Validation e Engineering Validation.

Validação de Production após aprovação:

- ledger Drizzle;
- contagem por categoria;
- slugs esperados;
- `/api/health/live`;
- `/api/health/ready`;
- runtime errors/5xx;
- deployment Vercel e SHA.

## 12. Rollback e roll-forward

Como a migration apenas acrescenta registros, rollback destrutivo não é automático.
Se um Place se mostrar incorreto depois da promoção, a correção deve ocorrer por novo
incremento/migration de roll-forward, preservando histórico e rastreabilidade.

Antes da aprovação produtiva, rollback significa simplesmente não executar a 0026 e
manter `codex/production-release` no SHA anterior.

## 13. Continuidade

O RB-INC-135 prepara dados; ele não valida o produto em uso real.

Após sua conclusão, o próximo incremento recomendado é **RB-INC-136 — Validação Real do
MVP em Pipa (M8)**, no qual o uso pessoal deve registrar fricções, decisões realmente
apoiadas pelo produto, feedback qualitativo, riscos e decisão de continuidade sem
fabricar evidências de experiência humana.