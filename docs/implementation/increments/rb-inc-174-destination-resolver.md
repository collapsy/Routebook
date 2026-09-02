---
id: RB-INC-174
title: Destination Resolver e criação de Viagem destination-agnostic
description: Permite criar Trips a partir de um destino informado pelo usuário, resolvido por uma porta provider-neutral com Provenance explícita e sem hardcode regional.
document_type: implementation-increment
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-01"
last_updated: "2026-09-01"
authors: [RouteBook Team]
tags: [implementation, trip, destination, resolver, routebook-anywhere, destination-bootstrap]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-ADR-012, RB-DATA-002, RB-DATA-003, RB-OBS-001, RB-INC-173, RB-CTX-174]
prerequisites: [RB-INC-173]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-174 — Destination Resolver e criação de Viagem destination-agnostic

## 1. Contexto

- Epic: #411 — M9 / RouteBook Anywhere: Destination Bootstrap.
- Issue: #414.
- Branch: `codex/rb-inc-174-destination-resolver`.
- Base: `main@e56de75a7713e76fe8e8fc51b7d7214af3cac885`.
- O RB-INC-173 removeu Pipa implícita do núcleo de Trip e da reidratação PostgreSQL.
- A criação web ainda contém fixture e texto Pipa-first.
- Existe `Geocoder`/Nominatim legado para Accommodation, mas o servidor público Nominatim não pode virar default por inércia.

## 2. Resultado vertical

O usuário informa um destino textual, datas e hospedagem opcional. A aplicação resolve o texto server-side para um `Destination` canônico e só então cria a Trip.

O fluxo não expõe country code, coordenadas, timezone, Provider ou Provenance como campos técnicos.

## 3. Decisões de desenho

### 3.1 Porta provider-neutral

A camada web introduz `DestinationResolver` como porta de aplicação. O domínio continua recebendo apenas o `Destination` já validado.

Nenhum SDK ou DTO de Provider atravessa para `@routebook/trip-management`.

### 3.2 Adapter inicial governado

O adapter Nominatim:

- é opcional;
- fica desligado por default;
- exige `ROUTEBOOK_DESTINATION_RESOLVER=nominatim`;
- é bloqueado em Production neste incremento;
- usa apenas busca forward, sem autocomplete;
- limita resultados e timeout;
- envia User-Agent identificável;
- preserva attribution/licença;
- não usa `place_id` como referência estável quando existe OSM object id;
- não executa chamadas no domínio.

A ativação live em Preview continua gate humano específico.

### 3.3 Timezone

Timezone é derivado localmente a partir da coordenada usando uma cópia vendorizada e fixada do `@photostructure/tz-lookup 11.6.1`, CC0-1.0.

Esse sinal é aproximado por definição e é registrado na Provenance da resolução. Não há chamada adicional de Provider para timezone.

### 3.4 Ambiguidade

A resolução é conservadora:

- resultado sem identidade espacial válida é descartado;
- tipo incompatível é descartado;
- ausência de candidato resulta em erro recuperável;
- empate material entre candidatos plausíveis não é resolvido silenciosamente;
- nome/texto não é suficiente para inventar identidade.

### 3.5 Provenance

O domínio canônico de Data Governance já define `Data Source` e `Provenance`, mas a implementação física genérica ainda não existe.

Este incremento adiciona uma persistência aditiva e escopada para a evidência da resolução de Destination, sem declarar que implementou o agregado completo de Data Governance.

A evidência armazena:

- Trip;
- Provider;
- referência externa estável quando disponível;
- licença/source URL;
- collectedAt;
- método;
- confidenceLevel;
- bounds e metadados mínimos.

A inserção ocorre na mesma transação de criação da Trip para não existir estado parcial.

## 4. UX

A tela `/viagens/nova` passa a priorizar:

1. Para onde você vai?
2. Quando?
3. Onde vai ficar?
4. Criar meu guia.

O nome da viagem permanece opcional como personalização; quando vazio, a aplicação usa o nome normalizado do Destination.

Pipa deixa de aparecer como destino read-only, default obrigatório ou texto de limitação do MVP.

## 5. Escopo

```text
apps/web/app/viagens/nova/**
apps/web/components/trip-form.tsx
apps/web/lib/destination-resolver.ts
apps/web/lib/destination-resolver.test.ts
apps/web/vendor/tz-lookup.*
apps/web/e2e/authenticated-trips.spec.ts
apps/web/playwright.config.ts
apps/web/eslint.config.mjs
apps/web/app/trip-creation.css
packages/database/src/authenticated-trip-service.ts
packages/database/src/authenticated-trip-service-postgres.test.ts
packages/database/src/schema.ts
packages/database/src/index.ts
packages/database/drizzle/0032_create_trip_destination_provenance.sql
packages/database/drizzle/meta/_journal.json
.env.example
.prettierignore
turbo.json
docs/implementation/increments/rb-inc-174-destination-resolver.md
docs/implementation/context-packs/rb-inc-174-destination-resolver.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Mudança fora desses caminhos exige atualização deste incremento antes do commit.

## 6. Fora de escopo

- Discovery Region;
- descoberta automática de Places;
- geocoding da Accommodation durante a criação;
- Place identity/reconciliation;
- fotos;
- novo ranking;
- bootstrap assíncrono;
- clima/eventos/marés;
- Google Geocoding/Time Zone;
- novo Provider pago;
- billing;
- Production;
- aceitar ou alterar RB-ADR-012;
- implementar Data Governance genérico completo.

## 7. Critérios de aceite

- [ ] tela não contém Destination Pipa fixo;
- [ ] Destination textual é obrigatório e resolvido server-side;
- [ ] Pipa e Florianópolis passam por exatamente o mesmo contrato;
- [ ] nenhum campo interno é pedido ao usuário;
- [ ] Provider fica fora do domínio;
- [ ] resolução produz nome, tipo, país, coordenada e timezone IANA;
- [ ] resultado ambíguo não é escolhido silenciosamente;
- [ ] falha/indisponibilidade não cria Trip parcial;
- [ ] Provenance da resolução é persistida atomicamente;
- [ ] Nominatim fica desligado por default e bloqueado em Production;
- [ ] attribution/licença são preservadas;
- [ ] testes usam fixture explícita, não rede externa;
- [ ] nenhuma ativação de billing/Production;
- [ ] Documentation e Engineering Validation verdes no mesmo SHA;
- [ ] merge continua gate humano.

## 8. Riscos

| Risco | Mitigação |
| --- | --- |
| homônimo errado | matching conservador e estado ambíguo |
| dependência indevida do Nominatim público | adapter opt-in, timeout, rate/call limit de uma resolução por submit e kill switch |
| timezone impreciso | lookup local marcado como aproximado; sem falsa precisão |
| Provenance órfã | mesma transação da Trip |
| implementação especializada virar modelo canônico | tabela escopada documentada como etapa física, não novo agregado |
| fixture de E2E vazar para produto | adapter de teste exige flag dedicada e é bloqueado em Vercel |
| regressão Pipa | Pipa permanece caso de regressão, não default |

## 9. Rollback

A migration é aditiva e a tabela possui FK com cascade para Trip. O código pode ser revertido sem alterar dados canônicos existentes. Nenhuma integração de Production é feita neste incremento.

## 10. Próximo slice

RB-INC-175 deverá usar Destination + Accommodation para construir a Discovery Region e remover o centro fixo de Pipa da descoberta de Places.
