---
id: RB-CTX-207
title: Context Pack do RB-INC-207 — Jornada guiada de planejamento
description: Delimita a consolidação documental do wizard, seleção, Proposal, recomendações complementares e transição para viagem planejada/em andamento.
document_type: implementation-context-pack
owner: Product, Domain, Experience and Architecture
status: Draft
version: "0.1.0"
created: "2026-09-21"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [implementation, context-pack, planning-journey, wizard, itinerary-proposal]
related_documents: [RB-INC-207, RB-ADR-029, RB-ADR-028, RB-CORE-0004, RB-PRD-004, RB-DOM-001, RB-DOM-003, RB-UX-001, RB-UX-002, RB-ARC-002]
prerequisites: [RB-INC-206]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-207 — Jornada guiada de planejamento

## 1. Missão

Consolidar somente documentação canônica da nova jornada de preparação e operação da Trip, reconciliando o estado executável atual com a evolução funcional desejada.

## 2. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-PRD-004, RB-PRD-005, RB-PRD-006 e RB-PRD-007;
5. RB-DOM-001 a RB-DOM-004;
6. RB-UX-001, RB-UX-002 e RB-UX-005;
7. RB-ARC-002;
8. RB-ADR-027 e RB-ADR-028;
9. RB-INC-191 e RB-INC-196;
10. RB-INC-199 a RB-INC-206 e Context Packs correspondentes;
11. RB-ADR-029;
12. RB-INC-207.

## 3. Estado herdado

A `main` já possui:

- TripPlacePreference puro e persistido;
- Minha seleção na interface;
- WANT como candidato padrão;
- MAYBE por opt-in;
- Recommendation/Discovery removidas da fonte automática;
- Activity lifecycle;
- ReplanningWindow;
- Proposal INITIAL/REPLAN com snapshot temporal.

Portanto, este incremento não reimplementa esses contratos.

## 4. Tensão a reconciliar

RB-ADR-028/RB-INC-203 estabeleceram candidatos estritamente explícitos.

A nova direção permite sugestão complementar quando houver lacuna útil, mas somente se:

- não for confundida com preferência;
- não usar NOT_INTERESTED;
- não virar Activity sem aceite;
- possuir proveniência e justificativa;
- não existir para preencher espaço artificialmente.

RB-ADR-029 é a decisão que formaliza essa evolução.

## 5. Contratos funcionais

### Seleção

```text
WANT
MAYBE
NOT_INTERESTED
MUST_DO sobre WANT
unrated = ausência de TripPlacePreference
```

### Origens da Proposal

```text
USER_SELECTED
ROUTEBOOK_RECOMMENDED
```

### Planning Roles

```text
EXPERIENCE
FOOD
NIGHTLIFE
OTHER
```

### Jornada

```text
Explorar
→ Escolher
→ Planejar
→ Proposal
→ Roteiro
→ Replanejamento
```

## 6. Restrições

- não alterar código;
- não alterar banco/schema/migrations;
- não alterar Server Actions/APIs;
- não alterar gerador/compositor;
- não implementar `ROUTEBOOK_RECOMMENDED`;
- não criar sinônimo de TripPlacePreference;
- não fazer Proposal equivaler a estado aplicado;
- não tornar densidade meta;
- não tocar Preview/Production;
- não fazer merge na main.

## 7. Caminhos permitidos

Somente os caminhos da seção 14 do RB-INC-207.

## 8. Critérios de consistência

- Bible preservada;
- RB-ADR-027 preservado;
- RB-ADR-028 preservado exceto pela origem exclusiva de candidatos, evoluída por RB-ADR-029;
- seleção explícita continua autoritativa sobre intenção;
- sugestão complementar continua Recommendation/Proposal, não preferência;
- estado planejado continua derivado do Itinerary;
- ReplanningWindow continua autoridade temporal;
- ausência de dados não vira falso fato.

## 9. Validação

```bash
node scripts/validate-docs.mjs
pnpm format:check
```

Registrar resultados reais no incremento, matriz e PR.

## 10. Próximo corte recomendado

A próxima conversa deve tratar somente dos contratos executáveis mínimos necessários para suportar:

- lifecycle/estado do wizard de preparação sem criar estado duplicado;
- proveniência de candidato da Proposal;
- justificativas de inclusão/exclusão;
- contexto mínimo necessário à geração;
- compatibilidade com Proposal persistida atual.

Não implementar telas do wizard nesse mesmo corte.
