---
id: RB-INC-104
title: Serviço de Aplicação para Edição Persistida de Itinerary Proposal
description: Materializa a edição persistida de Proposed Activity por meio do application service e do repository PostgreSQL canônicos.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-08"
last_updated: "2026-08-08"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - proposal-editing
  - postgresql
  - application-service
related_documents:
  - RB-PRD-006
  - RB-UX-005
  - RB-INC-103
prerequisites:
  - RB-INC-103
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-104 — Serviço de Aplicação para Edição Persistida de Itinerary Proposal

## 1. Objetivo

Materializar a edição persistida de uma `ProposedActivity` em uma `ItineraryProposal` pronta, compondo a primitiva de domínio do RB-INC-103 com o `ItineraryProposalRepository` canônico e validando o round-trip real no PostgreSQL.

Issue: #237.

Branch: `feature/rb-inc-104-persisted-itinerary-proposal-edit`.

PR: #238.

## 2. Lacuna canônica

O RB-INC-103 introduziu a regra pura de edição, mas não persistia o novo estado. A próxima fronteira necessária é um application service que sempre recarregue a Proposal corrente, reaplique as invariantes do domínio e somente então execute `repository.save`.

Durante a integração PostgreSQL, o incremento também revelou que a constraint histórica de lifecycle tratava Proposal `ready` como estruturalmente imutável ao exigir `updated_at = generated_at`. Como a edição de Proposal pronta é um requisito funcional canônico, essa restrição precisou ser evoluída para admitir `updated_at >= generated_at`, sem relaxar os demais estados do lifecycle.

## 3. Escopo

- comando de edição com:
  - `tripId`;
  - `itineraryProposalId`;
  - `proposedActivityId`;
  - `changes`;
  - `editedAt`;
- carregar a Proposal atual via `repository.findById` antes de editar;
- reutilizar `editItineraryProposalProposedActivity` do RB-INC-103;
- persistir somente o resultado validado via `repository.save`;
- preservar `proposal-not-found` como erro estável de aplicação;
- não persistir quando a Proposal estiver ausente, não `ready`, quando a atividade não existir ou quando o payload for inválido;
- provar que comandos consecutivos usam o estado mais recente do repository;
- teste PostgreSQL real de edição, persistência e reidratação;
- preservar o Itinerary confirmado durante toda a operação;
- permitir `updatedAt` posterior a `generatedAt` somente para Proposal `ready`;
- preservar o `updatedAt` persistido durante a reidratação de Proposal `ready`;
- exports públicos e governança.

## 4. Fora de escopo

- Server Action ou autorização web;
- formulário/componente React;
- aceite parcial;
- regeneração da Proposal;
- alteração direta do Itinerary;
- mudança das regras de lifecycle dos estados terminais.

## 5. Decisões técnicas

### 5.1 Sempre reler antes de editar

O application service não recebe uma Proposal arbitrária do caller. Ele recebe identificadores, carrega a representação atual pelo repository e aplica a edição sobre esse estado, reduzindo risco de persistir uma cópia obsoleta fornecida pela camada web.

### 5.2 Persistência somente após validação de domínio

`repository.save` é executado apenas depois que `editItineraryProposalProposedActivity` conclui com sucesso. Erros de estado, atividade inexistente, payload inválido ou regressão temporal não geram escrita.

### 5.3 Proposal `ready` passou a admitir revisões persistidas

A migration `0023_allow_ready_itinerary_proposal_edits.sql` altera exclusivamente a cláusula temporal do status `ready` de `updated_at = generated_at` para `updated_at >= generated_at`. Os estados `accepted`, `rejected`, `expired`, `failed`, `cancelled`, `requested` e `generating` permanecem com suas constraints anteriores.

### 5.4 Reidratação preserva o instante real da edição

O repository reconstruía uma Proposal `ready` usando a transição de geração e, por consequência, restaurava `updatedAt` para `generatedAt`. O mapper passou a validar `row.updatedAt >= generatedAt` e a devolver explicitamente o timestamp persistido, preservando o histórico temporal da edição.

### 5.5 Normalização PostgreSQL de horário é aceita como representação canônica

Campos `TIME` persistidos podem ser reidratados como `HH:mm:ss` mesmo quando o comando utilizou `HH:mm`. Os testes validam equivalência semântica e os demais campos persistidos, evitando tratar normalização do driver como mutação de domínio.

## 6. Critérios de aceite

- [x] Proposal existente é carregada antes da edição;
- [x] Proposal `ready` válida é editada e salva;
- [x] comandos consecutivos partem do estado atual do repository;
- [x] Proposal inexistente produz `proposal-not-found` sem executar `save`;
- [x] Proposal não `ready` não é persistida;
- [x] Proposed Activity inexistente não é persistida;
- [x] payload inválido não é persistido;
- [x] edição persistida é reidratada corretamente pelo PostgreSQL;
- [x] `updatedAt` editado é preservado após reidratação;
- [x] o Itinerary confirmado permanece inalterado;
- [x] migration `0023` permite revisão temporal somente de Proposal `ready`;
- [x] schema Drizzle e journal de migrations estão sincronizados;
- [x] API pública exportada por `@routebook/proposal-management`;
- [x] Engineering Validation técnico aprovado antes da promoção documental;
- [x] Documentation Validation e Engineering Validation aprovados no mesmo SHA de promoção;
- [x] registry, Context Pack e matriz de rastreabilidade sincronizados.

## 7. Evidências

- application service: `modules/proposal-management/src/service.ts`;
- testes controlados: `modules/proposal-management/src/edit-itinerary-proposal-service.test.ts`;
- exports: `modules/proposal-management/src/index.ts`;
- integração PostgreSQL: `packages/database/src/edit-itinerary-proposal-service-postgres.test.ts`;
- repository: `packages/database/src/proposal-repository.ts`;
- schema: `packages/database/src/proposal-schema.ts`;
- migration: `packages/database/drizzle/0023_allow_ready_itinerary_proposal_edits.sql`;
- journal: `packages/database/drizzle/meta/_journal.json`;
- SHA técnico validado: `d63305d0f8427d12c2e9dfb1a8ff7da9d09d0b42`;
- Engineering Validation #1293 / run `31256073601`: success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo;
- SHA de promoção validado: `1d1d2f23e949f1b3a04767814829981ee40f5cd4`;
- Documentation Validation #919 / run `31256356138`: success;
- Engineering Validation #1298 / run `31256356120`: success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo;
- issue: #237;
- Draft PR: #238.

Este commit documental é a última alteração prevista da branch. Ele deve repetir Documentation Validation e Engineering Validation no mesmo HEAD antes do merge; nenhuma alteração posterior é permitida sem reiniciar os gates.

## 8. Próximo recorte esperado

O próximo incremento deve expor a edição persistida por uma Server Action autorizada, mantendo `trip:edit` como fronteira de autorização e sem introduzir ainda a experiência visual de formulário.
