---
id: RB-INC-153
title: Guia Operacional de Pipa Antes da Viagem
description: Amplia a descoberta visível de Places, adiciona contexto acionável e oferece navegação externa para mapa, fotos e rotas reais sem ativar Provider pago.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors: [RouteBook Team]
tags: [implementation, pipa, guide, discovery, overture, maps, routes, images, m8]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-DOM-001, RB-ADR-012, RB-INC-136, RB-INC-139, RB-INC-141, RB-INC-142, RB-INC-143, RB-INC-148, RB-CTX-153]
prerequisites: [RB-INC-139, RB-INC-141, RB-INC-142, RB-INC-143, RB-INC-148]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-153 — Guia Operacional de Pipa Antes da Viagem

## 1. Contexto

Issue: `#355`.

Branch: `codex/rb-inc-153-pipa-operational-guide`.

Baseline: `c74e82a6a8c35a8a4b2672be03e44e28eef09693`.

Durante navegação real de preparação para a viagem de Pipa, de 22 a 29 de agosto de 2026, foram identificados quatro gaps:

- a superfície principal aparenta estar limitada aos 30 Places publicados;
- somente seis Places possuem foto real curada e os demais usam fallback vazio;
- a distância disponível é geodésica, não distância por rota;
- o detalhe de Place ainda oferece pouca ajuda operacional antes de sair.

O feedback é backlog real de produto relacionado ao RB-INC-136, mas não valida nem invalida qualquer hipótese do M8. Evidência humana da Fase B continua separada.

## 2. Objetivo

Transformar Discovery e detalhes de Place em um guia imediatamente mais útil antes da viagem, sem aguardar ativação de billing, secret ou Provider pago:

1. consultar candidatos Overture por padrão;
2. manter catálogo publicado e candidatos externos explicitamente separados;
3. comunicar a cobertura total disponível na sessão;
4. enriquecer os cards com acesso a mapa, fotos e rota real;
5. preservar distância geodésica como estimativa claramente rotulada;
6. substituir o vazio visual por capa de categoria acessível, explicitamente não fotográfica.

## 3. Decisões

### 3.1 Catálogo e descoberta

Os 30 Places publicados continuam sendo o catálogo canônico. Candidatos Overture aparecem por padrão em uma seção separada e read-only.

A experiência não:

- publica candidato automaticamente;
- cria Place canônico durante leitura;
- mistura candidato externo no mapa canônico;
- transforma disponibilidade do Provider em requisito para abrir o catálogo.

A pessoa pode ocultar as descobertas atualizadas. Falha externa preserva os Places publicados.

### 3.2 Distância e rota

O RouteBook continua calculando e exibindo distância geodésica em linha reta. Esse valor não será renomeado como rota.

Para deslocamento operacional, links públicos do Google Maps são montados de forma determinística:

- busca por nome/endereço para consultar mapa e fotos atuais;
- directions com coordenadas da Hospedagem e do Place;
- modo a pé na listagem;
- modos a pé e de carro no detalhe.

A distância, duração e trânsito da rota são calculados e exibidos pelo serviço externo no momento em que a pessoa abre o link. O RouteBook não lê, persiste ou promove esses dados como canônicos.

### 3.3 Limite do RB-ADR-012

O RB-ADR-012 permanece `Proposed`. Este incremento não:

- aceita ou altera o ADR;
- ativa Maps JavaScript API, Places API ou Routes API;
- cria API key;
- habilita billing;
- adiciona SDK;
- faz chamada autenticada;
- persiste dados do Google.

Usar uma URL pública de navegação externa não equivale a ativar Google Maps Platform como adapter do RouteBook.

### 3.4 Cobertura visual

Os seis assets reais e licenciados permanecem inalterados. Quando não existe foto curada, a UI apresenta uma capa de categoria por CSS com:

- identidade visual para praia, natureza, gastronomia ou vida noturna;
- texto `Imagem não disponível`;
- disclosure `Capa de categoria — não é foto do local`.

A capa não afirma representar o Place e não mascara a falta de fotografia real. O link para o Maps oferece uma alternativa para consultar fotos atuais fora do RouteBook.

## 4. Escopo

- descoberta Overture ativa por padrão com opt-out;
- contagem separada de catálogo e descobertas;
- links de busca e directions do Google Maps;
- ações de rota na listagem e no detalhe;
- fallback visual por categoria sem falsa fotografia;
- testes unitários de URL;
- cobertura E2E da entrada principal;
- documentação e Registry.

## 5. Fora de escopo

- ampliar o número de Places canônicos por publicação automática;
- ingerir fotos, ratings, horários, preços ou disponibilidade do Google;
- calcular rota server-side;
- ativar billing, secret ou API paga;
- usar conteúdo externo sem Provenance;
- substituir a curadoria de imagens do RB-INC-143;
- concluir a Fase B/M8 sem evidência humana real.

## 6. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/lugares/place-discovery.module.css
apps/web/components/place-primary-image.tsx
apps/web/components/place-primary-image.module.css
apps/web/lib/google-maps-links.ts
apps/web/lib/google-maps-links.test.ts
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/place-details.spec.ts
docs/implementation/increments/rb-inc-153-pipa-operational-guide.md
docs/implementation/context-packs/rb-inc-153-pipa-operational-guide.md
docs/registry.md
```

Arquivo adicional indispensável deve ser registrado aqui e explicado na PR antes da alteração.

## 7. Critérios de aceite

- [ ] Discovery consulta candidatos Overture por padrão;
- [ ] falha externa mantém catálogo publicado utilizável;
- [ ] catálogo e candidatos permanecem separados e rotulados;
- [ ] contagens de catálogo e descobertas são visíveis;
- [ ] Place publicado oferece detalhes, mapa/fotos e rota real quando possível;
- [ ] candidato externo oferece categoria, endereço disponível, Provenance e ações externas;
- [ ] linha reta nunca é apresentada como rota;
- [ ] detalhe oferece rota a pé e de carro quando a Hospedagem possui coordenadas;
- [ ] fallback visual declara não ser foto do local;
- [ ] nenhum secret, SDK, API paga ou persistência Google é introduzido;
- [ ] documentação e validações de engenharia passam no mesmo SHA.

## 8. Testes obrigatórios

- URL de busca preserva nome/endereço e host esperado;
- URL de directions preserva origem, destino e modo;
- coordenada inválida é recusada;
- E2E comprova 30 Places publicados e descoberta externa visível por padrão;
- E2E comprova links de mapa/fotos e rota real;
- E2E comprova mapa canônico sincronizado ao catálogo publicado;
- testes existentes de mídia preservam asset real e fallback acessível;
- format, docs, lint, typecheck, testes, build e Playwright.

## 9. Riscos e mitigação

- **latência/indisponibilidade do Overture:** exceção degrada para catálogo publicado;
- **candidato desatualizado:** card mantém origem externa e recomenda verificação antes da decisão;
- **confusão entre linha reta e rota:** labels e copy diferenciam as duas métricas;
- **confusão entre capa e foto:** disclosure visível e nome acessível preservados;
- **dependência do Maps:** links são opcionais; dados canônicos continuam disponíveis sem o serviço.

## 10. Rollback

A mudança é somente de aplicação e documentação, sem migration. Reverter o commit restaura a descoberta explícita e o fallback anterior; nenhum dado precisa ser removido.

