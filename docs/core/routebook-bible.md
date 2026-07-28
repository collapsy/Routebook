---
id: RB-CORE-0004
title: RouteBook Bible
description: Define a constituição semântica do RouteBook, seus conceitos permanentes, princípios de decisão e limites para produto, arquitetura e agentes.
document_type: core
owner: Foundation
status: Published
version: "1.0.0"
created: "2026-07-28"
last_updated: null
authors:
  - RouteBook Team
tags:
  - core
  - bible
  - constitution
  - domain
  - ai-first
related_documents:
  - RB-CORE-0001
  - RB-CORE-0002
  - RB-CORE-0003
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
prerequisites:
  - RB-CORE-0001
  - RB-CORE-0002
  - RB-CORE-0003
next_documents:
  - RB-FND-001
  - RB-DOM-001
ai_context:
  priority: critical
  index: true
---

# RB-CORE-0004 — RouteBook Bible

## Natureza

A RouteBook Bible é a constituição do projeto. Ela define princípios e relações que documentos, código e agentes não podem contradizer silenciosamente.

Documentos especializados contêm o detalhamento operacional. Esta Bible estabelece a interpretação permanente entre eles.

## Propósito

O RouteBook existe para ajudar viajantes a tomar decisões melhores antes e durante uma Viagem.

O produto não existe para maximizar quantidade de conteúdo, chamadas de Provider, tempo de tela ou automação. Toda capacidade deve contribuir para descoberta, compreensão, decisão, organização ou execução da Viagem.

## Conceitos constitucionais

### Viagem

É o contexto organizador do produto. Possui Destino, Período, grupo, Preferências, Restrições, referências geográficas e planejamento.

### Lugar

É uma opção descoberta ou catalogada. Um Lugar não faz parte do Roteiro apenas por ter sido visualizado ou salvo.

### Lugar salvo

Representa interesse. Salvar não cria compromisso e não altera automaticamente o Roteiro.

### Roteiro

É o planejamento editável da Viagem, organizado por Dia, Período, Atividade, deslocamento e tempo livre.

### Recomendação

É uma orientação contextual acompanhada dos fatores relevantes. Não equivale a Decisão e não modifica estado por si mesma.

### Proposta

É uma sugestão estruturada de mudança ainda não aplicada. Deve ser visualizável, comparável e explicitamente aceita, rejeitada ou parcialmente aceita.

### Decisão

É a escolha registrada pelo usuário ou por um ator autorizado. A responsabilidade final permanece humana.

### Decision Quality

É a capacidade de avaliar e aprender com resultados sem julgar o usuário ou alegar certeza inexistente.

## Invariantes

1. Recomendação não é Decisão.
2. Proposta não é estado aplicado.
3. Lugar salvo não é Atividade de Roteiro.
4. IA não altera estado canônico silenciosamente.
5. Mapa e lista devem preservar o mesmo significado.
6. Estimativa deve ser identificada como estimativa.
7. Incerteza não pode ser escondida por falsa precisão.
8. O domínio não depende de frameworks, banco, UI ou SDK de Provider.
9. Dados de uma Account não atravessam outra Account.
10. Contexto pessoal é minimizado e protegido.
11. Falha de Provider não redefine regras do produto.
12. O usuário pode manter períodos livres sem ser penalizado pelo sistema.

## Princípios de produto

- contexto antes de popularidade;
- valor antes de volume;
- visual antes de texto quando isso melhora compreensão;
- personalização progressiva;
- transparência antes de persuasão;
- controle do usuário antes de automação;
- planejamento flexível antes de roteiro rígido;
- acessibilidade e linguagem clara por padrão.

## Princípios de arquitetura

- monólito modular como ponto de partida;
- bounded contexts explícitos;
- Ports and Adapters nas fronteiras relevantes;
- contratos tipados e validados;
- persistência e Providers fora do domínio;
- evolução incremental e reversível;
- observabilidade, segurança e privacidade desde o desenho;
- infraestrutura adicionada somente quando existe uma necessidade concreta.

## Princípios AI-First

AI-First significa projetar o produto para usar IA onde ela aumenta utilidade, sem transformar IA em autoridade canônica.

A IA pode:

- analisar contexto permitido;
- classificar e resumir informações;
- gerar Recomendações e Propostas;
- explicar fatores;
- apoiar desenvolvimento e testes.

A IA não pode autonomamente:

- redefinir o domínio;
- aceitar ADR;
- conceder autorização ou consentimento;
- aplicar Proposta sem aprovação;
- executar mudança destrutiva;
- enviar secrets ou dados excessivos a Providers;
- declarar fatos externos sem proveniência adequada;
- substituir validação humana em risco elevado.

## Ordem de autoridade

```text
Bible
→ Foundation e Product
→ Domain
→ UX e Design System
→ Architecture e ADRs
→ Delivery, Quality e Operations
→ Incremento e Context Pack
→ Implementação
```

Quando houver conflito, a implementação deve parar no limite do incremento e registrar a divergência. O conflito não deve ser resolvido pela interpretação silenciosa de um agente.

## Cenário de validação

O primeiro cenário real é uma viagem a Pipa (RN), de **22 a 29 de agosto de 2026**, para três adultos. Ele serve como evidência prática, não como regra universal.

## Evolução

Esta Bible somente deve ser alterada quando um conceito permanente mudar. Funcionalidades, Providers, layouts e detalhes de implementação pertencem aos documentos especializados e não devem inflar a constituição.