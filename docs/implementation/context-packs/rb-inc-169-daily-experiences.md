---
id: RB-CTX-169
title: Context Pack do RB-INC-169 — Experiências diárias de Pipa
description: Delimita a projeção de Sol/Lua e rolês confirmados do Guia, preservando Provenance, incerteza e confirmação humana no Roteiro.
document_type: implementation-context-pack
owner: Place Catalog and Trip Experience
status: Draft
version: "0.1.0"
created: "2026-08-27"
last_updated: "2026-08-27"
authors: [RouteBook Team]
tags: [implementation, context-pack, events, astronomy, pipa, guide]
related_documents: [RB-INC-169, RB-CORE-0004, RB-INC-136, RB-INC-165, RB-INC-168]
prerequisites: [RB-INC-165]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-169 — Experiências diárias de Pipa

## 1. Missão

Entregar uma fatia funcional em Preview que responda duas perguntas sem conflá-las:

- onde vale observar Sol/Lua numa data da Viagem;
- quais rolês possuem programação confirmada naquela data.

## 2. Unidade de trabalho

- issue: `#395`;
- branch: `codex/rb-inc-169-daily-experiences`;
- base: PR `#387`, SHA `379d356621f421c70a71a47cdc9b720b3c782860`;
- Preview é o ambiente de aceite;
- Production permanece fora de escopo;
- issue #395 continua aberta após esta fatia.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/domain/ubiquitous-language.md`;
5. `docs/domain/domain-model.md`;
6. documentos UX de Guia/Roteiro;
7. RB-INC-165;
8. RB-INC-168;
9. RB-INC-169.

## 4. Contratos preservados

- Place continua sendo a identidade canônica do local;
- Recomendação não é Decisão;
- o Guia não escreve no Roteiro;
- eventos não são persistidos como novo agregado nesta fase;
- um luau somente é Rolê quando houver fonte datada;
- horário de funcionamento não é evento;
- inferência geográfica fica identificada como inferência;
- falta de fonte ou Place canônico elimina o evento da projeção;
- falta de data astronômica governada gera indisponibilidade;
- nenhuma API key, billing ou Provider novo é introduzido.

## 5. Projeção autorizada

```text
Trip date + published Places + accommodation
  -> buildPipaDailyExperience
     -> skyObservations
        -> time + azimuth + Place recommendations + confidence
     -> confirmedEvents
        -> date + venue Place + source + collectedAt
  -> PipaDailyExperiences
  -> explicit user handoff to manual Itinerary composer
```

## 6. Dados temporais desta fase

A astronomia é uma tabela governada somente para a viagem piloto de 22–29/08/2026.

A agenda inclui somente eventos que possuam:

- data;
- horário;
- fonte verificável;
- local correspondente a Place canônico.

Não extrapolar recorrência nem usar informação histórica como programação atual.

## 7. Handoff para Roteiro

Parâmetros de URL são tratados apenas como preenchimento de UI:

- `novaAtividade`: trim e máximo 180 caracteres;
- `horario`: formato HH:mm válido;
- `duracao`: inteiro entre 1 e 1440 minutos.

A action de criação já existente continua sendo a única escrita e só roda após submit humano.

## 8. Caminhos permitidos

```text
apps/web/lib/pipa-daily-experiences.ts
apps/web/lib/pipa-daily-experiences.test.ts
apps/web/components/pipa-daily-experiences.tsx
apps/web/components/pipa-daily-experiences.module.css
apps/web/app/viagens/[tripId]/guia/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/e2e/trip-day-guide.spec.ts
docs/implementation/increments/rb-inc-169-daily-experiences.md
docs/implementation/context-packs/rb-inc-169-daily-experiences.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Testes

- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- Engineering Validation / Playwright;
- Documentation Validation;
- Vercel Preview READY.

Cobertura específica:

- projeção de 27/08 sem evento confirmado;
- projeção de 28/08 com evento confirmado;
- ausência de venue canônico;
- data astronômica não coberta;
- handoff Guia → Roteiro com preenchimento;
- viewport mobile via suíte do Guia.

## 10. Proibições

- não criar migration;
- não persistir evento;
- não ativar Provider;
- não versionar secret;
- não inventar rolê;
- não chamar um Place aberto de evento;
- não marcar adequação inferida como curadoria;
- não aplicar Activity automaticamente;
- não alegar cobertura de clima live;
- não fazer merge que contorne o gate humano da PR #387;
- não concluir M8 ou #395 com esta fatia.

## 11. Handoff esperado

Relatar:

- SHA exato;
- fontes temporais utilizadas;
- arquivos alterados;
- testes reais;
- CI;
- Preview;
- limitações de cobertura;
- dependência da PR #387;
- aceite funcional humano pendente.
