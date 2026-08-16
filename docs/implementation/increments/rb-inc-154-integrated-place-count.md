---
id: RB-INC-154
title: Contagem Integrada de Places e Descobertas
description: Torna explícita a cobertura total da busca ao somar Places publicados e candidatos externos novos, preservando a separação semântica entre catálogo e descoberta.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors: [RouteBook Team]
tags: [implementation, pipa, guide, discovery, overture, count, ux]
related_documents: [RB-CORE-0004, RB-INC-139, RB-INC-153, RB-CTX-154]
prerequisites: [RB-INC-139, RB-INC-153]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-154 — Contagem Integrada de Places e Descobertas

## 1. Contexto

Issue: `#357`.

Branch: `codex/rb-inc-154-integrated-place-count`.

Baseline: `1d222addb87912ca229bee16290e90af46e6282e`.

Após a entrega do RB-INC-153 em Production, a navegação real continuou transmitindo
que a busca estava limitada a 30 Places. A descoberta Overture já é executada por
padrão, mas o heading principal usa somente `filteredPlaces.length`; os candidatos
externos aparecem numa seção posterior e não participam da contagem mais proeminente.

## 2. Objetivo

Apresentar a cobertura total da sessão sem misturar estados canônicos:

- somar Places publicados e candidatos externos novos no total principal;
- explicar a composição do total imediatamente abaixo;
- preservar candidatos externos como não publicados;
- degradar honestamente quando a fonte estiver oculta ou indisponível.

## 3. Decisão de experiência

Quando a descoberta externa estiver ativa e disponível, o topo apresenta:

- `N opções para explorar`;
- `X publicadas no RouteBook + Y descobertas atualizadas no Overture`.

Quando a descoberta estiver oculta ou a fonte falhar, o topo apresenta somente o
número de Places publicados. A aplicação não soma correspondências retidas,
referências já vinculadas ou qualquer candidato que não esteja efetivamente visível.

O mapa continua representando exclusivamente o conjunto publicado e filtrado. A
contagem integrada comunica cobertura da página, não equivalência canônica.

## 4. Escopo

- copy e cálculo da contagem principal em Discovery;
- contratos E2E da contagem com e sem descoberta externa;
- documentação e Registry.

## 5. Fora de escopo

- publicar ou promover candidatos automaticamente;
- inserir candidatos externos no mapa canônico;
- persistir resultados de leitura;
- alterar Overture, raio, limite, reconciliação ou categorias;
- adicionar Provider, dependência, migration ou secret.

## 6. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/accommodation-proximity.spec.ts
docs/implementation/increments/rb-inc-154-integrated-place-count.md
docs/implementation/context-packs/rb-inc-154-integrated-place-count.md
docs/registry.md
```

## 7. Critérios de aceite

- [ ] total principal soma apenas resultados publicados e externos efetivamente visíveis;
- [ ] composição entre catálogo e descoberta aparece junto ao total;
- [ ] quantidade externa não é fixada em teste;
- [ ] descoberta oculta ou indisponível não produz total enganoso;
- [ ] mapa e lista publicados preservam o mesmo significado;
- [ ] candidatos externos continuam explicitamente não publicados;
- [ ] CI completa passa no mesmo SHA.

## 8. Testes obrigatórios

- E2E comprova o heading integrado quando Overture retorna candidatos;
- E2E comprova a composição `30 publicadas + N descobertas`;
- E2E preserva filtros, mapa canônico e descoberta externa;
- E2E de proximidade deixa de exigir o heading ambíguo anterior;
- format, docs, lint, typecheck, testes, build e Playwright.

## 9. Riscos e mitigação

- **total externo variável:** os testes validam a composição e não um número Overture fixo;
- **confusão canônica:** copy usa `publicadas` e `descobertas`, e a seção externa mantém disclosure;
- **falha do Provider:** o total publicado continua utilizável e a mensagem de indisponibilidade permanece.

## 10. Rollback

Reverter o commit restaura o heading anterior. Não há migration, escrita de dados ou
efeito de Provider para desfazer.

