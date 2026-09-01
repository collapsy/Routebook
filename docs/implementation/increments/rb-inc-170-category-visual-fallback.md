---
id: RB-INC-170
title: Fallback visual ilustrativo por categoria
description: Substitui cards visualmente secos por ilustrações locais e explicitamente genéricas, preservando a precedência de fotografias governadas e a Provenance.
document_type: implementation-increment
owner: Place Catalog and Trip Experience
status: Draft
version: "0.1.0"
created: "2026-08-28"
last_updated: "2026-08-28"
authors: [RouteBook Team]
tags: [implementation, images, fallback, illustration, mobile, pipa, discovery, recommendations]
related_documents: [RB-CORE-0004, RB-INC-136, RB-INC-141, RB-INC-158, RB-INC-162, RB-INC-169, RB-CTX-170]
prerequisites: [RB-INC-141, RB-INC-162, RB-INC-169]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-170 — Fallback visual ilustrativo por categoria

## 1. Contexto

Issue: `#397`.

Branch: `codex/rb-inc-170-category-visual-fallback`.

Base de Preview: PR `#396` / RB-INC-169, SHA `872b03c9a18e62b3273f1d48cf8ec9792c517a02`.

O uso humano do RouteBook em Pipa confirmou que o pipeline de fotografia é seguro, mas a cobertura real ainda não é suficiente para uma experiência de guia visual. O RB-INC-141 já mantém `Place.primaryImage` opcional, o RB-INC-162 tenta mídia externa Wikimedia somente com identidade `secure`, e a issue #382 preserva Google Places Photos atrás de gate humano de Provider, billing e credencial.

Até aqui, a ausência de foto caía em uma capa abstrata com gradiente. Isso preservava semântica, mas ainda deixava a Discovery, Recommendations e especialmente Lugares salvos com aparência seca ou inconsistente.

## 2. Objetivo

Garantir contexto visual útil mesmo quando não existe fotografia real governada, sem transformar ilustração em evidência factual do Place.

Cadeia visual:

```text
foto real governada do Place
→ mídia externa permitida com identidade segura
→ ilustração local e genérica da categoria
```

A ilustração nunca ocupa `Place.primaryImage`, nunca recebe Provenance de um estabelecimento e nunca é apresentada como fotografia.

## 3. Estratégia

Um componente reutilizável `CategoryIllustration` centraliza assets e disclosure para:

- Praia;
- Gastronomia;
- Natureza;
- Vida noturna;
- Lugar genérico;
- nascer do Sol;
- pôr do Sol;
- nascer da Lua;
- Rolê confirmado.

Os assets são SVGs locais, sem dependência de rede, Provider, secret ou licença externa.

Para Place, o disclosure obrigatório é:

`Ilustração de categoria — não é foto do local`.

Para céu/evento, a microcopy explicita que a arte não representa as condições reais ou uma fotografia do evento.

## 4. Comportamento por superfície

### Discovery

Place publicado sem `primaryImage` recebe ilustração da categoria. Candidato externo já nasce com ilustração enquanto o lookup seguro de fotografia está ocioso/em carregamento; match seguro substitui a ilustração por fotografia e miss/erro volta à ilustração.

### Recommendations

O card passa a fornecer a categoria para `PlacePrimaryImage`, evitando fallback genérico quando a categoria é conhecida.

### Lugares salvos

Cards que antes eram exclusivamente textuais passam a usar `PlacePrimaryImage`, mantendo foto real quando disponível e ilustração quando ausente.

### Guia diário

Cards de nascer do Sol, pôr do Sol, nascer da Lua e Rolês confirmados recebem referências visuais genéricas. A ilustração não altera horário, Provenance, confiança, evento confirmado, Place recomendado ou qualquer Decisão.

## 5. Invariantes

- foto real governada sempre tem precedência sobre ilustração;
- Wikimedia `secure` continua tendo precedência no candidato externo sem foto canônica;
- ilustração não cria nem altera `Place.primaryImage`;
- ilustração não muda ranking, score, Recommendation, Saved Place, Itinerary ou Decision;
- nenhuma ilustração simula um estabelecimento específico;
- falha de fotografia real degrada para o mesmo fallback de categoria;
- disclosure permanece visível;
- conteúdo textual e ações continuam utilizáveis sem mídia;
- nenhum Provider, billing, API key, migration ou write adicional é criado.

## 6. Escopo

- componente central de ilustração;
- assets SVG locais por categoria/experiência temporal;
- fallback do `PlacePrimaryImage`;
- loading/fallback de imagens externas;
- categoria em Recommendations;
- cobertura visual em Lugares salvos;
- ilustrações de Sol/Lua/Rolês no Guia;
- testes de componente e E2E;
- Registry e rastreabilidade;
- Preview consolidado empilhado sobre RB-INC-169.

## 7. Fora de escopo

- Google Places Photos ou outro Provider pago;
- escolher ou aceitar ADR de Provider;
- gerar fotografia sintética de Place/evento;
- persistir ilustração como dado de domínio;
- novas categorias canônicas;
- alterar `Place.primaryImage`, schema ou migrations;
- ranking visual do #390;
- alterar dados/horários/eventos do RB-INC-169;
- Production;
- merge da #387 ou #396.

## 8. Caminhos autorizados

```text
apps/web/components/category-illustration.tsx
apps/web/components/category-illustration.module.css
apps/web/components/category-illustration.test.tsx
apps/web/components/place-primary-image.tsx
apps/web/components/place-primary-image.module.css
apps/web/components/place-primary-image.test.tsx
apps/web/components/external-place-image-preview.tsx
apps/web/components/external-place-image-preview.test.tsx
apps/web/components/recommendation-card.tsx
apps/web/components/pipa-daily-experiences.tsx
apps/web/app/viagens/[tripId]/lugares-salvos/page.tsx
apps/web/public/category-illustrations/*.svg
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/recommendations-experience.spec.ts
apps/web/e2e/place-actions.spec.ts
apps/web/e2e/external-place-images.spec.ts
apps/web/e2e/trip-day-guide.spec.ts
docs/implementation/increments/rb-inc-170-category-visual-fallback.md
docs/implementation/context-packs/rb-inc-170-category-visual-fallback.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [ ] Place sem fotografia real exibe ilustração coerente com a categoria;
- [ ] disclosure informa que a ilustração não é foto do local;
- [ ] fotografia governada continua prevalecendo;
- [ ] falha de asset real volta à ilustração;
- [ ] candidato externo exibe ilustração durante lookup e após miss/erro;
- [ ] match externo `secure` substitui a ilustração por fotografia licenciada;
- [ ] Recommendations recebem a categoria no fallback;
- [ ] Lugares salvos deixam de ter cards sem qualquer visual;
- [ ] Sol/Lua/Rolês possuem referência ilustrativa semanticamente distinta de fotografia factual;
- [ ] viewport mobile permanece sem overflow e com ações utilizáveis;
- [ ] nenhum Provider, secret, billing ou migration é adicionado;
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] Vercel Preview fica READY no mesmo SHA antes do aceite funcional.

## 10. Testes

- componente: categoria, disclosure, variante temporal e estado live;
- `PlacePrimaryImage`: foto real, ausência, falha e Provenance;
- preview externo: lazy, match seguro e miss;
- E2E Discovery: fallback de Praia das Minas;
- E2E Recommendations: 21 fallbacks continuam explícitos e categorizados;
- E2E Salvos: Place sem foto conserva contexto visual;
- E2E externo: miss seguro degrada para ilustração;
- E2E Guia: nascer da Lua e Rolê confirmado exibem ilustração apropriada;
- gates completos do monorepo.

## 11. Riscos e mitigação

**Ilustração parecer fotografia real:** estilo deliberadamente vetorial e disclosure permanente.

**Arte genérica parecer identidade do Place:** o asset é selecionado somente por categoria/experiência e nunca persistido no Place.

**Provider externo falhar:** a ilustração já existe antes do lookup e volta a ser usada em miss/erro.

**Aumentar peso visual:** SVGs locais são simples; o aspect ratio é fixo e evita layout shift.

## 12. Dependência e merge

A branch é empilhada sobre a PR #396 para produzir um único Preview com Roteiro + experiências temporais + cobertura visual.

A PR #387 mantém gate humano explícito de aceite funcional. Consequentemente:

- RB-INC-170 pode ser validado no Preview consolidado;
- #387, #396 e esta PR não devem ser mescladas de forma a contornar o gate;
- qualquer novo SHA após aceite exige nova validação funcional.
