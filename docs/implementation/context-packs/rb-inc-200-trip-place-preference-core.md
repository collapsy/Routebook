---
id: RB-CTX-200
title: Context Pack do RB-INC-200 — Núcleo puro de TripPlacePreference
description: Delimita a implementação do agregado Trip Collection e das invariantes puras de TripPlacePreference.
document_type: implementation-context-pack
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, context-pack, domain, trip-collection, trip-place-preference]
related_documents: [RB-INC-200, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002, RB-ADR-028, RB-INC-199]
prerequisites: [RB-INC-199]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-200 — Núcleo puro de TripPlacePreference

## 1. Missão do executor

Implementar o núcleo puro do bounded context Trip Collection, com invariantes explícitas e testes determinísticos, sem integrar persistência, Saved Places legado, Proposal ou interface.

## 2. Incremento

- ID: `RB-INC-200`;
- issue: [#483](https://github.com/collapsy/Routebook/issues/483);
- arquivo: `docs/implementation/increments/rb-inc-200-trip-place-preference-core.md`;
- branch: `codex/issue-483-trip-place-preference-core`;
- base validada: `e7e8a3bee1ed774515f9e572cd2d0e23f67e4f48`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004 — RouteBook Bible;
3. `docs/README.md`;
4. RB-DOM-001 — seções Trip Collection e TripPlacePreference;
5. RB-DOM-002 — termos Trip Collection, TripPlacePreference, intent e priority;
6. RB-DOM-003 — regras RB-BR-COL aplicáveis;
7. RB-DOM-004 — eventos de TripPlacePreference;
8. RB-ARC-002 — bounded context Trip Collection;
9. RB-ADR-028 — decisão aprovada;
10. RB-INC-199 e RB-CTX-199;
11. `modules/saved-places/**` somente como baseline legado.

## 4. Conceitos relevantes

| Termo oficial | Interpretação necessária |
| --- | --- |
| Trip Collection | agregado que possui preferências contextuais da Trip |
| TripPlacePreference | entidade única por Trip e Place |
| TripPlaceIntent | `WANT`, `MAYBE` ou `NOT_INTERESTED` |
| TripPlacePriority | `MUST_DO` sobre `WANT`, ou ausência de prioridade |
| não avaliado | ausência de TripPlacePreference, nunca valor persistível |
| Saved Place | contrato legado fora do módulo canônico deste incremento |

## 5. Invariantes

- `TripId + PlaceId` é único;
- ausência significa não avaliado;
- `UNRATED` não existe no contrato;
- `MUST_DO` exige `WANT`;
- operação repetida com o mesmo estado é idempotente;
- alteração real preserva ID e `createdAt`;
- limpar preferência não altera Activity;
- domínio não importa banco, framework ou Provider.

## 6. Decisões arquiteturais aplicáveis

| Documento | Decisão |
| --- | --- |
| RB-CORE-0004 | Place, interesse, Proposal e Activity permanecem distintos |
| RB-ARC-002 | Trip Collection possui TripPlacePreference |
| RB-ADR-028 | associação canônica, intents, prioridade e transição futura de Saved Places |

## 7. Contratos existentes

- padrão de workspace dos módulos do monorepo;
- `SavedPlace` como baseline legado binário e somente leitura;
- `TripId` e `PlaceId` transportados como identificadores opacos;
- Vitest, ESLint e TypeScript compartilhados pelo workspace.

## 8. Caminhos permitidos

```text
modules/trip-collection/**
pnpm-lock.yaml
docs/implementation/increments/rb-inc-200-trip-place-preference-core.md
docs/implementation/context-packs/rb-inc-200-trip-place-preference-core.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Caminhos somente leitura

```text
modules/saved-places/**
modules/trip-management/**
modules/place-catalog/**
modules/proposal-management/**
packages/database/**
apps/web/**
docs/core/**
docs/domain/**
docs/architecture/**
```

## 10. Caminhos proibidos

```text
.github/workflows/**
packages/database/**
apps/web/**
modules/saved-places/**
modules/proposal-management/**
modules/trip-management/**
modules/place-catalog/**
```

## 11. Entradas disponíveis

- TripId e PlaceId opacos;
- intent explícito;
- prioridade opcional;
- ID e instante injetáveis para factories e testes.

## 12. Saídas esperadas

- workspace `@routebook/trip-collection`;
- API pública do agregado e da entidade;
- erros de validação explícitos;
- operações imutáveis e idempotentes;
- testes unitários completos;
- documentação e rastreabilidade registradas.

## 13. Critérios de aceite

- [ ] somente intents canônicos são aceitos;
- [ ] prioridade inválida é rejeitada;
- [ ] ausência não cria entidade sentinela;
- [ ] unicidade é mantida na coleção;
- [ ] mudanças preservam identidade e criação;
- [ ] repetição não altera estado ou timestamp;
- [ ] limpeza ausente é idempotente;
- [ ] módulo permanece sem dependência de runtime externa;
- [ ] regressão aplicável fica verde.

## 14. Restrições

- não criar repository neste incremento;
- não alterar Saved Places;
- não implementar migration ou backfill;
- não criar Activity, Proposal, Recommendation ou evento persistido;
- não adicionar origin, notes ou tags sem incremento próprio;
- não introduzir Provider, secret ou dado pessoal;
- não expandir para ReplanningWindow.

## 15. Comandos

```bash
pnpm install --frozen-lockfile
pnpm --filter @routebook/trip-collection test
pnpm --filter @routebook/trip-collection lint
pnpm --filter @routebook/trip-collection typecheck
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## 16. Dados e privacidade

O núcleo recebe apenas identificadores opacos, intenção, prioridade e instantes. Fixtures não podem usar dados pessoais reais. Nenhum conteúdo é enviado a serviço externo.

## 17. Quando interromper e escalar

- uma invariante contradizer RB-ADR-028;
- o domínio exigir persistência para funcionar;
- surgir necessidade de alterar Saved Places ou outro bounded context;
- uma operação implicar Activity ou Proposal;
- um novo conceito de domínio se tornar necessário.

## 18. Formato do relatório final

- resumo do resultado;
- arquivos alterados;
- contratos públicos;
- testes executados e resultados;
- testes não executados;
- riscos e pendências;
- links da issue e do pull request.
