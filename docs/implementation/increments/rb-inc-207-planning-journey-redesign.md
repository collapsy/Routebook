---
id: RB-INC-207
title: Redesenho funcional da jornada guiada de planejamento
description: Consolida documentalmente o wizard de preparação, a relação entre seleção, Proposal e Roteiro e a evolução para recomendações complementares explicáveis.
document_type: implementation-increment
owner: Product, Domain, Experience and Architecture
status: Draft
version: "0.1.0"
created: "2026-09-21"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [implementation, documentation, planning-journey, wizard, itinerary-proposal, trip-place-preference]
related_documents: [RB-CORE-0004, RB-PRD-004, RB-DOM-001, RB-DOM-003, RB-UX-001, RB-UX-002, RB-ARC-002, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-CTX-207]
prerequisites: [RB-INC-206]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-207 — Redesenho funcional da jornada guiada de planejamento

## 1. Unidade de trabalho

- Issue: [#503](https://github.com/collapsy/Routebook/issues/503).
- Branch: `codex/issue-503-planning-journey-redesign`.
- Base: `main@6b4833a5179b42fca9ddf882ae62da8ebb3946f7`.
- Pull Request: [#504](https://github.com/collapsy/Routebook/pull/504).
- Tipo: exclusivamente documental.
- Merge na `main`: gate humano explícito.

## 2. Resultado vertical

O RouteBook passa a possuir especificação canônica e coerente para:

```text
Explorar
→ Escolher
→ Planejar
→ Revisar Proposal
→ Criar/atualizar Roteiro
→ Viajar
→ Replanejar
```

A jornada deixa de tratar “salvar/adicionar” como eixo principal e passa a orientar o usuário da descoberta à decisão, preservando `TripPlacePreference`, Proposal e Activity como estados diferentes.

## 3. Wizard de preparação

O wizard começa quando uma Trip criada ainda não possui um Roteiro aceito como planejamento atual e o usuário inicia a preparação.

Passos conceituais:

1. **Lugares** — explorar e expressar intenção.
2. **Contexto da viagem** — completar somente dados mínimos necessários.
3. **Revisão** — revisar seleção, prioridades, papéis e lacunas.
4. **Gerar proposta** — solicitar Itinerary Proposal.
5. **Revisar proposta** — aceitar integralmente, parcialmente ou rejeitar.

O wizard termina quando o usuário aceita uma Proposal que estabelece ou atualiza o planejamento inicial da Trip. Depois disso, ele deixa de ser onboarding permanente.

### Obrigatórios

- existir Trip e destino;
- existir período utilizável;
- revisão antes da geração;
- revisão/aceite antes de aplicar mudança ao Itinerary.

### Progressivos ou puláveis

- Hospedagem, chegada/saída, ritmo, transporte e preferências adicionais podem ser pedidos somente quando relevantes;
- `MAYBE` é opt-in por geração;
- vida noturna só precisa de contexto quando existir interesse ou candidato desse papel;
- seleção pode ser pequena.

## 4. Explorar, Minha seleção e Roteiro

`Explorar` responde “o que existe e o que pode me interessar?”.

`Minha seleção` responde “o que eu já avaliei para esta Trip?” e é derivada de `TripPlacePreference`.

`Roteiro` responde “o que foi efetivamente planejado?” e é derivado do Itinerary.

```text
TripPlacePreference ≠ Activity
Minha seleção ≠ Roteiro
Proposal ≠ Roteiro aplicado
```

## 5. Intenções

- `WANT`: candidato escolhido pelo usuário.
- `MAYBE`: candidato opcional, usado somente com autorização explícita.
- `NOT_INTERESTED`: excluído de composição automática e de recomendação complementar.
- ausência de registro: Place não avaliado.
- `MUST_DO`: prioridade somente sobre `WANT`; não viola capacidade, horário, ReplanningWindow ou restrições.

## 6. Planning Roles

Planning Role é função de composição, não categoria factual:

- `EXPERIENCE`: experiências, atrações, praias, trilhas, passeios e similares;
- `FOOD`: lugares usados principalmente para contexto de refeições;
- `NIGHTLIFE`: bares, pubs, baladas e experiências predominantemente noturnas;
- `OTHER`: demais casos sem política especializada.

A Proposal deve usar o papel para compor contexto, não para reclassificar Place.

## 7. Geração

Ordem semântica:

```text
WANT
→ MAYBE quando autorizado
→ ROUTEBOOK_RECOMMENDED quando necessário, permitido e justificável
```

A seleção explícita continua autoritativa para representar escolhas do usuário.

RB-ADR-029 introduz uma segunda origem de candidatos apenas na Proposal:

- `USER_SELECTED`;
- `ROUTEBOOK_RECOMMENDED`.

A sugestão complementar nunca cria TripPlacePreference nem Activity automaticamente.

## 8. Poucas, muitas ou nenhuma escolha

### Poucas escolhas

A Proposal pode manter períodos livres e, quando houver benefício real, apresentar complementos opcionais com origem e justificativa.

### Muitas escolhas

O RouteBook prioriza por intenção, `MUST_DO`, viabilidade, capacidade e coerência. Itens não planejados permanecem em Minha seleção e recebem motivo sustentado por evidência.

### Nenhuma escolha

O sistema não monta silenciosamente uma viagem inteira. Deve orientar o usuário a explorar ou, se houver uma ação futura explícita de “quero sugestões”, produzir opções ainda não aplicadas, sempre distinguindo recomendação de escolha.

## 9. Não preencher artificialmente

Períodos livres são válidos.

Densidade funciona como limite/contexto. “Há espaço” não basta para inserir complemento.

Uma Proposal com poucos itens, sem complemento ou vazia é válida quando coerente com as escolhas e evidências.

## 10. Inclusões e exclusões

Cada candidato da Proposal deve permitir entender sua origem.

Candidatos selecionados que não entrarem devem manter motivo explicável, por exemplo:

- capacidade insuficiente;
- conflito temporal;
- horário conhecido incompatível;
- distância/região incompatível com a composição daquele dia;
- dados necessários insuficientes;
- fora da ReplanningWindow.

Somente fatos sustentados podem ser apresentados como confirmados.

## 11. Pós-wizard

Depois que existir Roteiro:

```text
Minha viagem
├── Hoje
├── Roteiro
├── Explorar
├── Minha seleção
├── Mapa
└── Configurações da viagem
```

Os rótulos visuais podem evoluir, mas a experiência deve mudar de preparação para operação.

Nova preferência não altera silenciosamente o Roteiro. O usuário solicita nova Proposal quando desejar incorporar mudanças.

## 12. Viagem em andamento

Replanejamento:

1. é explícito;
2. usa o mesmo pipeline de Proposal;
3. usa `generationScope = REPLAN`;
4. respeita `ReplanningWindow`;
5. não altera passado nem trecho transcorrido;
6. mantém Activities/Free Periods protegidos;
7. permite aceite total ou parcial.

## 13. Fluxos normativos

### A — primeira viagem

```text
Criar Trip
→ Explorar
→ expressar intenções
→ completar contexto mínimo
→ revisar Minha seleção
→ gerar Proposal
→ revisar Proposal
→ aceitar
→ Roteiro
```

### B — poucas escolhas

```text
seleção pequena
→ identificar lacunas relevantes
→ manter livre OU sugerir complemento justificável
→ Proposal distingue origem
→ usuário decide
```

### C — muitas escolhas

```text
seleção > capacidade
→ priorizar sem violar restrições
→ Proposal inclui subconjunto
→ exclusões explicadas
```

### D — nenhuma escolha

```text
nenhuma preferência
→ orientar exploração
→ não gerar Roteiro inteiro silenciosamente
```

### E — alteração antes da viagem

```text
alterar TripPlacePreference
→ Itinerary permanece
→ usuário pode solicitar nova Proposal
```

### F — alteração durante a viagem

```text
nova preferência
→ replanejamento explícito
→ ReplanningWindow
→ Proposal
→ aceite
→ apenas futuro elegível muda
```

## 14. Caminhos autorizados

```text
docs/product/user-journeys.md
docs/domain/domain-model.md
docs/domain/business-rules-and-invariants.md
docs/ux/information-architecture.md
docs/ux/user-flows.md
docs/architecture/modules-and-bounded-contexts.md
docs/architecture/adrs/rb-adr-028-trip-place-preference-and-temporal-replanning.md
docs/architecture/adrs/rb-adr-029-complementary-proposal-candidates.md
docs/implementation/increments/rb-inc-207-planning-journey-redesign.md
docs/implementation/context-packs/rb-inc-207-planning-journey-redesign.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 15. Fora de escopo

- componentes, páginas, estilos e Preview;
- banco, migration, API ou Server Action;
- alteração do gerador/compositor;
- implementação de `ROUTEBOOK_RECOMMENDED`;
- algoritmo de preenchimento, scoring ou ranking;
- mudança executável de `includeMaybe`;
- Provider;
- Production.

## 16. Validação obrigatória

```bash
node scripts/validate-docs.mjs
pnpm format:check
```

Além dos gates documentais exigidos pelo AGENTS.md/CI.

### Evidência real

No SHA `81644277819c6549f2106eeed41d8075dac7fcab`:

- Documentation Validation, run `35617897831`: `success`;
- Engineering Validation, run `35617897561`: `success`;
- `Check formatting`: `success`;
- `Validate documentation`: `success`;
- lint, typecheck, migrations, testes de componente/domínio, smoke, build e testes responsivos: `success`.

A tentativa de validação local não executou os comandos do projeto porque o ambiente disponível não resolveu `github.com` para clonar a branch. A evidência canônica desta etapa é o GitHub Actions do PR #504.

## 17. Critérios de aceite

- [x] jornada completa e limites do wizard documentados;
- [x] preferência separada de Activity;
- [x] Minha seleção separada de Roteiro;
- [x] WANT/MAYBE/NOT_INTERESTED/MUST_DO definidos;
- [x] EXPERIENCE/FOOD/NIGHTLIFE/OTHER reconciliados;
- [x] poucas, muitas e nenhuma escolha definidas;
- [x] recomendação complementar especificada sem aplicação silenciosa;
- [x] períodos livres permanecem válidos;
- [x] origem e explicabilidade especificadas;
- [x] experiência pós-wizard especificada;
- [x] replanejamento temporalmente protegido;
- [x] nenhum conceito concorrente com TripPlacePreference;
- [x] validação documental executada;
- [x] CI verde.

## 18. Próximas etapas recomendadas

1. Etapa 2 — contratos executáveis e dados mínimos para suportar o wizard e a proveniência da Proposal.
2. Etapa 3 — experiência visual do wizard de escolha de lugares.
3. Etapa 4 — contexto/preferências progressivas e revisão.
4. Etapa 5 — integração da seleção e dos candidatos complementares com geração de Proposal.
5. Etapa 6 — explicabilidade de inclusões/exclusões e recomendações complementares.
6. Etapa 7 — experiência pós-geração.
7. Etapa 8 — replanejamento durante a viagem.
8. Etapa 9 — consolidação de UX, responsividade e E2E.
