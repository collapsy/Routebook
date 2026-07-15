---
id: RB-PROD-0001

title: Product Requirements Document (PRD)
description: Especificação oficial do comportamento do produto RouteBook, transformando a visão estratégica da Foundation em requisitos claros, verificáveis e implementáveis.

document_type: product
owner: Product
status: Draft
version: "1.0.0"

created: "2026-07-15"
last_updated: null

authors:
  - Product Team

reviewers:
  - Head of Product
  - UX Team
  - Architecture Team
  - AI Team

approvers:
  - Product Owner

depends_on:
  - RB-CORE-0001
  - RB-CORE-0002
  - RB-CORE-0003
  - RB-CORE-0004

references:
  - RB-CORE-0001
  - RB-CORE-0002
  - RB-CORE-0003
  - RB-CORE-0004
---

# Product Requirements Document (PRD)

> **O RouteBook é uma plataforma de apoio à decisão orientada por contexto.**
>
> Todas as capacidades descritas neste documento existem para cumprir um único propósito:
>
> **Transformar contexto em decisões melhores.**
>
> Este Product Requirements Document especifica, de forma completa e verificável, o comportamento esperado do produto, permitindo que Product, UX, IA, Arquitetura e Engenharia compartilhem exatamente a mesma compreensão do domínio.

---

# 1. Sobre este Documento

## 1.1 Propósito

O Product Requirements Document (PRD) é a principal especificação funcional do RouteBook.

Enquanto a Epic Foundation estabelece a identidade do projeto, sua visão, missão, princípios e filosofia, este documento transforma esses conceitos em comportamento observável do produto.

O PRD define:

- o que o produto deve fazer;
- quais problemas resolve;
- quais capacidades oferece;
- quais comportamentos são esperados;
- quais limites devem ser respeitados;
- quais critérios determinam seu sucesso.

Este documento não descreve como o produto será implementado.

Seu foco é exclusivamente o comportamento esperado.

---

## 1.2 Papel na Governança Documental

O PRD ocupa uma posição central dentro da documentação oficial do RouteBook.

Sua responsabilidade é servir como ponte entre a visão estratégica definida na Foundation e as especificações produzidas pelas demais Epics.

```text
                 FOUNDATION

                        │

                        ▼

       Product Requirements Document

                        │

      ┌─────────────────┼──────────────────┐

      ▼                 ▼                  ▼

     UX          Architecture             AI

                        │

                        ▼

                  Engineering
```

Toda documentação produzida posteriormente deverá permanecer consistente com este documento.

Caso exista conflito entre documentos, prevalecerá a seguinte ordem de autoridade:

1. RouteBook Bible
2. Product Requirements Document (PRD)
3. Documentação das Epics
4. Documentação Técnica
5. Implementação

---

## 1.3 Público-Alvo

Este documento foi elaborado para diferentes perfis profissionais.

| Perfil | Objetivo de Utilização |
|----------|------------------------|
| Product Managers | Compreender completamente o comportamento do produto. |
| UX Designers | Projetar jornadas e experiências consistentes. |
| Solution Architects | Modelar o domínio sem ambiguidades. |
| Desenvolvedores | Implementar funcionalidades conforme comportamento esperado. |
| QA Engineers | Elaborar cenários de validação e critérios de aceite. |
| Especialistas em IA | Desenvolver modelos alinhados ao comportamento oficial do produto. |
| Stakeholders | Validar escopo, objetivos e direcionamento do produto. |

---

## 1.4 Escopo

Este documento especifica:

- domínio do produto;
- modelo conceitual;
- capacidades;
- funcionalidades;
- requisitos funcionais;
- regras de negócio;
- jornadas;
- critérios de aceite;
- métricas;
- indicadores;
- premissas;
- restrições;
- limites do produto.

Não fazem parte deste documento:

- arquitetura técnica;
- infraestrutura;
- APIs;
- banco de dados;
- modelo físico;
- tecnologias;
- frameworks;
- interface visual;
- componentes gráficos;
- pipelines de IA;
- estratégias de implantação.

Esses assuntos serão tratados nas respectivas Epics.

---

# 2. Como Ler este Documento

O PRD foi organizado de forma incremental.

Cada capítulo depende conceitualmente dos anteriores.

A leitura completa é recomendada para todos os envolvidos no projeto.

Entretanto, diferentes perfis podem concentrar-se em seções específicas.

| Perfil | Capítulos Recomendados |
|----------|-----------------------|
| Executivos | Introdução, Objetivos, Visão, Roadmap e Métricas. |
| Product | Documento completo. |
| UX | Modelo Conceitual, Jornadas, Funcionalidades e Requisitos. |
| Arquitetura | Modelo Conceitual, Capacidades, Requisitos e Regras de Negócio. |
| IA | Modelo Conceitual, Filosofia do Produto, Modelo de Decisão e Requisitos. |
| Engenharia | Requisitos, Regras de Negócio, Critérios de Aceite e Dependências. |
| QA | Requisitos Funcionais, Critérios de Aceite, Regras de Negócio e Casos Limite. |

---

# 3. Princípios de Especificação

Toda especificação presente neste documento segue os princípios abaixo.

## 3.1 Comportamento acima da Interface

Este documento descreve comportamentos.

Não descreve telas.

Interfaces poderão evoluir sem alterar o comportamento do produto.

---

## 3.2 Domínio acima da Tecnologia

As decisões de produto não dependem de tecnologias específicas.

O domínio permanece estável mesmo que a implementação evolua.

---

## 3.3 Decisões acima de Funcionalidades

Funcionalidades não representam valor por si mesmas.

Seu propósito é melhorar a qualidade das decisões tomadas pelo usuário.

---

## 3.4 Contexto acima de Regras Fixas

O comportamento do RouteBook deve adaptar-se ao contexto disponível.

Regras rígidas somente deverão existir quando indispensáveis para garantir consistência, segurança ou conformidade.

---

## 3.5 Consistência acima da Conveniência

Situações equivalentes devem produzir comportamentos equivalentes.

Essa previsibilidade fortalece a confiança do usuário e reduz ambiguidades.

---

# 4. O Problema

O principal problema enfrentado pelo usuário não é a falta de informação.

É o excesso de informação distribuída entre diferentes serviços.

Para realizar uma única atividade durante uma jornada, o usuário frequentemente precisa consultar múltiplas fontes para responder perguntas como:

- Qual é a melhor opção?
- Vale a pena?
- Quanto custará?
- Está aberto?
- Está cheio?
- O clima interfere?
- Existe alternativa melhor?
- Essa escolha faz sentido para meu contexto?

As plataformas atuais respondem perguntas isoladas.

Poucas auxiliam o usuário a tomar uma decisão considerando seu contexto completo.

Essa fragmentação aumenta:

- tempo necessário para decidir;
- esforço cognitivo;
- insegurança;
- risco de arrependimento;
- dependência de múltiplos aplicativos.

O RouteBook existe para reduzir essa complexidade.

---

# 5. A Hipótese Fundamental do Produto

O desenvolvimento do RouteBook baseia-se na seguinte hipótese:

> Quanto maior a capacidade do produto de compreender o contexto do usuário, maior será sua capacidade de apoiar decisões relevantes, transparentes e alinhadas aos objetivos daquela jornada.

Essa hipótese orienta todas as funcionalidades descritas neste documento.

Sempre que novas capacidades forem propostas, deverá ser demonstrado de que maneira elas ampliam a compreensão do contexto ou melhoram a qualidade das decisões.

---

# 6. O Que o RouteBook Não É

A definição clara dos limites do domínio é essencial para preservar a identidade do produto.

O RouteBook não é:

- um aplicativo de mapas;
- uma plataforma de reservas;
- uma agência de viagens online (OTA);
- um sistema de venda de passagens;
- uma rede social;
- um catálogo de estabelecimentos;
- um comparador de preços;
- um guia turístico tradicional.

Esses serviços podem fornecer informações relevantes ou integrar-se ao RouteBook, mas não definem seu propósito.

O diferencial do RouteBook está na capacidade de compreender contexto, analisar alternativas e apoiar decisões ao longo de toda a jornada do usuário.

---

# 7. Definição de Sucesso

O sucesso do RouteBook não será medido pela quantidade de funcionalidades disponibilizadas.

Será medido pela sua capacidade de melhorar a qualidade das decisões tomadas pelos usuários.

Uma decisão será considerada melhor quando contribuir para:

- reduzir o tempo necessário para decidir;
- reduzir o esforço cognitivo;
- aumentar a confiança do usuário;
- diminuir arrependimentos;
- aumentar a satisfação com a experiência vivida;
- aumentar a percepção de valor das recomendações;
- adaptar-se ao contexto de forma consistente;
- explicar claramente os motivos de cada recomendação.

Esses objetivos servirão de base para os KPIs e Success Metrics definidos nas próximas seções deste documento.

---

# 8. Modelo Conceitual do Produto

---

## 8.1 Objetivo

O Modelo Conceitual define a estrutura lógica do domínio do RouteBook.

Seu propósito é estabelecer uma linguagem comum para toda a organização, garantindo que Product, UX, Arquitetura, Inteligência Artificial, Engenharia e Qualidade utilizem exatamente os mesmos conceitos ao descrever o comportamento do produto.

As definições apresentadas nesta seção representam conceitos de negócio e não modelos de implementação.

Nenhuma tecnologia, banco de dados, API ou estrutura de software deve influenciar os conceitos definidos neste documento.

O domínio deve permanecer estável mesmo que a tecnologia evolua.

---

## 8.2 O Domínio do RouteBook

Conforme definido na RouteBook Bible, o propósito do produto é transformar contexto em decisões melhores.

Dessa forma, o domínio do RouteBook não é turismo, mobilidade, gastronomia ou viagens.

O domínio do RouteBook é a **tomada de decisão contextual**.

Viagens, restaurantes, atrações, eventos, deslocamentos e experiências representam apenas diferentes cenários onde esse domínio é aplicado.

Essa distinção é fundamental.

Ela garante que a evolução do produto permaneça orientada ao seu propósito central e evita que o RouteBook seja tratado como um agregador de informações ou um catálogo de locais.

Toda funcionalidade deverá responder, explicitamente, à seguinte pergunta:

> **Como esta funcionalidade melhora a capacidade do usuário de tomar uma decisão?**

Caso essa relação não possa ser demonstrada, a funcionalidade deverá ser reavaliada.

---

# 8.3 O Ciclo Fundamental da Decisão

Toda interação dentro do RouteBook ocorre como parte de um ciclo contínuo de decisão.

```text
                      CONTEXTO

                          │

                          ▼

                 COMPREENSÃO DA SITUAÇÃO

                          │

                          ▼

                  IDENTIFICAÇÃO DO OBJETIVO

                          │

                          ▼

                IDENTIFICAÇÃO DA NECESSIDADE

                          │

                          ▼

                GERAÇÃO DE ALTERNATIVAS

                          │

                          ▼

                 ANÁLISE DAS ALTERNATIVAS

                          │

                          ▼

                     RECOMENDAÇÃO

                          │

                          ▼

                       DECISÃO

                          │

                          ▼

                     EXPERIÊNCIA

                          │

                          ▼

                     APRENDIZADO

                          │

                          ▼

             MELHORIA DAS FUTURAS DECISÕES
```

Este ciclo representa o comportamento central do produto.

Cada módulo, funcionalidade ou capacidade do RouteBook deverá fortalecer uma ou mais etapas desse fluxo.

O produto não existe para interromper esse ciclo, mas para torná-lo progressivamente mais eficiente, confiável e contextualizado.

---

# 8.4 Princípios do Modelo Conceitual

## 8.4.1 A decisão é a unidade central do produto

A menor unidade de valor do RouteBook não é uma tela, uma funcionalidade ou uma busca.

É uma decisão.

Cada interação realizada pelo usuário deve contribuir para que uma decisão seja tomada com maior confiança, menor esforço e melhor alinhamento ao contexto.

---

## 8.4.2 O contexto possui prioridade absoluta

Nenhuma informação possui significado isoladamente.

O mesmo restaurante pode ser excelente para um almoço em família e inadequado para uma reunião de negócios.

O valor de qualquer alternativa depende do contexto em que será utilizada.

Por esse motivo, recomendações produzidas sem contexto são consideradas incompletas.

---

## 8.4.3 Objetivos orientam recomendações

O RouteBook não recomenda aquilo que é simplesmente mais popular.

O produto recomenda aquilo que possui maior aderência ao objetivo do usuário considerando o contexto disponível.

Popularidade pode influenciar uma decisão, mas nunca substitui o objetivo da jornada.

---

## 8.4.4 O usuário permanece responsável pela decisão

O produto apoia.

O usuário decide.

O RouteBook jamais assume autonomia para decidir em nome do usuário.

Seu papel consiste em reduzir incertezas, organizar alternativas e fornecer explicações que permitam uma escolha consciente.

---

## 8.4.5 A experiência encerra o ciclo

Uma decisão não termina quando uma recomendação é apresentada.

Ela somente se encerra quando o usuário vivencia a experiência resultante daquela escolha.

É a experiência que permite validar se a decisão atingiu seu objetivo e fornece insumos para o aprimoramento contínuo do produto.

---

# 8.5 Entidades Conceituais

As entidades descritas a seguir representam os elementos fundamentais do domínio do RouteBook.

Elas formam a base para todas as funcionalidades, jornadas e regras de negócio.

---

## 8.5.1 Usuário

O Usuário representa a pessoa que utiliza o RouteBook para apoiar suas decisões ao longo de uma jornada.

### Responsabilidades

- iniciar jornadas;
- definir objetivos;
- informar preferências;
- estabelecer restrições;
- tomar decisões;
- avaliar experiências;
- fornecer feedback.

### Características

Um usuário é dinâmico.

Suas preferências podem evoluir.

Seu contexto muda continuamente.

Seus objetivos variam conforme a jornada.

O produto deve adaptar seu comportamento respeitando essa variabilidade, sem comprometer a consistência das recomendações.

---

## 8.5.2 Jornada

A Jornada representa um conjunto organizado de decisões relacionadas a um mesmo propósito.

Ela possui início, evolução e encerramento.

Uma jornada pode durar minutos, dias ou semanas.

Exemplos:

- férias;
- viagem corporativa;
- passeio em família;
- roteiro gastronômico;
- deslocamento urbano;
- visita cultural.

Uma jornada não é definida pelo deslocamento físico.

Ela é definida pelo objetivo que conecta todas as decisões realizadas.

---

## 8.5.3 Momento

Uma Jornada é composta por diversos momentos.

Cada momento representa uma situação específica em que uma nova decisão precisa ser tomada.

Exemplos:

- escolher onde almoçar;
- decidir a próxima atração;
- alterar uma rota devido ao trânsito;
- procurar um estacionamento;
- reagendar uma atividade por causa da chuva.

O RouteBook atua principalmente nesses momentos de decisão.

---

## 8.5.4 Contexto

Contexto representa o conjunto de informações utilizadas para compreender a situação atual do usuário.

Entre os fatores contextuais estão:

- localização;
- horário;
- clima;
- orçamento;
- companhia;
- disponibilidade;
- restrições;
- preferências;
- histórico;
- duração restante da jornada;
- eventos próximos;
- condições externas.

O contexto possui natureza dinâmica.

Ele pode sofrer alterações a qualquer instante e, consequentemente, modificar a recomendação mais adequada.

---

## 8.5.5 Objetivo

O Objetivo representa o resultado que o usuário deseja alcançar.

Exemplos:

- economizar tempo;
- reduzir custos;
- conhecer atrações históricas;
- jantar em um ambiente romântico;
- divertir crianças;
- evitar filas;
- aproveitar um dia ensolarado.

Uma mesma jornada pode possuir múltiplos objetivos simultaneamente.

Quando houver conflito entre objetivos, o produto deverá tornar esse conflito explícito ao usuário.

---

## 8.5.6 Necessidade

A Necessidade representa o problema imediato que precisa ser resolvido para que a jornada continue evoluindo.

Ela surge da combinação entre contexto e objetivo.

Exemplo:

Objetivo:

> Aproveitar um dia em família.

Necessidade:

> Encontrar um restaurante adequado para crianças nas proximidades.

Necessidades são temporárias e mudam continuamente durante uma jornada.

---

## 8.5.7 Alternativa

Alternativas representam todas as opções viáveis para atender uma necessidade.

Uma alternativa pode ser:

- um estabelecimento;
- uma atração;
- uma rota;
- um evento;
- uma experiência;
- uma sequência de ações.

O RouteBook deve comparar alternativas considerando o contexto e não apenas apresentá-las em formato de lista.

---

## 8.5.8 Recomendação

Uma Recomendação representa a sugestão produzida pelo RouteBook após analisar o contexto disponível.

Toda recomendação deve conter, sempre que possível:

- justificativa;
- fatores considerados;
- limitações conhecidas;
- nível de confiança;
- impacto esperado.

A recomendação deve ser compreensível e auditável pelo usuário.

---

## 8.5.9 Decisão

A Decisão representa a escolha realizada pelo usuário.

Ela pode:

- seguir integralmente a recomendação;
- selecionar outra alternativa;
- adiar a decisão;
- cancelar a ação.

Todas essas possibilidades são válidas e geram aprendizado para o produto.

---

## 8.5.10 Experiência

A Experiência representa o resultado percebido após a execução da decisão.

Ela permite responder perguntas como:

- o objetivo foi alcançado?
- a recomendação foi adequada?
- o contexto foi corretamente interpretado?
- o usuário repetiria essa escolha?
- houve arrependimento?

A experiência fecha o ciclo de decisão.

---

## 8.5.11 Aprendizado

O Aprendizado representa o conhecimento obtido a partir da relação entre:

- contexto;
- decisão;
- experiência;
- feedback.

Seu objetivo é melhorar futuras recomendações sem modificar os princípios fundamentais definidos na Foundation.

O aprendizado nunca deve tornar o comportamento do produto imprevisível ou inexplicável.

---

# 8.6 Relacionamento Entre Entidades

As entidades definidas anteriormente formam o núcleo do domínio do RouteBook.

```text
Usuário
   │
   ├── inicia ─────────────► Jornada
   │                           │
   │                           ├── é composta por ───► Momentos
   │                                                   │
   │                                                   ├── possuem ─────────► Contexto
   │                                                   │                         │
   │                                                   │                         ├── influencia ─► Objetivos
   │                                                   │                                              │
   │                                                   │                                              ├── originam ─► Necessidades
   │                                                   │                                                                    │
   │                                                   │                                                                    ├── geram ─► Alternativas
   │                                                   │                                                                                      │
   │                                                   │                                                                                      ├── analisadas para gerar ─► Recomendações
   │                                                   │                                                                                                                     │
   │                                                   │                                                                                                                     ├── apoiam ─► Decisões
   │                                                   │                                                                                                                                               │
   │                                                   │                                                                                                                                               ├── produzem ─► Experiências
   │                                                   │                                                                                                                                                                      │
   │                                                   │                                                                                                                                                                      └── alimentam ─► Aprendizado
   │                                                   │                                                                                                                                                                                              │
   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                                                                                            melhora futuras recomendações
```

Este relacionamento define a estrutura conceitual do produto.

Qualquer nova funcionalidade deverá utilizar essas entidades ou justificar explicitamente a criação de novos conceitos de domínio.

---

# 8.7 Linguagem Oficial do Produto

Para garantir consistência documental, os termos abaixo passam a possuir significado oficial em todo o ecossistema RouteBook.

| Termo | Definição Oficial |
|--------|-------------------|
| Usuário | Pessoa que utiliza o RouteBook para apoiar suas decisões. |
| Jornada | Conjunto de decisões relacionadas a um mesmo propósito. |
| Momento | Situação específica dentro de uma jornada que exige uma nova decisão. |
| Contexto | Conjunto de informações utilizadas para compreender a situação atual do usuário. |
| Objetivo | Resultado que o usuário deseja alcançar. |
| Necessidade | Problema imediato que precisa ser resolvido para permitir a continuidade da jornada. |
| Alternativa | Opção viável para atender uma necessidade. |
| Recomendação | Sugestão contextual produzida pelo RouteBook para apoiar uma decisão. |
| Decisão | Escolha realizada pelo usuário. |
| Experiência | Resultado percebido após a decisão. |
| Aprendizado | Conhecimento adquirido a partir das experiências anteriores para aprimorar futuras recomendações. |

Todos os documentos das Epics **Product**, **UX**, **Architecture**, **AI**, **Design System** e **Engineering** deverão utilizar obrigatoriamente esta terminologia, salvo quando um documento específico definir uma extensão formal deste modelo conceitual.

---

# 9. Filosofia do Produto

---

## 9.1 Objetivo

A Filosofia do Produto estabelece os princípios que orientam todas as decisões relacionadas ao comportamento do RouteBook.

Enquanto o Modelo Conceitual define os elementos do domínio, esta seção define **como o produto deve agir diante desses elementos**.

Toda funcionalidade, recomendação, fluxo ou comportamento deverá respeitar os princípios descritos nesta seção.

Caso exista conflito entre uma funcionalidade e a Filosofia do Produto, a funcionalidade deverá ser revista.

---

# 9.2 Princípio Fundamental

O RouteBook existe para ampliar a capacidade de tomada de decisão do usuário.

Seu objetivo não é substituir o julgamento humano.

Também não é automatizar todas as escolhas.

Sua responsabilidade consiste em fornecer contexto, reduzir incertezas, organizar alternativas e apoiar decisões de forma transparente.

O produto jamais deverá induzir o usuário a acreditar que existe apenas uma resposta correta para problemas complexos.

Na maioria das situações existirão múltiplas alternativas aceitáveis.

O papel do RouteBook é tornar essas alternativas compreensíveis.

---

# 9.3 Princípios Filosóficos

## 9.3.1 O produto recomenda. O usuário decide.

O RouteBook nunca assume controle sobre a decisão.

Mesmo quando existir uma alternativa claramente superior, a decisão final permanece sob responsabilidade do usuário.

As recomendações representam apoio, não imposição.

---

## 9.3.2 Toda recomendação deve ser justificável

Nenhuma recomendação deve surgir como uma "caixa-preta".

Sempre que possível, o usuário deverá compreender:

- quais fatores foram considerados;
- quais informações influenciaram a análise;
- quais limitações existiam;
- por que determinada alternativa foi priorizada.

A confiança no produto depende tanto da qualidade da recomendação quanto da clareza de sua justificativa.

---

## 9.3.3 Contexto possui prioridade sobre popularidade

Uma alternativa popular não é necessariamente a melhor alternativa.

A recomendação deve refletir a aderência ao contexto do usuário e aos objetivos da jornada.

Popularidade, avaliações e tendências são sinais relevantes, mas não substituem o contexto.

---

## 9.3.4 A ausência de contexto reduz a qualidade da decisão

Quando o produto identificar que não possui contexto suficiente para produzir uma recomendação confiável, deverá reconhecer essa limitação.

Nessas situações, o comportamento esperado é:

- solicitar informações adicionais;
- apresentar múltiplas possibilidades;
- comunicar o nível de incerteza;
- evitar recomendações excessivamente assertivas.

Reconhecer uma limitação é preferível a produzir uma recomendação potencialmente inadequada.

---

## 9.3.5 Toda decisão produz conhecimento

Independentemente da escolha realizada pelo usuário, a interação gera aprendizado.

Mesmo quando o usuário ignora uma recomendação, essa decisão representa uma oportunidade para compreender preferências, restrições ou comportamentos que poderão contribuir para recomendações futuras.

---

## 9.3.6 O produto deve evoluir sem perder identidade

A evolução do RouteBook deve ocorrer por meio da ampliação de sua capacidade de compreender contexto e apoiar decisões.

Essa evolução jamais poderá alterar os princípios fundamentais definidos na Foundation ou comprometer a previsibilidade do comportamento do produto.

---

# 10. Modelo de Decisão do RouteBook

---

## 10.1 Objetivo

O Modelo de Decisão descreve o processo conceitual utilizado pelo RouteBook para transformar informações disponíveis em recomendações contextualizadas.

Este modelo não representa uma implementação técnica ou um algoritmo específico.

Ele define o comportamento esperado do produto.

Independentemente das tecnologias utilizadas, toda recomendação deverá respeitar este fluxo.

---

## 10.2 Ciclo de Decisão

O processo de decisão do RouteBook é composto por oito etapas.

```text
            CONTEXTO

                │

                ▼

      COMPREENSÃO DA SITUAÇÃO

                │

                ▼

      IDENTIFICAÇÃO DO OBJETIVO

                │

                ▼

      IDENTIFICAÇÃO DAS RESTRIÇÕES

                │

                ▼

      GERAÇÃO DE ALTERNATIVAS

                │

                ▼

      ANÁLISE COMPARATIVA

                │

                ▼

         RECOMENDAÇÃO

                │

                ▼

        DECISÃO DO USUÁRIO

                │

                ▼

 EXPERIÊNCIA E APRENDIZADO
```

Cada etapa possui objetivos específicos e não deve ser ignorada durante o comportamento do produto.

---

## 10.3 Etapa 1 — Compreensão do Contexto

O RouteBook inicia o processo reunindo todas as informações relevantes para compreender a situação atual do usuário.

Exemplos:

- localização;
- horário;
- clima;
- duração restante da jornada;
- orçamento;
- companhia;
- preferências;
- restrições;
- eventos próximos;
- histórico.

O produto deve trabalhar sempre com o melhor contexto disponível, reconhecendo explicitamente quando houver lacunas.

---

## 10.4 Etapa 2 — Identificação do Objetivo

Após compreender o contexto, o produto identifica o objetivo que o usuário pretende alcançar.

Esse objetivo pode ser:

- informado diretamente;
- inferido a partir da interação;
- refinado durante a conversa.

Caso existam múltiplos objetivos simultâneos, o produto deverá identificá-los e considerar possíveis conflitos.

---

## 10.5 Etapa 3 — Identificação de Restrições

Nem toda alternativa viável é aceitável.

O produto deverá considerar restrições que possam limitar a decisão.

Exemplos:

- orçamento;
- acessibilidade;
- mobilidade;
- disponibilidade de tempo;
- restrições alimentares;
- idade;
- clima;
- horários de funcionamento;
- reservas obrigatórias.

As restrições não eliminam alternativas por definição.

Elas reduzem o espaço de decisão.

---

## 10.6 Etapa 4 — Geração de Alternativas

Somente após compreender contexto, objetivo e restrições o produto deverá identificar alternativas compatíveis.

Uma boa recomendação depende da qualidade das alternativas consideradas.

Caso o conjunto de alternativas seja insuficiente, o produto poderá solicitar informações adicionais antes de prosseguir.

---

## 10.7 Etapa 5 — Análise Comparativa

Nesta etapa o produto compara as alternativas disponíveis.

A comparação deve considerar múltiplos fatores simultaneamente.

Exemplos:

- aderência ao objetivo;
- compatibilidade com o contexto;
- impacto esperado;
- riscos;
- limitações;
- conveniência;
- esforço necessário.

O objetivo não é encontrar a alternativa perfeita.

É identificar a alternativa mais adequada para aquele contexto específico.

---

## 10.8 Etapa 6 — Recomendação

A recomendação representa a conclusão da análise.

Ela deve ser acompanhada, sempre que possível, por:

- justificativa;
- fatores considerados;
- limitações;
- nível de confiança;
- possíveis alternativas.

O usuário deve compreender não apenas **qual** alternativa foi sugerida, mas **por que** ela foi sugerida.

---

## 10.9 Etapa 7 — Decisão

A decisão pertence exclusivamente ao usuário.

O produto deve respeitar todas as escolhas realizadas, independentemente de seguirem ou não a recomendação apresentada.

Não existe comportamento considerado incorreto por parte do usuário.

Cada decisão representa uma expressão legítima de preferência ou prioridade.

---

## 10.10 Etapa 8 — Experiência e Aprendizado

Após a decisão, o produto passa a observar os resultados da experiência.

Esse aprendizado poderá considerar:

- feedback explícito;
- comportamento observado;
- alterações de contexto;
- decisões futuras.

O objetivo é melhorar recomendações posteriores sem comprometer a previsibilidade e a transparência do produto.

---

# 11. Princípios de Inteligência do Produto

---

## 11.1 Explicabilidade

Toda recomendação relevante deve ser explicável.

O usuário deve compreender os fatores que influenciaram a sugestão apresentada.

---

## 11.2 Transparência

O RouteBook deve comunicar de forma clara:

- o que sabe;
- o que não sabe;
- quais hipóteses foram consideradas;
- quais limitações existem.

---

## 11.3 Proporcionalidade

O nível de intervenção do produto deve ser proporcional ao impacto potencial da decisão.

Decisões simples exigem menor intervenção.

Decisões complexas podem demandar maior apoio contextual.

---

## 11.4 Neutralidade

O produto deve evitar favorecer alternativas por interesses externos que não estejam alinhados aos objetivos do usuário.

A confiança depende da percepção de imparcialidade.

---

## 11.5 Personalização Responsável

A personalização deve respeitar as preferências do usuário sem restringir excessivamente o conjunto de alternativas apresentadas.

O produto deve evitar criar um ambiente de recomendações excessivamente fechado.

---

## 11.6 Evolução Contínua

O aprendizado obtido ao longo do tempo deve aprimorar a qualidade das recomendações.

Entretanto, essa evolução não pode tornar o comportamento imprevisível ou contradizer os princípios fundamentais definidos na Foundation.

---

# 12. Arquitetura Funcional do Produto

---

## 12.1 Objetivo

A Arquitetura Funcional descreve como o RouteBook organiza suas capacidades de negócio para cumprir sua missão.

Seu objetivo não é representar componentes técnicos, microsserviços ou módulos de software.

Ela representa a organização lógica das responsabilidades do produto.

Cada módulo funcional agrupa capacidades relacionadas que colaboram para transformar contexto em decisões melhores.

Essa estrutura servirá como referência para:

- Product Management;
- UX;
- Arquitetura;
- Engenharia;
- Inteligência Artificial;
- Qualidade.

---

# 12.2 Princípios da Arquitetura Funcional

A organização funcional do RouteBook segue cinco princípios fundamentais.

## 12.2.1 Modularidade

Cada módulo possui responsabilidades claramente definidas.

Mudanças em um módulo devem produzir o menor impacto possível nos demais.

---

## 12.2.2 Coesão

Capacidades relacionadas devem permanecer no mesmo módulo.

Capacidades distintas não devem compartilhar responsabilidades.

---

## 12.2.3 Evolução Independente

Novas capacidades poderão ser adicionadas sem alterar a identidade do produto.

A arquitetura funcional deve favorecer crescimento contínuo.

---

## 12.2.4 Centralidade da Decisão

Todos os módulos existem para apoiar o processo de decisão.

Nenhum módulo possui finalidade própria.

Cada capacidade deve contribuir para pelo menos uma etapa do ciclo de decisão definido anteriormente.

---

## 12.2.5 Independência Tecnológica

Os módulos representam responsabilidades de negócio.

Eles não definem serviços, APIs, bancos de dados ou componentes de software.

---

# 12.3 Visão Geral

O RouteBook é organizado em oito grandes capacidades funcionais.

```text
                  ROUTEBOOK

                       │

 ┌─────────────────────┼─────────────────────┐

 ▼                     ▼                     ▼

 Gestão            Inteligência         Execução
 da Jornada         Contextual         da Jornada

 ▼                     ▼                     ▼

 Descoberta      Motor de Decisão      Experiência

 ▼                     ▼                     ▼

 Aprendizado     Personalização     Ecossistema
```

Cada capacidade possui responsabilidades próprias, mas todas colaboram continuamente durante a jornada do usuário.

---

# 12.4 Mapa de Capacidades

| Código | Capacidade | Objetivo Principal |
|----------|------------|-------------------|
| CAP-01 | Gestão da Jornada | Organizar e acompanhar toda a jornada do usuário. |
| CAP-02 | Inteligência Contextual | Compreender continuamente o contexto da jornada. |
| CAP-03 | Descoberta | Encontrar alternativas relevantes. |
| CAP-04 | Motor de Decisão | Comparar alternativas e produzir recomendações. |
| CAP-05 | Execução da Jornada | Apoiar a realização das decisões tomadas. |
| CAP-06 | Gestão da Experiência | Avaliar resultados das decisões e registrar aprendizados. |
| CAP-07 | Personalização | Adaptar o comportamento do produto ao usuário. |
| CAP-08 | Ecossistema | Integrar informações e serviços externos ao processo de decisão. |

Essas capacidades representam a estrutura permanente do produto.

Novas funcionalidades deverão pertencer a uma dessas capacidades ou justificar formalmente a criação de uma nova.

---

# 12.5 Descrição das Capacidades

---

## CAP-01 — Gestão da Jornada

### Missão

Representar a jornada como a principal unidade organizacional do produto.

### Responsabilidades

- iniciar jornadas;
- acompanhar evolução;
- organizar momentos;
- registrar objetivos;
- acompanhar progresso;
- encerrar jornadas.

### Resultado Esperado

Permitir que todas as decisões sejam compreendidas dentro de um contexto maior.

---

## CAP-02 — Inteligência Contextual

### Missão

Construir continuamente a compreensão do contexto da jornada.

### Responsabilidades

- identificar contexto;
- consolidar informações;
- detectar mudanças;
- identificar restrições;
- reconhecer preferências;
- manter o contexto atualizado.

### Resultado Esperado

Garantir que todas as recomendações sejam produzidas considerando o melhor contexto disponível.

---

## CAP-03 — Descoberta

### Missão

Encontrar alternativas compatíveis com os objetivos do usuário.

### Responsabilidades

- localizar opções;
- ampliar possibilidades;
- eliminar alternativas incompatíveis;
- organizar resultados;
- enriquecer informações.

### Resultado Esperado

Apresentar um conjunto de alternativas relevantes para análise.

---

## CAP-04 — Motor de Decisão

### Missão

Comparar alternativas e produzir recomendações.

### Responsabilidades

- analisar contexto;
- comparar alternativas;
- priorizar opções;
- explicar recomendações;
- comunicar limitações;
- indicar nível de confiança.

### Resultado Esperado

Produzir recomendações contextualizadas, transparentes e justificáveis.

---

## CAP-05 — Execução da Jornada

### Missão

Acompanhar o usuário após a decisão.

### Responsabilidades

- apoiar execução;
- acompanhar mudanças;
- reagir a novos eventos;
- revisar recomendações quando necessário;
- manter continuidade da jornada.

### Resultado Esperado

Garantir que o apoio do RouteBook continue mesmo após a decisão.

---

## CAP-06 — Gestão da Experiência

### Missão

Compreender os resultados produzidos pelas decisões.

### Responsabilidades

- registrar experiências;
- coletar feedback;
- identificar satisfação;
- avaliar resultados;
- detectar oportunidades de melhoria.

### Resultado Esperado

Fechar o ciclo de decisão por meio da avaliação da experiência.

---

## CAP-07 — Personalização

### Missão

Adaptar continuamente o comportamento do produto.

### Responsabilidades

- aprender preferências;
- adaptar recomendações;
- compreender hábitos;
- preservar consistência;
- evitar excesso de personalização.

### Resultado Esperado

Produzir recomendações cada vez mais relevantes sem comprometer transparência.

---

## CAP-08 — Ecossistema

### Missão

Integrar fontes externas ao processo de decisão.

### Responsabilidades

- consumir informações;
- integrar parceiros;
- consolidar dados;
- enriquecer contexto;
- ampliar alternativas.

### Resultado Esperado

Permitir que o usuário tome decisões utilizando informações provenientes de múltiplos serviços sem precisar alternar entre diversas aplicações.

---

# 12.6 Relação entre Capacidades

As capacidades não operam de forma isolada.

Elas colaboram continuamente durante toda a jornada.

```text
               Gestão da Jornada

                        │

                        ▼

          Inteligência Contextual

                        │

                        ▼

                Descoberta

                        │

                        ▼

             Motor de Decisão

                        │

                        ▼

           Execução da Jornada

                        │

                        ▼

          Gestão da Experiência

                        │

                        ▼

              Personalização

                        │

                        ▼

            Melhoria Contínua

Ecossistema

│

└──────── fornece informações para todas as capacidades.
```

O fluxo acima representa a colaboração lógica entre os módulos.

Ele não define ordem obrigatória de execução.

Em diferentes momentos da jornada, múltiplas capacidades poderão atuar simultaneamente.

---

# 12.7 Critérios para Evolução da Arquitetura Funcional

Novas capacidades somente poderão ser incorporadas quando atenderem aos seguintes critérios:

- resolverem um problema distinto dos módulos existentes;
- possuírem responsabilidades claramente delimitadas;
- contribuírem para melhorar decisões;
- não introduzirem redundância funcional;
- manterem consistência com o Modelo Conceitual;
- preservarem os princípios definidos na Foundation.

Caso esses critérios não sejam atendidos, a funcionalidade deverá ser incorporada a uma capacidade já existente.

---

# 12.8 Diretrizes para Funcionalidades

Toda funcionalidade descrita neste PRD deverá informar explicitamente:

- a qual capacidade pertence;
- qual problema resolve;
- qual etapa do ciclo de decisão fortalece;
- quais entidades conceituais utiliza;
- quais objetivos de produto atende.

Essas informações serão obrigatórias nas próximas seções deste documento.

---

# 13. Modelo Oficial de Especificação das Capacidades

---

## 13.1 Objetivo

A Arquitetura Funcional apresentada na seção anterior definiu as capacidades permanentes do RouteBook.

Esta seção estabelece o modelo oficial que deverá ser utilizado para especificar cada capacidade funcional do produto.

O objetivo é garantir que todas as capacidades sejam descritas de maneira consistente, comparável e rastreável.

Essa padronização reduz ambiguidades, facilita a evolução do produto e assegura que diferentes equipes consultem as mesmas informações na mesma estrutura.

Este modelo deverá ser utilizado em todas as capacidades existentes e futuras.

---

# 13.2 O que é uma Capacidade

Uma capacidade representa uma responsabilidade permanente do produto.

Ela não corresponde a uma tela, funcionalidade isolada, serviço técnico ou módulo de software.

Uma capacidade existe para resolver uma classe de problemas relacionados ao domínio do RouteBook.

Suas responsabilidades permanecem estáveis ao longo do tempo, enquanto funcionalidades específicas podem evoluir, ser substituídas ou ampliadas.

Exemplo:

A capacidade **Gestão da Jornada** continuará existindo mesmo que as formas de criar, editar ou acompanhar jornadas sejam completamente redesenhadas.

Essa distinção garante que a evolução da experiência do usuário não altere o modelo de negócio do produto.

---

# 13.3 Hierarquia Funcional

A organização funcional do RouteBook segue a seguinte hierarquia.

```text
Produto

↓

Capacidade

↓

Subcapacidade

↓

Funcionalidade

↓

Fluxo

↓

Caso de Uso

↓

Requisito Funcional

↓

Critério de Aceite
```

Cada nível possui responsabilidades específicas.

Nenhum requisito funcional deve existir sem estar vinculado a uma funcionalidade.

Nenhuma funcionalidade deve existir sem pertencer a uma capacidade.

---

# 13.4 Estrutura Oficial

Todas as capacidades deverão seguir exatamente a estrutura abaixo.

```text
Capacidade

↓

Problema de Negócio

↓

Objetivos

↓

Valor para o Usuário

↓

Valor para o Negócio

↓

Escopo

↓

Fora do Escopo

↓

Entidades do Domínio

↓

Entradas

↓

Saídas

↓

Subcapacidades

↓

Funcionalidades

↓

Fluxos

↓

Regras de Negócio

↓

Requisitos Funcionais

↓

Casos Excepcionais

↓

Critérios de Aceite

↓

Indicadores

↓

Dependências

↓

Riscos

↓

Evoluções Futuras
```

Essa estrutura será obrigatória para todas as capacidades do produto.

---

# 13.5 Identificação das Capacidades

Cada capacidade receberá um identificador único.

Formato:

```
CAP-XX
```

Exemplo:

| Código | Nome |
|---------|------|
| CAP-01 | Gestão da Jornada |
| CAP-02 | Inteligência Contextual |
| CAP-03 | Descoberta |
| CAP-04 | Motor de Decisão |
| CAP-05 | Execução da Jornada |
| CAP-06 | Gestão da Experiência |
| CAP-07 | Personalização |
| CAP-08 | Ecossistema |

Os identificadores são permanentes e não devem ser reutilizados.

---

# 13.6 Identificação das Funcionalidades

Cada funcionalidade deverá possuir um identificador próprio.

Formato:

```
CAP-XX-FUNC-XXX
```

Exemplo:

```
CAP-01-FUNC-001
Criar Jornada

CAP-01-FUNC-002
Editar Jornada

CAP-01-FUNC-003
Encerrar Jornada
```

Os identificadores devem permanecer estáveis durante toda a vida do produto.

---

# 13.7 Estrutura Oficial das Funcionalidades

Cada funcionalidade deverá conter, no mínimo, os seguintes elementos.

## Identificação

- Código
- Nome
- Capacidade
- Versão
- Status

---

## Problema

Descrição clara do problema resolvido.

---

## Objetivo

Resultado esperado da funcionalidade.

---

## Valor para o Usuário

Benefícios diretos para quem utiliza o RouteBook.

---

## Valor para o Negócio

Contribuição da funcionalidade para os objetivos estratégicos do produto.

---

## Descrição Funcional

Descrição completa do comportamento esperado.

A descrição deve responder:

- quando ocorre;
- por que ocorre;
- como deve se comportar;
- quais resultados produz.

Sem mencionar detalhes técnicos.

---

## Entidades Envolvidas

Lista das entidades do Modelo Conceitual utilizadas pela funcionalidade.

Exemplo:

- Jornada
- Contexto
- Objetivo
- Usuário

---

## Entradas

Informações necessárias para execução da funcionalidade.

---

## Saídas

Resultados produzidos.

---

## Pré-condições

Condições que precisam ser verdadeiras antes da execução.

---

## Pós-condições

Estado esperado após a conclusão da funcionalidade.

---

## Fluxo Principal

Descrição passo a passo do comportamento esperado em condições normais.

---

## Fluxos Alternativos

Variações esperadas do fluxo principal.

---

## Fluxos Excepcionais

Situações de erro, ausência de contexto ou impossibilidade de execução.

---

## Regras de Negócio

Lista numerada de regras aplicáveis.

Formato:

```
RN-001

RN-002

RN-003
```

As regras devem ser independentes da implementação.

---

## Requisitos Funcionais

Lista numerada.

Formato:

```
RF-001

RF-002

RF-003
```

Cada requisito deve ser:

- verificável;
- mensurável;
- não ambíguo.

---

## Critérios de Aceite

Cada requisito funcional deverá possuir critérios objetivos de validação.

Formato sugerido:

```
Dado

Quando

Então
```

---

## Indicadores

Métricas específicas da funcionalidade.

Exemplos:

- taxa de utilização;
- tempo médio;
- sucesso da recomendação;
- conclusão do fluxo;
- abandono.

---

## Dependências

Outras capacidades ou funcionalidades necessárias.

---

## Evoluções Futuras

Possíveis ampliações planejadas.

---

# 13.8 Convenções de Escrita

Todas as especificações deverão seguir as convenções abaixo.

### Utilizar linguagem comportamental

Descrever o que o produto deve fazer.

Nunca como será implementado.

---

### Utilizar voz ativa

Exemplo:

"O RouteBook identifica o contexto."

Evitar:

"O contexto deverá ser identificado."

---

### Utilizar terminologia oficial

Todos os termos deverão seguir o Modelo Conceitual definido anteriormente.

Não utilizar sinônimos quando existir um termo oficial.

---

### Evitar ambiguidade

Evitar expressões como:

- normalmente;
- geralmente;
- quando possível;
- talvez;
- preferencialmente.

Sempre que existir exceção, ela deve ser explicitamente descrita.

---

### Cada requisito deve possuir apenas uma responsabilidade

Um requisito não deve descrever múltiplos comportamentos distintos.

Isso facilita rastreabilidade e testes.

---

# 13.9 Matriz de Rastreabilidade

Cada funcionalidade deverá manter vínculo explícito com os demais elementos do produto.

```text
Foundation

↓

Objetivo Estratégico

↓

Capacidade

↓

Funcionalidade

↓

Fluxo

↓

Requisito Funcional

↓

Critério de Aceite

↓

Caso de Teste
```

Essa rastreabilidade garante que todas as funcionalidades possam ser justificadas desde os princípios da Foundation até sua validação em produção.

---

# 13.10 Critérios de Qualidade

Uma capacidade somente será considerada completa quando atender aos seguintes critérios.

### Clareza

O comportamento é compreensível sem necessidade de interpretação adicional.

---

### Consistência

Está alinhada ao Modelo Conceitual, Filosofia do Produto e Foundation.

---

### Completude

Todos os comportamentos relevantes foram especificados.

---

### Implementabilidade

A equipe de Engenharia consegue implementar a capacidade apenas utilizando a documentação oficial.

---

### Testabilidade

Todos os requisitos podem ser validados objetivamente.

---

### Valor

Existe contribuição direta para o propósito do RouteBook:

> Transformar contexto em decisões melhores.

Caso esse vínculo não exista, a capacidade deverá ser reavaliada.

---

# 14. Catálogo Oficial das Capacidades

---

## 14.1 Objetivo

O Catálogo Oficial das Capacidades apresenta uma visão consolidada da Arquitetura Funcional do RouteBook.

Enquanto o capítulo anterior definiu **como** cada capacidade será documentada, este capítulo responde **quais capacidades compõem o produto**, **qual a responsabilidade de cada uma** e **como elas colaboram entre si**.

Este catálogo funciona como um índice funcional do RouteBook.

Seu objetivo é permitir que qualquer leitor compreenda rapidamente a estrutura do produto antes de consultar as especificações detalhadas de cada capacidade.

Todas as capacidades descritas neste documento deverão estar presentes neste catálogo.

---

# 14.2 Organização Geral

O RouteBook é estruturado em oito capacidades permanentes.

Cada capacidade representa uma responsabilidade distinta do produto e existe para fortalecer uma ou mais etapas do ciclo de decisão definido anteriormente.

Nenhuma capacidade existe de forma isolada.

Elas colaboram continuamente durante toda a jornada do usuário.

```text
                         ROUTEBOOK

                              │

     ┌────────────────────────┼────────────────────────┐

     ▼                        ▼                        ▼

 Gestão da Jornada     Inteligência Contextual     Descoberta

     ▼                        ▼                        ▼

 Motor de Decisão      Execução da Jornada      Gestão da Experiência

     ▼                        ▼

 Personalização          Ecossistema
```

Essa organização representa uma visão lógica do domínio.

Ela não define componentes técnicos ou ordem obrigatória de execução.

---

# 14.3 Visão Geral das Capacidades

| Código | Capacidade | Missão | Criticidade |
|---------|------------|--------|-------------|
| CAP-01 | Gestão da Jornada | Organizar toda a jornada do usuário como unidade central do produto. | Muito Alta |
| CAP-02 | Inteligência Contextual | Compreender continuamente o contexto da jornada. | Muito Alta |
| CAP-03 | Descoberta | Identificar alternativas relevantes para os objetivos do usuário. | Alta |
| CAP-04 | Motor de Decisão | Comparar alternativas e produzir recomendações contextualizadas. | Crítica |
| CAP-05 | Execução da Jornada | Apoiar o usuário após a tomada de decisão. | Alta |
| CAP-06 | Gestão da Experiência | Avaliar resultados e transformar experiências em aprendizado. | Alta |
| CAP-07 | Personalização | Adaptar continuamente o comportamento do produto ao usuário. | Média |
| CAP-08 | Ecossistema | Integrar fontes externas de informação e serviços. | Alta |

---

# 14.4 Mapa de Dependências

As capacidades não operam de forma independente.

Elas formam uma cadeia colaborativa.

```text
CAP-01
Gestão da Jornada

↓

CAP-02
Inteligência Contextual

↓

CAP-03
Descoberta

↓

CAP-04
Motor de Decisão

↓

CAP-05
Execução da Jornada

↓

CAP-06
Gestão da Experiência

↓

CAP-07
Personalização
```

A capacidade **CAP-08 — Ecossistema** fornece informações para todas as demais capacidades.

Ela atua transversalmente.

---

# 14.5 CAP-01 — Gestão da Jornada

## Missão

Representar a jornada como a principal unidade organizacional do RouteBook.

---

### Problema que Resolve

Atualmente as decisões realizadas pelos usuários encontram-se fragmentadas.

O usuário alterna continuamente entre diferentes aplicativos e perde a visão do objetivo maior da jornada.

A Gestão da Jornada organiza essas decisões dentro de uma estrutura única.

---

### Objetivo Estratégico

Transformar uma sequência isolada de decisões em uma jornada coerente.

---

### Principais Responsabilidades

- criar jornadas;
- acompanhar evolução;
- organizar momentos;
- registrar objetivos;
- registrar participantes;
- controlar estado da jornada;
- concluir jornadas.

---

### Entidades do Domínio

- Usuário
- Jornada
- Momento
- Objetivo
- Contexto

---

### Dependências

- Inteligência Contextual
- Motor de Decisão

---

### Valor Gerado

Sem Gestão da Jornada não existe contexto contínuo.

Consequentemente, não existe tomada de decisão contextual.

---

# 14.6 CAP-02 — Inteligência Contextual

## Missão

Construir continuamente uma representação precisa do contexto do usuário.

---

### Problema que Resolve

A maioria das plataformas utiliza apenas informações estáticas.

O RouteBook necessita compreender continuamente mudanças ocorridas durante toda a jornada.

---

### Objetivo Estratégico

Garantir que todas as decisões utilizem o melhor contexto disponível.

---

### Principais Responsabilidades

- compreender contexto;
- detectar mudanças;
- consolidar informações;
- identificar restrições;
- identificar preferências;
- reconhecer condições externas.

---

### Entidades

- Contexto
- Jornada
- Momento
- Objetivo
- Usuário

---

### Dependências

- Ecossistema

---

### Valor Gerado

Quanto melhor o contexto compreendido, maior tende a ser a qualidade das recomendações.

---

# 14.7 CAP-03 — Descoberta

## Missão

Encontrar alternativas compatíveis com a necessidade atual do usuário.

---

### Problema

Usuários normalmente precisam consultar diversas fontes para descobrir possibilidades.

---

### Objetivo

Centralizar a descoberta de alternativas relevantes.

---

### Responsabilidades

- localizar opções;
- ampliar possibilidades;
- eliminar incompatibilidades;
- organizar alternativas.

---

### Entidades

- Necessidade
- Alternativa
- Contexto

---

### Dependências

- Inteligência Contextual
- Ecossistema

---

### Valor

Redução do esforço necessário para encontrar alternativas.

---

# 14.8 CAP-04 — Motor de Decisão

## Missão

Produzir recomendações contextualizadas.

---

### Problema

Encontrar alternativas não significa saber qual escolher.

---

### Objetivo

Comparar alternativas considerando objetivos, contexto e restrições.

---

### Responsabilidades

- comparar alternativas;
- priorizar opções;
- explicar recomendações;
- indicar confiança;
- comunicar limitações.

---

### Entidades

- Contexto
- Objetivo
- Alternativa
- Recomendação

---

### Dependências

Todas as capacidades anteriores.

---

### Valor

É o núcleo do produto.

Sem esta capacidade o RouteBook deixa de cumprir seu propósito principal.

---

# 14.9 CAP-05 — Execução da Jornada

## Missão

Acompanhar o usuário após a decisão.

---

### Problema

A maioria das plataformas encerra sua participação quando a decisão é tomada.

---

### Objetivo

Manter apoio contínuo durante a execução da jornada.

---

### Responsabilidades

- acompanhar execução;
- reagir a mudanças;
- atualizar contexto;
- revisar recomendações.

---

### Entidades

- Jornada
- Momento
- Contexto
- Decisão

---

### Dependências

Motor de Decisão.

---

### Valor

Permitir que recomendações permaneçam relevantes durante toda a jornada.

---

# 14.10 CAP-06 — Gestão da Experiência

## Missão

Transformar resultados em conhecimento.

---

### Problema

Sem compreender os resultados das decisões, o produto não evolui.

---

### Objetivo

Registrar experiências e alimentar aprendizado contínuo.

---

### Responsabilidades

- registrar feedback;
- medir satisfação;
- avaliar resultados;
- identificar oportunidades de melhoria.

---

### Entidades

- Experiência
- Decisão
- Jornada

---

### Dependências

Execução da Jornada.

---

### Valor

Fechar o ciclo de decisão.

---

# 14.11 CAP-07 — Personalização

## Missão

Adaptar o comportamento do RouteBook ao longo do tempo.

---

### Problema

Usuários diferentes possuem expectativas diferentes.

---

### Objetivo

Produzir recomendações progressivamente mais relevantes.

---

### Responsabilidades

- compreender preferências;
- aprender padrões;
- adaptar comportamento;
- preservar consistência.

---

### Entidades

- Usuário
- Preferências
- Histórico
- Aprendizado

---

### Dependências

Gestão da Experiência.

---

### Valor

Aumentar relevância sem comprometer transparência.

---

# 14.12 CAP-08 — Ecossistema

## Missão

Conectar o RouteBook a serviços externos.

---

### Problema

Nenhuma plataforma possui todas as informações necessárias para apoiar decisões complexas.

---

### Objetivo

Enriquecer o contexto utilizando fontes externas confiáveis.

---

### Responsabilidades

- integrar provedores;
- consolidar informações;
- enriquecer alternativas;
- ampliar contexto.

---

### Entidades

- Contexto
- Alternativa
- Fonte de Dados

---

### Dependências

Nenhuma.

É uma capacidade transversal.

---

### Valor

Ampliar continuamente a capacidade analítica do produto sem expandir artificialmente seu domínio.

---

# 14.13 Cobertura do Ciclo de Decisão

Cada capacidade fortalece etapas específicas do ciclo fundamental do RouteBook.

| Etapa do Ciclo | Capacidades Responsáveis |
|----------------|--------------------------|
| Contexto | CAP-01, CAP-02, CAP-08 |
| Objetivos | CAP-01, CAP-02 |
| Necessidades | CAP-02 |
| Alternativas | CAP-03 |
| Comparação | CAP-04 |
| Recomendação | CAP-04 |
| Decisão | CAP-05 |
| Experiência | CAP-06 |
| Aprendizado | CAP-06, CAP-07 |

Essa matriz garante que todas as etapas do ciclo de decisão estejam cobertas por capacidades específicas e facilita a identificação de lacunas durante a evolução do produto.

---

# 15. Modelo de Maturidade das Capacidades

---

## 15.1 Objetivo

O Modelo de Maturidade das Capacidades estabelece como as capacidades funcionais do RouteBook evoluem ao longo do ciclo de vida do produto.

Enquanto a Arquitetura Funcional define **quais capacidades existem**, este capítulo define:

- quais capacidades são essenciais para o MVP;
- quais dependem de outras capacidades;
- como cada capacidade amadurece;
- quais objetivos estratégicos orientam sua evolução.

Este modelo garante que o crescimento do produto ocorra de forma incremental, consistente e alinhada aos princípios definidos na Foundation.

---

# 15.2 Princípios da Evolução

A evolução do RouteBook deverá respeitar os seguintes princípios.

## 15.2.1 Evolução orientada por valor

Uma capacidade somente deverá evoluir quando a nova funcionalidade aumentar a capacidade do usuário de tomar melhores decisões.

Novidade não representa valor por si só.

---

## 15.2.2 Evolução incremental

O produto deverá amadurecer em pequenas etapas.

Cada versão deve entregar valor utilizável e consistente.

Grandes reescritas deverão ser evitadas sempre que possível.

---

## 15.2.3 Preservação da identidade

Nenhuma evolução poderá modificar o propósito fundamental do RouteBook.

Todas as capacidades deverão permanecer alinhadas ao princípio:

> Transformar contexto em decisões melhores.

---

## 15.2.4 Independência entre capacidades

Embora colaborativas, as capacidades devem evoluir de forma relativamente independente.

Isso reduz riscos e facilita a entrega contínua.

---

# 15.3 Níveis de Maturidade

Cada capacidade poderá evoluir por quatro níveis de maturidade.

---

## Nível 1 — Operacional

A capacidade executa sua responsabilidade básica.

Características:

- comportamento determinístico;
- regras explícitas;
- baixa adaptação;
- baixa automação.

Objetivo:

Entregar uma solução funcional e confiável.

---

## Nível 2 — Contextual

A capacidade passa a considerar o contexto da jornada.

Características:

- adaptação ao contexto;
- uso de informações da jornada;
- respostas mais relevantes;
- menor necessidade de configuração manual.

Objetivo:

Reduzir esforço cognitivo do usuário.

---

## Nível 3 — Inteligente

A capacidade passa a interpretar padrões e gerar recomendações.

Características:

- análise de alternativas;
- identificação de padrões;
- priorização contextual;
- explicabilidade obrigatória.

Objetivo:

Melhorar significativamente a qualidade das decisões.

---

## Nível 4 — Adaptativa

A capacidade evolui continuamente a partir das experiências do usuário.

Características:

- aprendizado contínuo;
- personalização responsável;
- melhoria progressiva;
- manutenção da previsibilidade;
- transparência obrigatória.

Objetivo:

Maximizar a relevância das recomendações sem comprometer a confiança do usuário.

---

# 15.4 Maturidade das Capacidades

| Capacidade | Nível Inicial | Nível Alvo |
|-------------|---------------|------------|
| CAP-01 — Gestão da Jornada | Operacional | Adaptativa |
| CAP-02 — Inteligência Contextual | Operacional | Adaptativa |
| CAP-03 — Descoberta | Operacional | Inteligente |
| CAP-04 — Motor de Decisão | Contextual | Adaptativa |
| CAP-05 — Execução da Jornada | Operacional | Inteligente |
| CAP-06 — Gestão da Experiência | Operacional | Adaptativa |
| CAP-07 — Personalização | Contextual | Adaptativa |
| CAP-08 — Ecossistema | Operacional | Inteligente |

Nem todas as capacidades precisam atingir o mesmo nível de inteligência.

O objetivo é que cada uma evolua até o ponto em que maximize seu valor para o usuário.

---

# 15.5 Priorização por Fases

A evolução do RouteBook será organizada em fases estratégicas.

---

## Fase 1 — Fundação do Produto (MVP)

Objetivo:

Disponibilizar um produto funcional capaz de apoiar decisões durante uma jornada.

Capacidades prioritárias:

- CAP-01 — Gestão da Jornada
- CAP-02 — Inteligência Contextual
- CAP-03 — Descoberta
- CAP-04 — Motor de Decisão

Resultado esperado:

O usuário consegue criar uma jornada, compreender seu contexto, explorar alternativas e receber recomendações justificadas.

---

## Fase 2 — Continuidade da Jornada

Objetivo:

Expandir o suporte para além da recomendação inicial.

Capacidades adicionadas:

- CAP-05 — Execução da Jornada
- CAP-06 — Gestão da Experiência

Resultado esperado:

O RouteBook acompanha o usuário durante toda a jornada e registra os resultados das decisões.

---

## Fase 3 — Inteligência Personalizada

Objetivo:

Aumentar a relevância das recomendações por meio do aprendizado contínuo.

Capacidade priorizada:

- CAP-07 — Personalização

Resultado esperado:

As recomendações tornam-se progressivamente mais alinhadas às preferências do usuário, preservando explicabilidade e previsibilidade.

---

## Fase 4 — Plataforma Integrada

Objetivo:

Ampliar o ecossistema de informações disponíveis para apoiar decisões.

Capacidade priorizada:

- CAP-08 — Ecossistema

Resultado esperado:

O produto passa a enriquecer o contexto utilizando múltiplas fontes externas de informação e serviços.

---

# 15.6 Dependências Estratégicas

A evolução das capacidades deve respeitar as seguintes dependências.

```text
CAP-01
Gestão da Jornada

↓

CAP-02
Inteligência Contextual

↓

CAP-03
Descoberta

↓

CAP-04
Motor de Decisão

↓

CAP-05
Execução da Jornada

↓

CAP-06
Gestão da Experiência

↓

CAP-07
Personalização

CAP-08
Ecossistema
└── fornece suporte transversal para todas as demais capacidades.
```

Essas dependências representam relações conceituais de evolução, e não restrições técnicas de implementação.

---

# 15.7 Critérios para Evolução

Uma capacidade somente poderá evoluir para o próximo nível de maturidade quando atender simultaneamente aos seguintes critérios:

- entregar valor comprovado ao usuário;
- manter alinhamento com a Foundation;
- preservar a transparência das recomendações;
- manter comportamento previsível;
- possuir métricas que demonstrem ganho real de qualidade.

Novos comportamentos não deverão ser incorporados apenas por disponibilidade tecnológica.

---

# 15.8 Relação com o Roadmap

O Roadmap Oficial do RouteBook deverá ser construído a partir deste Modelo de Maturidade.

Cada iniciativa estratégica deverá indicar:

- capacidade impactada;
- nível de maturidade atual;
- nível de maturidade esperado;
- valor esperado para o usuário;
- indicadores que validarão a evolução.

Isso garante que o crescimento do produto permaneça orientado por capacidades e não por listas isoladas de funcionalidades.

---

# 15.9 Critérios de Revisão

Este modelo deverá ser revisado sempre que ocorrer:

- criação de uma nova capacidade;
- alteração significativa do domínio do produto;
- mudança na estratégia definida pela Foundation;
- evolução relevante do Roadmap.

Mudanças neste capítulo exigem avaliação conjunta das áreas de Produto, Arquitetura e UX para garantir consistência com toda a documentação oficial.

---

# 16. Modelo Oficial de Especificação das Subcapacidades

---

## 16.1 Objetivo

As capacidades definem as responsabilidades permanentes do RouteBook.

Entretanto, uma capacidade representa um nível de abstração elevado e normalmente reúne diferentes responsabilidades relacionadas.

Para reduzir a complexidade e aumentar a rastreabilidade, cada capacidade será organizada em Subcapacidades.

Uma Subcapacidade representa um agrupamento coeso de responsabilidades que colaboram para cumprir a missão da capacidade à qual pertence.

Ela não representa uma tela, um serviço técnico ou um componente de software.

Representa uma responsabilidade funcional do produto.

---

# 16.2 Hierarquia Funcional Completa

A especificação oficial do RouteBook passa a seguir a seguinte estrutura hierárquica.

```text
Produto

↓

Capacidade (CAP)

↓

Subcapacidade (SCAP)

↓

Funcionalidade (FUNC)

↓

Fluxo

↓

Caso de Uso

↓

Requisito Funcional (RF)

↓

Regra de Negócio (RN)

↓

Critério de Aceite (CA)

↓

Caso de Teste
```

Cada nível complementa o anterior.

Nenhum elemento poderá existir sem estar vinculado ao seu elemento imediatamente superior.

---

# 16.3 O que é uma Subcapacidade

Uma Subcapacidade representa um conjunto de responsabilidades relacionadas dentro de uma mesma capacidade.

Ela deve possuir:

- propósito claro;
- escopo delimitado;
- alta coesão;
- baixo acoplamento;
- independência funcional.

Mudanças em uma Subcapacidade devem produzir o menor impacto possível nas demais.

---

# 16.4 Critérios para Criação de Subcapacidades

Uma nova Subcapacidade somente deverá ser criada quando atender simultaneamente aos seguintes critérios:

- resolver um problema específico do domínio;
- possuir objetivos próprios;
- concentrar responsabilidades relacionadas;
- justificar documentação independente;
- evitar duplicidade com outras Subcapacidades.

Caso esses critérios não sejam atendidos, a funcionalidade deverá ser incorporada a uma Subcapacidade existente.

---

# 16.5 Estrutura Oficial

Todas as Subcapacidades deverão seguir exatamente a estrutura abaixo.

```text
Subcapacidade

↓

Problema de Negócio

↓

Objetivo

↓

Valor para o Usuário

↓

Valor para o Produto

↓

Escopo

↓

Fora do Escopo

↓

Entidades Envolvidas

↓

Entradas

↓

Saídas

↓

Estados

↓

Eventos

↓

Funcionalidades

↓

Fluxos

↓

Regras de Negócio

↓

Requisitos Funcionais

↓

Critérios de Aceite

↓

Indicadores

↓

Dependências

↓

Evoluções Futuras
```

Esta estrutura é obrigatória para todas as Subcapacidades do RouteBook.

---

# 16.6 Convenção de Identificação

Cada Subcapacidade possuirá um identificador único.

Formato:

```
SCAP-XX.YY
```

Onde:

- XX representa a capacidade.
- YY representa a sequência da Subcapacidade.

Exemplos:

```
SCAP-01.01
Ciclo de Vida da Jornada

SCAP-01.02
Gestão de Objetivos

SCAP-01.03
Gestão de Participantes

SCAP-01.04
Gestão de Momentos

SCAP-01.05
Gestão de Estado
```

Os identificadores deverão permanecer estáveis ao longo da evolução do produto.

---

# 16.7 Convenção para Funcionalidades

As funcionalidades passam a utilizar o seguinte padrão.

```
CAP-01

↓

SCAP-01.02

↓

FUNC-003
```

Exemplo completo:

```
CAP-01
Gestão da Jornada

↓

SCAP-01.02
Gestão de Objetivos

↓

FUNC-002
Editar Objetivo
```

Essa organização facilita rastreabilidade e manutenção.

---

# 16.8 Convenção para Requisitos

Cada requisito funcional deverá indicar explicitamente sua origem.

Exemplo:

```
CAP-01

↓

SCAP-01.04

↓

FUNC-002

↓

RF-007
```

Da mesma forma, regras de negócio e critérios de aceite também deverão estar vinculados à funcionalidade correspondente.

---

# 16.9 Modelo de Rastreabilidade

Todo elemento do produto deverá manter rastreabilidade completa.

```text
Foundation

↓

Objetivo Estratégico

↓

Capacidade

↓

Subcapacidade

↓

Funcionalidade

↓

Fluxo

↓

Requisito Funcional

↓

Critério de Aceite

↓

Caso de Teste
```

Esse modelo garante consistência entre estratégia, especificação, implementação e validação.

---

# 16.10 Convenções de Escrita

Todas as Subcapacidades deverão seguir os seguintes princípios.

## Linguagem comportamental

Descrever o comportamento esperado.

Jamais a implementação.

---

## Linguagem verificável

Todo comportamento descrito deve poder ser validado objetivamente.

---

## Linguagem consistente

Utilizar exclusivamente a terminologia oficial definida no Modelo Conceitual.

---

## Responsabilidade única

Cada funcionalidade deverá possuir apenas um objetivo principal.

---

## Independência

Subcapacidades devem minimizar dependências entre si.

---

# 16.11 Critérios de Qualidade

Uma Subcapacidade somente poderá ser considerada completa quando atender aos seguintes critérios.

### Clareza

O comportamento pode ser compreendido sem necessidade de interpretações adicionais.

---

### Coesão

Todas as responsabilidades pertencem claramente ao mesmo domínio.

---

### Completude

Todos os fluxos relevantes foram documentados.

---

### Consistência

Está alinhada ao Modelo Conceitual, Filosofia do Produto e Arquitetura Funcional.

---

### Testabilidade

Todos os requisitos possuem critérios objetivos de validação.

---

### Valor

Contribui diretamente para melhorar a capacidade do usuário de tomar decisões.

Caso esse vínculo não exista, a Subcapacidade deverá ser revista.

---

# 16.12 Estrutura Base para as Próximas Seções

A partir deste ponto, todas as capacidades do RouteBook seguirão a mesma organização.

Exemplo:

```text
CAP-01 — Gestão da Jornada

│

├── SCAP-01.01 — Ciclo de Vida da Jornada

├── SCAP-01.02 — Gestão de Objetivos

├── SCAP-01.03 — Gestão de Participantes

├── SCAP-01.04 — Gestão de Momentos

└── SCAP-01.05 — Gestão de Estado da Jornada
```

Cada Subcapacidade será especificada de forma independente, utilizando o modelo definido neste capítulo.

Essa abordagem garante escalabilidade, facilita futuras evoluções do produto e reduz significativamente ambiguidades na documentação.

---

# 17. CAP-01 — Gestão da Jornada

---

## 17.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | CAP-01 |
| Nome | Gestão da Jornada |
| Categoria | Capacidade Central |
| Criticidade | Muito Alta |
| Prioridade | Essencial para o MVP |
| Estado | Obrigatória |
| Responsável | Product |
| Dependências | CAP-02, CAP-04 |
| Entidades Principais | Jornada, Usuário, Objetivo, Momento, Contexto |

---

# 17.2 Missão

A capacidade **Gestão da Jornada** é responsável por representar, organizar e acompanhar toda a evolução da jornada do usuário.

Ela estabelece a Jornada como a principal unidade organizacional do RouteBook.

Todas as decisões apoiadas pelo produto pertencem a uma jornada.

Mesmo quando o usuário realiza apenas uma única atividade, essa atividade será compreendida como uma jornada composta por um ou mais momentos.

Sem esta capacidade, o RouteBook perderia a continuidade necessária para compreender contexto, objetivos e evolução das decisões.

---

# 17.3 Problema de Negócio

Os usuários tomam dezenas de decisões relacionadas a um mesmo objetivo utilizando aplicações independentes.

Como consequência:

- o contexto é perdido entre uma decisão e outra;
- não existe continuidade entre as atividades realizadas;
- decisões anteriores não influenciam decisões futuras;
- objetivos deixam de orientar recomendações posteriores.

A ausência de uma estrutura que represente a jornada faz com que cada decisão seja tratada como um evento isolado.

Isso aumenta a carga cognitiva, reduz a qualidade das recomendações e dificulta o aprendizado contínuo do produto.

---

# 17.4 Objetivo Estratégico

Transformar uma sequência de decisões independentes em uma jornada contínua, estruturada e contextualizada.

A Gestão da Jornada fornece a base necessária para que todas as demais capacidades compreendam:

- onde o usuário está;
- por que está ali;
- qual objetivo pretende alcançar;
- quais decisões já foram tomadas;
- quais decisões ainda precisam ser tomadas.

---

# 17.5 Objetivos da Capacidade

A Gestão da Jornada deve ser capaz de:

- representar uma jornada do início ao fim;
- manter a continuidade entre decisões;
- registrar objetivos;
- registrar participantes;
- organizar momentos;
- acompanhar mudanças de contexto;
- preservar histórico;
- controlar o estado da jornada;
- disponibilizar informações para as demais capacidades.

---

# 17.6 Valor para o Usuário

Para o usuário, esta capacidade proporciona:

- continuidade da experiência;
- redução da necessidade de repetir informações;
- recomendações mais relevantes;
- organização da jornada;
- melhor acompanhamento da evolução do objetivo.

O usuário percebe o RouteBook como um assistente que acompanha toda a jornada, e não apenas decisões isoladas.

---

# 17.7 Valor para o Produto

Para o RouteBook, esta capacidade representa a principal fonte de contexto.

Ela permite:

- compreender a evolução da jornada;
- correlacionar decisões;
- manter consistência entre recomendações;
- registrar histórico;
- produzir aprendizado contextual.

Sem Gestão da Jornada, todas as demais capacidades tornam-se significativamente menos eficazes.

---

# 17.8 Escopo

Esta capacidade é responsável por:

- criação de jornadas;
- atualização de jornadas;
- encerramento de jornadas;
- organização temporal da jornada;
- gestão de participantes;
- gestão de objetivos;
- gestão de estados;
- gestão de momentos;
- disponibilização da jornada para outras capacidades.

---

# 17.9 Fora do Escopo

Esta capacidade não é responsável por:

- gerar recomendações;
- interpretar contexto;
- descobrir alternativas;
- realizar reservas;
- executar pagamentos;
- consultar serviços externos;
- personalizar recomendações.

Essas responsabilidades pertencem a outras capacidades.

---

# 17.10 Responsabilidades

A Gestão da Jornada possui as seguintes responsabilidades permanentes:

### Organização

Representar a jornada como uma entidade única.

---

### Continuidade

Garantir que todas as decisões pertençam a uma mesma sequência lógica.

---

### Persistência

Preservar informações relevantes durante toda a duração da jornada.

---

### Coordenação

Disponibilizar informações para as demais capacidades.

---

### Governança

Controlar estados, transições e integridade da jornada.

---

# 17.11 Entidades Utilizadas

A capacidade utiliza as seguintes entidades do Modelo Conceitual.

| Entidade | Papel |
|-----------|-------|
| Usuário | Proprietário da jornada |
| Jornada | Entidade central |
| Objetivo | Define o propósito da jornada |
| Momento | Segmenta a evolução da jornada |
| Contexto | Caracteriza cada momento |
| Decisão | Resultado esperado da interação |
| Experiência | Resultado observado após decisões |

---

# 17.12 Eventos de Negócio

A Gestão da Jornada reage ou produz os seguintes eventos.

### Jornada Criada

Indica o início de uma nova jornada.

---

### Jornada Atualizada

Ocorre quando qualquer informação relevante é modificada.

---

### Objetivo Adicionado

Representa a inclusão de um novo objetivo.

---

### Objetivo Atualizado

Indica alteração de prioridades ou resultados esperados.

---

### Participante Adicionado

Novo participante passa a integrar a jornada.

---

### Participante Removido

Participante deixa de fazer parte da jornada.

---

### Momento Criado

Novo momento é registrado.

---

### Momento Encerrado

Momento atual é concluído.

---

### Jornada Pausada

A jornada permanece válida, porém temporariamente interrompida.

---

### Jornada Retomada

A jornada volta ao estado ativo.

---

### Jornada Concluída

Todos os objetivos foram atingidos ou a jornada foi encerrada pelo usuário.

---

### Jornada Cancelada

A jornada é encerrada antes de atingir seus objetivos.

---

# 17.13 Estados da Jornada

Uma Jornada pode assumir os seguintes estados.

```text
Planejada

↓

Preparação

↓

Em Andamento

↓

Pausada

↓

Retomada

↓

Concluída
```

Estado alternativo:

```text
Cancelada
```

Cada transição deverá obedecer às regras definidas nas Subcapacidades.

---

# 17.14 Dependências

Esta capacidade depende diretamente de:

### CAP-02

Inteligência Contextual

Responsável por compreender continuamente o contexto da jornada.

---

### CAP-04

Motor de Decisão

Utiliza informações da jornada para produzir recomendações.

---

Também fornece informações para:

- Descoberta;
- Execução da Jornada;
- Gestão da Experiência;
- Personalização.

---

# 17.15 Indicadores

A evolução desta capacidade deverá ser acompanhada por indicadores próprios.

Exemplos:

- número médio de jornadas criadas;
- jornadas concluídas;
- jornadas abandonadas;
- duração média;
- quantidade média de momentos;
- objetivos por jornada;
- tempo médio até primeira decisão;
- continuidade da jornada.

Esses indicadores serão detalhados posteriormente na seção de KPIs.

---

# 17.16 Catálogo Oficial das Subcapacidades

A Gestão da Jornada é composta pelas seguintes Subcapacidades.

```text
CAP-01

│

├── SCAP-01.01
│   Ciclo de Vida da Jornada
│
├── SCAP-01.02
│   Gestão de Objetivos
│
├── SCAP-01.03
│   Gestão de Participantes
│
├── SCAP-01.04
│   Gestão de Momentos
│
├── SCAP-01.05
│   Gestão de Estado
│
└── SCAP-01.06
    Histórico da Jornada
```

Cada Subcapacidade será especificada em capítulos próprios.

---

# 17.17 Critérios de Qualidade

A capacidade será considerada completa quando:

- representar corretamente todo o ciclo da jornada;
- preservar continuidade entre decisões;
- disponibilizar informações consistentes para outras capacidades;
- permitir evolução incremental sem perda de histórico;
- manter alinhamento com o Modelo Conceitual;
- suportar todas as jornadas previstas pelo produto.

---

# 17.18 Relação com o Ciclo de Decisão

A Gestão da Jornada atua em praticamente todas as etapas do ciclo de decisão.

```text
Contexto
      ▲
      │
Jornada ─────► Objetivos
      │
      ▼
Momentos
      │
      ▼
Decisões
      │
      ▼
Experiências
```

Essa capacidade fornece a estrutura sobre a qual todas as demais capacidades operam.

Ela não produz recomendações, mas torna possível que elas sejam contextualizadas.

---

# 18. SCAP-01.01 — Ciclo de Vida da Jornada

---

## 18.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-01.01 |
| Capacidade | CAP-01 — Gestão da Jornada |
| Nome | Ciclo de Vida da Jornada |
| Criticidade | Muito Alta |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 18.2 Problema de Negócio

O usuário inicia, modifica e conclui diferentes jornadas ao longo do tempo.

Sem um modelo explícito de ciclo de vida:

- não existe continuidade;
- estados tornam-se ambíguos;
- diferentes módulos interpretam a jornada de formas distintas;
- recomendações podem utilizar informações inconsistentes.

Esta Subcapacidade estabelece um modelo único para representar toda a evolução de uma jornada.

---

# 18.3 Objetivo

Gerenciar todo o ciclo de vida de uma Jornada desde sua criação até seu encerramento, garantindo integridade, rastreabilidade e consistência.

---

# 18.4 Valor para o Usuário

O usuário passa a perceber a jornada como um processo contínuo.

Benefícios:

- continuidade;
- organização;
- histórico completo;
- retomada facilitada;
- menor necessidade de repetir informações.

---

# 18.5 Valor para o Produto

Esta Subcapacidade fornece a estrutura temporal utilizada por todas as demais capacidades.

Sem ela:

- não existe contexto persistente;
- não existe histórico consistente;
- não existe aprendizado contextual.

---

# 18.6 Escopo

Esta Subcapacidade é responsável por:

- criação;
- atualização;
- pausa;
- retomada;
- encerramento;
- cancelamento;
- arquivamento lógico;
- recuperação da jornada.

---

# 18.7 Fora do Escopo

Não faz parte desta Subcapacidade:

- gestão de objetivos;
- gestão de participantes;
- gestão de momentos;
- recomendações;
- personalização;
- contexto.

---

# 18.8 Entidades Envolvidas

- Jornada
- Usuário
- Objetivo
- Momento
- Estado

---

# 18.9 Modelo de Estados

Uma Jornada deverá possuir exatamente um estado ativo por vez.

Estados oficiais:

```text
Planejada

↓

Preparação

↓

Em Andamento

↓

Pausada

↓

Em Andamento

↓

Concluída
```

Estados alternativos:

```text
Cancelada

Arquivada
```

---

# 18.10 Descrição dos Estados

### Planejada

A jornada foi criada, mas ainda não iniciou.

---

### Preparação

O usuário está organizando informações antes do início efetivo.

---

### Em Andamento

A jornada está ativa.

Este é o estado operacional principal.

---

### Pausada

A jornada permanece válida, porém temporariamente interrompida.

Nenhuma informação é perdida.

---

### Concluída

Os objetivos foram atingidos ou o usuário decidiu finalizar a jornada.

---

### Cancelada

A jornada foi encerrada antes da conclusão prevista.

---

### Arquivada

A jornada permanece disponível apenas para consulta histórica.

---

# 18.11 Transições Permitidas

```text
Planejada

↓

Preparação

↓

Em Andamento

↓

Pausada

↓

Em Andamento

↓

Concluída
```

Fluxos alternativos:

```text
Planejada

↓

Cancelada
```

```text
Preparação

↓

Cancelada
```

```text
Em Andamento

↓

Cancelada
```

Após conclusão:

```text
Concluída

↓

Arquivada
```

---

# 18.12 Eventos de Negócio

A Subcapacidade responde aos seguintes eventos.

- Jornada Criada
- Jornada Atualizada
- Jornada Iniciada
- Jornada Pausada
- Jornada Retomada
- Jornada Concluída
- Jornada Cancelada
- Jornada Arquivada
- Jornada Restaurada

---

# 18.13 Funcionalidades

| Código | Funcionalidade |
|----------|----------------|
| FUNC-001 | Criar Jornada |
| FUNC-002 | Atualizar Jornada |
| FUNC-003 | Iniciar Jornada |
| FUNC-004 | Pausar Jornada |
| FUNC-005 | Retomar Jornada |
| FUNC-006 | Encerrar Jornada |
| FUNC-007 | Cancelar Jornada |
| FUNC-008 | Arquivar Jornada |
| FUNC-009 | Restaurar Jornada |

Cada funcionalidade será especificada individualmente.

---

# 18.14 Regras de Negócio

## RN-001

Toda Jornada deve possuir exatamente um proprietário.

---

## RN-002

Toda Jornada deve possuir um identificador permanente.

---

## RN-003

Uma Jornada deve possuir exatamente um estado ativo.

---

## RN-004

Estados inválidos não podem ser assumidos.

---

## RN-005

Transições somente podem ocorrer conforme o modelo oficial.

---

## RN-006

Uma Jornada Concluída não pode retornar ao estado Em Andamento.

---

## RN-007

Uma Jornada Arquivada não pode ser modificada.

---

## RN-008

Toda mudança de estado deve gerar um evento de negócio.

---

## RN-009

Toda alteração deve permanecer registrada no histórico.

---

# 18.15 Requisitos Funcionais

### RF-001

O produto deve permitir a criação de uma nova Jornada.

---

### RF-002

O produto deve controlar o estado atual da Jornada.

---

### RF-003

O produto deve impedir transições inválidas.

---

### RF-004

O produto deve registrar todas as mudanças de estado.

---

### RF-005

O produto deve permitir interromper temporariamente uma Jornada.

---

### RF-006

O produto deve permitir retomar uma Jornada pausada.

---

### RF-007

O produto deve permitir concluir uma Jornada.

---

### RF-008

O produto deve permitir cancelar uma Jornada.

---

### RF-009

O produto deve manter histórico completo do ciclo de vida.

---

# 18.16 Critérios de Aceite

Exemplo.

### RF-001

**Dado**

que o usuário deseje iniciar uma nova jornada

**Quando**

informar os dados mínimos obrigatórios

**Então**

uma nova Jornada deverá ser criada no estado Planejada.

---

### RF-005

**Dado**

que a Jornada esteja Em Andamento

**Quando**

o usuário solicitar interrupção

**Então**

o estado deverá mudar para Pausada preservando todo o contexto existente.

---

# 18.17 Indicadores

Esta Subcapacidade deverá acompanhar:

- jornadas criadas;
- jornadas concluídas;
- jornadas canceladas;
- jornadas pausadas;
- tempo médio até início;
- tempo médio de conclusão;
- taxa de abandono.

---

# 18.18 Dependências

Depende diretamente de:

- SCAP-01.02 — Gestão de Objetivos;
- SCAP-01.04 — Gestão de Momentos;
- CAP-02 — Inteligência Contextual.

---

# 18.19 Evoluções Futuras

Versões futuras poderão incluir:

- modelos de jornada recorrente;
- modelos reutilizáveis;
- jornadas colaborativas avançadas;
- automação de encerramento baseada em contexto;
- sugestão automática de retomada.

Essas evoluções deverão preservar o modelo oficial de ciclo de vida definido nesta Subcapacidade.

---

# 19. SCAP-01.02 — Gestão de Objetivos

---

## 19.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-01.02 |
| Capacidade | CAP-01 — Gestão da Jornada |
| Nome | Gestão de Objetivos |
| Criticidade | Muito Alta |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 19.2 Problema de Negócio

Toda jornada existe para alcançar um ou mais objetivos.

Na ausência de objetivos claramente definidos:

- recomendações tornam-se genéricas;
- prioridades tornam-se ambíguas;
- conflitos entre interesses não são identificados;
- o produto perde a capacidade de avaliar se a jornada foi bem-sucedida.

Sem objetivos, a jornada deixa de possuir direção.

---

# 19.3 Objetivo

Permitir que toda Jornada possua objetivos explícitos, organizados, priorizados e continuamente atualizados durante sua evolução.

Os objetivos representam a principal referência utilizada pelas demais capacidades para compreender o sucesso esperado da jornada.

---

# 19.4 Valor para o Usuário

A Gestão de Objetivos permite que o usuário:

- mantenha clareza sobre o propósito da jornada;
- organize prioridades;
- adapte objetivos quando necessário;
- acompanhe sua evolução;
- compreenda conflitos entre diferentes objetivos.

---

# 19.5 Valor para o Produto

Esta Subcapacidade fornece ao RouteBook um entendimento explícito da intenção do usuário.

Os objetivos orientam:

- descoberta de alternativas;
- recomendações;
- avaliação de sucesso;
- aprendizado;
- personalização.

Sem objetivos claros, o Motor de Decisão perde sua principal referência estratégica.

---

# 19.6 Escopo

Esta Subcapacidade é responsável por:

- criar objetivos;
- atualizar objetivos;
- remover objetivos quando permitido;
- alterar prioridades;
- registrar progresso;
- concluir objetivos;
- cancelar objetivos;
- relacionar objetivos à jornada.

---

# 19.7 Fora do Escopo

Não faz parte desta Subcapacidade:

- gerar recomendações;
- avaliar alternativas;
- interpretar contexto;
- definir preferências;
- gerenciar participantes.

---

# 19.8 Entidades Envolvidas

- Jornada
- Objetivo
- Usuário
- Momento
- Contexto
- Decisão

---

# 19.9 Modelo Conceitual do Objetivo

Um Objetivo representa o resultado que o usuário deseja alcançar durante uma jornada.

Características:

- possui propósito;
- pode ser mensurável ou qualitativo;
- pode mudar ao longo da jornada;
- influencia recomendações;
- pode depender de outros objetivos.

Exemplos:

- conhecer atrações históricas;
- reduzir gastos;
- evitar filas;
- descansar;
- realizar atividades ao ar livre;
- visitar restaurantes típicos.

---

# 19.10 Tipos de Objetivos

Para garantir flexibilidade, o RouteBook reconhece diferentes categorias.

### Objetivo Principal

Representa a principal razão da existência da jornada.

Toda Jornada deverá possuir exatamente um Objetivo Principal.

---

### Objetivos Secundários

Complementam o objetivo principal.

Podem existir múltiplos objetivos secundários.

---

### Objetivos Temporários

Representam necessidades específicas de um determinado momento.

Exemplos:

- encontrar estacionamento;
- almoçar;
- comprar água.

São válidos apenas durante parte da jornada.

---

### Objetivos Emergentes

Surgem devido a mudanças de contexto.

Exemplo:

Uma mudança climática transforma o objetivo "caminhar ao ar livre" em "encontrar uma atividade coberta".

---

# 19.11 Estados do Objetivo

Cada Objetivo possui exatamente um estado.

```text
Planejado

↓

Ativo

↓

Concluído
```

Fluxos alternativos:

```text
Cancelado
```

ou

```text
Substituído
```

---

# 19.12 Funcionalidades

| Código | Funcionalidade |
|---------|----------------|
| FUNC-001 | Criar Objetivo |
| FUNC-002 | Atualizar Objetivo |
| FUNC-003 | Priorizar Objetivos |
| FUNC-004 | Associar Objetivo à Jornada |
| FUNC-005 | Registrar Progresso |
| FUNC-006 | Concluir Objetivo |
| FUNC-007 | Cancelar Objetivo |
| FUNC-008 | Substituir Objetivo |

---

# 19.13 Regras de Negócio

### RN-001

Toda Jornada deve possuir exatamente um Objetivo Principal.

---

### RN-002

Objetivos Secundários não podem substituir automaticamente o Objetivo Principal.

---

### RN-003

Todo Objetivo deve possuir um estado válido.

---

### RN-004

Um Objetivo Concluído não pode retornar ao estado Ativo.

---

### RN-005

Objetivos podem ser priorizados.

A alteração de prioridade deve ser registrada no histórico.

---

### RN-006

Objetivos podem entrar em conflito.

Quando um conflito for identificado, ele deverá ser comunicado ao usuário e considerado pelo Motor de Decisão.

---

### RN-007

Objetivos Temporários não podem permanecer ativos após o encerramento do Momento ao qual pertencem.

---

### RN-008

A substituição de um Objetivo deve preservar seu histórico para fins de rastreabilidade e aprendizado.

---

# 19.14 Requisitos Funcionais

### RF-001

O produto deve permitir criar um Objetivo Principal para uma Jornada.

---

### RF-002

O produto deve permitir adicionar Objetivos Secundários.

---

### RF-003

O produto deve impedir a existência de mais de um Objetivo Principal simultâneo.

---

### RF-004

O produto deve permitir alterar prioridades entre objetivos.

---

### RF-005

O produto deve registrar todas as alterações realizadas nos objetivos.

---

### RF-006

O produto deve permitir concluir um objetivo.

---

### RF-007

O produto deve permitir cancelar um objetivo.

---

### RF-008

O produto deve preservar o histórico completo de todos os objetivos.

---

### RF-009

O produto deve identificar conflitos entre objetivos quando eles afetarem a tomada de decisão.

---

# 19.15 Critérios de Aceite

### RF-001

**Dado** que uma nova Jornada esteja sendo criada

**Quando** o usuário informar seu objetivo principal

**Então** o produto deverá registrar esse objetivo como Objetivo Principal da Jornada.

---

### RF-003

**Dado** que já exista um Objetivo Principal ativo

**Quando** o usuário tentar criar outro Objetivo Principal

**Então** o produto deverá impedir a operação e orientar o usuário a substituir ou reclassificar o objetivo existente.

---

### RF-009

**Dado** que dois objetivos apresentem restrições incompatíveis

**Quando** o Motor de Decisão analisar alternativas

**Então** o conflito deverá ser identificado e comunicado ao usuário antes da recomendação.

---

# 19.16 Indicadores

Esta Subcapacidade deverá monitorar:

- quantidade média de objetivos por jornada;
- distribuição entre objetivos principais, secundários e temporários;
- frequência de alterações de prioridade;
- quantidade de objetivos concluídos;
- conflitos identificados;
- taxa de conclusão do objetivo principal;
- tempo médio para conclusão de objetivos.

---

# 19.17 Dependências

Depende diretamente de:

- SCAP-01.01 — Ciclo de Vida da Jornada;
- SCAP-01.04 — Gestão de Momentos;
- CAP-02 — Inteligência Contextual;
- CAP-04 — Motor de Decisão.

Também fornece informações para:

- Descoberta;
- Execução da Jornada;
- Gestão da Experiência;
- Personalização.

---

# 19.18 Evoluções Futuras

Esta Subcapacidade poderá evoluir para incluir:

- sugestão automática de objetivos com base no contexto;
- decomposição automática de objetivos complexos em objetivos menores;
- objetivos compartilhados entre participantes;
- objetivos recorrentes reutilizáveis;
- acompanhamento preditivo do progresso.

Todas essas evoluções deverão manter a autonomia do usuário e respeitar a Filosofia do Produto definida neste PRD.

---

# 20. SCAP-01.03 — Gestão de Participantes

---

## 20.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-01.03 |
| Capacidade | CAP-01 — Gestão da Jornada |
| Nome | Gestão de Participantes |
| Criticidade | Alta |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 20.2 Problema de Negócio

Grande parte das jornadas não é realizada individualmente.

Viagens em família, encontros entre amigos, eventos corporativos, passeios em casal e experiências em grupo exigem que decisões considerem múltiplas pessoas simultaneamente.

Quando apenas um usuário é considerado:

- preferências importantes são ignoradas;
- conflitos não são identificados;
- recomendações tornam-se menos relevantes;
- aumenta a probabilidade de decisões inadequadas para parte do grupo.

O RouteBook deve compreender que uma jornada pode possuir múltiplos participantes.

---

# 20.3 Objetivo

Permitir que uma Jornada represente corretamente todas as pessoas envolvidas, suas responsabilidades, preferências, restrições e participação nas decisões.

---

# 20.4 Valor para o Usuário

Esta Subcapacidade permite:

- organizar jornadas em grupo;
- compartilhar objetivos;
- considerar diferentes preferências;
- reduzir conflitos;
- produzir recomendações mais adequadas para todos os participantes.

---

# 20.5 Valor para o Produto

A Gestão de Participantes amplia significativamente a qualidade do contexto disponível.

Ela permite que futuras recomendações considerem fatores como:

- composição do grupo;
- perfil dos participantes;
- necessidades específicas;
- restrições individuais;
- objetivos compartilhados.

---

# 20.6 Escopo

Esta Subcapacidade é responsável por:

- adicionar participantes;
- remover participantes;
- alterar participação;
- definir papéis;
- registrar preferências individuais;
- registrar restrições;
- controlar participação durante toda a jornada.

---

# 20.7 Fora do Escopo

Não faz parte desta Subcapacidade:

- autenticação;
- gerenciamento de contas;
- permissões da plataforma;
- comunicação entre usuários;
- convites externos;
- compartilhamento de conteúdo.

Esses comportamentos pertencem a outras capacidades do produto.

---

# 20.8 Entidades Envolvidas

- Jornada
- Usuário
- Participante
- Objetivo
- Contexto

---

# 20.9 Modelo Conceitual

Uma Jornada pode possuir um ou mais participantes.

Todo participante representa uma pessoa cuja presença influencia as decisões daquela jornada.

Participantes não precisam possuir exatamente o mesmo nível de envolvimento.

Alguns podem participar durante toda a jornada.

Outros apenas em momentos específicos.

---

# 20.10 Papéis dos Participantes

Todo participante deverá possuir um papel dentro da Jornada.

### Proprietário

Responsável pela criação e administração da Jornada.

Existe exatamente um proprietário.

---

### Organizador

Auxilia na organização.

Pode alterar informações conforme permissões da Jornada.

Podem existir vários organizadores.

---

### Participante

Participa normalmente da jornada.

Suas preferências e restrições devem ser consideradas.

---

### Convidado

Participa parcialmente.

Pode não influenciar todas as decisões.

---

### Observador

Acompanha a jornada sem participar diretamente das decisões.

Utilizado principalmente em jornadas corporativas ou organizacionais.

---

# 20.11 Estados de Participação

Cada participante possui exatamente um estado.

```text
Convidado

↓

Confirmado

↓

Participando

↓

Concluído
```

Fluxos alternativos:

```text
Recusado

Removido

Desistiu
```

---

# 20.12 Preferências

Cada participante poderá informar preferências relacionadas à jornada.

Exemplos:

- gastronomia;
- orçamento;
- mobilidade;
- ritmo da viagem;
- horários;
- atividades;
- acessibilidade;
- idiomas.

As preferências representam informações contextuais.

Elas não garantem que determinada alternativa será escolhida.

---

# 20.13 Restrições

Além das preferências, participantes podem possuir restrições.

Exemplos:

- mobilidade reduzida;
- restrições alimentares;
- idade;
- horários disponíveis;
- orçamento máximo;
- limitações físicas.

As restrições possuem prioridade superior às preferências durante a geração de recomendações.

---

# 20.14 Funcionalidades

| Código | Funcionalidade |
|---------|----------------|
| FUNC-001 | Adicionar Participante |
| FUNC-002 | Remover Participante |
| FUNC-003 | Alterar Papel |
| FUNC-004 | Registrar Preferências |
| FUNC-005 | Registrar Restrições |
| FUNC-006 | Atualizar Participação |
| FUNC-007 | Confirmar Participação |
| FUNC-008 | Encerrar Participação |

---

# 20.15 Regras de Negócio

### RN-001

Toda Jornada deve possuir exatamente um Proprietário.

---

### RN-002

Um participante pode possuir apenas um papel por vez.

---

### RN-003

Preferências podem entrar em conflito.

Esses conflitos deverão ser comunicados ao Motor de Decisão.

---

### RN-004

Restrições possuem prioridade sobre preferências.

---

### RN-005

Um participante removido deixa de influenciar novas recomendações, mas seu histórico permanece registrado.

---

### RN-006

A alteração do papel de um participante deverá ser registrada no histórico da Jornada.

---

### RN-007

O encerramento da Jornada encerra automaticamente a participação de todos os participantes.

---

# 20.16 Requisitos Funcionais

### RF-001

O produto deve permitir adicionar participantes a uma Jornada.

---

### RF-002

O produto deve permitir remover participantes.

---

### RF-003

O produto deve permitir alterar papéis.

---

### RF-004

O produto deve registrar preferências individuais.

---

### RF-005

O produto deve registrar restrições individuais.

---

### RF-006

O produto deve considerar participantes ativos durante a geração de recomendações.

---

### RF-007

O produto deve preservar histórico completo da participação.

---

### RF-008

O produto deve identificar conflitos relevantes entre participantes.

---

# 20.17 Critérios de Aceite

### RF-001

**Dado** que exista uma Jornada ativa

**Quando** o proprietário adicionar um novo participante

**Então** o participante deverá passar ao estado Convidado.

---

### RF-005

**Dado** que um participante informe uma restrição alimentar

**Quando** o Motor de Decisão gerar alternativas gastronômicas

**Então** essa restrição deverá ser considerada durante a análise.

---

### RF-008

**Dado** que existam objetivos incompatíveis entre participantes

**Quando** uma recomendação for produzida

**Então** o produto deverá registrar o conflito e informar que a recomendação representa um equilíbrio entre as preferências e restrições identificadas.

---

# 20.18 Indicadores

Esta Subcapacidade deverá acompanhar:

- participantes por jornada;
- jornadas colaborativas;
- conflitos identificados;
- conflitos resolvidos;
- alterações de papéis;
- preferências registradas;
- restrições registradas;
- recomendações impactadas por múltiplos participantes.

---

# 20.19 Dependências

Depende de:

- SCAP-01.01 — Ciclo de Vida da Jornada;
- SCAP-01.02 — Gestão de Objetivos;
- CAP-02 — Inteligência Contextual;
- CAP-04 — Motor de Decisão.

Também fornece informações para:

- Descoberta;
- Execução da Jornada;
- Gestão da Experiência;
- Personalização.

---

# 20.20 Evoluções Futuras

Versões futuras poderão incluir:

- ponderação automática de preferências entre participantes;
- perfis familiares reutilizáveis;
- grupos recorrentes;
- votação colaborativa de alternativas;
- mediação inteligente de conflitos;
- recomendações explicáveis para grupos.

Essas evoluções deverão preservar o princípio de que o produto apoia decisões coletivas sem substituir o consenso entre os participantes.

---

# 21. SCAP-01.04 — Gestão de Momentos da Jornada

---

## 21.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-01.04 |
| Capacidade | CAP-01 — Gestão da Jornada |
| Nome | Gestão de Momentos da Jornada |
| Criticidade | Crítica |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 21.2 Propósito

A Gestão de Momentos organiza a Jornada em unidades menores de contexto e decisão.

Enquanto a Jornada representa o objetivo global do usuário, os Momentos representam os recortes temporais e contextuais onde as decisões realmente acontecem.

Todas as recomendações produzidas pelo RouteBook estão associadas a um Momento.

Um Momento é, portanto, a unidade operacional fundamental do produto.

---

# 21.3 Definição Oficial

Um Momento é uma unidade temporal e contextual da Jornada.

Ele agrupa:

- contexto;
- participantes ativos;
- objetivos relevantes;
- situações;
- necessidades;
- alternativas;
- decisões;
- experiências.

Todo Momento existe para representar uma parte específica da Jornada em que decisões precisam ser tomadas.

---

# 21.4 Problema de Negócio

Durante uma Jornada, o contexto muda continuamente.

As necessidades do usuário às 8h da manhã dificilmente serão as mesmas às 20h.

Sem uma estrutura capaz de representar essas mudanças:

- recomendações tornam-se inconsistentes;
- decisões anteriores influenciam incorretamente decisões futuras;
- alterações de contexto não são registradas;
- o produto perde sua capacidade de adaptação.

A Gestão de Momentos resolve esse problema organizando a Jornada em blocos menores e semanticamente coerentes.

---

# 21.5 Objetivos

Esta Subcapacidade deve permitir que o RouteBook:

- represente mudanças naturais da jornada;
- mantenha contexto consistente;
- identifique situações relevantes;
- associe necessidades ao momento correto;
- registre decisões dentro do contexto adequado;
- preserve a sequência cronológica da jornada.

---

# 21.6 Valor para o Usuário

A divisão da Jornada em Momentos permite que o usuário receba recomendações alinhadas ao que está acontecendo naquele instante, sem perder o histórico da experiência como um todo.

Isso reduz recomendações genéricas e aumenta a percepção de continuidade.

---

# 21.7 Valor para o Produto

Para o RouteBook, os Momentos representam a menor unidade contextual utilizada pelo Motor de Decisão.

Essa estrutura permite:

- contextualização precisa;
- rastreabilidade das decisões;
- análise da evolução da jornada;
- aprendizado contextual.

---

# 21.8 Escopo

Esta Subcapacidade é responsável por:

- criar Momentos;
- atualizar Momentos;
- encerrar Momentos;
- registrar mudanças contextuais;
- associar Situações;
- registrar Necessidades;
- controlar a sequência cronológica.

---

# 21.9 Fora do Escopo

Não faz parte desta Subcapacidade:

- produzir recomendações;
- comparar alternativas;
- interpretar preferências;
- executar decisões.

Essas responsabilidades pertencem ao Motor de Decisão e à Inteligência Contextual.

---

# 21.10 Entidades Envolvidas

- Jornada
- Momento
- Contexto
- Situação
- Necessidade
- Objetivo
- Decisão
- Experiência

---

# 21.11 Estrutura Conceitual

```text
Jornada

↓

Momento

├── Contexto

├── Participantes

├── Objetivos Ativos

├── Situações

├── Necessidades

├── Alternativas

├── Decisões

└── Experiências
```

Cada Momento representa um "recorte vivo" da Jornada.

---

# 21.12 Estados do Momento

Todo Momento possui exatamente um estado.

```text
Planejado

↓

Preparação

↓

Ativo

↓

Concluído
```

Fluxos alternativos:

```text
Cancelado
```

ou

```text
Mesclado
```

O estado **Mesclado** representa a incorporação de um Momento a outro quando ambos passam a representar o mesmo contexto operacional.

---

# 21.13 Eventos de Negócio

Esta Subcapacidade produz e consome os seguintes eventos:

- Momento Criado;
- Momento Atualizado;
- Contexto Alterado;
- Situação Identificada;
- Necessidade Registrada;
- Objetivo Ativado;
- Decisão Registrada;
- Momento Concluído;
- Momento Cancelado;
- Momento Mesclado.

---

# 21.14 Funcionalidades

| Código | Funcionalidade |
|---------|----------------|
| FUNC-001 | Criar Momento |
| FUNC-002 | Atualizar Momento |
| FUNC-003 | Encerrar Momento |
| FUNC-004 | Registrar Situação |
| FUNC-005 | Registrar Necessidade |
| FUNC-006 | Alterar Contexto |
| FUNC-007 | Associar Objetivos |
| FUNC-008 | Associar Participantes |
| FUNC-009 | Registrar Decisões |

---

# 21.15 Regras de Negócio

### RN-001

Todo Momento pertence exatamente a uma Jornada.

---

### RN-002

Um Momento deve possuir um Contexto válido.

---

### RN-003

Situações somente podem existir dentro de um Momento.

---

### RN-004

Necessidades pertencem a Situações específicas.

---

### RN-005

Toda Decisão deve estar vinculada a um Momento.

---

### RN-006

Objetivos ativos podem ser compartilhados entre Momentos consecutivos.

---

### RN-007

Um Momento concluído não pode receber novas Situações.

---

### RN-008

Toda alteração relevante do Contexto deve ser registrada.

---

# 21.16 Requisitos Funcionais

### RF-001

O produto deve permitir criar novos Momentos.

---

### RF-002

O produto deve permitir registrar Situações.

---

### RF-003

O produto deve permitir registrar Necessidades.

---

### RF-004

O produto deve permitir atualizar o Contexto.

---

### RF-005

O produto deve permitir concluir um Momento.

---

### RF-006

O produto deve preservar a sequência cronológica dos Momentos.

---

### RF-007

O produto deve manter histórico completo das alterações realizadas.

---

### RF-008

O produto deve disponibilizar o Momento ativo para as demais capacidades.

---

# 21.17 Critérios de Aceite

### RF-002

**Dado** que o usuário esteja em um Momento ativo

**Quando** uma Situação relevante for identificada

**Então** o produto deverá registrá-la vinculada ao Momento correspondente.

---

### RF-003

**Dado** que uma Situação gere uma nova Necessidade

**Quando** essa necessidade for reconhecida

**Então** ela deverá ser associada exclusivamente à Situação que a originou.

---

### RF-008

**Dado** que exista um Momento ativo

**Quando** outra capacidade solicitar informações da Jornada

**Então** o produto deverá disponibilizar o Contexto, os Objetivos, as Situações e as Necessidades referentes ao Momento ativo.

---

# 21.18 Indicadores

A Subcapacidade deverá acompanhar:

- Momentos por Jornada;
- duração média dos Momentos;
- Situações registradas;
- Necessidades identificadas;
- mudanças de Contexto;
- Decisões por Momento;
- taxa de conclusão dos Momentos.

---

# 21.19 Dependências

Depende diretamente de:

- SCAP-01.01 — Ciclo de Vida da Jornada;
- SCAP-01.02 — Gestão de Objetivos;
- SCAP-01.03 — Gestão de Participantes;
- CAP-02 — Inteligência Contextual.

Fornece informações para:

- CAP-03 — Descoberta;
- CAP-04 — Motor de Decisão;
- CAP-05 — Execução da Jornada;
- CAP-06 — Gestão da Experiência.

---

# 21.20 Evoluções Futuras

Versões futuras poderão incluir:

- criação automática de Momentos;
- divisão inteligente de Momentos;
- fusão automática baseada em contexto;
- previsão do próximo Momento;
- encerramento automático baseado em eventos;
- análise preditiva da evolução da Jornada.

Todas essas evoluções deverão preservar o Momento como unidade operacional do produto.

---

# 22. SCAP-01.05 — Gestão de Estado da Jornada

---

## 22.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-01.05 |
| Capacidade | CAP-01 — Gestão da Jornada |
| Nome | Gestão de Estado da Jornada |
| Criticidade | Muito Alta |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 22.2 Propósito

A Gestão de Estado da Jornada é responsável por controlar a evolução operacional da Jornada, garantindo que suas transições ocorram de maneira consistente, previsível e alinhada às regras de negócio do RouteBook.

Enquanto o Ciclo de Vida define os estados possíveis da Jornada, esta Subcapacidade define como esses estados são administrados, validados e disponibilizados para todas as demais capacidades.

---

# 22.3 Problema de Negócio

Uma Jornada evolui continuamente.

Durante essa evolução surgem mudanças como:

- início das atividades;
- pausas temporárias;
- retomadas;
- conclusão dos objetivos;
- cancelamentos.

Sem uma gestão centralizada dos estados:

- diferentes módulos podem interpretar a Jornada de maneiras distintas;
- recomendações podem utilizar informações inconsistentes;
- eventos podem ocorrer fora da sequência esperada;
- torna-se impossível garantir integridade do domínio.

---

# 22.4 Objetivos

Esta Subcapacidade deve:

- controlar o estado corrente da Jornada;
- validar transições;
- impedir estados inválidos;
- registrar alterações;
- comunicar mudanças às demais capacidades;
- garantir consistência temporal.

---

# 22.5 Valor para o Usuário

O usuário percebe uma Jornada consistente durante toda sua evolução.

Mudanças importantes passam a refletir corretamente o momento atual da experiência.

---

# 22.6 Valor para o Produto

Esta Subcapacidade garante previsibilidade para todas as capacidades que dependem do estado da Jornada.

Ela reduz ambiguidades e aumenta a confiabilidade do Motor de Decisão.

---

# 22.7 Escopo

Inclui:

- controle do estado atual;
- validação de transições;
- histórico de mudanças;
- publicação de eventos;
- sincronização entre capacidades.

---

# 22.8 Fora do Escopo

Não inclui:

- criação de Jornadas;
- gestão de Objetivos;
- gestão de Momentos;
- geração de recomendações.

---

# 22.9 Estados Oficiais

A Jornada poderá assumir exclusivamente os seguintes estados:

- Planejada;
- Preparação;
- Em Andamento;
- Pausada;
- Concluída;
- Cancelada;
- Arquivada.

Nenhum outro estado poderá existir sem atualização formal deste documento.

---

# 22.10 Matriz de Transições

| Estado Atual | Próximos Estados Permitidos |
|---------------|----------------------------|
| Planejada | Preparação, Cancelada |
| Preparação | Em Andamento, Cancelada |
| Em Andamento | Pausada, Concluída, Cancelada |
| Pausada | Em Andamento, Cancelada |
| Concluída | Arquivada |
| Cancelada | Arquivada |
| Arquivada | — |

---

# 22.11 Eventos

Esta Subcapacidade publica:

- Estado Alterado;
- Jornada Iniciada;
- Jornada Pausada;
- Jornada Retomada;
- Jornada Encerrada;
- Jornada Cancelada;
- Jornada Arquivada.

---

# 22.12 Funcionalidades

| Código | Funcionalidade |
|---------|----------------|
| FUNC-001 | Consultar Estado |
| FUNC-002 | Alterar Estado |
| FUNC-003 | Validar Transição |
| FUNC-004 | Registrar Mudança |
| FUNC-005 | Publicar Evento |

---

# 22.13 Regras de Negócio

### RN-001

A Jornada deve possuir exatamente um estado ativo.

---

### RN-002

Mudanças de estado devem seguir a Matriz Oficial de Transições.

---

### RN-003

Toda alteração deverá registrar data, hora, origem e responsável.

---

### RN-004

Mudanças inválidas devem ser rejeitadas.

---

### RN-005

A alteração de estado deverá gerar um evento de negócio.

---

# 22.14 Requisitos Funcionais

RF-001 — O produto deve controlar o estado atual da Jornada.

RF-002 — O produto deve validar todas as transições.

RF-003 — O produto deve impedir transições inválidas.

RF-004 — O produto deve registrar histórico completo.

RF-005 — O produto deve publicar eventos de mudança.

---

# 22.15 Critérios de Aceite

**RF-003**

Dado que a Jornada esteja Concluída

Quando o usuário tentar retorná-la para Em Andamento

Então a operação deverá ser rejeitada.

---

# 22.16 Indicadores

- quantidade de transições;
- transições inválidas;
- tempo médio por estado;
- jornadas pausadas;
- jornadas canceladas.

---

# 22.17 Dependências

- SCAP-01.01
- SCAP-01.04
- CAP-02

---

# 22.18 Evoluções Futuras

- transições automáticas baseadas em contexto;
- estados personalizados;
- workflows configuráveis.

---

# 23. SCAP-01.06 — Histórico da Jornada

---

## 23.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-01.06 |
| Capacidade | CAP-01 |
| Nome | Histórico da Jornada |
| Criticidade | Alta |
| Prioridade | MVP |

---

# 23.2 Propósito

Registrar toda a evolução da Jornada preservando a memória operacional do produto.

O Histórico representa a fonte oficial para auditoria, aprendizado e compreensão da evolução da experiência do usuário.

---

# 23.3 Problema

Sem histórico:

- decisões não podem ser justificadas;
- aprendizados são perdidos;
- recomendações futuras tornam-se inconsistentes.

---

# 23.4 Objetivos

- registrar eventos;
- preservar alterações;
- manter rastreabilidade;
- permitir auditoria;
- alimentar aprendizado.

---

# 23.5 Escopo

Inclui:

- alterações da Jornada;
- mudanças de Objetivos;
- alterações de Participantes;
- evolução dos Momentos;
- mudanças de Contexto;
- Decisões;
- Recomendações;
- Experiências.

---

# 23.6 Fora do Escopo

Não inclui:

- logs técnicos;
- métricas de infraestrutura;
- telemetria.

---

# 23.7 Modelo

Cada registro histórico deverá conter:

- identificador;
- data;
- horário;
- origem;
- entidade;
- tipo do evento;
- descrição;
- responsável;
- contexto relacionado.

---

# 23.8 Eventos Registrados

- Jornada Criada;
- Objetivo Atualizado;
- Participante Adicionado;
- Contexto Alterado;
- Situação Identificada;
- Necessidade Criada;
- Recomendação Emitida;
- Decisão Registrada;
- Experiência Avaliada.

---

# 23.9 Funcionalidades

FUNC-001 Registrar Evento

FUNC-002 Consultar Histórico

FUNC-003 Filtrar Histórico

FUNC-004 Restaurar Informações

FUNC-005 Exportar Histórico

---

# 23.10 Regras de Negócio

RN-001 Todo evento relevante deverá ser registrado.

RN-002 O histórico é imutável.

RN-003 Eventos não podem ser removidos.

RN-004 Eventos devem permanecer ordenados cronologicamente.

RN-005 Todo registro deve estar vinculado a uma Jornada.

---

# 23.11 Requisitos Funcionais

RF-001 Registrar alterações relevantes.

RF-002 Permitir consulta.

RF-003 Permitir filtros.

RF-004 Garantir integridade.

RF-005 Preservar histórico durante toda a vida da Jornada.

---

# 23.12 Indicadores

- eventos registrados;
- eventos por Jornada;
- consultas ao histórico;
- consistência dos registros.

---

# 23.13 Evoluções Futuras

- linha do tempo inteligente;
- replay da Jornada;
- visualização temporal;
- aprendizado automatizado.

---

# 24. CAP-02 — Inteligência Contextual

---

## 24.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | CAP-02 |
| Nome | Inteligência Contextual |
| Categoria | Capacidade Central |
| Criticidade | Crítica |
| Prioridade | MVP |

---

# 24.2 Missão

Compreender continuamente o contexto da Jornada e transformá-lo em conhecimento útil para apoiar decisões.

A Inteligência Contextual é responsável por manter uma representação dinâmica da realidade vivida pelo usuário durante toda a Jornada.

Ela não toma decisões.

Ela fornece o contexto necessário para que decisões possam ser tomadas com qualidade.

---

# 24.3 Problema de Negócio

O contexto muda continuamente.

Mudanças de clima, horário, localização, orçamento, participantes, disponibilidade, eventos externos e preferências alteram significativamente a qualidade de uma recomendação.

Sem compreensão contextual:

- decisões tornam-se genéricas;
- recomendações tornam-se rapidamente obsoletas;
- o produto perde relevância.

---

# 24.4 Objetivo Estratégico

Construir continuamente um modelo contextual atualizado da Jornada, permitindo que todas as capacidades utilizem informações consistentes e relevantes para apoiar decisões.

---

# 24.5 Objetivos da Capacidade

- compreender contexto;
- detectar mudanças;
- consolidar informações;
- identificar restrições;
- identificar oportunidades;
- comunicar alterações;
- disponibilizar contexto para o Motor de Decisão.

---

# 24.6 Valor para o Usuário

O usuário recebe recomendações compatíveis com sua situação atual, reduzindo esforço e aumentando a confiança nas sugestões apresentadas.

---

# 24.7 Valor para o Produto

A Inteligência Contextual transforma dados dispersos em contexto utilizável.

Ela reduz incertezas e melhora a qualidade analítica de todas as demais capacidades.

---

# 24.8 Escopo

Esta capacidade é responsável por:

- interpretar Contexto;
- detectar Situações;
- registrar mudanças;
- consolidar informações;
- identificar restrições;
- identificar oportunidades.

---

# 24.9 Fora do Escopo

Não pertence a esta capacidade:

- comparar alternativas;
- produzir recomendações;
- executar ações;
- concluir decisões.

---

# 24.10 Subcapacidades

```text
CAP-02

├── SCAP-02.01
│   Gestão de Contexto
│
├── SCAP-02.02
│   Gestão de Situações
│
├── SCAP-02.03
│   Gestão de Necessidades
│
├── SCAP-02.04
│   Gestão de Restrições
│
├── SCAP-02.05
│   Gestão de Oportunidades
│
└── SCAP-02.06
    Consolidação Contextual
```

---

# 24.11 Entidades

- Contexto;
- Situação;
- Necessidade;
- Restrição;
- Oportunidade;
- Momento;
- Jornada.

---

# 24.12 Indicadores

- mudanças contextuais;
- situações identificadas;
- necessidades registradas;
- tempo de atualização;
- contexto disponível para recomendações.

---

# 24.13 Dependências

Recebe informações de:

- CAP-01;
- CAP-08.

Fornece informações para:

- CAP-03;
- CAP-04;
- CAP-05;
- CAP-06;
- CAP-07.

---

# 24.14 Critérios de Qualidade

Esta capacidade será considerada completa quando conseguir representar corretamente o contexto operacional da Jornada e disponibilizá-lo de forma consistente para todas as demais capacidades do RouteBook.

---

# 25. SCAP-02.01 — Gestão de Contexto

---

## 25.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-02.01 |
| Capacidade | CAP-02 — Inteligência Contextual |
| Nome | Gestão de Contexto |
| Criticidade | Crítica |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 25.2 Propósito

A Gestão de Contexto é responsável por construir, manter e disponibilizar uma representação atualizada do ambiente em que a Jornada ocorre.

O Contexto representa a melhor compreensão disponível da realidade do usuário em determinado Momento.

Todas as capacidades que apoiam decisões dependem da qualidade dessa representação.

---

# 25.3 Definição Oficial

Contexto é o conjunto de informações relevantes que descrevem o estado atual da Jornada em um determinado Momento.

O Contexto não representa apenas localização ou horário.

Ele reúne todas as informações que podem influenciar uma decisão.

---

# 25.4 Problema de Negócio

Uma mesma decisão pode produzir resultados completamente diferentes quando tomada em contextos distintos.

Exemplo:

Um restaurante recomendado para um casal pode não ser adequado para uma família com crianças.

Uma atividade ao ar livre pode ser ideal pela manhã e inadequada durante uma tempestade.

Sem um Contexto consistente, o RouteBook perde sua capacidade de recomendar alternativas relevantes.

---

# 25.5 Objetivos

Esta Subcapacidade deve:

- representar o Contexto atual da Jornada;
- manter o Contexto continuamente atualizado;
- consolidar informações provenientes de diferentes fontes;
- identificar alterações relevantes;
- disponibilizar uma visão única do Contexto para todo o produto.

---

# 25.6 Valor para o Usuário

O usuário recebe recomendações coerentes com sua realidade atual, sem precisar repetir continuamente informações já conhecidas pelo produto.

---

# 25.7 Valor para o Produto

O Contexto torna-se a principal fonte de conhecimento operacional utilizada pelas demais capacidades.

Sua qualidade impacta diretamente a qualidade das recomendações.

---

# 25.8 Escopo

Inclui:

- consolidação contextual;
- atualização contínua;
- enriquecimento do Contexto;
- normalização de informações;
- publicação de alterações.

---

# 25.9 Fora do Escopo

Não inclui:

- geração de recomendações;
- comparação de alternativas;
- tomada de decisão;
- personalização.

---

# 25.10 Estrutura do Contexto

O Contexto poderá ser composto por diferentes dimensões.

## Contexto Temporal

Exemplos:

- data;
- horário;
- duração restante da Jornada;
- período do dia;
- dia da semana;
- feriados.

---

## Contexto Geográfico

Exemplos:

- localização;
- destino;
- região;
- deslocamento;
- distância.

---

## Contexto Ambiental

Exemplos:

- clima;
- temperatura;
- chuva;
- vento;
- luminosidade.

---

## Contexto Operacional

Exemplos:

- disponibilidade de tempo;
- orçamento;
- reservas existentes;
- compromissos;
- horários.

---

## Contexto Social

Exemplos:

- participantes;
- composição do grupo;
- perfil do grupo;
- necessidades especiais.

---

## Contexto da Jornada

Exemplos:

- Momento atual;
- Objetivos ativos;
- Situações abertas;
- Necessidades pendentes;
- Decisões recentes.

---

# 25.11 Eventos

A Gestão de Contexto deverá responder aos seguintes eventos:

- Contexto Criado;
- Contexto Atualizado;
- Contexto Consolidado;
- Fonte Atualizada;
- Contexto Invalidado.

---

# 25.12 Funcionalidades

| Código | Funcionalidade |
|---------|----------------|
| FUNC-001 | Criar Contexto |
| FUNC-002 | Atualizar Contexto |
| FUNC-003 | Consolidar Contexto |
| FUNC-004 | Consultar Contexto |
| FUNC-005 | Invalidar Contexto |

---

# 25.13 Regras de Negócio

### RN-001

Toda Jornada deve possuir um Contexto ativo.

---

### RN-002

Todo Momento deve estar associado a exatamente um Contexto.

---

### RN-003

Mudanças relevantes devem atualizar o Contexto.

---

### RN-004

O Contexto representa sempre a informação mais recente considerada válida.

---

### RN-005

Informações conflitantes deverão ser tratadas antes da disponibilização do Contexto.

---

### RN-006

Toda alteração relevante deverá gerar um evento de Contexto Atualizado.

---

# 25.14 Requisitos Funcionais

RF-001 O produto deve manter um Contexto atualizado para cada Jornada.

RF-002 O produto deve permitir atualização contínua do Contexto.

RF-003 O produto deve consolidar informações provenientes de múltiplas fontes.

RF-004 O produto deve disponibilizar o Contexto para todas as capacidades autorizadas.

RF-005 O produto deve registrar alterações relevantes do Contexto.

---

# 25.15 Critérios de Aceite

**RF-003**

**Dado** que existam informações provenientes de múltiplas fontes

**Quando** o Contexto for consolidado

**Então** deverá existir apenas uma representação contextual válida para utilização pelas demais capacidades.

---

# 25.16 Indicadores

- atualizações de Contexto;
- tempo médio de atualização;
- inconsistências detectadas;
- consultas realizadas;
- Contextos ativos.

---

# 25.17 Dependências

Recebe informações de:

- CAP-01;
- CAP-08.

Fornece informações para:

- todas as demais capacidades.

---

# 25.18 Evoluções Futuras

- inferência automática de Contexto;
- detecção preditiva de mudanças;
- classificação automática de Contextos;
- enriquecimento por IA.

---

# 26. SCAP-02.02 — Gestão de Situações

---

## 26.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-02.02 |
| Capacidade | CAP-02 |
| Nome | Gestão de Situações |
| Criticidade | Crítica |
| Prioridade | MVP |

---

# 26.2 Propósito

Identificar, registrar e acompanhar Situações relevantes ocorridas durante um Momento da Jornada.

Uma Situação representa um evento, condição ou alteração que possui potencial para influenciar decisões.

---

# 26.3 Definição Oficial

Situação é uma condição relevante identificada dentro de um Momento da Jornada que exige avaliação, acompanhamento ou ação.

Ela surge a partir do Contexto e pode originar uma ou mais Necessidades.

---

# 26.4 Problema

Mudanças importantes acontecem continuamente.

Exemplos:

- começou a chover;
- restaurante fechou;
- voo atrasou;
- orçamento foi reduzido;
- participante desistiu.

Sem representar Situações explicitamente, o produto não consegue reagir adequadamente às mudanças.

---

# 26.5 Objetivos

- identificar Situações;
- registrar sua ocorrência;
- acompanhar evolução;
- encerrá-las quando resolvidas;
- comunicar impactos.

---

# 26.6 Escopo

Inclui:

- abertura;
- atualização;
- encerramento;
- classificação;
- priorização.

---

# 26.7 Categorias

Exemplos:

- climática;
- operacional;
- financeira;
- logística;
- social;
- mobilidade;
- segurança;
- disponibilidade.

---

# 26.8 Estados

```text
Identificada

↓

Em Avaliação

↓

Ativa

↓

Resolvida
```

Fluxo alternativo:

```text
Descartada
```

---

# 26.9 Funcionalidades

FUNC-001 Registrar Situação

FUNC-002 Atualizar Situação

FUNC-003 Priorizar Situação

FUNC-004 Resolver Situação

FUNC-005 Descartar Situação

---

# 26.10 Regras

RN-001 Toda Situação pertence a exatamente um Momento.

RN-002 Uma Situação pode originar múltiplas Necessidades.

RN-003 Situações Resolvidas permanecem disponíveis no histórico.

RN-004 Situações Descartadas não devem influenciar novas recomendações.

---

# 26.11 Requisitos

RF-001 Registrar Situações.

RF-002 Atualizar Situações.

RF-003 Permitir encerramento.

RF-004 Disponibilizar Situações ativas ao Motor de Decisão.

---

# 26.12 Indicadores

- Situações abertas;
- Situações resolvidas;
- tempo médio de resolução;
- Situações por categoria.

---

# 27. SCAP-02.03 — Gestão de Necessidades

---

## 27.1 Propósito

Transformar Situações identificadas em Necessidades explícitas que possam orientar o processo de decisão do RouteBook.

---

## 27.2 Definição

Necessidade representa aquilo que precisa ser resolvido para que a Jornada continue evoluindo em direção aos seus Objetivos.

---

## 27.3 Exemplos

Situação:

"Começou a chover."

↓

Necessidade:

"Encontrar atividade em ambiente coberto."

---

Situação:

"O voo atrasou."

↓

Necessidade:

"Reorganizar os horários da Jornada."

---

# 27.4 Objetivos

- identificar Necessidades;
- classificá-las;
- priorizá-las;
- encerrá-las após resolução.

---

# 27.5 Categorias

- imediata;
- planejada;
- emergencial;
- recorrente.

---

# 27.6 Estados

```text
Identificada

↓

Priorizada

↓

Em Atendimento

↓

Resolvida
```

Alternativo:

```text
Cancelada
```

---

# 27.7 Funcionalidades

FUNC-001 Criar Necessidade

FUNC-002 Atualizar Necessidade

FUNC-003 Priorizar Necessidade

FUNC-004 Resolver Necessidade

FUNC-005 Cancelar Necessidade

---

# 27.8 Regras

RN-001 Toda Necessidade deve estar vinculada a uma Situação.

RN-002 Necessidades Resolvidas permanecem registradas.

RN-003 Necessidades podem alterar prioridades da Jornada.

RN-004 Necessidades Emergenciais possuem prioridade superior.

---

# 27.9 Requisitos

RF-001 Registrar Necessidades.

RF-002 Atualizar Necessidades.

RF-003 Priorizar automaticamente quando aplicável.

RF-004 Disponibilizar Necessidades ao Motor de Decisão.

---

# 27.10 Indicadores

- Necessidades identificadas;
- Necessidades resolvidas;
- tempo médio de atendimento;
- Necessidades por categoria.

---

# 28. SCAP-02.04 — Gestão de Restrições

---

## 28.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-02.04 |
| Capacidade | CAP-02 — Inteligência Contextual |
| Nome | Gestão de Restrições |
| Criticidade | Crítica |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 28.2 Propósito

Identificar, consolidar e disponibilizar todas as restrições que limitam ou condicionam as alternativas disponíveis durante a Jornada.

As restrições representam limites reais que devem ser respeitados pelo produto.

Diferentemente das preferências, uma restrição reduz ou elimina alternativas possíveis.

---

# 28.3 Definição Oficial

Restrição é qualquer condição que limite, impeça ou condicione uma decisão.

Toda restrição deve ser considerada obrigatoriamente pelo Motor de Decisão.

---

# 28.4 Problema de Negócio

Uma recomendação excelente sob um aspecto pode ser completamente inadequada quando desconsidera restrições existentes.

Exemplos:

- orçamento insuficiente;
- restaurante inacessível;
- estabelecimento fechado;
- restrições alimentares;
- limitação de mobilidade;
- tempo insuficiente.

Sem compreender restrições, o produto gera recomendações inviáveis.

---

# 28.5 Objetivos

Esta Subcapacidade deve:

- identificar restrições;
- consolidar restrições provenientes de diferentes fontes;
- classificar restrições;
- acompanhar alterações;
- disponibilizar restrições para o Motor de Decisão.

---

# 28.6 Escopo

Inclui:

- registro;
- atualização;
- classificação;
- ativação;
- desativação;
- encerramento.

---

# 28.7 Categorias

As restrições poderão ser classificadas em:

### Financeiras

- orçamento;
- limite de gastos.

---

### Temporais

- horários;
- duração;
- compromissos.

---

### Geográficas

- distância;
- localização;
- deslocamento.

---

### Físicas

- acessibilidade;
- mobilidade.

---

### Operacionais

- reservas;
- disponibilidade;
- funcionamento.

---

### Legais

- idade;
- documentação;
- autorizações.

---

### Saúde

- restrições alimentares;
- condições médicas informadas pelo usuário.

---

# 28.8 Estados

```text
Identificada

↓

Ativa

↓

Resolvida
```

Fluxos alternativos:

```text
Expirada

Cancelada
```

---

# 28.9 Funcionalidades

| Código | Funcionalidade |
|---------|----------------|
| FUNC-001 | Registrar Restrição |
| FUNC-002 | Atualizar Restrição |
| FUNC-003 | Classificar Restrição |
| FUNC-004 | Encerrar Restrição |
| FUNC-005 | Consultar Restrições |

---

# 28.10 Regras de Negócio

RN-001 Toda restrição deve possuir uma categoria.

RN-002 Restrições ativas devem ser consideradas pelo Motor de Decisão.

RN-003 Restrições expiradas deixam de influenciar novas análises.

RN-004 Toda alteração deverá permanecer registrada.

RN-005 Restrições não podem ser removidas do histórico.

---

# 28.11 Requisitos Funcionais

RF-001 Registrar restrições.

RF-002 Atualizar restrições.

RF-003 Disponibilizar restrições ativas.

RF-004 Preservar histórico.

RF-005 Classificar restrições.

---

# 28.12 Critérios de Aceite

**RF-003**

**Dado** que exista uma restrição ativa

**Quando** o Motor de Decisão gerar recomendações

**Então** alternativas incompatíveis deverão ser descartadas ou claramente identificadas como incompatíveis.

---

# 28.13 Indicadores

- restrições ativas;
- restrições resolvidas;
- restrições por categoria;
- impacto das restrições nas recomendações.

---

# 28.14 Dependências

Recebe informações de:

- CAP-01;
- SCAP-02.01;
- SCAP-02.02.

Fornece informações para:

- CAP-03;
- CAP-04.

---

# 28.15 Evoluções Futuras

- inferência automática de restrições;
- validade temporal automática;
- conflitos entre restrições;
- restrições compartilhadas entre participantes.

---

# 29. SCAP-02.05 — Gestão de Oportunidades

---

## 29.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-02.05 |
| Capacidade | CAP-02 |
| Nome | Gestão de Oportunidades |
| Criticidade | Alta |
| Prioridade | v1.0 |

---

# 29.2 Propósito

Identificar condições favoráveis que possam melhorar a Jornada ou ampliar as alternativas disponíveis ao usuário.

Enquanto as restrições reduzem possibilidades, as oportunidades ampliam o espaço de decisão.

---

# 29.3 Definição Oficial

Oportunidade representa qualquer condição contextual capaz de aumentar o valor esperado de uma decisão.

---

# 29.4 Exemplos

- promoção temporária;
- baixa fila;
- clima favorável;
- evento próximo;
- alteração positiva de trânsito;
- disponibilidade inesperada.

---

# 29.5 Objetivos

- identificar oportunidades;
- classificá-las;
- medir relevância;
- comunicar oportunidades ao Motor de Decisão.

---

# 29.6 Escopo

Inclui:

- registro;
- atualização;
- priorização;
- encerramento.

---

# 29.7 Estados

```text
Identificada

↓

Disponível

↓

Aproveitada
```

Fluxos alternativos:

```text
Expirada
```

---

# 29.8 Funcionalidades

FUNC-001 Registrar Oportunidade

FUNC-002 Atualizar Oportunidade

FUNC-003 Priorizar Oportunidade

FUNC-004 Encerrar Oportunidade

---

# 29.9 Regras

RN-001 Toda oportunidade possui período de validade.

RN-002 Oportunidades expiradas não influenciam novas análises.

RN-003 Uma oportunidade pode atender múltiplas necessidades.

RN-004 O histórico deve ser preservado.

---

# 29.10 Requisitos

RF-001 Registrar oportunidades.

RF-002 Atualizar oportunidades.

RF-003 Disponibilizar oportunidades válidas.

RF-004 Encerrar automaticamente quando expiradas.

---

# 29.11 Indicadores

- oportunidades identificadas;
- oportunidades aproveitadas;
- oportunidades expiradas;
- impacto nas decisões.

---

# 30. SCAP-02.06 — Consolidação Contextual

---

## 30.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-02.06 |
| Capacidade | CAP-02 |
| Nome | Consolidação Contextual |
| Criticidade | Crítica |
| Prioridade | MVP |

---

# 30.2 Propósito

Construir uma visão única, consistente e confiável do Contexto da Jornada a partir das informações produzidas pelas demais Subcapacidades da Inteligência Contextual.

A Consolidação Contextual representa a última etapa antes da disponibilização do Contexto para o Motor de Decisão.

---

# 30.3 Problema de Negócio

As informações contextuais são produzidas continuamente por diferentes fontes e Subcapacidades.

Sem um processo de consolidação:

- informações podem entrar em conflito;
- dados incompletos podem ser utilizados;
- diferentes módulos podem trabalhar com versões distintas do Contexto.

---

# 30.4 Objetivos

- consolidar informações;
- resolver inconsistências;
- gerar uma representação única do Contexto;
- disponibilizar o Contexto consolidado para todo o produto.

---

# 30.5 Entradas

Recebe informações provenientes de:

- Gestão de Contexto;
- Gestão de Situações;
- Gestão de Necessidades;
- Gestão de Restrições;
- Gestão de Oportunidades;
- Ecossistema.

---

# 30.6 Saídas

Produz:

- Contexto Consolidado;
- Eventos de Atualização Contextual;
- Indicadores de Qualidade do Contexto.

---

# 30.7 Funcionalidades

| Código | Funcionalidade |
|---------|----------------|
| FUNC-001 | Consolidar Contexto |
| FUNC-002 | Resolver Conflitos |
| FUNC-003 | Publicar Contexto |
| FUNC-004 | Validar Consistência |
| FUNC-005 | Gerar Indicadores |

---

# 30.8 Regras de Negócio

RN-001 Deve existir apenas um Contexto Consolidado ativo por Momento.

RN-002 Informações inconsistentes devem ser tratadas antes da publicação.

RN-003 Toda publicação gera uma nova versão lógica do Contexto.

RN-004 O histórico das versões deve ser preservado.

RN-005 O Contexto Consolidado representa a única fonte autorizada para consumo pelas demais capacidades.

---

# 30.9 Requisitos Funcionais

RF-001 Consolidar informações contextuais.

RF-002 Detectar inconsistências.

RF-003 Resolver conflitos.

RF-004 Publicar nova versão do Contexto.

RF-005 Disponibilizar Contexto Consolidado ao Motor de Decisão.

---

# 30.10 Critérios de Aceite

**RF-005**

**Dado** que o processo de consolidação tenha sido concluído

**Quando** uma capacidade solicitar o Contexto da Jornada

**Então** deverá ser fornecida exclusivamente a versão consolidada mais recente.

---

# 30.11 Indicadores

- tempo de consolidação;
- inconsistências detectadas;
- conflitos resolvidos;
- versões publicadas;
- qualidade do Contexto.

---

# 30.12 Dependências

Depende de:

- SCAP-02.01;
- SCAP-02.02;
- SCAP-02.03;
- SCAP-02.04;
- SCAP-02.05;
- CAP-08.

Fornece informações para:

- CAP-03 — Descoberta;
- CAP-04 — Motor de Decisão;
- CAP-05 — Execução da Jornada;
- CAP-06 — Gestão da Experiência;
- CAP-07 — Personalização.

---

# 30.13 Evoluções Futuras

- consolidação preditiva;
- pontuação de qualidade contextual;
- confiança por fonte de informação;
- resolução automática de conflitos por IA.

---

# 31. CAP-03 — Descoberta

---

## 31.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | CAP-03 |
| Nome | Descoberta |
| Categoria | Capacidade Central |
| Criticidade | Crítica |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 31.2 Missão

Descobrir, organizar e disponibilizar alternativas compatíveis com os Objetivos, Necessidades e Restrições da Jornada.

A Descoberta amplia o conjunto de possibilidades disponíveis para o usuário antes que qualquer recomendação seja produzida.

Ela não decide.

Ela identifica alternativas potencialmente relevantes.

---

# 31.3 Problema de Negócio

Usuários normalmente precisam consultar diversas plataformas para encontrar opções relevantes.

Esse processo:

- consome tempo;
- aumenta esforço cognitivo;
- dificulta comparações;
- reduz a qualidade das decisões.

O RouteBook centraliza a descoberta para reduzir esse esforço e ampliar a qualidade das alternativas analisadas.

---

# 31.4 Objetivo Estratégico

Disponibilizar um conjunto qualificado de alternativas compatíveis com o Contexto Consolidado da Jornada, servindo como base para o Motor de Decisão.

---

# 31.5 Objetivos da Capacidade

- localizar alternativas;
- eliminar opções incompatíveis;
- enriquecer informações;
- organizar resultados;
- ampliar o espaço de decisão.

---

# 31.6 Subcapacidades

```text
CAP-03

├── SCAP-03.01
│   Descoberta de Alternativas
│
├── SCAP-03.02
│   Qualificação de Alternativas
│
├── SCAP-03.03
│   Enriquecimento de Alternativas
│
├── SCAP-03.04
│   Organização de Alternativas
│
├── SCAP-03.05
│   Gestão de Fontes
│
└── SCAP-03.06
    Consolidação das Alternativas
```

---

# 31.7 Dependências

Recebe informações de:

- CAP-01;
- CAP-02;
- CAP-08.

Fornece informações para:

- CAP-04 — Motor de Decisão.

---

# 32. SCAP-03.01 — Descoberta de Alternativas

---

## 32.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-03.01 |
| Capacidade | CAP-03 — Descoberta |
| Nome | Descoberta de Alternativas |
| Criticidade | Crítica |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 32.2 Propósito

Identificar alternativas potencialmente relevantes para atender às Necessidades da Jornada.

A Descoberta representa o primeiro estágio do processo de exploração.

Seu objetivo é ampliar o conjunto de possibilidades antes que qualquer comparação seja realizada.

---

# 32.3 Definição Oficial

Alternativa representa qualquer opção potencialmente capaz de atender uma ou mais Necessidades da Jornada.

Uma Alternativa não representa uma recomendação.

Ela representa apenas uma possibilidade válida para análise.

---

# 32.4 Problema

Usuários normalmente precisam pesquisar em diversas plataformas para descobrir possibilidades.

Esse comportamento:

- aumenta esforço cognitivo;
- reduz qualidade das decisões;
- dificulta comparações;
- faz alternativas relevantes serem ignoradas.

---

# 32.5 Objetivos

Esta Subcapacidade deve:

- localizar alternativas;
- ampliar possibilidades;
- reduzir esforço de pesquisa;
- consolidar resultados;
- preparar informações para qualificação.

---

# 32.6 Escopo

Inclui:

- pesquisa;
- descoberta;
- consolidação inicial;
- eliminação de duplicidades.

---

# 32.7 Fora do Escopo

Não inclui:

- priorização;
- recomendação;
- ranqueamento;
- comparação.

---

# 32.8 Funcionalidades

| Código | Funcionalidade |
|---------|----------------|
| FUNC-001 | Pesquisar Alternativas |
| FUNC-002 | Consolidar Resultados |
| FUNC-003 | Eliminar Duplicidades |
| FUNC-004 | Registrar Alternativas |
| FUNC-005 | Disponibilizar Alternativas |

---

# 32.9 Regras de Negócio

RN-001 Toda alternativa deve possuir origem identificável.

RN-002 Alternativas duplicadas devem ser consolidadas.

RN-003 Toda alternativa deve permanecer vinculada à Necessidade que motivou sua descoberta.

RN-004 Alternativas incompatíveis com restrições críticas não devem prosseguir para qualificação.

---

# 32.10 Requisitos Funcionais

RF-001 Pesquisar alternativas.

RF-002 Consolidar resultados.

RF-003 Eliminar duplicidades.

RF-004 Registrar origem.

RF-005 Disponibilizar conjunto consolidado.

---

# 32.11 Critérios de Aceite

**RF-003**

**Dado** que duas fontes retornem a mesma alternativa

**Quando** os resultados forem consolidados

**Então** deverá existir apenas um registro representando essa alternativa, preservando todas as fontes de origem.

---

# 32.12 Indicadores

- alternativas encontradas;
- alternativas únicas;
- duplicidades removidas;
- fontes consultadas.

---

# 32.13 Dependências

Recebe:

- Necessidades;
- Restrições;
- Contexto Consolidado;
- Ecossistema.

---

# 32.14 Evoluções Futuras

- descoberta proativa;
- exploração baseada em IA;
- descoberta colaborativa.

---

# 33. SCAP-03.02 — Qualificação de Alternativas

---

## 33.1 Propósito

Avaliar se as alternativas descobertas possuem condições mínimas para participar do processo de comparação.

A Qualificação não determina qual alternativa é melhor.

Ela determina quais alternativas permanecem elegíveis.

---

# 33.2 Objetivos

- validar elegibilidade;
- eliminar incompatibilidades;
- medir aderência mínima.

---

# 33.3 Critérios de Qualificação

Exemplos:

- disponibilidade;
- compatibilidade com restrições;
- localização;
- horário;
- orçamento;
- acessibilidade.

---

# 33.4 Funcionalidades

FUNC-001 Validar Alternativa

FUNC-002 Classificar Elegibilidade

FUNC-003 Rejeitar Alternativa

FUNC-004 Registrar Motivos

---

# 33.5 Regras

RN-001 Toda alternativa deve ser qualificada.

RN-002 Alternativas incompatíveis devem permanecer registradas para auditoria.

RN-003 O motivo da rejeição deve ser preservado.

---

# 33.6 Requisitos

RF-001 Validar elegibilidade.

RF-002 Registrar incompatibilidades.

RF-003 Disponibilizar alternativas elegíveis.

---

# 33.7 Indicadores

- alternativas qualificadas;
- alternativas rejeitadas;
- motivos de rejeição.

---

# 34. SCAP-03.03 — Enriquecimento de Alternativas

---

## 34.1 Propósito

Adicionar informações relevantes às alternativas qualificadas para ampliar a qualidade das análises futuras.

---

# 34.2 Objetivos

- complementar informações;
- consolidar atributos;
- reduzir incertezas.

---

# 34.3 Exemplos de Informações

- descrição;
- localização;
- horários;
- faixa de preço;
- duração;
- avaliações;
- acessibilidade;
- imagens;
- disponibilidade.

---

# 34.4 Funcionalidades

FUNC-001 Enriquecer Alternativa

FUNC-002 Atualizar Informações

FUNC-003 Consolidar Dados

FUNC-004 Validar Qualidade

---

# 34.5 Regras

RN-001 Informações devem possuir origem conhecida.

RN-002 Informações conflitantes devem ser identificadas.

RN-003 Dados incompletos não impedem a continuidade da alternativa.

---

# 34.6 Requisitos

RF-001 Complementar informações.

RF-002 Registrar origem.

RF-003 Disponibilizar alternativa enriquecida.

---

# 35. SCAP-03.04 — Organização de Alternativas

---

## 35.1 Propósito

Organizar alternativas qualificadas em estruturas que facilitem a comparação pelo Motor de Decisão.

---

# 35.2 Objetivos

- agrupar;
- categorizar;
- estruturar;
- ordenar logicamente.

---

# 35.3 Exemplos

Agrupamento por:

- categoria;
- distância;
- custo;
- duração;
- tipo de experiência.

---

# 35.4 Funcionalidades

FUNC-001 Agrupar

FUNC-002 Categorizar

FUNC-003 Ordenar

FUNC-004 Preparar Conjunto

---

# 35.5 Regras

RN-001 Organização não representa priorização.

RN-002 Uma alternativa pode pertencer a múltiplas categorias.

---

# 35.6 Requisitos

RF-001 Organizar alternativas.

RF-002 Preservar categorias.

RF-003 Disponibilizar conjunto organizado.

---

# 36. SCAP-03.05 — Gestão de Fontes

---

## 36.1 Propósito

Gerenciar todas as fontes responsáveis por fornecer alternativas ao RouteBook.

---

# 36.2 Objetivos

- registrar fontes;
- validar disponibilidade;
- acompanhar qualidade;
- consolidar resultados.

---

# 36.3 Tipos de Fontes

- parceiros;
- APIs;
- bases próprias;
- integrações;
- dados públicos.

---

# 36.4 Funcionalidades

FUNC-001 Registrar Fonte

FUNC-002 Atualizar Fonte

FUNC-003 Validar Disponibilidade

FUNC-004 Medir Qualidade

---

# 36.5 Regras

RN-001 Toda alternativa deve possuir fonte identificada.

RN-002 Fontes indisponíveis devem ser registradas.

RN-003 Qualidade da fonte deve ser monitorada.

---

# 36.6 Requisitos

RF-001 Registrar fontes.

RF-002 Validar disponibilidade.

RF-003 Disponibilizar indicadores.

---

# 37. SCAP-03.06 — Consolidação das Alternativas

---

## 37.1 Propósito

Construir um conjunto único e consistente de alternativas qualificadas para consumo pelo Motor de Decisão.

---

# 37.2 Objetivos

- consolidar alternativas;
- eliminar redundâncias;
- produzir conjunto final.

---

# 37.3 Entradas

Recebe:

- alternativas qualificadas;
- informações enriquecidas;
- organização;
- contexto consolidado.

---

# 37.4 Saídas

Produz:

- conjunto consolidado de alternativas;
- indicadores de qualidade;
- inconsistências detectadas.

---

# 37.5 Funcionalidades

FUNC-001 Consolidar Alternativas

FUNC-002 Validar Integridade

FUNC-003 Publicar Conjunto

FUNC-004 Registrar Consolidação

---

# 37.6 Regras

RN-001 Apenas alternativas qualificadas participam da consolidação.

RN-002 O conjunto consolidado representa a única entrada autorizada para o Motor de Decisão.

RN-003 O histórico das consolidações deve ser preservado.

---

# 37.7 Requisitos

RF-001 Consolidar alternativas.

RF-002 Validar integridade.

RF-003 Publicar conjunto consolidado.

RF-004 Preservar rastreabilidade.

---

# 37.8 Critérios de Aceite

**RF-003**

**Dado** que todas as alternativas tenham sido qualificadas e enriquecidas

**Quando** a consolidação for concluída

**Então** deverá existir um único conjunto consistente de alternativas disponível para o Motor de Decisão.

---

# 37.9 Indicadores

- alternativas consolidadas;
- tempo de consolidação;
- inconsistências detectadas;
- qualidade do conjunto.

---

# 37.10 Dependências

Depende de:

- todas as Subcapacidades da CAP-03;
- CAP-02.

Fornece informações para:

- CAP-04 — Motor de Decisão.

---

# 38. CAP-04 — Motor de Decisão

---

## 38.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | CAP-04 |
| Nome | Motor de Decisão |
| Categoria | Capacidade Central |
| Criticidade | Crítica |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 38.2 Missão

Transformar Contexto, Objetivos, Necessidades, Restrições e Alternativas em Recomendações transparentes, justificáveis e contextualizadas.

O Motor de Decisão representa o núcleo inteligente do RouteBook.

É a capacidade responsável por produzir apoio efetivo à tomada de decisão do usuário.

---

# 38.3 Problema de Negócio

Encontrar alternativas não significa saber qual escolher.

Usuários precisam comparar opções considerando múltiplos fatores simultaneamente.

Esse processo normalmente é complexo, demorado e sujeito a vieses.

O Motor de Decisão reduz essa complexidade fornecendo recomendações explicáveis.

---

# 38.4 Objetivo Estratégico

Produzir recomendações contextualizadas que aumentem a capacidade do usuário de tomar melhores decisões, preservando sua autonomia e garantindo transparência sobre os fatores considerados.

---

# 38.5 Objetivos da Capacidade

- analisar alternativas;
- comparar alternativas;
- identificar trade-offs;
- gerar recomendações;
- justificar recomendações;
- indicar nível de confiança;
- disponibilizar alternativas ao usuário.

---

# 38.6 Subcapacidades

```text
CAP-04

├── SCAP-04.01
│   Análise de Alternativas
│
├── SCAP-04.02
│   Comparação de Alternativas
│
├── SCAP-04.03
│   Geração de Recomendações
│
├── SCAP-04.04
│   Explicabilidade
│
├── SCAP-04.05
│   Avaliação de Confiança
│
└── SCAP-04.06
    Consolidação da Recomendação
```

---

# 38.7 Dependências

Recebe informações de:

- CAP-01;
- CAP-02;
- CAP-03.

Fornece informações para:

- CAP-05 — Execução da Jornada;
- CAP-06 — Gestão da Experiência;
- CAP-07 — Personalização.

---

# 39. SCAP-04.01 — Análise de Alternativas

---

## 39.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-04.01 |
| Capacidade | CAP-04 — Motor de Decisão |
| Nome | Análise de Alternativas |
| Criticidade | Crítica |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 39.2 Propósito

Avaliar individualmente cada Alternativa disponível considerando o Contexto Consolidado, os Objetivos, as Necessidades e as Restrições da Jornada.

Esta Subcapacidade não compara alternativas entre si.

Seu papel é compreender profundamente cada alternativa antes da comparação.

---

# 39.3 Objetivos

- avaliar aderência;
- identificar limitações;
- medir compatibilidade;
- produzir atributos analíticos;
- preparar alternativas para comparação.

---

# 39.4 Critérios de Análise

Cada alternativa poderá ser analisada considerando fatores como:

- aderência aos Objetivos;
- atendimento das Necessidades;
- compatibilidade com Restrições;
- compatibilidade com o Contexto;
- disponibilidade;
- esforço necessário;
- impacto esperado;
- riscos;
- custo;
- tempo.

Os critérios não possuem pesos fixos.

A importância relativa de cada critério depende do Contexto da Jornada.

---

# 39.5 Funcionalidades

| Código | Funcionalidade |
|---------|----------------|
| FUNC-001 | Avaliar Alternativa |
| FUNC-002 | Identificar Compatibilidade |
| FUNC-003 | Identificar Limitações |
| FUNC-004 | Registrar Resultado Analítico |
| FUNC-005 | Disponibilizar Avaliação |

---

# 39.6 Regras de Negócio

RN-001 Toda alternativa deve ser analisada individualmente.

RN-002 A análise deve utilizar exclusivamente o Contexto Consolidado vigente.

RN-003 Alterações relevantes no Contexto invalidam análises anteriores.

RN-004 Toda análise deve permanecer rastreável.

---

# 39.7 Requisitos Funcionais

RF-001 Avaliar alternativas.

RF-002 Registrar resultados.

RF-003 Disponibilizar análises para comparação.

RF-004 Invalidar análises quando necessário.

---

# 39.8 Indicadores

- alternativas analisadas;
- tempo médio de análise;
- análises invalidadas;
- cobertura dos critérios.

---

# 40. SCAP-04.02 — Comparação de Alternativas

---

## 40.1 Propósito

Comparar alternativas analisadas para identificar diferenças relevantes, vantagens, limitações e trade-offs.

A comparação prepara a geração da recomendação.

---

# 40.2 Objetivos

- comparar alternativas;
- identificar vantagens;
- identificar limitações;
- identificar conflitos;
- evidenciar trade-offs.

---

# 40.3 Princípios

A comparação deverá considerar:

- contexto;
- objetivos;
- necessidades;
- restrições;
- oportunidades.

Nenhum critério isolado deverá determinar o resultado da comparação.

---

# 40.4 Funcionalidades

FUNC-001 Comparar Alternativas

FUNC-002 Identificar Trade-offs

FUNC-003 Registrar Comparação

FUNC-004 Disponibilizar Resultado

---

# 40.5 Regras

RN-001 Apenas alternativas analisadas podem ser comparadas.

RN-002 Toda comparação deve permanecer rastreável.

RN-003 Comparações tornam-se inválidas quando análises forem invalidadas.

---

# 40.6 Requisitos

RF-001 Comparar alternativas.

RF-002 Registrar diferenças.

RF-003 Disponibilizar resultado comparativo.

---

# 40.7 Indicadores

- comparações realizadas;
- alternativas comparadas;
- trade-offs identificados.

---

# 41. SCAP-04.03 — Geração de Recomendações

---

## 41.1 Propósito

Produzir recomendações contextualizadas utilizando os resultados da comparação de alternativas.

A recomendação representa uma sugestão fundamentada.

Ela não substitui a decisão do usuário.

---

# 41.2 Definição Oficial

Recomendação é uma conclusão produzida pelo RouteBook que indica uma ou mais alternativas consideradas mais adequadas para um determinado Momento da Jornada.

---

# 41.3 Objetivos

- produzir recomendações;
- indicar alternativas prioritárias;
- apresentar opções complementares;
- justificar resultados.

---

# 41.4 Estrutura da Recomendação

Uma recomendação deverá conter:

- alternativa principal;
- justificativa;
- fatores considerados;
- limitações;
- nível de confiança;
- alternativas complementares.

---

# 41.5 Funcionalidades

FUNC-001 Gerar Recomendação

FUNC-002 Atualizar Recomendação

FUNC-003 Invalidar Recomendação

FUNC-004 Registrar Recomendação

---

# 41.6 Regras

RN-001 Toda recomendação deve possuir justificativa.

RN-002 Recomendações devem utilizar o Contexto Consolidado mais recente.

RN-003 Alterações relevantes do Contexto invalidam recomendações anteriores.

RN-004 Recomendações permanecem registradas para fins de aprendizado.

---

# 41.7 Requisitos

RF-001 Produzir recomendações.

RF-002 Registrar justificativas.

RF-003 Disponibilizar alternativas complementares.

RF-004 Invalidar recomendações quando necessário.

---

# 41.8 Critérios de Aceite

**RF-001**

**Dado** que exista um conjunto consolidado de alternativas elegíveis

**Quando** o processo de decisão for executado

**Então** o produto deverá produzir pelo menos uma recomendação acompanhada de justificativa e fatores considerados.

---

# 41.9 Indicadores

- recomendações emitidas;
- recomendações aceitas;
- recomendações rejeitadas;
- atualizações de recomendação.

---

# 42. SCAP-04.04 — Explicabilidade

---

## 42.1 Propósito

Garantir que toda recomendação produzida pelo RouteBook possa ser compreendida pelo usuário.

Explicabilidade representa um princípio fundamental do produto.

---

# 42.2 Objetivos

- explicar decisões;
- aumentar transparência;
- fortalecer confiança;
- reduzir percepção de caixa-preta.

---

# 42.3 Componentes da Explicação

Toda explicação deverá indicar, quando aplicável:

- objetivo considerado;
- necessidades atendidas;
- restrições relevantes;
- fatores positivos;
- fatores limitantes;
- alternativas descartadas.

---

# 42.4 Funcionalidades

FUNC-001 Gerar Explicação

FUNC-002 Atualizar Explicação

FUNC-003 Disponibilizar Explicação

---

# 42.5 Regras

RN-001 Toda recomendação deve possuir explicação.

RN-002 A explicação deve refletir exclusivamente fatores realmente considerados.

RN-003 Explicações não devem induzir interpretações incorretas.

---

# 42.6 Requisitos

RF-001 Gerar explicações.

RF-002 Disponibilizar fatores considerados.

RF-003 Manter consistência entre explicação e recomendação.

---

# 42.7 Indicadores

- recomendações explicadas;
- consultas às explicações;
- compreensão percebida pelos usuários.

---

# 43. SCAP-04.05 — Avaliação de Confiança

---

## 43.1 Propósito

Avaliar o nível de confiança associado a cada recomendação produzida.

O nível de confiança representa a qualidade esperada da recomendação considerando as informações disponíveis.

---

# 43.2 Objetivos

- medir confiança;
- comunicar incertezas;
- reduzir excesso de assertividade;
- indicar limitações.

---

# 43.3 Fatores Considerados

Exemplos:

- qualidade do Contexto;
- quantidade de alternativas;
- completude das informações;
- conflitos identificados;
- consistência dos dados.

---

# 43.4 Funcionalidades

FUNC-001 Avaliar Confiança

FUNC-002 Atualizar Confiança

FUNC-003 Disponibilizar Nível de Confiança

---

# 43.5 Regras

RN-001 Toda recomendação deve possuir um nível de confiança.

RN-002 Níveis de confiança devem ser recalculados quando informações relevantes mudarem.

RN-003 O produto não deve ocultar limitações conhecidas.

---

# 43.6 Requisitos

RF-001 Avaliar confiança.

RF-002 Atualizar confiança.

RF-003 Disponibilizar confiança ao usuário.

---

# 43.7 Indicadores

- confiança média;
- recomendações com baixa confiança;
- alterações de confiança.

---

# 44. SCAP-04.06 — Consolidação da Recomendação

---

## 44.1 Propósito

Construir a representação oficial da recomendação disponibilizada ao usuário e às demais capacidades.

Esta Subcapacidade consolida todos os resultados produzidos pelo Motor de Decisão.

---

# 44.2 Entradas

Recebe:

- análises;
- comparações;
- recomendações;
- explicações;
- níveis de confiança.

---

# 44.3 Saídas

Produz:

- Recomendação Consolidada;
- Eventos de Recomendação;
- Histórico da Recomendação.

---

# 44.4 Funcionalidades

FUNC-001 Consolidar Recomendação

FUNC-002 Validar Integridade

FUNC-003 Publicar Recomendação

FUNC-004 Registrar Histórico

---

# 44.5 Regras

RN-001 Deve existir apenas uma versão consolidada ativa por processo de decisão.

RN-002 Recomendações substituídas permanecem registradas.

RN-003 A publicação gera um evento de negócio.

RN-004 A recomendação consolidada representa a única versão autorizada para consumo pelas demais capacidades.

---

# 44.6 Requisitos

RF-001 Consolidar recomendação.

RF-002 Validar integridade.

RF-003 Publicar recomendação.

RF-004 Preservar histórico.

---

# 44.7 Critérios de Aceite

**RF-003**

**Dado** que todas as etapas do Motor de Decisão tenham sido concluídas

**Quando** a recomendação for consolidada

**Então** deverá existir uma única representação oficial da recomendação disponível para utilização pelo produto.

---

# 44.8 Indicadores

- recomendações consolidadas;
- tempo de consolidação;
- inconsistências detectadas;
- versões publicadas.

---

# 44.9 Dependências

Depende de:

- todas as Subcapacidades da CAP-04.

Fornece informações para:

- CAP-05 — Execução da Jornada;
- CAP-06 — Gestão da Experiência;
- CAP-07 — Personalização.

---

# 45. CAP-05 — Execução da Jornada

---

## 45.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | CAP-05 |
| Nome | Execução da Jornada |
| Categoria | Capacidade Central |
| Criticidade | Alta |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 45.2 Missão

Acompanhar o usuário após a tomada de decisão, garantindo que a Jornada continue sendo monitorada e apoiada até sua conclusão.

O RouteBook não encerra sua participação quando uma recomendação é apresentada.

Ele acompanha a execução das decisões e adapta seu comportamento conforme a evolução da Jornada.

---

# 45.3 Problema de Negócio

A realidade muda continuamente após uma decisão.

Mudanças de contexto podem tornar uma recomendação inadequada poucos minutos depois de sua emissão.

Sem acompanhamento contínuo:

- recomendações tornam-se obsoletas;
- oportunidades deixam de ser aproveitadas;
- problemas não são identificados;
- a Jornada perde continuidade.

---

# 45.4 Objetivo Estratégico

Garantir suporte contínuo durante toda a execução da Jornada, adaptando recomendações sempre que mudanças relevantes forem identificadas.

---

# 45.5 Objetivos da Capacidade

- acompanhar execução;
- monitorar mudanças;
- revisar recomendações;
- registrar progresso;
- preservar continuidade da Jornada.

---

# 45.6 Subcapacidades

```text
CAP-05

├── SCAP-05.01
│   Monitoramento da Jornada
│
├── SCAP-05.02
│   Acompanhamento da Execução
│
├── SCAP-05.03
│   Gestão de Mudanças
│
├── SCAP-05.04
│   Reavaliação da Jornada
│
├── SCAP-05.05
│   Continuidade Operacional
│
└── SCAP-05.06
    Consolidação da Execução
```

---

# 46. SCAP-05.01 — Monitoramento da Jornada

---

## 46.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-05.01 |
| Capacidade | CAP-05 — Execução da Jornada |
| Nome | Monitoramento da Jornada |
| Criticidade | Alta |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 46.2 Propósito

Acompanhar continuamente a evolução da Jornada para identificar alterações relevantes que possam impactar decisões, recomendações ou objetivos.

O Monitoramento garante que o RouteBook permaneça alinhado ao estado atual da Jornada durante toda sua execução.

---

# 46.3 Objetivos

- observar a evolução da Jornada;
- identificar mudanças relevantes;
- detectar desvios;
- manter as demais capacidades informadas.

---

# 46.4 Eventos Monitorados

Exemplos:

- alteração de localização;
- mudança climática;
- atraso;
- cancelamento;
- alteração de participantes;
- mudança de orçamento;
- atualização de Objetivos;
- conclusão de Momentos.

---

# 46.5 Funcionalidades

| Código | Funcionalidade |
|---------|----------------|
| FUNC-001 | Monitorar Jornada |
| FUNC-002 | Detectar Mudanças |
| FUNC-003 | Publicar Eventos |
| FUNC-004 | Atualizar Status |

---

# 46.6 Regras de Negócio

RN-001 Todo evento relevante deve ser monitorado.

RN-002 Mudanças significativas devem ser comunicadas às capacidades dependentes.

RN-003 O monitoramento deve respeitar a configuração da Jornada e as preferências do usuário.

---

# 46.7 Requisitos Funcionais

RF-001 Monitorar a Jornada continuamente.

RF-002 Detectar alterações relevantes.

RF-003 Publicar eventos para as capacidades interessadas.

---

# 46.8 Indicadores

- eventos monitorados;
- alterações relevantes detectadas;
- tempo médio de detecção;
- eventos ignorados por irrelevância.

---

# 47. SCAP-05.02 — Acompanhamento da Execução

---

## 47.1 Propósito

Registrar a evolução prática da Jornada após a tomada de decisão, acompanhando a execução das atividades planejadas.

---

# 47.2 Objetivos

- acompanhar progresso;
- registrar execução;
- identificar bloqueios;
- medir avanço.

---

# 47.3 Funcionalidades

FUNC-001 Registrar Execução

FUNC-002 Atualizar Progresso

FUNC-003 Registrar Conclusão

FUNC-004 Consultar Execução

---

# 47.4 Regras

RN-001 Toda execução pertence a um Momento.

RN-002 O progresso deve permanecer rastreável.

RN-003 Alterações relevantes devem atualizar a Jornada.

---

# 47.5 Requisitos

RF-001 Registrar execução.

RF-002 Atualizar progresso.

RF-003 Disponibilizar situação atual da execução.

---

# 47.6 Indicadores

- progresso médio;
- atividades concluídas;
- atrasos identificados;
- desvios da Jornada.

---

# 48. SCAP-05.03 — Gestão de Mudanças

---

## 48.1 Propósito

Gerenciar mudanças ocorridas durante a execução da Jornada, avaliando seus impactos e coordenando a adaptação do produto.

---

# 48.2 Objetivos

- registrar mudanças;
- avaliar impacto;
- comunicar alterações;
- iniciar reavaliações quando necessário.

---

# 48.3 Tipos de Mudança

- contexto;
- participantes;
- objetivos;
- restrições;
- disponibilidade;
- eventos externos.

---

# 48.4 Funcionalidades

FUNC-001 Registrar Mudança

FUNC-002 Classificar Mudança

FUNC-003 Avaliar Impacto

FUNC-004 Publicar Mudança

---

# 48.5 Regras

RN-001 Toda mudança relevante deve ser registrada.

RN-002 Mudanças críticas devem iniciar um novo processo de decisão.

RN-003 Mudanças resolvidas permanecem registradas.

---

# 48.6 Requisitos

RF-001 Registrar mudanças.

RF-002 Avaliar impacto.

RF-003 Acionar reavaliação quando aplicável.

---

# 48.7 Indicadores

- mudanças registradas;
- mudanças críticas;
- tempo médio de adaptação.

---

# 49. SCAP-05.04 — Reavaliação da Jornada

---

## 49.1 Propósito

Reavaliar a Jornada quando mudanças relevantes alterarem significativamente o Contexto ou invalidarem recomendações anteriores.

---

# 49.2 Objetivos

- identificar necessidade de reavaliação;
- solicitar novo processo de decisão;
- preservar continuidade da Jornada.

---

# 49.3 Gatilhos

Exemplos:

- mudança de clima;
- cancelamento;
- nova restrição;
- alteração de Objetivos;
- mudança significativa de localização.

---

# 49.4 Funcionalidades

FUNC-001 Iniciar Reavaliação

FUNC-002 Validar Necessidade

FUNC-003 Atualizar Jornada

FUNC-004 Encerrar Reavaliação

---

# 49.5 Regras

RN-001 Reavaliações devem utilizar o Contexto Consolidado mais recente.

RN-002 Recomendações inválidas devem ser substituídas.

RN-003 O histórico das reavaliações deve ser preservado.

---

# 49.6 Requisitos

RF-001 Permitir reavaliação.

RF-002 Registrar motivo.

RF-003 Atualizar recomendações.

---

# 49.7 Indicadores

- reavaliações realizadas;
- recomendações substituídas;
- tempo médio de reavaliação.

---

# 50. SCAP-05.05 — Continuidade Operacional

---

## 50.1 Propósito

Garantir que a Jornada permaneça consistente durante toda sua execução, independentemente das mudanças ocorridas.

---

# 50.2 Objetivos

- preservar continuidade;
- manter consistência;
- evitar perda de contexto.

---

# 50.3 Funcionalidades

FUNC-001 Validar Continuidade

FUNC-002 Sincronizar Jornada

FUNC-003 Atualizar Estado

---

# 50.4 Regras

RN-001 Mudanças não devem interromper a continuidade da Jornada.

RN-002 O histórico deve permanecer íntegro.

---

# 50.5 Requisitos

RF-001 Preservar continuidade.

RF-002 Sincronizar informações.

RF-003 Atualizar estado operacional.

---

# 51. SCAP-05.06 — Consolidação da Execução

---

## 51.1 Propósito

Construir a representação consolidada da execução da Jornada para consumo pelas capacidades responsáveis por Experiência, Personalização e Aprendizado.

---

# 51.2 Entradas

Recebe:

- progresso;
- mudanças;
- reavaliações;
- monitoramento.

---

# 51.3 Saídas

Produz:

- Execução Consolidada;
- Histórico de Execução;
- Indicadores Operacionais.

---

# 51.4 Funcionalidades

FUNC-001 Consolidar Execução

FUNC-002 Validar Consistência

FUNC-003 Publicar Execução

FUNC-004 Registrar Histórico

---

# 51.5 Regras

RN-001 Toda execução consolidada deve representar o estado mais recente da Jornada.

RN-002 O histórico deve ser preservado.

RN-003 Publicações devem gerar eventos de negócio.

---

# 51.6 Requisitos

RF-001 Consolidar execução.

RF-002 Publicar execução.

RF-003 Preservar histórico.

---

# 51.7 Indicadores

- execuções consolidadas;
- inconsistências;
- tempo médio de consolidação.

---

# 52. CAP-06 — Gestão da Experiência

---

## 52.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | CAP-06 |
| Nome | Gestão da Experiência |
| Categoria | Capacidade Central |
| Criticidade | Alta |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 52.2 Missão

Compreender os resultados produzidos pelas decisões tomadas durante a Jornada e transformar essas experiências em conhecimento útil para o produto e para o usuário.

---

# 52.3 Problema de Negócio

Uma decisão somente pode ser avaliada após sua execução.

Sem compreender os resultados obtidos:

- o produto não aprende;
- recomendações futuras permanecem estáticas;
- erros tendem a se repetir;
- oportunidades de melhoria deixam de ser identificadas.

---

# 52.4 Objetivo Estratégico

Registrar e interpretar as experiências vividas pelo usuário para fechar o ciclo de decisão e fornecer conhecimento às capacidades responsáveis por Personalização e Aprendizado.

---

# 52.5 Objetivos da Capacidade

- registrar experiências;
- avaliar resultados;
- coletar feedback;
- medir satisfação;
- identificar aprendizados;
- consolidar conhecimento.

---

# 52.6 Subcapacidades

```text
CAP-06

├── SCAP-06.01
│   Registro de Experiências
│
├── SCAP-06.02
│   Avaliação de Resultados
│
├── SCAP-06.03
│   Gestão de Feedback
│
├── SCAP-06.04
│   Identificação de Aprendizados
│
├── SCAP-06.05
│   Consolidação do Conhecimento
│
└── SCAP-06.06
    Encerramento da Jornada
```

---

# 53. SCAP-06.01 — Registro de Experiências

---

## 53.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-06.01 |
| Capacidade | CAP-06 — Gestão da Experiência |
| Nome | Registro de Experiências |
| Criticidade | Alta |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 53.2 Propósito

Registrar as experiências vividas pelo usuário durante a Jornada, preservando informações que permitam compreender os resultados obtidos após cada decisão.

A experiência representa a percepção do resultado de uma decisão dentro de um determinado Contexto.

---

# 53.3 Definição Oficial

Experiência é o resultado observado após a execução de uma ou mais decisões tomadas durante um Momento da Jornada.

Ela representa um fato ocorrido e não apenas uma opinião do usuário.

A percepção do usuário faz parte da experiência, mas não a define integralmente.

---

# 53.4 Objetivos

Esta Subcapacidade deve:

- registrar experiências;
- relacionar experiências às decisões;
- preservar contexto;
- permitir avaliações futuras;
- alimentar o processo de aprendizado.

---

# 53.5 Escopo

Inclui:

- registro de experiências;
- associação com decisões;
- associação com Momentos;
- associação com Objetivos;
- registro temporal.

---

# 53.6 Fora do Escopo

Não inclui:

- personalização;
- geração de recomendações;
- aprendizado automático.

---

# 53.7 Estrutura da Experiência

Uma experiência poderá conter:

- Jornada;
- Momento;
- Decisão relacionada;
- Objetivo relacionado;
- Contexto observado;
- Resultado obtido;
- percepção do usuário;
- evidências disponíveis;
- data e horário.

---

# 53.8 Funcionalidades

| Código | Funcionalidade |
|---------|----------------|
| FUNC-001 | Registrar Experiência |
| FUNC-002 | Atualizar Registro |
| FUNC-003 | Consultar Experiência |
| FUNC-004 | Relacionar Experiência |

---

# 53.9 Regras de Negócio

RN-001 Toda experiência deve estar vinculada a pelo menos uma Decisão.

RN-002 Toda experiência pertence exatamente a um Momento.

RN-003 O histórico das experiências deve ser preservado.

RN-004 Alterações devem permanecer auditáveis.

---

# 53.10 Requisitos Funcionais

RF-001 Registrar experiências.

RF-002 Relacionar experiências às decisões.

RF-003 Preservar histórico.

RF-004 Disponibilizar experiências para Aprendizado.

---

# 53.11 Critérios de Aceite

**RF-001**

**Dado** que uma decisão tenha sido executada

**Quando** um resultado relevante for observado

**Então** o produto deverá registrar uma nova Experiência vinculada ao Momento correspondente.

---

# 53.12 Indicadores

- experiências registradas;
- experiências por Jornada;
- experiências por Objetivo;
- experiências por categoria.

---

# 54. SCAP-06.02 — Avaliação de Resultados

---

## 54.1 Propósito

Avaliar os resultados obtidos durante a Jornada verificando o grau de atendimento dos Objetivos definidos.

---

# 54.2 Objetivos

- avaliar resultados;
- medir sucesso;
- identificar desvios;
- registrar conclusões.

---

# 54.3 Critérios de Avaliação

Exemplos:

- objetivo atingido;
- necessidade atendida;
- restrições respeitadas;
- tempo utilizado;
- orçamento consumido;
- satisfação.

---

# 54.4 Funcionalidades

FUNC-001 Avaliar Resultado

FUNC-002 Medir Atendimento

FUNC-003 Registrar Avaliação

FUNC-004 Disponibilizar Resultado

---

# 54.5 Regras

RN-001 Toda avaliação deve estar relacionada a uma Experiência.

RN-002 Resultados devem permanecer rastreáveis.

RN-003 Avaliações podem ser revisadas quando novas evidências surgirem.

---

# 54.6 Requisitos

RF-001 Avaliar resultados.

RF-002 Registrar conclusão.

RF-003 Disponibilizar avaliação.

---

# 54.7 Indicadores

- objetivos atingidos;
- taxa de sucesso;
- necessidades atendidas;
- desvios identificados.

---

# 55. SCAP-06.03 — Gestão de Feedback

---

## 55.1 Propósito

Permitir que o usuário registre sua percepção sobre recomendações, experiências e resultados obtidos durante a Jornada.

O Feedback complementa as evidências objetivas registradas pelo produto.

---

# 55.2 Objetivos

- registrar feedback;
- identificar satisfação;
- registrar sugestões;
- apoiar melhoria contínua.

---

# 55.3 Tipos de Feedback

- positivo;
- negativo;
- neutro;
- sugestão;
- correção.

---

# 55.4 Funcionalidades

FUNC-001 Registrar Feedback

FUNC-002 Atualizar Feedback

FUNC-003 Consultar Feedback

FUNC-004 Classificar Feedback

---

# 55.5 Regras

RN-001 Todo feedback deve estar relacionado a uma Jornada, Momento ou Recomendação.

RN-002 Feedbacks permanecem registrados mesmo após encerramento da Jornada.

RN-003 O produto poderá solicitar feedback apenas em momentos apropriados da Jornada.

---

# 55.6 Requisitos

RF-001 Registrar feedback.

RF-002 Classificar feedback.

RF-003 Disponibilizar feedback para Aprendizado.

---

# 55.7 Indicadores

- feedbacks recebidos;
- satisfação média;
- taxa de resposta;
- sugestões registradas.

---

# 56. SCAP-06.04 — Identificação de Aprendizados

---

## 56.1 Propósito

Transformar experiências e feedbacks em conhecimento estruturado que possa ser utilizado para melhorar futuras decisões.

---

# 56.2 Objetivos

- identificar padrões;
- registrar aprendizados;
- reduzir repetição de erros;
- ampliar acertos.

---

# 56.3 Fontes

Recebe informações de:

- experiências;
- avaliações;
- feedbacks;
- histórico da Jornada.

---

# 56.4 Funcionalidades

FUNC-001 Identificar Aprendizado

FUNC-002 Registrar Aprendizado

FUNC-003 Classificar Aprendizado

FUNC-004 Disponibilizar Aprendizado

---

# 56.5 Regras

RN-001 Todo aprendizado deve possuir evidências.

RN-002 Aprendizados podem ser revisados.

RN-003 Aprendizados devem permanecer rastreáveis.

---

# 56.6 Requisitos

RF-001 Registrar aprendizados.

RF-002 Classificar aprendizados.

RF-003 Disponibilizar aprendizados.

---

# 56.7 Indicadores

- aprendizados registrados;
- padrões identificados;
- reutilização de aprendizados.

---

# 57. SCAP-06.05 — Consolidação do Conhecimento

---

## 57.1 Propósito

Consolidar o conhecimento produzido durante a Jornada em uma representação única que possa ser utilizada pelas capacidades responsáveis por Personalização e evolução do produto.

---

# 57.2 Objetivos

- consolidar aprendizados;
- consolidar resultados;
- consolidar experiências;
- produzir conhecimento reutilizável.

---

# 57.3 Funcionalidades

FUNC-001 Consolidar Conhecimento

FUNC-002 Validar Consistência

FUNC-003 Publicar Conhecimento

FUNC-004 Registrar Histórico

---

# 57.4 Regras

RN-001 Apenas informações validadas podem compor o Conhecimento Consolidado.

RN-002 O histórico deve ser preservado.

RN-003 Toda consolidação gera uma nova versão lógica do conhecimento.

---

# 57.5 Requisitos

RF-001 Consolidar conhecimento.

RF-002 Publicar conhecimento.

RF-003 Disponibilizar conhecimento para Personalização.

---

# 57.6 Indicadores

- consolidações realizadas;
- qualidade do conhecimento;
- consistência.

---

# 58. SCAP-06.06 — Encerramento da Jornada

---

## 58.1 Propósito

Formalizar o encerramento operacional da Jornada garantindo que todas as informações produzidas durante sua execução estejam completas, consistentes e disponíveis para reutilização futura.

---

# 58.2 Objetivos

- concluir Jornada;
- validar integridade;
- consolidar resultados;
- disponibilizar histórico.

---

# 58.3 Critérios para Encerramento

A Jornada poderá ser encerrada quando:

- objetivos forem concluídos;
- usuário optar pelo encerramento;
- Jornada for cancelada;
- critérios automáticos forem atendidos.

---

# 58.4 Funcionalidades

FUNC-001 Encerrar Jornada

FUNC-002 Validar Integridade

FUNC-003 Consolidar Histórico

FUNC-004 Publicar Encerramento

---

# 58.5 Regras

RN-001 Nenhuma informação relevante pode permanecer pendente.

RN-002 O encerramento gera um evento oficial da Jornada.

RN-003 Jornadas encerradas permanecem disponíveis para consulta.

---

# 58.6 Requisitos

RF-001 Encerrar Jornada.

RF-002 Consolidar histórico.

RF-003 Disponibilizar informações para Personalização.

---

# 58.7 Critérios de Aceite

**RF-001**

**Dado** que todos os critérios de encerramento tenham sido atendidos

**Quando** o encerramento for solicitado

**Então** a Jornada deverá mudar para o estado Concluída, consolidando seu histórico e disponibilizando o conhecimento produzido para as capacidades dependentes.

---

# 58.8 Indicadores

- jornadas encerradas;
- tempo médio até encerramento;
- inconsistências identificadas no encerramento.

---

# 59. CAP-07 — Personalização

---

## 59.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | CAP-07 |
| Nome | Personalização |
| Categoria | Capacidade Central |
| Criticidade | Alta |
| Prioridade | Pós-MVP |
| Estado | Planejada |

---

# 59.2 Missão

Adaptar progressivamente o comportamento do RouteBook às características, preferências, padrões e aprendizados de cada usuário, tornando as recomendações mais relevantes ao longo do tempo.

A Personalização não altera os princípios do Motor de Decisão.

Ela influencia como alternativas são analisadas e apresentadas, respeitando sempre o Contexto atual da Jornada.

---

# 59.3 Problema de Negócio

Usuários diferentes podem tomar decisões distintas diante do mesmo Contexto.

Sem Personalização:

- recomendações tornam-se excessivamente genéricas;
- preferências recorrentes deixam de ser consideradas;
- o produto aprende pouco com o uso contínuo.

---

# 59.4 Objetivo Estratégico

Utilizar o conhecimento acumulado sobre o usuário para melhorar continuamente a qualidade das recomendações, preservando transparência, controle do usuário e aderência ao Contexto vigente.

---

# 59.5 Objetivos da Capacidade

- aprender padrões;
- adaptar recomendações;
- considerar preferências recorrentes;
- identificar comportamentos;
- aumentar relevância sem comprometer a explicabilidade.

---

# 59.6 Subcapacidades

```text
CAP-07

├── SCAP-07.01
│   Perfil do Usuário
│
├── SCAP-07.02
│   Gestão de Preferências
│
├── SCAP-07.03
│   Aprendizado Comportamental
│
├── SCAP-07.04
│   Adaptação das Recomendações
│
├── SCAP-07.05
│   Gestão de Configurações
│
└── SCAP-07.06
    Consolidação da Personalização
```

---

# 60. SCAP-07.01 — Perfil do Usuário

---

## 60.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | SCAP-07.01 |
| Capacidade | CAP-07 — Personalização |
| Nome | Perfil do Usuário |
| Criticidade | Alta |
| Prioridade | Pós-MVP |
| Estado | Planejada |

---

# 60.2 Propósito

Construir uma representação evolutiva do perfil do usuário que reflita suas características, comportamentos e preferências observadas ao longo das Jornadas.

O Perfil não representa apenas informações cadastrais.

Ele representa conhecimento adquirido sobre como o usuário normalmente toma decisões.

---

# 60.3 Objetivos

- representar o usuário;
- consolidar características;
- registrar preferências recorrentes;
- apoiar personalização.

---

# 60.4 Escopo

Inclui:

- perfil comportamental;
- perfil de viagem;
- perfil de decisão;
- perfil de consumo;
- preferências recorrentes.

---

# 60.5 Funcionalidades

FUNC-001 Criar Perfil

FUNC-002 Atualizar Perfil

FUNC-003 Consolidar Perfil

FUNC-004 Consultar Perfil

---

# 60.6 Regras

RN-001 O Perfil evolui continuamente.

RN-002 O usuário poderá revisar informações personalizadas.

RN-003 Informações utilizadas para personalização deverão possuir origem rastreável.

---

# 60.7 Requisitos

RF-001 Manter Perfil.

RF-002 Atualizar Perfil.

RF-003 Disponibilizar Perfil às capacidades autorizadas.

---

# 60.8 Indicadores

- evolução do Perfil;
- informações consolidadas;
- precisão percebida.

---

# 61. SCAP-07.02 — Gestão de Preferências

---

## 61.1 Propósito

Gerenciar preferências explícitas e implícitas do usuário durante suas Jornadas.

---

# 61.2 Objetivos

- registrar preferências;
- atualizar preferências;
- identificar mudanças;
- disponibilizar preferências.

---

# 61.3 Categorias

Exemplos:

- gastronomia;
- mobilidade;
- orçamento;
- ritmo;
- hospedagem;
- atrações;
- horários.

---

# 61.4 Funcionalidades

FUNC-001 Registrar Preferência

FUNC-002 Atualizar Preferência

FUNC-003 Classificar Preferência

FUNC-004 Consultar Preferências

---

# 61.5 Regras

RN-001 Preferências explícitas possuem prioridade sobre inferências.

RN-002 Preferências podem variar conforme Contexto.

RN-003 Preferências nunca substituem Restrições.

---

# 61.6 Requisitos

RF-001 Registrar preferências.

RF-002 Atualizar preferências.

RF-003 Disponibilizar preferências.

---

# 62. SCAP-07.03 — Aprendizado Comportamental

---

## 62.1 Propósito

Identificar padrões recorrentes de comportamento que possam melhorar futuras recomendações.

---

# 62.2 Objetivos

- identificar padrões;
- registrar hábitos;
- consolidar comportamentos.

---

# 62.3 Exemplos

- horários preferidos;
- distância normalmente aceita;
- faixa de orçamento;
- tipos de atrações escolhidas;
- tempo médio de permanência.

---

# 62.4 Funcionalidades

FUNC-001 Identificar Padrão

FUNC-002 Registrar Comportamento

FUNC-003 Consolidar Aprendizado

---

# 62.5 Regras

RN-001 Todo aprendizado deve possuir evidências.

RN-002 Padrões podem perder relevância ao longo do tempo.

RN-003 O usuário poderá redefinir preferências explícitas.

---

# 62.6 Requisitos

RF-001 Registrar padrões.

RF-002 Atualizar padrões.

RF-003 Disponibilizar padrões.

---

# 63. SCAP-07.04 — Adaptação das Recomendações

---

## 63.1 Propósito

Permitir que o Motor de Decisão considere informações de Personalização sem comprometer a aderência ao Contexto da Jornada.

---

# 63.2 Objetivos

- adaptar recomendações;
- aumentar relevância;
- preservar transparência.

---

# 63.3 Princípios

A Personalização:

- complementa o Contexto;
- não substitui Objetivos;
- não ignora Restrições;
- não elimina alternativas válidas sem justificativa.

---

# 63.4 Funcionalidades

FUNC-001 Adaptar Recomendação

FUNC-002 Ajustar Prioridades

FUNC-003 Registrar Personalização

---

# 63.5 Regras

RN-001 O Contexto possui prioridade sobre o Perfil.

RN-002 Restrições possuem prioridade sobre Preferências.

RN-003 Toda adaptação deve permanecer explicável.

---

# 63.6 Requisitos

RF-001 Adaptar recomendações.

RF-002 Registrar adaptações.

RF-003 Preservar transparência.

---

# 64. SCAP-07.05 — Gestão de Configurações

---

## 64.1 Propósito

Permitir que o usuário controle como a Personalização é utilizada durante suas Jornadas.

---

# 64.2 Objetivos

- configurar preferências;
- controlar personalização;
- revisar informações.

---

# 64.3 Funcionalidades

FUNC-001 Configurar Personalização

FUNC-002 Revisar Preferências

FUNC-003 Restaurar Configuração

---

# 64.4 Regras

RN-001 O usuário possui controle sobre a Personalização.

RN-002 Alterações devem produzir efeito apenas em Jornadas futuras, salvo quando explicitamente aplicadas à Jornada atual.

---

# 64.5 Requisitos

RF-001 Configurar Personalização.

RF-002 Atualizar Configurações.

RF-003 Restaurar configurações.

---

# 65. SCAP-07.06 — Consolidação da Personalização

---

## 65.1 Propósito

Construir a representação consolidada do Perfil Personalizado utilizada pelas demais capacidades do RouteBook.

---

# 65.2 Entradas

Recebe:

- Perfil;
- Preferências;
- Aprendizados;
- Configurações.

---

# 65.3 Saídas

Produz:

- Perfil Consolidado;
- Preferências Consolidadas;
- Indicadores de Personalização.

---

# 65.4 Funcionalidades

FUNC-001 Consolidar Perfil

FUNC-002 Validar Consistência

FUNC-003 Publicar Perfil

FUNC-004 Registrar Histórico

---

# 65.5 Regras

RN-001 Deve existir uma única versão consolidada do Perfil por usuário.

RN-002 Toda atualização deve preservar rastreabilidade.

RN-003 O histórico de evolução do Perfil deve ser mantido.

---

# 65.6 Requisitos

RF-001 Consolidar Perfil.

RF-002 Publicar Perfil.

RF-003 Disponibilizar Perfil Consolidado.

---

# 65.7 Indicadores

- perfis consolidados;
- atualizações;
- consistência;
- utilização da personalização.

---

# 66. CAP-08 — Ecossistema

---

## 66.1 Identificação

| Campo | Valor |
|--------|-------|
| Código | CAP-08 |
| Nome | Ecossistema |
| Categoria | Capacidade de Integração |
| Criticidade | Alta |
| Prioridade | MVP |
| Estado | Obrigatória |

---

# 66.2 Missão

Integrar o RouteBook a fontes externas de informação e serviços necessários para apoiar a Jornada do usuário.

O Ecossistema amplia a capacidade do produto de compreender Contexto, descobrir Alternativas e manter informações atualizadas.

---

# 66.3 Objetivo Estratégico

Disponibilizar um mecanismo padronizado para integração com provedores de dados e serviços, preservando consistência, rastreabilidade e independência do domínio do RouteBook.

---

# 66.4 Objetivos

- integrar serviços;
- integrar provedores;
- consolidar dados;
- monitorar disponibilidade;
- garantir qualidade das integrações.

---

# 66.5 Subcapacidades

```text
CAP-08

├── SCAP-08.01
│   Gestão de Integrações
│
├── SCAP-08.02
│   Gestão de Fontes Externas
│
├── SCAP-08.03
│   Sincronização de Dados
│
├── SCAP-08.04
│   Monitoramento das Integrações
│
├── SCAP-08.05
│   Tratamento de Falhas
│
└── SCAP-08.06
    Consolidação do Ecossistema
```

---

# 66.6 Dependências

Fornece informações para:

- CAP-02;
- CAP-03;
- CAP-04;
- CAP-05.

Recebe solicitações de praticamente todas as capacidades do produto.

---

# 66.7 Princípios

- Todo serviço externo deve ser tratado como fornecedor de informação, nunca como fonte de verdade do domínio.
- O domínio do RouteBook permanece independente das tecnologias e provedores utilizados.
- Falhas em integrações não devem comprometer a integridade da Jornada.
- Toda informação proveniente de fontes externas deve possuir origem identificável e rastreável.

---