---
id: RB-INC-181
title: Geocodificação automática da Hospedagem ao salvar
description: Faz nome/endereço da Hospedagem resolverem coordenadas server-side no fluxo normal, sem exigir latitude/longitude do usuário.
document_type: implementation-increment
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-07"
authors: [RouteBook Team]
tags: [implementation, trip, accommodation, geocoding, map, routebook-anywhere]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-DATA-002, RB-DATA-003, RB-OBS-001, RB-INC-180, RB-CTX-181]
prerequisites: [RB-INC-180]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-181 — Geocodificação automática da Hospedagem ao salvar

## 1. Contexto

- Issue: #430.
- Branch: `codex/rb-inc-181-accommodation-auto-geocoding`.
- Base de trabalho empilhada: RB-INC-180 em `0d4fa049e2074c925568efb8fc93d273372d1390`; após a integração da PR #429, esta branch deve ser reconciliada com `main`.
- O incremento histórico associado à issue #45 introduziu `Accommodation.coordinate`, geocoding pontual e fallback manual, porém separou “salvar hospedagem”, “buscar localização” e “confirmar coordenadas”.
- A validação humana do RouteBook Anywhere em Gramado em 2026-09-07 mostrou que o usuário pode salvar nome/endereço e continuar sem coordenadas, deixando mapa e distâncias sem âncora espacial.

## 2. Resultado vertical

O usuário informa nome e/ou endereço da Hospedagem e usa uma única ação de salvar. O servidor tenta resolver automaticamente a localização usando o Geocoder existente e o contexto do Destination da Trip. Quando a resolução é válida, as coordenadas são persistidas junto da Hospedagem e o mapa passa a utilizá-las após a atualização da página.

Latitude e longitude deixam de fazer parte do fluxo primário. A edição manual permanece somente como fallback avançado.

## 3. Decisões de desenho

### 3.1 Geocoding pertence ao submit, não à digitação

O fluxo reutiliza a porta `Geocoder` e o adapter Nominatim já existentes para uma consulta pontual iniciada por “Salvar hospedagem”. Não existe autocomplete por tecla e nenhum Provider novo é introduzido.

### 3.2 Query contextual e destination-agnostic

A consulta utiliza a melhor evidência textual disponível:

1. endereço + Destination quando houver endereço;
2. nome da Hospedagem + Destination quando houver somente nome.

O Destination vem da própria Trip. Nenhuma cidade/região é codificada como regra especial.

### 3.3 Coordenadas antigas não podem sobreviver a uma localização alterada

- se nome/endereço relevantes não mudaram e já há coordenadas, elas são preservadas sem nova chamada externa;
- se a localização textual muda, o servidor tenta resolver novamente;
- se a resolução falha ou não encontra resultado, os dados textuais podem ser preservados, porém coordenadas antigas incompatíveis não são mantidas silenciosamente;
- nenhuma falha inventa coordenadas.

### 3.4 Degradação recuperável

Indisponibilidade, timeout ou ausência de resultado não bloqueiam o restante da Viagem. A Hospedagem textual permanece salva sem coordenadas, a interface informa que a localização ainda precisa ser confirmada e oferece fallback manual avançado.

## 4. UX

Fluxo primário:

1. Nome da hospedagem;
2. Endereço;
3. Salvar hospedagem;
4. resolução automática server-side;
5. feedback “localização encontrada” ou aviso recuperável;
6. mapa/distâncias passam a usar a coordenada persistida quando disponível.

O bloco separado “Encontrar coordenadas pelo endereço” deixa de fazer parte da jornada principal. Latitude/longitude ficam dentro de uma área avançada, não como requisito normal. O estado vazio do mapa orienta revisar nome/endereço da Hospedagem e nunca pede coordenadas ao usuário como caminho primário.

## 5. Escopo

```text
apps/web/app/viagens/[tripId]/hospedagem/actions.ts
apps/web/app/viagens/[tripId]/hospedagem/actions.test.ts
apps/web/app/viagens/[tripId]/hospedagem/geocoding-actions.ts
apps/web/app/viagens/[tripId]/hospedagem/geocoding-state.ts
apps/web/app/viagens/[tripId]/hospedagem/page.tsx
apps/web/components/accommodation-form.tsx
apps/web/components/accommodation-form.test.tsx
apps/web/components/trip-map.tsx
apps/web/components/trip-map.test.tsx
apps/web/e2e/authenticated-trips.spec.ts
apps/web/lib/accommodation-geocoding.ts
apps/web/lib/accommodation-geocoding.test.ts
apps/web/lib/geocoding.ts
docs/implementation/increments/rb-inc-181-accommodation-auto-geocoding.md
docs/implementation/context-packs/rb-inc-181-accommodation-auto-geocoding.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Mudança fora desses caminhos exige atualização deste incremento antes do commit.

## 6. Fora de escopo

- autocomplete de Hospedagem por tecla;
- recomendação/reserva de hotéis;
- múltiplas hospedagens;
- seleção de ponto diretamente no mapa;
- rota, trânsito ou ETA;
- introduzir Google Places como novo Provider da Hospedagem;
- alterar conceitos de Domain;
- migration de banco sem necessidade comprovada;
- ativação ou alteração de Production;
- merge na `main` sem autorização humana.

## 7. Critérios de aceite

- [ ] nome + endereço podem ser salvos sem latitude/longitude;
- [ ] endereço válido é geocodificado automaticamente no submit;
- [ ] somente nome usa também o contexto do Destination para desambiguar;
- [ ] coordenadas resolvidas são persistidas e sobrevivem a reload;
- [ ] mapa passa a exibir a Hospedagem sem etapa manual adicional;
- [ ] estado vazio do mapa não instrui o usuário a informar coordenadas no fluxo normal;
- [ ] distâncias existentes passam a usar a coordenada persistida;
- [ ] dados textuais inalterados com coordenada válida não disparam nova geocodificação;
- [ ] mudança de localização textual não mantém coordenadas antigas incompatíveis;
- [ ] no-result/timeout/falha não inventam localização e degradam com feedback recuperável;
- [ ] remover Hospedagem continua funcionando;
- [ ] latitude/longitude não aparecem no fluxo primário;
- [ ] fallback manual permanece disponível de forma avançada;
- [ ] Nominatim não é usado como autocomplete;
- [ ] Pipa, Gramado e qualquer outro Destination usam o mesmo contrato;
- [ ] testes cobrem query contextual, sucesso, preservação, no-result e erro;
- [ ] E2E desktop/mobile cobre Hospedagem → salvar → contexto espacial disponível;
- [ ] Documentation e Engineering Validation verdes no mesmo SHA;
- [ ] Vercel Preview valida a jornada real antes da integração;
- [ ] Production permanece intocada;
- [ ] merge permanece gate humano explícito.

## 8. Riscos

| Risco | Mitigação |
| --- | --- |
| endereço ambíguo | Destination entra na consulta e resultado inválido não é aceito |
| coordenada antiga apontar para outro lugar | mudança textual força nova resolução ou limpa a coordenada |
| Provider indisponível bloquear viagem | Hospedagem textual continua utilizável e fallback manual permanece disponível |
| abuso de Nominatim | somente uma ação explícita de submit inicia geocoding; nunca por tecla |
| detalhe técnico dominar UX | latitude/longitude ficam em área avançada |
| regra regional reaparecer | consulta deriva exclusivamente da Trip e do texto informado |

## 9. Rollback

A mudança não exige migration. Rollback restaura o fluxo separado da implementação histórica da issue #45; coordenadas já persistidas permanecem dados válidos da Hospedagem.
