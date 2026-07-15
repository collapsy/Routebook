---
id: RB-CORE-0004

title: RouteBook Bible
description: Constituição conceitual do RouteBook. Define os princípios permanentes, a terminologia oficial e o modelo mental que orientam todas as decisões de produto, arquitetura e documentação.

document_type: core
owner: Foundation
status: Draft
version: "1.0.0"

created: "2026-07-15"
last_updated: null

authors:
  - Epic Foundation
---

# RouteBook Bible

## 1. Introdução

A **RouteBook Bible** é o documento de maior autoridade conceitual do projeto RouteBook.

Seu propósito não é documentar funcionalidades, arquitetura técnica ou processos de desenvolvimento. Sua responsabilidade é definir o conhecimento permanente do domínio, estabelecendo os conceitos fundamentais que orientam todas as decisões relacionadas ao produto.

Enquanto outros documentos descrevem *o que será construído*, *como será construído* ou *por que determinada iniciativa existe*, este documento define **como o RouteBook compreende o mundo**.

Toda evolução do produto deve permanecer consistente com os princípios estabelecidos nesta Bible.

Em caso de conflito entre documentos, a RouteBook Bible prevalece.

---

# 2. Propósito da Bible

A Bible existe para preservar a identidade intelectual do RouteBook ao longo do tempo.

Tecnologias evoluem.

Modelos de IA evoluem.

Frameworks são substituídos.

Arquiteturas mudam.

Entretanto, o entendimento do domínio não deve depender dessas mudanças.

Este documento representa a camada mais estável do conhecimento do projeto.

Seu objetivo é garantir que futuras decisões continuem alinhadas com a visão original do produto, independentemente da equipe, das tecnologias adotadas ou da maturidade da plataforma.

---

# 3. Escopo

Esta Bible define exclusivamente conceitos permanentes do domínio.

Incluem-se:

- terminologia oficial;
- princípios permanentes;
- filosofia do produto;
- definições do domínio;
- modelos mentais;
- conceitos de decisão;
- conceitos de recomendação;
- linguagem oficial do projeto;
- relações entre os conceitos fundamentais.

Não fazem parte deste documento:

- requisitos funcionais;
- arquitetura técnica;
- APIs;
- banco de dados;
- componentes de interface;
- tecnologias específicas;
- cronogramas;
- processos operacionais.

Esses assuntos pertencem aos documentos especializados correspondentes.

---

# 4. A Natureza do RouteBook

O RouteBook não é um catálogo de viagens.

O RouteBook não é um guia turístico.

O RouteBook não é um planejador tradicional.

O RouteBook é uma **Travel Decision Intelligence Platform**.

Essa definição é permanente e deve ser utilizada em toda a documentação oficial.

Seu propósito é reduzir a complexidade inerente à tomada de decisão durante uma viagem.

O produto não busca apresentar o maior número possível de opções.

Seu objetivo é aumentar a qualidade das decisões tomadas pelo usuário.

A diferença é fundamental.

Enquanto sistemas tradicionais maximizam informação, o RouteBook busca maximizar clareza.

Enquanto guias turísticos apresentam possibilidades, o RouteBook recomenda decisões.

---

# 5. Filosofia Fundamental

Toda decisão de produto deve responder positivamente à seguinte pergunta:

> Esta decisão ajuda o usuário a tomar uma decisão melhor durante sua jornada?

Se a resposta for negativa, a iniciativa não está alinhada ao propósito do RouteBook.

Essa filosofia substitui métricas baseadas exclusivamente em quantidade de funcionalidades, número de integrações ou volume de informações apresentadas.

O valor do produto é medido pela qualidade das decisões que ele permite ao usuário tomar.

---

# 6. O Problema Fundamental

Viajar exige uma sequência contínua de decisões.

Algumas são simples.

Outras possuem alto impacto.

Entre elas:

- para onde ir;
- quando sair;
- qual transporte utilizar;
- onde comer;
- quanto gastar;
- quanto tempo investir;
- quais alternativas possuem melhor relação entre custo, tempo e experiência.

O problema não é a ausência de informação.

Na maioria dos casos, existe informação em excesso.

O verdadeiro problema é transformar informação em decisão.

Essa distinção fundamenta toda a existência do RouteBook.

---

# 7. O Paradigma do RouteBook

O RouteBook adota um paradigma diferente das plataformas tradicionais de turismo.

A unidade central do domínio não é o destino.

Não é o restaurante.

Não é o hotel.

Não é a atração.

A unidade central do domínio é a **decisão**.

Todos os demais elementos existem apenas porque influenciam decisões.

Locais.

Eventos.

Clima.

Horários.

Custos.

Preferências.

Todos representam contexto para apoiar uma decisão.

Essa mudança de perspectiva orienta toda a modelagem conceitual do produto.

---

# 8. A Linguagem Oficial do Projeto

A linguagem utilizada pelo RouteBook deve refletir seu modelo mental.

Alguns termos são considerados oficiais e não devem possuir sinônimos em documentos técnicos.

## Utilizar

- Decision
- Recommendation
- Context
- Journey
- User Context
- Decision Quality
- Recommendation Confidence
- Next Best Action
- Decision Intelligence
- Explainability
- Adaptive Travel
- Dynamic Planning

## Evitar

Expressões como:

- dica;
- sugestão aleatória;
- lista de lugares;
- catálogo de atrações;
- guia turístico;
- ranking de restaurantes.

Esses termos não representam corretamente o domínio e podem induzir interpretações incompatíveis com o propósito do produto.

Quando necessário, documentos destinados ao público externo podem utilizar linguagem mais acessível, desde que a modelagem conceitual permaneça consistente com esta Bible.

---

# 9. Princípios Permanentes

Os princípios descritos nesta seção representam regras permanentes do domínio. Eles não dependem da tecnologia utilizada nem do estágio de evolução do produto.

## 9.1 O usuário toma decisões; o RouteBook as potencializa

O RouteBook nunca substitui completamente a autonomia do usuário.

Seu papel é ampliar a capacidade de decisão por meio de contexto, recomendações e explicações.

A decisão final permanece sob responsabilidade do viajante.

---

## 9.2 Toda recomendação deve possuir propósito

Nenhuma recomendação deve existir apenas porque existe informação disponível.

Uma recomendação somente possui valor quando contribui para uma decisão concreta.

---

## 9.3 Contexto precede recomendação

Sem contexto não existe recomendação de qualidade.

A compreensão da situação atual do usuário é um requisito conceitual para qualquer processo de apoio à decisão.

---

## 9.4 Clareza supera quantidade

Apresentar menos opções pode produzir decisões melhores.

A redução da carga cognitiva possui prioridade sobre o aumento do volume de informações.

---

## 9.5 Explicabilidade é parte da recomendação

Uma recomendação incompreensível reduz confiança.

Sempre que possível, recomendações devem ser acompanhadas de justificativas compreensíveis ao usuário.

Explicar não significa revelar detalhes técnicos do sistema, mas fornecer razões suficientes para que o usuário compreenda por que determinada decisão foi sugerida.

---

## 9.6 A confiança é construída, não presumida

O usuário deve desenvolver confiança na plataforma por meio da consistência entre contexto, recomendações e resultados observados.

A confiança não decorre da autoridade da IA, mas da qualidade percebida das decisões apoiadas por ela.

---

## 9.7 O produto evolui; os princípios permanecem

Novas funcionalidades podem surgir.

Novos modelos de IA podem ser incorporados.

Novas fontes de dados podem ser utilizadas.

Nenhuma dessas evoluções deve contrariar os princípios estabelecidos nesta Bible.


---

# 10. Modelo Conceitual do Domínio

O RouteBook é fundamentado em um conjunto de conceitos permanentes que definem como o produto interpreta uma viagem e como raciocina sobre decisões.

Esses conceitos formam a linguagem oficial do domínio.

Nenhum documento do projeto deverá redefinir, alterar ou contradizer as definições estabelecidas nesta seção.

Os conceitos apresentados são independentes de tecnologia, arquitetura, modelos de IA ou implementação.

Eles representam abstrações do domínio.

---

# 11. Conceitos Fundamentais

## 11.1 Decision

### Definição

Uma **Decision** representa a escolha que um viajante precisa realizar em determinado momento de sua jornada.

Uma decisão sempre responde a uma necessidade concreta.

Exemplos:

- Para onde ir?
- O que fazer agora?
- Onde almoçar?
- Vale a pena esperar?
- Devo mudar meu roteiro?
- Qual transporte utilizar?

### Importância

A Decision é a entidade conceitual central do RouteBook.

Todos os demais conceitos existem para melhorar a qualidade das decisões tomadas pelo usuário.

Sem uma decisão, não existe motivo para produzir recomendações.

---

## 11.2 Decision Intelligence

### Definição

**Decision Intelligence** é a capacidade de compreender um cenário, interpretar contexto, avaliar alternativas e produzir recomendações capazes de aumentar a qualidade de uma decisão.

No RouteBook, Decision Intelligence representa o principal objetivo da plataforma.

Ela não consiste apenas na utilização de Inteligência Artificial.

Ela combina:

- contexto;
- conhecimento;
- preferências;
- restrições;
- tempo;
- custo;
- aprendizado;
- explicabilidade.

### Importância

Decision Intelligence diferencia o RouteBook de plataformas tradicionais.

Enquanto buscadores respondem perguntas, o RouteBook auxilia decisões.

---

## 11.3 Recommendation

### Definição

Uma **Recommendation** é uma proposta de ação produzida para apoiar uma Decision específica.

Uma Recommendation nunca existe de forma isolada.

Ela sempre possui:

- um objetivo;
- um contexto;
- uma justificativa;
- uma decisão associada.

### Não é uma Recommendation

Não constituem recomendações:

- listas genéricas;
- rankings sem contexto;
- resultados de pesquisa;
- publicidade;
- sugestões sem justificativa.

---

## 11.4 Next Best Action

### Definição

A **Next Best Action (NBA)** representa a melhor decisão recomendada para o momento atual considerando todo o contexto disponível.

Ela não representa a melhor decisão absoluta.

Representa a melhor decisão possível diante das informações conhecidas naquele instante.

### Características

Uma Next Best Action deve ser:

- contextual;
- justificável;
- temporal;
- adaptativa;
- revisável.

A NBA pode mudar continuamente conforme o contexto evolui.

---

## 11.5 Context

### Definição

Context representa todas as informações relevantes que influenciam uma decisão.

O Context não pertence apenas ao usuário.

Ele inclui fatores internos e externos.

Exemplos:

- localização;
- horário;
- clima;
- orçamento;
- disponibilidade;
- preferências;
- mobilidade;
- companhia;
- duração da viagem;
- eventos;
- funcionamento de estabelecimentos.

### Princípio

Nenhuma Recommendation deve ser produzida ignorando Context.

---

## 11.6 User Context

### Definição

User Context representa a parcela do contexto relacionada diretamente ao viajante.

Inclui elementos como:

- preferências;
- restrições;
- histórico;
- orçamento;
- ritmo da viagem;
- interesses;
- necessidades;
- perfil de mobilidade.

O User Context nunca representa o contexto completo.

Ele é apenas um subconjunto do Context.

---

## 11.7 Context Awareness

### Definição

Context Awareness é a capacidade da plataforma de compreender continuamente o estado atual do contexto antes de produzir recomendações.

Não significa apenas possuir dados.

Significa interpretar quais informações realmente impactam a decisão em questão.

### Importância

Quanto maior a Context Awareness, maior tende a ser a qualidade das recomendações.

---

## 11.8 Recommendation Confidence

### Definição

Recommendation Confidence representa o grau de confiança que a plataforma possui em uma recomendação específica.

Ela não mede a probabilidade de sucesso absoluto.

Ela mede o quanto as evidências disponíveis sustentam aquela recomendação.

### Objetivo

Permitir que o usuário compreenda o nível de robustez da recomendação produzida.

---

## 11.9 Decision Quality

### Definição

Decision Quality representa a qualidade da decisão tomada pelo usuário considerando o contexto existente no momento da escolha.

Não deve ser confundida com o resultado obtido posteriormente.

Uma boa decisão pode produzir um resultado inesperado.

Da mesma forma, uma decisão mal fundamentada pode eventualmente gerar um bom resultado por acaso.

### Princípio

O RouteBook busca melhorar a qualidade do processo decisório, e não garantir resultados.

---

## 11.10 Explainability

### Definição

Explainability representa a capacidade de explicar por que determinada Recommendation foi produzida.

A explicação deve responder perguntas como:

- Por que isso foi recomendado?
- Quais fatores influenciaram essa decisão?
- Quais alternativas foram consideradas?
- O que mudaria essa recomendação?

### Importância

Explicabilidade aumenta:

- transparência;
- confiança;
- compreensão;
- autonomia do usuário.

---

## 11.11 Cognitive Load

### Definição

Cognitive Load representa o esforço mental necessário para que o usuário tome uma decisão.

Quanto maior o número de alternativas irrelevantes, maior tende a ser a carga cognitiva.

### Princípio

O objetivo do RouteBook não é fornecer mais informações.

É reduzir o esforço necessário para decidir.

---

## 11.12 Journey

### Definição

Journey representa toda a experiência vivida pelo usuário antes, durante e após uma viagem.

Uma Journey não é apenas um roteiro.

Ela corresponde à sequência contínua de decisões que compõem a experiência do viajante.

### Implicação

O foco do RouteBook está na evolução da Journey por meio de decisões sucessivas.

---

## 11.13 Dynamic Planning

### Definição

Dynamic Planning representa a capacidade de evolução contínua do planejamento da viagem.

O planejamento nunca deve ser considerado definitivo.

Novas informações podem justificar adaptações.

### Princípio

Planejamento é um processo vivo.

Não um documento estático.

---

## 11.14 Adaptive Travel

### Definição

Adaptive Travel representa a capacidade da jornada adaptar-se continuamente ao contexto.

Mudanças de clima.

Alterações de horário.

Mudanças de orçamento.

Imprevistos.

Novas oportunidades.

Todos esses eventos podem alterar a melhor decisão disponível.

### Objetivo

Permitir que a viagem evolua junto com a realidade.

---

## 11.15 AI-First

### Definição

AI-First é um princípio de concepção do produto.

Significa que o RouteBook é desenhado assumindo que Inteligência Artificial faz parte da arquitetura conceitual da solução.

Não significa substituir pessoas.

Não significa automatizar tudo.

Significa projetar experiências nas quais IA amplia a capacidade humana de decisão.

---

## 11.16 Documentation-First

### Definição

Documentation-First estabelece que conhecimento precede implementação.

Toda decisão estrutural deve ser formalizada antes da construção.

A documentação representa a fonte oficial de verdade do projeto.

### Justificativa

Esse princípio promove:

- consistência;
- rastreabilidade;
- evolução sustentável;
- colaboração entre pessoas e agentes de IA.

---

# 12. Relações Conceituais

Os conceitos definidos anteriormente não são independentes.

Eles formam um modelo integrado de tomada de decisão.

A relação fundamental do domínio pode ser representada da seguinte forma:

```
Journey
      │
      ▼
Decision
      │
      ▼
Context
      │
      ▼
Context Awareness
      │
      ▼
Decision Intelligence
      │
      ▼
Recommendation
      │
      ├────────────► Recommendation Confidence
      │
      ├────────────► Explainability
      │
      ▼
Next Best Action
      │
      ▼
Usuário decide
      │
      ▼
Decision Quality
      │
      ▼
Novo Context
```

Esse fluxo representa um ciclo contínuo.

Cada decisão modifica o contexto.

O novo contexto influencia as próximas decisões.

Consequentemente, toda Recommendation é temporária por natureza.

Nenhuma Recommendation deve ser tratada como verdade permanente.

---

# 13. Modelos Conceituais Permanentes

Os conceitos definidos nesta Bible representam os elementos fundamentais do domínio.

Os modelos apresentados nesta seção definem como esses conceitos se relacionam ao longo do tempo.

Esses modelos não representam fluxos de implementação, arquitetura de software ou processos internos da plataforma.

Eles descrevem o funcionamento conceitual do domínio e constituem a base para todas as futuras decisões de produto, experiência do usuário, inteligência artificial e arquitetura.

Sempre que novos recursos forem introduzidos no RouteBook, eles deverão ser compatíveis com estes modelos.

---

# 14. RouteBook Decision Loop

## Objetivo

O **RouteBook Decision Loop** descreve o ciclo permanente de tomada de decisão que caracteriza uma jornada.

O produto não existe para produzir uma única recomendação.

Seu propósito é acompanhar continuamente a evolução das decisões do viajante durante toda a Journey.

Cada decisão altera o contexto.

Cada alteração de contexto pode modificar a próxima melhor decisão.

Assim, o domínio é inerentemente cíclico.

## Modelo

```
Mudança no Contexto
          │
          ▼
Compreensão do Contexto
          │
          ▼
Identificação da Decision
          │
          ▼
Aplicação de Decision Intelligence
          │
          ▼
Produção de Recommendation
          │
          ▼
Explainability
          │
          ▼
Tomada de Decisão pelo Usuário
          │
          ▼
Mudança da Journey
          │
          ▼
Novo Contexto
          │
          └──────────────► reinício do ciclo
```

## Princípios

O Decision Loop possui características permanentes.

### É contínuo

Não existe início ou fim absoluto.

A Journey é composta por sucessivos ciclos de decisão.

### É adaptativo

Mudanças no contexto reiniciam naturalmente o ciclo.

### É incremental

Cada decisão adiciona conhecimento sobre o usuário e sobre sua jornada.

### É não determinístico

O mesmo contexto pode gerar recomendações diferentes caso novos fatores relevantes sejam incorporados.

### É centrado no usuário

A decisão final pertence sempre ao viajante.

O RouteBook participa do processo decisório, mas nunca substitui sua autonomia.

---

# 15. Recommendation Lifecycle

## Objetivo

Toda Recommendation possui um ciclo de vida.

Ela não é uma informação permanente.

Ela existe enquanto permanecer relevante para determinada Decision.

## Ciclo de Vida

```
Necessidade de Decisão
        │
        ▼
Construção do Contexto
        │
        ▼
Geração da Recommendation
        │
        ▼
Avaliação de Confidence
        │
        ▼
Explicação
        │
        ▼
Apresentação ao Usuário
        │
        ▼
Aceita
Ignorada
Substituída
Expirada
        │
        ▼
Arquivada como histórico da Journey
```

## Estados Conceituais

Uma Recommendation pode existir nos seguintes estados:

- Potencial
- Gerada
- Explicada
- Apresentada
- Avaliada
- Aceita
- Rejeitada
- Substituída
- Expirada
- Histórica

Esses estados representam apenas o ciclo conceitual da recomendação.

Eles não correspondem a estados técnicos de implementação.

---

# 16. Context Lifecycle

## Objetivo

O Context é um organismo vivo.

Ele não representa uma fotografia estática.

Representa uma interpretação continuamente atualizada da realidade.

## Fontes de Contexto

O Context pode ser influenciado por fatores como:

- usuário;
- ambiente;
- localização;
- clima;
- tempo;
- orçamento;
- preferências;
- agenda;
- mobilidade;
- disponibilidade;
- eventos externos.

A Bible não limita essas fontes.

Novas categorias poderão surgir sem alterar este modelo.

## Evolução

```
Coleta
      │
      ▼
Interpretação
      │
      ▼
Relevância
      │
      ▼
Utilização
      │
      ▼
Atualização
      │
      ▼
Reinterpretação
```

## Princípios

Nem toda informação constitui Context.

Uma informação somente passa a integrar o Context quando possui capacidade de influenciar uma Decision.

Da mesma forma, um elemento pode deixar de fazer parte do Context quando deixa de impactar decisões futuras.

---

# 17. User Decision Flow

## Objetivo

O RouteBook não modela apenas recomendações.

Ele modela o comportamento decisório do viajante.

O User Decision Flow representa esse processo.

```
Necessidade
      │
      ▼
Objetivo
      │
      ▼
Contexto Atual
      │
      ▼
Recommendation
      │
      ▼
Compreensão
      │
      ▼
Decisão
      │
      ▼
Ação
      │
      ▼
Resultado
      │
      ▼
Novo Contexto
```

## Observações

O produto atua apenas até o momento da decisão.

A execução da ação pertence ao usuário.

O resultado da ação influencia futuras decisões, mas não altera retroativamente a qualidade da decisão originalmente tomada.

---

# 18. Modelo de Evolução da Journey

A Journey é compreendida como uma sequência de estados decisórios.

Ela evolui continuamente.

Não existe uma Journey ideal.

Existe uma Journey que se adapta continuamente às circunstâncias do viajante.

Essa evolução pode ser representada como:

```
Journey Inicial

↓

Decision 1

↓

Journey Atualizada

↓

Decision 2

↓

Journey Atualizada

↓

Decision N

↓

Journey Final
```

Cada Decision modifica parcialmente a Journey.

Portanto, uma Journey nunca deve ser tratada como um plano imutável.

---

# 19. Modelo de Conhecimento do Domínio

Para evitar ambiguidades entre informações permanentes e informações transitórias, o conhecimento utilizado pelo RouteBook é organizado em três camadas conceituais.

## Conhecimento Permanente

Representa informações relativamente estáveis.

Exemplos:

- geografia;
- cultura;
- regras locais;
- características de destinos;
- tipos de estabelecimentos;
- conceitos do domínio.

Esse conhecimento evolui lentamente.

## Conhecimento Contextual

Representa informações válidas apenas para determinado cenário.

Exemplos:

- clima atual;
- horário;
- trânsito;
- lotação;
- orçamento disponível;
- companhia do usuário;
- preferências ativas.

Esse conhecimento muda continuamente.

## Conhecimento Derivado

Representa interpretações produzidas a partir da combinação dos demais conhecimentos.

Exemplos:

- Recommendation;
- Next Best Action;
- Recommendation Confidence;
- alternativas priorizadas;
- riscos identificados.

O conhecimento derivado nunca existe isoladamente.

Ele depende simultaneamente do conhecimento permanente e do conhecimento contextual.

---

# 20. Axiomas do RouteBook

Os axiomas representam verdades fundamentais do domínio.

Eles não dependem de implementação nem de tecnologia.

Sempre que existir dúvida conceitual, estes axiomas devem orientar a decisão.

## Axioma 1

Toda Recommendation existe para apoiar uma Decision.

Sem Decision, não existe Recommendation.

---

## Axioma 2

Toda Decision depende de Context.

Sem Context suficiente, não é possível produzir recomendações confiáveis.

---

## Axioma 3

Context muda continuamente.

Consequentemente, recomendações também podem mudar.

---

## Axioma 4

A melhor decisão é aquela que maximiza a qualidade da decisão considerando o contexto disponível, e não aquela que garante o melhor resultado futuro.

---

## Axioma 5

Explainability faz parte da Recommendation.

Uma recomendação sem justificativa é conceitualmente incompleta.

---

## Axioma 6

A autonomia do usuário é inviolável.

O RouteBook apoia decisões.

Nunca decide pelo viajante.

---

## Axioma 7

Reduzir carga cognitiva possui maior valor do que aumentar a quantidade de informações apresentadas.

---

## Axioma 8

A Journey é composta por decisões sucessivas.

O RouteBook acompanha a evolução da Journey, e não apenas eventos isolados.

---

## Axioma 9

Toda Recommendation possui validade temporal.

Nenhuma Recommendation deve ser considerada permanentemente correta.

---

## Axioma 10

O valor do RouteBook é medido pela melhoria da qualidade das decisões do usuário.

Não pelo número de recomendações produzidas.

---

# 21. Regras Conceituais Permanentes

As regras abaixo devem orientar qualquer evolução futura do produto.

1. Nenhum recurso pode existir sem contribuir para uma Decision.

2. Nenhuma Recommendation pode ignorar Context relevante.

3. Toda Recommendation deve ser potencialmente explicável.

4. O usuário permanece como agente da decisão.

5. A linguagem oficial do projeto deve utilizar os conceitos definidos nesta Bible.

6. Novos conceitos somente podem ser incorporados quando não contradizerem os conceitos fundamentais existentes.

7. Toda evolução do domínio deve preservar a consistência entre Journey, Decision, Context e Recommendation.

8. O domínio deve permanecer independente de fornecedores, modelos de IA, linguagens de programação e tecnologias específicas.

9. A Bible é a autoridade conceitual máxima do projeto.

10. Alterações nesta Bible exigem revisão cuidadosa, pois impactam potencialmente toda a documentação da Foundation e os demais artefatos derivados.


---

# 22. Linguagem Oficial do RouteBook

A linguagem utilizada pelo RouteBook constitui parte integrante da arquitetura do domínio.

A terminologia não possui apenas função descritiva. Ela influencia a forma como pessoas, agentes de IA e futuros sistemas interpretam o produto.

Por esse motivo, a utilização consistente dos termos definidos nesta Bible é obrigatória em toda a documentação oficial.

Os termos oficiais representam conceitos do domínio e não devem ser substituídos por sinônimos que alterem seu significado.

Quando um documento utilizar um conceito definido nesta Bible, deverá utilizar sua nomenclatura oficial.

---

# 23. Glossário Oficial

## Adaptive Travel

Capacidade da Journey adaptar-se continuamente às mudanças do contexto sem perder coerência com os objetivos do viajante.

---

## AI-First

Princípio segundo o qual o produto é concebido assumindo que Inteligência Artificial faz parte de sua arquitetura conceitual, ampliando a capacidade humana de decisão.

---

## Context

Conjunto de informações relevantes que influenciam uma Decision em um determinado momento.

---

## Context Awareness

Capacidade de compreender quais elementos do Context possuem impacto real sobre uma Decision.

---

## Decision

Escolha que o viajante precisa realizar em determinado contexto.

É a unidade central do domínio.

---

## Decision Intelligence

Capacidade de interpretar contexto, avaliar alternativas e produzir recomendações que aumentem a qualidade das decisões.

---

## Decision Quality

Qualidade do processo decisório considerando o contexto disponível no momento da decisão.

---

## Documentation-First

Princípio segundo o qual o conhecimento deve ser documentado antes da implementação.

---

## Explainability

Capacidade de justificar de forma compreensível por que uma Recommendation foi produzida.

---

## Journey

Sequência contínua de decisões que compõem a experiência do viajante.

---

## Next Best Action

Recommendation considerada mais apropriada para o momento atual.

---

## Recommendation

Proposta de ação destinada a apoiar uma Decision específica.

---

## Recommendation Confidence

Grau de confiança atribuído a uma Recommendation com base nas evidências disponíveis.

---

## Travel Decision Intelligence Platform

Definição oficial do RouteBook.

Plataforma dedicada a apoiar decisões durante toda a Journey.

---

## User Context

Subconjunto do Context composto pelas características específicas do viajante.

---

# 24. Léxico Oficial do Projeto

Para preservar a consistência conceitual, determinados termos possuem significado normativo.

## Deve utilizar

| Termo | Utilização |
|--------|------------|
| Journey | Representa toda a experiência da viagem |
| Decision | Representa uma escolha do usuário |
| Recommendation | Representa uma proposta de ação |
| Context | Representa informações relevantes para uma Decision |
| User Context | Representa o contexto específico do viajante |
| Next Best Action | Representa a recomendação prioritária |
| Decision Intelligence | Representa a inteligência aplicada ao processo decisório |
| Explainability | Representa a justificativa de uma Recommendation |
| Decision Quality | Representa a qualidade do processo de decisão |

---

## Evitar

Os termos abaixo podem ser utilizados em comunicação externa quando necessários para facilitar o entendimento do público, mas **não devem ser empregados na modelagem conceitual, documentação técnica ou especificações do projeto**.

| Evitar | Motivo |
|----------|--------|
| Guia turístico | Reduz o escopo do produto |
| Catálogo de viagens | Contradiz o paradigma de Decision |
| Lista de lugares | Ignora o conceito de Recommendation |
| Ranking | Não considera Context |
| Sugestão | Não expressa o rigor conceitual de Recommendation |
| Dica | Excessivamente informal e ambígua |
| Melhor lugar | Generalização incompatível com Context |
| Melhor restaurante | Ignora preferências e situação do usuário |
| Planejamento fixo | Contradiz Dynamic Planning |
| Roteiro definitivo | Contradiz Adaptive Travel |

---

# 25. Ontologia Conceitual

A ontologia do RouteBook descreve as relações permanentes entre os conceitos fundamentais.

Ela não representa um modelo de dados.

Ela representa dependências semânticas.

## Entidade Central

```
Journey
```

A Journey representa o domínio de maior nível.

Todos os demais conceitos existem para apoiar sua evolução.

---

## Relações Primárias

```
Journey
    │
    ├── contém → Decision
    │
    ├── evolui conforme → Context
    │
    └── é aprimorada por → Recommendation
```

---

## Decision

```
Decision

depende de Context

é apoiada por Recommendation

possui Decision Quality

é realizada pelo Usuário
```

---

## Recommendation

```
Recommendation

apoia uma Decision

é produzida por Decision Intelligence

depende de Context Awareness

possui Recommendation Confidence

deve possuir Explainability

possui validade temporal
```

---

## Context

```
Context

inclui User Context

é dinâmico

é continuamente atualizado

influencia Decision

influencia Recommendation
```

---

## Decision Intelligence

```
Decision Intelligence

interpreta Context

gera Recommendation

avalia alternativas

prioriza Next Best Action
```

---

## Next Best Action

```
Next Best Action

é uma Recommendation

representa prioridade

é temporária

é contextual

é revisável
```

---

# 26. Regras de Consistência Semântica

Toda documentação do projeto deve obedecer às seguintes regras.

## Regra 1

Um conceito deve possuir apenas uma definição oficial.

Definições alternativas não são permitidas.

---

## Regra 2

O mesmo termo deve possuir o mesmo significado em toda a documentação.

---

## Regra 3

Conceitos distintos não devem compartilhar o mesmo nome.

---

## Regra 4

Mudanças terminológicas exigem atualização coordenada de toda a documentação impactada.

---

## Regra 5

Nenhum documento pode redefinir conceitos pertencentes à Bible.

---

## Regra 6

Quando um documento especializado precisar aprofundar um conceito definido nesta Bible, ele deverá expandi-lo sem alterar sua definição original.

---

# 27. Hierarquia Conceitual da Documentação

A documentação do RouteBook é organizada em níveis de autoridade.

Cada nível possui responsabilidades específicas.

## Nível 1 — Constituição

**RouteBook Bible**

Responsável por definir:

- conceitos;
- princípios;
- terminologia;
- filosofia;
- linguagem oficial;
- axiomas.

---

## Nível 2 — Fundação

Documentos como:

- README;
- Project Charter;
- Vision.

Responsáveis por interpretar os conceitos definidos na Bible.

Não podem alterá-los.

---

## Nível 3 — Estratégia e Produto

Exemplos:

- PRD;
- Product Strategy;
- Roadmap;
- Personas;
- UX Principles.

Aplicam os conceitos da Foundation ao planejamento do produto.

---

## Nível 4 — Arquitetura

Exemplos:

- Architecture;
- AI Architecture;
- Domain Model;
- Data Model;
- APIs.

Traduzem os conceitos em soluções técnicas.

---

## Nível 5 — Implementação

Exemplos:

- código;
- testes;
- pipelines;
- infraestrutura;
- componentes.

Representam a concretização técnica das decisões definidas nos níveis superiores.

---

# 28. Governança Conceitual

A evolução do domínio deve preservar a estabilidade da Bible.

Alterações neste documento possuem impacto potencial sobre todo o ecossistema RouteBook.

Por esse motivo, modificações conceituais devem seguir princípios rigorosos.

## Princípio da Estabilidade

Conceitos fundamentais devem permanecer estáveis ao longo do tempo.

Mudanças frequentes reduzem a confiabilidade da documentação e comprometem a evolução do conhecimento.

---

## Princípio da Compatibilidade

Novos conceitos devem complementar o domínio existente.

Nunca substituí-lo sem justificativa formal.

---

## Princípio da Não Contradição

Nenhum novo conceito pode contradizer:

- os axiomas;
- os princípios permanentes;
- as definições oficiais;
- a ontologia do domínio.

Caso exista conflito, a proposta deve ser revista antes de sua incorporação.

---

## Princípio da Justificativa

Toda alteração conceitual deve responder claramente:

- Qual problema está sendo resolvido?
- Por que o conceito atual é insuficiente?
- Quais documentos serão impactados?
- A mudança preserva a identidade do RouteBook?

---

## Princípio da Evolução Incremental

Sempre que possível, conceitos existentes devem ser ampliados em vez de substituídos.

A estabilidade da linguagem possui prioridade sobre a introdução de novos termos.

---

# 29. Critérios para Inclusão de Novos Conceitos

Um novo conceito somente deve ser incorporado à Bible quando atender simultaneamente aos seguintes critérios.

- Representa um elemento permanente do domínio.
- Não depende de tecnologia específica.
- Não descreve uma funcionalidade.
- É reutilizável em múltiplos documentos.
- Possui definição inequívoca.
- Possui relação clara com os conceitos existentes.
- Contribui para aumentar a compreensão do domínio.
- Não introduz redundância conceitual.

Caso qualquer um desses critérios não seja atendido, o conceito deve permanecer em documentação especializada e não na Bible.

---

# 30. Papel da Bible no Ecossistema RouteBook

A RouteBook Bible constitui a principal fonte de conhecimento conceitual do projeto.

Ela orienta:

- decisões de produto;
- decisões arquiteturais;
- experiência do usuário;
- modelagem de domínio;
- documentação;
- agentes de IA;
- mecanismos de RAG;
- onboarding de novos integrantes.

Todos os documentos derivados devem ser interpretados à luz desta Bible.

Quando houver divergência entre documentos, prevalece a interpretação compatível com os conceitos estabelecidos neste documento.

A evolução tecnológica do RouteBook é esperada.

A evolução de seus princípios deve ser excepcional.

Essa distinção garante que o projeto preserve sua identidade independentemente das soluções técnicas adotadas.
