---
id: RB-INC-222
title: Fotos consistentes e recuperação de falhas
description: Reutiliza mídia segura em Explorar, detalhe e Minha seleção e distingue ausência de falha temporária.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-11-09"
last_updated: "2026-11-09"
authors: [RouteBook Team]
tags: [implementation, photos, recovery]
related_documents: [RB-CORE-0004, RB-INC-190, RB-INC-192, RB-ADR-012, RB-CTX-222]
prerequisites: [RB-INC-221]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-222 — Fotos consistentes e recuperação de falhas

## Objetivo e problema

Issue #544. Mesma branch do RB-INC-221; critérios independentes na mesma PR. Detalhe/Minha seleção atualmente usam somente imagem curada. Erro de mídia termina em Sem foto e não oferece recuperação. O usuário autorizou trabalhar nas melhorias em 09/11/2026.

## Critérios de aceite

- Explorar, detalhe e Minha seleção priorizam imagem curada e, na ausência/falha, usam resolução externa lazy existente com coordenadas e contexto do Lugar.
- Antes da consulta, não afirmar ausência. Durante consulta/download, indicar carregamento. Separar miss seguro de erro transitório e permitir até duas novas tentativas manuais por identidade.
- Falha nos bytes Google tenta Wikimedia uma única vez; falha final continua identificada como indisponibilidade temporária.
- Mudar Lugar reinicia estado e cancela requisição antiga; resposta antiga não substitui foto do Lugar novo.
- Endpoint valida opção de fallback, mantém atribuição, matching conservador e política de cache; falhas não são cacheadas como ausência permanente.
- Logs de mídia contêm apenas resultado agregado/provider, sem secrets, token, nomes ou coordenadas.
- Google permanece bloqueado em produção; nenhuma persistência de mídia Google, alteração de ranking, Provider ou billing novo.

## Caminhos permitidos

```text
apps/web/components/place-photo.tsx
apps/web/components/place-photo.test.tsx
apps/web/components/place-primary-image.tsx
apps/web/components/place-primary-image.module.css
apps/web/components/external-place-image-preview.tsx
apps/web/components/external-place-image-preview.test.tsx
apps/web/app/api/place-image-preview/route.ts
apps/web/app/api/place-image-preview/route.test.ts
apps/web/app/api/place-image-preview/google/route.ts
apps/web/app/api/place-image-preview/google/route.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/lugares-salvos/page.tsx
apps/web/e2e/photo-recovery.spec.ts
docs/implementation/increments/rb-inc-222-photo-recovery.md
docs/implementation/context-packs/rb-inc-222-photo-recovery.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Testes obrigatórios

Validação documental, Prettier dos arquivos alterados, lint e typecheck web, Vitest web incluindo fotos/endpoint/Google provider, `pnpm build`, E2E `photo-recovery.spec.ts` desktop/mobile em banco isolado. Fixtures sintéticas e interceptações não comprovam cobertura live. Não há regra nova de domínio.

## Riscos e fora de escopo

Mais superfícies podem solicitar mídia; manter viewport lazy e tentativas limitadas. Algumas identidades não possuem foto segura. Medição de cobertura live depende de acesso autenticado/configuração Preview e será relatada separadamente. Não ampliar thresholds para obter foto errada. Não ativar produção, editar ADR ou mergear.


## Evidências locais — 09/11/2026

- Node 24.22.1. A primeira tentativa com Node 18 do PATH não iniciou Vitest; execução corrigida usando o runtime compatível já instalado.
- Validação documental: 476 documentos, zero erros e 10 avisos preexistentes.
- Suíte web: 557 testes passaram em 92 arquivos. Regressões focadas após ajustes finais de navegação também passaram.
- Lint e typecheck web passaram. Build otimizado passou.
- Navegação desktop/mobile passou, incluindo espera real de resposta, restauração de filtros/Etapa e botão de filtros desabilitado durante processamento.
- Fotos desktop/mobile passaram: falha 503, nova tentativa, download concluído e imagem em Explorar, detalhe e Minha seleção. Fixtures interceptadas validam o fluxo, não cobertura Google/Wikimedia real.
- Os primeiros E2E de fotos falharam porque o teste não rolava até o card lazy; depois uma contagem rígida pressupunha nova requisição em cada tela apesar da reutilização de estado. As asserções foram corrigidas para verificar interação, recuperação e foto visível em cada superfície.
- Banco isolado: branch Neon de Preview `test-rb-inc-221-222-20261109` (`br-green-mountain-ayj7qtdl`). Nenhuma migração nem mudança nos bancos principais. Credenciais de teste só no ambiente do processo/arquivo temporário fora do repositório.
- `pnpm format:check` local reportou 542 arquivos: verificação em memória confirmou que todos passam ao normalizar CRLF para LF. Nenhum desses arquivos foi reformatado em massa; arquivos alterados passam no Prettier.
- Não executada medição live da cobertura de fotos: requer amostra de lugares reais no Preview autenticado. Produção permanece bloqueada para Google Photos.
- Revisão React: sem dependências novas, memória isolada no componente da Viagem, efeitos canceláveis, identidade do Lugar como chave, tempo e tentativas limitados, navegação sem mutação.
