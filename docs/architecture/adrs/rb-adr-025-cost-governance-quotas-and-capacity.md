---
id: RB-ADR-025

title: Estratégia de Governança de Custos, Quotas e Capacidade
description: Define budgets, forecasts, alocação, unit economics, quotas, rate limits, proteção contra runaway cost e decisões de capacidade para Providers, mapas, IA, dados e infraestrutura.

document_type: architecture-decision-record
owner: Architecture

status: Published
version: "0.1.0"

created: "2026-07-27"
last_updated: null

authors:
  - RouteBook Team

tags:
  - architecture
  - adr
  - finops
  - cost-governance
  - quotas
  - capacity
  - ai-cost
  - maps-cost

related_documents:
  - RB-CORE-0002
  - RB-CORE-0004
  - RB-DOM-001
  - RB-ADR-014
  - RB-ADR-015
  - RB-ADR-017
  - RB-ADR-020
  - RB-ADR-021
  - RB-ADR-024

prerequisites:
  - RB-CORE-0002
  - RB-DOM-001
  - RB-ADR-014
  - RB-ADR-015
  - RB-ADR-024

next_documents:
  - RB-ADR-026

ai_context:
  priority: high
  index: true
---

# RB-ADR-025 — Estratégia de Governança de Custos, Quotas e Capacidade

## 1. Status

**Draft**

## 2. Contexto

O RouteBook é inicialmente um projeto pessoal, mas utiliza capacidades com custo variável:

- IA por tokens, chamadas, imagens ou Tools;
- mapas, geocoding, places, rotas e matrizes;
- banco, armazenamento, egress e backups;
- Redis e workflows;
- analytics, erros, logs e traces;
- processamento assíncrono;
- Providers futuros.

Uma funcionalidade tecnicamente correta poderá ser economicamente inviável. Abuso, loop, retry, fan-out, prompt excessivo ou chamada de matriz sem limite poderá consumir o budget rapidamente.

## 3. Problema

É necessário equilibrar:

- utilidade para a decisão;
- experiência;
- confiabilidade;
- custo por Viagem e por decisão útil;
- previsibilidade;
- crescimento;
- proteção contra abuso;
- capacidade de degradar sem quebrar o domínio.

## 4. Decisão

O RouteBook adotará governança FinOps proporcional ao estágio:

1. inventário de custos por Provider e capability;
2. tags e dimensões de alocação;
3. budget mensal e forecast;
4. alertas em múltiplos limiares;
5. quotas e rate limits;
6. limites técnicos por operação;
7. unit economics orientada a Viagem e decisão útil;
8. kill switches;
9. fallback e degradação;
10. revisão periódica de valor versus custo.

## 5. Princípios

- custo é requisito arquitetural;
- budget não substitui rate limiting;
- cache não justifica dados obsoletos apresentados como atuais;
- economia não deverá remover transparência;
- uma decisão útil vale mais que volume de chamadas;
- custo compartilhado deverá ser alocado por Account ou capability quando possível;
- agentes de IA não poderão elevar limites de produção autonomamente.

## 6. Catálogo de custos

Cada Provider deverá registrar:

- modelo de cobrança;
- moeda;
- unidade;
- franquia;
- tiers;
- custo de egress;
- custo de armazenamento;
- limites;
- budget;
- owner;
- alertas;
- plano de desligamento;
- alternativa ou fallback.

## 7. Dimensões

Custos deverão ser observáveis por:

- ambiente;
- Provider;
- capability;
- operação;
- classe de modelo;
- tipo de mapa;
- workflow;
- Account de forma agregada e protegida;
- Trip de forma agregada e protegida;
- deployment ou release.

Não deverão ser enviados dados pessoais para viabilizar alocação.

## 8. Budgets

Haverá:

- budget mensal total;
- sub-budget por Provider crítico;
- reserva para incidentes e picos;
- limiar de atenção;
- limiar de contenção;
- hard limit quando suportado e seguro.

Faixas iniciais:

| Consumo previsto | Ação |
| ---: | --- |
| 50% | revisar tendência |
| 75% | investigar drivers |
| 90% | conter operações não essenciais |
| 100% | aplicar hard limit ou fallback conforme policy |
| >100% | declarar incidente de custo quando houver crescimento ativo |

## 9. Forecast

O forecast combinará:

- histórico;
- crescimento de Trips;
- releases;
- sazonalidade;
- testes;
- alteração de preço;
- mudança de modelo;
- campanhas ou uso público;
- novos Providers.

## 10. Unit economics

Métricas iniciais:

- custo por Trip ativa;
- custo por Viagem com Decisão Assistida Útil;
- custo por proposta gerada;
- custo por recomendação apresentada;
- custo por recomendação aceita;
- custo por rota calculada;
- custo de IA por capability;
- custo de mapa por sessão de decisão.

Nenhuma métrica isolada será usada como definição de Decision Quality.

## 11. Quotas

Quotas poderão existir por:

- Account;
- User;
- Trip;
- sessão;
- IP para tráfego anônimo;
- capability;
- Provider;
- janela de tempo.

Para estado compartilhado, Account será a unidade preferencial.

## 12. Rate limiting

Rate limiting deverá:

- ser server-side;
- possuir chave opaca;
- diferenciar leitura e escrita;
- responder de forma compreensível;
- incluir retry-after quando aplicável;
- não permitir bypass pelo cliente;
- não causar cross-account;
- ter telemetria.

## 13. Limites de IA

- máximo de tokens de entrada e saída;
- máximo de chamadas por caso de uso;
- Tools permitidas por capability;
- tempo limite;
- número de retries;
- modelo aprovado;
- limite de contexto;
- cache apenas para conteúdo compatível;
- orçamento por workflow.

Uma solicitação acima do limite deverá ser resumida, dividida, adiada ou recusada de modo seguro.

## 14. Limites de mapas

- limitar raio e número de lugares;
- evitar Route Matrix cartesiana sem necessidade;
- reutilizar geocodes estáveis conforme termos do Provider;
- aplicar debounce;
- agrupar chamadas;
- preferir cálculo sob demanda;
- usar fallback aproximado apenas com rótulo claro.

## 15. Retries

Retries deverão possuir:

- número máximo;
- backoff;
- jitter;
- idempotência;
- classificação de erro;
- budget de retry;
- circuit breaker quando aplicável.

Falha permanente não deverá virar loop pago.

## 16. Degradação

Ordem preferencial:

1. reduzir processamento não essencial;
2. usar cache válido;
3. reduzir frequência;
4. selecionar alternativa aprovada;
5. desativar capacidade com fallback;
6. bloquear apenas a operação afetada.

A aplicação não deverá inventar distâncias, preços ou disponibilidade para economizar chamadas.

## 17. Feature flags

O `RB-ADR-020` continuará autoridade sobre flags.

Flags poderão:

- limitar rollout;
- selecionar estratégia aprovada;
- acionar fallback;
- desligar Provider;
- reduzir custo.

Elas não substituirão quotas, budgets ou autorização.

## 18. Alertas

Alertas deverão detectar:

- crescimento percentual;
- anomalia por operação;
- retry storm;
- loop de workflow;
- aumento de token;
- crescimento de egress;
- queda de cache hit;
- cardinalidade de logs;
- uso indevido de ambiente de Preview;
- Provider acima do budget.

## 19. Capacidade

Revisões deverão considerar:

- concorrência;
- picos;
- latência;
- pool de conexões;
- filas;
- limites do Provider;
- regiões;
- armazenamento;
- restauração;
- margem de segurança.

## 20. Ambientes

- development usará limites baixos;
- Preview terá quotas e expiração;
- staging não executará carga paga sem propósito;
- production possuirá budgets e hard limits;
- testes de carga usarão plano e janela autorizados.

## 21. Aquisição e mudança de Provider

Antes da adoção:

- estimar custo base e marginal;
- validar termos;
- mapear egress e retenção;
- definir limites;
- testar export;
- estabelecer owner;
- criar dashboard;
- registrar plano de saída.

## 22. Incidente de custo

Será tratado pelo `RB-ADR-024` quando houver:

- crescimento ativo sem causa;
- risco de ultrapassar hard limit;
- abuso;
- credential leak;
- loop;
- cobrança incompatível;
- impacto material no budget.

## 23. Agentes de IA

Agentes não poderão:

- aumentar budget;
- remover hard limit;
- alterar tier comercial;
- ativar Provider pago em produção;
- ampliar rollout;
- desligar alertas;
- executar teste de carga;
- aceitar cobrança;
- escolher modelo mais caro sem policy.

## 24. Métricas

- custo atual e previsto;
- budget consumido;
- custo por capability;
- custo por Trip;
- custo por decisão útil;
- cache hit;
- tokens;
- chamadas de mapas;
- retries;
- throttles;
- operações bloqueadas;
- economia estimada por otimização;
- custo de observabilidade.

## 25. Consequências

Positivas:

- previsibilidade;
- proteção contra runaway cost;
- comparação de valor;
- escolhas arquiteturais conscientes;
- crescimento gradual.

Negativas:

- instrumentação adicional;
- risco de limites agressivos;
- manutenção de catálogo;
- dashboards e alertas;
- necessidade de revisão de preços.

## 26. Implementação

1. inventariar Providers;
2. definir budget inicial;
3. criar dimensões;
4. instrumentar IA e mapas;
5. aplicar quotas;
6. cadastrar kill switches;
7. criar alertas;
8. revisar mensalmente.

## 27. Critérios de conclusão

- Providers catalogados;
- budget total e por Provider;
- alertas de 50%, 75%, 90% e 100%;
- limites de IA e mapas;
- retries governados;
- rate limits server-side;
- métricas por capability;
- kill switches testados;
- primeiro forecast;
- primeira revisão de unit economics.

## 28. Referências

- FinOps Foundation, [FinOps Framework](https://www.finops.org/framework/).
- FinOps Foundation, [Budgeting](https://www.finops.org/framework/capabilities/budgeting/).
- FinOps Foundation, [Forecasting](https://www.finops.org/framework/capabilities/forecasting/).
- FinOps Foundation, [FinOps Phases](https://www.finops.org/framework/phases/).

## 29. Próxima decisão

O `RB-ADR-026` definirá evolução arquitetural, depreciação, atualização de dependências, compatibilidade, migração e encerramento da trilha inicial de ADRs.

## 30. Declaração final

O RouteBook governará custos por Provider, capability, ambiente e unidade de valor.

Budgets, quotas, rate limits, limites de operação, alertas e kill switches funcionarão em conjunto.

O produto otimizará custo sem substituir dados reais por estimativas não declaradas e sem comprometer autorização, privacidade ou Decision Quality.

## 31. Entrada para o registro

```markdown
| RB-ADR-025 | Estratégia de Governança de Custos, Quotas e Capacidade | Architecture Decision Record | Published | 0.1.0 | [rb-adr-025-cost-governance-quotas-and-capacity.md](./architecture/adrs/rb-adr-025-cost-governance-quotas-and-capacity.md) |
```
