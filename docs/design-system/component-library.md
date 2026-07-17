---

id: RB-DS-002

title: Component Library
description: Define a biblioteca de componentes do RouteBook, incluindo anatomia, variações, estados, comportamentos, composição, acessibilidade, responsividade e critérios de uso.

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
- components
- component-library
- ui
- accessibility
- responsive-design
- design-tokens

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
- RB-DS-001

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
- RB-DS-001

next_documents:

- RB-DS-003
- RB-DS-004
- RB-ARC-001
- RB-QA-001

ai_context:
priority: high
index: true
---

# RouteBook — Component Library

## 1. Propósito deste documento

Este documento define a biblioteca de componentes do RouteBook.

Seu objetivo é transformar os fundamentos do Design System em componentes reutilizáveis, consistentes, acessíveis e adequados aos fluxos do produto.

A biblioteca deverá orientar:

* design de interface;
* protótipos;
* implementação frontend;
* testes visuais;
* testes de acessibilidade;
* testes de interação;
* documentação;
* manutenção;
* agentes de IA que gerem código ou interfaces.

Este documento define:

* categorias de componentes;
* anatomia;
* propriedades conceituais;
* variações;
* estados;
* comportamentos;
* responsividade;
* acessibilidade;
* composição;
* critérios de uso;
* anti-patterns;
* rastreabilidade;
* governança.

Este documento não define:

* implementação técnica final;
* framework;
* API de código definitiva;
* biblioteca de ícones final;
* contratos de backend;
* identidade visual de alta fidelidade;
* composição completa de páginas.

---

## 2. Relação com o Design System

A sequência é:

```text
RB-DS-001 — Design System Foundations
→ define tokens, princípios e fundamentos

RB-DS-002 — Component Library
→ define os componentes reutilizáveis

RB-DS-003 — Patterns
→ definirá composições recorrentes

RB-DS-004 — Design System Governance
→ definirá evolução, contribuição e manutenção
```

Os componentes deverão consumir tokens definidos em `RB-DS-001`.

Valores visuais isolados não deverão ser introduzidos sem justificativa.

---

## 3. Princípios da biblioteca

A biblioteca deverá ser:

* reutilizável;
* semântica;
* acessível;
* composável;
* responsiva;
* previsível;
* documentada;
* testável;
* extensível;
* coerente com o domínio.

---

## 4. Critérios para existência de um componente

Um componente deverá existir quando:

* for reutilizado;
* possuir responsabilidade própria;
* tiver estados identificáveis;
* exigir comportamento consistente;
* possuir impacto de acessibilidade;
* reduzir duplicação;
* representar conceito recorrente.

Não deverá ser criado um componente apenas para encapsular estrutura sem responsabilidade.

---

## 5. Convenção de identificação

Os componentes utilizarão o padrão:

```text
RB-CMP-XXX
```

Exemplo:

```text
RB-CMP-001 — Button
```

Subcomponentes poderão ser identificados por sufixo:

```text
RB-CMP-014-A — Card Header
RB-CMP-014-B — Card Body
RB-CMP-014-C — Card Actions
```

---

# Parte I — Classificação

## 6. Categorias principais

A biblioteca será organizada em:

1. ações;
2. entrada;
3. seleção;
4. navegação;
5. informação;
6. feedback;
7. sobreposição;
8. dados;
9. viagem;
10. mapa;
11. roteiro;
12. estrutura.

---

## 7. Componentes fundamentais

Componentes fundamentais possuem uso amplo.

Exemplos:

* Button;
* Icon Button;
* Link;
* Text Field;
* Select;
* Checkbox;
* Radio;
* Switch;
* Chip;
* Badge;
* Card;
* Divider;
* Tooltip.

---

## 8. Componentes compostos

Componentes compostos combinam elementos fundamentais.

Exemplos:

* Search Field;
* Filter Bar;
* Place Card;
* Trip Card;
* Activity Card;
* Alert Card;
* Day Selector;
* Bottom Navigation;
* Side Navigation.

---

## 9. Componentes de domínio

Representam conceitos específicos do RouteBook.

Exemplos:

* Place Card;
* Trip Card;
* Activity Card;
* Free Period Card;
* Travel Time;
* Map Marker;
* Recommendation Reason;
* Conflict Item;
* Proposal Day.

---

# Parte II — Ações

## 10. RB-CMP-001 — Button

### Objetivo

Executar uma ação explícita.

### Anatomia

* contêiner;
* rótulo;
* ícone opcional;
* indicador de carregamento opcional.

### Variações

* primary;
* secondary;
* tertiary;
* destructive;
* ghost;
* inverse.

### Tamanhos

* compact;
* default;
* comfortable.

### Estados

* default;
* hover;
* focus;
* pressed;
* disabled;
* loading;
* success opcional.

### Regras

* o rótulo deverá começar com verbo;
* somente uma ação principal por contexto;
* largura total quando necessário em mobile;
* não truncar rótulo;
* ícone não substitui texto em ações ambíguas.

### Uso correto

```text
Criar viagem
Aplicar filtros
Salvar alterações
```

### Evitar

```text
OK
Confirmar
Clique aqui
```

Sem contexto suficiente.

### Acessibilidade

* nome acessível;
* foco visível;
* estado disabled semântico;
* estado loading anunciado;
* prevenção de clique duplicado.

---

## 11. RB-CMP-002 — Icon Button

### Objetivo

Executar ação compacta por ícone.

### Usos

* fechar;
* voltar;
* menu;
* salvar;
* localizar;
* editar;
* mais opções.

### Anatomia

* área de interação;
* ícone;
* indicador opcional;
* tooltip em desktop.

### Regras

* alvo mínimo de toque;
* nome acessível obrigatório;
* não utilizar ícone ambíguo sem rótulo;
* ações destrutivas devem exigir contexto adicional.

---

## 12. RB-CMP-003 — Button Group

### Objetivo

Agrupar ações relacionadas.

### Variações

* horizontal;
* vertical;
* responsivo;
* segmentado.

### Regras

* preservar hierarquia;
* evitar múltiplas ações primárias;
* em mobile, empilhar quando necessário;
* ações destrutivas devem permanecer separadas.

---

## 13. RB-CMP-004 — Link

### Objetivo

Navegar para outro destino.

### Variações

* inline;
* standalone;
* subtle;
* inverse.

### Estados

* default;
* hover;
* focus;
* visited, quando aplicável;
* disabled apenas em casos excepcionais.

### Regras

* texto descritivo;
* distinguir de Button;
* links externos podem indicar saída;
* não usar “clique aqui”.

---

# Parte III — Entrada

## 14. RB-CMP-005 — Text Field

### Objetivo

Receber texto curto.

### Anatomia

* rótulo;
* campo;
* placeholder opcional;
* prefixo ou sufixo;
* texto de apoio;
* mensagem de erro;
* contador opcional.

### Variações

* text;
* email;
* search;
* numeric;
* address;
* password futuramente.

### Estados

* default;
* hover;
* focus;
* filled;
* disabled;
* read-only;
* error;
* success opcional.

### Regras

* rótulo persistente;
* placeholder não substitui rótulo;
* erro próximo ao campo;
* preservar valor após falha;
* largura responsiva.

---

## 15. RB-CMP-006 — Text Area

### Objetivo

Receber texto extenso.

### Usos

* observações;
* restrições;
* comentários;
* descrição de atividade manual.

### Regras

* altura mínima;
* redimensionamento controlado;
* contador quando houver limite;
* texto opcional identificado;
* não crescer indefinidamente.

---

## 16. RB-CMP-007 — Search Field

### Objetivo

Pesquisar conteúdo.

### Anatomia

* ícone de pesquisa;
* campo;
* ação limpar;
* indicador de carregamento;
* sugestões opcionais.

### Estados

* empty;
* typing;
* loading;
* results;
* no results;
* error.

### Usos

* Destino;
* Hospedagem;
* Lugares;
* endereços.

### Regras

* objeto da pesquisa no placeholder;
* limpar sem remover filtros;
* sugestões navegáveis por teclado;
* loading não bloqueia cancelamento.

---

## 17. RB-CMP-008 — Date Field

### Objetivo

Selecionar ou informar data.

### Anatomia

* rótulo;
* valor;
* ícone;
* calendário opcional;
* validação.

### Variações

* single date;
* start date;
* end date;
* date range.

### Regras

* formato local;
* entrada manual acessível;
* calendário como suporte;
* relação entre início e término validada;
* duração calculada fora do campo.

---

## 18. RB-CMP-009 — Time Field

### Objetivo

Selecionar horário.

### Regras

* formato `HH:mm`;
* entrada por teclado;
* seletor opcional;
* aceitar atividade sem horário quando permitido;
* indicar localidade ou fuso quando necessário.

---

## 19. RB-CMP-010 — Number Stepper

### Objetivo

Alterar quantidade em intervalos definidos.

### Usos

* Viajantes;
* adultos;
* crianças;
* duração em situações específicas.

### Anatomia

* diminuir;
* valor;
* aumentar;
* rótulo.

### Regras

* limite mínimo e máximo;
* operação por teclado;
* ações desabilitadas nos limites;
* valor anunciado após mudança.

---

# Parte IV — Seleção

## 20. RB-CMP-011 — Checkbox

### Objetivo

Selecionar uma ou mais opções independentes.

### Estados

* unchecked;
* checked;
* indeterminate;
* focus;
* disabled;
* error.

### Usos

* filtros;
* categorias;
* opções múltiplas;
* confirmação não crítica.

### Regras

* rótulo clicável;
* não usar para ação imediata destrutiva;
* grupo com legenda quando necessário.

---

## 21. RB-CMP-012 — Radio

### Objetivo

Selecionar uma opção exclusiva.

### Usos

* Distância;
* transporte;
* Ritmo;
* Dia;
* origem.

### Regras

* agrupamento semântico;
* uma opção selecionada quando houver padrão;
* navegação por teclado;
* explicação para opções complexas.

---

## 22. RB-CMP-013 — Switch

### Objetivo

Ativar ou desativar configuração imediatamente.

### Usos possíveis

* bloqueio de Período livre;
* Preferência simples;
* configuração de notificação futura.

### Regras

* efeito imediato;
* não utilizar em formulários que exigem salvar;
* rótulo descreve estado;
* não substituir Checkbox indiscriminadamente.

---

## 23. RB-CMP-014 — Select

### Objetivo

Selecionar item em lista.

### Variações

* native;
* custom;
* searchable;
* single;
* multiple apenas quando necessário.

### Usos

* Dia;
* duração;
* ordenação;
* transporte;
* categoria.

### Regras

* evitar listas excessivamente longas sem busca;
* preservar operação por teclado;
* rótulo persistente;
* estado vazio e erro definidos.

---

## 24. RB-CMP-015 — Chip

### Objetivo

Representar opção, filtro, categoria ou estado compacto.

### Variações

* input;
* filter;
* choice;
* status;
* removable.

### Estados

* default;
* selected;
* focus;
* disabled;
* removable.

### Usos

* categorias;
* filtros ativos;
* Datas;
* estados;
* interesses.

### Regras

* não utilizar para texto longo;
* seleção não depende apenas de cor;
* remoção possui nome acessível;
* grupos devem permitir quebra de linha.

---

## 25. RB-CMP-016 — Segmented Control

### Objetivo

Alternar entre poucas visualizações mutuamente exclusivas.

### Usos

* Lista e Mapa;
* Todos, Erros e Riscos;
* visualizações compactas.

### Regras

* máximo recomendado de opções curtas;
* rótulos equivalentes;
* estado ativo claro;
* não utilizar como navegação entre áreas distantes.

---

# Parte V — Navegação

## 26. RB-CMP-017 — Bottom Navigation

### Objetivo

Navegar entre áreas principais no mobile.

### Itens

* Viagem;
* Explorar;
* Mapa;
* Roteiro;
* Salvos.

### Anatomia

* contêiner;
* item;
* ícone;
* rótulo;
* indicador ativo;
* badge opcional.

### Estados

* inactive;
* active;
* focus;
* pressed;
* badge;
* disabled excepcional.

### Regras

* cinco destinos fixos;
* rótulos sempre visíveis;
* respeitar área segura;
* não cobrir conteúdo;
* estado ativo não depende apenas de cor.

---

## 27. RB-CMP-018 — Side Navigation

### Objetivo

Navegar entre áreas da Viagem no desktop.

### Itens

* Visão Geral;
* Explorar;
* Mapa;
* Roteiro;
* Salvos;
* Configurações.

### Variações

* expanded;
* compact;
* collapsible futuramente.

### Regras

* Viagem ativa identificada;
* Configurações separadas quando necessário;
* foco visível;
* largura estável;
* itens com ícone e rótulo.

---

## 28. RB-CMP-019 — Top App Bar

### Objetivo

Apresentar contexto e ações da página.

### Anatomia

* ação voltar opcional;
* título;
* subtítulo;
* ações;
* menu contextual.

### Variações

* global;
* contextual;
* compact;
* sticky;
* transparent sobre imagem apenas quando acessível.

---

## 29. RB-CMP-020 — Breadcrumb

### Objetivo

Representar hierarquia em desktop.

### Exemplo

```text
Minhas viagens / Pipa / Roteiro / 24 de agosto
```

### Regras

* somente níveis reais;
* último item não navega;
* truncamento acessível;
* não substituir navegação principal.

---

## 30. RB-CMP-021 — Tabs

### Objetivo

Alternar entre conteúdos relacionados no mesmo contexto.

### Usos

* seções de Detalhes;
* categorias de alertas;
* áreas secundárias.

### Regras

* conteúdo relacionado;
* teclado;
* ativo claro;
* scroll horizontal controlado em mobile.

---

## 31. RB-CMP-022 — Pagination

### Objetivo

Navegar entre conjuntos de resultados.

### Uso

Preferível em desktop ou grandes listas.

### Variações

* numbered;
* previous and next;
* load more, quando comportamento não for paginação estrita.

### Regras

* preservar filtros;
* posição previsível;
* página atual anunciada;
* não misturar paginação e scroll infinito sem necessidade.

---

# Parte VI — Informação

## 32. RB-CMP-023 — Card

### Objetivo

Agrupar conteúdo relacionado.

### Anatomia

* contêiner;
* header opcional;
* mídia opcional;
* corpo;
* metadados;
* ações;
* status opcional.

### Variações

* static;
* actionable;
* selectable;
* elevated;
* outlined;
* compact.

### Estados

* default;
* hover;
* focus;
* selected;
* disabled;
* loading;
* error parcial.

### Regras

* não tornar todo cartão clicável quando houver ações conflitantes;
* hierarquia clara;
* área de ação previsível;
* conteúdo variável suportado.

---

## 33. RB-CMP-024 — List Item

### Objetivo

Representar item em lista.

### Anatomia

* leading;
* título;
* supporting text;
* trailing;
* status;
* divider opcional.

### Variações

* one-line;
* two-line;
* three-line;
* interactive;
* selectable.

### Usos

* resultados;
* Configurações;
* Dias;
* alertas;
* opções.

---

## 34. RB-CMP-025 — Badge

### Objetivo

Representar status ou contagem compacta.

### Variações

* neutral;
* information;
* success;
* warning;
* error;
* count.

### Exemplos

```text
Salvo
Planejado
Risco
3 alertas
```

### Regras

* texto curto;
* não usar como único portador de informação crítica;
* contraste validado;
* pluralização correta.

---

## 35. RB-CMP-026 — Tag

### Objetivo

Representar classificação não interativa.

### Usos

* categoria;
* faixa de preço;
* tipo de Lugar;
* atributo.

### Diferença para Chip

Tag comunica informação.

Chip permite seleção ou remoção.

---

## 36. RB-CMP-027 — Divider

### Objetivo

Separar grupos.

### Variações

* horizontal;
* vertical;
* inset;
* full width.

### Regras

* usar espaçamento antes de adicionar divisores;
* evitar excesso;
* não substituir hierarquia de título.

---

## 37. RB-CMP-028 — Avatar

### Objetivo

Representar usuário ou Viajante.

### Variações

* image;
* initials;
* placeholder.

### Uso inicial

Limitado à conta e colaboração futura.

---

## 38. RB-CMP-029 — Image

### Objetivo

Exibir fotografia ou mídia.

### Estados

* loading;
* loaded;
* fallback;
* error.

### Variações

* thumbnail;
* card;
* hero;
* gallery.

### Regras

* proporção consistente;
* texto alternativo;
* carregamento progressivo;
* não bloquear informação.

---

## 39. RB-CMP-030 — Carousel

### Objetivo

Navegar entre imagens relacionadas.

### Uso

Galeria de Lugar.

### Regras

* controles acessíveis;
* indicador de posição;
* suporte a teclado;
* swipe com alternativa;
* não reproduzir automaticamente.

---

# Parte VII — Feedback

## 40. RB-CMP-031 — Inline Message

### Objetivo

Comunicar feedback próximo ao elemento afetado.

### Variações

* information;
* success;
* warning;
* error.

### Usos

* validação;
* impacto;
* dados parciais;
* orientação.

---

## 41. RB-CMP-032 — Alert Banner

### Objetivo

Comunicar estado relevante de uma página ou seção.

### Anatomia

* ícone;
* título;
* descrição;
* ação;
* fechar opcional.

### Variações

* information;
* success;
* warning;
* error.

### Regras

* erro persistente não desaparece automaticamente;
* ação clara;
* conteúdo conciso;
* severidade textual.

---

## 42. RB-CMP-033 — Toast

### Objetivo

Comunicar resultado temporário não crítico.

### Usos

* Lugar salvo;
* ação desfeita;
* alteração concluída;
* falha recuperável.

### Anatomia

* mensagem;
* ação opcional;
* fechar opcional.

### Regras

* não conter informação indispensável;
* duração acessível;
* pausa com foco ou hover;
* anunciar por tecnologia assistiva;
* máximo controlado de mensagens simultâneas.

---

## 43. RB-CMP-034 — Progress Indicator

### Objetivo

Comunicar processamento.

### Variações

* linear determinate;
* linear indeterminate;
* circular;
* inline;
* step progress.

### Regras

* não inventar percentual;
* rótulo contextual;
* redução de movimento;
* progresso real quando determinate.

---

## 44. RB-CMP-035 — Skeleton

### Objetivo

Representar carregamento estrutural.

### Usos

* cards;
* listas;
* Detalhes;
* página.

### Regras

* refletir estrutura aproximada;
* não animar excessivamente;
* possuir alternativa para redução de movimento;
* evitar skeleton em operações muito rápidas.

---

## 45. RB-CMP-036 — Empty State

### Objetivo

Comunicar ausência esperada de conteúdo.

### Anatomia

* ilustração opcional;
* título;
* descrição;
* ação principal;
* ação secundária opcional.

### Usos

* nenhuma Viagem;
* nenhum Salvo;
* Roteiro vazio;
* Dia livre;
* sem resultados.

---

## 46. RB-CMP-037 — Error State

### Objetivo

Comunicar falha de página ou seção.

### Anatomia

* título;
* descrição;
* ação de recuperação;
* alternativa opcional;
* referência de suporte futuramente.

### Regras

* preservar contexto;
* não culpar usuário;
* diferenciar vazio de erro;
* mostrar somente impacto real.

---

# Parte VIII — Sobreposição

## 47. RB-CMP-038 — Modal

### Objetivo

Solicitar decisão curta ou confirmação.

### Anatomia

* backdrop;
* container;
* título;
* descrição;
* conteúdo;
* ações;
* fechar opcional.

### Variações

* confirmation;
* destructive;
* information;
* form curto.

### Estados

* opening;
* open;
* loading;
* error;
* closing.

### Regras

* foco contido;
* Escape fecha quando seguro;
* retornar foco;
* não utilizar para fluxo longo;
* ação destrutiva específica.

---

## 48. RB-CMP-039 — Bottom Sheet

### Objetivo

Apresentar conteúdo contextual no mobile.

### Usos

* filtros;
* seleção de Dia;
* resumo de Lugar;
* ações;
* transporte;
* reordenação.

### Variações

* standard;
* modal;
* persistent;
* expandable.

### Estados

* closed;
* partial;
* expanded;
* loading;
* error.

### Regras

* handle não é único meio de controle;
* ação fechar explícita;
* respeitar área segura;
* scroll interno controlado;
* foco gerenciado.

---

## 49. RB-CMP-040 — Drawer

### Objetivo

Apresentar conteúdo lateral.

### Usos

* filtros desktop;
* Detalhes;
* Configurações contextuais.

### Variações

* modal;
* persistent;
* temporary.

### Regras

* largura mínima;
* foco;
* fechamento explícito;
* não ocultar contexto essencial.

---

## 50. RB-CMP-041 — Popover

### Objetivo

Apresentar conteúdo curto ancorado.

### Usos

* ações contextuais;
* opções;
* explicação;
* seleção compacta.

### Regras

* ancoragem clara;
* fechar por Escape e clique externo;
* foco previsível;
* não utilizar para conteúdo extenso.

---

## 51. RB-CMP-042 — Tooltip

### Objetivo

Explicar controle ou ícone.

### Regras

* complemento, nunca informação essencial;
* acionável por foco e hover;
* não interativo;
* texto curto;
* não substituir rótulo em ação crítica.

---

# Parte IX — Estrutura e agrupamento

## 52. RB-CMP-043 — Page Container

### Objetivo

Definir largura, margens e alinhamento de página.

### Variações

* full;
* standard;
* readable;
* split-view.

### Regras

* responsivo;
* suporte a áreas seguras;
* largura máxima;
* não impor layout interno.

---

## 53. RB-CMP-044 — Section

### Objetivo

Agrupar conteúdo por tema.

### Anatomia

* título;
* descrição opcional;
* ações;
* corpo.

### Regras

* hierarquia semântica;
* espaçamento consistente;
* ações alinhadas ao título;
* não criar seções sem título quando a separação não for clara.

---

## 54. RB-CMP-045 — Stack

### Objetivo

Organizar elementos vertical ou horizontalmente com espaçamento consistente.

### Propriedades conceituais

* direction;
* gap;
* align;
* justify;
* wrap.

### Regras

* utilizar tokens;
* evitar margens individuais arbitrárias;
* servir como utilitário estrutural.

---

## 55. RB-CMP-046 — Grid

### Objetivo

Organizar conteúdo em colunas responsivas.

### Usos

* cards;
* dashboard;
* fotos;
* painéis.

### Regras

* colunas adaptativas;
* largura mínima;
* gap por token;
* ordem semântica preservada.

---

## 56. RB-CMP-047 — Split View

### Objetivo

Apresentar dois ou mais painéis relacionados.

### Usos

* lista e Mapa;
* lista e Detalhes;
* Dias, Roteiro e Mapa;
* alertas e correção.

### Regras

* prioridade definida;
* painéis recolhíveis;
* largura mínima;
* foco previsível;
* transformação responsiva documentada.

---

# Parte X — Componentes de Viagem

## 57. RB-CMP-048 — Trip Card

### Objetivo

Representar uma Viagem.

### Anatomia

* nome ou Destino;
* datas;
* estado temporal;
* progresso;
* próxima informação;
* ação;
* menu contextual opcional.

### Variações

* in-progress;
* upcoming;
* completed;
* draft.

### Estados

* default;
* hover;
* focus;
* loading;
* error parcial.

### Regras

* Destino sempre visível;
* datas legíveis;
* estado temporal textual;
* não depender apenas de fotografia;
* ação Abrir clara.

---

## 58. RB-CMP-049 — Trip Header

### Objetivo

Identificar a Viagem ativa.

### Anatomia

* nome;
* Destino;
* Período;
* Viajantes;
* ação Configurações;
* status opcional.

### Variações

* mobile;
* desktop;
* compact;
* sticky.

---

## 59. RB-CMP-050 — Trip Summary

### Objetivo

Apresentar resumo de planejamento.

### Conteúdo

* quantidade de Dias;
* Dias planejados;
* Atividades;
* alertas;
* Salvos;
* próximo passo.

### Uso

Visão Geral da Viagem.

---

## 60. RB-CMP-051 — Context Summary

### Objetivo

Exibir contexto de personalização.

### Conteúdo

* Hospedagem;
* transporte;
* Ritmo;
* orçamento;
* Preferências.

### Regras

* conteúdo resumido;
* acesso para edição;
* estado incompleto identificado.

---

# Parte XI — Componentes de Lugar

## 61. RB-CMP-052 — Place Card

### Objetivo

Representar Lugar em listas e grades.

### Anatomia

* imagem;
* nome;
* categoria;
* avaliação;
* Distância;
* faixa de preço;
* justificativa;
* estado Salvo;
* estado Planejado;
* ações.

### Variações

* list;
* grid;
* compact;
* map result;
* saved;
* planned.

### Estados

* default;
* hover;
* focus;
* selected;
* saved;
* planned;
* unavailable;
* partial data;
* loading.

### Regras

* nome e Distância prioritários;
* Salvo e Planejado independentes;
* não sobrecarregar ações;
* imagem opcional;
* seleção sincronizada com Mapa.

---

## 62. RB-CMP-053 — Place Summary

### Objetivo

Apresentar resumo contextual de um Lugar.

### Usos

* Mapa;
* painel lateral;
* bottom sheet.

### Conteúdo

* nome;
* categoria;
* Distância;
* faixa de preço;
* estado;
* ações rápidas.

---

## 63. RB-CMP-054 — Recommendation Reason

### Objetivo

Explicar por que um Lugar foi recomendado.

### Exemplos

* Próxima da hospedagem;
* Boa opção para a manhã;
* Mesma região do Roteiro;
* Compatível com interesse por praias.

### Variações

* inline;
* badge;
* list;
* expanded.

### Regras

* fatores compreensíveis;
* não apresentar certeza absoluta;
* máximo de razões visíveis controlado.

---

## 64. RB-CMP-055 — Place Status

### Objetivo

Representar estado do Lugar.

### Estados possíveis

* Salvo;
* Planejado;
* Salvo e Planejado;
* Indisponível;
* Informação parcial.

### Regras

* estados independentes;
* rótulo textual;
* símbolo consistente;
* não depender apenas de cor.

---

## 65. RB-CMP-056 — Price Range

### Objetivo

Comunicar faixa de preço.

### Variações

* free;
* economic;
* moderate;
* high;
* unknown;
* numeric range.

### Exemplos

```text
Gratuito
Econômico
R$ 40 a R$ 60 por pessoa
Preço não informado
```

---

## 66. RB-CMP-057 — Rating

### Objetivo

Exibir avaliação agregada.

### Anatomia

* valor;
* ícone;
* quantidade opcional;
* fonte opcional.

### Regras

* valor acessível;
* não utilizar avaliação sem fonte válida;
* ausência não deverá parecer nota zero.

---

# Parte XII — Componentes de Mapa

## 67. RB-CMP-058 — Map Marker

### Objetivo

Representar ponto no Mapa.

### Variações

* place;
* saved;
* planned;
* accommodation;
* selected;
* current-location;
* cluster.

### Estados

* default;
* hover;
* focus;
* selected;
* disabled;
* partial.

### Regras

* forma e símbolo próprios;
* alvo acessível;
* nome disponível;
* seleção sincronizada;
* não depender apenas de cor.

---

## 68. RB-CMP-059 — Marker Cluster

### Objetivo

Agrupar Marcadores próximos.

### Conteúdo

* quantidade;
* estado visual;
* nome acessível.

### Comportamento

* ampliar Mapa;
* listar itens;
* preservar foco.

---

## 69. RB-CMP-060 — Map Controls

### Objetivo

Agrupar controles do Mapa.

### Controles

* zoom;
* localização atual;
* redefinir enquadramento;
* camadas futuras;
* lista alternativa.

### Regras

* operáveis por teclado;
* contraste com o Mapa;
* não sobrepor conteúdo crítico;
* alvo de toque adequado.

---

## 70. RB-CMP-061 — Map Context Selector

### Objetivo

Alternar contexto do Mapa.

### Opções

* Todos;
* Explorar;
* Salvos;
* Roteiro;
* Dia.

### Forma

* Select;
* Segmented Control;
* Tabs compactas;
* bottom sheet em mobile.

---

## 71. RB-CMP-062 — Map Fallback

### Objetivo

Apresentar alternativa quando o Mapa falhar.

### Conteúdo

* mensagem;
* tentar novamente;
* lista;
* Distâncias;
* rota externa opcional.

---

# Parte XIII — Componentes de Roteiro

## 72. RB-CMP-063 — Day Selector

### Objetivo

Selecionar Dia da Viagem.

### Anatomia

* data;
* dia da semana;
* estado;
* alerta;
* seleção;
* indicador de Dia atual.

### Variações

* horizontal mobile;
* vertical desktop;
* compact;
* detailed.

### Estados

* default;
* selected;
* current;
* empty;
* planned;
* warning;
* past;
* future.

### Regras

* seleção clara;
* scroll acessível;
* Dia atual textual;
* alerta não depende apenas de cor.

---

## 73. RB-CMP-064 — Day Header

### Objetivo

Identificar o Dia selecionado.

### Conteúdo

* data;
* dia da semana;
* quantidade de Atividades;
* alertas;
* ações.

---

## 74. RB-CMP-065 — Activity Card

### Objetivo

Representar Atividade no Roteiro.

### Anatomia

* horário;
* título;
* Lugar opcional;
* duração;
* categoria;
* alerta;
* ações;
* handle opcional.

### Variações

* scheduled;
* unscheduled;
* manual;
* place-linked;
* warning;
* selected;
* compact.

### Estados

* default;
* hover;
* focus;
* dragging;
* saving;
* error;
* disabled.

### Regras

* horário e título prioritários;
* handle não é único meio de mover;
* alertas contextuais;
* menu acessível;
* estado saving preserva posição.

---

## 75. RB-CMP-066 — Travel Time

### Objetivo

Representar Deslocamento entre Atividades.

### Conteúdo

* Distância;
* Tempo;
* transporte;
* origem;
* destino;
* estado de cálculo.

### Estados

* loading;
* available;
* estimated;
* unavailable;
* stale.

### Regras

* indicar estimativa;
* não ocupar peso superior à Atividade;
* atualização após reordenação.

---

## 76. RB-CMP-067 — Free Period Card

### Objetivo

Representar Período livre.

### Conteúdo

* horário;
* duração;
* observação;
* estado flexível ou bloqueado;
* ações.

### Variações

* flexible;
* locked;
* without-time.

### Regras

* diferenciar de espaço vazio acidental;
* comunicar se pode receber sugestão;
* edição e remoção acessíveis.

---

## 77. RB-CMP-068 — Unscheduled Activities

### Objetivo

Agrupar Atividades sem horário.

### Conteúdo

* título da seção;
* itens;
* ação organizar;
* contexto.

### Regras

* não tratar como erro;
* permitir reordenação;
* permitir atribuir horário.

---

## 78. RB-CMP-069 — Reorder Controls

### Objetivo

Oferecer alternativa ao arrastar.

### Ações

* mover para cima;
* mover para baixo;
* mover para o início;
* mover para o fim;
* selecionar posição.

### Regras

* equivalência funcional;
* feedback de nova posição;
* foco preservado.

---

# Parte XIV — Conflitos e proposta

## 79. RB-CMP-070 — Conflict Item

### Objetivo

Representar conflito, risco ou sugestão.

### Anatomia

* severidade;
* título;
* contexto;
* impacto;
* ação;
* estado ignorado opcional.

### Variações

* error;
* warning;
* suggestion;
* resolved;
* ignored.

### Regras

* severidade textual;
* ação específica;
* erro bloqueante não ignorável;
* vínculo com elemento afetado.

---

## 80. RB-CMP-071 — Conflict Summary

### Objetivo

Resumir alertas da Viagem ou Dia.

### Conteúdo

* total;
* erros;
* riscos;
* sugestões;
* ação Revisar.

---

## 81. RB-CMP-072 — Proposal Day

### Objetivo

Representar um Dia dentro da Proposta de Roteiro.

### Conteúdo

* data;
* Atividades;
* alertas;
* justificativas;
* seleção para aceitação parcial.

### Variações

* preview;
* editable;
* selected;
* conflict.

---

## 82. RB-CMP-073 — Proposal Activity

### Objetivo

Representar Atividade proposta antes de aplicação.

### Estados

* proposed;
* selected;
* edited;
* excluded;
* warning.

### Regras

* visualmente distinta da Atividade aplicada;
* seleção acessível;
* justificativa disponível;
* não confundir com Roteiro atual.

---

## 83. RB-CMP-074 — Proposal Summary

### Objetivo

Apresentar contexto de geração.

### Conteúdo

* critérios;
* limitações;
* quantidade de Dias;
* alertas;
* ações.

---

# Parte XV — Filtros e busca

## 84. RB-CMP-075 — Filter Bar

### Objetivo

Agrupar pesquisa, filtros e ordenação.

### Anatomia

* Search Field;
* ação Filtros;
* chips ativos;
* ordenação;
* quantidade de resultados.

### Variações

* mobile;
* desktop;
* sticky;
* compact.

### Regras

* filtros ativos visíveis;
* não ocupar espaço excessivo;
* preservar contexto;
* adaptar para bottom sheet.

---

## 85. RB-CMP-076 — Filter Group

### Objetivo

Agrupar opções relacionadas.

### Conteúdo

* título;
* descrição opcional;
* opções;
* limpar grupo opcional.

### Usos

* Categoria;
* Distância;
* preço;
* transporte.

---

## 86. RB-CMP-077 — Active Filters

### Objetivo

Exibir filtros aplicados.

### Anatomia

* chips removíveis;
* ação Limpar todos;
* quantidade opcional.

### Regras

* remoção acessível;
* quebra de linha;
* estado vazio não ocupa espaço;
* atualização imediata.

---

## 87. RB-CMP-078 — Results Count

### Objetivo

Comunicar quantidade de resultados.

### Exemplos

```text
1 lugar encontrado
18 lugares encontrados
```

### Regras

* pluralização correta;
* atualização anunciada;
* não apresentar número impreciso como exato.

---

# Parte XVI — Configurações

## 88. RB-CMP-079 — Settings List

### Objetivo

Organizar seções de Configurações.

### Anatomia

* item;
* título;
* valor atual;
* indicador de navegação;
* estado.

### Variações

* mobile list;
* desktop navigation;
* grouped.

---

## 89. RB-CMP-080 — Settings Section

### Objetivo

Apresentar formulário de uma categoria.

### Conteúdo

* título;
* descrição;
* campos;
* impacto;
* ação salvar.

---

## 90. RB-CMP-081 — Impact Summary

### Objetivo

Comunicar consequências de alteração estrutural.

### Usos

* Hospedagem;
* Destino;
* Período;
* transporte.

### Conteúdo

* alteração;
* elementos afetados;
* recálculos;
* riscos;
* ação revisar.

---

# Parte XVII — Composição

## 91. Regras de composição

Componentes deverão ser compostos por responsabilidade.

Exemplo:

```text
Place Card
├── Image
├── Place Status
├── Rating
├── Price Range
├── Recommendation Reason
└── Button
```

O componente composto não deverá duplicar comportamento dos componentes internos.

---

## 92. Conteúdo por slots

Componentes compostos poderão aceitar áreas conceituais:

* leading;
* header;
* body;
* metadata;
* actions;
* trailing;
* footer.

Essas áreas deverão possuir limites de uso.

---

## 93. Propagação de estado

Estados do componente composto deverão ser coordenados.

Exemplo:

```text
Place Card selected
→ borda selecionada
→ marcador sincronizado
→ foco preservado
```

Estados internos não deverão contradizer o estado do componente.

---

## 94. Ações concorrentes

Quando um componente possuir várias ações:

* a área clicável deverá ser clara;
* ações internas não deverão acionar o contêiner;
* foco deverá alcançar cada ação;
* o evento não deverá propagar incorretamente.

---

## 95. Componentes controlados e não controlados

A implementação poderá distinguir componentes:

* controlados pelo estado externo;
* com estado interno temporário.

Estados de negócio deverão permanecer controlados pela aplicação.

---

# Parte XVIII — Responsividade

## 96. Transformações responsivas

| Componente desktop    | Componente mobile         |
| --------------------- | ------------------------- |
| Side Navigation       | Bottom Navigation         |
| Drawer persistente    | Bottom Sheet ou página    |
| Split View            | Visualização alternada    |
| Tabs amplas           | Tabs roláveis ou Select   |
| Formulário em colunas | Formulário empilhado      |
| Card horizontal       | Card vertical ou compacto |
| Painel de Detalhes    | Página completa           |

---

## 97. Reflow

Os componentes deverão permitir:

* quebra de linha;
* empilhamento;
* expansão vertical;
* mudança de ordem visual sem alterar semântica;
* largura fluida.

---

## 98. Conteúdo prioritário

Em largura reduzida, preservar:

1. título;
2. estado;
3. ação principal;
4. informação crítica;
5. ação secundária;
6. conteúdo complementar.

---

## 99. Componentes fixos

Bottom Navigation, ações fixas e headers deverão:

* respeitar áreas seguras;
* não cobrir conteúdo;
* ajustar-se ao teclado;
* possuir altura previsível.

---

# Parte XIX — Acessibilidade

## 100. Requisitos gerais

Todo componente interativo deverá possuir:

* nome acessível;
* estado acessível;
* foco visível;
* operação por teclado;
* ordem lógica;
* contraste adequado;
* alvo de toque adequado.

---

## 101. Semântica nativa

Quando possível, utilizar elementos nativos equivalentes.

Exemplos:

* `button`;
* `input`;
* `select`;
* `dialog`;
* `nav`;
* `progress`.

Componentes customizados deverão reproduzir o comportamento completo.

---

## 102. Estados dinâmicos

Estados como:

* loading;
* selected;
* expanded;
* invalid;
* checked;
* current;

deverão ser expostos semanticamente.

---

## 103. Foco

Componentes que abrem superfícies deverão:

* mover foco quando necessário;
* restringir foco em modal;
* devolver foco ao fechar.

---

## 104. Gestos

Gestos deverão possuir alternativa.

Exemplos:

* swipe;
* drag;
* pinch;
* long press.

---

## 105. Texto ampliado

Componentes deverão suportar texto ampliado sem:

* cortar;
* sobrepor;
* esconder ação;
* perder rótulo.

---

## 106. Contraste

Deverão ser validados:

* texto;
* ícone;
* borda;
* foco;
* selected;
* disabled;
* feedback;
* marcador de Mapa.

---

# Parte XX — Estados e matriz

## 107. Matriz de estados fundamentais

| Estado   | Button           | Field    | Card                | Navigation  | Modal         |
| -------- | ---------------- | -------- | ------------------- | ----------- | ------------- |
| Default  | Sim              | Sim      | Sim                 | Sim         | Sim           |
| Hover    | Desktop          | Desktop  | Desktop             | Desktop     | Não aplicável |
| Focus    | Sim              | Sim      | Sim                 | Sim         | Sim           |
| Pressed  | Sim              | Não      | Quando acionável    | Sim         | Ações         |
| Selected | Não              | Não      | Quando selecionável | Sim         | Não           |
| Disabled | Sim              | Sim      | Opcional            | Excepcional | Ações         |
| Loading  | Sim              | Opcional | Sim                 | Não         | Sim           |
| Error    | Ação relacionada | Sim      | Parcial             | Não         | Sim           |

---

## 108. Estados de dados

Componentes de conteúdo deverão considerar:

* loading;
* complete;
* partial;
* empty;
* error;
* unavailable;
* stale.

---

## 109. Estados de persistência

Componentes editáveis deverão considerar:

* unchanged;
* dirty;
* saving;
* saved;
* save error.

---

# Parte XXI — Critérios de uso

## 110. Escolha entre Button e Link

Utilizar Button quando executar ação.

Utilizar Link quando navegar.

---

## 111. Escolha entre Checkbox e Switch

Utilizar Checkbox em seleção de formulário.

Utilizar Switch quando a alteração for imediata.

---

## 112. Escolha entre Radio e Select

Utilizar Radio quando:

* houver poucas opções;
* comparação for importante;
* espaço permitir.

Utilizar Select quando:

* houver várias opções;
* espaço for limitado;
* comparação simultânea não for necessária.

---

## 113. Escolha entre Modal e página

Utilizar Modal quando:

* tarefa curta;
* decisão simples;
* contexto anterior importante.

Utilizar página quando:

* tarefa longa;
* múltiplas etapas;
* conteúdo extenso;
* navegação própria.

---

## 114. Escolha entre Drawer e Bottom Sheet

Utilizar Drawer em telas amplas.

Utilizar Bottom Sheet em mobile para contexto temporário.

---

## 115. Escolha entre Card e List Item

Utilizar Card quando:

* conteúdo possuir múltiplos atributos;
* ação ou mídia relevante;
* separação visual necessária.

Utilizar List Item quando:

* comparação sequencial;
* densidade maior;
* estrutura simples.

---

# Parte XXII — Anti-patterns

## 116. Componentes duplicados

Não criar variações paralelas com mesma responsabilidade.

Exemplo a evitar:

```text
PrimaryButton
MainButton
ActionButton
CTAButton
```

Sem diferença semântica.

---

## 117. Props excessivas

Componentes não deverão possuir propriedades que alterem completamente sua responsabilidade.

Se um componente acumular muitos comportamentos incompatíveis, deverá ser dividido.

---

## 118. Valores isolados

Não utilizar cores, espaçamentos ou tamanhos fora dos tokens sem justificativa.

---

## 119. Ícone sem significado

Não utilizar ícones apenas por decoração em controles.

---

## 120. Card excessivamente interativo

Evitar cartão com:

* clique global;
* múltiplos botões;
* menu;
* seleção;
* drag;
* link interno;

sem hierarquia clara.

---

## 121. Modal longo

Não utilizar Modal para:

* wizard;
* formulário extenso;
* navegação complexa;
* múltiplas seções.

---

## 122. Feedback apenas visual

Não comunicar sucesso, erro ou seleção apenas por cor ou animação.

---

## 123. Placeholder como rótulo

Não utilizar placeholder como único identificador do campo.

---

## 124. Tooltip obrigatório

Não depender de Tooltip para explicar ação essencial.

---

# Parte XXIII — Documentação de componente

## 125. Estrutura obrigatória

Cada componente deverá possuir:

* identificador;
* nome;
* objetivo;
* anatomia;
* variações;
* estados;
* propriedades;
* conteúdo;
* comportamento;
* responsividade;
* acessibilidade;
* exemplos;
* anti-patterns;
* tokens;
* testes.

---

## 126. Exemplo de ficha

```text
ID: RB-CMP-052
Nome: Place Card
Objetivo: representar Lugar em listas
Variações: list, grid, compact
Estados: default, selected, saved, planned
Tokens: card.*, color.*, spacing.*
Acessibilidade: foco, ações, texto alternativo
```

---

## 127. Exemplos visuais

A documentação futura poderá incluir:

* anatomia;
* variações;
* estados;
* uso correto;
* uso incorreto;
* responsividade;
* playground interativo.

---

# Parte XXIV — Testes

## 128. Testes unitários

Componentes deverão validar:

* renderização;
* propriedades;
* estados;
* eventos;
* conteúdo condicional;
* acessibilidade básica.

---

## 129. Testes de interação

Validar:

* teclado;
* clique;
* toque;
* foco;
* abertura;
* fechamento;
* seleção;
* loading;
* erro.

---

## 130. Testes visuais

Validar:

* variações;
* breakpoints;
* estados;
* textos longos;
* temas futuros;
* regressão.

---

## 131. Testes de acessibilidade

Validar:

* semântica;
* nome;
* foco;
* teclado;
* contraste;
* leitor de tela;
* zoom;
* redução de movimento.

---

## 132. Testes de conteúdo

Validar:

* texto longo;
* texto ausente;
* pluralização;
* números;
* datas;
* idioma;
* truncamento.

---

# Parte XXV — Rastreabilidade

## 133. Componentes e wireframes

| Área              | Componentes principais                                |
| ----------------- | ----------------------------------------------------- |
| Minhas Viagens    | Trip Card, Button, Empty State                        |
| Criar Viagem      | Text Field, Date Field, Number Stepper, Progress      |
| Visão Geral       | Trip Header, Trip Summary, Place Card, Alert Summary  |
| Explorar          | Search Field, Filter Bar, Chip, Place Card            |
| Detalhes do Lugar | Image, Carousel, Rating, Price Range, Place Status    |
| Mapa              | Map Marker, Cluster, Map Controls, Place Summary      |
| Salvos            | Place Card, Filter Bar, Empty State                   |
| Roteiro           | Day Selector, Activity Card, Travel Time, Free Period |
| Proposta          | Proposal Day, Proposal Activity, Proposal Summary     |
| Revisão           | Conflict Item, Conflict Summary                       |
| Configurações     | Settings List, Settings Section, Impact Summary       |

---

## 134. Componentes e especificações de interação

| Interações   | Componentes                                     |
| ------------ | ----------------------------------------------- |
| Navegação    | Bottom Navigation, Side Navigation, Top App Bar |
| Formulários  | Text Field, Select, Date Field, Button          |
| Filtros      | Filter Bar, Filter Group, Active Filters        |
| Salvar Lugar | Place Card, Icon Button, Toast                  |
| Mapa         | Map Marker, Map Controls, Bottom Sheet          |
| Roteiro      | Day Selector, Activity Card, Reorder Controls   |
| Conflitos    | Conflict Item, Modal, Alert Banner              |
| Proposta     | Proposal Day, Checkbox, Button Group            |

---

# Parte XXVI — Priorização

## 135. Lote 1 — Fundamentos de interface

Implementar primeiro:

1. Button;
2. Icon Button;
3. Link;
4. Text Field;
5. Text Area;
6. Search Field;
7. Checkbox;
8. Radio;
9. Select;
10. Chip;
11. Card;
12. List Item;
13. Badge;
14. Divider.

---

## 136. Lote 2 — Navegação e feedback

1. Bottom Navigation;
2. Side Navigation;
3. Top App Bar;
4. Tabs;
5. Inline Message;
6. Alert Banner;
7. Toast;
8. Progress Indicator;
9. Skeleton;
10. Empty State;
11. Error State;
12. Modal;
13. Bottom Sheet;
14. Drawer.

---

## 137. Lote 3 — Domínio de Viagem

1. Trip Card;
2. Trip Header;
3. Trip Summary;
4. Context Summary;
5. Place Card;
6. Place Summary;
7. Recommendation Reason;
8. Place Status;
9. Price Range;
10. Rating.

---

## 138. Lote 4 — Mapa e Roteiro

1. Map Marker;
2. Marker Cluster;
3. Map Controls;
4. Map Context Selector;
5. Day Selector;
6. Day Header;
7. Activity Card;
8. Travel Time;
9. Free Period Card;
10. Reorder Controls.

---

## 139. Lote 5 — Proposta e conflitos

1. Conflict Item;
2. Conflict Summary;
3. Proposal Day;
4. Proposal Activity;
5. Proposal Summary;
6. Impact Summary.

---

# Parte XXVII — Governança

## 140. Inclusão de componente

Um novo componente deverá:

* resolver necessidade recorrente;
* possuir responsabilidade clara;
* não duplicar componente existente;
* utilizar tokens;
* possuir acessibilidade;
* possuir documentação;
* possuir testes;
* possuir proprietário.

---

## 141. Alteração de componente

Alterações deverão considerar:

* dependências;
* telas afetadas;
* estados;
* acessibilidade;
* responsividade;
* compatibilidade;
* testes;
* migração.

---

## 142. Depreciação

Componentes obsoletos deverão:

* ser marcados;
* possuir substituto;
* possuir plano de migração;
* manter compatibilidade temporária;
* ter remoção planejada.

---

## 143. Variações

Nova variação só deverá ser criada quando:

* houver diferença semântica;
* o uso for recorrente;
* composição não resolver;
* acessibilidade permanecer consistente.

---

## 144. Exceções

Exceções deverão:

* ser raras;
* possuir justificativa;
* estar documentadas;
* não criar biblioteca paralela;
* não comprometer acessibilidade.

---

## 145. Uso por agentes de IA

Agentes que gerem componentes ou interfaces deverão:

* reutilizar componentes existentes;
* não criar duplicações;
* utilizar identificadores oficiais;
* consumir tokens semânticos;
* implementar estados documentados;
* preservar acessibilidade;
* respeitar responsividade;
* seguir microcopy oficial;
* manter rastreabilidade;
* registrar necessidade de novo componente.

---

## 146. Checklist de revisão

Antes de aprovar este documento, verificar:

* categorias estão definidas;
* componentes fundamentais estão definidos;
* componentes compostos estão definidos;
* componentes de domínio estão definidos;
* estados estão definidos;
* acessibilidade está definida;
* responsividade está definida;
* composição está definida;
* critérios de escolha estão definidos;
* anti-patterns estão definidos;
* testes estão definidos;
* rastreabilidade está definida;
* priorização está definida;
* governança está definida.

---

## 147. Declaração final

A Component Library transforma os fundamentos do Design System em elementos concretos e reutilizáveis.

Ela define como o RouteBook deverá construir interfaces por meio de componentes:

* consistentes;
* acessíveis;
* responsivos;
* semânticos;
* testáveis;
* reutilizáveis.

A biblioteca deverá permitir que novas superfícies sejam construídas sem recriar decisões já estabelecidas.

A próxima etapa deverá definir os padrões de composição que combinam esses componentes em experiências recorrentes.
