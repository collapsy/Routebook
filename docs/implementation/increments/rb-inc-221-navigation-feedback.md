---
id: RB-INC-221
title: Feedback e continuidade da navegação
description: Explicita espera e preserva contexto na exploração de Lugares e navegação da Viagem.
document_type: implementation-increment
owner: Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-11-09"
last_updated: "2026-11-09"
authors: [RouteBook Team]
tags: [implementation, navigation, feedback]
related_documents: [RB-CORE-0004, RB-UX-001, RB-UX-005, RB-CTX-221]
prerequisites: [RB-INC-220]
next_documents: [RB-INC-222]
ai_context:
  priority: high
  index: true
---

# RB-INC-221 — Feedback e continuidade da navegação

## Objetivo e problema

Issue #543. Branch `codex/rb-inc-221-222-navigation-photos`, base `c6292a69`.
Pedido humano de 09/11/2026 autoriza corrigir a espera sem feedback ao trocar destinos e a perda de contexto na navegação. Links de Lugares, dias e navegação principal devem indicar espera; filtros devem indicar processamento e impedir envio duplicado. A memória de exploração é efêmera e isolada por Viagem.

## Critérios de aceite

- Links exibem indicador e mensagem acessível enquanto a navegação está pendente, sem percentual artificial; teclado e links nativos continuam válidos.
- Filtros indicam processamento e continuam funcionando por GET sem JavaScript.
- Troca de destino preserva filtros e ordenação; remove `dia`, pois pode ser incompatível com a nova Etapa.
- Detalhe permite retornar ao contexto de exploração; parâmetros de retorno são limitados a filtros conhecidos e nunca aceitam URL externa.
- Navegação principal lembra a última exploração enquanto o layout da Viagem existir, sem storage persistente; páginas estruturais destacam Viagem.
- Falha de Lugares oferece nova tentativa. Estados não confundem resultados do destino anterior com os do novo.

## Caminhos permitidos

```text
apps/web/components/navigation-link.tsx
apps/web/components/navigation-link.module.css
apps/web/components/navigation-link.test.tsx
apps/web/components/discovery-filter-form.tsx
apps/web/components/discovery-filter-form.test.tsx
apps/web/components/trip-context-nav.tsx
apps/web/components/trip-context-nav.test.tsx
apps/web/components/trip-guide-mode-nav.tsx
apps/web/lib/discovery-navigation.ts
apps/web/lib/discovery-navigation.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/loading.tsx
apps/web/app/viagens/[tripId]/lugares/error.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/e2e/navigation-feedback.spec.ts
apps/web/e2e/accommodation-proximity.spec.ts
apps/web/e2e/place-actions.spec.ts
apps/web/e2e/place-discovery-filters.spec.ts
docs/implementation/increments/rb-inc-221-navigation-feedback.md
docs/implementation/context-packs/rb-inc-221-navigation-feedback.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Testes obrigatórios

`node scripts/validate-docs.mjs`, Prettier nos arquivos alterados, `pnpm --filter @routebook/web lint`, `pnpm --filter @routebook/web typecheck`, testes web Vitest, `pnpm build` e Playwright `navigation-feedback.spec.ts` em desktop/mobile com banco isolado. Nenhuma regra de domínio é alterada; teste de domínio novo não se aplica.

## Riscos e fora de escopo

Sem migração, novo Provider, armazenamento persistente de histórico, alteração de ranking ou redesenho geral. A espera do servidor permanece real; este incremento torna a transição explícita. Não alterar domínio/ADRs nem fazer merge. Falha de infraestrutura de teste será registrada sem alegar validação live.


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

- A primeira execução completa no GitHub expôs seletores antigos que exigiam links sem query de retorno. Os testes de proximidade/ações foram ajustados ao contrato de navegação; os casos de ausência de foto passaram a interceptar 404 e aguardar o viewport lazy. Estes três arquivos E2E adicionais são necessários para preservar a regressão existente sem dependência de cobertura externa.

- A segunda execução chegou às recomendações. Os novos testes passaram a usar lugares já semeados nas migrações para não alterar o catálogo compartilhado de Pipa entre cenários.
