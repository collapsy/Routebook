---
id: RB-ADR-026

title: Estratégia de Evolução Arquitetural, Depreciação e Ciclo de Vida Tecnológico
description: Define como o RouteBook propõe, avalia, testa, adota, migra, deprecia e remove tecnologias, contratos, Providers, schemas e decisões arquiteturais.

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
  - governance
  - evolution
  - deprecation
  - lifecycle
  - migration
  - compatibility
  - documentation

related_documents:
  - RB-CORE-0001
  - RB-CORE-0004
  - RB-DOM-001
  - RB-ADR-020
  - RB-ADR-022
  - RB-ADR-023
  - RB-ADR-024
  - RB-ADR-025

prerequisites:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-ADR-023
  - RB-ADR-024
  - RB-ADR-025

next_documents: []

ai_context:
  priority: high
  index: true
---

# RB-ADR-026 — Estratégia de Evolução Arquitetural, Depreciação e Ciclo de Vida Tecnológico

## 1. Status

**Draft**

## 2. Contexto

O RouteBook é documentation-first, AI-first e evoluirá modularmente. Frameworks, Providers, modelos de IA, APIs, schemas, bibliotecas e práticas terão ciclos de vida diferentes.

Sem governança, decisões temporárias tornam-se permanentes, flags não são removidas, contratos se fragmentam, dependências ficam obsoletas e agentes podem introduzir mudanças incompatíveis.

## 3. Problema

O projeto precisa evoluir sem:

- reescrever silenciosamente o domínio;
- quebrar dados ou clientes;
- manter dois caminhos indefinidamente;
- acumular ADRs contraditórios;
- depender de SDK proprietário em toda a aplicação;
- atualizar tecnologia sem evidência;
- deixar componentes sem owner;
- confundir novidade com valor.

## 4. Decisão

O RouteBook adotará um ciclo formal:

```text
necessidade
→ proposta
→ experimento delimitado
→ decisão
→ implementação
→ rollout
→ estabilização
→ consolidação
→ depreciação
→ remoção
→ aprendizado
```

Mudanças materiais exigirão ADR novo ou supersessão explícita. Mudanças locais e reversíveis poderão usar registro técnico menor.

## 5. Autoridade documental

A ordem continuará:

```text
Bible
→ Product
→ Domain
→ Language / Rules / Events
→ Architecture
→ Implementation
```

Arquitetura não poderá redefinir:

- Recommendation;
- Decision;
- Decision Quality;
- Account;
- Trip;
- Roteiro;
- Proposta;
- Preferência;
- ownership ou invariantes.

## 6. Quando criar ADR

Obrigatório quando a decisão:

- afeta múltiplos módulos;
- muda fonte canônica;
- adota Provider crítico;
- altera segurança, privacidade ou autorização;
- cria contrato duradouro;
- muda estratégia de dados;
- altera operação ou recuperação;
- introduz lock-in relevante;
- substitui decisão anterior;
- possui custo difícil de reverter.

## 7. Quando não criar ADR

Não será necessário para:

- refactor interno sem mudança de contrato;
- correção de bug;
- ajuste de estilo;
- versão patch compatível;
- nome local;
- experimento descartável fora de produção;
- mudança já coberta por decisão vigente.

## 8. Estados de ADR

```text
Proposed
→ Draft
→ Accepted
→ Implemented
→ Superseded
→ Deprecated
→ Rejected
```

`Accepted` não significa implementado. `Superseded` preserva o histórico.

## 9. Supersessão

Um ADR substituto deverá declarar:

```yaml
supersedes:
  - RB-ADR-XXX
```

O ADR anterior deverá:

- mudar para `Superseded`;
- referenciar o substituto;
- permanecer disponível;
- não ser apagado;
- manter contexto e consequências.

## 10. Proposta tecnológica

Toda proposta material deverá responder:

- qual problema existe;
- por que agora;
- qual alternativa atual;
- quais opções;
- evidência;
- custo total;
- privacidade e segurança;
- operação;
- recuperação;
- portabilidade;
- migração;
- saída;
- métricas de sucesso;
- critério de abandono.

## 11. Technology Radar

Tecnologias poderão ser classificadas como:

- **Assess** — pesquisa;
- **Trial** — teste delimitado;
- **Adopt** — padrão aprovado;
- **Hold** — não expandir;
- **Remove** — eliminar.

O radar não substituirá ADR para decisões materiais.

## 12. Dependências

Dependências deverão possuir:

- propósito;
- owner;
- versão suportada;
- licença;
- origem;
- criticidade;
- política de atualização;
- verificação de vulnerabilidade;
- plano de remoção quando crítica.

## 13. Atualizações

- patch: automatizável com testes;
- minor: revisar changelog e compatibilidade;
- major: plano de migração e, quando material, ADR;
- runtime e framework: janela regular;
- dependência crítica vulnerável: resposta priorizada;
- versão EOL: migração antes do fim do suporte quando viável.

## 14. Compatibilidade

Contratos públicos ou persistidos seguirão:

- evolução aditiva preferencial;
- readers tolerantes e writers controlados;
- versionamento quando necessário;
- período de transição;
- telemetria de uso antigo;
- documentação de breaking change;
- rollback ou roll-forward testado.

## 15. Schema de dados

Migrations seguirão expand-and-contract:

```text
adicionar
→ escrever compatível
→ backfill
→ ler novo
→ observar
→ parar escrita antiga
→ remover leitura antiga
→ remover coluna ou estrutura
```

Migration destrutiva não deverá depender de rollback impossível.

## 16. APIs e eventos

- schemas versionados;
- idempotência;
- compatibilidade documentada;
- consumidores inventariados;
- janela de depreciação;
- métricas de uso;
- contrato testado;
- remoção após evidência.

## 17. Providers

Integrações deverão usar ports e adapters quando a substituição for relevante.

A troca seguirá:

```text
novo adapter
→ modo shadow ou comparação
→ piloto
→ rollout
→ estabilidade
→ export e reconciliação
→ desligamento
→ remoção
```

## 18. Modelos de IA

Mudança de modelo deverá avaliar:

- contrato de saída;
- segurança;
- qualidade;
- custo;
- latência;
- idiomas;
- Tools;
- privacidade;
- regressões;
- dataset de avaliação;
- fallback.

Nome de modelo não deverá ficar espalhado pelo domínio.

## 19. Feature flags

O `RB-ADR-020` permanece autoridade. Toda flag de migração deverá possuir:

- owner;
- prazo;
- estado final;
- telemetria;
- issue de cleanup;
- critério de remoção.

## 20. Depreciação

Um item será depreciado quando:

- substituto estiver disponível;
- não atender mais a requisitos;
- custo superar valor;
- suporte terminar;
- risco ficar inaceitável;
- contrato for consolidado.

## 21. Aviso de depreciação

Deverá informar:

- alvo;
- motivo;
- substituto;
- impacto;
- início;
- prazo;
- owner;
- instruções de migração;
- exceções;
- data de remoção.

## 22. Remoção

Checklist:

1. confirmar ausência de uso;
2. exportar dados quando aplicável;
3. migrar consumidores;
4. remover secrets;
5. revogar credenciais;
6. remover flags;
7. remover código;
8. remover infraestrutura;
9. atualizar testes;
10. atualizar documentação;
11. atualizar registro de Providers;
12. validar custo zerado;
13. arquivar evidência.

## 23. Dívida técnica

Dívida deverá registrar:

- contexto;
- risco;
- impacto;
- workaround;
- owner;
- data de revisão;
- gatilho;
- estimativa;
- relação com roadmap.

“Depois” sem gatilho não será plano.

## 24. Exceções

Exceção deverá possuir:

- decisão afetada;
- escopo;
- justificativa;
- risco;
- aprovação;
- compensações;
- expiração;
- plano de encerramento.

## 25. Agentes de IA

Agentes poderão:

- detectar dependências obsoletas;
- gerar inventários;
- propor migration;
- atualizar documentação;
- criar testes;
- localizar uso antigo.

Agentes não poderão autonomamente:

- aceitar ADR;
- mudar fonte canônica;
- executar migration destrutiva;
- trocar Provider em produção;
- remover contrato;
- elevar versão major crítica;
- ignorar licença;
- encerrar período de depreciação;
- apagar ADR superseded.

## 26. Governança leve

Enquanto o projeto for pessoal:

- o usuário é autoridade final;
- revisão poderá ser assíncrona;
- evidência continuará obrigatória;
- decisões pequenas serão simplificadas;
- controles críticos não serão removidos por falta de equipe.

## 27. Revisão periódica

Trimestralmente:

- ADRs Draft antigos;
- ADRs Accepted não implementados;
- flags expiradas;
- dependências EOL;
- Providers sem owner;
- exceções vencidas;
- caminhos antigos;
- dívidas de alto risco;
- documentação órfã.

## 28. Métricas

- tempo proposta → decisão;
- tempo decisão → implementação;
- ADRs superseded;
- flags vencidas;
- dependências EOL;
- vulnerabilidades abertas;
- caminhos antigos;
- depreciações atrasadas;
- Providers removidos;
- custo eliminado;
- documentação sem owner.

## 29. Consequências

Positivas:

- evolução rastreável;
- menor lock-in;
- remoção disciplinada;
- contratos mais estáveis;
- agentes com limites claros;
- histórico preservado.

Negativas:

- documentação adicional;
- revisão;
- período de dupla compatibilidade;
- custo de telemetria e migração;
- risco de processo excessivo.

## 30. Implementação

1. adotar template de proposta;
2. publicar estados;
3. criar Technology Radar;
4. inventariar dependências;
5. automatizar checks;
6. criar calendário trimestral;
7. registrar depreciações;
8. fechar o roadmap inicial.

## 31. Critérios de conclusão

- estados documentados;
- supersessão validada;
- processo de migration definido;
- dependências inventariadas;
- Providers com lifecycle;
- política de depreciação;
- checklist de remoção;
- exceções com expiração;
- limites para agentes;
- revisão trimestral agendada;
- roadmap inicial encerrado.

## 32. Gatilhos de revisão

- entrada de novos mantenedores;
- API pública;
- clientes externos;
- múltiplas aplicações;
- requisitos contratuais;
- mudança de stack central;
- crescimento material de Providers;
- operação multinacional;
- volume que exija governança formal.

## 33. Encerramento da trilha inicial

Este é o último ADR planejado da trilha arquitetural inicial.

Novos ADRs deverão surgir por necessidade concreta, não por continuidade numérica.

O próximo identificador disponível será `RB-ADR-027`, mas sua existência não é obrigatória.

## 34. Declaração final

O RouteBook evoluirá por decisões explícitas, contratos compatíveis, migrações observáveis, depreciações com prazo e remoções verificadas.

ADRs antigos serão preservados e superseded, nunca reescritos para apagar o contexto histórico.

A arquitetura inicial encerra-se neste documento. A partir daqui, documentação nova será criada just-in-time quando uma decisão material realmente surgir.

## 35. Entrada para o registro

```markdown
| RB-ADR-026 | Estratégia de Evolução Arquitetural, Depreciação e Ciclo de Vida Tecnológico | Architecture Decision Record | Published | 0.1.0 | [rb-adr-026-architecture-evolution-deprecation-and-technology-lifecycle.md](./architecture/adrs/rb-adr-026-architecture-evolution-deprecation-and-technology-lifecycle.md) |
```
