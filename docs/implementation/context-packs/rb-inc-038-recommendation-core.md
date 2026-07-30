---
id: RB-CTX-038
title: Context Pack do RB-INC-038
description: Fornece o contexto mínimo e os limites operacionais para implementar o núcleo de Recommendation e Context Snapshot.
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
  - decision-intelligence
  - recommendation
related_documents:
  - RB-INC-038
  - RB-CORE-0004
  - RB-PRD-006
  - RB-PRD-007
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-ARC-002
  - RB-IMP-003
prerequisites:
  - RB-INC-037
next_documents:
  - RB-CTX-039
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-038

## 1. Missão do executor

Implementar um núcleo de domínio imutável para Recommendations contextualizadas, preservando a distinção entre sugestão, confiança, score e Decision, sem introduzir persistência, ranking ou efeitos em outros agregados.

## 2. Incremento

- ID: `RB-INC-038`;
- Issue: `#83`;
- Arquivo: `docs/implementation/increments/rb-inc-038-recommendation-core.md`;
- Branch: `feature/rb-inc-038-recommendation-core`;
- Base validada: `b2aa918984e4803d1baa4f76bb308669705438df`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `CONTRIBUTING.md`;
3. `docs/core/routebook-bible.md`;
4. `docs/product/functional-requirements.md`, RB-FR-097 a RB-FR-103;
5. `docs/product/business-rules.md`, regras de Recommendation e Decision;
6. `docs/domain/domain-model.md`;
7. `docs/domain/business-rules-and-invariants.md`, RB-BR-REC-002 a RB-BR-REC-011 e RB-BR-DEC-002 a RB-BR-DEC-007;
8. `docs/domain/ubiquitous-language.md`;
9. `docs/architecture/modules-and-bounded-contexts.md`;
10. `docs/delivery/delivery-strategy-and-implementation-roadmap.md`, Fase 5;
11. `docs/quality/quality-and-testing-strategy.md`;
12. `docs/quality/master-test-plan.md`;
13. `docs/implementation/README.md` e `docs/implementation/context-pack-template.md`.

## 4. Conceitos relevantes

| Termo oficial | Interpretação necessária |
| --- | --- |
| Recommendation | sugestão contextualizada; não altera estado canônico |
| Decision | escolha explícita do usuário; agregado distinto |
| DecisionContextSnapshot | cópia mínima, versionada e temporal do contexto usado |
| RecommendationReason | motivo baseado em dado conhecido |
| RecommendationLimitation | limitação causada por dado ausente, incompleto ou não verificável |
| RecommendationScore | valor interno de ordenação; não é avaliação, confiança ou qualidade |
| RecommendationConfidence | leitura qualitativa da completude e qualidade do contexto |
| RecommendationValidity | janela e condições de validade da sugestão |

## 5. Invariantes

- Recommendation personalizada exige Context Snapshot;
- Recommendation apresentada exige ao menos um Reason;
- alvo inicial é Place publicado no DestinationId do snapshot;
- score e confiança permanecem nominalmente separados;
- estados expirado, invalidado ou superseded bloqueiam aceitação;
- aceitação exige DecisionId explícito;
- rejeição não produz efeito em outro agregado;
- factories e transições não mutam inputs;
- nenhum dado pessoal desnecessário entra no snapshot.

## 6. Decisões arquiteturais aplicáveis

| Documento | Decisão |
| --- | --- |
| RB-ADR-001 | manter monólito modular e fronteiras explícitas |
| RB-ADR-002 | TypeScript e Node.js como base |
| RB-ADR-004 | workspace pnpm no monorepo |
| RB-ADR-010 | Vitest para domínio e regressão integral no CI |
| RB-ARC-002 | Decision Intelligence possui Recommendation e Decision |

## 7. Contratos existentes

- `Trip.id`, `Trip.destination`, `Trip.contextVersion` e versões temporais;
- `TravelerProfile.version` como referência futura de contexto;
- `Itinerary.version` como referência futura de contexto;
- `Place.id`, `Place.destinationId` e `Place.publicationStatus`;
- padrão de workspace usado em `modules/place-catalog` e `modules/traveler-profile`;
- workflow permanente `.github/workflows/engineering-validation.yml`.

## 8. Caminhos permitidos

```text
modules/decision-intelligence/**
pnpm-lock.yaml
pnpm-workspace.yaml
docs/implementation/increments/rb-inc-038-recommendation-core.md
docs/implementation/context-packs/rb-inc-038-recommendation-core.md
docs/implementation/traceability-matrix.md
docs/registry.md
README.md
```

## 9. Caminhos somente leitura

```text
modules/traveler-profile/**
modules/place-catalog/**
modules/saved-places/**
modules/trip-management/**
modules/geo-distance/**
packages/database/**
apps/web/**
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/quality/**
docs/delivery/**
```

## 10. Caminhos proibidos

```text
.github/workflows/**
packages/database/drizzle/**
apps/web/**
modules/trip-management/**
modules/place-catalog/**
modules/traveler-profile/**
modules/saved-places/**
modules/geo-distance/**
```

## 11. Entradas disponíveis

- identidade da Viagem e do Destino;
- versões de contexto conhecidas;
- identidade e status de publicação do Place alvo;
- instante controlável nos testes;
- DecisionId explícito somente na operação de aceitação.

## 12. Saídas esperadas

- workspace `@routebook/decision-intelligence`;
- contrato público em `src/index.ts`;
- agregado e value objects em arquivos próprios ou coesos;
- erros de validação e transição;
- testes unitários cobrindo todos os estados e invariantes;
- documentação e rastreabilidade atualizadas.

## 13. Critérios de aceite

- [ ] identidade própria;
- [ ] snapshot obrigatório;
- [ ] Reason obrigatório na apresentação;
- [ ] score distinto de confiança;
- [ ] alvo Place publicado e compatível;
- [ ] domínio sem infraestrutura;
- [ ] imutabilidade;
- [ ] transições inválidas rejeitadas;
- [ ] estados inválidos para aceitação bloqueados;
- [ ] aceitação associada a Decision;
- [ ] testes de domínio completos;
- [ ] CI integral verde.

## 14. Restrições

- não criar ranking;
- não persistir;
- não adicionar Provider ou dependência de runtime;
- não criar Decision persistida;
- não alterar outro agregado;
- não apresentar score ao usuário;
- não afirmar execução de teste não realizada;
- não versionar secrets.

## 15. Comandos

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 16. Dados e privacidade

O snapshot pode conter apenas identidades técnicas, versões, critérios aplicados e instantes necessários à rastreabilidade. Não copiar nomes de participantes, dados de contato, orçamento detalhado, texto livre de usuário ou qualquer dado pessoal não necessário.

## 17. Quando interromper e escalar

- um contrato exigir redefinição de Recommendation ou Decision;
- surgir necessidade de persistência ou Provider;
- o alvo inicial não puder permanecer Place publicado;
- a implementação exigir escrita em outro bounded context;
- um estado canônico contradizer RB-DOM-003;
- um teste revelar ambiguidade sem decisão documental.

## 18. Formato do relatório final

- resumo do resultado;
- arquivos alterados;
- contratos públicos;
- testes executados e resultados;
- SHA e workflow verde;
- riscos e limites;
- links da issue e da PR.