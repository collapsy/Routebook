# RouteBook — Documentação Oficial

Este diretório contém a documentação canônica do RouteBook.

A documentação orienta produto, domínio, experiência, arquitetura, implementação, testes e operação. Ela não é um complemento posterior ao código: alterações de comportamento devem partir de requisitos e decisões registradas ou atualizá-los no mesmo incremento.

## Comece por aqui

Para compreender o projeto, leia nesta ordem:

1. [`core/routebook-bible.md`](./core/routebook-bible.md) — constituição semântica e princípios que não podem ser contraditos;
2. [`foundation/product-vision.md`](./foundation/product-vision.md) — visão do produto;
3. [`product/product-overview.md`](./product/product-overview.md) — definição funcional de alto nível;
4. [`product/mvp-definition.md`](./product/mvp-definition.md) — escopo do MVP;
5. [`domain/domain-model.md`](./domain/domain-model.md) — conceitos e agregados;
6. [`domain/ubiquitous-language.md`](./domain/ubiquitous-language.md) — linguagem oficial;
7. [`architecture/architecture-overview.md`](./architecture/architecture-overview.md) — visão arquitetural;
8. [`delivery/delivery-strategy-and-implementation-roadmap.md`](./delivery/delivery-strategy-and-implementation-roadmap.md) — estratégia de entrega;
9. [`implementation/README.md`](./implementation/README.md) — execução por incrementos;
10. [`registry.md`](./registry.md) — inventário completo.

## Hierarquia de autoridade

```text
RB-CORE-0004 — RouteBook Bible
→ Foundation e Product
→ Domain
→ UX e Design System
→ Architecture e ADRs
→ Data, Security, Privacy e Quality
→ Delivery, CI/CD e Operations
→ Incremento e Context Pack
→ Código, configuração e infraestrutura
```

Regras:

- uma camada inferior não pode redefinir silenciosamente uma camada superior;
- conflitos devem ser resolvidos por atualização documental ou novo ADR;
- o Modelo de Domínio é autoridade sobre conceitos e invariantes;
- ADRs são autoridade sobre decisões técnicas materiais;
- o incremento delimita o trabalho, mas não altera conceitos canônicos;
- memória de agente, conversa ou prompt não é fonte oficial.

## Áreas documentais

| Área | Finalidade |
| --- | --- |
| `core/` | documentos constitucionais e compatibilidade dos IDs `RB-CORE-*` |
| `foundation/` | visão, princípios, escopo e glossário do produto |
| `product/` | comportamento esperado, MVP, requisitos e jornadas |
| `ux/` | arquitetura da informação, fluxos, telas e interação |
| `design-system/` | foundations, componentes e padrões visuais |
| `domain/` | linguagem, entidades, invariantes, eventos e ciclos de vida |
| `architecture/` | módulos, integrações, dados, IA e ADRs |
| `data/` | modelos de dados, migrations e contratos de API |
| `security/` | arquitetura de segurança, ameaças e desenvolvimento seguro |
| `privacy/` | proteção de dados e operações de privacidade |
| `quality/` | estratégia e plano mestre de testes |
| `delivery/` | roadmap e estratégia de implementação |
| `development/` | ambiente e padrões de engenharia |
| `cicd/` | integração, entrega e releases |
| `operations/` | runbooks e procedimentos operacionais |
| `implementation/` | incrementos, Context Packs e rastreabilidade |

O inventário integral permanece em [`registry.md`](./registry.md).

## Estados documentais

O campo `status` do frontmatter representa o ciclo de publicação do documento:

- `Planned` — previsto, mas ainda não iniciado;
- `Draft` — em elaboração ou revisão;
- `Approved` — validado como referência oficial;
- `Published` — publicado no repositório e disponível como referência;
- `Deprecated` — substituído ou descontinuado;
- `Archived` — preservado apenas para histórico.

Em ADRs, a seção interna **Status** representa o ciclo da decisão arquitetural, que pode utilizar estados como `Proposed`, `Draft`, `Accepted`, `Implemented`, `Superseded` e `Rejected`. Portanto, publicação documental e aceitação da decisão são dimensões diferentes.

Nenhum agente pode alterar um estado decisório apenas porque um arquivo foi publicado.

## Cenário canônico de validação

O primeiro cenário real é uma viagem a **Pipa (RN), de 22 a 29 de agosto de 2026**, para três adultos, com hospedagem principal no Condomínio Solar Água.

Referências anteriores a julho de 2026 são inconsistências históricas e devem ser corrigidas quando o documento afetado for alterado. Nenhuma regra de produto pode depender exclusivamente de Pipa.

## Manutenção

Ao criar, mover, renomear ou alterar o status de um documento:

1. mantenha o frontmatter válido;
2. preserve um ID único;
3. atualize [`registry.md`](./registry.md);
4. revise `related_documents`, `prerequisites` e `next_documents`;
5. execute `node scripts/validate-docs.mjs`;
6. registre a alteração na issue e no pull request do incremento.

## Trabalho assistido por IA

Agentes devem obedecer ao [`AGENTS.md`](../AGENTS.md) e trabalhar com um Context Pack explícito.

Um Context Pack deve conter somente os documentos necessários, os caminhos permitidos, os critérios de aceite, as restrições e os comandos de validação aplicáveis.

Agentes não podem:

- criar novos conceitos de domínio sem decisão humana;
- alterar ADRs ou documentos canônicos fora do escopo;
- introduzir Providers ou dependências por conveniência;
- executar ações destrutivas ou de produção sem aprovação;
- usar memória de conversa como substituto do repositório;
- declarar testes executados quando não foram executados.

## Validação

A validação documental automatizada verifica progressivamente:

- frontmatter obrigatório;
- IDs duplicados;
- estados permitidos;
- sincronização com o registro;
- caminhos registrados;
- referências a documentos inexistentes;
- arquivos operacionais obrigatórios.

A automação complementa, mas não substitui, revisão semântica humana.