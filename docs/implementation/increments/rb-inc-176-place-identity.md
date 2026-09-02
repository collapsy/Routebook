---
id: RB-INC-176
title: Place Identity destination-agnostic e reconciliação conservadora
description: Remove regras regionais de Pipa da identidade de Place e fortalece matching conservador entre Place canônico e candidatos externos.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-02"
last_updated: "2026-09-02"
authors: [RouteBook Team]
tags: [implementation, place-catalog, identity, reconciliation, routebook-anywhere]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-INC-148, RB-INC-156, RB-INC-175, RB-CTX-176]
prerequisites: [RB-INC-175]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-176 — Place Identity destination-agnostic e reconciliação conservadora

## 1. Contexto

- Epic: #411.
- Issue: #416.
- Branch: `codex/rb-inc-176-place-identity`.
- Base: `main@b7ee31f158a5ff7fc03033d6d6da29f45618c092`.
- RB-INC-175 tornou a Discovery espacial e independente de `destinationId` no Provider.
- A identidade ainda contém vocabulário regional de Pipa/Tibau/RN e regras permissivas de alias distante.

## 2. Resultado vertical

A reconciliação passa a depender de evidências combinadas e destination-agnostic:

1. external reference persistida é evidência forte e estável;
2. categoria incompatível bloqueia match;
3. nome é sinal, nunca identidade suficiente a longa distância;
4. endereço, quando presente nos dois lados, pode confirmar ou contradizer o nome;
5. proximidade geográfica limita todos os matches nominais;
6. aliases de categoria permanecem conservadores e limitados espacialmente;
7. homônimos e filiais com endereço divergente não são fundidos;
8. ausência de evidência suficiente continua `new`;
9. `confidence` do Provider não é rating nem evidência de identidade.

## 3. Evidência estruturada

`ExternalPlaceReconciliation` recebe evidência opcional e estruturada:

- external reference;
- categoria;
- tipo de match nominal;
- endereço;
- distância;
- tokens distintivos compartilhados quando aplicável.

`reason` continua sendo explicação legível; a evidência evita depender de texto livre para diagnóstico e testes.

## 4. Normalização

São permitidos apenas tokens linguísticos estruturais e descritores genéricos de categoria.

É proibido remover tokens por pertencerem a uma cidade, estado, país ou região específica.

Pipa continua apenas como fixture/regressão.

## 5. Place Quality

O matching de sinais de qualidade segue a mesma postura conservadora:

- sem stopwords regionais;
- nome exato exige proximidade forte;
- endereço de Provider, quando disponível, participa da identidade;
- endereço divergente impede que filiais homônimas sejam tratadas como a mesma identidade;
- um external ID não pode alimentar dois targets na mesma execução;
- rating/popularity permanecem sinais de qualidade, não confiança de identidade.

## 6. Persistência

A constraint `place_external_references_provider_external_id_unique` já impede reutilização de `provider + externalId`.

O serviço de promoção continua falhando fechado quando essa identidade já pertence a outro Destination.

Nenhuma migration é necessária.

## 7. Escopo

```text
modules/place-catalog/src/external-place.ts
modules/place-catalog/src/external-place.test.ts
apps/web/lib/place-quality-provider.ts
apps/web/lib/place-quality-provider.test.ts
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/lib/place-discovery-feed.test.ts
apps/web/lib/place-discovery-feed.ts
packages/database/src/place-promotion-service.test.ts
docs/implementation/increments/rb-inc-176-place-identity.md
docs/implementation/context-packs/rb-inc-176-place-identity.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Fora de escopo

- alterar taxonomia canônica;
- auto-merge de candidatos;
- persistir score probabilístico de identidade;
- ativar Provider novo/pago;
- alterar RB-ADR-012;
- mudar configuração regional de busca dos Providers;
- migration;
- Production.

## 9. Critérios de aceite

- [ ] nenhum token de Pipa/Tibau/RN/Brasil necessário ao matching;
- [ ] Pipa permanece regressão;
- [ ] Florianópolis/segundo destino passa sem regra especial;
- [ ] homônimo distante é `new`;
- [ ] filiais homônimas com endereço divergente não são fundidas;
- [ ] texto sozinho não cria identidade fora do limite geográfico conservador;
- [ ] external reference vinculada continua `linked`;
- [ ] evidência estruturada acompanha match quando aplicável;
- [ ] external identity não é reutilizada em promoção ou quality matching;
- [ ] confidence externa não é convertida em rating;
- [ ] Documentation e Engineering verdes no mesmo SHA;
- [ ] merge permanece gate humano.

## 10. Rollback

Sem migration. Reverter os commits restaura a heurística anterior.

## 11. Próximo slice

RB-INC-177 — bootstrap progressivo, observabilidade e degradação destination-agnostic.
