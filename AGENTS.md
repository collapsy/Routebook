# AGENTS.md — Regras para agentes no RouteBook

Este arquivo contém instruções obrigatórias para qualquer agente de IA que analise ou altere o repositório.

## 1. Missão

Ajudar a construir o RouteBook por incrementos pequenos, verificáveis e rastreáveis, preservando o produto, o domínio, a arquitetura e a segurança definidos na documentação.

## 2. Fonte de verdade

O repositório é a fonte canônica. Memória do agente, conversa, prompt externo e conhecimento presumido não substituem arquivos versionados.

Antes de alterar código ou documentação, leia:

1. `docs/core/routebook-bible.md`;
2. `docs/README.md`;
3. o incremento em `docs/implementation/increments/`;
4. o Context Pack indicado pelo incremento;
5. os documentos e ADRs listados no Context Pack;
6. instruções `AGENTS.md` mais específicas existentes no caminho alterado.

## 3. Hierarquia

```text
RouteBook Bible
→ Foundation e Product
→ Domain
→ UX e Design System
→ Architecture e ADRs
→ Delivery, Quality e Operations
→ Incremento e Context Pack
→ Implementação
```

Em conflito, pare no limite da tarefa e registre a divergência. Não escolha silenciosamente a interpretação mais conveniente.

## 4. Unidade de trabalho

Cada tarefa deve corresponder a um incremento ou a uma correção explicitamente vinculada a uma issue.

O agente deve receber ou identificar:

- objetivo;
- problema;
- documentos aplicáveis;
- caminhos permitidos;
- critérios de aceite;
- testes obrigatórios;
- riscos;
- itens fora de escopo.

Não expanda o escopo para “aproveitar” a alteração.

## 5. Caminhos permitidos

Altere somente os caminhos declarados no incremento ou na issue.

Caso um arquivo adicional seja indispensável:

1. explique a necessidade no pull request;
2. mantenha a mudança mínima;
3. atualize o incremento ou Context Pack;
4. não altere documentos canônicos apenas para fazer a implementação passar.

## 6. Domínio

O domínio deve permanecer independente de:

- Next.js, React ou outro framework;
- banco de dados ou ORM;
- SDK de Provider;
- HTTP e detalhes de transporte;
- componentes visuais;
- ambiente de execução específico.

Novos conceitos, invariantes, estados, eventos ou relações exigem validação humana e atualização dos documentos de Domain.

Não crie sinônimos para termos definidos na linguagem ubíqua.

## 7. Arquitetura e dependências

- respeite o monólito modular e os bounded contexts;
- dependa de contratos públicos, não de internals de outro módulo;
- evite Shared Kernel amplo;
- não adicione dependência sem necessidade demonstrável;
- não ative Redis, Inngest, R2, OpenFeature ou outro Provider apenas porque existe ADR;
- mantenha Ports and Adapters nas fronteiras externas;
- registre decisão material ou irreversível em ADR.

## 8. IA no produto

A IA produz Recomendações e Propostas, não Decisões aplicadas silenciosamente.

Toda integração de IA deve possuir:

- input minimizado;
- schema de output validado;
- limites de custo e tempo;
- tratamento de erro;
- fallback determinístico quando aplicável;
- proveniência e versão;
- avaliação;
- aprovação explícita antes de alterar estado canônico.

Nunca envie secrets, dados excessivos ou contexto privado desnecessário a um modelo.

## 9. Segurança e privacidade

É proibido:

- versionar secrets ou credenciais;
- usar dados pessoais reais em fixtures públicas;
- desabilitar autorização para simplificar testes;
- registrar tokens, sessões ou conteúdo sensível em logs;
- executar migração destrutiva ou ação de produção sem aprovação;
- introduzir rastreamento comportamental sem consentimento e finalidade documentados.

## 10. Implementação

- prefira a menor solução que satisfaça os critérios de aceite;
- preserve tipagem estrita;
- valide inputs em fronteiras;
- trate estados de loading, vazio, erro e indisponibilidade;
- diferencie dado confirmado, estimado, inferido e indisponível;
- mantenha acessibilidade por teclado e semântica;
- não use mocks como se fossem integração concluída;
- não implemente funcionalidades fora do incremento.

## 11. Testes

O agente deve executar os comandos definidos pelo incremento e registrar os resultados reais.

Nunca declare um teste como executado quando ele não foi executado.

O mínimo esperado é:

- teste unitário para regra de domínio;
- teste de integração para fronteiras relevantes;
- teste de interface para estados principais;
- teste E2E para jornada crítica quando a infraestrutura existir;
- validação documental quando documentação for alterada.

Falhas preexistentes devem ser diferenciadas de regressões introduzidas.

## 12. Documentação

Ao alterar comportamento, revise os documentos relacionados.

Ao criar documento:

- use ID único;
- inclua frontmatter;
- atualize `docs/registry.md`;
- preserve links e relações;
- execute `node scripts/validate-docs.mjs`.

O campo `status` do frontmatter representa publicação documental. O status interno de um ADR representa a decisão arquitetural.

## 13. Git e pull requests

- não faça push direto na `main`;
- use branch vinculada a uma issue ou incremento;
- mantenha commits compreensíveis;
- não misture refatoração ampla com funcionalidade;
- descreva impacto, validação, riscos e documentos no PR;
- inclua `Closes #<issue>` quando aplicável;
- preserve mudanças existentes do usuário.

## 14. Ações que exigem decisão humana

- mudar visão, princípios ou escopo estrutural;
- alterar invariantes ou linguagem de domínio;
- aceitar, substituir ou rejeitar ADR;
- escolher Provider pago ou compromisso irreversível;
- executar ação destrutiva;
- alterar política de privacidade, retenção ou consentimento;
- aplicar Proposta de IA sem confirmação;
- integrar na `main`.

## 15. Relatório final do agente

Ao concluir, informe objetivamente:

- arquivos alterados;
- comportamento entregue;
- testes executados e resultados;
- testes não executados e motivo;
- riscos ou pendências;
- issue e pull request relacionados.

Não esconda limitações nem apresente intenção como trabalho concluído.