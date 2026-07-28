---
id: RB-ADR-024

title: Estratégia de Gestão de Incidentes e Resposta Operacional
description: Define severidade, comando, comunicação, contenção, recuperação, evidências, postmortems e melhoria contínua para incidentes técnicos, de segurança, privacidade, dados, IA e Providers.

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
  - incident-management
  - incident-response
  - operations
  - security
  - privacy
  - reliability

related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-ADR-013
  - RB-ADR-014
  - RB-ADR-015
  - RB-ADR-017
  - RB-ADR-019
  - RB-ADR-022
  - RB-ADR-023

prerequisites:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-ADR-015
  - RB-ADR-022
  - RB-ADR-023

next_documents:
  - RB-ADR-025
  - RB-OPS-005

ai_context:
  priority: high
  index: true
---

# RB-ADR-024 — Estratégia de Gestão de Incidentes e Resposta Operacional

## 1. Status

**Draft**

## 2. Contexto

O RouteBook depende de aplicação web, PostgreSQL, Redis, workflows, mapas, IA, analytics e outros Providers. Falhas poderão afetar disponibilidade, integridade, confidencialidade, custo, decisões do usuário e continuidade de uma Viagem.

Uma resposta improvisada aumenta o dano. A estratégia precisa permitir reconhecer o incidente, reduzir impacto, preservar evidências, coordenar ações, comunicar de forma honesta e transformar aprendizado em mudança verificável.

## 3. Decisão

O RouteBook adotará um processo único de gestão de incidentes com especializações para:

- disponibilidade e desempenho;
- segurança;
- privacidade;
- perda ou corrupção de dados;
- IA e decisões inadequadas;
- custos anormais;
- falhas de Providers;
- abuso e fraude.

O ciclo seguirá:

```text
preparar
→ detectar
→ classificar
→ responder
→ conter
→ recuperar
→ comunicar
→ revisar
→ melhorar
```

## 4. Princípios

- proteger pessoas e dados primeiro;
- interromper dano antes de otimizar disponibilidade;
- manter uma linha do tempo factual;
- trabalhar com papéis claros;
- executar ações reversíveis quando possível;
- não ocultar incerteza;
- não apagar evidências;
- não usar postmortem para culpabilização;
- validar recuperação antes de encerrar.

## 5. Severidade

| Nível | Definição | Exemplos | Resposta inicial |
| --- | --- | --- | ---: |
| SEV-1 | impacto crítico ou risco ativo amplo | vazamento, cross-account, corrupção, indisponibilidade total durante viagens | 15 min |
| SEV-2 | impacto alto e relevante | função principal indisponível, Provider crítico falhando, degradação grave | 30 min |
| SEV-3 | impacto moderado ou contido | falha parcial com workaround, atraso operacional | 4 h |
| SEV-4 | baixo impacto | defeito sem risco imediato, alerta informativo | próximo ciclo |

No projeto pessoal, “resposta” significa reconhecer, classificar e iniciar contenção; não implica equipe disponível 24x7.

## 6. Critérios de elevação

Qualquer incidente será elevado quando houver:

- possível acesso entre Accounts;
- dados pessoais expostos;
- localização ou Hospedagem afetada;
- dados de menores;
- exclusão ou consentimento desrespeitado;
- Tool mutável executada incorretamente;
- custo crescendo sem limite;
- perda de integridade;
- impacto durante execução de viagem;
- incerteza superior à capacidade de contenção.

## 7. Papéis

| Papel | Responsabilidade |
| --- | --- |
| Incident Commander | define prioridades e coordena |
| Operations Lead | executa contenção e recuperação |
| Scribe | mantém timeline, decisões e evidências |
| Communications Lead | prepara atualizações |
| Security/Privacy Lead | avalia risco, obrigações e preservação |
| Product/Domain Lead | valida experiência e integridade semântica |

Uma pessoa poderá acumular papéis, mas deverá registrar explicitamente quando estiver mudando de função.

## 8. Fonte canônica do incidente

Cada incidente deverá possuir registro com:

- identificador;
- severidade;
- status;
- início observado e provável;
- serviços e capacidades afetados;
- Accounts ou escopo estimado;
- Incident Commander;
- timeline;
- hipóteses;
- ações;
- decisões;
- comunicação;
- evidências;
- recuperação;
- ações posteriores.

Chats e mensagens não serão a única fonte canônica.

## 9. Estados

```text
suspected
→ declared
→ contained
→ recovering
→ monitoring
→ resolved
→ reviewed
→ closed
```

Um incidente poderá retornar a estado anterior se surgirem novas evidências.

## 10. Detecção

Fontes:

- alertas;
- Sentry;
- métricas;
- logs;
- health checks;
- relatórios de usuários;
- anomalias de custo;
- alertas de Providers;
- checks de integridade;
- product analytics apenas como sinal complementar.

Ausência de alerta não prova ausência de incidente.

## 11. Primeiros 15 minutos

Para SEV-1:

1. abrir registro;
2. atribuir Incident Commander;
3. declarar severidade provisória;
4. preservar evidências;
5. conter mutações arriscadas;
6. avaliar kill switches;
7. proteger credenciais;
8. identificar impacto conhecido e desconhecido;
9. estabelecer próxima atualização;
10. evitar mudanças não relacionadas.

## 12. Contenção

Opções:

- desativar capability por flag;
- bloquear endpoint;
- colocar operação em somente leitura;
- pausar workflow;
- revogar token;
- rotacionar secret;
- isolar Provider;
- reduzir limites;
- interromper deployment;
- redirecionar para fallback;
- preservar cópia forense.

Feature flag não substituirá autorização, e kill switch não apagará efeitos já iniciados.

## 13. Segurança e privacidade

Incidentes potenciais de segurança ou privacidade exigirão:

- preservação de evidências;
- restrição de acesso;
- avaliação de dados, titulares e terceiros;
- consulta ao registro de tratamentos;
- verificação de obrigação de comunicação;
- coordenação com Providers;
- registro de decisões e prazos;
- não inclusão de dados pessoais desnecessários no canal operacional.

O documento não substitui avaliação jurídica.

## 14. Incidentes de IA

Incluem:

- recomendação perigosa;
- contexto de Account incorreto;
- vazamento por prompt ou Tool;
- resposta incompatível com policy;
- execução mutável indevida;
- custo ou latência anormal;
- modelo degradado;
- proveniência ausente.

Controles:

- desativar capability;
- limitar Tools;
- selecionar fallback aprovado;
- preservar inputs minimizados e metadados;
- avaliar alcance;
- revisar dataset de avaliação;
- impedir repetição antes de reativar.

## 15. Comunicação

Toda comunicação deverá separar:

- o que sabemos;
- o que ainda não sabemos;
- impacto;
- ações em andamento;
- orientação ao usuário;
- próxima atualização.

Não deverão ser publicados:

- hipóteses como fatos;
- detalhes exploráveis;
- dados pessoais;
- culpa individual;
- prazo de recuperação sem evidência.

## 16. Frequência

- SEV-1: atualizações internas a cada 30 min e externas conforme impacto;
- SEV-2: a cada 60 min;
- SEV-3: por marco;
- SEV-4: no fluxo normal.

## 17. Recuperação

Antes de retornar:

- causa imediata contida;
- integridade validada;
- autorização validada;
- cross-account testado;
- privacidade reconciliada;
- filas e efeitos conciliados;
- alertas ativos;
- rollback possível;
- capacidade observada em produção controlada.

## 18. Postmortem

Obrigatório para:

- SEV-1;
- SEV-2;
- incidente de segurança ou privacidade relevante;
- corrupção ou perda de dados;
- repetição de SEV-3;
- quase incidente com potencial crítico.

O postmortem conterá:

- resumo;
- impacto;
- detecção;
- timeline;
- causa;
- fatores contribuintes;
- o que funcionou;
- o que falhou;
- ações com owner e prazo;
- riscos aceitos;
- evidências de conclusão.

## 19. Causa raiz

“Erro humano” não será aceito como causa final. A análise deverá investigar:

- controles ausentes;
- interface insegura;
- acesso excessivo;
- revisão insuficiente;
- teste inexistente;
- observabilidade incompleta;
- automação frágil;
- pressão ou incentivo;
- documentação desatualizada.

## 20. Ações corretivas

Cada ação deverá ser:

- específica;
- priorizada por risco;
- atribuída;
- datada;
- testável;
- rastreável ao incidente;
- encerrada somente com evidência.

## 21. Exercícios

- tabletop trimestral;
- simulação técnica semestral;
- restauração conforme `RB-ADR-023`;
- cenário anual de segurança ou privacidade;
- exercício após mudança material de arquitetura.

## 22. Métricas

- tempo para detectar;
- tempo para reconhecer;
- tempo para conter;
- tempo para recuperar;
- recorrência;
- incidentes por severidade;
- alertas sem ação;
- ações vencidas;
- custo do incidente;
- usuários ou viagens afetadas;
- falhas de comunicação.

Métricas não serão usadas para punir quem reporta incidentes.

## 23. Consequências

Positivas:

- resposta coordenada;
- menor tempo de contenção;
- comunicação previsível;
- aprendizado rastreável;
- integração com DR, privacidade e segurança.

Negativas:

- carga operacional;
- necessidade de treino;
- manutenção de runbooks;
- risco de burocracia para incidentes pequenos.

## 24. Implementação

1. criar registro e template;
2. definir canais e contatos;
3. cadastrar kill switches;
4. criar `RB-OPS-005`;
5. executar primeiro tabletop;
6. validar comunicação;
7. medir e ajustar severidades.

## 25. Critérios de conclusão

- matriz de severidade aprovada;
- papéis definidos;
- registro canônico disponível;
- runbook disponível;
- contatos e Providers inventariados;
- kill switches testados;
- template de comunicação pronto;
- template de postmortem pronto;
- primeiro exercício concluído;
- ações rastreadas.

## 26. Referências

- NIST, [Incident Response](https://csrc.nist.gov/projects/incident-response).
- NIST SP 800-61 Rev. 3, [Incident Response Recommendations and Considerations](https://csrc.nist.gov/pubs/sp/800/61/r3/final).
- NIST SP 800-34 Rev. 1, [Contingency Planning Guide](https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final).

## 27. Próxima decisão

O `RB-ADR-025` definirá governança de custos, quotas, budgets, alertas, unit economics e limites para Providers.

## 28. Declaração final

O RouteBook tratará incidentes por um processo único, com severidade, comando, contenção, recuperação, comunicação, postmortem e melhoria.

Incidentes de dados, privacidade, segurança, IA e custos receberão controles especializados sem perder uma linha do tempo comum.

## 29. Entrada para o registro

```markdown
| RB-ADR-024 | Estratégia de Gestão de Incidentes e Resposta Operacional | Architecture Decision Record | Published | 0.1.0 | [rb-adr-024-incident-management-and-operational-response.md](./architecture/adrs/rb-adr-024-incident-management-and-operational-response.md) |
```
