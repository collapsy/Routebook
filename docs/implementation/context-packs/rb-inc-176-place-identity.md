---
id: RB-CTX-176
title: Context Pack do RB-INC-176 — Place Identity destination-agnostic
description: Delimita normalização neutra, reconciliação conservadora e proteção de external identity para RouteBook Anywhere.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-02"
last_updated: "2026-09-02"
authors: [RouteBook Team]
tags: [implementation, context-pack, identity, reconciliation, routebook-anywhere]
related_documents: [RB-INC-176, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-INC-148, RB-INC-156, RB-INC-175]
prerequisites: [RB-INC-175]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-176 — Place Identity destination-agnostic

## Missão

Remover vocabulário regional da identidade de Place e impedir matches frouxos entre candidatos externos e Places canônicos.

## Invariantes

- Place canônico continua distinto de candidato externo;
- external reference é evidência de identidade, não conteúdo editorial;
- nome sozinho não basta a longa distância;
- categoria incompatível nunca é match;
- endereço divergente é evidência contrária quando ambos existem;
- proximidade não funde negócios vizinhos sem evidência nominal/endereço;
- `confidence` do Provider não é rating;
- Place Discovery feed não pode reintroduzir heurística regional paralela;
- ausência de evidência suficiente permanece ausência de match;
- nenhum token regional específico pode ser necessário.

## Testes mínimos

- Pipa com sufixo nominal;
- Florianópolis com sufixo local sem stopword especial;
- nome comum em cidades distintas;
- duas filiais homônimas próximas com endereços diferentes;
- endereço idêntico + proximidade;
- alias de praia próximo;
- alias distante rejeitado;
- external reference vinculada;
- mesma external identity protegida entre Destinations;
- Quality Provider não reutiliza external ID entre targets.

## Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

CI é evidência canônica. Merge e qualquer mudança de Production permanecem gates humanos.
