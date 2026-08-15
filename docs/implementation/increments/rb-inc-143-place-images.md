---
id: RB-INC-143
title: Enriquecimento Governado de Imagens Reais dos Places de Pipa
description: Materializa imagens reais e licenciadas para um subconjunto útil dos Places publicados de Pipa, preservando Provenance, fallback e independência de Provider.
document_type: implementation-increment
owner: Place Catalog and Integrations
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors: [RouteBook Team]
tags: [implementation, place-catalog, images, wikimedia-commons, provenance, licensing, pipa, m8]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-DOM-001, RB-ARC-003, RB-ADR-016, RB-DATA-002, RB-QA-001, RB-INC-133, RB-INC-141, RB-INC-142, RB-INC-136, RB-CTX-143]
prerequisites: [RB-INC-141, RB-INC-142]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-143 — Enriquecimento Governado de Imagens Reais dos Places de Pipa

## 1. Objetivo

Fazer com que Places relevantes do catálogo publicado de Pipa exibam fotografias reais, representativas e reutilizáveis sob licença conhecida, sem hotlink de runtime, sem Provider pago e sem alterar a semântica de Recommendation.

Issue: #335.

Branch: `codex/rb-inc-143-place-images`.

Baseline: `474135f3c0f7e1b0fb9f7d7e8d90511faf49e2b4`.

## 2. Autoridade canônica

Este incremento concretiza contratos já definidos:

- RB-INC-141: `Place.primaryImage` é opcional e aponta somente para `/place-images/...` controlado pelo RouteBook;
- RB-INC-142: `PlaceImagePort` produz candidatos de mídia e uma busca nunca altera `primaryImage` por efeito colateral;
- RB-ARC-003: imagem externa precisa preservar licença, atribuição, expiração/cache e fallback;
- RB-ADR-016 permanece internamente `Proposed`; este incremento não aprova Cloudflare R2 nem provisiona object storage.

Nenhum novo significado de `Place`, Recommendation ou decisão é criado.

## 3. Estratégia inicial

A fonte aberta inicial é Wikimedia Commons, consultada pela Action API oficial (`imageinfo` + `extmetadata`). Cada arquivo é curado individualmente e precisa ter evidência suficiente de correspondência com o Place.

Fluxo:

```text
Place publicado
  -> PlaceImagePort / Wikimedia Commons
  -> ExternalPlaceImageCandidate
  -> verificação de identidade e licença
       -> secure
       -> ambiguous
       -> rejected
  -> materialização curada
  -> arquivo versionado em apps/web/public/place-images/pipa/
  -> migration 0030 atualiza Place.primaryImage
```

A busca/discovery de mídia é read-only. Apenas a curadoria explicitamente versionada pode produzir um asset local.

## 4. Critério de correspondência

Uma mídia somente pode ser marcada `secure` quando existir combinação forte de evidências, por exemplo:

- título/descrição identifica explicitamente o Place; e
- categoria ou contexto geográfico identifica Pipa/Tibau do Sul; e/ou
- coordenadas do ponto de captura são coerentes com o Place; e
- não existe sinal material de homônimo ou outro destino.

Correspondência apenas por texto aproximado é insuficiente. Candidato ambíguo mantém fallback.

## 5. Curadoria inicial

A primeira cobertura prioriza landmarks com documentação inequívoca no Commons:

1. Praia do Amor;
2. Baía dos Golfinhos;
3. Chapadão de Pipa;
4. Praia do Madeiro;
5. Lagoa de Guaraíras;
6. Praia de Tibau do Sul.

Praia de Sibaúma foi avaliada, mas o `Artist` retornado pela API oficial do Commons estava vazio. Embora a licença do arquivo fosse reutilizável, a ausência de autoria auditável impediu a promoção; o Place mantém fallback.

Restaurantes e bares não receberão imagem genérica da região para simular cobertura.

## 6. Materialização e armazenamento

Para o primeiro ciclo, os arquivos aprovados serão versionados em:

`apps/web/public/place-images/pipa/`

A curadoria mantém um manifesto textual com:

- `placeSlug`;
- título do arquivo no Commons;
- página de Provenance;
- autor esperado;
- licença e URL da licença;
- evidência de correspondência;
- `altText`;
- caminho interno final;
- metadata de integridade resolvida durante a materialização.

O utilitário de curadoria consulta a API oficial, valida metadata e baixa uma representação de até 1280 px para reduzir peso. A imagem é redistribuída sob a mesma licença do arquivo de origem e não recebe edição editorial adicional.

O build final e o runtime não dependem do Commons: depois de materializado, o browser recebe somente `/place-images/...`.

## 7. Wikimedia Commons boundary

O adapter deve:

- usar apenas HTTPS;
- consultar `commons.wikimedia.org`;
- aceitar download somente de `upload.wikimedia.org` retornado pela API;
- solicitar poucos resultados por Place;
- preservar página da fonte, autor, licença, URL da licença e instante de coleta;
- rejeitar ausência de licença/autor/arquivo de imagem;
- não inferir licença pela extensão ou pelo nome do arquivo;
- não escrever banco ou filesystem em uma simples busca.

Segundo a documentação do Commons, cada arquivo possui termos próprios de reutilização, atribuição deve ser respeitada quando exigida e download é preferível a hotlink para reutilização externa.

## 8. Persistência

A migration `0030_curate_pipa_place_primary_images.sql` atualiza apenas `primary_image` dos seis Places explicitamente curados.

Cada JSON persistido deve conter:

- `assetPath` interno;
- `altText`;
- `sourceName = Wikimedia Commons`;
- `sourceUrl` apontando à página do arquivo;
- licença curta verificável;
- `attribution` com autor.

Nenhum Place sem asset materializado pode receber `primary_image`.

Por conter `UPDATE`, a migration é **high-risk** segundo RB-INC-133 e o pipeline de Production deve bloqueá-la até aprovação humana explícita do SHA candidato.

## 9. Imagens e Recommendation

Imagem continua sendo contexto visual. Score, reasons, confidence, ranking, estado e ações de Recommendation não podem depender da presença/ausência da mídia.

## 10. Escopo

- manifesto de curadoria de imagens de Pipa;
- adapter Wikimedia Commons implementando `PlaceImagePort`;
- classificação determinística `secure | ambiguous | rejected` na camada de integração/curadoria;
- materializador governado para arquivos aprovados;
- seis assets locais controlados pelo RouteBook;
- migration 0030 atualizando `primary_image` somente após materialização;
- verificação offline de integridade dos assets;
- UI/E2E comprovando imagem para Places cobertos e fallback para os demais;
- documentação, Registry e gates aplicáveis.

## 11. Fora de escopo

- cobertura de 100% dos Places;
- galeria;
- imagens geradas artificialmente;
- scraping de Google, Instagram, TripAdvisor ou sites comerciais;
- hotlink de runtime;
- Provider pago;
- aprovação/ativação de R2;
- alteração de reviews, ratings, horários ou ranking;
- validação humana do M8 por inferência.

## 12. Caminhos autorizados

```text
modules/place-catalog/src/external-place.ts
modules/place-catalog/src/external-place.test.ts
apps/web/lib/wikimedia-place-image.ts
apps/web/lib/wikimedia-place-image.test.ts
apps/web/data/pipa-place-images.json
apps/web/public/place-images/pipa/**
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/recommendations-experience.spec.ts
scripts/materialize-place-images.mjs
scripts/materialize-place-images.test.mjs
package.json
.github/workflows/engineering-validation.yml
packages/database/drizzle/0030_curate_pipa_place_primary_images.sql
packages/database/drizzle/meta/_journal.json
packages/database/src/place-repository.test.ts
docs/implementation/increments/rb-inc-143-place-images.md
docs/implementation/context-packs/rb-inc-143-place-images.md
docs/registry.md
```

Helper temporário autorizado para materializar os binários na branch e, após a materialização bem-sucedida, executar uma única finalização determinística do Registry e remover a si próprio:

```text
.github/workflows/rb-inc-143-materialize-images.yml
```

A finalização só pode inserir as entradas `RB-INC-143` e `RB-CTX-143` em `docs/registry.md` e excluir o próprio helper. Ele deve estar ausente do diff final da PR.

Arquivo adicional indispensável deve ser registrado aqui e explicado na PR antes da alteração.

## 13. Critérios de aceite

- [ ] um subconjunto útil de Places de Pipa exibe imagens reais e representativas;
- [ ] nenhuma imagem é escolhida apenas por similaridade textual fraca;
- [ ] Provenance, autor, licença e atribuição permanecem auditáveis;
- [ ] browser nunca usa URL remota de Provenance como `src`;
- [ ] assets exibidos estão sob `/place-images/...` controlado pelo RouteBook;
- [ ] ausência/ambiguidade mantém fallback acessível;
- [ ] Recommendation permanece semanticamente invariável;
- [ ] não existe scraping ou hotlink;
- [ ] nenhum Provider pago, bucket ou secret é ativado;
- [ ] migration 0030 é bloqueada como high-risk em Production até aprovação explícita;
- [ ] Documentation e Engineering Validation passam no mesmo SHA.

## 14. Testes obrigatórios

- parsing de `imageinfo/extmetadata` com autor/licença/URL;
- candidato sem licença, mídia inválida ou domínio inesperado é rejeitado;
- correspondência `secure`, `ambiguous` e `rejected`;
- materializador aceita somente entradas curadas e host permitido;
- verificação de integridade dos arquivos materializados;
- PostgreSQL persiste/retorna `primaryImage` esperado para os Places curados;
- Discovery exibe imagem real para cobertura e fallback para Place sem cobertura;
- Recommendations preservam score/reasons/confidence com e sem imagem;
- migration policy classifica 0030 como high-risk;
- format, docs, lint, typecheck, testes, build e Playwright.

## 15. Riscos

- metadata no Commons pode ser alterada: manifesto e assets versionados preservam o estado efetivamente aprovado;
- licenças ShareAlike exigem cumprimento dos termos quando houver modificação; este incremento redistribui apenas representação redimensionada do arquivo sob a mesma licença e preserva crédito/licença;
- imagens com pessoas podem trazer direitos adicionais; a curadoria inicial prioriza paisagens/landmarks;
- DML em Production exige gate humano separado;
- cobertura parcial é intencional: fallback é preferível a mídia errada.

## 16. Rollback

O código pode ser revertido sem remover o catálogo. A migration 0030 apenas preenche `primary_image`; eventual reversão de dados em Production deverá seguir roll-forward governado, sem `UPDATE` destrutivo automático. Assets locais não referenciados podem permanecer inertes até um incremento de limpeza explicitamente aprovado.
