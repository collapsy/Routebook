---
id: RB-PROD-0001
title: Visão Geral do Produto
description: Define a visão geral do produto, posicionamento, problema, público, proposta de valor e limites comportamentais do RouteBook.
document_type: product
owner: Product
status: draft
version: "0.1.0"

created: "2026-07-15"
last_updated: "2026-07-15"

authors:
  - RouteBook Team

tags:
  - product
  - overview
  - decision-intelligence
  - ai-first

related_documents:
  - RB-CORE-0001 # README
  - RB-CORE-0002 # Project Charter
  - RB-CORE-0003 # Vision
  - RB-CORE-0004 # RouteBook Bible
  - RB-0002 # Product Principles

next_documents:
  - RB-PROD-0002 # Personas
  - RB-PROD-0003 # User Journey
  - RB-PROD-0004 # Product Requirements Document

ai_context:
  priority: high
  index: true
---

# RouteBook - Product Overview

## 1. Propósito

Este documento define a visão geral do RouteBook a partir da perspectiva de produto.

Seu objetivo é explicar o que o RouteBook é, para quem existe, qual problema resolve, qual valor entrega e quais limites devem orientar sua evolução.

A Visão Geral do Produto não define implementação técnica, arquitetura de software, componentes de interface, APIs, bancos de dados ou roadmap detalhado. Esses assuntos pertencem a documentos específicos das Epics de Arquitetura, Design System, Travel Engine e Engenharia.

Este documento existe para orientar Product Managers, UX Designers, Arquitetos, Desenvolvedores e agentes de IA sobre o comportamento esperado do produto em nível conceitual.

## 2. Definição do Produto

O RouteBook é uma **AI-First Travel Decision Platform**.

Ele existe para apoiar viajantes na tomada de decisões durante uma viagem, transformando contexto em recomendações úteis, contextualizadas e explicáveis.

O RouteBook não tem como objetivo apresentar a maior quantidade possível de lugares, atrações ou opções. Seu objetivo é ajudar o usuário a responder perguntas como:

- O que faz mais sentido fazer agora?
- Ainda vale a pena seguir o plano original?
- Existe uma alternativa melhor considerando meu contexto atual?
- Quanto tempo, dinheiro ou esforço essa decisão exigirá?
- Essa escolha melhora ou compromete o restante da jornada?

A função central do produto é reduzir a carga cognitiva do viajante no momento da decisão.

## 3. Declaração do Problema

Durante uma viagem, usuários raramente sofrem por falta de informação.

O problema principal é o excesso de informações desconectadas.

Um viajante pode consultar mapas, avaliações, blogs, vídeos, previsão do tempo, aplicativos de transporte, plataformas de reserva e recomendações sociais. Mesmo assim, a decisão final ainda depende de interpretação manual:

- comparar distância;
- estimar tempo disponível;
- considerar clima;
- avaliar orçamento;
- entender impacto no roteiro;
- adaptar planos quando imprevistos acontecem;
- equilibrar preferências individuais ou do grupo.

Essa interpretação consome tempo, atenção e energia. Em muitos casos, usuários não precisam de mais opções. Eles precisam de clareza para escolher a Próxima Melhor Ação.

O RouteBook resolve esse problema ao atuar como uma camada de inteligência capaz de interpretar contexto e recomendar decisões.

## 4. Posicionamento do Produto

O RouteBook pertence à categoria de **Travel Decision Intelligence Platform**.

Seu posicionamento é diferente de produtos orientados a busca, catálogos ou reservas.

Outros produtos normalmente respondem:

- Onde fica?
- Está aberto?
- Quanto custa?
- Qual é a avaliação?
- Quais opções existem perto de mim?

O RouteBook busca responder:

- Qual opção faz mais sentido agora?
- Por que essa decisão é recomendada?
- O que muda se eu escolher essa alternativa?
- Como essa decisão afeta meu tempo, orçamento e roteiro?
- Existe uma Próxima Melhor Ação mais adequada?

Essa diferença é essencial: o RouteBook não organiza apenas informações sobre viagens. Ele organiza contexto para apoiar decisões.

## 5. O que o RouteBook É

O RouteBook é:

- uma plataforma AI-First;
- um assistente inteligente de viagem;
- um sistema de apoio à decisão;
- um motor de recomendações contextuais;
- uma camada de inteligência sobre informações de viagem;
- um produto orientado à Próxima Melhor Ação.

Essas definições devem ser usadas de forma consistente em toda a documentação de produto.

## 6. O que o RouteBook Não É

O RouteBook não é:

- aplicativo de mapas;
- catálogo turístico;
- guia tradicional de atrações;
- plataforma de reservas;
- marketplace de hotéis, passagens ou experiências;
- rede social de viagens;
- sistema próprio de avaliações;
- comparador tradicional de preços.

Esses serviços podem ser fontes de dados, integrações ou parceiros funcionais, mas não representam o propósito central do produto.

O foco do RouteBook deve permanecer na inteligência para tomada de decisão.

## 7. Público-Alvo

O RouteBook existe para viajantes que precisam tomar decisões durante a execução de uma viagem.

O público principal não é definido apenas por perfil demográfico, mas pela situação de uso: pessoas que estão fora de sua rotina, lidando com tempo limitado, informações fragmentadas, preferências pessoais e mudanças de contexto.

O produto atende especialmente:

- viajantes individuais que precisam decidir com autonomia;
- casais que precisam equilibrar preferências diferentes;
- famílias que precisam considerar tempo, cansaço, orçamento e restrições práticas;
- grupos de amigos que precisam chegar a decisões compartilhadas;
- viajantes de negócios que possuem agenda limitada e pouca margem para erro;
- nômades digitais que alternam trabalho, deslocamento e exploração local;
- turistas internacionais que enfrentam barreiras de idioma, cultura e familiaridade com o destino.

Independentemente do perfil, todos compartilham o mesmo problema central: transformar contexto em uma decisão melhor durante a jornada.

## 8. Cenários de Uso

O RouteBook deve gerar valor especialmente em momentos nos quais o plano original deixa de ser suficiente.

Esses momentos podem ocorrer antes, durante ou após uma atividade planejada, mas são mais críticos quando o usuário precisa decidir com pouco tempo, informações incompletas ou consequências práticas relevantes.

### 8.1 Decisão sobre o que fazer agora

O usuário está em uma cidade desconhecida, tem algumas horas livres e não sabe qual atividade faz mais sentido naquele momento.

O RouteBook deve considerar fatores como localização atual, tempo disponível, clima, deslocamento, orçamento, preferências e impacto no restante do roteiro para recomendar a Próxima Melhor Ação.

Exemplo:

Um casal está em Paris às 16h, próximo ao Marais. O plano original era visitar um museu, mas ele fecha em duas horas e há previsão de chuva. O RouteBook pode recomendar uma atividade coberta próxima, com tempo de visita compatível e menor risco de deslocamento desnecessário.

### 8.2 Reavaliação de roteiro diante de imprevistos

O usuário possui um roteiro planejado, mas uma mudança de contexto torna o plano menos adequado.

O RouteBook deve ajudar o usuário a entender se vale a pena manter, adiar, substituir ou reorganizar uma atividade.

Exemplo:

Uma família planejou visitar uma atração ao ar livre em Buenos Aires, mas começa a chover e o deslocamento levaria mais tempo que o previsto. O RouteBook pode recomendar substituir a atividade por uma experiência coberta próxima ao hotel, preservando energia e reduzindo frustração.

### 8.3 Escolha entre alternativas semelhantes

O usuário possui várias opções aparentemente boas, mas não consegue identificar qual delas é mais adequada ao contexto.

O RouteBook deve comparar alternativas com base no que importa para a decisão, não apenas em avaliação média ou popularidade.

Exemplo:

Um viajante solo em Lisboa precisa escolher onde jantar. Três restaurantes têm boa avaliação, mas apenas um se encaixa melhor no orçamento restante, está no caminho de volta para a hospedagem e ainda estará aberto após o próximo compromisso. O RouteBook deve priorizar essa alternativa e explicar os fatores considerados.

### 8.4 Decisão com impacto no restante da viagem

O usuário considera uma ação que pode comprometer tempo, orçamento ou energia para atividades futuras.

O RouteBook deve tornar visíveis as consequências da decisão.

Exemplo:

Um grupo em Nova York quer atravessar a cidade para visitar uma atração popular. A decisão consumiria grande parte da tarde e atrasaria uma reserva já marcada. O RouteBook pode recomendar não seguir com essa opção naquele momento e sugerir uma alternativa mais próxima, preservando o restante do roteiro.

## 9. Proposta de Valor

A proposta de valor do RouteBook é transformar informações dispersas em decisões acionáveis.

O produto entrega valor ao:

- reduzir o esforço necessário para decidir;
- recomendar ações compatíveis com o contexto atual;
- explicar por que uma recomendação foi feita;
- adaptar sugestões quando o contexto muda;
- preservar o controle final do usuário;
- evitar que o usuário precise comparar manualmente múltiplas fontes;
- priorizar relevância em vez de quantidade de opções.

O valor do RouteBook não está em possuir mais dados que outras plataformas. Está em interpretar dados, contexto e restrições para apoiar uma decisão melhor.

## 10. Comportamento Esperado do Produto

O RouteBook deve se comportar como uma camada de apoio à decisão.

Isso significa que o produto deve:

- compreender o contexto disponível antes de recomendar;
- apresentar recomendações claras e acionáveis;
- justificar recomendações com fatores relevantes;
- evitar excesso de alternativas simultâneas;
- permitir que o usuário aceite, rejeite ou ajuste a recomendação;
- adaptar recomendações conforme novas informações surgirem;
- reconhecer quando não houver contexto suficiente para uma recomendação confiável.

O RouteBook não deve agir como uma lista neutra de resultados. Sempre que recomendar uma ação, deve deixar claro por que aquela ação é mais adequada ao momento.

## 11. Limites do Produto

O RouteBook deve evitar funcionalidades que desviem o produto de sua função central.

Uma nova funcionalidade só deve ser considerada alinhada quando ajudar o usuário a tomar uma decisão melhor durante sua jornada.

Funcionalidades devem ser questionadas quando:

- aumentam a quantidade de opções sem melhorar a decisão;
- exigem esforço excessivo de configuração;
- transformam o produto em catálogo, rede social, marketplace ou sistema de reservas;
- reduzem a transparência das recomendações;
- substituem o julgamento do usuário em vez de apoiá-lo;
- dependem de dados que não podem ser explicados ou validados de forma suficiente.

Esses limites preservam o posicionamento do RouteBook como plataforma de inteligência para tomada de decisão em viagens.

## 12. Notas de Revisão

### Autoavaliação Crítica

Esta versão estabelece a identidade do produto, o problema central, os limites de posicionamento, o público-alvo, os principais cenários de uso e a proposta de valor. Ela permanece alinhada à Foundation ao preservar os conceitos de AI-First, apoio à decisão, contexto acima de catálogo, explicabilidade, simplicidade e controle do usuário.

### Lacunas Identificadas

O documento ainda precisa definir:

- princípios de experiência;
- critérios de validação;
- dependências com outros documentos da Epic Product.

### Próxima Seção Sugerida

A próxima iteração deve cobrir:

1. princípios de experiência do produto;
2. critérios de validação;
3. relação com documentos dependentes;
4. critérios de aceite do Product Overview.
