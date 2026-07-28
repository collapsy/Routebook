---
id: RB-IMP-002
title: Template de Incremento Vertical
description: Define a estrutura obrigatória para especificar incrementos executáveis do RouteBook.
document_type: implementation-template
owner: Delivery
status: Published
version: "1.0.0"
created: "2026-07-28"
last_updated: null
authors:
  - RouteBook Team
tags:
  - implementation
  - template
  - increment
related_documents:
  - RB-IMP-001
  - RB-IMP-003
  - RB-IMP-004
prerequisites:
  - RB-IMP-001
next_documents: []
ai_context:
  priority: high
  index: true
---

# Template — RB-INC-NNN

> Copie este arquivo para `docs/implementation/increments/rb-inc-nnn-slug.md` e substitua todos os placeholders.

## Metadados

| Campo | Valor |
| --- | --- |
| ID | RB-INC-NNN |
| Título | [título] |
| Estado | Planned / Ready / In Progress / Blocked / Done / Cancelled |
| Responsável | [papel ou pessoa] |
| Issue | #[número] |
| Branch | `[tipo]/rb-inc-nnn-slug` |
| Data de criação | AAAA-MM-DD |
| Última atualização | AAAA-MM-DD |

## 1. Resultado vertical

[Descreva o comportamento utilizável que existirá após o incremento.]

## 2. Problema

[Descreva o problema concreto, evitando listar apenas arquivos ou tecnologias.]

## 3. Valor entregue

[Explique quem recebe valor e como o resultado será observado.]

## 4. Escopo

- [item]
- [item]

## 5. Fora de escopo

- [item]
- [item]

## 6. Context Pack

- `docs/...`
- `docs/...`
- ADRs: `RB-ADR-NNN`

Caminho do Context Pack específico, quando existir:

```text
docs/implementation/context-packs/rb-inc-nnn-context-pack.md
```

## 7. Caminhos permitidos

```text
apps/...
modules/...
packages/...
docs/...
tests/...
```

## 8. Caminhos proibidos

```text
[path]
```

## 9. Dependências

- [incremento, decisão, serviço ou dado]

## 10. Decisões já tomadas

- [decisão que o executor não deve reabrir]

## 11. Critérios de aceite

- [ ] [comportamento verificável]
- [ ] [estado de erro]
- [ ] [acessibilidade]
- [ ] [segurança/privacidade]
- [ ] [documentação]

## 12. Cenários de teste

### Caminho principal

```gherkin
Dado [contexto]
Quando [ação]
Então [resultado]
```

### Erro ou indisponibilidade

```gherkin
Dado [contexto]
Quando [falha]
Então [comportamento seguro]
```

## 13. Comandos de validação

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
node scripts/validate-docs.mjs
```

Remova comandos ainda inexistentes e registre explicitamente por que não se aplicam.

## 14. Observabilidade

[Eventos, logs, métricas e erros necessários, sem dados sensíveis.]

## 15. Segurança e privacidade

[Threats, autorização, minimização, retenção e dados envolvidos.]

## 16. Acessibilidade e UX

[Estados de loading, vazio, erro, teclado, foco e conteúdo.]

## 17. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| [risco] | Baixa/Média/Alta | Baixo/Médio/Alto | [ação] |

## 18. Estratégia de rollback

[Como desfazer ou desativar a mudança com segurança.]

## 19. Evidências exigidas

- [ ] saída de testes;
- [ ] evidência visual quando houver UI;
- [ ] documentação atualizada;
- [ ] matriz de rastreabilidade atualizada.

## 20. Definition of Ready

- [ ] problema claro;
- [ ] escopo delimitado;
- [ ] critérios verificáveis;
- [ ] decisões bloqueantes resolvidas;
- [ ] Context Pack revisado;
- [ ] caminhos permitidos definidos;
- [ ] testes definidos.

## 21. Definition of Done

- [ ] critérios atendidos;
- [ ] testes executados;
- [ ] regressões avaliadas;
- [ ] segurança e privacidade avaliadas;
- [ ] documentação sincronizada;
- [ ] PR revisado;
- [ ] pendências separadas em novas issues.