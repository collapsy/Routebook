---

id: RB-FND-002

title: Princípios do Produto
description: Define os princípios permanentes que orientam decisões de produto, experiência, inteligência, arquitetura e evolução do RouteBook.

document_type: foundation
owner: Product

status: Draft
version: "0.1.0"

created: "2026-07-15"
last_updated: null

authors:

- RouteBook Team

tags:

- foundation
- product-principles
- decision-making
- personalization
- user-experience

related_documents:

- RB-FND-001

prerequisites:

- RB-FND-001

next_documents:

- RB-FND-003
- RB-FND-004
- RB-PRD-001

ai_context:
priority: high
index: true

---

# RouteBook — Princípios do Produto

## 1. Propósito deste documento

Este documento define os princípios permanentes que orientam o desenvolvimento e a evolução do RouteBook.

Os princípios estabelecidos aqui devem ser utilizados para avaliar:

* novas funcionalidades;
* alterações de comportamento;
* decisões de experiência;
* regras de recomendação;
* decisões arquiteturais;
* integrações externas;
* priorização de roadmap;
* critérios de qualidade;
* propostas de simplificação;
* conflitos entre necessidades diferentes.

A Visão do Produto define onde o RouteBook pretende chegar.

Os Princípios do Produto definem como o RouteBook deverá tomar decisões ao longo desse caminho.

Este documento não descreve telas específicas, requisitos funcionais completos, tecnologias ou regras detalhadas de implementação.

Seu objetivo é estabelecer critérios duradouros que continuem válidos mesmo quando a interface, a arquitetura ou os fornecedores utilizados pelo produto mudarem.

---

## 2. Papel dos princípios

Os princípios não devem ser tratados como frases inspiracionais sem aplicação prática.

Cada princípio deve ajudar a responder perguntas como:

* Esta funcionalidade pertence ao RouteBook?
* Esta solução reduz ou aumenta a complexidade para o usuário?
* Esta recomendação considera o contexto real da viagem?
* Esta decisão mantém o usuário no controle?
* Esta interface comunica melhor por texto ou visualmente?
* Esta integração cria dependência desnecessária?
* Esta automação é compreensível?
* Esta funcionalidade entrega valor suficiente?
* Este comportamento funciona para diferentes destinos?
* Esta decisão pode ser explicada a uma pessoa ou agente de IA?

Quando dois objetivos entrarem em conflito, os princípios devem orientar a escolha mais coerente com a identidade do produto.

---

## 3. Hierarquia de decisão

Os princípios do RouteBook possuem diferentes níveis de importância.

### 3.1 Princípios essenciais

São aqueles que definem a identidade do produto e não devem ser contrariados.

* contexto antes de popularidade;
* usuário no controle;
* mapa como parte estrutural;
* personalização progressiva;
* recomendações explicáveis;
* utilidade prática;
* simplicidade.

### 3.2 Princípios de qualidade

Orientam a forma como o produto deve entregar valor.

* visual antes de textual;
* planejamento realista;
* adaptação antes de rigidez;
* consistência entre lista, mapa e roteiro;
* confiança antes de automação excessiva;
* acessibilidade desde a concepção;
* responsividade como requisito básico.

### 3.3 Princípios de evolução

Orientam arquitetura, documentação e crescimento do produto.

* independência de fornecedor;
* documentação como fonte oficial;
* modularidade com propósito;
* dados com origem e qualidade conhecidas;
* evolução guiada por validação;
* preparação para humanos e agentes de IA;
* complexidade conquistada, não antecipada.

---

# Parte I — Princípios essenciais

## 4. Contexto antes de popularidade

O RouteBook não deverá considerar que o lugar mais popular é automaticamente a melhor escolha.

Popularidade pode ser um sinal relevante, mas nunca deve ser o único critério.

Uma recomendação deverá considerar o contexto da viagem, incluindo fatores como:

* localização da hospedagem;
* distância;
* tempo disponível;
* orçamento;
* perfil do grupo;
* interesses;
* meio de transporte;
* duração da atividade;
* horário;
* atividades já planejadas;
* ritmo desejado;
* restrições informadas.

Um restaurante muito bem avaliado pode ser inadequado quando:

* está distante;
* possui preço incompatível com o orçamento;
* exige deslocamento desproporcional;
* não atende às preferências alimentares;
* compromete o restante do roteiro.

Uma atração menos conhecida pode ser mais adequada quando:

* está próxima;
* combina com o perfil do usuário;
* cabe melhor no tempo disponível;
* oferece melhor custo-benefício;
* permite combinar outras atividades no mesmo período.

### Aplicação prática

O produto deverá priorizar relevância contextual sobre rankings genéricos.

### Pergunta de validação

> Esta recomendação é boa para este usuário e esta viagem, ou apenas popular de forma geral?

---

## 5. Usuário no controle

O RouteBook deverá apoiar decisões, não substituir a autonomia do viajante.

O sistema poderá:

* sugerir lugares;
* ordenar opções;
* recomendar horários;
* gerar roteiros;
* reorganizar atividades;
* propor substituições;
* apresentar alertas;
* indicar conflitos.

O usuário deverá poder:

* aceitar;
* rejeitar;
* alterar;
* substituir;
* remover;
* reorganizar;
* ignorar;
* adicionar escolhas próprias.

Nenhuma sugestão deverá ser apresentada como obrigatória.

O sistema não deverá impedir uma escolha apenas por considerá-la menos eficiente, desde que não exista restrição real que torne a ação impossível.

Quando houver conflito, o produto deverá informar o impacto da escolha e permitir que o usuário decida.

Exemplo:

> Esta alteração aumenta o deslocamento estimado do dia em aproximadamente 50 minutos. Deseja manter mesmo assim?

### Aplicação prática

Automação deve reduzir esforço sem remover liberdade.

### Pergunta de validação

> O usuário continua compreendendo e controlando a decisão final?

---

## 6. Mapa como parte estrutural da experiência

O mapa não deverá ser tratado como uma funcionalidade acessória.

Ele será uma das principais formas de compreender a viagem.

O RouteBook deverá utilizar o mapa para apresentar:

* localização da hospedagem;
* lugares recomendados;
* lugares salvos;
* atividades do roteiro;
* proximidade entre pontos;
* distâncias;
* rotas;
* agrupamentos geográficos;
* distribuição das atividades pelos dias.

Lista, mapa e roteiro deverão trabalhar de forma integrada.

Ao selecionar um lugar em uma lista, o usuário deverá conseguir localizá-lo no mapa.

Ao selecionar um marcador, deverá conseguir acessar informações do lugar.

Ao visualizar um dia do roteiro, deverá conseguir compreender o percurso planejado.

### Aplicação prática

Informações espaciais devem ser visíveis sempre que forem relevantes para a decisão.

### Pergunta de validação

> O usuário consegue entender onde os lugares estão e como se relacionam entre si?

---

## 7. Personalização progressiva

O RouteBook não deverá exigir que o usuário preencha um questionário extenso antes de receber valor.

Ao mesmo tempo, não deverá permanecer genérico quando informações relevantes estiverem disponíveis.

A personalização deverá acontecer em etapas.

Com informações mínimas, como destino, período e hospedagem, o sistema já deverá oferecer uma experiência inicial útil.

Novas informações poderão refinar a experiência:

* orçamento;
* interesses;
* perfil do grupo;
* meio de transporte;
* ritmo;
* restrições;
* preferências alimentares;
* presença de crianças;
* horários;
* lugares obrigatórios;
* experiências que o usuário deseja evitar.

Cada informação adicional deverá melhorar as recomendações, sem bloquear o uso inicial.

### Aplicação prática

O produto deve começar simples e ganhar precisão conforme aprende sobre a viagem.

### Pergunta de validação

> Estamos pedindo mais informações do que o necessário para entregar o próximo valor?

---

## 8. Recomendações explicáveis

O RouteBook deverá apresentar recomendações que possam ser compreendidas pelo usuário.

Não basta informar que uma opção possui maior pontuação.

O sistema deverá explicar os principais motivos que tornam um lugar relevante.

Exemplos de justificativa:

* proximidade da hospedagem;
* compatibilidade com o orçamento;
* combinação com atividades próximas;
* alinhamento com interesses;
* boa relação entre preço e avaliação;
* adequação ao perfil do grupo;
* menor tempo de deslocamento;
* horário mais conveniente.

As explicações deverão ser curtas, claras e úteis.

O produto não deverá expor fórmulas técnicas, pesos internos ou detalhes desnecessários, salvo quando houver valor real para o usuário.

### Aplicação prática

Toda recomendação importante deve possuir uma justificativa compreensível.

### Pergunta de validação

> O usuário entende por que essa opção foi apresentada?

---

## 9. Utilidade prática

Cada funcionalidade do RouteBook deverá ajudar o usuário a realizar pelo menos uma destas ações:

* descobrir;
* compreender;
* comparar;
* escolher;
* organizar;
* localizar;
* executar;
* adaptar.

Funcionalidades que apenas aumentem a quantidade de informação, sem melhorar a decisão ou a experiência, deverão ser questionadas.

O produto não deverá buscar parecer completo por meio de excesso de recursos.

A utilidade será medida pelo impacto real na viagem.

### Aplicação prática

Uma funcionalidade deve resolver um problema concreto do viajante.

### Pergunta de validação

> Esta funcionalidade facilita alguma decisão ou ação relevante?

---

## 10. Simplicidade

O RouteBook deverá evitar complexidade desnecessária.

Isso se aplica a:

* formulários;
* navegação;
* telas;
* filtros;
* configurações;
* linguagem;
* automações;
* arquitetura;
* documentação.

Simplicidade não significa ausência de capacidade.

Significa entregar capacidades complexas por meio de interações compreensíveis.

O produto deverá evitar:

* excesso de opções simultâneas;
* formulários longos;
* terminologia técnica;
* fluxos com muitas etapas;
* configurações obrigatórias sem necessidade;
* informações repetidas;
* decisões escondidas;
* interfaces sobrecarregadas.

### Aplicação prática

A melhor solução é a mais simples que resolva adequadamente o problema.

### Pergunta de validação

> Esta experiência pode ser compreendida e utilizada sem explicação extensa?

---

# Parte II — Princípios de qualidade

## 11. Visual antes de textual

O RouteBook deverá preferir comunicação visual quando ela transmitir melhor a informação.

Exemplos:

* mapa para localização;
* linha do tempo para sequência;
* cartão para resumo de lugar;
* marcador para categoria;
* indicador para distância;
* faixa para preço;
* fotografia para reconhecimento;
* agrupamento para proximidade;
* ícone para meio de transporte.

Texto continuará sendo necessário para explicar, contextualizar e detalhar informações.

O princípio não significa eliminar texto.

Significa evitar usar longos blocos textuais quando uma representação visual for mais eficiente.

### Aplicação prática

A interface deve permitir compreensão rápida, especialmente durante a viagem.

### Pergunta de validação

> Esta informação seria entendida com mais facilidade por meio de um recurso visual?

---

## 12. Planejamento realista

O RouteBook deverá evitar roteiros que parecem bons em uma lista, mas são inviáveis na prática.

O planejamento deverá considerar:

* duração das atividades;
* deslocamentos;
* pausas;
* refeições;
* horários de funcionamento;
* ritmo do usuário;
* margens de atraso;
* tempo para entrada e saída;
* concentração geográfica;
* períodos livres.

O produto não deverá preencher todos os minutos disponíveis apenas porque existem atividades suficientes.

Um roteiro equilibrado deve considerar que a viagem não é uma sequência perfeita de eventos.

### Aplicação prática

O produto deverá alertar sobre dias sobrecarregados ou deslocamentos desproporcionais.

### Pergunta de validação

> Este roteiro pode ser executado por uma pessoa real nas condições informadas?

---

## 13. Adaptação antes de rigidez

O roteiro deverá ser entendido como um plano vivo.

O RouteBook deverá permitir alterações sem obrigar o usuário a reconstruir toda a viagem.

Mudanças possíveis incluem:

* cancelamento de uma atividade;
* chuva;
* atraso;
* cansaço;
* mudança de orçamento;
* alteração de horário;
* descoberta de um novo lugar;
* mudança de interesse;
* indisponibilidade de estabelecimento.

O sistema deverá adaptar apenas as partes necessárias sempre que possível.

### Aplicação prática

Mudanças locais devem produzir replanejamento proporcional, não reconstrução total.

### Pergunta de validação

> O usuário consegue alterar uma parte da viagem sem perder todo o planejamento?

---

## 14. Consistência entre lista, mapa e roteiro

As diferentes formas de visualização não deverão apresentar versões conflitantes da viagem.

Um lugar salvo deverá possuir a mesma identidade em:

* lista;
* mapa;
* roteiro;
* detalhes;
* recomendações.

Alterações relevantes deverão refletir em todas as visões.

Se uma atividade for removida do roteiro, o mapa do dia deverá ser atualizado.

Se um lugar for selecionado no mapa, o cartão correspondente deverá ser identificado.

### Aplicação prática

As visualizações devem funcionar como representações diferentes do mesmo estado.

### Pergunta de validação

> O usuário percebe que lista, mapa e roteiro fazem parte da mesma experiência?

---

## 15. Confiança antes de automação excessiva

O RouteBook poderá utilizar inteligência artificial, regras, algoritmos e integrações externas.

Esses recursos não deverão operar de maneira opaca ou excessivamente autônoma.

A automação deverá ser proporcional à confiança disponível.

O sistema deverá:

* indicar quando uma informação é estimada;
* diferenciar dado conhecido de inferência;
* permitir revisão;
* apresentar impacto de alterações;
* evitar afirmar certeza quando não existe;
* solicitar confirmação em mudanças importantes.

### Aplicação prática

O produto deve preferir uma sugestão honesta a uma resposta artificialmente precisa.

### Pergunta de validação

> A automação aumenta a confiança do usuário ou cria uma falsa sensação de certeza?

---

## 16. Acessibilidade desde a concepção

A acessibilidade não deverá ser tratada como ajuste posterior.

A experiência deverá considerar desde o início:

* contraste;
* tamanho de texto;
* navegação por teclado;
* leitores de tela;
* textos alternativos;
* foco visível;
* linguagem clara;
* estados não dependentes apenas de cor;
* componentes operáveis;
* conteúdo compreensível.

Informações apresentadas no mapa deverão possuir alternativa acessível em lista ou texto.

### Aplicação prática

Nenhuma informação essencial deverá depender exclusivamente de interação visual com o mapa.

### Pergunta de validação

> Um usuário com limitações visuais, motoras ou cognitivas consegue acessar a informação principal?

---

## 17. Responsividade como requisito básico

O RouteBook deverá funcionar adequadamente em diferentes tamanhos de tela.

O uso em dispositivos móveis será especialmente importante durante a viagem.

A experiência deverá considerar:

* celular;
* tablet;
* notebook;
* desktop.

Não será suficiente apenas reduzir a interface desktop.

Os fluxos deverão se adaptar ao contexto de uso.

No celular, deverão ser priorizados:

* consulta rápida;
* navegação;
* mapa;
* atividade atual;
* próxima atividade;
* alterações simples;
* informações essenciais.

No desktop, poderá haver maior espaço para:

* planejamento;
* comparação;
* edição de roteiro;
* múltiplos painéis;
* análise detalhada.

### Aplicação prática

A interface deve respeitar o contexto do dispositivo.

### Pergunta de validação

> Esta funcionalidade continua útil e compreensível em uma tela pequena?

---

# Parte III — Princípios de evolução

## 18. Independência de fornecedor

O RouteBook poderá depender de serviços externos para capacidades como:

* mapas;
* geocodificação;
* rotas;
* lugares;
* avaliações;
* fotografias;
* clima;
* inteligência artificial.

As regras centrais do produto não deverão ser acopladas diretamente a um fornecedor específico.

Por exemplo, o conceito de mapa pertence ao produto.

Google Maps, Mapbox ou OpenStreetMap são possíveis implementações.

A arquitetura deverá permitir substituição ou combinação de fornecedores quando isso for viável e justificável.

### Aplicação prática

Integrações externas devem ser encapsuladas por contratos internos claros.

### Pergunta de validação

> Esta decisão torna uma capacidade central dependente de um único fornecedor sem necessidade?

---

## 19. Documentação como fonte oficial

Decisões relevantes deverão ser registradas no repositório.

Conversas, mensagens e discussões poderão apoiar o processo, mas não deverão ser consideradas fonte oficial até serem documentadas.

A documentação deverá orientar:

* produto;
* experiência;
* domínio;
* inteligência;
* arquitetura;
* implementação;
* testes.

Mudanças relevantes no comportamento deverão atualizar os documentos relacionados.

### Aplicação prática

Código e documentação devem permanecer coerentes.

### Pergunta de validação

> Uma pessoa nova ou agente de IA consegue compreender esta decisão consultando o repositório?

---

## 20. Modularidade com propósito

A modularidade deverá ser utilizada para separar responsabilidades reais.

O RouteBook não deverá criar pacotes, serviços ou abstrações apenas para parecer escalável.

Cada módulo deverá possuir:

* responsabilidade clara;
* limites compreensíveis;
* motivo de existência;
* dependências controladas;
* valor para manutenção ou evolução.

Módulos genéricos sem identidade deverão ser evitados.

### Aplicação prática

Novas divisões devem surgir quando houver uma responsabilidade distinta e estável.

### Pergunta de validação

> Este módulo representa um limite real ou apenas fragmenta o projeto?

---

## 21. Dados com origem e qualidade conhecidas

O RouteBook deverá conhecer a origem dos dados utilizados.

Quando possível, deverá registrar:

* provedor;
* data de atualização;
* nível de confiança;
* limitações;
* estimativas;
* conflitos entre fontes.

O produto não deverá tratar toda informação externa como igualmente confiável.

Exemplos de dados sujeitos a variação:

* preço;
* horário de funcionamento;
* avaliação;
* tempo de deslocamento;
* disponibilidade;
* condições climáticas;
* situação de uma atração.

### Aplicação prática

Informações instáveis devem ser apresentadas com contexto e cautela.

### Pergunta de validação

> Sabemos de onde veio esta informação e quão confiável ela é?

---

## 22. Evolução guiada por validação

O RouteBook deverá evoluir a partir de problemas reais e evidências de uso.

A primeira viagem será utilizada como cenário inicial de validação.

Novas funcionalidades deverão ser priorizadas com base em:

* necessidade do usuário;
* frequência do problema;
* impacto na decisão;
* valor durante a viagem;
* complexidade;
* aprendizado esperado;
* aderência à visão.

O produto não deverá tentar atender todos os tipos de viagem desde o início.

### Aplicação prática

O MVP deve validar as capacidades centrais antes de expandir.

### Pergunta de validação

> Esta evolução responde a uma necessidade validada ou apenas a uma possibilidade imaginada?

---

## 23. Preparação para humanos e agentes de IA

O repositório deverá ser compreensível e utilizável tanto por pessoas quanto por agentes de inteligência artificial.

Isso exige:

* documentos claros;
* nomenclatura consistente;
* responsabilidades explícitas;
* critérios verificáveis;
* relações entre documentos;
* estrutura previsível;
* ausência de contradições;
* decisões registradas;
* linguagem objetiva.

A documentação não deverá depender de conhecimento implícito mantido apenas pelo criador do projeto.

### Aplicação prática

Uma tarefa deverá poder ser executada por uma pessoa ou agente com base no material oficial.

### Pergunta de validação

> O contexto necessário para implementar ou validar esta decisão está registrado?

---

## 24. Complexidade conquistada, não antecipada

O RouteBook deverá evitar criar infraestrutura, módulos ou funcionalidades para cenários ainda não demonstrados.

A estrutura deverá permitir evolução, mas não antecipar toda possibilidade futura.

Novas camadas de complexidade deverão ser adicionadas quando:

* existir problema concreto;
* houver responsabilidade distinta;
* a solução atual não for suficiente;
* o benefício justificar o custo;
* a decisão estiver documentada.

### Aplicação prática

Preparação para o futuro não deve significar construir o futuro inteiro agora.

### Pergunta de validação

> Esta complexidade resolve um problema atual ou apenas tenta prever todas as possibilidades?

---

# Parte IV — Aplicação dos princípios

## 25. Avaliação de novas funcionalidades

Toda proposta relevante deverá ser analisada com base nos princípios.

Uma funcionalidade deverá responder:

1. Qual problema real resolve?
2. Qual contexto considera?
3. Como mantém o usuário no controle?
4. Como será apresentada visualmente?
5. Como será explicada?
6. Qual impacto possui no planejamento?
7. Como funciona em dispositivos móveis?
8. Qual dado externo utiliza?
9. Qual dependência cria?
10. Qual complexidade adiciona?
11. Como será validada?
12. Quais documentos precisam ser atualizados?

Uma proposta que não responda adequadamente a essas perguntas deverá ser revisada antes de avançar.

---

## 26. Resolução de conflitos

Alguns princípios poderão entrar em tensão.

Exemplos:

* personalização versus simplicidade;
* automação versus controle;
* riqueza visual versus acessibilidade;
* modularidade versus velocidade;
* precisão versus disponibilidade de dados;
* roteiro otimizado versus preferência pessoal.

Nesses casos, a decisão deverá preservar primeiro os princípios essenciais.

### Exemplo: automação versus controle

O sistema pode sugerir uma reorganização automática, mas deve apresentar o impacto e permitir confirmação.

### Exemplo: visual versus acessibilidade

O mapa pode ser central, mas informações essenciais também devem estar disponíveis em formato textual ou listado.

### Exemplo: personalização versus simplicidade

O produto pode oferecer personalização avançada sem exigir que todos os usuários a configurem.

### Exemplo: otimização versus preferência

O sistema pode indicar que uma escolha aumenta o deslocamento, mas deve permitir que o usuário mantenha sua decisão.

---

## 27. Comportamentos incompatíveis com os princípios

Os seguintes comportamentos deverão ser considerados incompatíveis com a identidade do RouteBook:

* recomendar apenas por popularidade;
* gerar roteiros sem considerar deslocamentos;
* esconder os motivos de uma recomendação;
* alterar o planejamento sem informar o usuário;
* exigir personalização extensa antes do primeiro uso;
* depender exclusivamente do mapa para apresentar informação essencial;
* apresentar estimativas como certezas;
* criar funcionalidades sem problema validado;
* acoplar regras centrais a um fornecedor externo;
* duplicar responsabilidades entre módulos;
* manter decisões apenas em conversas;
* sobrecarregar a interface com opções simultâneas;
* impedir escolhas pessoais por não serem consideradas ideais;
* priorizar quantidade de recursos sobre clareza e utilidade.

---

## 28. Checklist de conformidade

Antes de aprovar uma decisão relevante, deverá ser verificado:

### Produto

* Resolve um problema real?
* Está alinhada à visão?
* Entrega utilidade prática?
* Considera o contexto?
* Mantém o usuário no controle?

### Experiência

* É simples de compreender?
* Utiliza representação visual adequada?
* Funciona em dispositivos móveis?
* É acessível?
* Mantém consistência entre lista, mapa e roteiro?

### Inteligência

* A recomendação pode ser explicada?
* Dados estimados estão identificados?
* O sistema evita falsa precisão?
* O usuário pode revisar e alterar?

### Arquitetura

* A responsabilidade está no módulo correto?
* Existe acoplamento desnecessário?
* O fornecedor externo está abstraído quando necessário?
* A complexidade é justificada?

### Documentação

* A decisão está registrada?
* Documentos relacionados foram atualizados?
* O comportamento pode ser compreendido por humanos e agentes de IA?
* Existem critérios verificáveis?

---

## 29. Indicadores de aderência

Os princípios deverão influenciar futuros indicadores do produto.

Possíveis sinais de aderência incluem:

* usuários conseguem criar uma viagem com poucos dados;
* recomendações apresentam justificativas;
* atividades podem ser alteradas sem reconstruir todo o roteiro;
* mapa e roteiro permanecem sincronizados;
* deslocamentos são considerados na organização;
* usuários conseguem entender o impacto de alterações;
* informações essenciais estão acessíveis fora do mapa;
* o produto funciona adequadamente em dispositivos móveis;
* novas funcionalidades possuem problema e objetivo documentados;
* integrações externas podem evoluir sem alterar o domínio central.

Esses indicadores não constituem métricas definitivas.

Eles representam sinais de que os princípios estão sendo refletidos no comportamento real do produto.

---

## 30. Responsabilidade de manutenção

Este documento deverá ser revisado quando:

* a visão do produto mudar;
* um princípio deixar de orientar decisões reais;
* novos conflitos recorrentes surgirem;
* um comportamento central não estiver coberto;
* a expansão do produto exigir nova diretriz permanente.

Alterações nos princípios deverão ser tratadas como mudanças relevantes.

Uma atualização não deverá ser realizada apenas para justificar uma funcionalidade específica.

Os princípios devem permanecer estáveis o suficiente para orientar diferentes fases do produto.

---

## 31. Declaração final

O RouteBook deverá ser construído como uma ferramenta que transforma informação em decisões de viagem compreensíveis, personalizadas e utilizáveis.

Seus princípios existem para garantir que o produto permaneça:

* contextual;
* visual;
* simples;
* explicável;
* adaptável;
* confiável;
* centrado no usuário.

Tecnologias, provedores e interfaces poderão mudar.

Esses princípios deverão preservar a identidade do RouteBook durante sua evolução.
