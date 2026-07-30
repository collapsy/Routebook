---
id: RB-CTX-041
title: Context Pack do RB-INC-041
description: Contexto operacional para implementar a experiência acessível de Recommendations contextualizadas.
document_type: implementation-context-pack
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-07-30"
last_updated: "2026-07-30"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - recommendation
  - experience
  - accessibility
related_documents:
  - RB-INC-041
  - RB-INC-040
  - RB-UX-001
  - RB-UX-003
  - RB-UX-005
  - RB-UX-006
  - RB-DS-002
  - RB-DS-003
  - RB-QA-001
  - RB-QA-002
prerequisites:
  - RB-INC-040
next_documents:
  - RB-CTX-042
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-041

## 1. Missão

Implementar a rota contextual de Recommendations, sua composição de aplicação, cards acessíveis e ação de rejeição persistida, sem antecipar Decisions, salvar Place ou adicionar Activity.

## 2. Base validada

- issue: `#86`;
- branch: `feature/rb-inc-041-recommendations-experience`;
- base verde: `190ebd975fa35db4487bc396e1e657755701fee0`;
- PR base: `#90`;
- migration disponível: `0007_create_recommendations`.

## 3. Leitura obrigatória

- `modules/decision-intelligence/**`;
- `modules/traveler-profile/**`;
- `modules/place-catalog/**`;
- `modules/saved-places/**`;
- `modules/trip-management/**`;
- `modules/geo-distance/**`;
- `packages/database/src/recommendation-repository.ts`;
- páginas de Visão Geral, Lugares, Salvos e Roteiro;
- Server Actions e testes existentes;
- RB-UX-001 a RB-UX-006;
- RB-DS-002 e RB-DS-003;
- RB-QA-001 e RB-QA-002.

## 4. Rota e navegação

```text
/viagens/[tripId]/recomendacoes
```

Acesso explícito pela Visão Geral da Trip. Não adicionar item à navegação global.

## 5. Entradas disponíveis

- Trip e ContextVersion;
- TravelerProfile opcional e versionado;
- Accommodation e coordenadas opcionais;
- Places publicados do Destination;
- Saved Places;
- Itinerary opcional e sua version;
- Recommendations persistidas;
- distância geodésica canônica.

## 6. Composição de aplicação

Criar uma função ou serviço server-only que:

1. receba TripId;
2. carregue contratos públicos pelos repositories existentes;
3. resolva DestinationId sem duplicação entre páginas novas;
4. detecte snapshots incompatíveis por versões conhecidas;
5. invalide apenas Recommendations ativas incompatíveis;
6. gere Recommendations determinísticas atuais;
7. reutilize equivalentes persistidas;
8. apresente Recommendations generated;
9. retorne view models sem Score;
10. preserve rejeitadas e invalidadas para feedback e rastreabilidade.

## 7. View model permitido

- RecommendationId e status;
- PlaceId, slug, name, category e summary;
- distância geodésica opcional e descrição explícita;
- Reasons;
- Limitations;
- Confidence qualitativa e bases;
- `isSaved` e `isPlanned`;
- href de detalhes;
- capacidade de ignorar quando `presented`.

O view model não deve conter Score bruto.

## 8. Regras de conteúdo

- usar “Sugestões para esta viagem” ou equivalente claro;
- explicar que o usuário continua no controle;
- usar “Confiança baixa/média/alta” com texto de base;
- usar “Distância em linha reta” quando houver coordenadas;
- usar “Não foi possível considerar...” para limitações;
- não usar “IA recomendou”, “melhor”, “garantido”, estrelas, porcentagens ou linguagem de certeza;
- não afirmar preço, avaliação, funcionamento, disponibilidade, rota, trânsito ou duração.

## 9. Ação Ignorar

- input: TripId e RecommendationId;
- carregar pelo repository com escopo da Trip;
- validar estado `presented`;
- aplicar `rejectRecommendation` com relógio explícito;
- salvar;
- revalidar Visão Geral e Recommendations;
- redirecionar com `ignorada=1`;
- erro recuperável com `erro` sanitizado;
- nenhuma outra persistência é alterada.

## 10. Estados obrigatórios

- `loading.tsx` com estrutura significativa;
- candidatos disponíveis;
- parcial por Contexto incompleto;
- vazio por Destination não coberto ou catálogo sem candidatos;
- erro recuperável;
- rejeitada;
- invalidada;
- atualizada após Contexto incompatível.

## 11. Acessibilidade

- um único `h1` inequívoco;
- cards em lista semântica;
- heading acessível por Place;
- Reasons e Limitations com headings ou labels textuais;
- botão `Ignorar recomendação de {Place}`;
- `role="status"` para sucesso;
- `role="alert"` para erro;
- foco visível herdado ou definido;
- navegação integral por teclado;
- nenhuma informação apenas por cor;
- sem overflow horizontal em 360 px e desktop.

## 12. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/recomendacoes/**
apps/web/app/viagens/[tripId]/page.tsx
apps/web/components/**
apps/web/lib/**
apps/web/e2e/**
apps/web/package.json
modules/decision-intelligence/**
packages/database/src/**
pnpm-lock.yaml
docs/ux/screen-inventory.md
docs/ux/wireframes.md
docs/implementation/increments/rb-inc-041-recommendations-experience.md
docs/implementation/context-packs/rb-inc-041-recommendations-experience.md
docs/implementation/traceability-matrix.md
docs/registry.md
README.md
```

## 13. Caminhos proibidos

- migrations novas;
- schema de Decision;
- módulos de Saved Place ou Itinerary, salvo consumo de contratos;
- Provider externo;
- autenticação;
- workflows permanentes;
- documentos canônicos de domínio sem contradição comprovada.

## 14. Testes obrigatórios

### Unidade/componente

- view model não possui Score;
- card apresenta nome, categoria, resumo, Reasons e Limitations;
- Confidence qualitativa;
- distância presente e ausente;
- estados salvo e planejado;
- estado parcial, vazio, rejeitado, invalidado e erro;
- botão Ignorar acessível;
- semântica de status e alert.

### Playwright desktop/mobile

1. criar Trip;
2. configurar interesses compatíveis;
3. configurar Accommodation com coordenadas;
4. abrir Recommendations pela Visão Geral;
5. verificar ordem e Reasons;
6. verificar ausência de Score, estrelas e porcentagem;
7. ignorar pelo nome acessível;
8. aguardar Server Action e navegação;
9. recarregar;
10. confirmar rejeição persistida e nenhuma alteração em Salvos ou Roteiro.

## 15. Gate

Não criar RB-INC-042 antes de frozen install, supply-chain, format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright desktop/mobile concluírem com sucesso.
