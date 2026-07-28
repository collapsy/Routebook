# Contribuindo com o RouteBook

O RouteBook é um projeto pessoal desenvolvido com apoio de agentes de IA. Contribuições devem preservar a documentação-first, o domínio e a rastreabilidade do repositório.

## Antes de começar

Leia:

- `README.md`;
- `AGENTS.md`;
- `docs/README.md`;
- `docs/core/routebook-bible.md`;
- o incremento e o Context Pack aplicáveis.

## Fluxo obrigatório

1. Crie ou utilize uma issue com objetivo e critérios de aceite.
2. Crie uma branch a partir da `main` atualizada.
3. Limite a mudança a um incremento ou correção coerente.
4. Implemente e teste.
5. Atualize a documentação relacionada.
6. Execute a validação documental.
7. Abra pull request para `main`.
8. Integre somente após revisão e checks válidos.

## Nomes de branch

Formatos recomendados:

```text
feat/rb-inc-001-monorepo-bootstrap
fix/issue-123-descricao
chore/rb-inc-000-readiness
docs/descricao
```

## Commits

Use mensagens objetivas no padrão Conventional Commits quando possível:

```text
feat(trip): criar agregado inicial
fix(map): tratar distância indisponível
docs: atualizar contexto do incremento
test(itinerary): cobrir conflito de horários
chore: configurar validação documental
```

Commits devem representar unidades compreensíveis. Não misture formatação global, refatoração ampla e mudança funcional sem necessidade.

## Pull request

O PR deve informar:

- problema e objetivo;
- issue ou incremento;
- mudanças realizadas;
- caminhos afetados;
- testes executados e resultados;
- evidências visuais quando houver UI;
- riscos e rollback;
- documentos atualizados;
- itens não realizados.

Não declare validação que não foi executada.

## Definition of Ready

Uma implementação pode começar quando houver:

- problema claro;
- critérios de aceite verificáveis;
- escopo e fora de escopo;
- documentos de referência;
- caminhos permitidos;
- riscos conhecidos;
- estratégia de teste;
- dependências ou decisões bloqueantes resolvidas.

## Definition of Done

Uma mudança está concluída quando:

- critérios de aceite foram atendidos;
- código está tipado, legível e revisável;
- testes aplicáveis passaram;
- estados de erro e indisponibilidade foram tratados;
- segurança, privacidade e acessibilidade foram consideradas;
- documentação e registro foram atualizados;
- não existem secrets;
- PR possui evidências suficientes;
- pendências restantes estão explícitas.

## Documentação

Novos documentos precisam de frontmatter, ID único e registro em `docs/registry.md`.

Execute:

```bash
node scripts/validate-docs.mjs
```

Publicação documental e aceitação de uma decisão arquitetural são dimensões distintas. Não altere o status interno de ADR sem decisão explícita.

## Dependências

Uma nova dependência deve:

- resolver necessidade do incremento;
- ter manutenção e licença avaliadas;
- não duplicar capacidade existente;
- não acoplar o domínio a Provider;
- ser registrada no PR;
- receber ADR quando representar compromisso arquitetural material.

## Segurança

Nunca versione:

- tokens;
- chaves de API;
- senhas;
- cookies ou sessões;
- dumps com dados pessoais;
- `.env` real;
- arquivos de credenciais de Providers.

Use exemplos fictícios e variáveis documentadas em `.env.example` quando esse arquivo passar a existir.

## Licença

Enquanto não existir um arquivo `LICENSE`, contribuições não tornam o projeto open source. Todo conteúdo permanece com todos os direitos reservados ao responsável pelo repositório.