---
id: RB-CTX-158
title: Context Pack do RB-INC-158 — Expansão Governada da Cobertura Visual dos Places de Pipa
description: Delimita curadoria, licenciamento, materialização, persistência e gates para ampliar a cobertura visual real dos Places publicados de Pipa.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, context-pack, pipa, images, wikimedia-commons, provenance, licensing]
related_documents: [RB-INC-158, RB-CORE-0004, RB-ARC-003, RB-DATA-002, RB-QA-001, RB-INC-133, RB-INC-143, RB-INC-155, RB-INC-157]
prerequisites: [RB-INC-143, RB-INC-155, RB-INC-157]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-158 — Expansão Governada da Cobertura Visual dos Places de Pipa

## 1. Missão do executor

Ampliar a cobertura de fotografias reais dos 30 Places publicados de Pipa sem reduzir o rigor de identidade, Provenance ou licença do RB-INC-143 e sem criar dependência nova de Provider, secret ou hotlink.

A implementação deve aumentar a cobertura segura acima dos seis assets atuais. Quando não houver evidência suficiente, o resultado correto é preservar o fallback.

## 2. Incremento

- ID: `RB-INC-158`;
- issue: `#365`;
- branch: `codex/rb-inc-158-pipa-visual-coverage`;
- baseline empilhada: `7871be5d7a15c3179d8f627aa32b77330fc314eb`;
- estado inicial: 6 imagens reais e 24 fallbacks entre 30 Places publicados;
- relação: expande RB-INC-143 e melhora a experiência entregue por RB-INC-155/RB-INC-157 sem alterar domínio.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/architecture/integrations-and-ports.md`;
5. `docs/data/physical-data-model-and-migrations.md`;
6. `docs/quality/quality-and-testing-strategy.md`;
7. `docs/implementation/increments/rb-inc-133-production-migration-gate.md`;
8. `docs/implementation/increments/rb-inc-141-place-primary-image.md`;
9. `docs/implementation/increments/rb-inc-142-organic-place-ingestion.md`;
10. `docs/implementation/increments/rb-inc-143-place-images.md`;
11. `docs/implementation/context-packs/rb-inc-143-place-images.md`;
12. `docs/implementation/increments/rb-inc-155-pipa-place-practical-guide.md`;
13. `docs/implementation/increments/rb-inc-157-progressive-catalog-itinerary-journey.md`;
14. RB-INC-158 e este Context Pack.

## 4. Contratos que prevalecem

- `Place.primaryImage.assetPath` é interno `/place-images/...`;
- `sourceUrl` é Provenance e nunca `src`;
- busca de mídia é read-only;
- somente mídia `secure` e `download_allowed` pode ser materializada;
- ausência ou ambiguidade mantém fallback;
- imagem não altera Recommendation, Saved Place, Itinerary ou ranking;
- nenhuma imagem genérica pode simular estabelecimento específico;
- Wikimedia Commons continua sendo a única fonte de mídia deste incremento;
- Provider pago, secret ou object storage exige decisão humana separada;
- migration DML é high-risk e não chega a Production sem aprovação humana do SHA exato;
- CI/PR não escreve em Production;
- merge na `main` exige autorização humana separada.

## 5. Estratégia de curadoria

Para cada Place sem imagem:

1. consultar candidatos no Wikimedia Commons usando nome canônico e contexto Pipa/Tibau do Sul;
2. verificar título, descrição e contexto geográfico;
3. exigir autoria não vazia;
4. exigir licença aceita pelo allowlist existente;
5. classificar identidade como `secure`, `ambiguous` ou `rejected`;
6. registrar no manifesto somente `secure`;
7. materializar asset local;
8. registrar hash/tamanho resolvidos;
9. persistir `primaryImage` somente depois de asset materializado e verificável.

Priorização inicial: praias, reservas, mirantes e landmarks. Negócios permanecem fallback salvo evidência inequívoca do estabelecimento exato.

## 6. Regras do manifesto e assets

Manifesto canônico:

`apps/web/data/pipa-place-images.json`

Assets:

`apps/web/public/place-images/pipa/**`

O manifesto existente não deve perder nenhuma das seis entradas aprovadas. Novas entradas precisam preservar `placeSlug`, `fileTitle`, `sourcePageUrl`, `expectedAuthor`, `license`, `licenseUrl`, `assetPath`, `altText`, `matchStatus`, `matchEvidence`, `sourceSha1`, `assetSha256` e `assetBytes` depois da materialização.

O limite técnico de 20 entradas permanece. Se houver mais de 20 candidatos seguros, não aumentar esse limite neste incremento; priorizar os mais úteis e abrir evolução separada.

## 7. Materialização binária

O conector GitHub escreve texto e não materializa binários diretamente. É permitido criar temporariamente:

`.github/workflows/rb-inc-158-materialize-images.yml`

O helper deve:

- executar somente na branch `codex/rb-inc-158-pipa-visual-coverage`;
- não usar secret;
- instalar somente dependências já versionadas no repositório;
- executar o materializador governado existente;
- commitar apenas novos assets, manifesto atualizado e eventual finalização explicitamente autorizada;
- falhar fechado em divergência de autor, licença, host, MIME, hash ou tamanho;
- ser removido antes da readiness da PR.

## 8. Persistência

`0031_expand_pipa_place_primary_images.sql` pode atualizar somente os novos Places curados e somente `primary_image`/`updated_at`.

A migration deve:

- usar IDs canônicos já existentes;
- ser idempotente quanto ao valor pretendido;
- não alterar nome, categoria, coordenadas, preço ou publication status;
- ser classificada `high-risk` por conter `UPDATE`;
- permanecer bloqueada para Production sem aprovação humana explícita.

## 9. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados no RB-INC-158 e na issue `#365`.

## 10. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:release-migration-policy
pnpm db:migrate
pnpm test
pnpm test:place-images
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/place-discovery-filters.spec.ts e2e/recommendations-experience.spec.ts
```

Engineering Validation e Documentation Validation devem concluir no mesmo SHA. Verificação final de assets deve ser offline.

## 11. Proibições

- não usar Google Images, Instagram, TripAdvisor ou scraping;
- não gerar imagens artificialmente;
- não promover candidato `ambiguous`;
- não preencher autor/licença ausentes por inferência;
- não usar URL remota como `src`;
- não alterar Recommendation, ranking ou publicação;
- não aumentar limite do manifesto acima de 20;
- não criar Provider, secret ou storage novo;
- não aplicar migration diretamente em Production;
- não declarar evidência humana M8 por teste técnico;
- não fazer merge nem promover para Production sem autorização humana separada.

## 12. Handoff

Relatar cobertura inicial e final, Places adicionados, Places deliberadamente mantidos em fallback, Provenance/licenças, arquivos alterados, migration, testes reais, estado do CI, issue, PR e riscos. Cobertura visual maior não significa autorização para inferir identidade de mídia.
