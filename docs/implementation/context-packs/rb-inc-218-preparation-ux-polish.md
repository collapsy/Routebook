---
id: RB-CTX-218
title: Context Pack do RB-INC-218 — Clareza e continuidade no wizard
description: Delimita as correções de compreensão e navegação encontradas na preparação de Trips sem Itinerary, mantendo os contratos canônicos e a distinção entre Proposal e Roteiro.
document_type: implementation-context-pack
owner: Experience and Quality
status: Draft
version: "0.2.0"
created: "2026-10-09"
last_updated: "2026-10-09"
authors: [RouteBook Team]
tags: [implementation, context-pack, ux, wizard, preparation, responsive]
related_documents: [RB-INC-218, RB-INC-207, RB-INC-211, RB-INC-212, RB-INC-213, RB-INC-217, RB-CORE-0004, RB-PRD-004, RB-UX-001, RB-UX-002, RB-UX-005, RB-QA-001, RB-QA-002]
prerequisites: [RB-INC-217]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-218 — Clareza e continuidade no wizard

## 1. Missão

Corrigir três fricções verificadas ao navegar na preparação: entrada inexplicada no wizard para Trip sem Itinerary, linguagem que confunde geração com revisão de Proposal, e posição/foco do conteúdo após mudar de etapa em mobile e desktop.

## 2. Leitura obrigatória

1. `AGENTS.md`, RB-CORE-0004 e `docs/README.md`;
2. RB-INC-207 e RB-CTX-207, para o propósito, os passos e os limites do wizard;
3. RB-INC-211 a RB-INC-213 e seus Context Packs, para revisão, onboarding e geração;
4. RB-INC-217 e RB-CTX-217, para a jornada E2E responsiva vigente;
5. RB-PRD-004, nos fluxos de Trip, preparação, Proposal e Roteiro;
6. RB-UX-001, RB-UX-002 e RB-UX-005, para arquitetura, fluxos, foco, navegação e responsividade;
7. RB-QA-001 e RB-QA-002, para testes e acessibilidade;
8. implementação corrente dos arquivos autorizados, specs E2E existentes e qualquer `AGENTS.md` mais específico;
9. `docs/registry.md` e `docs/implementation/traceability-matrix.md`.

## 3. Base observada

- A rota do Roteiro de uma Trip `draft` sem Itinerary pode encaminhar para Lugares sem explicar a razão/contexto.
- A tela `/preparacao/proposta` é um formulário/estado anterior à geração, mas a etapa 4 do wizard usa linguagem de revisão de Proposal existente.
- A navegação entre páginas pode preservar uma posição de rolagem que encobre o início da etapa sob o cabeçalho fixo.
- O título longo da geração tem quebras excessivas em desktop.
- Os cenários relevantes são uma nova Trip sem Roteiro e uma Trip existente sem Roteiro, com estado vazio/parcial tratado separadamente.

## 4. Contratos a preservar

- Trip, TripPlacePreference, TravelerProfile, Itinerary e ItineraryProposal permanecem as fontes canônicas vigentes.
- Uma Proposal é uma sugestão não aplicada. Gerar ou navegar não aceita a Proposal nem cria Activity.
- Abrir Roteiro é read-only quando não há Itinerary. A ação explicitamente submetida “Começar roteiro” cria o Itinerary vazio com os Dias do período da Trip; é idempotente e exige `trip:edit` no servidor.
- Na etapa de geração sem Itinerary, explicar a pré-condição e oferecer “Começar roteiro”; depois do POST, retornar à etapa de geração, sem disparar geração de Proposal.
- Só se apresenta “sem Roteiro” quando não existe Itinerary; não inferir essa condição apenas de uma lista de Dias vazia.
- `Trip.status`, período da Trip e elegibilidade não são recalculados nem alterados pela camada UX.
- Não persistir progresso do wizard, estado derivado ou cópia do Contexto.
- Não reinterpretar datas passadas como encerramento nem bloquear uma ação atual sem contrato de produto.

## 5. Regras de UX/QA

1. Informar a situação real e explicar o redirecionamento em linguagem direta.
2. Oferecer um próximo passo primário compatível com as fontes existentes e um retorno claro à visão da Trip.
3. Chamar a etapa 4 de “Gerar proposta” antes da geração. Reservar “Revisar proposta” para uma Proposal que já foi criada.
4. Não alterar o wording ou o estado da página de revisão persistida além do necessário para remover a contradição.
5. Na navegação de etapa, deixar heading e indicador no viewport; respeitar reduced motion e manter visibilidade do foco.
6. Layout responsivo não deve causar corte, sobreposição ou overflow horizontal.
7. Manter navegação por teclado e semântica; leitores de tela recebem mudança de etapa sem duplicação de anúncios.

## 6. Caminhos permitidos

Somente os caminhos listados em RB-INC-218. O componente opcional de foco/scroll requer justificativa no diff. Os specs de recomendações, validação multi-destino e Guia podem ser ajustados apenas para preparar explicitamente o Itinerary vazio que seus cenários consultam, pois a rota `/roteiro` não cria mais Itinerary por GET; os testes não devem depender dessa escrita implícita. Não alterar helpers globais do Playwright, setup, fixtures compartilhadas, rotas de autenticação ou módulos de domínio.

## 7. Testes mínimos

- componente: rótulo e heading coerentes quando a etapa é pré-geração e quando existe Proposal;
- rota/integração: Trip sem Itinerary explica e apresenta navegação de continuação sem escrita colateral;
- diferenciação: Itinerary existente vazio ou parcial não é apresentado como ausência de Itinerary;
- responsividade E2E: entrar e avançar etapas, verificando heading visível no viewport nos projetos desktop e mobile;
- semântica: localizar ações por role/nome acessível; verificar foco visível quando aplicável;
- invariantes: navegação não cria Proposal/Activity e não altera Itinerary;
- UX manual no Preview com nova Trip e Trip existente sem Roteiro; parar antes de gerar/aceitar Proposal quando o teste puder afetar estado persistente.

## 8. Comandos e gates

Executar os comandos definidos na seção de validação do RB-INC-218, além dos gates de CI aplicáveis. Registrar falhas de ambiente e distinguir baseline de regressão. Não declarar Preview, E2E ou testes que não tenham sido realmente executados.

## 9. Fora de escopo e escalonamento

Datas passadas, lifecycle/status, cópias gerais do produto, redesign, analytics, alteração de regras de negócio e limpeza de dados estão fora de escopo. Se a correção exigir uma decisão dessas, parar, registrar a evidência e solicitar revisão do incremento antes de editar.

## 10. Gate

Ao concluir, apresentar diff, testes, evidência Preview, limitações e riscos. Não fazer merge sem autorização humana explícita.
