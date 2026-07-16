# RouteBook — Registro de Documentos

Este arquivo mantém o inventário oficial da documentação do RouteBook.

Ele deve ser atualizado sempre que um documento for criado, renomeado, movido, versionado ou tiver seu status alterado.

## Documentos registrados

| ID         | Documento             | Área       | Status | Versão | Arquivo                                                     |
| ---------- | --------------------- | ---------- | ------ | ------ | ----------------------------------------------------------- |
| RB-FND-001 | Visão do Produto      | Foundation | Draft  | 0.1.0  | [product-vision.md](./foundation/product-vision.md)         |
| RB-FND-002 | Princípios do Produto | Foundation | Draft  | 0.1.0  | [product-principles.md](./foundation/product-principles.md) |
| RB-FND-003 | Escopo do Produto | Foundation | Draft | 0.1.0 | [product-scope.md](./foundation/product-scope.md) |
| RB-FND-004 | Glossário do Produto | Foundation | Draft | 0.1.0 | [product-glossary.md](./foundation/product-glossary.md) |
| RB-PRD-001 | Visão Geral do Produto | Product | Draft | 0.1.0 | [product-overview.md](./product/product-overview.md) |
| RB-PRD-002 | Definição do MVP | Product | Draft | 0.1.0 | [mvp-definition.md](./product/mvp-definition.md) |
| RB-PRD-003 | Personas | Product | Draft | 0.1.0 | [personas.md](./product/personas.md) |
| RB-PRD-004 | Jornadas do Usuário | Product | Draft | 0.1.0 | [user-journeys.md](./product/user-journeys.md) |
| RB-PRD-005 | Casos de Uso | Product | Draft | 0.1.0 | [use-cases.md](./product/use-cases.md) |
| RB-PRD-006 | Requisitos Funcionais | Product | Draft | 0.1.0 | [functional-requirements.md](./product/functional-requirements.md) |

## Status possíveis

* `Planned`: documento previsto, mas ainda não iniciado;
* `Draft`: documento em elaboração ou aguardando validação;
* `Approved`: documento validado e adotado como referência oficial;
* `Deprecated`: documento substituído ou descontinuado;
* `Archived`: documento mantido apenas para histórico.

## Regras de manutenção

* Cada documento deve possuir um identificador único.
* O ID registrado deve ser igual ao informado no frontmatter do arquivo.
* O caminho deve apontar para o arquivo atual.
* O status e a versão devem permanecer sincronizados com o frontmatter.
* Documentos removidos não devem desaparecer sem histórico; devem ser marcados como `Deprecated` ou `Archived` quando necessário.
