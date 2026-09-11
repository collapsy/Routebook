---
id: RB-INC-191
title: Discovery Anywhere no pipeline autoritativo de Proposta de Roteiro
description: Conecta Lugares seguros da Discovery ao gerador autoritativo de Itinerary Proposal em uma ação explícita, sem ampliar Recommendation para Place não publicado e sem deixar Proposal vazia parecer acionável.
document_type: implementation-increment
owner: Proposal Management and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-11"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, itinerary-proposal, discovery, routebook-anywhere, places, provider-first]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-003, RB-ARC-003, RB-INC-099, RB-INC-131, RB-INC-178, RB-INC-184, RB-INC-185, RB-CTX-191]
prerequisites: [RB-INC-178, RB-INC-184, RB-INC-185]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-191 — Discovery Anywhere no pipeline autoritativo de Proposta de Roteiro

## 1. Resultado vertical

Ao solicitar explicitamente uma nova Proposta de Roteiro em uma Trip RouteBook Anywhere, os Lugares seguros já encontráveis pela Discovery devem poder participar do mesmo gerador autoritativo de Itinerary Proposal usado pelas Recommendations persistidas.

A geração deve continuar sem alterar o Roteiro antes do aceite. Uma Proposal `ready` sem mudanças continua válida pelo domínio quando nenhuma alteração adequada existir, mas a interface não pode apresentá-la como uma proposta acionável “aguardando sua decisão”.

## 2. Issue, branch e execução paralela

- Issue: `#455`.
- Branch: `codex/rb-inc-191-discovery-itinerary-proposal`.
- Base inicial: `codex/rb-inc-189-accommodation-name-geocoding-current-stack` @ `cbbb9f8aaf958c9912ceccb6cb9bb824fbe797bb`.
- O trabalho de mídia segue em paralelo na PR `#457` / RB-INC-192 e não faz parte deste incremento.
- Antes do gate final, esta branch deve ser reconciliada com o HEAD aceito da stack paralela e todas as validações devem ser repetidas no SHA consolidado.
- Production e merge na `main` permanecem gates humanos explícitos.

## 3. Evidência do problema

A falha foi reproduzida no Preview em Panajachel, Guatemala, em 11/09/2026:

- Discovery Anywhere exibe diversos Lugares reais;
- a Trip não possuía Recommendations persistidas capazes de alimentar o contexto autoritativo de Proposal;
- a geração recebeu zero candidatos;
- uma Proposal foi persistida como `ready` com zero `ProposedActivity`;
- a revisão exibiu “Proposta aguardando sua decisão” e `0` mudanças propostas.

O problema é uma lacuna de composição: Discovery e Proposal usam contratos válidos isoladamente, mas a ação explícita de gerar uma Proposal não reutiliza a coleção segura já disponível na experiência provider-first.

## 4. Decisões preservadas

Este incremento não altera o domínio canônico.

- Recommendation continua exigindo Place publicado conforme o contrato atual de Decision Intelligence.
- Candidato externo não recebe `RecommendationId` artificialmente.
- Nenhum novo estado de Itinerary Proposal é criado.
- `RB-BR-PRP-004` permanece válido: uma Proposal pode estar vazia quando não houver alteração adequada, desde que isso seja explicado.
- Materialização operacional de um Lugar seguro continua distinta de publicação editorial, conforme RB-INC-178.
- Gerar Proposal não cria Saved Place, Activity, Decision ou Recommendation.
- Aplicação integral ou parcial continua exigindo decisão explícita do usuário.

## 5. Fronteira escolhida

A menor evolução compatível com os contratos existentes é permitir que o comando autoritativo de geração receba **candidatos adicionais de geração** já validados pela aplicação.

Esses candidatos usam o mesmo tipo provider-neutral `ItineraryProposalGenerationCandidate` consumido pelo gerador determinístico. O Proposal Management continua responsável por:

- montar os candidatos derivados de Recommendations persistidas;
- mesclar candidatos adicionais sem duplicar o mesmo `placeId`;
- preservar a precedência dos candidatos derivados de Recommendation;
- delegar distribuição, densidade, Free Periods, lifecycle e persistência ao pipeline autoritativo existente.

Não é criado um segundo gerador de Roteiro.

## 6. Reuso obrigatório da Discovery

A aplicação deve reutilizar a cadeia já aprovada pelo RB-INC-184:

1. `resolvePlaceDiscoveryRegion`;
2. `PlaceSearchPort` / Overture configurado;
3. `resolvePlaceBootstrapPolicy` / `runPlaceBootstrapStep`;
4. `reconcileExternalPlaceCandidate`;
5. `buildPlaceDiscoveryFeed`;
6. a mesma seleção contextual por interesse + distância usada em `recommendation-discovery-suggestions`.

Somente itens `external` seguros que sobreviveram à reconciliação podem participar desta ponte. `possible_match` ambíguo e `rejected` permanecem retidos.

## 7. Identidade persistível para a Proposed Activity

Como uma Proposed Activity pode ser aceita posteriormente e virar Activity, o candidato escolhido precisa de identidade interna reproduzível.

Na ação explícita de gerar Proposal:

1. a Discovery é consultada novamente server-side;
2. cada candidato selecionado é materializado/reconciliado pelo `promoteExternalPlaceCandidate` já aprovado no RB-INC-178;
3. novo Place operacional permanece `draft` e sem publicação automática;
4. external reference e Provenance são preservadas;
5. Place já existente é reutilizado de forma idempotente;
6. Place já presente no Roteiro é excluído antes de compor os candidatos adicionais.

A leitura normal de Lugares ou Sugestões continua sem materializar nada. A mutação só ocorre após a ação explícita `Gerar proposta de roteiro`.

## 8. Composição dos candidatos

Ordem do input do gerador:

```text
Recommendations persistidas elegíveis
→ Lugares seguros selecionados pela Discovery
```

Regras:

- `placeId` já representado por Recommendation elegível não entra novamente por Discovery;
- `placeId` já planejado não entra como candidato adicional;
- duplicatas dentro da seleção Discovery são eliminadas por identidade do Place;
- candidato adicional usa título canônico do Place materializado;
- não inventar preço, duração, horário, rating, disponibilidade ou rota;
- a justificativa pode registrar apenas que o Lugar foi selecionado entre opções seguras da área da Viagem.

## 9. Proposal vazia

Uma Proposal `ready` com zero mudanças não é erro de domínio. Entretanto ela não representa uma decisão aplicável.

A experiência deve:

- rotular o estado como `Sem mudanças sugeridas` ou equivalente;
- explicar que nenhuma mudança adequada foi encontrada;
- não exibir aceite integral, parcial, edição ou descarte como ação decisória da Proposal vazia;
- manter critérios, justificativas e limitações visíveis;
- permitir ao usuário voltar ao Roteiro ou explorar Lugares;
- preservar a Proposal para auditoria/histórico.

## 10. Escopo e caminhos autorizados

```text
modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts
modules/proposal-management/src/authoritative-itinerary-proposal-generation.test.ts
apps/web/lib/recommendation-discovery-suggestions.ts
apps/web/lib/recommendation-discovery-suggestions.test.ts
apps/web/lib/itinerary-proposal-discovery-candidates.ts
apps/web/lib/itinerary-proposal-discovery-candidates.test.ts
apps/web/lib/itinerary-proposal-generation.ts
apps/web/lib/itinerary-proposal-generation.test.ts
apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts
apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx
apps/web/components/itinerary-proposal-review.tsx
apps/web/components/itinerary-proposal-review.test.tsx
apps/web/e2e/itinerary-proposal-generation.spec.ts
docs/implementation/increments/rb-inc-191-discovery-itinerary-proposal.md
docs/implementation/context-packs/rb-inc-191-discovery-itinerary-proposal.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Arquivos adicionais indispensáveis devem ser adicionados ao Increment e ao Context Pack antes da alteração.

## 11. Fora de escopo

- alterar `RecommendationTarget` ou permitir Recommendation persistida para Place não publicado;
- criar novo lifecycle/estado de Proposal;
- alterar algoritmo de densidade diária;
- preencher horários automaticamente;
- persistir Saved Place por gerar Proposal;
- aplicar Proposal automaticamente;
- alterar Google Photos, Wikimedia, Quality ou qualquer arquivo da stack de mídia;
- Provider novo, secret novo, billing ou Production;
- migration/schema;
- merge na `main` sem autorização humana.

## 12. Critérios de aceite

- [ ] Trip zero-seed com Discovery segura gera Proposal com ao menos um Lugar elegível sem exigir Recommendation persistida prévia.
- [ ] A ponte reutiliza a Discovery/reconciliação existente; não existe segundo algoritmo de descoberta ou identidade.
- [ ] Candidato selecionado é revalidado server-side e materializado como Place operacional `draft` antes de virar referência de Proposed Activity.
- [ ] Nenhuma Recommendation artificial é criada para Place `draft`.
- [ ] Gerar Proposal não cria Saved Place, Activity ou Decision.
- [ ] Recommendation elegível continua tendo precedência e não é duplicada pela Discovery.
- [ ] Place já presente no Roteiro não é proposto novamente.
- [ ] `possible_match` ambíguo e candidato rejeitado não entram na Proposal.
- [ ] Densidade diária e Free Periods continuam governados pelo generator existente.
- [ ] Proposal `ready` com zero mudanças continua auditável, mas não aparece como “aguardando sua decisão” nem oferece ações de aceite/edição/descarte.
- [ ] Pipa/cenários canônicos com Recommendations persistidas continuam funcionando.
- [ ] Nenhum arquivo da stack de mídia é alterado neste incremento.
- [ ] Documentation e Engineering Validation passam no mesmo SHA final.
- [ ] Vercel Preview do mesmo SHA valida um Destination zero-seed e regressão canônica.
- [ ] Production permanece intocada.

## 13. Testes mínimos

### Unitários

- seleção contextual expõe exatamente os candidatos usados pela apresentação;
- materialização produz candidatos adicionais com `placeId` interno;
- candidato já planejado é omitido;
- falha conhecida de reconciliação/materialização é fail-closed;
- Recommendation e Discovery do mesmo `placeId` não duplicam input;
- comando sem candidatos adicionais mantém comportamento legado.

### Interface

- Proposal vazia é apresentada como não acionável;
- Proposal com mudanças mantém ações de decisão existentes;
- Proposal expirada permanece histórica e não aplicável.

### E2E

- Trip zero-seed + Discovery E2E → gerar Proposal → Proposed Activity visível e persistida;
- Itinerary permanece idêntico antes do aceite;
- nenhuma Recommendation precisa ser inserida para o cenário zero-seed;
- regressão de Recommendation persistida e deduplicação de Place planejado continuam verdes.

## 14. Validação

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

CI Documentation e Engineering devem concluir verdes no mesmo SHA. O Preview final deve ser gerado após reconciliação com a stack paralela aceita.

## 15. Rollback

A mudança é reversível por código. Não há migration, novo Provider ou alteração de estado canônico já persistido. O rollback remove a composição de candidatos adicionais e restaura o comportamento anterior do comando autoritativo.