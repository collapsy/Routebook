---
id: RB-ADR-028
title: TripPlacePreference e janela temporal de replanejamento
description: Define TripPlacePreference como contrato canônico entre Place e Itinerary Proposal e estabelece a janela temporal protegida para replanejamento explícito.
document_type: architecture_decision_record
owner: Architecture
status: Draft
version: "0.2.0"
created: "2026-09-18"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [architecture, adr, trip-collection, place, itinerary-proposal, replanning, timezone]
related_documents: [RB-CORE-0004, RB-PRD-004, RB-PRD-005, RB-PRD-006, RB-PRD-007, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-UX-001, RB-UX-002, RB-UX-005, RB-ARC-002, RB-ADR-027, RB-INC-199, RB-CTX-199, RB-ADR-029]
prerequisites: [RB-ADR-027]
next_documents: [RB-ADR-029]
ai_context:
  priority: critical
  index: true
---

# RB-ADR-028 — TripPlacePreference e janela temporal de replanejamento

## 1. Status da decisão

**Approved**

O responsável humano do projeto aprovou explicitamente esta decisão em `2026-09-18`, após auditoria read-only do repositório e confirmação do pacote de decisões na issue [#481](https://github.com/collapsy/Routebook/issues/481).

O status `Draft` do frontmatter representa publicação documental, não o status interno da decisão.

## 2. Contexto

O RouteBook já separa Place, Saved Place, Recommendation, Itinerary Proposal e Activity. Também preserva o princípio de que uma Proposal só altera o Itinerary após aceite explícito.

Entretanto, Saved Place representa apenas uma associação binária. Ele não distingue intenção positiva, dúvida, rejeição, prioridade ou ausência de avaliação. O gerador vigente também pode usar Recommendations e descobertas não escolhidas pelo viajante como candidatos de Proposal.

Para tornar a seleção do viajante a origem autoritativa da composição e permitir replanejamento durante a Viagem, é necessário publicar um contrato único para intenção por Place e um recorte temporal que proteja o passado e o trecho transcorrido do dia atual.

## 3. Problema

Como evoluir Salvos para uma seleção expressiva sem:

- transformar Place diretamente em Activity;
- perder associações existentes;
- confundir Recommendation com escolha do viajante;
- preencher o Roteiro artificialmente;
- alterar passado, atividades em andamento ou compromissos protegidos;
- criar um segundo pipeline de Proposal?

## 4. Direcionadores

1. controle explícito do viajante;
2. continuidade com Trip Collection e Saved Places existentes;
3. Proposal distinta de estado aplicado;
4. ausência de preenchimento silencioso;
5. determinismo e explicabilidade;
6. proteção temporal timezone-aware;
7. compatibilidade incremental e sem perda de dados;
8. domínio independente de UI, banco e Provider.

## 5. Opções consideradas

### Opção A — Evoluir a associação da Trip Collection para TripPlacePreference

Uma associação única por `TripId + PlaceId` registra intenção e prioridade. A ausência de associação significa Place não avaliado. Saved Place permanece apenas como contrato legado de compatibilidade durante a transição.

### Opção B — Manter Saved Place e criar Place Interest separado

Preserva o modelo atual, mas cria duas associações concorrentes para responder à mesma pergunta e exige resolver divergências entre salvo, interesse e prioridade.

### Opção C — Manter Salvos binário e inferir intenção na geração

Evita mudança de modelo, mas não representa rejeição ou dúvida, confunde descoberta com escolha e exige inferências incompatíveis com o controle do usuário.

## 6. Decisão

A **Opção A** é adotada.

`TripPlacePreference` é o termo canônico e pertence à Trip Collection.

```text
TripPlacePreference
- TripPlacePreferenceId
- TripId
- PlaceId
- intent: WANT | MAYBE | NOT_INTERESTED
- priority: MUST_DO | null
- createdAt
- updatedAt
```

### 6.1 Invariantes

- `TripId + PlaceId` é único.
- Ausência de registro significa Place não avaliado.
- Não existe estado persistido `UNRATED`.
- `MUST_DO` somente é válido com `intent = WANT`.
- `MAYBE` e `NOT_INTERESTED` não possuem prioridade.
- Definir ou limpar preferência não cria, move ou remove Activity.
- Limpar preferência retorna o Place ao estado não avaliado.
- `NOT_INTERESTED` nunca entra automaticamente em Recommendation de preenchimento ou Proposal.
- `MAYBE` só participa da geração quando solicitado explicitamente.

### 6.2 Origem dos candidatos

Uma geração de Proposal utiliza somente:

- preferências `WANT`;
- preferências `MAYBE` quando `includeMaybe = true`.

Recommendations e descobertas permanecem superfícies separadas. Para participar da geração, o Place precisa receber intenção explícita do viajante.

Não há quantidade mínima de preferências. Uma seleção vazia ou pequena pode produzir Proposal sem alterações, desde que o resultado seja explicado.

### 6.3 Prioridade

`MUST_DO` aumenta prioridade, mas não autoriza violar restrições. Um Place obrigatório inviável deve ser excluído com motivo estruturado, nunca forçado para o Roteiro.

### 6.4 Papel no planejamento

Categoria factual de Place e papel de composição são conceitos diferentes. A primeira política versionada deriva:

| Categorias | Planning Role |
| --- | --- |
| `beach`, `nature`, `attraction`, `viewpoint`, `tour` | `EXPERIENCE` |
| `gastronomy` | `FOOD` |
| `nightlife` | `NIGHTLIFE` |
| `shopping` | `OTHER` |

`OTHER` não recebe composição automática especializada até existir política explícita.

### 6.5 Itinerary Proposal

O agregado existente permanece. Uma Proposal de geração inicial ou replanejamento deve poder registrar:

- `generationScope: INITIAL | REPLAN`;
- snapshot/versionamento da seleção;
- opção `includeMaybe`;
- snapshot da janela temporal;
- resultados estruturados de candidatos incluídos e excluídos;
- motivos de exclusão;
- operações `add`, `move`, `update` e `remove`.

Motivos iniciais de exclusão:

```text
NO_CAPACITY
OUTSIDE_REPLANNING_WINDOW
FIXED_ACTIVITY_CONFLICT
TEMPORAL_CONFLICT
KNOWN_CLOSED
MISSING_REQUIRED_DATA
DUPLICATE_PLACE
UNSUPPORTED_PLANNING_ROLE
MAYBE_NOT_REQUESTED
```

O motivo deve refletir evidência conhecida. Ausência de dado não pode ser apresentada como fechamento, indisponibilidade ou conflito confirmado.

Activity só muda por operação aceita e aplicada conforme RB-ADR-027.

### 6.6 Janela temporal

`ReplanningWindow` é um objeto de valor calculado com relógio injetável e timezone IANA da Trip:

```text
ReplanningWindow
- capturedAt
- timeZone
- localDate
- localTime
- eligibleDayIds
- eligibleActivityIds
- protectedActivityIds
- reasonByActivityId
```

Regras normativas:

- Dias anteriores à data local atual são imutáveis.
- No Dia atual, Activity terminada ou em andamento é protegida.
- No Dia atual, Activity com início futuro pode ser elegível quando não for `fixed` ou terminal.
- Sem duração, uma Activity cujo início já passou é protegida.
- Activity sem horário no Dia atual é protegida conservadoramente contra movimentação automática.
- Dias futuros podem ser elegíveis.
- Activity `fixed`, `completed`, `skipped` ou `cancelled` é protegida.
- Activity futura `unavailable` ou `needs-review` pode participar de Proposal explícita, com Justificativa.
- Free Period `protected` permanece intocável; `flexible` pode receber sugestão.
- O timezone do servidor nunca substitui o timezone da Trip.

O decorrer do tempo não altera automaticamente o status de Activity.

## 7. Transição de Saved Places

A implementação futura deverá ser aditiva:

1. preservar a identidade e a chave `TripId + PlaceId` existentes;
2. adicionar intenção, prioridade e atualização temporal;
3. converter cada associação existente para `WANT` com prioridade nula;
4. manter temporariamente comandos e consultas legados como adaptadores;
5. tratar `SavePlace` como `SetTripPlacePreference(WANT)`;
6. tratar `UnsavePlace` como `ClearTripPlacePreference`;
7. manter `/lugares-salvos` como compatibilidade durante a evolução para Minha seleção;
8. não alterar Activities durante a migração.

## 8. Consequências positivas

- escolha explícita passa a ser a fonte autoritativa da geração;
- rejeição e dúvida deixam de ser inferidas;
- Proposal continua auditável e não aplicada;
- Saved Places existentes possuem caminho de migração sem perda;
- geração inicial e replanejamento podem usar o mesmo pipeline;
- passado e compromissos protegidos permanecem estáveis.

## 9. Consequências negativas

- contratos, persistência e UI de Salvos precisarão de transição;
- o gerador atual não poderá continuar promovendo descobertas não selecionadas;
- snapshots e motivos de exclusão aumentam o contrato de Proposal;
- timezone, horários ausentes e estados de Activity exigem testes adicionais;
- `OTHER` terá capacidade de composição limitada inicialmente.

## 10. Riscos e controles

| Risco | Controle |
| --- | --- |
| perda de Saved Places | migration aditiva, backfill verificável e sem remoção de linhas |
| termos concorrentes | `TripPlacePreference` como único termo canônico; Saved Place marcado como legado |
| preenchimento artificial | densidade como limite, nunca meta; seleção vazia é válida |
| violação temporal | relógio injetável, timezone IANA e classificação conservadora |
| MUST_DO inviável | exclusão explicada em vez de violação de restrição |
| PRs concorrentes reforçarem fluxo antigo | adição direta ao Dia permanece secundária e deve ser revisada contra este ADR |

## 11. Implementação incremental

1. publicar contrato documental no RB-INC-199;
2. implementar núcleo puro de TripPlacePreference;
3. adicionar persistência e backfill compatível;
4. publicar Minha seleção e ações de intenção;
5. trocar a fonte de candidatos da Proposal;
6. completar controles de Activity;
7. implementar ReplanningWindow e operações de delta;
8. fechar a jornada durante a Viagem.

Cada passo exige incremento próprio. Este ADR não autoriza implementação ou migration no RB-INC-199.

## 12. Verificação

- documentação sem termos conflitantes;
- validação de IDs, relações e links;
- testes unitários futuros das invariantes;
- testes PostgreSQL futuros de backfill;
- testes futuros de timezone, DST e fronteiras do Dia atual;
- E2E futuro da jornada Explore → Minha seleção → Proposal → aceite → replanejamento.

## 13. Rollback da decisão

Antes de implementação, o rollback consiste em superseder este ADR por nova decisão. Depois de existir persistência, qualquer reversão deverá preservar intenções e associações já registradas; retornar silenciosamente ao modelo binário não será permitido.


## 14. Evolução posterior da origem de candidatos

RB-ADR-029, aprovado em `2026-09-21`, evolui especificamente a exclusividade definida na seção 6.2.

Permanece válido que `WANT` e `MAYBE` autorizado são a única fonte para representar **escolhas do viajante**. Entretanto, a Itinerary Proposal pode também apresentar `ROUTEBOOK_RECOMMENDED` como candidato complementar distinto, com proveniência e Justificativa explícitas, sem criar `TripPlacePreference` e sem aplicar Activity antes do aceite.

Todas as demais decisões deste ADR, incluindo invariantes de `TripPlacePreference`, `MUST_DO`, Planning Role, Proposal não aplicada e `ReplanningWindow`, permanecem vigentes.
