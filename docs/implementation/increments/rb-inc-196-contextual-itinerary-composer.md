---
id: RB-INC-196
title: Compositor contextual inteligente de Proposta de Roteiro
description: Evolui a geração autoritativa de Itinerary Proposal para compor Dias coerentes por proximidade, categoria, hospedagem e diversidade, com fallback determinístico.
document_type: implementation-increment
owner: Proposal Management and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-11"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, itinerary-proposal, contextual-composition, routebook-anywhere, planning]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-003, RB-ARC-003, RB-INC-099, RB-INC-178, RB-INC-184, RB-INC-185, RB-INC-191, RB-CTX-196]
prerequisites: [RB-INC-191]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-196 — Compositor contextual inteligente de Proposta de Roteiro

## 1. Resultado vertical

Uma nova Itinerary Proposal deve organizar Lugares em Dias que façam sentido como experiência de viagem, e não apenas distribuir candidatos entre Dias menos preenchidos.

A primeira versão continua determinística, explicável e provider-neutral. Ela usa somente sinais já disponíveis: categoria, coordenadas, Hospedagem, ordem/relevância de candidatos, Activities existentes e Free Periods.

## 2. Unidade de trabalho

- Issue: `#464`.
- Branch: `codex/rb-inc-196-contextual-itinerary-composer`.
- Base: RB-INC-191 / PR `#458` @ `9fb13431aa15fe2a42c85afc15a77929a15f4faf`.
- Production e merge na `main` permanecem gates humanos explícitos.

## 3. Evidência do problema

O aceite humano do RB-INC-191 mostrou que aumentar o número de candidatos resolve subdimensionamento, mas não garante qualidade do Roteiro. O generator atual preserva a ordem dos candidatos e escolhe o Dia com menor densidade; isso pode produzir zigue-zague geográfico, repetição de categoria e sequências pouco naturais.

## 4. Decisões preservadas

- Proposal continua distinta do Itinerary aplicado.
- Nenhuma mudança é aplicada antes de aceite explícito.
- Recommendation continua com seus invariantes atuais.
- Discovery continua usando ranking/reconciliação existentes.
- Não é criado novo Provider ou LLM.
- Nenhum horário de funcionamento, trânsito, ETA ou rota é inventado.
- Até 3 Activities por Dia continua heurística de densidade, não obrigação de preenchimento.
- Free Period `protected` continua reduzindo capacidade.

## 5. Sinais contextuais

`ItineraryProposalGenerationCandidate` pode carregar, quando conhecidos:

- `category`;
- `latitude` e `longitude`;
- ordem de entrada continua representando relevância prévia.

`GenerateItineraryProposalInput` pode receber uma `anchorCoordinate` opcional, derivada da Hospedagem quando disponível e, em fallback, omitida.

Esses campos são metadados de composição e não novos conceitos de Domain.

## 6. Política de composição v1

A composição ocorre em camadas determinísticas:

1. respeitar capacidade diária, Activities existentes e Free Periods;
2. preservar relevância inicial dos candidatos;
3. iniciar Dias com candidatos de alta relevância;
4. para slots seguintes, favorecer proximidade ao último Lugar daquele Dia;
5. quando não houver Lugar anterior, usar Hospedagem como âncora espacial se disponível;
6. penalizar repetição da mesma categoria quando houver alternativa comparável;
7. tratar `gastronomy` e `nightlife` como categorias complementares, evitando que dominem todos os slots do mesmo Dia quando houver experiências principais (`beach`, `nature`, `attraction`, `viewpoint`, `tour`, `shopping`);
8. desempates permanecem estáveis por ordem original e `candidateId`.

Nenhuma dessas regras afirma horário do dia. A composição expressa afinidade de sequência e diversidade, não agenda temporal factual.

## 7. Fallback

Quando categoria e coordenadas estiverem ausentes, o comportamento deve continuar determinístico e compatível com o balanceamento por densidade do RB-INC-191.

## 8. Justificativas

A Proposal só pode mencionar:

- proximidade quando coordenadas realmente participaram;
- diversidade quando categoria participou;
- Hospedagem quando uma âncora de Hospedagem realmente participou.

A UX não deve afirmar rota real, tempo de deslocamento ou horário de funcionamento.

## 9. Caminhos autorizados

```text
modules/proposal-management/src/deterministic-itinerary-proposal-generator.ts
modules/proposal-management/src/deterministic-itinerary-proposal-generator.test.ts
modules/proposal-management/src/deterministic-itinerary-proposal-contextual.test.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.test.ts
modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts
modules/proposal-management/src/authoritative-itinerary-proposal-generation.test.ts
packages/database/src/authoritative-itinerary-proposal-generation-context.ts
packages/database/src/authoritative-itinerary-proposal-generation-context-postgres.test.ts
apps/web/lib/itinerary-proposal-discovery-candidates.ts
apps/web/lib/itinerary-proposal-discovery-candidates.test.ts
apps/web/lib/itinerary-proposal-generation.ts
apps/web/lib/itinerary-proposal-generation.test.ts
apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts
apps/web/e2e/itinerary-proposal-generation.spec.ts
docs/implementation/increments/rb-inc-196-contextual-itinerary-composer.md
docs/implementation/context-packs/rb-inc-196-contextual-itinerary-composer.md
docs/registry.md
```

## 10. Fora de escopo

- horários de funcionamento;
- trânsito, rota viária, ETA ou duração real de deslocamento;
- weather-aware planning;
- reservas;
- novo Provider/secret/billing;
- novo estado ou invariante de Domain;
- Production;
- merge na `main` sem autorização humana.

## 11. Critérios de aceite

- [ ] Lugares próximos tendem a ficar no mesmo Dia quando existe capacidade.
- [ ] Repetição de categoria é penalizada quando existe alternativa relevante.
- [ ] Gastronomia e vida noturna complementam experiências principais quando disponíveis.
- [ ] Hospedagem influencia espacialmente o início da composição quando coordenada.
- [ ] Ausência de metadados mantém fallback determinístico.
- [ ] Free Periods e Activities existentes permanecem respeitados.
- [ ] Proposal não altera Itinerary antes do aceite.
- [ ] Justificativas só usam sinais realmente disponíveis.
- [ ] Unit tests cobrem proximidade, diversidade, hospedagem, fallback e determinismo.
- [ ] E2E zero-seed comprova múltiplas Activities por Dia sem Recommendation artificial.
- [ ] Documentation e Engineering Validation passam no mesmo SHA.
- [ ] Preview humano confirma sequência plausível.
- [ ] Production permanece intocada.

## 12. Validação

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 13. Rollback

Sem migration. O rollback remove os metadados contextuais e restaura a política de balanceamento do RB-INC-191.
