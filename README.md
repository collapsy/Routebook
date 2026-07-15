# RouteBook

> Um guia de viagem visual, personalizável e orientado à decisão.

O **RouteBook** é uma aplicação web que ajuda viajantes a descobrir lugares, organizar atividades e tomar decisões antes e durante uma viagem.

O produto combina preferências pessoais, localização, mapas, distâncias, orçamento e tempo disponível para transformar informações dispersas em um guia de viagem visual e personalizável.

---

## Sobre o projeto

Planejar uma viagem normalmente exige consultar diferentes ferramentas e fontes de informação para encontrar:

* praias e atrações;
* restaurantes;
* bares e vida noturna;
* avaliações;
* fotografias;
* preços;
* distâncias;
* rotas;
* horários de funcionamento.

Mesmo depois dessa pesquisa, o viajante ainda precisa decidir quais lugares realmente valem a pena, quais atividades cabem no período disponível e como organizar os deslocamentos.

O RouteBook nasce para facilitar esse processo.

A aplicação deverá ajudar o usuário a responder perguntas como:

* O que vale a pena conhecer neste destino?
* Quais lugares combinam com minhas preferências?
* Onde posso comer bem dentro do meu orçamento?
* Quais praias, bares e atrações estão próximos?
* Quanto tempo levarei para chegar?
* Quais lugares podem ser visitados no mesmo dia?
* Como distribuir as atividades durante a viagem?
* Qual é a melhor opção para fazer agora?

---

## Origem

O RouteBook surgiu de uma necessidade pessoal: planejar uma viagem entre **22 e 29 de julho de 2026** e encontrar, de forma simples, lugares para conhecer, praias, restaurantes, bares, atividades noturnas e opções com bom custo-benefício.

Essa viagem será utilizada como primeiro cenário real de validação.

Apesar dessa origem, o RouteBook não será limitado a uma única viagem ou destino. O produto deverá evoluir para atender diferentes:

* destinos;
* períodos;
* perfis de viajantes;
* composições de grupo;
* estilos de viagem;
* meios de transporte;
* interesses;
* faixas de orçamento.

---

## Proposta de valor

O RouteBook não pretende ser apenas uma lista de pontos turísticos.

Seu objetivo é ajudar o viajante a decidir:

> Considerando onde estou, quanto tempo tenho, quanto posso gastar e o que gosto de fazer, qual é a melhor escolha para a minha viagem?

Para isso, o produto deverá combinar:

* descoberta de lugares;
* personalização;
* contexto geográfico;
* organização de roteiro;
* estimativa de deslocamento;
* análise de custo-benefício;
* recomendações contextualizadas;
* apresentação visual das informações.

---

## Experiência do usuário

O RouteBook deverá oferecer uma experiência:

* amigável;
* visual;
* responsiva;
* simples de entender;
* fácil de personalizar;
* útil antes e durante a viagem.

A interface deverá priorizar elementos como:

* mapas interativos;
* cartões de lugares;
* fotografias;
* marcadores geográficos;
* filtros;
* categorias;
* indicadores de distância;
* faixas de preço;
* estimativas de deslocamento;
* avaliações;
* linhas do tempo;
* roteiros organizados por dia.

O usuário não deverá depender de grandes blocos de texto para compreender suas opções.

---

## Mapas e localização

O mapa será um elemento central da experiência do RouteBook.

A aplicação deverá permitir que o usuário visualize:

* sua hospedagem;
* praias;
* restaurantes;
* bares;
* baladas;
* atrações turísticas;
* passeios;
* lugares salvos;
* atividades planejadas;
* pontos próximos entre si.

Também deverão ser apresentados, quando disponíveis:

* distância em relação à hospedagem;
* distância entre atividades;
* tempo estimado de deslocamento;
* meio de transporte considerado;
* rota sugerida;
* agrupamentos por proximidade;
* localização das atividades de cada dia.

A integração poderá utilizar o **Google Maps Platform** ou outro provedor compatível.

A arquitetura deverá abstrair o serviço de mapas para evitar que as regras centrais do produto dependam diretamente de um único fornecedor.

---

## Personalização

O usuário poderá configurar sua viagem com informações como:

* destino;
* período;
* localização da hospedagem;
* número de viajantes;
* perfil do grupo;
* orçamento;
* interesses;
* restrições;
* meio de transporte;
* ritmo desejado;
* lugares obrigatórios;
* períodos que deseja manter livres.

A personalização deverá ser progressiva.

O usuário poderá começar fornecendo poucas informações e refinar suas preferências durante o planejamento.

---

## Descoberta de lugares

O RouteBook deverá ajudar o usuário a descobrir diferentes tipos de lugares e experiências, incluindo:

* praias;
* restaurantes;
* bares;
* baladas;
* atrações turísticas;
* passeios;
* experiências culturais;
* atividades ao ar livre;
* locais familiares;
* opções econômicas;
* experiências especiais.

Cada lugar poderá apresentar informações como:

* nome;
* categoria;
* fotografias;
* localização;
* distância;
* tempo de deslocamento;
* faixa de preço;
* avaliação;
* duração sugerida;
* horário recomendado;
* motivo da recomendação.

---

## Roteiro personalizável

O RouteBook deverá permitir a criação de um roteiro distribuído pelos dias da viagem.

Cada dia poderá conter:

* atividades;
* horários;
* refeições;
* deslocamentos;
* períodos livres;
* duração estimada;
* orçamento previsto.

O roteiro não deverá ser rígido.

O usuário poderá:

* adicionar lugares;
* remover lugares;
* trocar atividades;
* alterar horários;
* reorganizar os dias;
* reservar períodos livres;
* buscar alternativas mais baratas;
* aumentar ou reduzir a intensidade;
* recalcular partes do planejamento.

O usuário continuará sendo o responsável final pelas escolhas da viagem.

---

## Recomendações

As recomendações deverão considerar progressivamente:

* interesses do usuário;
* perfil dos viajantes;
* orçamento;
* localização;
* distância;
* tempo de deslocamento;
* duração da atividade;
* avaliação do lugar;
* custo-benefício;
* horário de funcionamento;
* atividades já planejadas;
* compatibilidade com outros lugares;
* ritmo da viagem.

Sempre que possível, o sistema deverá explicar por que uma opção foi recomendada.

Exemplo:

> Recomendado por estar próximo da hospedagem, possuir preço moderado e combinar com o interesse do grupo por praias tranquilas.

---

## Escopo inicial

A primeira versão funcional deverá permitir que o usuário:

1. Crie uma viagem.
2. Informe destino e período.
3. Cadastre a hospedagem.
4. Defina interesses e preferências.
5. Informe uma faixa de orçamento.
6. Descubra lugares relevantes.
7. Visualize os lugares em um mapa.
8. Consulte distâncias e tempos estimados.
9. Salve lugares de interesse.
10. Adicione lugares ao roteiro.
11. Organize atividades por dia.
12. Altere manualmente o planejamento.
13. Visualize o roteiro em lista e mapa.

O escopo definitivo do MVP será detalhado na documentação de produto.

---

## Princípios

### Visual antes de textual

Mapas, cartões, fotografias e indicadores devem comunicar as informações principais sempre que forem mais eficientes que texto.

### Contexto antes de popularidade

Um lugar popular não é necessariamente a melhor opção para todos os viajantes.

### Personalização progressiva

O produto deve entregar valor mesmo quando o usuário fornecer poucas informações.

### Controle do usuário

Toda recomendação poderá ser aceita, modificada ou descartada.

### Transparência

O sistema deverá explicar os fatores relevantes por trás de suas sugestões.

### Contexto geográfico

Localização, distância e deslocamento devem fazer parte das decisões do produto.

### Simplicidade

A aplicação deve evitar formulários excessivos, fluxos confusos e complexidade desnecessária.

### Utilidade prática

Cada funcionalidade deve ajudar o usuário a descobrir, decidir, organizar ou realizar sua viagem.

---

## Estrutura do repositório

```text
RouteBook/
├── .github/
├── apps/
│   └── web/
├── docs/
│   ├── foundation/
│   ├── README.md
│   └── registry.md
├── packages/
│   ├── domain/
│   ├── maps/
│   ├── recommendation-engine/
│   ├── travel-engine/
│   └── ui/
├── .gitignore
└── README.md
```

### Aplicação

A aplicação web principal está localizada em:

```text
apps/web
```

Esse diretório deverá concentrar a aplicação executável e, futuramente, suas instruções específicas de instalação, desenvolvimento, testes e execução.

### Pacotes

Os módulos reutilizáveis estão localizados em `packages`.

| Pacote                  | Responsabilidade                                  |
| ----------------------- | ------------------------------------------------- |
| `domain`                | Conceitos e regras centrais do domínio            |
| `maps`                  | Mapas, geolocalização, distâncias e rotas         |
| `recommendation-engine` | Seleção, pontuação e explicação das recomendações |
| `travel-engine`         | Geração, organização e adaptação dos roteiros     |
| `ui`                    | Componentes e padrões visuais compartilhados      |

Os limites e contratos de cada pacote serão definidos durante a documentação de domínio e arquitetura.

### Documentação

A documentação oficial está localizada em:

```text
docs/
```

A porta de entrada da documentação é:

```text
docs/README.md
```

O inventário oficial de documentos é mantido em:

```text
docs/registry.md
```

Novas áreas documentais deverão ser criadas apenas quando houver conteúdo real para armazenar.

---

## Abordagem de desenvolvimento

O RouteBook seguirá uma abordagem orientada por documentação.

O fluxo esperado é:

1. Definir o problema.
2. Documentar a visão e o comportamento esperado.
3. Delimitar o escopo.
4. Modelar a experiência.
5. Especificar as regras do domínio.
6. Registrar as decisões técnicas.
7. Implementar.
8. Testar.
9. Validar.
10. Atualizar a documentação.

A documentação deverá orientar a implementação, e não apenas registrar decisões depois que o código estiver pronto.

---

## Fonte oficial de verdade

O repositório Git é a fonte oficial de verdade do RouteBook.

Decisões relevantes deverão ser registradas por meio de:

* documentos versionados;
* issues;
* pull requests;
* registros de decisão;
* histórico de commits.

Conversas externas podem apoiar o processo de criação, mas uma decisão somente será considerada oficial quando estiver registrada no repositório.

---

## Estado atual

O RouteBook encontra-se em fase de concepção e documentação.

O foco atual está em:

* organizar o repositório;
* consolidar a visão do produto;
* definir os princípios;
* delimitar o escopo inicial;
* documentar a experiência;
* especificar o MVP;
* preparar o desenvolvimento humano e assistido por IA.

A arquitetura técnica e as tecnologias de implementação ainda serão avaliadas e documentadas.

---

## Roadmap documental inicial

A documentação será construída progressivamente na seguinte ordem inicial:

1. Product Vision;
2. Product Principles;
3. Product Scope;
4. Product Glossary;
5. Product Overview;
6. MVP Definition;
7. Personas;
8. User Journeys;
9. Functional Requirements;
10. Information Architecture;
11. Core User Flows;
12. Domain Overview;
13. Map and Location Model;
14. Recommendation Engine;
15. Itinerary Engine;
16. System Architecture.

A ordem poderá ser ajustada quando novas dependências forem identificadas.

---

## Contribuição

O projeto ainda está em fase inicial e suas regras formais de contribuição serão documentadas posteriormente.

Até que um arquivo `CONTRIBUTING.md` seja criado, toda alteração deverá:

* possuir objetivo claro;
* respeitar a estrutura existente;
* evitar responsabilidades duplicadas;
* manter o escopo controlado;
* atualizar a documentação relacionada;
* ser validada antes da integração.

---

## Licença

A licença do projeto ainda não foi definida.

Enquanto um arquivo `LICENSE` não estiver presente, o código e a documentação não devem ser considerados liberados para uso, modificação ou distribuição sem autorização do responsável pelo projeto.
