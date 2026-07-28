---
id: RB-IMP-003
title: Template de Context Pack
description: Define o pacote mínimo de contexto fornecido a pessoas e agentes para executar um incremento do RouteBook.
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
  - context-pack
  - ai-first
  - template
related_documents:
  - RB-IMP-001
  - RB-IMP-002
  - RB-IMP-004
prerequisites:
  - RB-IMP-001
next_documents: []
ai_context:
  priority: high
  index: true
---

# Template — Context Pack do RB-INC-NNN

## 1. Missão do executor

[Uma frase descrevendo o resultado a produzir.]

## 2. Incremento

- ID: `RB-INC-NNN`
- Issue: `#[número]`
- Arquivo: `docs/implementation/increments/...`

## 3. Leitura obrigatória

Leia somente os documentos necessários, na ordem indicada:

1. `docs/core/routebook-bible.md`;
2. `[documento de produto]`;
3. `[documento de domínio]`;
4. `[documento de UX]`;
5. `[documento de arquitetura]`;
6. `[ADRs aplicáveis]`;
7. `AGENTS.md` e instruções locais.

## 4. Conceitos relevantes

| Termo oficial | Interpretação necessária |
| --- | --- |
| [termo] | [definição curta, sem criar sinônimo] |

## 5. Invariantes

- [invariante aplicável]
- [invariante aplicável]

## 6. Decisões arquiteturais aplicáveis

| ADR | Decisão que deve ser respeitada |
| --- | --- |
| RB-ADR-NNN | [síntese] |

## 7. Contratos existentes

- [schema, port, interface, evento ou rota]

## 8. Caminhos permitidos

```text
[path]
```

## 9. Caminhos somente leitura

```text
[path]
```

## 10. Caminhos proibidos

```text
[path]
```

## 11. Entradas disponíveis

- [fixture, configuração, contrato ou dado]

## 12. Saídas esperadas

- [arquivo, comportamento, teste ou evidência]

## 13. Critérios de aceite

- [ ] [critério verificável]

## 14. Restrições

- não alterar o domínio sem decisão explícita;
- não adicionar Provider ou dependência fora do escopo;
- não aplicar mudança destrutiva;
- não versionar secrets;
- não afirmar execução de teste não realizada;
- não expandir o incremento.

## 15. Comandos

```bash
[comandos reais do repositório]
```

## 16. Dados e privacidade

[Dados permitidos, dados proibidos, minimização e fixtures.]

## 17. Quando interromper e escalar

Interrompa e registre a divergência quando:

- um critério contradizer documento canônico;
- surgir novo conceito de domínio;
- for necessária decisão de Provider;
- houver risco destrutivo ou de segurança;
- o escopo não puder ser satisfeito pelos caminhos permitidos;
- dados ou credenciais necessários não estiverem disponíveis.

## 18. Formato do relatório final

- resumo do resultado;
- arquivos alterados;
- testes executados e resultados;
- testes não executados;
- riscos e pendências;
- mudanças documentais;
- link da issue e do pull request.