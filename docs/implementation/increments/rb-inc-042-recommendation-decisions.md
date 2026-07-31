---
id: RB-INC-042
title: Decisions e Ações sobre Recommendations
description: Define o incremento que transforma Recommendations em decisões explícitas e efeitos canônicos atômicos e idempotentes.
document_type: implementation-increment
owner: Decision Intelligence
status: Draft
version: "0.2.0"
created: "2026-07-30"
last_updated: "2026-07-30"
authors:
  - RouteBook Team
tags:
  - implementation
  - recommendations
  - decisions
  - itinerary
  - saved-places
related_documents:
  - RB-INC-038
  - RB-INC-039
  - RB-INC-040
  - RB-INC-041
prerequisites:
  - RB-INC-041
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-042 — Decisions e Ações sobre Recommendations

## 1. Objetivo

Permitir que o usuário transforme uma `Recommendation` apresentada em uma escolha explícita: salvar o `Place` ou adicioná-lo ao `Itinerary`. Nenhuma ação pode produzir mutação silenciosa, aceitação parcial ou duplicação.

## 2. Ownership e contratos

- **Decision Intelligence** é owner de `Decision`, identidade, contexto, opção escolhida, efeito declarado e idempotência da decisão.
- **Recommendations** mantém o ciclo de vida de `Recommendation`; a aceitação exige `DecisionId` e ocorre somente após o efeito canônico.
- **Saved Places** é owner de `Saved Place` e da unicidade `(TripId, PlaceId)`.
- **Trip Management** é owner de `Trip`, participante `owner`, `Itinerary`, `Activity`, `Day` e `Free Period`.
- **Place Catalog** é owner de `Place` e vínculo com destino.
- **Database adapter** coordena a transação entre repositories sem transferir invariantes de domínio para Drizzle.

O domínio de Decision Intelligence não depende de Drizzle, Next.js, React ou APIs web.

## 3. Modelo mínimo de Decision

`Decision` é imutável e contém:

- `DecisionId`;
- `TripId`;
- `RecommendationId` opcional;
- `actorParticipantId`, necessariamente o participante local persistido com papel `owner`;
- `decidedAt`;
- `type`: `save-place` ou `add-to-itinerary`;
- `chosenOption` discriminada por tipo;
- `contextSnapshot` mínimo e relevante;
- `effect`, inicialmente `saved-place` ou `itinerary-activity`;
- `idempotencyKey` estável por intenção do cliente.

Não há autenticação real neste incremento. O ator é resolvido a partir da `Trip`; sua ausência é erro de aplicação e permanece limitação documentada.

## 4. Estados e transições

A ação somente aceita `Recommendation` em estado `presented`, dentro da validade e pertencente à mesma `Trip`. Estados `accepted`, `rejected`, `expired`, `invalidated` e `superseded` são terminais para nova aceitação.

Fluxo lógico:

1. `presented` + comando válido;
2. efeito canônico persistido;
3. `Decision` persistida/recuperada por idempotência;
4. `Recommendation` vinculada à `Decision` e marcada `accepted`;
5. commit.

Uma `Recommendation` nunca transita para `accepted` sem `DecisionId` válido.

## 5. Idempotência

- A chave de idempotência é obrigatória, não vazia e única por `TripId`.
- Reenvio com a mesma chave e o mesmo payload retorna o resultado anterior.
- Reuso da chave com payload semanticamente diferente é conflito.
- Salvar Lugar também preserva a unicidade canônica `(TripId, PlaceId)`.
- Adicionar ao Roteiro relaciona a `Activity` à mesma `Decision`; a mesma Decision não pode criar segunda Activity.
- Reenvios não criam segunda Decision.

## 6. Ação Salvar Lugar

Pré-condições: Recommendation apresentada e válida; Trip, Place, Recommendation e owner coerentes; alvo do tipo Place publicado.

Efeito:

1. executar o contrato idempotente de `@routebook/saved-places`;
2. não criar `Activity`;
3. persistir ou recuperar a `Decision`;
4. aceitar a Recommendation;
5. confirmar a transação.

Lugar já salvo é sucesso idempotente. Place ou Recommendation de outra Trip/Destination é rejeitado sem efeitos.

## 7. Ação Adicionar ao Roteiro

O comando exige `dayId` explícito. `startTime` e `durationMinutes` são opcionais. Não se infere dia, horário, duração ou transporte.

O efeito reutiliza `addActivity` e suas invariantes. O comando não pode preencher `Free Period` protegido, remover Saved Place ou contornar validações do Itinerary. A Activity deve guardar a relação causal com a Decision para impedir duplicação.

## 8. Fronteira transacional e recuperação

O adapter Drizzle abre uma única transação e fornece repositories vinculados ao mesmo executor transacional.

Ordem obrigatória:

1. carregar e validar Recommendation;
2. carregar e validar Trip, Place, owner e contexto;
3. validar elegibilidade para aceitação;
4. resolver idempotência e conflitos;
5. executar o efeito canônico;
6. persistir/relacionar Decision;
7. aceitar Recommendation;
8. commit.

Qualquer exceção provoca rollback integral. Após falha, não pode existir Recommendation aceita, Decision concluída sem efeito, Saved Place parcial ou Activity parcial. Uma nova tentativa segura reutiliza a mesma chave.

## 9. Regras cross-trip

Todos os IDs participantes devem convergir para o mesmo `TripId`. `Recommendation.snapshot.tripId`, Decision, Saved Place, Itinerary, Day, Activity e owner devem pertencer à Trip do comando. Divergência é erro não recuperável por retry com o mesmo payload.

## 10. Interface web

Cada card oferece ações explícitas. Durante envio, controles ficam desabilitados e exibem feedback de carregamento. Sucesso e erro têm mensagens acessíveis e específicas.

“Adicionar ao Roteiro” abre confirmação com Dia obrigatório, horário e duração opcionais. A interface não inventa valores ausentes. Após sucesso, o card reflete aceitação; após recarga, o estado vem da persistência.

## 11. Critérios de aceite

- [ ] Decision imutável, validada e independente de infraestrutura;
- [ ] ator é o owner persistido da Trip;
- [ ] salvar é idempotente e não cria Activity;
- [ ] adicionar exige Dia explícito e reutiliza `addActivity`;
- [ ] mesma Decision não duplica Saved Place, Activity ou Decision;
- [ ] Recommendation somente é aceita após efeito bem-sucedido;
- [ ] estados terminais e operações cross-trip são bloqueados;
- [ ] rollback elimina qualquer estado parcial;
- [ ] feedback e resultado persistem após recarga;
- [ ] desktop e mobile cobrem o fluxo completo.

## 12. Estratégia de testes

### Domínio

Criação, identidade, ator, instante, tipo, opção, snapshot, Recommendation opcional, imutabilidade, chave de idempotência e bloqueio de estados terminais.

### Aplicação e persistência

Salvar/Decision/Activity idempotentes; reenvio; conflito de chave; cross-trip; owner ausente; Recommendation inválida, expirada, invalidada ou superseded; falhas antes e durante a transação; rollback integral; ausência de aceitação e conclusão parciais.

### E2E

Desktop e mobile: ignorar e recarregar; salvar e verificar Salvos; adicionar com Dia explícito e verificar Roteiro; recarregar; repetir ações; validar sucesso, erro e prevenção de múltiplos envios com locators semânticos estáveis.

## 13. Limitações e fora de escopo

Autenticação completa, Decision Outcome/Quality avançados, propostas automáticas, Planning Conflict, LLM/agentes, notificações, analytics avançado, jobs e cache distribuído.

## 14. Branch

Branch `feature/rb-inc-042-recommendation-decisions`, baseada na `main` no merge commit consolidado `fb4b46e3881a8c1adb5f30c90a815593b47f0212`. A PR #94 permanece Draft até a conclusão integral do incremento.
