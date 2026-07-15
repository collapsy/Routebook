---

id: RB-PRD-003

title: Personas
description: Define os perfis prioritários de usuários do RouteBook, suas necessidades, comportamentos, objetivos, dificuldades e implicações para o produto.

document_type: product
owner: Product

status: Draft
version: "0.1.0"

created: "2026-07-15"
last_updated: null

authors:

- RouteBook Team

tags:

- product
- personas
- users
- travel-planning
- user-research
- personalization

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-001
- RB-PRD-002

prerequisites:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-001
- RB-PRD-002

next_documents:

- RB-PRD-004
- RB-PRD-005
- RB-PRD-006
- RB-UX-001

ai_context:
priority: high
index: true
---

# RouteBook — Personas

## 1. Propósito deste documento

Este documento define as personas prioritárias do RouteBook.

Seu objetivo é representar grupos de usuários com necessidades, comportamentos, dificuldades e expectativas semelhantes em relação ao planejamento e à execução de viagens.

As personas deverão orientar:

* decisões de produto;
* priorização do MVP;
* arquitetura da informação;
* fluxos de usuário;
* linguagem da interface;
* personalização;
* recomendações;
* critérios de acessibilidade;
* requisitos funcionais;
* testes de usabilidade.

As personas descritas aqui são modelos de comportamento.

Elas não representam indivíduos específicos e não devem ser tratadas como estereótipos rígidos.

Uma mesma pessoa poderá apresentar características de mais de uma persona, dependendo da Viagem e do contexto.

---

## 2. Princípios para utilização das personas

As personas deverão ser utilizadas com as seguintes regras:

1. Personas representam padrões de necessidade, não categorias permanentes de pessoas.
2. Nenhuma funcionalidade deverá ser criada apenas para atender uma característica superficial.
3. Necessidades prioritárias devem ser derivadas de problemas reais de planejamento.
4. As personas devem influenciar decisões, mas não substituir pesquisa com usuários.
5. Informações demográficas só devem ser utilizadas quando afetarem o comportamento do produto.
6. O RouteBook deverá evitar experiências que dependam de conhecimento técnico avançado.
7. Personas poderão ser revisadas após testes e uso real.
8. As decisões do MVP deverão priorizar as personas principais.

---

## 3. Estrutura das personas

Cada persona será descrita por:

* nome representativo;
* papel no RouteBook;
* contexto;
* objetivo principal;
* comportamentos;
* necessidades;
* dificuldades;
* expectativas;
* receios;
* critérios de sucesso;
* implicações para o produto.

Os nomes são fictícios e servem apenas para facilitar a comunicação.

---

# Parte I — Visão geral das personas

## 4. Personas prioritárias

O RouteBook deverá considerar inicialmente quatro personas principais.

### Persona primária

**Planejador Prático**

Representa a pessoa responsável por organizar a Viagem e que deseja centralizar informações, entender distâncias e montar um Roteiro editável.

### Persona secundária

**Explorador Flexível**

Representa a pessoa que prefere decidir parte da programação durante a Viagem e valoriza sugestões rápidas, proximidade e adaptação.

### Persona secundária

**Planejador Econômico**

Representa a pessoa que prioriza controle de custos, custo-benefício e redução de gastos desnecessários.

### Persona complementar

**Organizador de Grupo**

Representa a pessoa que precisa considerar preferências, restrições e ritmos de várias pessoas.

---

## 5. Relação com o MVP

O MVP deverá atender prioritariamente:

1. Planejador Prático;
2. Planejador Econômico;
3. Explorador Flexível.

O Organizador de Grupo também deverá ser considerado, mas recursos avançados de colaboração não fazem parte do MVP.

No MVP, o grupo poderá ser representado por informações inseridas por um único Organizador da Viagem.

---

# Parte II — Persona primária

## 6. Persona 1 — Planejador Prático

### Nome representativo

Rafael, 32 anos.

### Papel

Organizador principal da Viagem.

### Contexto

Rafael costuma organizar viagens pessoais, em casal ou com amigos.

Ele pesquisa em mecanismos de busca, redes sociais, vídeos, plataformas de avaliação e mapas.

Normalmente encontra muitos Lugares interessantes, mas possui dificuldade para transformar essas informações em um plano coerente.

Ele deseja planejar antes da Viagem, mas não quer construir uma planilha complexa.

Também não confia completamente em roteiros prontos e genéricos.

---

## 7. Objetivo principal

Criar um Roteiro claro, visual e editável, com Lugares relevantes distribuídos pelos dias da Viagem.

---

## 8. Objetivos secundários

Rafael deseja:

* entender onde os Lugares estão;
* calcular distâncias a partir da Hospedagem;
* evitar deslocamentos desnecessários;
* descobrir restaurantes próximos às atividades;
* comparar opções;
* encontrar Lugares com bom custo-benefício;
* manter Períodos livres;
* alterar o Roteiro facilmente;
* consultar o planejamento no celular.

---

## 9. Comportamentos

Rafael geralmente:

* começa a pesquisar dias ou semanas antes da Viagem;
* abre várias abas no navegador;
* salva vídeos e publicações;
* consulta mapas;
* anota nomes de Lugares;
* envia opções para o grupo;
* monta uma sequência preliminar;
* altera o planejamento várias vezes;
* prefere decidir alguns detalhes mais tarde.

---

## 10. Necessidades

O Planejador Prático precisa:

* centralizar Lugares;
* visualizar lista e mapa;
* conhecer a distância da Hospedagem;
* salvar opções sem compromisso;
* adicionar Lugares ao Roteiro;
* mover Atividades entre dias;
* entender conflitos;
* visualizar um resumo por dia;
* acessar rotas externas;
* compreender por que uma sugestão foi apresentada.

---

## 11. Dificuldades

Rafael enfrenta:

* informação fragmentada;
* excesso de opções;
* roteiros genéricos;
* dificuldade de estimar deslocamentos;
* incerteza sobre duração das atividades;
* dificuldade para combinar praias, restaurantes e vida noturna;
* planejamento excessivamente manual;
* perda de informações salvas em diferentes plataformas.

---

## 12. Frustrações

As principais frustrações são:

* perceber que dois Lugares interessantes ficam distantes;
* descobrir que um dia foi planejado de forma inviável;
* não lembrar onde salvou uma recomendação;
* depender de planilha;
* perder tempo recalculando o Roteiro;
* receber sugestões sem justificativa;
* precisar alternar entre vários aplicativos.

---

## 13. Expectativas

Rafael espera que o RouteBook:

* seja simples de começar;
* apresente valor com poucas informações;
* mostre um mapa útil;
* permita edição;
* não imponha um Roteiro;
* destaque opções próximas;
* ajude a organizar os dias;
* seja visual;
* funcione bem no celular.

---

## 14. Receios

Rafael pode desconfiar do produto quando:

* as recomendações parecem genéricas;
* os dados parecem desatualizados;
* o sistema altera o Roteiro sozinho;
* a interface possui muitas configurações;
* a aplicação apresenta estimativas como certezas;
* o mapa e o Roteiro mostram informações conflitantes.

---

## 15. Critérios de sucesso

A experiência será bem-sucedida para Rafael quando ele conseguir:

* criar uma Viagem rapidamente;
* encontrar Lugares relevantes;
* visualizar onde estão;
* salvar suas opções;
* distribuir Atividades;
* reorganizar o planejamento;
* reduzir consultas externas;
* consultar o Roteiro durante a Viagem.

---

## 16. Frase representativa

> Quero organizar a viagem sem precisar montar uma planilha e sem ficar alternando entre vários aplicativos.

---

## 17. Implicações para o produto

Para atender essa persona, o RouteBook deverá priorizar:

* criação rápida de Viagem;
* Hospedagem como referência;
* lista e mapa integrados;
* Lugares salvos;
* Roteiro por dia;
* reordenação simples;
* distâncias visíveis;
* Justificativas;
* interface responsiva;
* estados claros.

---

# Parte III — Persona secundária

## 18. Persona 2 — Explorador Flexível

### Nome representativo

Marina, 29 anos.

### Papel

Viajante que participa do planejamento, mas prefere manter liberdade durante a Viagem.

### Contexto

Marina gosta de viajar sem preencher todos os horários.

Ela pesquisa algumas atrações principais, mas decide refeições, bares e atividades menores conforme o dia.

Ela valoriza experiências espontâneas, mas não quer perder tempo procurando opções quando já está no Destino.

---

## 19. Objetivo principal

Receber sugestões relevantes no momento certo, sem precisar seguir um Roteiro rígido.

---

## 20. Objetivos secundários

Marina deseja:

* encontrar Lugares próximos;
* saber o que fazer nas próximas horas;
* descobrir alternativas;
* localizar restaurantes próximos;
* substituir atividades;
* consultar rapidamente distância e rota;
* manter períodos sem planejamento;
* adaptar o dia conforme disposição ou clima.

---

## 21. Comportamentos

Marina geralmente:

* planeja apenas os Lugares considerados indispensáveis;
* deixa refeições e atividades noturnas abertas;
* usa o celular durante a Viagem;
* consulta mapas frequentemente;
* prefere sugestões curtas;
* muda de ideia com facilidade;
* valoriza recomendações baseadas na localização.

---

## 22. Necessidades

O Explorador Flexível precisa:

* visualizar a Atividade atual e a próxima;
* encontrar Lugares próximos;
* aplicar filtros rápidos;
* consultar alternativas;
* entender tempo de deslocamento;
* adicionar uma opção ao dia;
* remover ou substituir uma atividade;
* manter o Roteiro parcialmente vazio.

---

## 23. Dificuldades

Marina enfrenta:

* excesso de resultados em buscas;
* recomendações sem contexto;
* perda de tempo decidindo onde comer;
* dificuldade para avaliar distância;
* pouca flexibilidade em roteiros prontos;
* interfaces complexas durante o uso móvel.

---

## 24. Frustrações

As principais frustrações são:

* precisar preencher formulários longos;
* receber um Roteiro totalmente fechado;
* ter que reconstruir o dia depois de uma mudança;
* visualizar informações demais no celular;
* não encontrar alternativas próximas;
* receber sugestões incompatíveis com o horário.

---

## 25. Expectativas

Marina espera que o RouteBook:

* seja rápido;
* funcione bem no celular;
* permita decidir depois;
* mostre opções próximas;
* não obrigue planejamento completo;
* facilite substituições;
* apresente poucas opções relevantes;
* mantenha Períodos livres.

---

## 26. Receios

Marina pode rejeitar o produto quando:

* exige planejamento excessivo;
* possui muitas etapas;
* tenta preencher todos os horários;
* apresenta listas extensas;
* depende de uso em desktop;
* dificulta mudanças.

---

## 27. Critérios de sucesso

A experiência será bem-sucedida para Marina quando ela conseguir:

* consultar rapidamente o dia;
* encontrar uma opção próxima;
* adicionar uma atividade sem esforço;
* remover ou trocar um plano;
* abrir uma rota;
* manter liberdade durante a Viagem.

---

## 28. Frase representativa

> Quero ter boas opções por perto, mas não quero decidir tudo antes da viagem.

---

## 29. Implicações para o produto

Para atender essa persona, o RouteBook deverá considerar:

* personalização progressiva;
* Períodos livres;
* descoberta por proximidade;
* filtros rápidos;
* experiência móvel;
* replanejamento local;
* acesso rápido à rota;
* resumo do dia;
* alternativas contextuais.

---

# Parte IV — Persona secundária

## 30. Persona 3 — Planejador Econômico

### Nome representativo

Lucas, 35 anos.

### Papel

Organizador ou Viajante com forte preocupação com orçamento.

### Contexto

Lucas deseja aproveitar a Viagem sem comprometer seu planejamento financeiro.

Ele compara preços, procura opções gratuitas ou econômicas e tenta reduzir deslocamentos pagos.

Não busca necessariamente a opção mais barata, mas deseja entender se o custo é justificável.

---

## 31. Objetivo principal

Montar uma Viagem compatível com seu orçamento, priorizando opções de bom custo-benefício.

---

## 32. Objetivos secundários

Lucas deseja:

* identificar Lugares econômicos;
* comparar faixas de preço;
* encontrar atrações gratuitas;
* reduzir deslocamentos;
* equilibrar dias econômicos e experiências especiais;
* evitar despesas inesperadas;
* localizar restaurantes de preço moderado;
* entender o impacto financeiro das escolhas.

---

## 33. Comportamentos

Lucas geralmente:

* define um orçamento antes da Viagem;
* pesquisa preços;
* verifica cardápios;
* compara transporte;
* procura avaliações relacionadas ao custo-benefício;
* aceita pagar mais por experiências prioritárias;
* evita atividades caras em sequência.

---

## 34. Necessidades

O Planejador Econômico precisa:

* informar uma referência de orçamento;
* visualizar Faixa de preço;
* filtrar opções econômicas;
* comparar alternativas;
* identificar custo-benefício;
* combinar atividades próximas;
* entender quando um dado de preço é estimado;
* manter controle sobre experiências mais caras.

---

## 35. Dificuldades

Lucas enfrenta:

* preços desatualizados;
* falta de transparência;
* classificações de preço inconsistentes;
* custos de deslocamento ignorados;
* atrações gratuitas pouco destacadas;
* roteiros que concentram gastos.

---

## 36. Frustrações

As principais frustrações são:

* descobrir o preço somente ao chegar;
* receber recomendação incompatível com o orçamento;
* pagar mais em deslocamento que na atividade;
* confundir popularidade com custo-benefício;
* não conseguir comparar opções próximas.

---

## 37. Expectativas

Lucas espera que o RouteBook:

* apresente faixas de preço;
* diferencie valores conhecidos de estimados;
* permita filtrar;
* recomende alternativas;
* considere deslocamentos;
* explique o custo-benefício;
* não exija controle financeiro detalhado para ser útil.

---

## 38. Receios

Lucas pode desconfiar do produto quando:

* preços não possuem fonte ou contexto;
* o sistema recomenda apenas lugares populares;
* opções patrocinadas não são identificadas;
* o orçamento informado não influencia resultados;
* estimativas parecem precisas demais.

---

## 39. Critérios de sucesso

A experiência será bem-sucedida para Lucas quando ele conseguir:

* informar sua faixa de orçamento;
* encontrar opções adequadas;
* comparar preço e distância;
* montar dias equilibrados;
* identificar alternativas mais econômicas;
* evitar escolhas incompatíveis com o planejamento.

---

## 40. Frase representativa

> Não preciso escolher sempre o mais barato, mas quero saber se o gasto realmente vale a pena.

---

## 41. Implicações para o produto

Para atender essa persona, o RouteBook deverá priorizar:

* Faixa de preço;
* filtros de orçamento;
* custo-benefício;
* alternativas econômicas;
* transparência de dados;
* distância como custo indireto;
* opções gratuitas;
* justificativas relacionadas ao orçamento.

---

# Parte V — Persona complementar

## 42. Persona 4 — Organizador de Grupo

### Nome representativo

Camila, 38 anos.

### Papel

Organizadora responsável por planejar uma Viagem para várias pessoas.

### Contexto

Camila organiza viagens em família ou com amigos.

Ela precisa considerar diferentes interesses, idades, restrições, ritmos e orçamentos.

Nem todos os participantes colaboram ativamente no planejamento, mas todos possuem expectativas.

---

## 43. Objetivo principal

Criar um Roteiro que funcione para o grupo e reduza conflitos de preferência.

---

## 44. Objetivos secundários

Camila deseja:

* registrar quantidade de Viajantes;
* indicar presença de crianças;
* registrar Restrições;
* equilibrar interesses;
* encontrar opções adequadas ao grupo;
* evitar dias cansativos;
* compartilhar o planejamento;
* justificar escolhas.

---

## 45. Comportamentos

Camila geralmente:

* pergunta o que cada pessoa deseja fazer;
* recebe respostas em mensagens;
* organiza as preferências manualmente;
* prioriza atividades adequadas à maioria;
* mantém alternativas;
* ajusta horários para o grupo;
* escolhe restaurantes com opções variadas.

---

## 46. Necessidades

O Organizador de Grupo precisa:

* registrar Perfil do Grupo;
* indicar crianças;
* indicar necessidades de acessibilidade;
* registrar Restrições alimentares;
* informar Ritmo da Viagem;
* encontrar Lugares adequados ao grupo;
* manter Períodos livres;
* compartilhar um resumo.

---

## 47. Dificuldades

Camila enfrenta:

* preferências conflitantes;
* falta de participação dos demais;
* dificuldade para equilibrar ritmo;
* atividades inadequadas para crianças;
* restaurantes sem opções para todos;
* alterações de última hora;
* excesso de responsabilidade.

---

## 48. Frustrações

As principais frustrações são:

* descobrir que uma atividade não atende parte do grupo;
* receber recomendações individuais para uma Viagem coletiva;
* montar dias cansativos;
* repetir informações em várias conversas;
* não conseguir explicar por que uma escolha foi feita.

---

## 49. Expectativas

Camila espera que o RouteBook:

* considere o grupo;
* permita registrar Restrições;
* ajude a equilibrar interesses;
* indique adequação;
* apresente justificativas;
* facilite alterações;
* permita compartilhar o resultado.

---

## 50. Receios

Camila pode rejeitar o produto quando:

* considera apenas as preferências do Organizador;
* ignora crianças ou acessibilidade;
* cria Roteiros intensos;
* não permite alternativas;
* exige cadastro de todos os participantes.

---

## 51. Critérios de sucesso

A experiência será bem-sucedida para Camila quando ela conseguir:

* representar o grupo sem criar várias contas;
* registrar necessidades importantes;
* encontrar opções adequadas;
* montar dias realistas;
* compartilhar o Roteiro;
* reduzir conflitos de decisão.

---

## 52. Frase representativa

> Quero montar algo que funcione para todo mundo sem precisar administrar uma planilha de preferências.

---

## 53. Implicações para o produto

Para atender essa persona, o RouteBook deverá considerar:

* Perfil do Grupo;
* presença de crianças;
* Restrições;
* acessibilidade;
* Ritmo da Viagem;
* adequação dos Lugares;
* justificativas;
* compartilhamento futuro;
* colaboração pós-MVP.

---

# Parte VI — Necessidades compartilhadas

## 54. Necessidades comuns

As quatro personas compartilham necessidades importantes:

* compreender o Destino;
* visualizar Lugares no mapa;
* conhecer distâncias;
* evitar deslocamentos desnecessários;
* salvar opções;
* organizar Dias da Viagem;
* manter controle;
* alterar o Roteiro;
* receber informações claras;
* utilizar o produto no celular.

---

## 55. Necessidades com prioridades diferentes

Algumas necessidades possuem pesos diferentes.

| Necessidade             | Planejador Prático | Explorador Flexível | Planejador Econômico | Organizador de Grupo |
| ----------------------- | ------------------ | ------------------- | -------------------- | -------------------- |
| Planejamento antecipado | Alta               | Média               | Alta                 | Alta                 |
| Uso durante a Viagem    | Alta               | Muito alta          | Média                | Alta                 |
| Controle de orçamento   | Média              | Baixa               | Muito alta           | Alta                 |
| Flexibilidade           | Alta               | Muito alta          | Média                | Alta                 |
| Consideração do grupo   | Média              | Baixa               | Média                | Muito alta           |
| Mapa e distância        | Muito alta         | Muito alta          | Alta                 | Alta                 |
| Roteiro detalhado       | Muito alta         | Baixa               | Alta                 | Alta                 |
| Justificativas          | Alta               | Média               | Alta                 | Muito alta           |

---

## 56. Conflitos de necessidade

O produto deverá lidar com conflitos como:

* planejamento detalhado versus espontaneidade;
* baixo custo versus experiências especiais;
* preferência individual versus necessidade do grupo;
* maior quantidade de atividades versus ritmo tranquilo;
* automação versus controle;
* informação completa versus simplicidade.

Esses conflitos deverão ser tratados por personalização, não por uma experiência única e rígida.

---

# Parte VII — Perfis comportamentais complementares

## 57. Nível de planejamento

O usuário poderá apresentar diferentes níveis de planejamento.

### Planejamento baixo

* deseja poucas atividades definidas;
* prefere decidir durante a Viagem;
* valoriza sugestões rápidas.

### Planejamento médio

* define atividades principais;
* deixa espaços livres;
* deseja equilíbrio.

### Planejamento alto

* organiza vários dias;
* compara opções;
* deseja previsão de deslocamentos.

O RouteBook deverá permitir que o usuário escolha quanto deseja planejar.

---

## 58. Nível de autonomia desejado

### Autonomia alta

O usuário deseja montar tudo manualmente.

### Autonomia assistida

O usuário deseja sugestões, mas mantém controle.

### Assistência alta

O usuário deseja receber uma proposta pronta e realizar pequenos ajustes.

O MVP deverá priorizar autonomia assistida.

---

## 59. Sensibilidade ao orçamento

### Baixa

Preço não é critério principal.

### Moderada

Preço influencia, mas pode ser flexibilizado.

### Alta

Orçamento limita fortemente as opções.

O produto deverá utilizar essa informação sem assumir que econômico significa sempre menor preço.

---

## 60. Ritmo preferido

### Tranquilo

Poucas atividades e mais tempo livre.

### Equilibrado

Atividades distribuídas com pausas.

### Intenso

Maior aproveitamento do tempo disponível.

O Ritmo da Viagem deverá ser configurável independentemente da persona.

---

# Parte VIII — Cenários de uso

## 61. Cenário do Planejador Prático

Rafael cria uma Viagem, informa Destino, datas e Hospedagem.

Ele seleciona praias, gastronomia e vida noturna.

Depois:

1. visualiza os Lugares no mapa;
2. salva as opções mais interessantes;
3. compara distâncias;
4. adiciona praias aos primeiros dias;
5. inclui restaurantes próximos;
6. mantém períodos livres à noite;
7. reorganiza o Roteiro;
8. consulta tudo no celular.

---

## 62. Cenário do Explorador Flexível

Marina cria uma Viagem com poucas Preferências.

Ela adiciona apenas duas Atividades obrigatórias.

Durante a Viagem:

1. consulta o Dia da Viagem;
2. identifica um período livre;
3. busca restaurantes próximos;
4. filtra por distância;
5. adiciona uma opção ao Roteiro;
6. abre a rota externa;
7. remove uma atividade que não deseja mais realizar.

---

## 63. Cenário do Planejador Econômico

Lucas define orçamento econômico e Meio de transporte.

Ele:

1. filtra Lugares por Faixa de preço;
2. salva atrações gratuitas;
3. compara restaurantes;
4. agrupa atividades próximas;
5. inclui uma experiência especial;
6. equilibra o restante do Roteiro;
7. consulta alternativas mais econômicas.

---

## 64. Cenário do Organizador de Grupo

Camila cria uma Viagem para cinco pessoas.

Ela informa:

* presença de crianças;
* uma restrição alimentar;
* ritmo equilibrado;
* interesse em praia e gastronomia.

Depois:

1. filtra Lugares adequados ao grupo;
2. salva opções;
3. evita atividades intensas em sequência;
4. escolhe restaurantes com variedade;
5. mantém pausas;
6. apresenta o Roteiro ao grupo.

---

# Parte IX — Requisitos derivados das personas

## 65. Requisitos derivados do Planejador Prático

O produto deverá:

* centralizar informações;
* integrar lista e mapa;
* permitir salvar;
* permitir editar;
* apresentar o Roteiro por dia;
* mostrar distâncias;
* reduzir tarefas manuais;
* manter consistência.

---

## 66. Requisitos derivados do Explorador Flexível

O produto deverá:

* permitir planejamento parcial;
* manter Períodos livres;
* funcionar bem no celular;
* mostrar opções próximas;
* facilitar substituições;
* permitir alterações locais;
* priorizar consulta rápida.

---

## 67. Requisitos derivados do Planejador Econômico

O produto deverá:

* apresentar Faixa de preço;
* filtrar por orçamento;
* identificar opções econômicas;
* considerar custo-benefício;
* informar estimativas;
* sugerir alternativas;
* considerar deslocamento.

---

## 68. Requisitos derivados do Organizador de Grupo

O produto deverá:

* registrar quantidade de Viajantes;
* considerar crianças;
* considerar Restrições;
* considerar acessibilidade;
* permitir Ritmo da Viagem;
* indicar adequação;
* manter o Roteiro realista.

---

# Parte X — Anti-personas e público não prioritário

## 69. Propósito das anti-personas

Anti-personas representam perfis que não orientam o MVP.

Isso não significa que essas pessoas nunca poderão utilizar o RouteBook.

Significa que suas necessidades não deverão direcionar decisões iniciais.

---

## 70. Agente profissional de viagens

Profissional que necessita:

* gerenciar muitos clientes;
* emitir reservas;
* operar pagamentos;
* administrar fornecedores;
* criar propostas comerciais;
* controlar comissões.

Essas necessidades pertencem a uma plataforma empresarial e estão fora do MVP.

---

## 71. Viajante corporativo

Usuário focado em:

* viagens de negócios;
* políticas corporativas;
* reembolsos;
* reuniões;
* aprovação de despesas;
* gestão empresarial.

O RouteBook poderá atender parcialmente esse perfil no futuro, mas ele não orienta o produto inicial.

---

## 72. Usuário que busca apenas navegação

Pessoa que deseja exclusivamente:

* GPS;
* trânsito;
* navegação curva a curva;
* orientação por voz.

O RouteBook poderá abrir rotas externas, mas não substituirá uma plataforma de navegação.

---

## 73. Usuário que busca apenas reservas

Pessoa que deseja apenas:

* comprar passagens;
* reservar Hospedagem;
* reservar restaurantes;
* pagar ingressos.

Essas tarefas não pertencem ao núcleo do MVP.

---

## 74. Criador de conteúdo turístico

Usuário focado principalmente em:

* publicar guias;
* criar audiência;
* monetizar conteúdo;
* administrar seguidores;
* produzir avaliações públicas.

O RouteBook não será inicialmente uma rede social ou plataforma editorial aberta.

---

# Parte XI — Considerações de acessibilidade e inclusão

## 75. Necessidades de acessibilidade

As personas não devem ser consideradas apenas sob condições ideais de uso.

O produto deverá atender usuários que possam necessitar de:

* navegação por teclado;
* leitores de tela;
* contraste adequado;
* textos maiores;
* linguagem simples;
* alternativas ao mapa;
* informação sobre acessibilidade de Lugares;
* maior tempo para realizar tarefas.

---

## 76. Inclusão de diferentes grupos

O RouteBook deverá evitar assumir que:

* todos viajam de carro;
* todos possuem alto orçamento;
* todos viajam sem crianças;
* todos podem caminhar longas distâncias;
* todos desejam vida noturna;
* todos conhecem o Destino;
* todos desejam Roteiro intenso;
* todos conseguem interpretar mapas com facilidade.

---

## 77. Privacidade

A personalização deverá utilizar apenas informações necessárias.

O produto não deverá exigir dados sensíveis sem relação clara com a Viagem.

Informações como restrições e acessibilidade deverão ser tratadas com transparência e finalidade definida.

---

# Parte XII — Hipóteses de pesquisa

## 78. Hipóteses sobre o Planejador Prático

* centralização reduz esforço;
* mapa influencia decisões;
* salvar antes de planejar é útil;
* edição é essencial;
* justificativas aumentam confiança.

---

## 79. Hipóteses sobre o Explorador Flexível

* planejamento parcial é preferível;
* proximidade possui prioridade durante a Viagem;
* consulta rápida é mais importante que detalhes;
* replanejamento local possui alto valor.

---

## 80. Hipóteses sobre o Planejador Econômico

* orçamento altera seleção;
* distância representa custo indireto;
* Faixa de preço é suficiente para a primeira versão;
* alternativas econômicas aumentam valor.

---

## 81. Hipóteses sobre o Organizador de Grupo

* um único Organizador pode representar o grupo no MVP;
* crianças e Restrições alteram recomendações;
* compartilhamento será importante;
* colaboração pode ser adiada.

---

## 82. Perguntas para validação futura

* Qual persona reconhece maior valor no produto?
* Quais informações o usuário aceita fornecer?
* Quando o mapa influencia uma escolha?
* O usuário prefere salvar ou adicionar diretamente?
* Quanto planejamento deseja realizar?
* O orçamento precisa ser numérico?
* O Ritmo da Viagem é compreendido?
* Quais informações do grupo são realmente necessárias?
* Qual o nível de confiança nas recomendações?
* Em qual momento o usuário abandona fontes externas?

---

# Parte XIII — Priorização por persona

## 83. Funcionalidades essenciais para todas as personas

* criação de Viagem;
* Destino e Período;
* Hospedagem;
* mapa;
* Explorar;
* Detalhes do Lugar;
* distância;
* Lugares salvos;
* Roteiro;
* edição;
* uso móvel.

---

## 84. Funcionalidades de prioridade alta

* Preferências;
* orçamento;
* Meio de transporte;
* Ritmo da Viagem;
* filtros;
* Justificativas;
* Períodos livres;
* alternativas.

---

## 85. Funcionalidades pós-MVP relacionadas às personas

### Planejador Prático

* compartilhamento;
* exportação;
* geração avançada;
* histórico.

### Explorador Flexível

* localização atual;
* contexto em tempo real;
* clima;
* notificações;
* uso offline.

### Planejador Econômico

* orçamento por categoria;
* custos planejados;
* controle de gastos;
* alertas.

### Organizador de Grupo

* convites;
* votação;
* Preferências individuais;
* colaboração;
* comentários.

---

# Parte XIV — Governança das personas

## 86. Manutenção

Este documento deverá ser revisado quando:

* novos testes revelarem comportamentos diferentes;
* uma persona deixar de representar o público;
* uma necessidade recorrente não estiver contemplada;
* o produto atender novos segmentos;
* o MVP indicar outro perfil prioritário;
* recursos de colaboração forem incorporados.

---

## 87. Critérios para criar nova persona

Uma nova persona deverá ser criada apenas quando:

* possuir objetivos significativamente diferentes;
* apresentar comportamentos recorrentes;
* exigir decisões próprias de produto;
* não puder ser representada por variação de uma persona existente;
* existir evidência suficiente.

---

## 88. Critérios para consolidar personas

Duas personas deverão ser unificadas quando:

* suas necessidades forem praticamente iguais;
* não produzirem decisões diferentes;
* a separação depender apenas de idade ou demografia;
* a distinção não contribuir para priorização.

---

## 89. Uso em documentos posteriores

As personas deverão ser referenciadas em:

* Jornadas do Usuário;
* Casos de uso;
* Requisitos funcionais;
* Arquitetura da Informação;
* Fluxos;
* Inventário de telas;
* Estratégia de pesquisa;
* Testes de usabilidade.

---

## 90. Declaração final

O RouteBook deverá atender pessoas que desejam transformar informações de viagem em decisões e planejamento.

As personas prioritárias representam diferentes relações com esse processo:

* planejar;
* adaptar;
* economizar;
* organizar grupos.

O produto não deverá impor uma única forma de viajar.

Ele deverá permitir diferentes níveis de controle, planejamento, flexibilidade e personalização, preservando uma experiência simples, visual e coerente.
