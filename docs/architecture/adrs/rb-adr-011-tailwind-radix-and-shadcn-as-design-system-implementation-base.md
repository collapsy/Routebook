---

id: RB-ADR-011

title: Adoção de Tailwind CSS, Radix Primitives e shadcn/ui como Base de Implementação do Design System
description: Registra a decisão de utilizar Tailwind CSS para estilização orientada por tokens, Radix Primitives para comportamentos acessíveis e shadcn/ui como fonte inicial de componentes controlados pelo RouteBook.

document_type: architecture_decision_record
owner: Architecture

status: Draft
version: "0.1.0"

created: "2026-07-24"
last_updated: null

authors:

- RouteBook Team

tags:

- architecture
- adr
- design-system
- tailwind-css
- radix-ui
- shadcn-ui
- react
- nextjs
- accessibility
- design-tokens
- components
- responsive-design
- theming
- frontend
- user-interface

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
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
- RB-DS-002
- RB-DS-003
- RB-DS-004
- RB-DOM-001
- RB-DOM-002
- RB-DOM-003
- RB-DOM-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-ARC-005
- RB-SEC-001
- RB-SEC-002
- RB-SEC-003
- RB-PRIV-001
- RB-PRIV-002
- RB-OBS-001
- RB-QA-001
- RB-QA-002
- RB-AI-001
- RB-AI-003
- RB-AI-004
- RB-AI-005
- RB-AI-006
- RB-GOV-001
- RB-GOV-002
- RB-DEL-001
- RB-DEV-001
- RB-CICD-001
- RB-INFRA-001
- RB-ADR-001
- RB-ADR-002
- RB-ADR-003
- RB-ADR-004
- RB-ADR-005
- RB-ADR-006
- RB-ADR-007
- RB-ADR-008
- RB-ADR-009
- RB-ADR-010

prerequisites:

- RB-FND-004
- RB-UX-001
- RB-UX-002
- RB-UX-003
- RB-UX-004
- RB-UX-005
- RB-UX-006
- RB-DS-001
- RB-DS-002
- RB-DS-003
- RB-DS-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-SEC-001
- RB-QA-001
- RB-QA-002
- RB-DEV-001
- RB-CICD-001
- RB-ADR-002
- RB-ADR-003
- RB-ADR-004
- RB-ADR-009
- RB-ADR-010

next_documents:

- RB-ADR-012

ai_context:
priority: critical
index: true
---

# RB-ADR-011 — Adoção de Tailwind CSS, Radix Primitives e shadcn/ui como Base de Implementação do Design System

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* Tailwind CSS será a ferramenta principal de estilização;
* CSS variables serão utilizadas para representar tokens semânticos;
* Radix Primitives será a base preferencial para componentes interativos complexos;
* shadcn/ui será utilizado como fonte inicial de componentes;
* o código adicionado pelo shadcn/ui passará a ser mantido pelo RouteBook;
* componentes deverão seguir os documentos canônicos de Design System;
* acessibilidade será requisito de implementação, não consequência presumida das bibliotecas;
* CSS Modules e CSS convencional continuarão permitidos em casos específicos;
* versões exatas deverão ser fixadas no repositório.

---

## 2. Contexto

O RouteBook será uma aplicação web responsiva e orientada à decisão.

Sua interface deverá combinar:

* navegação;
* mapas;
* listas;
* cards;
* filtros;
* formulários;
* calendários;
* timelines;
* itinerários;
* recomendações;
* Planning Conflicts;
* Itinerary Proposals;
* estados de carregamento;
* estados vazios;
* diálogos;
* menus;
* painéis;
* feedback;
* conteúdo visual;
* interações móveis.

As decisões anteriores estabeleceram:

* React;
* Next.js com App Router;
* TypeScript;
* monorepo;
* testes com Vitest, Testing Library e Playwright;
* documentação canônica de UX;
* documentação canônica de Design System.

Ainda é necessário definir como os princípios documentados deverão ser implementados fisicamente.

A solução deverá preservar:

* consistência visual;
* acessibilidade;
* responsividade;
* controle sobre o código;
* baixo acoplamento;
* produtividade;
* evolução incremental;
* compatibilidade com agentes de IA.

---

## 3. Problema

Qual estratégia deverá ser utilizada para implementar o Design System e estilizar a aplicação web, considerando:

* Next.js;
* React;
* TypeScript;
* responsividade;
* acessibilidade;
* tokens;
* theming;
* componentes interativos;
* produtividade;
* controle sobre o código;
* manutenção por uma equipe inicialmente pequena;
* desenvolvimento assistido por agentes de IA;
* prevenção de inconsistência visual?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. aderência aos documentos de Design System;
2. produtividade;
3. acessibilidade;
4. responsividade;
5. controle sobre os componentes;
6. composição;
7. integração com React;
8. integração com Next.js;
9. suporte a TypeScript;
10. tokens semânticos;
11. manutenção incremental;
12. baixo custo inicial;
13. testabilidade;
14. compatibilidade com Server e Client Components;
15. suporte a temas;
16. previsibilidade visual;
17. redução de CSS global;
18. legibilidade para agentes de IA;
19. prevenção de dependência visual fechada;
20. capacidade de evolução.

---

## 5. Restrições

A solução deverá:

* funcionar com Next.js App Router;
* funcionar com React;
* funcionar com TypeScript;
* suportar renderização no servidor;
* suportar Client Components;
* suportar acessibilidade;
* suportar responsividade mobile-first;
* permitir tokens semânticos;
* permitir customização completa;
* não depender obrigatoriamente de um Provider;
* não impor identidade visual externa ao RouteBook;
* não utilizar componentes inacessíveis por conveniência;
* não transformar utilities em substitutas da semântica do Design System;
* não exigir runtime client-side para estilização básica;
* permitir testes de componentes e jornadas.

---

## 6. Terminologia

### 6.1 Design Token

Valor nomeado que representa uma decisão visual ou comportamental reutilizável.

### 6.2 Primitive

Elemento básico de comportamento ou interface utilizado como fundamento para componentes superiores.

### 6.3 Component

Unidade reutilizável de interface com responsabilidade e contrato próprios.

### 6.4 Pattern

Composição recorrente de componentes utilizada para resolver um problema de experiência.

### 6.5 Feature Component

Componente específico de uma capacidade ou contexto do produto.

### 6.6 Utility Class

Classe de responsabilidade única utilizada para compor estilos.

### 6.7 Semantic Token

Token nomeado de acordo com sua função, e não apenas por seu valor visual.

### 6.8 Theme

Conjunto coerente de valores visuais aplicados aos mesmos tokens semânticos.

---

## 7. Princípio central

O Design System documentado pelo RouteBook será a fonte canônica das decisões visuais.

As ferramentas deverão implementar essas decisões.

```text
Design System canônico
→ tokens
→ primitives
→ componentes
→ padrões
→ features
→ páginas
```

Fluxo proibido:

```text
componente externo
→ aparência padrão
→ Design System adaptado posteriormente
```

---

## 8. Opções consideradas

### 8.1 Opção A — CSS global convencional

Utilizar arquivos CSS globais e classes sem tooling adicional.

#### Benefícios

* padrão nativo;
* ausência de dependência;
* controle completo;
* ampla compatibilidade;
* baixo overhead.

#### Limitações

* risco de colisões;
* crescimento desordenado;
* dificuldade de remoção;
* baixa rastreabilidade;
* necessidade de criar convenções próprias;
* maior custo de manutenção;
* maior risco de inconsistência.

#### Avaliação

CSS global será utilizado para fundamentos, resets e tokens, mas não como estratégia única.

---

### 8.2 Opção B — CSS Modules

Utilizar CSS Modules para todos os componentes.

#### Benefícios

* escopo local;
* suporte nativo do Next.js;
* CSS convencional;
* ausência de runtime;
* boa separação por componente;
* menor risco de colisões.

#### Limitações

* repetição de valores;
* maior quantidade de arquivos;
* composição de variantes mais trabalhosa;
* responsividade menos compacta;
* necessidade de convenções adicionais para tokens;
* maior custo para prototipação rápida.

#### Avaliação

CSS Modules continuará permitido em casos específicos, mas não será a estratégia principal.

---

### 8.3 Opção C — CSS-in-JS com runtime

Utilizar biblioteca que gere estilos em runtime.

#### Benefícios

* estilos próximos ao componente;
* props e temas;
* escopo;
* composição;
* tipagem em algumas soluções.

#### Limitações

* runtime adicional;
* complexidade com Server Components;
* impacto de bundle;
* hidratação;
* maior acoplamento;
* necessidade de configuração específica;
* benefício insuficiente para o RouteBook.

#### Avaliação

Foi rejeitada como estratégia principal.

---

### 8.4 Opção D — Biblioteca visual completa

Adotar uma biblioteca fechada ou opinionada de componentes visuais.

#### Benefícios

* ampla quantidade de componentes;
* produtividade imediata;
* consistência inicial;
* documentação;
* acessibilidade variável conforme a solução.

#### Limitações

* identidade visual externa;
* customização complexa;
* dependência de API;
* bundle;
* atualizações;
* dificuldade de alinhar completamente ao Design System;
* risco de aparência genérica.

#### Avaliação

Foi rejeitada como base principal.

---

### 8.5 Opção E — Tailwind CSS sem primitives

Utilizar Tailwind para estilização e implementar todos os comportamentos interativos internamente.

#### Benefícios

* produtividade;
* utilities;
* responsividade;
* ausência de runtime de estilos;
* controle visual;
* integração com Next.js.

#### Limitações

* Tailwind não implementa comportamento;
* diálogos, menus e popovers exigem foco e teclado;
* risco de componentes visualmente corretos e funcionalmente inacessíveis;
* maior custo de implementação.

#### Avaliação

Tailwind será adotado, mas acompanhado de primitives acessíveis.

---

### 8.6 Opção F — Tailwind CSS, Radix Primitives e shadcn/ui

Utilizar:

* Tailwind CSS para estilização;
* CSS variables para tokens;
* Radix Primitives para comportamentos interativos;
* shadcn/ui como fonte inicial de componentes editáveis.

#### Benefícios

* produtividade;
* controle completo do código;
* bom suporte a acessibilidade;
* primitives sem imposição visual;
* composição;
* integração com React;
* integração com Next.js;
* tokens por CSS variables;
* componentes modificáveis;
* boa legibilidade;
* baixo lock-in visual;
* compatibilidade com agentes de IA.

#### Limitações

* código copiado passa a ser responsabilidade do projeto;
* atualizações não são automáticas;
* risco de acumular componentes não utilizados;
* risco de misturar estilos;
* utilities podem se tornar extensas;
* Radix não garante sozinho acessibilidade final;
* necessidade de governança.

#### Avaliação

Oferece o melhor equilíbrio.

Foi selecionada.

---

## 9. Decisão

O RouteBook adotará:

* **Tailwind CSS** como ferramenta principal de estilização;
* **CSS variables** como representação principal de tokens semânticos;
* **Radix Primitives** como base preferencial para comportamentos interativos acessíveis;
* **shadcn/ui** como fonte inicial de componentes e padrões de composição;
* **código próprio versionado** para os componentes adicionados;
* **CSS Modules ou CSS convencional** para situações em que utilities não forem adequadas;
* **componentes nativos** quando primitives adicionais não forem necessárias.

---

## 10. Escopo da decisão

Esta decisão define:

* estratégia principal de estilização;
* uso de tokens;
* base de primitives;
* papel do shadcn/ui;
* organização de componentes;
* critérios para abstrações;
* acessibilidade;
* responsividade;
* temas;
* testes;
* limites para agentes de IA.

Esta decisão não define integralmente:

* paleta final;
* tipografia final;
* ícones finais;
* biblioteca de mapas;
* gráficos;
* animações específicas;
* ferramenta de documentação visual;
* plataforma de visual regression;
* layout final de cada página;
* todos os componentes do produto.

Esses elementos permanecem subordinados aos documentos de Design System e UX.

---

## 11. Tailwind CSS

Tailwind será utilizado para:

* layout;
* spacing;
* dimensionamento;
* tipografia;
* cores semânticas;
* bordas;
* sombras;
* estados;
* responsividade;
* alinhamento;
* posicionamento;
* motion simples;
* acessibilidade visual.

Tailwind não será tratado como Design System.

Ele será uma ferramenta de implementação.

---

## 12. Versão do Tailwind

O projeto deverá utilizar uma versão estável aprovada e fixada.

A configuração deverá considerar:

* compatibilidade com Next.js;
* suporte de browsers;
* theme variables;
* build;
* PostCSS quando aplicável;
* plugins;
* migrações de versão.

Atualizações principais deverão validar:

* tokens;
* utilities;
* reset;
* scanning;
* plugins;
* componentes;
* bundle;
* browsers.

---

## 13. CSS variables

Tokens semânticos deverão ser materializados preferencialmente como CSS variables.

Exemplo conceitual:

```css
:root {
  --color-background: oklch(0.99 0.005 95);
  --color-foreground: oklch(0.22 0.02 70);

  --color-surface: oklch(1 0 0);
  --color-surface-muted: oklch(0.97 0.01 90);

  --color-primary: oklch(0.62 0.16 195);
  --color-primary-foreground: oklch(0.99 0 0);

  --color-danger: oklch(0.58 0.22 28);
  --color-danger-foreground: oklch(0.99 0 0);

  --radius-small: 0.5rem;
  --radius-medium: 0.75rem;
  --radius-large: 1rem;
}
```

Os valores finais deverão seguir o Design System aprovado.

---

## 14. Tokens semânticos

Componentes deverão utilizar tokens por função.

Exemplos:

```text
background
foreground
surface
surface-muted
border
border-strong
primary
primary-foreground
secondary
danger
warning
success
focus-ring
```

Deverá ser evitado o acoplamento direto a nomes de cor física como:

```text
blue-500
gray-100
red-600
```

quando o valor representar uma decisão semântica permanente.

---

## 15. Tokens primitivos

Tokens primitivos poderão existir como base interna.

Exemplos:

* escalas de cor;
* spacing;
* radius;
* font size;
* shadow;
* duration.

Componentes de produto deverão preferir tokens semânticos.

---

## 16. Integração com Tailwind

Os tokens deverão ser expostos às utilities de forma coerente.

Exemplo conceitual:

```css
@import "tailwindcss";

@theme {
  --color-background: var(--rb-background);
  --color-foreground: var(--rb-foreground);
  --color-primary: var(--rb-primary);
  --color-primary-foreground: var(--rb-primary-foreground);
}
```

A sintaxe final deverá seguir a versão fixada.

---

## 17. Valores arbitrários

Valores arbitrários poderão ser utilizados para casos realmente específicos.

Exemplo:

```text
top-[117px]
```

Eles não deverão substituir tokens recorrentes.

Um valor arbitrário repetido deverá ser avaliado como candidato a token ou regra de componente.

---

## 18. Classes excessivas

Listas extensas de utilities deverão ser avaliadas quando:

* dificultarem leitura;
* repetirem-se;
* misturarem variantes;
* ocultarem semântica;
* aumentarem risco de divergência.

Possíveis soluções:

* componente;
* função de variantes;
* helper;
* CSS Module;
* classe semântica localizada.

---

## 19. Helper de classes

A aplicação poderá utilizar helper para combinar classes.

Exemplo conceitual:

```typescript
export function cn(...inputs: ClassValue[]): string {
  return mergeClasses(inputs);
}
```

A implementação deverá possuir dependências e comportamento conhecidos.

O helper não deverá ocultar regras de autorização ou comportamento.

---

## 20. Variantes

Componentes com variações controladas poderão utilizar uma estratégia declarativa.

Exemplo conceitual:

```typescript
type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger";
```

Variantes deverão representar decisões aprovadas.

Não deverão proliferar para cada necessidade localizada.

---

## 21. Radix Primitives

Radix será utilizado quando componentes exigirem comportamento complexo, como:

* Dialog;
* Alert Dialog;
* Dropdown Menu;
* Popover;
* Tooltip;
* Tabs;
* Select;
* Accordion;
* Navigation Menu;
* Context Menu;
* Toast, quando ainda adequado à versão adotada;
* focus management;
* portals;
* roving focus;
* keyboard navigation.

---

## 22. Radix não é Design System

Radix fornece primitives comportamentais.

O RouteBook continuará responsável por:

* aparência;
* conteúdo;
* semântica;
* tamanho;
* variantes;
* estados;
* mensagens;
* uso correto;
* testes;
* integração com UX.

---

## 23. Acessibilidade das primitives

O uso de uma primitive acessível não garante que a composição final será acessível.

A implementação deverá validar:

* label;
* accessible name;
* descrição;
* foco inicial;
* retorno de foco;
* navegação por teclado;
* escape;
* contraste;
* mensagem;
* ordem;
* conteúdo dinâmico;
* reduced motion.

---

## 24. Componentes nativos

Elementos HTML nativos deverão ser preferidos quando resolverem o problema adequadamente.

Exemplos:

* `button`;
* `a`;
* `input`;
* `select`;
* `details`;
* `dialog`, quando compatível com os requisitos;
* landmarks;
* headings.

Uma primitive não deverá substituir sem necessidade um comportamento nativo mais simples.

---

## 25. shadcn/ui

shadcn/ui será utilizado como:

* fonte inicial de código;
* referência de composição;
* acelerador de implementação;
* integração entre Tailwind e primitives;
* catálogo de componentes candidatos.

Não será tratado como:

* dependência visual fechada;
* Design System canônico;
* pacote imutável;
* fonte de verdade da identidade visual;
* autorização para copiar todos os componentes.

---

## 26. Ownership do código

Após um componente ser adicionado ao repositório:

* ele pertence tecnicamente ao RouteBook;
* deverá ser revisado;
* deverá seguir as convenções locais;
* deverá possuir testes conforme risco;
* deverá evoluir com o Design System;
* não dependerá de atualizações automáticas do registry.

---

## 27. Seleção de componentes

Somente componentes necessários deverão ser adicionados.

Critérios:

* caso de uso real;
* primitive adequada;
* acessibilidade;
* compatibilidade;
* bundle;
* manutenção;
* alinhamento visual;
* tests;
* ausência de alternativa nativa mais simples.

---

## 28. Registry externo

Itens de registries externos não deverão ser instalados automaticamente sem revisão.

A revisão deverá considerar:

* origem;
* licença;
* versão ou commit;
* dependências;
* scripts;
* acessibilidade;
* segurança;
* telemetria;
* código server-side;
* compatibilidade;
* qualidade.

---

## 29. Atualizações do shadcn/ui

Atualizações não deverão sobrescrever customizações sem revisão.

O processo poderá envolver:

1. consultar a versão nova;
2. comparar diferenças;
3. identificar correções;
4. adaptar manualmente;
5. executar testes;
6. revisar visualmente;
7. registrar mudança relevante.

---

## 30. Organização física

Estrutura conceitual inicial:

```text
apps/web/src/
├── app/
├── components/
│   ├── primitives/
│   ├── ui/
│   ├── patterns/
│   └── layout/
├── features/
├── styles/
│   ├── globals.css
│   ├── tokens.css
│   └── themes.css
└── lib/
```

A estrutura final deverá evitar duplicação entre `components` e `features`.

---

## 31. Primitives locais

Primitives locais poderão conter:

* Box;
* Stack;
* Inline;
* VisuallyHidden;
* Separator;
* Portal wrapper;
* Focus helpers.

Elas somente deverão ser criadas quando reduzirem repetição real e preservarem semântica.

---

## 32. Componentes de UI

A camada `ui` poderá conter componentes reutilizáveis como:

* Button;
* Input;
* Textarea;
* Select;
* Checkbox;
* Radio Group;
* Dialog;
* Dropdown Menu;
* Tooltip;
* Tabs;
* Badge;
* Card;
* Skeleton;
* Toast ou Notification;
* Empty State.

Esses componentes não deverão conhecer Trips ou Places.

---

## 33. Patterns

Patterns poderão representar composições recorrentes.

Exemplos:

* Form Field;
* Search Field;
* Filter Bar;
* Page Header;
* Confirmation Dialog;
* Responsive Sheet;
* Status Banner;
* Data List;
* Card Grid;
* Timeline Item;
* Map List Layout.

Patterns poderão conhecer semântica de experiência, mas não regras específicas de domínio.

---

## 34. Feature Components

Componentes de feature poderão representar:

* Trip Card;
* Place Card;
* Activity Timeline;
* Planning Conflict Panel;
* Recommendation Card;
* Itinerary Proposal Review;
* Distance Summary;
* Trip Collection.

Eles deverão utilizar componentes e tokens do Design System.

---

## 35. Pages

Páginas deverão compor:

* layouts;
* patterns;
* feature components;
* casos de uso;
* dados autorizados.

Elas não deverão reproduzir manualmente primitives existentes.

---

## 36. Package de Design System

O Design System poderá permanecer inicialmente dentro de `apps/web`.

A extração para:

```text
packages/design-system
```

somente deverá ocorrer quando:

* houver segundo consumidor real;
* a API estiver estável;
* houver ownership;
* houver testes;
* o build estiver definido;
* a extração reduzir duplicação;
* o package não depender da aplicação.

---

## 37. Server e Client Components

Componentes puramente visuais deverão ser compatíveis com Server Components quando possível.

A diretiva:

```typescript
"use client";
```

deverá existir apenas quando houver necessidade de:

* estado;
* eventos;
* hooks client-side;
* APIs do browser;
* primitive client-side;
* biblioteca incompatível com servidor.

---

## 38. Fronteira client-side

A menor fronteira interativa viável deverá ser utilizada.

Exemplo:

```text
Server Component
└── conteúdo estático
    └── Client Component interativo
```

Não deverá ser transformada uma página inteira em Client Component apenas porque contém um menu ou botão.

---

## 39. Props serializáveis

Componentes atravessando a fronteira servidor-cliente deverão receber props serializáveis e mínimas.

Não deverão receber:

* repositories;
* funções server-side arbitrárias;
* entidades completas;
* secrets;
* clients;
* objetos internos não serializáveis.

---

## 40. Responsividade

A implementação seguirá abordagem mobile-first.

Breakpoints deverão representar mudanças reais de composição.

Não deverão ser usados apenas porque existem na escala padrão.

Casos relevantes:

* navegação;
* cards;
* mapa e lista;
* timeline;
* painéis;
* formulários;
* Itinerary Proposal;
* filtros;
* dialogs e sheets.

---

## 41. Mapas e responsividade

A experiência com mapas deverá possuir alternativa em lista.

Em telas menores, a interface poderá utilizar:

* mapa alternado com lista;
* sheet;
* bottom panel;
* cards resumidos;
* controles compactos.

O mapa não deverá impedir acesso por teclado ou leitores de tela ao conteúdo essencial.

---

## 42. Layout primitives

Layouts recorrentes deverão utilizar padrões consistentes.

Exemplos:

* container;
* stack;
* grid;
* cluster;
* sidebar;
* split view;
* sticky actions;
* bottom action bar.

A nomenclatura deverá seguir os documentos de Design System.

---

## 43. Theming

O sistema deverá suportar ao menos uma arquitetura compatível com:

* tema claro;
* tema escuro futuro;
* preferência do sistema;
* temas de alto contraste quando aplicável.

A existência técnica de suporte não obriga a entrega de todos os temas no MVP.

---

## 44. Tema claro inicial

O tema claro poderá ser o primeiro tema entregue.

Mesmo assim, os componentes deverão utilizar tokens semânticos para evitar acoplamento a valores exclusivos desse tema.

---

## 45. Tema escuro

O tema escuro somente deverá ser liberado quando:

* tokens estiverem completos;
* contraste estiver validado;
* mapas estiverem compatíveis;
* imagens e overlays estiverem revisados;
* componentes estiverem testados;
* persistência da preferência estiver definida.

---

## 46. Preferência do sistema

Quando múltiplos temas existirem, a aplicação deverá considerar:

* preferência explícita do usuário;
* preferência do sistema;
* fallback;
* hidratação;
* prevenção de flash visual;
* armazenamento;
* privacidade.

---

## 47. Contraste

Todas as combinações relevantes deverão possuir contraste adequado.

Isso inclui:

* texto;
* ícones;
* borders funcionais;
* estados;
* foco;
* badges;
* mensagens;
* gráficos;
* overlays sobre imagens.

---

## 48. Focus ring

Elementos interativos deverão possuir indicador de foco visível.

O focus ring deverá utilizar token semântico.

Não deverá ser removido sem substituição equivalente.

---

## 49. Estados de interação

Componentes deverão representar, conforme aplicável:

* default;
* hover;
* focus-visible;
* active;
* disabled;
* loading;
* invalid;
* selected;
* expanded;
* pressed;
* dragged.

O estado visual deverá corresponder ao estado semântico.

---

## 50. Disabled e read-only

`disabled` e `read-only` possuem semânticas diferentes.

A implementação deverá preservar:

* foco;
* submissão;
* leitura;
* interação;
* explicação.

Ações não autorizadas poderão ser ocultadas ou desabilitadas conforme a experiência, mas a autorização continuará server-side.

---

## 51. Loading states

Loading deverá ser representado sem causar:

* layout shift excessivo;
* ação duplicada;
* perda de foco;
* conteúdo enganoso;
* bloqueio sem feedback.

Componentes poderão utilizar:

* spinner;
* skeleton;
* progress;
* texto;
* estado otimista.

---

## 52. Skeletons

Skeletons deverão aproximar a estrutura esperada.

Eles não deverão:

* simular conteúdo inexistente;
* permanecer indefinidamente;
* substituir mensagens de erro;
* produzir movimento excessivo.

---

## 53. Empty states

Empty states deverão explicar:

* o que está vazio;
* por que isso importa;
* qual ação é possível;
* se existe restrição.

Exemplos:

* nenhuma Trip;
* nenhum Place salvo;
* nenhum Planning Conflict;
* nenhuma Recommendation;
* nenhuma Itinerary Proposal.

---

## 54. Error states

Estados de erro deverão distinguir:

* validação;
* rede;
* Provider;
* autorização;
* recurso indisponível;
* erro inesperado.

Não deverão expor detalhes técnicos sensíveis.

---

## 55. Toasts e notificações

Toasts deverão ser utilizados para feedback transitório e não crítico.

Não deverão ser a única forma de comunicar:

* erro de formulário;
* ação destrutiva;
* perda de dados;
* autorização negada;
* conteúdo necessário.

Mensagens importantes deverão permanecer acessíveis no contexto.

---

## 56. Dialogs

Dialogs deverão possuir:

* título;
* descrição quando necessária;
* foco inicial adequado;
* retorno de foco;
* fechamento por teclado quando permitido;
* ações claras;
* tratamento de loading;
* largura responsiva.

Ações destrutivas deverão utilizar confirmação proporcional ao risco.

---

## 57. Sheets e drawers

Sheets poderão ser utilizadas para:

* navegação móvel;
* filtros;
* detalhes contextuais;
* painéis auxiliares.

Não deverão substituir páginas quando o conteúdo exigir navegação, histórico ou espaço próprio.

---

## 58. Menus

Menus deverão representar conjuntos de ações.

Não deverão ser utilizados para conteúdo longo ou formulários complexos.

Ações destrutivas deverão ser diferenciadas e confirmadas quando necessário.

---

## 59. Tooltips

Tooltips deverão complementar, não substituir:

* labels;
* texto essencial;
* instruções;
* mensagens de erro.

Deverão funcionar com:

* mouse;
* teclado;
* foco;
* dispositivos compatíveis.

---

## 60. Forms

Form Fields deverão padronizar:

* label;
* descrição;
* input;
* estado obrigatório;
* mensagem de erro;
* hint;
* associação por ID;
* spacing.

A validação visual deverá refletir os contratos do `RB-ADR-009`.

---

## 61. Formulários móveis

Campos deverão considerar:

* teclado adequado;
* autofill;
* tamanho de toque;
* scroll;
* foco;
* sticky actions;
* erros próximos;
* preenchimento parcial.

---

## 62. Ícones

Ícones deverão:

* possuir biblioteca ou fonte aprovada;
* utilizar tamanho consistente;
* ter `aria-hidden` quando decorativos;
* possuir accessible name quando representarem ação sem texto;
* evitar uso como única diferenciação de estado.

A biblioteca final poderá ser definida na implementação ou em decisão específica se estrutural.

---

## 63. Imagens

Componentes de imagem deverão considerar:

* dimensões;
* aspect ratio;
* fallback;
* alt text;
* loading;
* licença;
* origem;
* crop;
* conteúdo remoto.

Cards de Places não deverão quebrar quando uma imagem estiver ausente.

---

## 64. Motion

Motion deverá:

* possuir finalidade;
* ser curta;
* respeitar `prefers-reduced-motion`;
* não impedir interação;
* não ocultar conteúdo;
* não causar enjoo.

Animação não deverá ser adicionada apenas por ornamentação.

---

## 65. Z-index

Camadas deverão utilizar escala controlada.

Exemplos:

* base;
* sticky;
* dropdown;
* popover;
* overlay;
* modal;
* notification.

Valores arbitrários de `z-index` deverão ser evitados.

---

## 66. Portals

Portals deverão ser utilizados quando necessários para:

* overlays;
* dialogs;
* menus;
* tooltips.

A implementação deverá preservar:

* contexto de tema;
* foco;
* stacking;
* scroll locking;
* testes.

---

## 67. Scroll

Scroll customizado deverá ser evitado quando o comportamento nativo for suficiente.

Áreas customizadas deverão preservar:

* teclado;
* touch;
* wheel;
* foco;
* leitores de tela;
* descoberta visual.

---

## 68. Tipografia

A implementação deverá utilizar tokens tipográficos definidos no Design System.

Ela deverá distinguir:

* display;
* heading;
* body;
* label;
* caption;
* code;
* numeric data.

Tamanhos e pesos arbitrários deverão ser evitados.

---

## 69. Conteúdo longo

Conteúdo editorial ou Markdown poderá utilizar uma camada tipográfica específica.

Essa camada deverá:

* respeitar tokens;
* limitar largura;
* estilizar headings;
* estilizar links;
* estilizar listas;
* tratar imagens;
* manter contraste.

---

## 70. Tabelas

Tabelas somente deverão ser utilizadas para dados realmente tabulares.

Em telas pequenas, a estratégia poderá envolver:

* scroll horizontal;
* colunas prioritárias;
* cards;
* detalhes expansíveis.

A transformação não deverá remover relações importantes entre cabeçalhos e células.

---

## 71. Cards

Cards deverão representar agrupamento significativo.

Não deverão ser utilizados indiscriminadamente em todas as áreas.

Tipos possíveis:

* Trip Card;
* Place Card;
* Recommendation Card;
* Planning Conflict Card;
* Itinerary Proposal Card.

A composição deverá preservar hierarquia, ações e estados.

---

## 72. Design System e domínio

Componentes genéricos não deverão conhecer regras de domínio.

Exemplo:

```text
Button
→ não conhece Trip

TripCard
→ conhece apresentação da Trip

UpdateTrip
→ permanece no caso de uso
```

---

## 73. Autorização e interface

A interface poderá adaptar ações conforme permissões.

Entretanto:

* ocultar botão não autoriza;
* desabilitar botão não autoriza;
* remover rota não autoriza.

A autorização definitiva seguirá o `RB-ADR-008`.

---

## 74. Segurança

Componentes deverão evitar:

* HTML não sanitizado;
* URLs arbitrárias;
* estilos derivados de input não confiável;
* imagens remotas sem allowlist;
* links inseguros;
* abertura de janela sem proteção;
* injeção em classes.

---

## 75. Classes dinâmicas

Classes dinâmicas deverão ser construídas a partir de allowlists.

Exemplo adequado:

```typescript
const toneClasses = {
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
} as const;
```

Exemplo inadequado:

```typescript
const className = `bg-${externalColor}-500`;
```

---

## 76. Componentes de terceiros

Componentes externos deverão ser avaliados por:

* acessibilidade;
* bundle;
* dependências;
* manutenção;
* licença;
* compatibilidade;
* controle visual;
* Server Components;
* segurança;
* necessidade real.

---

## 77. Biblioteca de mapas

A biblioteca de mapas não fará parte do Design System.

A camada de interface deverá adaptar sua aparência e controles aos tokens do RouteBook quando permitido.

A decisão específica será registrada separadamente.

---

## 78. Documentação dos componentes

Cada componente relevante deverá documentar:

* finalidade;
* props;
* variantes;
* estados;
* acessibilidade;
* exemplos;
* limitações;
* uso incorreto;
* ownership.

A ferramenta de documentação visual poderá ser escolhida posteriormente.

---

## 79. Storybook

Storybook poderá ser adotado quando houver benefício comprovado para:

* catálogo;
* desenvolvimento isolado;
* documentação;
* estados;
* visual regression;
* colaboração.

Ele não será obrigatório para a primeira implementação.

Sua adoção poderá ser registrada em decisão separada quando estrutural.

---

## 80. Testes unitários e de componentes

Testing Library e Vitest deverão validar:

* accessible name;
* role;
* label;
* keyboard;
* foco;
* estados;
* variantes;
* eventos;
* erros;
* loading.

Os testes deverão priorizar comportamento.

---

## 81. Testes end-to-end

Playwright deverá validar:

* navegação por teclado;
* dialogs;
* menus;
* sheets;
* formulários;
* responsividade;
* foco;
* interações mobile;
* estados críticos.

---

## 82. Testes visuais

Visual regression poderá ser adotada para:

* tokens;
* componentes;
* temas;
* layouts;
* estados;
* responsividade.

Alterações visuais deverão possuir revisão humana.

---

## 83. Testes de acessibilidade

A automação deverá ser combinada com revisão manual.

Casos mínimos:

* contraste;
* headings;
* landmarks;
* foco;
* teclado;
* labels;
* dialogs;
* modais;
* mensagens;
* alternativa ao mapa.

---

## 84. Browsers

Os componentes deverão ser testados conforme a matriz do `RB-ADR-010`.

Tailwind e primitives deverão ser avaliados nos browsers suportados pelo produto.

A escolha da versão do Tailwind deverá considerar sua matriz real de compatibilidade.

---

## 85. Bundle

Dependências de componentes deverão ser monitoradas.

Deverão ser evitados:

* imports de biblioteca inteira;
* componentes não utilizados;
* ícones completos;
* utilities client-side desnecessárias;
* duplicação de primitives;
* múltiplas bibliotecas para o mesmo comportamento.

---

## 86. Performance

Estilos deverão ser produzidos preferencialmente no build.

Componentes não deverão adicionar JavaScript quando CSS e HTML forem suficientes.

A escolha entre Server e Client Components deverá considerar bundle e interação.

---

## 87. Cache

Assets de estilo gerados deverão possuir estratégia compatível com o build do Next.js.

Tokens e CSS não deverão depender de dados privados ou de Account.

---

## 88. Monorepo

Configurações compartilhadas somente deverão ser extraídas quando houver consumidor real.

Possibilidades futuras:

```text
packages/design-system
packages/config-tailwind
packages/icons
```

A criação deverá seguir o `RB-ADR-004`.

---

## 89. Naming

Componentes deverão utilizar nomes orientados por responsabilidade.

Exemplos adequados:

* `Button`;
* `FormField`;
* `TripCard`;
* `PlanningConflictPanel`;
* `ItineraryProposalReview`.

Exemplos inadequados:

* `BlueButton`;
* `BigBox`;
* `NiceCard`;
* `CustomComponent`;
* `CommonContainer`.

---

## 90. Imports

A aplicação deverá possuir superfícies públicas claras.

Importações por arquivos internos deverão ser evitadas quando o componente possuir entrada pública.

Barrel files deverão ser utilizados com cuidado para evitar:

* ciclos;
* bundle maior;
* exports acidentais;
* APIs excessivas.

---

## 91. Depreciação de componentes

Componentes substituídos deverão possuir processo de depreciação.

O processo poderá incluir:

* aviso;
* substituto;
* codemod;
* prazo;
* remoção;
* atualização de consumidores.

Não deverão coexistir indefinidamente múltiplas versões equivalentes.

---

## 92. Mudanças em tokens

Mudanças em tokens poderão afetar toda a aplicação.

Elas deverão considerar:

* contraste;
* hierarquia;
* componentes;
* temas;
* screenshots;
* mapas;
* estados;
* acessibilidade.

Mudanças relevantes deverão possuir revisão visual.

---

## 93. Desenvolvimento assistido por IA

Agentes deverão receber:

* documentos de Design System;
* tokens existentes;
* catálogo de componentes;
* padrões;
* exemplos;
* restrições;
* critérios de acessibilidade;
* testes esperados.

Eles deverão reutilizar componentes existentes antes de criar novos.

---

## 94. Limites para agentes

Agentes não poderão autonomamente:

* criar nova cor sem token;
* adicionar componente externo;
* instalar registry desconhecido;
* criar variante sem necessidade;
* remover label;
* remover focus ring;
* adicionar `aria` incorreto;
* transformar toda página em Client Component;
* utilizar valor arbitrário repetido;
* duplicar componente;
* alterar tema;
* atualizar shadcn/ui em massa;
* substituir HTML nativo por `div` clicável;
* ignorar reduced motion.

---

## 95. Código gerado por agentes

A revisão deverá avaliar:

* uso dos tokens;
* componente existente;
* semântica HTML;
* acessibilidade;
* responsividade;
* client boundary;
* bundle;
* naming;
* estados;
* testes;
* alinhamento ao Design System.

---

## 96. Consequências positivas

A decisão proporciona:

* produtividade;
* estilização consistente;
* tokens semânticos;
* controle do código;
* primitives acessíveis;
* baixo lock-in visual;
* integração com Next.js;
* composição;
* responsividade;
* melhor contexto para agentes;
* evolução incremental;
* ausência de runtime principal de estilos.

---

## 97. Consequências negativas

A decisão introduz:

* dependência do Tailwind;
* dependência de primitives;
* responsabilidade sobre componentes copiados;
* necessidade de revisar atualizações;
* risco de classes extensas;
* risco de inconsistência sem governança;
* necessidade de testes de acessibilidade;
* necessidade de controlar tokens;
* possível crescimento do código de UI.

---

## 98. Riscos

### 98.1 Tailwind tratado como Design System

Mitigações:

* documentos canônicos;
* tokens;
* componentes;
* revisão;
* catálogo.

### 98.2 Componentes shadcn não customizados

Mitigações:

* revisão;
* identidade visual;
* tokens;
* remoção de defaults inadequados.

### 98.3 Acessibilidade presumida

Mitigações:

* testes;
* revisão manual;
* labels;
* foco;
* teclado.

### 98.4 Classes excessivas

Mitigações:

* variantes;
* componentes;
* CSS Modules;
* helpers;
* revisão.

### 98.5 Componentes duplicados

Mitigações:

* catálogo;
* busca;
* ownership;
* convenção.

### 98.6 Dependência de registries externos

Mitigações:

* revisão;
* commit fixado;
* licença;
* importação seletiva;
* ownership local.

### 98.7 Client Components excessivos

Mitigações:

* fronteira mínima;
* review;
* bundle analysis;
* Server Components por padrão.

### 98.8 Tokens inconsistentes

Mitigações:

* fonte canônica;
* CSS variables;
* testes visuais;
* revisão.

---

## 99. Controles

Deverão ser implementados progressivamente:

* tokens semânticos;
* Tailwind fixado;
* primitives aprovadas;
* catálogo de componentes;
* revisão de registries;
* lint;
* testes de componentes;
* testes de acessibilidade;
* Playwright;
* análise de bundle;
* documentação;
* naming;
* theme validation;
* revisão visual.

---

## 100. Estratégia de implementação

### Etapa 1 — Fundação

* adicionar Tailwind CSS;
* fixar versão;
* configurar integração com Next.js;
* criar `tokens.css`;
* criar estilos globais;
* validar build.

### Etapa 2 — Tokens

* materializar cores;
* tipografia;
* spacing;
* radius;
* shadows;
* motion;
* focus;
* estados.

### Etapa 3 — shadcn/ui

* configurar `components.json`, quando utilizado;
* definir aliases;
* adicionar somente componentes iniciais;
* revisar o código;
* aplicar tokens.

### Etapa 4 — Primitives essenciais

* Button;
* Input;
* Form Field;
* Dialog;
* Dropdown Menu;
* Tabs;
* Tooltip;
* Sheet;
* Card;
* Badge.

### Etapa 5 — Patterns

* Page Header;
* Empty State;
* Confirmation Dialog;
* Filter Bar;
* Responsive Map Layout;
* Status Banner.

### Etapa 6 — Features

* Trip Card;
* Place Card;
* Activity Timeline;
* Recommendation Card;
* Planning Conflict Panel;
* Itinerary Proposal Review.

### Etapa 7 — Qualidade

* testes de componentes;
* teclado;
* acessibilidade;
* responsividade;
* browser matrix;
* bundle.

### Etapa 8 — Evolução

* avaliar Storybook;
* avaliar visual regression;
* avaliar extração para package;
* avaliar tema escuro.

---

## 101. Critérios de implementação concluída

A decisão estará implementada quando:

* Tailwind estiver configurado;
* versões estiverem fixadas;
* tokens semânticos existirem;
* estilos globais estiverem definidos;
* primeiro componente shadcn estiver revisado;
* primeira primitive Radix estiver integrada;
* Button utilizar tokens;
* Form Field estiver acessível;
* Dialog possuir foco correto;
* layout responsivo inicial existir;
* testes de componentes executarem;
* Playwright validar uma interação;
* nenhum componente básico depender de cores físicas arbitrárias como contrato.

---

## 102. Verificação

A verificação deverá incluir:

* build;
* typecheck;
* lint;
* renderização no servidor;
* hidratação;
* componente client-side;
* tokens;
* responsividade;
* teclado;
* focus ring;
* dialog;
* menu;
* formulário;
* estado de erro;
* loading;
* tema inicial;
* Chromium;
* Firefox;
* WebKit;
* análise de bundle.

---

## 103. Métricas

Poderão ser acompanhadas:

* componentes existentes;
* componentes duplicados;
* valores arbitrários repetidos;
* cores físicas utilizadas diretamente;
* Client Components;
* bundle de UI;
* falhas de acessibilidade;
* regressões visuais;
* componentes sem testes;
* tokens sem uso;
* variantes;
* dependências de UI;
* tempo de implementação.

---

## 104. Gatilhos de revisão

A decisão deverá ser revisada quando:

* Tailwind limitar requisito central;
* o volume de utilities prejudicar manutenção;
* Radix não atender comportamentos relevantes;
* shadcn/ui gerar custo de manutenção excessivo;
* outra solução demonstrar benefício material;
* o Design System precisar atender múltiplas plataformas;
* o package de componentes se tornar produto independente;
* requisitos de browser forem incompatíveis;
* o bundle se tornar inadequado;
* requisitos empresariais exigirem governança adicional.

---

## 105. Estratégia de rollback

A substituição da estratégia principal deverá ser registrada em novo ADR.

A migração deverá preservar:

* tokens;
* componentes;
* semântica;
* acessibilidade;
* variantes;
* testes;
* documentação;
* padrões;
* identidade visual.

A utilização de CSS variables e componentes locais deverá reduzir o custo de troca das ferramentas.

---

## 106. Alternativas futuras permitidas

Esta decisão não impede:

* CSS Modules;
* CSS convencional;
* componente nativo;
* biblioteca especializada de mapas;
* biblioteca de gráficos;
* animation library;
* Storybook;
* visual regression;
* package de Design System.

Cada adoção deverá possuir necessidade e escopo claros.

---

## 107. Decisões derivadas

Deverão ser avaliadas decisões sobre:

* biblioteca de ícones;
* mapas;
* Storybook;
* visual regression;
* tema escuro;
* motion;
* charts;
* editor de itinerário;
* drag and drop;
* internacionalização;
* documentação visual;
* package de Design System.

---

## 108. Próxima decisão

O `RB-ADR-012` deverá definir a estratégia de mapas, geocoding, rotas e cálculo de distâncias.

A decisão deverá avaliar:

* Google Maps Platform;
* Mapbox;
* MapLibre;
* OpenStreetMap;
* geocoding;
* Places;
* directions;
* matriz de distâncias;
* custos;
* quotas;
* licenciamento;
* cache;
* atribuição;
* precisão;
* portabilidade;
* PostGIS;
* integração com Place Catalog e Mobility.

A decisão deverá distinguir:

* mapa visual;
* Place Provider;
* geocoding;
* distância geográfica;
* distância por rota;
* duração por modo de deslocamento.

---

## 109. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-011
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o novo ADR;
* permanecer disponível;
* preservar o contexto histórico.

---

## 110. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* Tailwind está justificado;
* Radix está justificado;
* shadcn/ui está justificado;
* CSS Modules foram avaliados;
* CSS-in-JS foi avaliado;
* tokens estão definidos;
* CSS variables estão definidas;
* ownership de componentes está definido;
* registry externo está governado;
* primitives estão definidas;
* patterns estão definidos;
* features estão definidas;
* Server Components estão contemplados;
* Client Components estão contemplados;
* responsividade está definida;
* theming está definido;
* acessibilidade está definida;
* focus está definido;
* forms estão contemplados;
* maps estão contemplados;
* testes estão definidos;
* bundle está contemplado;
* agentes estão contemplados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* gatilhos de revisão estão definidos;
* supersessão está definida;
* Design System não foi confundido com Tailwind;
* shadcn/ui não foi tratado como dependência visual imutável;
* Radix não foi tratado como garantia automática de acessibilidade;
* não existem contradições com RB-DS-001;
* não existem contradições com RB-DS-002;
* não existem contradições com RB-DS-003;
* não existem contradições com RB-DS-004;
* não existem contradições com RB-ADR-003;
* não existem contradições com RB-ADR-004;
* não existem contradições com RB-ADR-010.

---

## 111. Declaração final

O RouteBook adotará Tailwind CSS, Radix Primitives e shadcn/ui como base de implementação de seu Design System.

Tailwind CSS será utilizado para:

* estilização;
* layout;
* responsividade;
* aplicação de tokens;
* estados visuais.

Radix Primitives será utilizado para:

* comportamentos interativos;
* gerenciamento de foco;
* navegação por teclado;
* primitives acessíveis.

shadcn/ui será utilizado para:

* acelerar a criação de componentes;
* fornecer código inicial editável;
* apoiar a composição entre Tailwind e primitives.

Nenhuma dessas ferramentas será a fonte canônica das decisões visuais.

Essa responsabilidade continuará pertencendo aos documentos do Design System do RouteBook.

Todo componente adicionado ao repositório passará a ser responsabilidade do projeto.

A implementação deverá preservar:

* tokens semânticos;
* HTML adequado;
* acessibilidade;
* responsividade;
* menor quantidade possível de JavaScript no cliente;
* testes;
* controle sobre dependências;
* coerência visual.

O RouteBook deverá utilizar essas ferramentas para construir uma experiência própria, e não para reproduzir a identidade visual padrão de bibliotecas externas.
