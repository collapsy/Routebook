---
id: RB-CTX-160
title: Context Pack do RB-INC-160 — Guia diário completo da viagem de Pipa
description: Delimita a expansão do guia editorial de Pipa para todos os Dias reais da Viagem preservando estado canônico, rastreabilidade e cálculo externo de rotas.
document_type: implementation-context-pack
owner: Traveler Experience and Place Catalog
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, context-pack, pipa, guide, itinerary, map, mobile]
related_documents: [RB-INC-160, RB-CORE-0004, RB-PRD-002, RB-UX-002, RB-INC-155, RB-INC-157, RB-INC-159, RB-INC-136]
prerequisites: [RB-INC-155, RB-INC-157, RB-INC-159]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-160 — Guia diário completo da viagem de Pipa

## 1. Missão do executor

Transformar o guia editorial de primeiro Dia em uma experiência de viagem completa para Pipa, sem transformar sugestão em estado persistido.

O viajante deve conseguir entender o plano editorial de cada Dia, conferir contexto prático e espacial e decidir explicitamente se deseja levar um Place ao Roteiro pelo compositor do RB-INC-159.

## 2. Incremento

- ID: `RB-INC-160`;
- issue: `#369`;
- branch: `codex/rb-inc-160-pipa-trip-guide`;
- baseline empilhada: `1ea3707f2e8410827be9df26e4e116c828a3f742`;
- base funcional: RB-INC-155, RB-INC-157 e RB-INC-159;
- ambiente de aceite: Vercel Preview;
- Production permanece congelada.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/product/mvp-definition.md`;
5. `docs/ux/user-flows.md`;
6. `docs/implementation/increments/rb-inc-155-pipa-place-practical-guide.md`;
7. `docs/implementation/increments/rb-inc-157-progressive-catalog-itinerary-journey.md`;
8. `docs/implementation/increments/rb-inc-159-place-actions-itinerary-entry.md`;
9. `docs/implementation/context-packs/rb-inc-159-place-actions-itinerary-entry.md`;
10. `docs/implementation/increments/rb-inc-160-pipa-trip-guide.md`;
11. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`.

## 4. Contratos preservados

- Guia editorial não é Itinerary;
- Saved Place não é Activity;
- abrir ou consultar Guia não persiste estado;
- adicionar ao Roteiro continua exigindo ação explícita e escolha de Dia;
- CTA do Guia pode pré-selecionar o Dia sugerido, mas não enviar mutation automaticamente;
- Recommendation não é Decision e Proposal não é estado aplicado sem aceite;
- somente Places publicados podem compor o Guia;
- candidatos externos Overture não recebem papel canônico no Guia;
- cada Place do Guia deve possuir Practical Guide já existente;
- lista e mapa de um Dia devem representar os mesmos Places na mesma ordem;
- distância geodésica deve ser rotulada como linha reta;
- rota e tempo atuais permanecem externos ao RouteBook;
- conteúdo operacional volátil exige confirmação no dia;
- evidência técnica de Preview não substitui evidência humana do M8.

## 5. Regras de UX

- a Visão Geral da Viagem deve oferecer um CTA claro para o Guia sem incorporar oito Dias completos;
- a rota dedicada deve começar por uma visão compacta dos Dias/temas;
- cada Dia deve ser identificável por número, data e tema;
- cada Dia contém duas ou três paradas e pode ser inspecionado sem depender exclusivamente do mapa;
- primeiro Dia preserva contexto de chegada; último Dia preserva contexto de saída;
- cada parada apresenta razão, período, duração, melhor encaixe e alerta principal;
- mapa usa a mesma numeração da lista;
- CTA `Planejar neste Dia` abre Detalhes com `dia=<data>#adicionar-ao-roteiro`;
- mobile deve permitir leitura linear e controles com alvos utilizáveis;
- copy deve afirmar que o Guia é sugestão editorial e não altera o Roteiro.

## 6. Caminhos permitidos

Somente os caminhos declarados no RB-INC-160 podem ser alterados. Novo caminho deve ser documentado no incremento antes da implementação.

## 7. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/trip-day-guide.spec.ts e2e/place-actions.spec.ts e2e/itinerary.spec.ts
```

Engineering Validation e Documentation Validation devem concluir no mesmo SHA.

O aceite de produto exige Preview Vercel READY do head final do RB-INC-160 contendo também o RB-INC-159 empilhado.

## 8. Proibições

- não persistir Guia como Activity;
- não auto-salvar Place ao ler ou planejar pelo Guia;
- não autoaplicar Recommendation, Decision ou Proposal;
- não criar Place novo neste incremento;
- não usar candidato externo não publicado como parada editorial;
- não introduzir Provider de rotas, API paga, SDK ou secret;
- não persistir dados do Google Maps como canônicos;
- não tratar distância em linha reta como rota ou tempo;
- não inventar Dia além do período real da Viagem;
- não declarar eventos, preços, horários, maré, clima ou disponibilidade como atuais sem fonte em tempo real;
- não fazer merge sem autorização humana explícita;
- não promover Production sem autorização humana separada para o release final.

## 9. Handoff

Relatar:

- Dias e temas entregues;
- comportamento de viagem curta;
- integração com CTA do RB-INC-159;
- arquivos alterados;
- testes efetivamente executados;
- SHA e estado dos dois gates de CI;
- Preview Vercel correspondente ao mesmo head;
- limitações ou gaps encontrados no aceite;
- issue e PR;
- risco residual e qualquer decisão humana pendente.
