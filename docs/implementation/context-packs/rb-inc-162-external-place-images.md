---
id: RB-CTX-162
title: Context Pack do RB-INC-162 — Imagens governadas para Places externos
description: Delimita o enriquecimento visual read-only dos candidatos externos usando Wikimedia Commons com correspondência segura, Provenance e fallback.
document_type: implementation-context-pack
owner: Place Catalog and Integrations
status: Draft
version: "0.1.0"
created: "2026-08-20"
last_updated: "2026-08-20"
authors: [RouteBook Team]
tags: [implementation, context-pack, external-places, images, wikimedia-commons, provenance]
related_documents: [RB-INC-162, RB-CORE-0004, RB-PRD-002, RB-ARC-003, RB-INC-142, RB-INC-143, RB-INC-148, RB-INC-156, RB-INC-158, RB-INC-161, RB-INC-163, RB-INC-136]
prerequisites: [RB-INC-142, RB-INC-143, RB-INC-148, RB-INC-156]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-162 — Imagens governadas para Places externos

## 1. Missão

Permitir que candidatos externos da Discovery tenham contexto visual real quando o Wikimedia Commons sustentar uma correspondência segura, sem converter mídia em estado canônico e sem degradar a Discovery quando a Fonte estiver indisponível.

Também preservar a ação `Calcular rota real` do candidato externo durante o aceite: com hospedagem geocodificada a origem permanece a hospedagem; sem hospedagem, a origem é omitida para o Google Maps usar a localização atual/relevante disponível, sem mudar o destino semântico do RB-INC-163.

## 2. Unidade de trabalho

- issue: `#377`;
- branch: `codex/rb-inc-162-external-place-images`;
- baseline original: `474ad3c8b23c10605f4223e32cc75fb7169bd947`;
- `main` atual após RB-INC-163: `f49813a57e03f73aba3d768da02c0d4bc3383084`;
- ambiente de aceite: Vercel Preview;
- merge e Production são gates humanos separados.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/architecture/integration-architecture.md`;
5. `docs/implementation/increments/rb-inc-142-organic-place-ingestion.md`;
6. `docs/implementation/increments/rb-inc-143-place-images.md`;
7. `docs/implementation/increments/rb-inc-148-external-place-promotion.md`;
8. `docs/implementation/increments/rb-inc-156-unified-place-discovery.md`;
9. `docs/implementation/increments/rb-inc-158-pipa-visual-coverage.md`;
10. `docs/implementation/increments/rb-inc-163-google-maps-destination-reliability.md`;
11. `docs/implementation/increments/rb-inc-162-external-place-images.md`.

## 4. Contratos preservados

- `ExternalPlaceCandidate` continua vindo do `PlaceSearchPort`/Overture;
- Wikimedia fornece apenas mídia e Provenance de mídia;
- busca de imagem não cria write;
- `Place.primaryImage` continua representando somente asset controlado de Place publicado;
- candidato externo não é Place canônico;
- Recommendation, Saved Place, Decision e Itinerary não dependem de imagem;
- promoção de candidato continua explícita e revalidada server-side por RB-INC-148;
- links de rota continuam usando a política de destino semântico do RB-INC-163;
- `buildGoogleMapsDirectionsUrl` pode omitir `origin`, mas nunca deixa de validar a coordenada do destino;
- no card externo, ausência de hospedagem não remove o link de rota;
- mapa e lista continuam representando o mesmo conjunto de lugares, independentemente de mídia;
- falha de Provider não remove o conteúdo factual do card.

## 5. Política de match

```text
metadata Wikimedia válida + autor + licença reutilizável
  -> classificar identidade
       secure     -> preview elegível
       ambiguous  -> fallback
       rejected   -> fallback
```

`secure` exige todos os tokens distintivos do nome do Place e contexto local de Pipa/Tibau do Sul na metadata. Não usar coordenada aproximada como prova suficiente de identidade neste incremento.

## 6. Fronteiras HTTP

`GET /api/place-image-preview`:

- suporta somente `destinationId=pipa-rn-br`;
- valida nome e coordenadas dentro do recorte regional permitido;
- consulta o adapter Wikimedia read-only;
- sucesso devolve somente metadata necessária à apresentação;
- miss seguro devolve `404` cacheável;
- falha externa devolve `503` sem derrubar a Discovery.

`GET /api/place-image-preview/file`:

- aceita somente `https://upload.wikimedia.org/wikipedia/commons/thumb/...`;
- não segue redirect;
- aceita somente JPEG, PNG ou WebP;
- limita payload a 3 MiB;
- devolve bytes com cache CDN;
- qualquer desvio falha fechado.

## 7. UX

- card externo nasce com estado textual `Fotografia sob demanda`;
- lookup começa somente ao aproximar do viewport;
- durante lookup: `Buscando fotografia…`;
- sucesso: foto + atribuição + licença + `Wikimedia Commons` + `Ver fonte`;
- miss/erro: fallback visual padrão do RouteBook;
- nenhuma ausência de imagem remove nome, endereço, distância, fonte Overture, rota ou ação de curadoria;
- `Calcular rota real` fica sempre disponível no card externo;
- com hospedagem, o Maps recebe a hospedagem como `origin`;
- sem hospedagem, `origin` é omitido e o Maps usa a origem disponível no aparelho ou solicita uma origem ao usuário.

## 8. Caminhos permitidos

Somente os caminhos declarados em RB-INC-162.

O helper transitório `.github/workflows/rb-inc-162-assembly-helper.yml`, se usado, fica limitado ao merge não destrutivo de `origin/main`, substituições exatas previamente verificadas no arquivo de Discovery, reconciliação de duas linhas do Registry, formatação e auto-remoção. Ele não pode permanecer na PR final.

## 9. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation Validation e Engineering Validation precisam passar no mesmo SHA. O Preview Vercel deve estar `READY` para exatamente esse SHA antes do aceite funcional.

A regressão de rota precisa incluir teste unitário do helper e E2E de candidato externo sem hospedagem, verificando ausência do parâmetro `origin` e preservação do destino semântico.

## 10. Proibições

- não fazer scraping;
- não ativar Provider pago;
- não criar secret;
- não persistir preview ou metadata Wikimedia em Place/candidato;
- não criar migration;
- não publicar/promover automaticamente;
- não trocar a Fonte factual Overture pela Wikimedia;
- não exibir match `ambiguous` ou `rejected` como fotografia do Place;
- não remover fallback acessível;
- não alterar os destinos de rota do RB-INC-163;
- não substituir ausência de hospedagem por uma coordenada arbitrária de origem;
- não ampliar o fallback de origem para outras telas neste incremento;
- não concluir M8 por evidência técnica;
- não mergear nem promover Production sem gate humano separado.

## 11. Handoff

Relatar arquivos alterados, política de match, limites de rede/cache, estados de UI, comportamento de rota com e sem hospedagem, testes efetivamente executados, SHA final, CI, Preview, riscos residuais e qualquer candidato que permaneça sem fotografia por falta de evidência segura.
