---

id: RB-FND-003

title: Escopo do Produto
description: Define os limites funcionais e estratégicos do RouteBook, incluindo capacidades centrais, escopo inicial, evoluções futuras e itens fora de escopo.

document_type: foundation
owner: Product

status: Draft
version: "0.1.0"

created: "2026-07-15"
last_updated: null

authors:

* RouteBook Team

tags:

* foundation
* product-scope
* boundaries
* mvp
* roadmap

related_documents:

* RB-FND-001
* RB-FND-002

prerequisites:

* RB-FND-001
* RB-FND-002

next_documents:

* RB-FND-004
* RB-PRD-001
* RB-PRD-002

ai_context:
priority: high
index: true
-----------

# RouteBook — Escopo do Produto

## 1. Propósito deste documento

Este documento define os limites do RouteBook.

Seu objetivo é esclarecer:

* quais problemas pertencem ao produto;
* quais capacidades fazem parte de sua identidade;
* o que deverá ser priorizado inicialmente;
* o que poderá ser considerado em fases futuras;
* o que está explicitamente fora do escopo atual;
* quais critérios devem ser utilizados para avaliar novas funcionalidades;
* quais limites protegem o produto contra expansão descontrolada.

A Visão do Produto define o futuro desejado.

Os Princípios do Produto definem como decisões devem ser tomadas.

O Escopo do Produto define até onde o RouteBook pretende ir em cada fase de sua evolução.

Este documento não substitui o detalhamento do MVP, os requisitos funcionais, as regras de negócio ou o roadmap.

Ele estabelece as fronteiras necessárias para que esses documentos sejam produzidos de forma consistente.

---

## 2. Definição resumida do escopo

O RouteBook é uma aplicação web de apoio ao planejamento e à execução de viagens de lazer.

O produto deverá ajudar o usuário a:

* criar uma viagem;
* informar seu contexto;
* descobrir lugares;
* compreender distâncias e deslocamentos;
* comparar opções;
* salvar locais de interesse;
* montar um roteiro;
* visualizar atividades em lista e mapa;
* personalizar o planejamento;
* adaptar escolhas durante a viagem.

O RouteBook deverá atuar como uma camada de organização e decisão entre o viajante e as diferentes fontes de informação disponíveis.

O produto não deverá ser tratado inicialmente como:

* agência de viagens;
* plataforma de reservas;
* rede social;
* marketplace;
* serviço completo de navegação;
* plataforma de venda de passagens;
* sistema de gestão para empresas de turismo.

---

## 3. Problemas que pertencem ao RouteBook

Os problemas abaixo fazem parte do escopo do produto.

### 3.1 Fragmentação de informações

O viajante consulta diferentes fontes para encontrar:

* lugares;
* avaliações;
* fotografias;
* localização;
* preços;
* horários;
* rotas;
* sugestões de roteiro.

O RouteBook deverá reunir e organizar essas informações em uma experiência coerente.

### 3.2 Excesso de opções

Muitos destinos oferecem grande quantidade de atrações, restaurantes e experiências.

O RouteBook deverá ajudar o usuário a reduzir, filtrar, ordenar e comparar essas opções.

### 3.3 Falta de contexto

Listas genéricas não consideram o perfil real da viagem.

O RouteBook deverá considerar progressivamente:

* localização;
* período;
* orçamento;
* interesses;
* composição do grupo;
* transporte;
* ritmo;
* restrições;
* tempo disponível.

### 3.4 Dificuldade de organização

Mesmo após escolher lugares, o usuário ainda precisa distribuí-los pelos dias.

O RouteBook deverá ajudar a transformar escolhas em um roteiro utilizável.

### 3.5 Deslocamentos mal planejados

Atividades podem parecer compatíveis em uma lista, mas exigir deslocamentos inviáveis.

O RouteBook deverá incorporar distância, localização e tempo de deslocamento ao planejamento.

### 3.6 Rigidez do roteiro

Planos mudam antes e durante a viagem.

O RouteBook deverá permitir ajustes locais sem obrigar o usuário a reconstruir todo o roteiro.

### 3.7 Falta de transparência nas recomendações

O usuário pode receber sugestões sem compreender por que elas foram apresentadas.

O RouteBook deverá explicar os principais fatores das recomendações relevantes.

---

## 4. Capacidades centrais do produto

As capacidades centrais definem o núcleo permanente do RouteBook.

Elas poderão evoluir em profundidade, mas não deverão perder sua função.

### 4.1 Gestão de viagem

O usuário deverá poder criar e manter uma viagem com informações como:

* destino;
* datas;
* hospedagem;
* viajantes;
* orçamento;
* transporte;
* interesses;
* restrições;
* ritmo desejado.

### 4.2 Descoberta de lugares

O produto deverá permitir a descoberta de:

* praias;
* restaurantes;
* bares;
* baladas;
* atrações;
* passeios;
* experiências culturais;
* atividades ao ar livre;
* lugares familiares;
* opções econômicas.

### 4.3 Visualização geográfica

O produto deverá apresentar lugares e atividades em mapa.

Essa capacidade deverá incluir, progressivamente:

* marcadores;
* localização da hospedagem;
* distâncias;
* agrupamentos;
* rotas;
* atividades por dia;
* pontos próximos.

### 4.4 Comparação de opções

O usuário deverá conseguir avaliar lugares considerando informações relevantes, como:

* distância;
* tempo de deslocamento;
* faixa de preço;
* avaliação;
* categoria;
* duração;
* compatibilidade com preferências;
* custo-benefício.

### 4.5 Lugares salvos

O usuário deverá poder guardar locais de interesse sem incluí-los imediatamente no roteiro.

### 4.6 Construção de roteiro

O produto deverá permitir organizar atividades por:

* dia;
* período;
* horário;
* região;
* duração;
* ordem de execução.

### 4.7 Personalização do planejamento

O usuário deverá poder modificar:

* atividades;
* horários;
* sequência;
* orçamento;
* intensidade;
* períodos livres;
* prioridades.

### 4.8 Recomendações contextualizadas

O produto deverá utilizar o contexto da viagem para selecionar, ordenar ou justificar opções.

### 4.9 Adaptação do roteiro

O produto deverá permitir substituições e reorganizações quando houver mudanças.

### 4.10 Explicação das recomendações

O usuário deverá compreender os principais motivos por trás das sugestões relevantes.

---

## 5. Escopo da experiência inicial

A primeira experiência deverá concentrar-se em uma única viagem de lazer por vez.

O usuário deverá conseguir:

1. Criar uma viagem.
2. Informar o destino.
3. Informar as datas.
4. Cadastrar a hospedagem.
5. Definir preferências básicas.
6. Informar uma faixa de orçamento.
7. Escolher o meio de transporte principal.
8. Descobrir lugares.
9. Visualizar os lugares em mapa.
10. Consultar informações básicas.
11. Salvar locais.
12. Adicionar locais ao roteiro.
13. Organizar atividades por dia.
14. Reordenar o planejamento.
15. Visualizar um resumo da viagem.
16. Abrir rotas em um serviço externo quando necessário.

A experiência inicial não precisa resolver todos os cenários possíveis.

Ela deverá demonstrar que o RouteBook consegue transformar contexto, lugares e localização em um planejamento útil.

---

## 6. Escopo funcional inicial

As funcionalidades abaixo fazem parte do escopo inicial esperado.

### 6.1 Criação da viagem

O usuário deverá poder informar:

* nome da viagem;
* destino;
* data de início;
* data de término;
* hospedagem;
* quantidade de viajantes.

### 6.2 Preferências básicas

O usuário deverá poder selecionar interesses como:

* praias;
* gastronomia;
* bares;
* vida noturna;
* natureza;
* cultura;
* passeios;
* descanso;
* experiências econômicas.

### 6.3 Orçamento

O usuário deverá poder indicar uma faixa de orçamento da viagem ou orçamento diário.

O produto não precisará realizar controle financeiro completo no escopo inicial.

### 6.4 Meio de transporte

O usuário deverá poder informar o transporte predominante, como:

* carro;
* transporte por aplicativo;
* transporte público;
* caminhada;
* combinação de meios.

### 6.5 Exploração de lugares

A interface deverá permitir:

* visualizar lugares;
* filtrar por categoria;
* abrir detalhes;
* salvar;
* adicionar ao roteiro;
* localizar no mapa.

### 6.6 Informações do lugar

Cada lugar poderá apresentar, conforme disponibilidade:

* nome;
* categoria;
* endereço;
* localização;
* fotografias;
* faixa de preço;
* avaliação;
* descrição resumida;
* distância;
* tempo estimado de deslocamento;
* duração sugerida;
* horário de funcionamento;
* motivo da recomendação.

### 6.7 Mapa

O mapa deverá exibir:

* hospedagem;
* lugares descobertos;
* lugares salvos;
* atividades planejadas;
* marcadores por categoria.

### 6.8 Roteiro diário

O usuário deverá conseguir:

* criar dias;
* adicionar atividades;
* remover atividades;
* alterar ordem;
* definir horário aproximado;
* visualizar deslocamentos;
* manter períodos livres.

### 6.9 Recomendações iniciais

O sistema poderá recomendar lugares com base em:

* categoria;
* distância;
* orçamento;
* interesses;
* avaliação;
* proximidade de outras atividades.

### 6.10 Resumo da viagem

O usuário deverá conseguir visualizar:

* dias;
* atividades;
* lugares salvos;
* estimativa geral de deslocamento;
* distribuição geográfica.

---

## 7. Escopo do MVP

O MVP deverá validar as capacidades essenciais do RouteBook.

Ele não deverá ser definido pela quantidade de funcionalidades, mas pela capacidade de responder às seguintes perguntas:

* O usuário consegue criar uma viagem?
* O produto consegue apresentar lugares relevantes?
* O mapa melhora a compreensão?
* O usuário consegue salvar e organizar escolhas?
* O roteiro considera localização e deslocamento?
* A personalização altera a relevância das recomendações?
* O usuário consegue modificar o planejamento?
* A experiência entrega valor antes da viagem?

O MVP deverá priorizar:

1. criação de viagem;
2. cadastro de hospedagem;
3. preferências;
4. descoberta de lugares;
5. mapa;
6. distância e deslocamento;
7. lugares salvos;
8. roteiro editável;
9. recomendações básicas;
10. justificativas simples.

O detalhamento definitivo será feito no documento específico de definição do MVP.

---

## 8. Cenário inicial de validação

A primeira validação será orientada por uma viagem real entre **22 e 29 de julho de 2026**.

Esse cenário deverá permitir avaliar:

* qualidade dos lugares apresentados;
* utilidade do mapa;
* distância em relação à hospedagem;
* organização dos dias;
* restaurantes próximos às atividades;
* opções de praia;
* vida noturna;
* custo-benefício;
* facilidade de alteração do roteiro.

A viagem real será utilizada como contexto de validação, não como limitação arquitetural ou funcional.

O produto não deverá conter regras fixas exclusivas para esse destino ou período.

---

## 9. Tipos de viagem no escopo inicial

O RouteBook deverá priorizar inicialmente:

* viagens de lazer;
* viagens com duração definida;
* viagens com hospedagem principal;
* viagens para um destino ou região principal;
* viagens individuais ou em pequenos grupos;
* planejamento antes e durante a viagem.

Viagens com múltiplos destinos poderão ser consideradas posteriormente.

---

## 10. Tipos de usuário no escopo inicial

O escopo inicial deverá considerar:

* viajante individual;
* casal;
* família;
* grupo de amigos;
* organizador principal da viagem.

No primeiro momento, o produto poderá assumir que uma pessoa é responsável por montar o roteiro.

Colaboração simultânea entre vários participantes não será obrigatória no MVP.

---

## 11. Destinos no escopo

O produto deverá ser concebido para atender diferentes destinos turísticos.

Entretanto, a disponibilidade e qualidade dos dados poderão variar por região.

O escopo inicial poderá priorizar destinos com:

* cobertura adequada de mapas;
* estabelecimentos cadastrados;
* dados de localização;
* informações públicas suficientes;
* volume relevante de atrações.

O produto não deverá prometer cobertura uniforme em todos os destinos desde a primeira versão.

---

## 12. Informações externas no escopo

O RouteBook poderá consumir dados externos relacionados a:

* lugares;
* coordenadas;
* endereços;
* rotas;
* distâncias;
* tempos de deslocamento;
* horários;
* avaliações;
* fotografias;
* categorias.

Esses dados poderão vir de provedores como:

* serviços de mapas;
* APIs de lugares;
* bases abertas;
* fontes editoriais;
* dados cadastrados internamente.

A escolha técnica dos fornecedores não faz parte deste documento.

---

## 13. Inteligência no escopo inicial

A inteligência inicial do produto poderá combinar:

* regras;
* filtros;
* pontuação;
* ordenação;
* dados geográficos;
* preferências do usuário;
* geração assistida por inteligência artificial.

O produto não dependerá de inteligência artificial generativa para todas as decisões.

A IA poderá apoiar:

* resumo de lugares;
* explicação de recomendações;
* montagem inicial do roteiro;
* sugestões de substituição;
* interpretação de preferências.

Regras determinísticas deverão continuar sendo utilizadas quando forem mais confiáveis.

---

## 14. Capacidades previstas para evolução futura

As capacidades abaixo são compatíveis com a visão, mas não precisam fazer parte do MVP.

### 14.1 Replanejamento contextual

* alterações por chuva;
* atraso;
* lotação;
* fechamento inesperado;
* cansaço;
* mudança de orçamento.

### 14.2 Clima

* previsão;
* alertas;
* recomendações adequadas ao tempo;
* alternativas para chuva.

### 14.3 Colaboração

* convite de participantes;
* votação;
* comentários;
* preferências individuais;
* decisões em grupo.

### 14.4 Controle financeiro ampliado

* orçamento por categoria;
* custo planejado;
* custo realizado;
* divisão de despesas;
* alertas de limite.

### 14.5 Múltiplos destinos

* roteiros entre cidades;
* viagens em circuito;
* troca de hospedagem;
* deslocamentos intermunicipais.

### 14.6 Reservas

* redirecionamento para plataformas externas;
* integração com reservas;
* disponibilidade;
* confirmação de atividades.

### 14.7 Uso offline

* roteiro disponível sem internet;
* mapas parciais;
* dados essenciais;
* sincronização posterior.

### 14.8 Notificações

* próxima atividade;
* tempo de saída;
* mudanças relevantes;
* lembretes;
* alertas de funcionamento.

### 14.9 Preferências aprendidas

* histórico;
* padrões de escolha;
* feedback;
* recomendações refinadas.

### 14.10 Conteúdo editorial

* guias;
* coleções;
* recomendações temáticas;
* roteiros públicos;
* experiências selecionadas.

---

## 15. Fora do escopo inicial

Os itens abaixo não fazem parte do escopo inicial.

### 15.1 Venda direta de passagens

O RouteBook não deverá inicialmente:

* vender passagens aéreas;
* emitir bilhetes;
* gerenciar check-in;
* remarcar voos;
* operar como agência aérea.

### 15.2 Venda direta de hospedagem

O produto não deverá inicialmente:

* vender diárias;
* processar reservas;
* administrar inventário de quartos;
* gerenciar cancelamentos.

### 15.3 Processamento de pagamentos

O RouteBook não deverá processar pagamentos no MVP.

### 15.4 Navegação curva a curva

O produto não deverá substituir aplicativos especializados de navegação.

Poderá apresentar rotas e abrir um provedor externo.

### 15.5 Gestão completa de despesas

O MVP não deverá funcionar como aplicativo financeiro completo.

### 15.6 Rede social

O RouteBook não deverá inicialmente oferecer:

* feed;
* seguidores;
* mensagens;
* publicação pública;
* reputação social;
* comunidades.

### 15.7 Marketplace de turismo

O produto não deverá inicialmente conectar diretamente fornecedores e viajantes para transações.

### 15.8 Gestão empresarial

O RouteBook não deverá funcionar inicialmente como:

* sistema para agências;
* sistema para hotéis;
* sistema para restaurantes;
* painel para operadores turísticos;
* CRM de turismo.

### 15.9 Conteúdo de emergência

O produto não deverá substituir:

* autoridades locais;
* serviços de emergência;
* fontes oficiais;
* alertas governamentais.

### 15.10 Garantia de informações externas

O produto não deverá garantir que:

* preços estejam sempre atualizados;
* horários estejam corretos;
* estabelecimentos estejam abertos;
* rotas estejam livres;
* avaliações representem todos os usuários;
* lugares estejam disponíveis.

---

## 16. Funcionalidades que exigem avaliação futura

Algumas funcionalidades podem ser compatíveis, mas não devem ser assumidas automaticamente como parte do produto.

Entre elas:

* compra de ingressos;
* reservas internas;
* promoções;
* cupons;
* monetização por comissão;
* conteúdo patrocinado;
* avaliações próprias;
* publicação de roteiros;
* compartilhamento público;
* turismo corporativo;
* viagens de negócios;
* gestão de documentos;
* seguros;
* transporte intermunicipal;
* aluguel de veículos;
* programas de fidelidade;
* conversão de moedas;
* tradução;
* concierge em tempo real.

Cada uma deverá ser avaliada com base na visão, nos princípios e no valor real para o usuário.

---

## 17. Limites de responsabilidade

O RouteBook deverá apresentar informações e recomendações como apoio à decisão.

O produto não deverá assumir responsabilidade por:

* segurança física do usuário;
* qualidade final de um estabelecimento;
* cancelamentos;
* acidentes;
* condições ambientais;
* disponibilidade;
* alterações de preço;
* restrições legais;
* decisões pessoais do viajante.

Sempre que necessário, o produto deverá informar que dados podem mudar e que fontes oficiais devem ser consultadas.

---

## 18. Limites da recomendação

Uma recomendação do RouteBook não deverá ser tratada como verdade absoluta.

As recomendações serão condicionadas por:

* qualidade dos dados;
* preferências informadas;
* critérios utilizados;
* disponibilidade de informações;
* contexto conhecido.

O usuário deverá poder discordar, alterar ou ignorar qualquer recomendação.

---

## 19. Limites da personalização

O RouteBook deverá utilizar apenas informações necessárias para melhorar a experiência.

A personalização não deverá exigir coleta excessiva de dados.

O produto deverá evitar solicitar informações pessoais sem relação clara com a viagem.

Questões de privacidade, consentimento e retenção serão detalhadas posteriormente.

---

## 20. Limites da automação

A automação não deverá:

* alterar decisões importantes sem confirmação;
* esconder impactos;
* bloquear escolhas pessoais;
* gerar falsa precisão;
* apresentar estimativas como garantias;
* reconstruir todo o roteiro sem necessidade.

Automação deverá reduzir esforço e permanecer reversível quando possível.

---

## 21. Limites de arquitetura

A arquitetura deverá suportar o escopo atual sem antecipar todos os cenários futuros.

O produto deverá evitar:

* microsserviços prematuros;
* abstrações sem uso;
* pacotes sem responsabilidade clara;
* múltiplos provedores sem necessidade;
* infraestrutura criada apenas para escala hipotética;
* excesso de configurações.

A estrutura deverá permitir evolução, mas permanecer proporcional ao estágio do produto.

---

## 22. Critérios para inclusão de novas funcionalidades

Uma funcionalidade poderá ser considerada parte do RouteBook quando:

1. Resolver um problema real de planejamento ou execução de viagem.
2. Estiver alinhada à visão.
3. Respeitar os princípios.
4. Ajudar o usuário a descobrir, compreender, organizar ou adaptar.
5. Considerar contexto.
6. Preservar controle do usuário.
7. Possuir valor superior à complexidade adicionada.
8. Não duplicar capacidade já existente.
9. Ser viável para diferentes destinos.
10. Poder ser documentada e validada.

---

## 23. Critérios para exclusão ou adiamento

Uma funcionalidade deverá ser excluída ou adiada quando:

* não resolver um problema relevante;
* depender de cenários não validados;
* criar complexidade desproporcional;
* desviar o produto de seu propósito;
* exigir operação incompatível com o projeto;
* depender de dados não confiáveis;
* gerar risco elevado;
* acoplar o domínio a um fornecedor;
* existir apenas para imitar concorrentes;
* não possuir critério de sucesso.

---

## 24. Escopo por fase

### 24.1 Fundação

Definir:

* visão;
* princípios;
* escopo;
* glossário.

### 24.2 Produto

Definir:

* visão geral;
* personas;
* jornadas;
* requisitos;
* regras;
* MVP.

### 24.3 Experiência

Definir:

* arquitetura da informação;
* navegação;
* fluxos;
* telas;
* acessibilidade;
* responsividade.

### 24.4 Domínio

Definir:

* viagem;
* viajante;
* lugar;
* roteiro;
* atividade;
* localização;
* orçamento;
* preferência.

### 24.5 Inteligência

Definir:

* recomendação;
* pontuação;
* custo-benefício;
* geração de roteiro;
* explicações;
* replanejamento.

### 24.6 Arquitetura

Definir:

* aplicação;
* dados;
* integrações;
* mapas;
* IA;
* segurança;
* testes;
* implantação.

---

## 25. Indicadores de controle de escopo

O projeto deverá observar sinais de expansão descontrolada.

Exemplos:

* criação de muitas funcionalidades antes do MVP;
* documentos duplicados;
* pacotes sem uso;
* integrações prematuras;
* tentativas de atender todos os tipos de viagem;
* inclusão de reservas e pagamentos cedo demais;
* múltiplos fornecedores para a mesma capacidade;
* complexidade de interface sem validação;
* automação sem necessidade;
* roadmap desconectado de problemas reais.

Quando esses sinais surgirem, o escopo deverá ser revisado.

---

## 26. Relação com o roadmap

O roadmap deverá respeitar as categorias:

* núcleo;
* MVP;
* pós-MVP;
* exploração;
* fora de escopo.

Nem toda capacidade compatível com a visão deverá ser priorizada.

Prioridade dependerá de:

* valor;
* risco;
* esforço;
* dependência;
* aprendizado;
* aderência ao estágio atual.

---

## 27. Critérios de conclusão do escopo inicial

O escopo inicial poderá ser considerado funcionalmente atendido quando o usuário conseguir:

* criar uma viagem;
* informar contexto básico;
* descobrir lugares relevantes;
* visualizar mapa;
* entender distâncias;
* salvar opções;
* montar um roteiro;
* editar o planejamento;
* visualizar atividades por dia;
* compreender recomendações básicas.

Esse marco não representará a conclusão do produto.

Representará a validação de sua proposta central.

---

## 28. Manutenção deste documento

Este documento deverá ser revisado quando:

* a visão mudar;
* o MVP for redefinido;
* novas capacidades centrais forem reconhecidas;
* funcionalidades fora de escopo forem incorporadas;
* limites deixarem de refletir a realidade;
* o produto passar a atender novos tipos de viagem;
* novas responsabilidades operacionais surgirem.

Alterações significativas deverão ser registradas no histórico de versões.

---

## 29. Declaração final

O RouteBook deverá permanecer focado em ajudar viajantes a transformar informações, lugares e preferências em decisões e roteiros utilizáveis.

Seu escopo central está na interseção entre:

* descoberta;
* contexto;
* mapa;
* personalização;
* organização;
* adaptação.

O produto deverá crescer somente quando novas capacidades reforçarem essa interseção.

O RouteBook não precisa resolver todos os problemas de viagem.

Ele precisa resolver com clareza os problemas que pertencem à sua identidade.
