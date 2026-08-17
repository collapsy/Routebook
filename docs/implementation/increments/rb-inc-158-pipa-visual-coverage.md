---
id: RB-INC-158
title: Expansão Governada da Cobertura Visual dos Places de Pipa
description: Amplia a cobertura de fotografias reais dos Places publicados de Pipa reutilizando o pipeline governado do Wikimedia Commons, sem hotlink, scraping ou Provider pago.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, pipa, place-catalog, images, wikimedia-commons, provenance, licensing, traveler-experience]
related_documents: [RB-CORE-0004, RB-ARC-003, RB-DATA-002, RB-QA-001, RB-INC-133, RB-INC-141, RB-INC-142, RB-INC-143, RB-INC-155, RB-INC-157, RB-CTX-158]
prerequisites: [RB-INC-143, RB-INC-155, RB-INC-157]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-158 — Expansão Governada da Cobertura Visual dos Places de Pipa

## 1. Contexto

Issue: `#365`.

Branch: `codex/rb-inc-158-pipa-visual-coverage`.

Baseline empilhada: `7871be5d7a15c3179d8f627aa32b77330fc314eb`, SHA verde do RB-INC-157.

Após RB-INC-153–157, o catálogo publicado de Pipa possui 30 Places com conteúdo prático, Discovery ampliada, mapa e ações de rota. A cobertura visual real, porém, continua limitada aos seis assets curados no RB-INC-143; os outros 24 Places permanecem com fallback explícito.

## 2. Objetivo

Aumentar materialmente a quantidade de Places publicados que exibem fotografia real e representativa, mantendo os contratos de segurança, identidade, licença, Provenance e armazenamento local definidos no RB-INC-143.

A expansão privilegia Places naturais e landmarks para os quais o Wikimedia Commons forneça evidência forte. Negócios somente podem receber imagem quando o arquivo representar inequivocamente o estabelecimento específico; imagem genérica de Pipa nunca substitui evidência ausente.

## 3. Estado inicial mensurável

- catálogo publicado: 30 Places;
- imagens reais materializadas: 6;
- fallbacks explícitos: 24;
- fonte governada: Wikimedia Commons;
- assets controlados em `/place-images/pipa/`;
- manifesto em `apps/web/data/pipa-place-images.json`;
- limite técnico atual do manifesto: 20 entradas;
- nenhum hotlink, Provider pago, secret ou object storage novo.

A entrega só é melhoria se a cobertura final segura for maior que 6/30. Nenhuma meta autoriza reduzir o rigor da curadoria.

## 4. Decisões

### 4.1 Reutilizar o pipeline existente

O RB-INC-158 não cria outro Provider de mídia. A curadoria continua baseada na API oficial do Wikimedia Commons, no manifesto versionado e no materializador do RB-INC-143.

### 4.2 Segurança antes de cobertura

Cada nova entrada precisa representar o Place correto, possuir `Artist` auditável, licença permitida, Provenance em `commons.wikimedia.org`, mídia em `upload.wikimedia.org`, correspondência `secure` e asset local com hash/tamanho verificáveis. Ausência de qualquer evidência mantém fallback.

### 4.3 Priorização

A auditoria começa por Praia do Centro, Santuário Ecológico de Pipa, Praia das Minas, Praia de Cacimbinhas, Praia de Sibaúma e outros landmarks naturais publicados cuja metadata seja suficiente. Estabelecimentos comerciais não recebem tratamento preferencial por risco de homônimo, fachada antiga ou imagem genérica.

### 4.4 Persistência

Novos `primaryImage` exigem migration DML dedicada e idempotente. Como contém `UPDATE`, ela é `high-risk` conforme RB-INC-133 e não pode ser aplicada em Production sem aprovação humana explícita do SHA candidato. A migration pode alterar somente `primary_image` e `updated_at` dos Places explicitamente curados.

### 4.5 Semântica preservada

Imagem continua sendo contexto visual. Presença ou ausência de mídia não altera publication status, Recommendation, Saved Place, Itinerary, ordem de Discovery, distância geodésica nem rota real externa.

## 5. Escopo

- auditar os 24 Places publicados ainda sem imagem;
- selecionar somente correspondências seguras no Wikimedia Commons;
- ampliar o manifesto existente sem ultrapassar o limite governado;
- materializar e versionar novos assets locais;
- criar migration DML somente para novos `primaryImage`;
- atualizar journal de migrations;
- ampliar testes de manifesto, assets, persistência e experiência;
- atualizar contagens E2E de imagem/fallback para a cobertura materializada;
- manter Provenance, autoria e licença auditáveis;
- documentação e Registry.

## 6. Fora de escopo

- scraping de Google, Instagram, TripAdvisor ou sites comerciais;
- imagens geradas por IA;
- imagem regional genérica representando negócio específico;
- correspondência `ambiguous` promovida;
- hotlink de runtime;
- Provider pago, secret, API key ou object storage novo;
- galeria de múltiplas imagens;
- alteração de catálogo, ranking, Recommendation ou conteúdo editorial;
- cálculo interno de rota rodoviária, tempo de trânsito ou distância real;
- merge ou promoção para Production sem autorização humana separada.

## 7. Caminhos autorizados

```text
apps/web/data/pipa-place-images.json
apps/web/public/place-images/pipa/**
apps/web/lib/wikimedia-place-image.ts
apps/web/lib/wikimedia-place-image.test.ts
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/recommendations-experience.spec.ts
scripts/materialize-place-images.mjs
scripts/materialize-place-images.test.mjs
packages/database/drizzle/0031_expand_pipa_place_primary_images.sql
packages/database/drizzle/meta/_journal.json
packages/database/src/place-repository.test.ts
.github/workflows/engineering-validation.yml
.github/workflows/rb-inc-158-materialize-images.yml
docs/implementation/increments/rb-inc-158-pipa-visual-coverage.md
docs/implementation/context-packs/rb-inc-158-pipa-visual-coverage.md
docs/registry.md
```

`rb-inc-158-materialize-images.yml`, se necessário pela limitação do conector para binários, é helper temporário restrito à branch e deve ser removido antes da readiness da PR. Arquivo adicional indispensável exige atualização desta seção e justificativa na PR antes da alteração.

## 8. Critérios de aceite

- [ ] cobertura final de imagem real é maior que 6 dos 30 Places publicados;
- [ ] cada novo asset possui identidade, autoria, licença e Provenance verificáveis;
- [ ] somente correspondências `secure` são materializadas;
- [ ] browser continua usando somente `/place-images/...` como `src` curado;
- [ ] nenhum negócio recebe imagem genérica;
- [ ] Places sem mídia segura continuam com fallback explícito e acessível;
- [ ] manifesto e assets passam verificação offline de integridade;
- [ ] migration modifica somente `primary_image`/`updated_at` dos novos Places;
- [ ] migration é detectada como high-risk para Production;
- [ ] Recommendation permanece semanticamente invariável;
- [ ] Discovery e detalhe preservam comportamento existente;
- [ ] Documentation e Engineering Validation passam no mesmo SHA.

## 9. Testes obrigatórios

- manifesto rejeita entrada sem autor, licença, Provenance válida ou correspondência `secure`;
- materializador continua limitado aos hosts/MIME/tamanho governados;
- verificação offline cobre todos os assets do manifesto;
- PostgreSQL retorna `primaryImage` para cada novo Place curado;
- E2E comprova aumento da cobertura real e fallback deliberadamente preservado;
- regressão de Recommendations preserva score/reasons/confidence;
- release migration policy classifica `0031` como high-risk;
- `node scripts/validate-docs.mjs`;
- `pnpm format:check`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test:release-migration-policy`;
- `pnpm db:migrate`;
- `pnpm test`;
- `pnpm test:place-images`;
- `pnpm build`;
- Playwright aplicável.

## 10. Riscos e mitigação

- **forçar cobertura por similaridade:** somente metadata/evidência explícita permite promoção;
- **metadata externa mudar:** asset e integridade ficam versionados e Provenance registra o aprovado;
- **licença incompatível:** allowlist existente falha fechado;
- **fachada de negócio desatualizada:** negócio permanece fallback sem correspondência inequívoca;
- **DML em Production:** policy exige aprovação humana do SHA exato;
- **manifesto crescer demais:** limite existente de 20 entradas continua valendo.

## 11. Rollback

Código e assets podem ser revertidos sem alterar o restante do catálogo. A migration de dados deve seguir roll-forward governado; não executar `UPDATE` destrutivo automático em Production para remover mídia. Assets não referenciados podem permanecer inertes até limpeza governada.
