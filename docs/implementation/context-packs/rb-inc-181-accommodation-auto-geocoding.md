---
id: RB-CTX-181
title: Context Pack do RB-INC-181 — geocodificação automática da Hospedagem
description: Delimita a evolução do fluxo de Hospedagem para resolver coordenadas automaticamente no submit, preservando degradação e fallback manual.
document_type: implementation-context-pack
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-07"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip, accommodation, geocoding, routebook-anywhere]
related_documents: [RB-INC-181, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-DATA-002, RB-DATA-003, RB-OBS-001, RB-INC-180]
prerequisites: [RB-INC-180]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-181 — geocodificação automática da Hospedagem

## 1. Missão

Transformar nome/endereço da Hospedagem em contexto espacial utilizável sem pedir latitude/longitude no fluxo normal.

## 2. Unidade de trabalho

- Issue: #430;
- branch: `codex/rb-inc-181-accommodation-auto-geocoding`;
- base final: `main@a33d9dae75e961b4c1eecb48a26fa2c3e38ce6bf` após integração do RB-INC-180 pela PR #429;
- reconciliação da branch com a base final: `e32d348cb197e48cbe6fc4a4bfc960347fa77c14`;
- merge: gate humano;
- Production: fora de escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible;
3. `docs/README.md`;
4. RB-DOM-001 / RB-DOM-002;
5. RB-ARC-001;
6. RB-DATA-002 / RB-DATA-003;
7. RB-OBS-001;
8. issue #45 e implementação histórica do geocoding de Hospedagem;
9. RB-INC-180 / RB-CTX-180;
10. RB-INC-181 / este Context Pack.

## 4. Invariantes

- Accommodation continua pertencendo à Trip;
- `coordinate` é contexto espacial opcional, não entrada obrigatória do usuário;
- mapa não inventa coordenadas: apenas consome pontos persistidos;
- Provider e payload externo permanecem fora do domínio;
- Nominatim continua consulta pontual, nunca autocomplete;
- Destination é contexto de desambiguação, não regra regional;
- alteração da localização textual não pode preservar silenciosamente coordenada incompatível;
- falha de Provider não elimina a Hospedagem textual nem bloqueia a Viagem;
- latitude/longitude ficam fora do fluxo primário;
- Production e merge permanecem gates humanos.

## 5. Alterações permitidas

Somente os caminhos listados no RB-INC-181.

## 6. Contrato de resolução

### Entrada primária

- `accommodationName`;
- `accommodationAddress` opcional;
- Destination canônico da Trip.

### Query

- com endereço: `endereço + Destination`;
- sem endereço: `nome + Destination`;
- strings vazias não geram request;
- localização textual inalterada com coordenada existente não gera request desnecessário.

### Saída

- sucesso: `UpdateAccommodationInput` recebe latitude/longitude resolvidas;
- no-result/falha: `UpdateAccommodationInput` permanece sem coordenadas novas e coordenadas antigas incompatíveis não sobrevivem;
- fallback manual: coordenadas explicitamente fornecidas juntas substituem geocoding automático.

## 7. UX obrigatória

- nome e endereço aparecem como campos normais;
- “Salvar hospedagem” inicia resolução automaticamente;
- usuário não precisa conhecer latitude/longitude;
- localização resolvida tem feedback legível sem expor números técnicos;
- falha tem aviso recuperável e deixa claro que mapa/distâncias podem permanecer indisponíveis;
- fallback manual fica em disclosure avançado;
- remoção da Hospedagem continua explícita pelo contrato existente de campos vazios.

## 8. Testes mínimos

- query com endereço + Destination;
- query com somente nome + Destination;
- localização inalterada preserva coordenada e não chama Provider;
- localização alterada + sucesso troca coordenada;
- localização alterada + no-result não mantém coordenada antiga;
- Provider error/timeout degrada sem coordenada inventada;
- coordenadas manuais válidas bypassam Provider;
- remoção não chama Provider;
- UI primária não mostra latitude/longitude;
- E2E prova save de Hospedagem e mapa disponível.

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

CI e Vercel Preview do mesmo SHA são as evidências canônicas.

## 10. Gates humanos remanescentes

- validar no Vercel Preview real que nome/endereço da Hospedagem resolvem localização sem coordenadas manuais e liberam o contexto espacial;
- qualquer mudança em Production;
- qualquer mudança de Provider/comercialização não prevista;
- integrar RB-INC-181 na `main`.

## 11. Handoff

Relatar SHA final, arquivos alterados, testes reais, comportamento de sucesso/degradação, uso do Provider existente, Preview, riscos e gates humanos restantes.
