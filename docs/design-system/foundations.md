---

id: RB-DS-001

title: Design System Foundations
description: Define os fundamentos visuais, semânticos e estruturais do Design System do RouteBook, incluindo princípios, cores, tipografia, espaçamento, elevação, iconografia, responsividade, acessibilidade e tokens.

document_type: design-system
owner: Experience

status: Draft
version: "0.1.0"

created: "2026-07-17"
last_updated: null

authors:

- RouteBook Team

tags:

- design-system
- foundations
- design-tokens
- accessibility
- responsive-design
- visual-language
- mobile-first

related_documents:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
- RB-PRD-001
- RB-PRD-002
- RB-PRD-003
- RB-PRD-004
- RB-PRD-005
- RB-PRD-006
- RB-PRD-007
- RB-PRD-008
- RB-UX-001
- RB-UX-002
- RB-UX-003
- RB-UX-004
- RB-UX-005
- RB-UX-006

prerequisites:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
- RB-UX-001
- RB-UX-002
- RB-UX-003
- RB-UX-004
- RB-UX-005
- RB-UX-006

next_documents:

- RB-DS-002
- RB-DS-003
- RB-DS-004
- RB-ARC-001
- RB-QA-001

ai_context:
priority: high
index: true
---

# RouteBook — Design System Foundations

## 1. Propósito deste documento

Este documento define os fundamentos do Design System do RouteBook.

Seu objetivo é estabelecer uma base visual, semântica e estrutural comum para todas as interfaces do produto.

Os fundamentos definidos aqui deverão orientar:

* componentes;
* padrões de interface;
* telas;
* protótipos;
* implementação frontend;
* documentação visual;
* acessibilidade;
* testes visuais;
* testes de regressão;
* manutenção do produto;
* agentes de IA que gerem interface ou código.

Este documento define:

* princípios do Design System;
* linguagem visual;
* tokens;
* cores;
* tipografia;
* espaçamento;
* dimensões;
* bordas;
* raios;
* sombras;
* elevação;
* iconografia;
* ilustrações;
* imagens;
* movimento;
* responsividade;
* densidade;
* acessibilidade;
* convenções de nomenclatura;
* governança.

Este documento não define:

* componentes completos;
* código de componentes;
* framework frontend;
* biblioteca técnica;
* identidade de marca final;
* ilustrações finais;
* telas de alta fidelidade;
* regras de domínio;
* contratos de API.

---

## 2. Papel do Design System

O Design System do RouteBook deverá funcionar como uma linguagem compartilhada entre:

* produto;
* design;
* desenvolvimento;
* QA;
* conteúdo;
* documentação;
* agentes de IA.

Ele deverá reduzir:

* inconsistência;
* decisões repetidas;
* divergências visuais;
* retrabalho;
* acessibilidade incompleta;
* componentes duplicados;
* interpretações conflitantes.

Ele deverá aumentar:

* previsibilidade;
* velocidade;
* qualidade;
* reutilização;
* rastreabilidade;
* acessibilidade;
* confiança.

---

## 3. Relação com a documentação de UX

A sequência documental é:

```text
RB-UX-001 — Arquitetura da Informação
→ define a estrutura

RB-UX-002 — Fluxos do Usuário
→ define os caminhos

RB-UX-003 — Inventário de Telas
→ define as superfícies

RB-UX-004 — Wireframes
→ define a composição

RB-UX-005 — Especificações de Interação
→ define os comportamentos

RB-UX-006 — Diretrizes de Conteúdo e Microcopy
→ define a comunicação

RB-DS-001 — Design System Foundations
→ define a base visual e estrutural
```

O Design System não deverá alterar responsabilidades definidas na documentação de UX.

---

# Parte I — Princípios do Design System

## 4. Clareza

A interface deverá priorizar compreensão.

Elementos visuais deverão ajudar o usuário a identificar:

* onde está;
* o que é importante;
* o que pode fazer;
* o que está selecionado;
* o que ocorreu;
* o que exige atenção.

Decoração não deverá competir com conteúdo ou ações.

---

## 5. Consistência

Elementos equivalentes deverão possuir:

* aparência equivalente;
* comportamento equivalente;
* nomenclatura equivalente;
* estados equivalentes.

A consistência deverá ocorrer entre:

* telas;
* dispositivos;
* estados;
* fluxos;
* documentação;
* implementação.

---

## 6. Contexto

O Design System deverá preservar o contexto da Viagem.

As superfícies deverão comunicar claramente:

* Viagem ativa;
* Destino;
* Dia selecionado;
* Lugar selecionado;
* estado do Roteiro;
* filtros ativos.

---

## 7. Hierarquia

A hierarquia deverá orientar atenção por meio de:

* tamanho;
* peso;
* posição;
* contraste;
* espaçamento;
* agrupamento;
* elevação.

A interface não deverá depender de um único atributo para estabelecer prioridade.

---

## 8. Eficiência

A interface deverá favorecer ações frequentes sem ocultar ações secundárias.

O Design System deverá evitar:

* excesso de etapas;
* controles redundantes;
* menus desnecessários;
* sobreposição de padrões;
* componentes com responsabilidades múltiplas.

---

## 9. Flexibilidade

Os fundamentos deverão suportar:

* mobile;
* tablet;
* desktop;
* diferentes densidades de conteúdo;
* dados completos;
* dados parciais;
* textos maiores;
* localização futura;
* temas futuros.

---

## 10. Acessibilidade por padrão

A acessibilidade não deverá ser tratada como variação posterior.

Todos os fundamentos deverão considerar:

* contraste;
* foco;
* leitura;
* teclado;
* toque;
* redução de movimento;
* ampliação;
* tecnologia assistiva.

---

## 11. Transparência

A interface deverá diferenciar visualmente:

* informação confirmada;
* estimativa;
* recomendação;
* alerta;
* indisponibilidade;
* processamento.

---

## 12. Neutralidade da automação

Elementos gerados ou sugeridos pelo RouteBook não deverão parecer obrigatórios.

A interface deverá preservar:

* revisão;
* edição;
* rejeição;
* decisão final do usuário.

---

# Parte II — Arquitetura de tokens

## 13. Definição

Tokens são decisões de design representadas por nomes reutilizáveis.

Exemplos:

```text
color.background.default
spacing.400
radius.medium
typography.heading.large
```

Tokens deverão substituir valores isolados sempre que possível.

---

## 14. Camadas de tokens

O Design System deverá utilizar três camadas.

### Tokens primitivos

Representam valores básicos.

Exemplos:

```text
color.blue.500
space.16
font.size.24
```

### Tokens semânticos

Representam função.

Exemplos:

```text
color.action.primary
color.text.muted
color.feedback.error
```

### Tokens de componente

Representam uso específico.

Exemplos:

```text
button.primary.background.default
card.border.default
navigation.item.active
```

---

## 15. Regra de uso

Componentes não deverão utilizar diretamente tokens primitivos quando existir token semântico correspondente.

### Evitar

```text
background: color.blue.500
```

### Preferir

```text
background: color.action.primary
```

---

## 16. Convenção de nomenclatura

Padrão:

```text
categoria.propriedade.variante.estado
```

Exemplos:

```text
color.text.primary
color.action.primary.hover
border.control.focus
spacing.component.compact
```

Os nomes deverão representar função, não aparência circunstancial.

---

## 17. Formato conceitual

A representação técnica poderá utilizar:

* JSON;
* CSS Custom Properties;
* TypeScript;
* ferramenta de tokens;
* formato compatível com o frontend.

Exemplo:

```json
{
  "color": {
    "text": {
      "primary": {
        "value": "#1F2933"
      }
    }
  }
}
```

A estrutura técnica final será definida pela Arquitetura.

---

# Parte III — Cores

## 18. Objetivo do sistema de cores

O sistema de cores deverá:

* organizar hierarquia;
* comunicar estado;
* reforçar ações;
* apoiar leitura;
* diferenciar contextos;
* funcionar com acessibilidade.

Cores não deverão ser utilizadas apenas para decoração.

---

## 19. Paleta neutra

A paleta neutra deverá sustentar:

* fundos;
* superfícies;
* textos;
* bordas;
* divisores;
* estados desabilitados.

Escala conceitual:

| Token       | Uso              |
| ----------- | ---------------- |
| neutral.0   | Superfície clara |
| neutral.50  | Fundo suave      |
| neutral.100 | Fundo secundário |
| neutral.200 | Bordas leves     |
| neutral.300 | Bordas fortes    |
| neutral.500 | Texto secundário |
| neutral.700 | Texto principal  |
| neutral.900 | Contraste máximo |

---

## 20. Cor primária

A cor primária deverá representar:

* ações principais;
* seleção;
* foco da marca;
* estados ativos.

Ela deverá possuir variações suficientes para:

* fundo;
* texto;
* hover;
* pressionado;
* foco;
* contraste.

A cor definitiva deverá ser validada antes da aprovação visual do Design System.

---

## 21. Cores de apoio

Poderão existir cores de apoio para:

* categorias;
* mapas;
* visualizações;
* dados;
* ilustrações.

Essas cores não deverão competir com a ação primária.

---

## 22. Cores de feedback

Categorias obrigatórias:

* sucesso;
* informação;
* atenção;
* erro.

Exemplo semântico:

```text
color.feedback.success
color.feedback.information
color.feedback.warning
color.feedback.error
```

---

## 23. Severidades

### Informação

Utilizada para contexto ou orientação.

### Sucesso

Utilizada para conclusão ou estado positivo.

### Atenção

Utilizada para risco ou informação que exige revisão.

### Erro

Utilizada para impedimento, falha ou condição crítica.

---

## 24. Cor não pode ser o único indicador

Estados deverão combinar cor com:

* texto;
* ícone;
* borda;
* rótulo;
* forma;
* posição semântica.

Exemplo:

```text
⚠ Risco
```

Não apenas um cartão amarelo sem identificação textual.

---

## 25. Contraste

Textos e elementos essenciais deverão atender contraste adequado.

Deverão ser validados:

* texto principal;
* texto secundário;
* botões;
* ícones;
* foco;
* campos;
* estados desabilitados;
* mensagens de feedback.

Estados desabilitados não estão isentos de legibilidade.

---

## 26. Fundos

Categorias:

```text
color.background.default
color.background.subtle
color.background.elevated
color.background.inverse
```

O fundo deverá ajudar a distinguir superfícies sem criar excesso de camadas.

---

## 27. Texto

Categorias:

```text
color.text.primary
color.text.secondary
color.text.muted
color.text.inverse
color.text.disabled
color.text.link
```

Textos informativos relevantes não deverão utilizar contraste excessivamente baixo.

---

## 28. Bordas

Categorias:

```text
color.border.subtle
color.border.default
color.border.strong
color.border.focus
color.border.error
```

---

## 29. Mapa

Marcadores deverão possuir estados visuais distintos:

* Lugar;
* Lugar salvo;
* Lugar planejado;
* Hospedagem;
* Lugar selecionado;
* agrupamento.

A diferenciação deverá combinar:

* símbolo;
* forma;
* rótulo;
* contraste;
* estado acessível.

---

## 30. Temas

O MVP poderá iniciar com tema claro.

A arquitetura de tokens deverá permitir futuramente:

* tema escuro;
* alto contraste;
* temas de marca;
* adaptações sazonais limitadas.

Componentes não deverão depender de valores fixos exclusivos do tema claro.

---

# Parte IV — Tipografia

## 31. Objetivo

A tipografia deverá priorizar:

* legibilidade;
* hierarquia;
* consistência;
* responsividade;
* localização;
* acessibilidade.

---

## 32. Família tipográfica

A família principal deverá ser:

* legível em telas;
* disponível em diferentes pesos;
* adequada a português;
* compatível com números;
* eficiente em carregamento;
* disponível legalmente para uso.

A definição final da fonte deverá ser documentada antes da aprovação.

---

## 33. Fallback

A pilha deverá possuir fontes de sistema como alternativa.

Exemplo conceitual:

```css
font-family:
  "Fonte RouteBook",
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

---

## 34. Escala tipográfica

Escala inicial conceitual:

| Token                     | Tamanho | Uso                             |
| ------------------------- | ------: | ------------------------------- |
| typography.display.large  |   40 px | Destaque institucional limitado |
| typography.heading.xlarge |   32 px | Título principal desktop        |
| typography.heading.large  |   28 px | Título de página                |
| typography.heading.medium |   24 px | Título de seção                 |
| typography.heading.small  |   20 px | Título de componente            |
| typography.body.large     |   18 px | Corpo destacado                 |
| typography.body.medium    |   16 px | Corpo padrão                    |
| typography.body.small     |   14 px | Informação secundária           |
| typography.label.medium   |   14 px | Rótulos                         |
| typography.label.small    |   12 px | Metadados compactos             |

Os valores poderão ser ajustados após validação visual.

---

## 35. Altura de linha

A altura de linha deverá favorecer leitura.

Referências:

* títulos: 120% a 135%;
* corpo: 140% a 160%;
* rótulos: 130% a 150%.

Textos longos não deverão utilizar altura de linha comprimida.

---

## 36. Pesos

Pesos conceituais:

* regular;
* medium;
* semibold;
* bold.

O Design System deverá evitar excesso de pesos.

---

## 37. Hierarquia

A hierarquia não deverá depender apenas do tamanho.

Deverá combinar:

* tamanho;
* peso;
* espaçamento;
* posição;
* cor;
* agrupamento.

---

## 38. Texto em caixa alta

Caixa alta poderá ser utilizada apenas em:

* rótulos curtos;
* categorias;
* severidades;
* pequenos metadados.

Exemplos:

```text
RISCO
ERRO
EM ANDAMENTO
```

Não utilizar caixa alta em parágrafos ou botões longos.

---

## 39. Comprimento de linha

Textos longos deverão possuir largura controlada.

Referência:

```text
45 a 80 caracteres por linha
```

Telas amplas não deverão esticar parágrafos por toda a largura.

---

## 40. Alinhamento

O alinhamento principal será à esquerda.

Centralização poderá ser utilizada em:

* estados vazios;
* confirmações simples;
* conteúdos curtos;
* situações com hierarquia clara.

Textos longos não deverão ser centralizados.

---

## 41. Números

Informações tabulares ou comparativas poderão utilizar numerais com largura consistente quando suportado.

Exemplos:

* horários;
* preços;
* Distâncias;
* duração.

---

## 42. Ampliação de texto

A interface deverá suportar ampliação sem:

* cortar conteúdo;
* sobrepor ações;
* esconder rótulos;
* exigir orientação horizontal.

---

# Parte V — Espaçamento

## 43. Unidade base

A unidade base recomendada será:

```text
4 px
```

Os espaçamentos deverão utilizar múltiplos consistentes.

---

## 44. Escala

| Token        | Valor |
| ------------ | ----: |
| spacing.0    |  0 px |
| spacing.050  |  2 px |
| spacing.100  |  4 px |
| spacing.200  |  8 px |
| spacing.300  | 12 px |
| spacing.400  | 16 px |
| spacing.500  | 20 px |
| spacing.600  | 24 px |
| spacing.700  | 32 px |
| spacing.800  | 40 px |
| spacing.900  | 48 px |
| spacing.1000 | 64 px |
| spacing.1200 | 80 px |

---

## 45. Uso semântico

Tokens semânticos poderão representar:

```text
spacing.inline.tight
spacing.inline.default
spacing.stack.compact
spacing.stack.default
spacing.section
spacing.page
```

---

## 46. Agrupamento

Elementos relacionados deverão possuir menor distância entre si do que entre grupos distintos.

Exemplo:

```text
Rótulo
4 a 8 px
Campo

16 a 24 px

Próximo campo
```

---

## 47. Espaçamento de página

Referências iniciais:

### Mobile

```text
16 a 20 px
```

### Tablet

```text
24 a 32 px
```

### Desktop

```text
32 a 48 px
```

O valor deverá respeitar a largura e a densidade da tela.

---

## 48. Densidade

O produto deverá priorizar densidade confortável.

Áreas como:

* Roteiro;
* listas;
* Mapa;
* painéis desktop;

poderão utilizar densidade maior, desde que a legibilidade seja preservada.

---

# Parte VI — Layout e grade

## 49. Mobile-first

As interfaces deverão ser concebidas primeiro para telas móveis nos fluxos prioritários.

Mobile-first não significa reproduzir o mesmo layout em tamanho menor.

Deverá considerar:

* toque;
* uma tarefa por vez;
* navegação inferior;
* páginas completas;
* bottom sheets;
* ações fixas;
* teclado virtual.

---

## 50. Contêiner

O conteúdo deverá utilizar contêineres com largura máxima adequada.

Exemplos conceituais:

```text
content.mobile
content.tablet
content.desktop
content.readable
```

---

## 51. Grade mobile

Referência inicial:

```text
4 colunas
```

Margens:

```text
16 a 20 px
```

Gutters:

```text
12 a 16 px
```

---

## 52. Grade tablet

Referência inicial:

```text
8 colunas
```

---

## 53. Grade desktop

Referência inicial:

```text
12 colunas
```

A grade deverá suportar:

* navegação lateral;
* lista;
* painel;
* Mapa;
* conteúdo principal.

---

## 54. Múltiplos painéis

Layouts desktop poderão utilizar:

```text
Navegação + conteúdo
Navegação + lista + Mapa
Navegação + lista + Detalhes
Navegação + Dias + Roteiro + Mapa
```

Cada painel deverá possuir largura mínima utilizável.

---

## 55. Largura mínima

O layout deverá impedir que:

* textos fiquem ilegíveis;
* ações sejam comprimidas;
* campos percam rótulos;
* Mapas se tornem inutilizáveis;
* painéis exibam informação incompleta.

Quando não houver espaço, painéis deverão:

* recolher;
* virar drawer;
* virar página;
* alternar visualização.

---

## 56. Áreas seguras

No mobile, o layout deverá respeitar:

* notch;
* barra de status;
* área do gesto de sistema;
* teclado;
* barras do navegador.

---

## 57. Conteúdo fixo

Elementos fixos poderão incluir:

* navegação inferior;
* cabeçalho;
* ações primárias;
* filtros contextuais.

Eles não deverão cobrir conteúdo.

---

# Parte VII — Dimensões e alvos de interação

## 58. Alvos de toque

Controles móveis deverão possuir área de toque adequada.

Referência mínima:

```text
44 × 44 px
```

Quando possível, utilizar área maior.

---

## 59. Altura de controles

Referências iniciais:

| Controle           |        Altura |
| ------------------ | ------------: |
| Botão compacto     |         36 px |
| Botão padrão       |         44 px |
| Botão confortável  |         48 px |
| Campo padrão       |         48 px |
| Item de lista      | 48 px ou mais |
| Navegação inferior | 64 px ou mais |

---

## 60. Distância entre controles

Ações adjacentes deverão possuir espaçamento que reduza acionamento acidental.

Ações destrutivas não deverão ficar excessivamente próximas de ações primárias.

---

## 61. Largura de botões

Botões deverão utilizar:

* largura baseada no conteúdo;
* largura total quando a ação precisar de maior destaque;
* alinhamento consistente no contexto.

Rótulos não deverão ser truncados.

---

# Parte VIII — Bordas e raios

## 62. Bordas

Escala conceitual:

| Token               | Valor |
| ------------------- | ----: |
| border.width.none   |     0 |
| border.width.thin   |  1 px |
| border.width.medium |  2 px |
| border.width.strong |  3 px |

---

## 63. Raios

Escala inicial:

| Token         |  Valor |
| ------------- | -----: |
| radius.none   |   0 px |
| radius.small  |   4 px |
| radius.medium |   8 px |
| radius.large  |  12 px |
| radius.xlarge |  16 px |
| radius.round  | 999 px |

---

## 64. Uso

### Pequeno

* chips;
* indicadores;
* controles compactos.

### Médio

* campos;
* botões;
* itens.

### Grande

* cartões;
* painéis;
* modais.

### Redondo

* avatares;
* ícones circulares;
* marcadores;
* badges.

---

## 65. Consistência

Raios não deverão variar arbitrariamente entre componentes equivalentes.

---

# Parte IX — Elevação e sombras

## 66. Propósito

Elevação deverá comunicar:

* sobreposição;
* prioridade;
* relação espacial;
* superfície temporária.

Não deverá ser utilizada como decoração excessiva.

---

## 67. Níveis

Escala conceitual:

| Token       | Uso                        |
| ----------- | -------------------------- |
| elevation.0 | Conteúdo base              |
| elevation.1 | Cartão ou controle elevado |
| elevation.2 | Cabeçalho fixo ou painel   |
| elevation.3 | Drawer ou bottom sheet     |
| elevation.4 | Modal                      |
| elevation.5 | Notificação crítica        |

---

## 68. Sombras

Sombras deverão ser discretas e combinadas com:

* borda;
* fundo;
* contraste;
* posição.

Tema escuro poderá exigir outra estratégia.

---

## 69. Sobreposição

A ordem de camadas deverá ser documentada.

Exemplo conceitual:

```text
base
sticky
dropdown
popover
sheet
modal
toast
critical
```

Valores técnicos serão definidos na implementação.

---

# Parte X — Iconografia

## 70. Objetivo

Ícones deverão:

* apoiar rótulos;
* reduzir carga visual;
* representar ações conhecidas;
* manter consistência.

---

## 71. Estilo

A biblioteca deverá utilizar:

* mesma família;
* mesma espessura;
* mesma proporção;
* mesma linguagem de cantos;
* mesma grade.

Misturar famílias deverá ser evitado.

---

## 72. Tamanhos

Escala conceitual:

| Token       | Valor |
| ----------- | ----: |
| icon.small  | 16 px |
| icon.medium | 20 px |
| icon.large  | 24 px |
| icon.xlarge | 32 px |

---

## 73. Ícones com rótulo

Ações críticas deverão possuir rótulo visível.

Exemplos:

* Adicionar ao roteiro;
* Excluir viagem;
* Aplicar filtros;
* Salvar alterações.

---

## 74. Ícones isolados

Ícones isolados poderão ser utilizados quando:

* o significado for conhecido;
* houver nome acessível;
* existir contexto claro;
* a ação não for ambígua.

Exemplos:

* fechar;
* voltar;
* menu;
* localização.

---

## 75. Símbolos conceituais

Categorias iniciais:

| Conceito   | Símbolo esperado          |
| ---------- | ------------------------- |
| Viagem     | mala, rota ou destino     |
| Explorar   | bússola ou descoberta     |
| Mapa       | mapa ou marcador          |
| Roteiro    | calendário, lista ou rota |
| Salvos     | marcador ou coração       |
| Hospedagem | cama ou casa              |
| Distância  | rota ou setas             |
| Alerta     | triângulo                 |
| Erro       | círculo com indicação     |
| Sucesso    | confirmação               |

A escolha final deverá evitar ambiguidades.

---

## 76. Mapa e marcadores

Marcadores deverão possuir formas próprias para:

* Hospedagem;
* Lugar;
* Salvo;
* Planejado;
* selecionado;
* agrupamento.

---

# Parte XI — Imagens e fotografia

## 77. Papel das imagens

Fotografias deverão apoiar:

* reconhecimento;
* inspiração;
* avaliação;
* distinção de Lugares.

Não deverão substituir informações essenciais.

---

## 78. Proporção

Proporções recomendadas:

* cartão: 4:3 ou 16:9;
* detalhe: 16:9;
* miniatura: 1:1;
* galeria: adaptativa com proporção consistente.

---

## 79. Qualidade

As imagens deverão:

* preservar nitidez;
* evitar distorção;
* utilizar corte apropriado;
* possuir fallback;
* utilizar carregamento progressivo quando possível.

---

## 80. Fallback

Quando não houver imagem:

* utilizar placeholder neutro;
* manter nome e informações;
* não bloquear ações;
* evitar ilustração enganosa.

---

## 81. Texto sobre imagem

Texto sobre imagem deverá ser evitado.

Quando necessário:

* garantir contraste;
* utilizar camada de proteção;
* limitar quantidade;
* possuir alternativa sem imagem.

---

## 82. Créditos e fontes

Quando necessário, origem e créditos deverão ser apresentados de forma discreta e acessível.

---

# Parte XII — Ilustração

## 83. Uso

Ilustrações poderão ser utilizadas em:

* primeiro uso;
* estados vazios;
* educação;
* onboarding;
* indisponibilidade não crítica.

---

## 84. Restrições

Ilustrações não deverão:

* infantilizar a experiência;
* substituir mensagens claras;
* dramatizar erros;
* competir com ações;
* representar local real de forma enganosa.

---

## 85. Estilo

O estilo deverá ser:

* simples;
* acolhedor;
* consistente;
* contextual;
* compatível com a marca.

---

# Parte XIII — Movimento

## 86. Objetivo

Movimento deverá comunicar:

* transição;
* continuidade;
* mudança de estado;
* relação espacial;
* resultado.

---

## 87. Durações

Escala conceitual:

| Token             | Duração |
| ----------------- | ------: |
| motion.instant    |    0 ms |
| motion.fast       |  100 ms |
| motion.normal     |  200 ms |
| motion.slow       |  300 ms |
| motion.emphasized |  400 ms |

Durações maiores deverão ser justificadas.

---

## 88. Curvas

Categorias:

```text
motion.easing.standard
motion.easing.enter
motion.easing.exit
motion.easing.emphasized
```

---

## 89. Transições

Exemplos:

* página: discreta;
* modal: entrada curta;
* bottom sheet: movimento vertical;
* drawer: movimento lateral;
* seleção: imediata;
* reordenação: acompanhamento do item.

---

## 90. Redução de movimento

Quando a preferência estiver ativa:

* remover deslocamentos desnecessários;
* reduzir escalas;
* evitar paralaxe;
* evitar animações contínuas;
* preservar feedback.

---

## 91. Carregamento

Animações de carregamento deverão:

* evitar distração;
* comunicar atividade;
* não simular progresso inexistente;
* possuir alternativa textual.

---

# Parte XIV — Estados visuais

## 92. Estado padrão

Representa componente disponível.

---

## 93. Hover

Deverá existir apenas como complemento em dispositivos com ponteiro.

---

## 94. Foco

Deverá ser visível em todos os controles interativos.

Token conceitual:

```text
focus.ring.default
focus.ring.error
```

---

## 95. Pressionado

Deverá indicar ativação imediata.

---

## 96. Selecionado

Deverá diferenciar-se do estado padrão sem depender apenas de cor.

---

## 97. Desabilitado

Deverá permanecer identificável.

O contraste poderá ser reduzido, mas o conteúdo deverá continuar legível.

---

## 98. Carregando

Deverá preservar:

* largura;
* contexto;
* rótulo;
* posição.

---

## 99. Erro

Deverá combinar:

* cor de erro;
* mensagem;
* ícone;
* associação ao elemento.

---

## 100. Sucesso

Deverá comunicar conclusão sem excesso de celebração.

---

# Parte XV — Foco e teclado

## 101. Foco visível

O indicador deverá:

* possuir contraste;
* envolver o elemento;
* não ser cortado;
* não alterar o layout.

---

## 102. Ordem de foco

Deverá seguir a ordem lógica:

```text
navegação
→ título
→ controles
→ conteúdo
→ ações
```

---

## 103. Superfícies sobrepostas

Modal, drawer e sheet deverão:

* receber foco;
* controlar a navegação;
* devolver foco ao fechar.

---

## 104. Skip links

Em desktop ou interfaces longas, poderão existir atalhos para:

* conteúdo principal;
* navegação;
* Mapa;
* resultados;
* Roteiro.

---

# Parte XVI — Responsividade

## 105. Breakpoints conceituais

Referência inicial:

| Categoria | Faixa           |
| --------- | --------------- |
| compact   | até 599 px      |
| medium    | 600 a 1023 px   |
| expanded  | 1024 px ou mais |
| wide      | 1440 px ou mais |

Os valores finais deverão ser validados pela implementação.

---

## 106. Estratégias

Ao mudar de largura, a interface poderá:

* empilhar;
* recolher;
* alternar;
* transformar painel em página;
* transformar drawer em painel;
* transformar menu em navegação fixa.

---

## 107. Prioridade

Quando o espaço diminuir:

1. preservar ação principal;
2. preservar conteúdo essencial;
3. preservar navegação;
4. recolher conteúdo complementar;
5. remover decoração.

---

## 108. Textos

Rótulos não deverão ser substituídos automaticamente por ícones em telas menores quando isso causar ambiguidade.

---

## 109. Mapa

### Mobile

* tela predominante;
* bottom sheet;
* lista alternativa.

### Desktop

* painel paralelo;
* lista sincronizada;
* Detalhes contextuais.

---

## 110. Roteiro

### Mobile

* Dias horizontais ou seletor;
* Atividades empilhadas;
* Mapa separado.

### Desktop

* lista de Dias;
* Atividades;
* Mapa;
* Detalhes opcionais.

---

# Parte XVII — Densidade e conteúdo

## 111. Densidade confortável

Padrão para:

* onboarding;
* formulários;
* Detalhes;
* Configurações.

---

## 112. Densidade compacta

Poderá ser utilizada em:

* Roteiro desktop;
* listas extensas;
* painéis;
* tabelas futuras.

A densidade compacta não deverá reduzir:

* alvo de interação;
* contraste;
* legibilidade;
* foco.

---

## 113. Conteúdo variável

Componentes deverão suportar:

* nomes longos;
* datas extensas;
* ausência de imagem;
* valores desconhecidos;
* múltiplos alertas;
* idiomas futuros.

---

## 114. Truncamento

Truncamento deverá ser utilizado apenas quando:

* o conteúdo completo estiver disponível;
* o espaço for restrito;
* a compreensão permanecer possível.

Títulos importantes não deverão ser truncados sem alternativa.

---

# Parte XVIII — Tokens fundamentais propostos

## 115. Tokens de cor

```text
color.background.default
color.background.subtle
color.background.elevated
color.background.inverse

color.text.primary
color.text.secondary
color.text.muted
color.text.inverse
color.text.disabled
color.text.link

color.action.primary
color.action.primary.hover
color.action.primary.pressed
color.action.secondary
color.action.disabled

color.feedback.information
color.feedback.success
color.feedback.warning
color.feedback.error

color.border.subtle
color.border.default
color.border.strong
color.border.focus
color.border.error
```

---

## 116. Tokens de tipografia

```text
typography.display.large
typography.heading.xlarge
typography.heading.large
typography.heading.medium
typography.heading.small
typography.body.large
typography.body.medium
typography.body.small
typography.label.medium
typography.label.small
```

---

## 117. Tokens de espaçamento

```text
spacing.0
spacing.050
spacing.100
spacing.200
spacing.300
spacing.400
spacing.500
spacing.600
spacing.700
spacing.800
spacing.900
spacing.1000
spacing.1200
```

---

## 118. Tokens de raio

```text
radius.none
radius.small
radius.medium
radius.large
radius.xlarge
radius.round
```

---

## 119. Tokens de elevação

```text
elevation.0
elevation.1
elevation.2
elevation.3
elevation.4
elevation.5
```

---

## 120. Tokens de movimento

```text
motion.duration.instant
motion.duration.fast
motion.duration.normal
motion.duration.slow
motion.duration.emphasized

motion.easing.standard
motion.easing.enter
motion.easing.exit
motion.easing.emphasized
```

---

## 121. Tokens de dimensões

```text
size.control.compact
size.control.default
size.control.comfortable
size.touch.minimum
size.icon.small
size.icon.medium
size.icon.large
size.navigation.mobile
```

---

# Parte XIX — Uso por categoria de componente

## 122. Botões

Deverão consumir tokens de:

* ação;
* texto;
* borda;
* raio;
* altura;
* espaçamento;
* foco;
* movimento.

---

## 123. Campos

Deverão consumir tokens de:

* fundo;
* texto;
* placeholder;
* borda;
* foco;
* erro;
* altura;
* raio;
* espaçamento.

---

## 124. Cartões

Deverão consumir tokens de:

* superfície;
* borda;
* raio;
* elevação;
* espaçamento;
* tipografia.

---

## 125. Navegação

Deverá consumir tokens de:

* fundo;
* ativo;
* inativo;
* foco;
* tamanho;
* espaçamento;
* borda.

---

## 126. Alertas

Deverão consumir tokens semânticos de feedback.

Não deverão utilizar valores isolados de cor.

---

## 127. Mapa

Marcadores deverão consumir tokens próprios de:

* categoria;
* estado;
* seleção;
* foco;
* tamanho;
* contraste.

---

# Parte XX — Acessibilidade

## 128. Requisitos fundamentais

Todos os fundamentos deverão permitir:

* contraste adequado;
* ampliação;
* navegação por teclado;
* foco visível;
* leitura por tecnologia assistiva;
* alvos de toque adequados;
* redução de movimento;
* uso sem cor;
* uso sem Mapa.

---

## 129. Testes de contraste

Deverão ser testadas combinações como:

* texto sobre fundo;
* texto de botão;
* ícone;
* borda de campo;
* foco;
* feedback;
* texto sobre imagem;
* estado desabilitado.

---

## 130. Foco

O token de foco deverá funcionar em:

* fundos claros;
* fundos escuros;
* componentes coloridos;
* Mapas;
* imagens.

---

## 131. Redimensionamento

A interface deverá permanecer utilizável com:

* zoom;
* texto ampliado;
* largura reduzida;
* orientação alterada.

---

## 132. Movimento

Animações deverão respeitar preferência de redução.

---

## 133. Leitores de tela

Ícones, imagens, marcadores e estados deverão possuir semântica equivalente.

---

# Parte XXI — Validação

## 134. Validação visual

Os fundamentos deverão ser validados em:

* Minhas Viagens;
* Criar Viagem;
* Visão Geral;
* Explorar;
* Detalhes do Lugar;
* Mapa;
* Salvos;
* Roteiro;
* Proposta;
* Revisão;
* Configurações.

---

## 135. Validação responsiva

Testar:

* mobile compacto;
* mobile amplo;
* tablet;
* desktop;
* desktop amplo.

---

## 136. Validação de conteúdo

Testar:

* nomes longos;
* valores ausentes;
* múltiplos alertas;
* imagens ausentes;
* textos ampliados;
* português;
* conteúdo futuro traduzido.

---

## 137. Validação de estados

Testar:

* padrão;
* hover;
* foco;
* selecionado;
* desabilitado;
* carregando;
* erro;
* sucesso.

---

## 138. Validação de acessibilidade

Testar:

* contraste;
* teclado;
* foco;
* leitor de tela;
* zoom;
* redução de movimento;
* toque.

---

# Parte XXII — Critérios de aceite

## 139. Tokens

* valores reutilizáveis possuem tokens;
* nomes representam função;
* componentes evitam valores isolados;
* temas futuros são possíveis.

---

## 140. Cores

* cores possuem função;
* contraste foi validado;
* estados não dependem apenas de cor;
* feedbacks são consistentes.

---

## 141. Tipografia

* escala está definida;
* hierarquia é consistente;
* textos são legíveis;
* ampliação é suportada;
* números são claros.

---

## 142. Espaçamento

* escala é consistente;
* agrupamento é perceptível;
* margens respondem ao dispositivo;
* densidade é controlada.

---

## 143. Layout

* mobile-first está preservado;
* grades são consistentes;
* múltiplos painéis possuem regras;
* o conteúdo não quebra em larguras menores.

---

## 144. Interação

* alvos de toque são adequados;
* foco é visível;
* estados estão definidos;
* movimento possui propósito;
* redução de movimento é suportada.

---

## 145. Imagens e ícones

* imagens possuem fallback;
* iconografia é consistente;
* ícones críticos possuem rótulo;
* textos essenciais não dependem de imagens.

---

# Parte XXIII — Governança

## 146. Inclusão de novo token

Um novo token deverá ser criado quando:

* representar decisão reutilizável;
* possuir significado semântico;
* ser utilizado por mais de um componente;
* reduzir valores isolados;
* suportar tema ou acessibilidade.

---

## 147. Alteração de token

Uma alteração deverá considerar:

* componentes afetados;
* telas;
* acessibilidade;
* temas;
* testes visuais;
* documentação;
* compatibilidade.

---

## 148. Depreciação

Tokens obsoletos deverão:

* ser marcados;
* possuir substituto;
* ter prazo de remoção;
* evitar remoção abrupta.

---

## 149. Exceções

Uma exceção visual deverá:

* possuir justificativa;
* estar documentada;
* não comprometer acessibilidade;
* não criar padrão paralelo sem necessidade.

---

## 150. Uso por agentes de IA

Agentes que produzam interface ou código deverão:

* utilizar tokens semânticos;
* não inventar valores visuais;
* respeitar escalas;
* preservar contraste;
* respeitar responsividade;
* manter foco visível;
* não depender apenas de cor;
* não misturar famílias de ícones;
* utilizar os wireframes como estrutura;
* utilizar estas Foundations como base visual.

---

## 151. Checklist de revisão

Antes de aprovar este documento, verificar:

* princípios estão definidos;
* arquitetura de tokens está definida;
* cores estão definidas;
* tipografia está definida;
* espaçamento está definido;
* layout está definido;
* dimensões estão definidas;
* bordas estão definidas;
* raios estão definidos;
* elevação está definida;
* iconografia está definida;
* imagens estão definidas;
* ilustração está definida;
* movimento está definido;
* estados estão definidos;
* foco está definido;
* responsividade está definida;
* densidade está definida;
* tokens propostos estão listados;
* acessibilidade está integrada;
* validação está definida;
* critérios de aceite estão definidos;
* governança está definida.

---

## 152. Declaração final

O Design System Foundations estabelece a base visual e estrutural do RouteBook.

Ele transforma decisões de experiência em regras reutilizáveis para:

* cores;
* tipografia;
* espaçamento;
* layout;
* dimensões;
* bordas;
* raios;
* elevação;
* iconografia;
* imagens;
* movimento;
* estados;
* acessibilidade;
* responsividade.

Esses fundamentos deverão garantir que todas as superfícies do RouteBook sejam:

* claras;
* consistentes;
* acessíveis;
* responsivas;
* reutilizáveis;
* evolutivas.

A próxima etapa deverá transformar esses fundamentos em componentes documentados, com anatomia, variações, estados, comportamentos e critérios de uso.
