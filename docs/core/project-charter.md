---
id: RB-CORE-0002
title: Project Charter do RouteBook
description: Formaliza propósito, objetivos, limites, autoridade, stakeholders e critérios de sucesso do projeto RouteBook.
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
  - project-charter
  - governance
  - product
related_documents:
  - RB-CORE-0001
  - RB-CORE-0003
  - RB-CORE-0004
  - RB-FND-003
  - RB-PRD-002
  - RB-DEL-001
prerequisites:
  - RB-CORE-0001
next_documents:
  - RB-CORE-0003
ai_context:
  priority: critical
  index: true
---

# RB-CORE-0002 — Project Charter do RouteBook

## Mandato

Construir uma aplicação web visual e personalizável que ajude viajantes a tomar decisões de viagem com base em contexto, localização, tempo, orçamento e preferências.

## Problema

Informações relevantes estão distribuídas entre mapas, avaliações, redes sociais, sites de turismo e anotações. O viajante ainda precisa decidir quais opções combinam com seu contexto e como organizá-las de forma viável.

## Objetivo inicial

Validar o RouteBook em uma viagem real a Pipa (RN), de **22 a 29 de agosto de 2026**, para três adultos, utilizando a hospedagem como referência de distância e deslocamento.

## Resultados esperados

- uma Viagem configurada;
- Lugares relevantes apresentados em lista e mapa;
- distâncias compreensíveis a partir da Hospedagem;
- coleção de Lugares salvos;
- Roteiro manual editável;
- Recomendações determinísticas explicáveis;
- Propostas assistidas por IA aplicadas somente após aceitação explícita;
- evidência de que o produto reduziu esforço de pesquisa e organização.

## Escopo inicial

Inclui criação de Viagem, contexto do grupo, descoberta, catálogo curado, mapa, distância, Lugares salvos, Roteiro, conflitos, Recomendações e Propostas.

Não inclui reservas, pagamentos, marketplace, rede social, colaboração avançada, rastreamento contínuo de localização ou operação autônoma da IA.

## Autoridade

O responsável pelo repositório é a autoridade final do projeto pessoal. Mesmo quando uma pessoa acumular papéis, as responsabilidades de Product, Architecture, Domain, Quality, Security e Privacy permanecem distintas nos documentos e checklists.

## Restrições

- GitHub é a fonte canônica;
- documentação precede mudanças materiais;
- o domínio não depende de frameworks ou Providers;
- secrets não são versionados;
- Providers pagos não são ativados sem necessidade e limites;
- a `main` recebe mudanças por pull request;
- cada entrega possui escopo verificável;
- agentes não tomam decisões irreversíveis autonomamente.

## Critérios de sucesso

O MVP será considerado validado quando uma pessoa conseguir configurar a Viagem, descobrir opções, entender sua distribuição geográfica, montar um Roteiro utilizável e tomar pelo menos uma decisão assistida com compreensão do motivo.

A conclusão técnica de funcionalidades não substitui validação de utilidade com o cenário real.

## Governança de mudança

Mudanças no mandato, no escopo estrutural, no modelo de domínio ou nas decisões técnicas duradouras exigem atualização dos documentos correspondentes e, quando aplicável, ADR.