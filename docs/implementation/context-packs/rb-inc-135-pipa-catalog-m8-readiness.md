---
id: RB-CTX-135
title: Context Pack do RB-INC-135 — Catálogo Real de Pipa
description: Contexto mínimo para expandir com segurança o catálogo persistido de Pipa antes da validação real do MVP no marco M8.
document_type: implementation-context-pack
owner: Place Catalog and Platform
status: Draft
version: "0.1.0"
created: "2026-08-12"
last_updated: "2026-08-12"
authors: [RouteBook Team]
tags: [context-pack, place-catalog, pipa, m8, migration, production]
related_documents: [RB-INC-135, RB-CORE-0004, RB-PRD-002, RB-DEL-001, RB-DATA-002, RB-QA-001, RB-CICD-001, RB-INC-129, RB-INC-132, RB-INC-133, RB-INC-134]
prerequisites: [RB-INC-129, RB-INC-132, RB-INC-133, RB-INC-134]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-135 — Catálogo Real de Pipa

## 1. Missão

Expandir o catálogo publicado de `pipa-rn-br` de cinco para treze Places curados,
preservando os dados existentes e preparando o produto para a validação real M8.

## 2. Fonte canônica

- repositório: `collapsy/Routebook`;
- issue: #316;
- incremento: RB-INC-135;
- branch: `codex/rb-inc-135-pipa-catalog-m8-readiness`;
- baseline de `main`: `013dccd77a50b9c296efd5b7f1f3199e7dd7d93d`;
- Production release branch: `codex/production-release`;
- banco de Production: projeto Neon `routebook`;
- destino: `pipa-rn-br`.

## 3. Documentos obrigatórios

Ler antes de alterar o escopo:

- `AGENTS.md`;
- `docs/README.md`;
- `docs/core/routebook-bible.md`;
- `docs/product/mvp-definition.md`;
- `docs/delivery/delivery-strategy-and-implementation-roadmap.md`;
- `docs/data/physical-data-model-and-migrations.md`;
- `docs/quality/quality-and-testing-strategy.md`;
- `docs/implementation/README.md`;
- `docs/implementation/increments/rb-inc-129-mvp-production-validation.md`;
- `docs/implementation/increments/rb-inc-132-place-discovery-filters.md`;
- `docs/implementation/increments/rb-inc-133-production-migration-gate.md`;
- `docs/implementation/increments/rb-inc-134-production-public-access.md`.

## 4. Estado inicial comprovado

Em Production, antes da 0026:

```text
pipa-rn-br
  beach       1
  gastronomy  1
  nature      2
  nightlife   1
  total       5
```

Os IDs `10000000-0000-4000-8000-000000000006` a
`10000000-0000-4000-8000-000000000013` foram consultados e estavam livres antes da
criação da migration.

## 5. Resultado esperado da migration

```text
pipa-rn-br
  beach       3
  gastronomy  4
  nature      3
  nightlife   3
  total      13
```

Novos slugs obrigatórios:

```text
praia-do-centro
praia-do-madeiro
santuario-ecologico-de-pipa
camarao-na-fazenda-pipa
atelier-de-massas
o-tal-do-escondidinho
mirante-sunset-bar
agora-club
```

## 6. Invariantes

- não alterar ou remover os cinco Places históricos;
- não alterar categorias canônicas;
- não adicionar rating, review count, horário ou preço monetário;
- não converter preço desconhecido em `free`;
- não criar dependência de API externa em runtime;
- não armazenar dado pessoal;
- não transformar opinião/ranking em fato canônico;
- não aplicar DML em Production sem gate e aprovação explícita;
- `codex/production-release` só avança após ledger sem pendências;
- nenhuma credencial ou URL de banco pode aparecer em logs/documentação.

## 7. Paths autorizados

```text
packages/database/drizzle/0026_expand_pipa_catalog_for_m8.sql
packages/database/drizzle/meta/_journal.json
packages/database/src/place-repository.test.ts
docs/implementation/increments/rb-inc-135-pipa-catalog-m8-readiness.md
docs/implementation/context-packs/rb-inc-135-pipa-catalog-m8-readiness.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Mudanças fora desses paths exigem justificativa objetiva ligada a falha de CI ou contrato
já existente.

## 8. Curadoria externa

### Fontes preferenciais

1. Prefeitura Municipal de Tibau do Sul;
2. Visit Brasil / Embratur;
3. site oficial do estabelecimento;
4. diretório local atual;
5. índice/mapa atual como confirmação complementar de endereço/localização.

### Regra de conflito

Se duas fontes divergirem:

- para existência e natureza do atrativo, preferir fonte oficial institucional;
- para endereço atual de estabelecimento, preferir fonte atual do próprio negócio ou
  índice de negócios atualizado;
- se não houver confiança suficiente, não versionar o dado ou manter o campo desconhecido.

## 9. Migration

Arquivo:

`packages/database/drizzle/0026_expand_pipa_catalog_for_m8.sql`

Contrato:

- somente `INSERT`;
- `ON CONFLICT DO NOTHING`;
- nenhum `UPDATE`;
- nenhum `DELETE`;
- nenhum DDL;
- timestamps explícitos;
- UUID e slug estáveis;
- `publication_status=published`;
- `price_range` nullable quando necessário.

O journal recebe exclusivamente a entrada idx 26, sem reordenar ou modificar migrations
históricas.

## 10. Teste de integração

`packages/database/src/place-repository.test.ts` deve comprovar, depois das migrations
em PostgreSQL efêmero:

- total 13;
- slugs únicos;
- `beach=3`;
- `gastronomy=4`;
- `nature=3`;
- `nightlife=3`;
- presença dos 13 slugs esperados, incluindo os cinco históricos;
- `publicationStatus=published`;
- latitude entre -90 e 90;
- longitude entre -180 e 180.

Não escrever nem limpar os registros `pipa-rn-br` no teardown do teste.

## 11. CI obrigatório

Antes do merge:

- formatting;
- docs validation;
- lint;
- typecheck;
- migration policy;
- migrations em PostgreSQL efêmero;
- testes;
- smoke local;
- build;
- Playwright responsivo;
- Documentation Validation e Engineering Validation no mesmo SHA final.

## 12. Production Release

Após o squash merge, o comportamento esperado é **falhar fechado**:

1. Engineering Validation da `main` passa;
2. Production Release localiza `0026_expand_pipa_catalog_for_m8` como pendente;
3. a presença de DML deve classificá-la como `high`;
4. o release automático deve interromper antes de `pnpm db:migrate`;
5. `codex/production-release` permanece no SHA anterior;
6. Vercel Production permanece no deployment anterior.

Somente depois dessa comprovação solicitar aprovação humana explícita para:

```text
migration: 0026_expand_pipa_catalog_for_m8
candidate SHA: <SHA do squash merge em main>
approve_high_risk_migrations: true
```

A aprovação deve nomear o candidate SHA; aprovação genérica anterior não é suficiente.

## 13. Pós-aprovação

Executar workflow manual e confirmar:

- migration aplicada uma única vez;
- ledger com zero pendências;
- `codex/production-release` no candidate SHA;
- Vercel Production READY no mesmo SHA;
- consulta real do catálogo retorna 13 publicados em 3/4/3/3;
- live 200/ok;
- ready 200/ready e database available;
- sem erros/fatal/5xx relevantes no runtime.

## 14. Critérios de parada

Parar e envolver o responsável se:

- o gate não classificar a DML como high risk;
- o pipeline tentar escrever antes da aprovação;
- qualquer migration histórica aparecer alterada;
- houver conflito de UUID/slug em Production;
- a migration exigir UPDATE/DELETE para prosseguir;
- surgir divergência geográfica material que torne um Place inseguro para publicação;
- a execução produtiva exigir operação destrutiva ou irreversível adicional.

## 15. Continuidade

Depois da conclusão do RB-INC-135, o próximo ciclo é RB-INC-136, focado no uso pessoal
real do RouteBook para M8. Evidência humana, satisfação e fricções não devem ser
inferidas por testes automatizados.