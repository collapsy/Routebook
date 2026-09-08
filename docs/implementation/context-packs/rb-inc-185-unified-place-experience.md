---
id: RB-CTX-185
title: Context Pack do RB-INC-185 — experiência unificada de Lugar provider-first
description: Delimita a remoção da taxonomia publicado/externo da experiência, preservando identidade, reconciliação e Provenance como detalhes internos.
document_type: implementation-context-pack
owner: Place Discovery and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-07"
authors: [RouteBook Team]
tags: [implementation, context-pack, places, discovery, routebook-anywhere, provider-first, ux]
related_documents: [RB-INC-185, RB-CORE-0004, RB-DOM-001, RB-ARC-003, RB-INC-164, RB-INC-175, RB-INC-182, RB-INC-183, RB-INC-184]
prerequisites: [RB-INC-184]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-185 — experiência unificada de Lugar provider-first

## 1. Missão

Fazer a interface refletir a linguagem canônica da Bible: **Lugar é uma opção descoberta ou catalogada**. O viajante não deve precisar entender se um registro já foi materializado no banco, se veio diretamente de Provider ou se passou por reconciliação interna.

## 2. Unidade de trabalho

- issue: #440;
- branch: `codex/rb-inc-185-unified-place-experience`;
- base: `dd996a4dcb99fc2068a63bc0c74b54ca1c282632` do RB-INC-184 / PR #439;
- cadeia empilhada: #431 -> #434 -> #436 -> #439 -> RB-INC-185;
- Production e merge continuam gates humanos.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004 — definição constitucional de Lugar;
3. `docs/README.md`;
4. RB-DOM-001 — Lugar, Provenance, Recommendation e identidade;
5. RB-ARC-003 — Ports/Adapters e fronteira de Providers;
6. RB-INC-164 — identidade única external-first;
7. RB-INC-175 — Region accommodation-first;
8. RB-INC-182 — categorias contextuais;
9. RB-INC-183 — mapa com Discovery;
10. RB-INC-184 — Sugestões usando Discovery;
11. RB-INC-185 / este Context Pack.

## 4. Diagnóstico

A stack 183/184 tornou destinos zero-seed utilizáveis, mas expôs detalhes internos na UX:

- `Places canônicos`;
- `Places publicados`;
- `Descoberta externa`;
- `Candidato externo`;
- `Curado pelo RouteBook`;
- `Curado + atualizado`;
- `somente leitura` por origem;
- ações de `promoção/publicação`.

Essa taxonomia induz o usuário a acreditar que existem duas classes de Lugar. A direção de produto confirmada é diferente: a cobertura é provider-first e o lifecycle interno não é parte da jornada.

## 5. Invariantes

- para o usuário existe apenas `Lugar`;
- Fonte/Provenance não é tipo de Lugar;
- dados externos preservam Provenance;
- identidade externa não substitui identidade interna quando uma escrita exigir referência canônica;
- reconciliação e deduplicação continuam fail-closed para ambiguidade;
- leitura não deve criar Decision, SavedPlace ou Activity;
- ação explícita pode materializar identidade interna sem expor essa etapa;
- não inventar dados ausentes;
- falha de Provider não redefine o domínio;
- nenhum hardcode de Destination;
- nenhum Provider novo, billing, secret ou Production.

## 6. Linguagem de experiência autorizada

Usar:

- Lugar / Lugares;
- Fonte;
- dados disponíveis;
- informações ainda não confirmadas;
- distância em linha reta;
- sugestão / lugar para considerar;
- cobertura temporariamente indisponível.

Não usar como taxonomia de UI:

- publicado;
- canônico;
- externo;
- candidato;
- curado;
- promovido;
- somente leitura por origem.

Termos técnicos podem permanecer em tipos, logs e contratos internos quando necessários.

## 7. Mapa

`TripMapPointKind` pode continuar distinguindo internamente estados para estilo/testes, mas todos os kinds de Place devem resolver para o rótulo visível `Lugar`.

A descrição da visão geral deve falar sobre `Lugares próximos` e disponibilidade da fonte, sem contagens separadas de canônicos/externos.

## 8. Discovery

Cards canônicos e candidatos reconciliados podem continuar utilizando componentes/ações diferentes internamente, porém devem apresentar a mesma identidade visual de Lugar.

Regras:

- categoria e nome são primários;
- Fonte é metadado secundário;
- remover badges editoriais;
- remover CTA de promoção/curadoria;
- salvar candidato pode usar materialização lazy já existente em `saveExternalPlaceAction`;
- mensagens de erro devem falar sobre `Lugar`/`fonte`, não sobre promoção editorial quando a jornada for salvar/explorar.

## 9. Sugestões

A coleção proveniente de Discovery é apresentada como `Lugares para considerar agora`.

Limitações devem refletir somente incerteza factual:

- preço não confirmado;
- avaliação não confirmada;
- horário/disponibilidade não confirmados;
- distância em linha reta.

Não usar a ausência de publicação interna como limitação percebida pelo usuário.

## 10. Compatibilidade temporária de aplicação

O código atual ainda possui `RecommendationTarget` e ações que dependem de `PlaceId` persistido/publicado. Este incremento não falsifica que essa restrição desapareceu.

Onde uma ação ainda não estiver disponível para um Lugar recém-descoberto, a UX não deve justificar isso com `porque é externo`; deve encaminhar para a experiência de Lugar/Salvar, enquanto evolução posterior elimina a dependência técnica.

## 11. Caminhos permitidos

Os caminhos autorizados são os declarados no RB-INC-185. Qualquer caminho adicional exige atualização prévia do incremento.

## 12. Testes mínimos

- `TripMap` rotula `published-place` e `external-place` como `Lugar`;
- descrição do mapa não usa taxonomia editorial;
- Discovery não exibe badges/CTA de promoção;
- sugestão zero-seed não exibe `Descoberta externa`/`Places publicados`;
- Provenance continua visível;
- salvar Lugar vindo de Provider continua funcional;
- regressão de Pipa usa a mesma linguagem;
- E2E valida ausência dos termos antigos nas superfícies principais.

## 13. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation e Engineering Validation devem concluir verdes no mesmo SHA. Preview Vercel deve confirmar a experiência de Gramado sem a distinção publicado/externo.
