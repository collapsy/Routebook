---
id: RB-CTX-148
title: Context Pack do RB-INC-148 — Promoção Governada de Candidatos Externos para Draft
description: Delimita autorização, revalidação server-side, promoção idempotente, UX, caminhos e gates para completar a jornada de ingestão governada sem publicação automática.
document_type: implementation-context-pack
owner: Place Catalog and Integrations
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - place-catalog
  - overture
  - provenance
  - promotion
  - authorization
related_documents:
  - RB-INC-148
  - RB-CORE-0004
  - RB-DOM-001
  - RB-ARC-003
  - RB-INC-087
  - RB-INC-090
  - RB-INC-136
  - RB-INC-142
  - RB-CTX-142
prerequisites:
  - RB-INC-087
  - RB-INC-090
  - RB-INC-142
next_documents:
  - RB-INC-136
ai_context:
  priority: high
  index: true
---

# RB-CTX-148 — Promoção Governada de Candidatos Externos para Draft

## 1. Missão do executor

Completar a etapa explícita de promoção da descoberta externa de Places sem criar nova regra de domínio: autorizar a mutação, reobter o candidato na Fonte server-side e reutilizar o serviço transacional do RB-INC-142 para produzir somente um `Place` draft com Provenance.

O executor não pode confiar em fatos externos enviados pelo browser, publicar o draft automaticamente ou criar efeitos colaterais em Saved Place, Recommendation, Decision ou Itinerary.

## 2. Incremento

- ID: `RB-INC-148`.
- Issue: `#345`.
- Branch: `codex/rb-inc-148-external-place-promotion`.
- Base: `main` em `17cacf3fb3dc6c042dfca515dfa2ca56b416f793`.
- Related: `#333`.
- Related: `#319`.
- Incremento: `docs/implementation/increments/rb-inc-148-external-place-promotion.md`.

## 3. Leitura obrigatória concluída antes de código

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/domain/domain-model.md`, princípios de Place, dados externos, Provenance e autoridade canônica;
5. `docs/architecture/integrations-and-ports.md`, Ports, ACL, Provenance e identidade externa;
6. `docs/implementation/increments/rb-inc-142-organic-place-ingestion.md`;
7. `docs/implementation/context-packs/rb-inc-142-organic-place-ingestion.md`;
8. `modules/place-catalog/src/external-place.ts` como contrato somente leitura;
9. `packages/database/src/place-promotion-service.ts` como serviço canônico somente leitura;
10. `modules/identity-access/src/trip-authorization.ts` como política de autorização somente leitura;
11. `apps/web/lib/trip-route-access.ts` como integração de sessão/autorização;
12. `apps/web/lib/overture-place-search.ts` como adapter server-side;
13. `apps/web/app/viagens/[tripId]/lugares/page.tsx` como experiência atual;
14. RB-INC-148 e este Context Pack.

## 4. Evidência que originou o incremento

Na `main` do baseline, `/viagens/[tripId]/lugares?descoberta=externa`:

- consulta Overture no servidor;
- reconcilia candidatos contra Places e referências externas;
- separa `new`, `possible_match` e `linked`;
- exibe candidatos `new` com Fonte/licença;
- não oferece ação de promoção.

Ao mesmo tempo, `packages/database/src/place-promotion-service.ts` já possui promoção transacional/idempotente para `draft` e referência externa.

Portanto o gap é uma fronteira de aplicação/UX e segurança, não de persistência.

## 5. Conceitos relevantes

| Termo oficial | Interpretação necessária |
| --- | --- |
| ExternalPlaceCandidate | dado externo normalizado e não canônico antes da promoção |
| Place | entidade canônica interna; o Provider não define sua identidade |
| Provenance | origem/licença/instante de coleta preservados na referência externa |
| `new` | candidato sem sinais fortes de identidade/duplicidade nas regras atuais |
| `possible_match` | ambiguidade que bloqueia promoção automática |
| `linked` | identidade externa já vinculada a um Place |
| `draft` | Place canônico ainda não publicado no catálogo visível |
| promoção | write explícito, auditável e idempotente, separado da busca e da publicação |

## 6. Invariantes

- busca externa é read-only;
- visualização não produz estado canônico;
- promoção exige ação explícita;
- candidato externo não é Place publicado;
- publication status inicial da promoção é `draft`;
- publicação do draft está fora de escopo;
- `provider + externalId` preserva identidade externa/idempotência;
- `possible_match` e `rejected` falham fechado;
- dados de nome/coordenadas/licença/categoria do browser não são confiáveis para persistência;
- autorização da página não substitui autorização da Server Action;
- ausência/falha do Provider não altera catálogo publicado;
- nenhuma ação deste incremento salva, recomenda ou planeja o Place automaticamente.

## 7. Decisões arquiteturais aplicáveis

### Ports and Adapters / ACL

O adapter Overture permanece fora do domínio e retorna `ExternalPlaceCandidate`. A Server Action consome o contrato interno e não objetos de SDK/feature externa.

### Provenance

A promoção continua preservando `provider`, `externalId`, `sourceLicense`, `sourceUrl` e `collectedAt` via `place_external_references`.

### Idempotência

A operação existente verifica a referência externa primeiro e retorna `existing` quando o vínculo já existe. Não criar uma segunda estratégia de idempotência na web.

### Publicação separada

`draft` não aparece em `listPublishedPlaces`. Nenhum caminho do RB-INC-148 altera essa regra.

## 8. Contratos existentes

### Descoberta

- `PlaceSearchPort.search(query)`;
- `OverturePmtilesPlaceSearchAdapter.search(query)`;
- raio runtime máximo de 8.000 metros;
- limite de busca entre 1 e 200;
- `mapOverturePlaceCategory` e validação de candidato;
- fallback geográfico delimitado de Pipa já usado pela página.

### Promoção

- `promoteExternalPlaceCandidate({ destinationId, candidate })`;
- `PlacePromotionServiceError`;
- resultados `created | existing`;
- erros `candidate-rejected | possible-match | linked-place-not-found | destination-conflict`.

### Autorização

- `resolveTripRouteAccess`;
- `trip:edit` permitido para `owner` e `editor`;
- `viewer` somente possui `trip:view`.

### Experiência

- rota `/viagens/[tripId]/lugares`;
- estado `descoberta=externa`;
- filtros `busca`, `categoria`, `distancia`, `preco`;
- `listPublishedPlaces` como fonte do catálogo e mapa canônicos.

## 9. Revalidação server-side

A Server Action deve receber o mínimo necessário do browser e reconsultar o Provider.

Fluxo obrigatório:

```text
form
  -> parse tripId/externalId/category/navigation state
  -> resolveTripRouteAccess(trip:edit)
  -> findTripById
  -> resolve Destination
  -> center = accommodation.coordinate ?? Pipa fallback
  -> OverturePmtilesPlaceSearchAdapter.search
       radius <= 8000
       limit <= 200
       category canonical validada quando fornecida
  -> find exact externalId
  -> promoteExternalPlaceCandidate
  -> revalidate + redirect com feedback
```

Regras:

- não hidratar `ExternalPlaceCandidate` a partir de hidden inputs;
- não aceitar `sourceLicense`, `sourceUrl`, `collectedAt`, nome, latitude ou longitude do formulário como autoridade;
- se `externalId` não aparecer na nova busca, não executar promoção;
- se a Fonte falhar, não executar promoção;
- validar categoria de busca com contrato canônico existente; valor inválido deve degradar para busca sem filtro ou falhar de forma previsível, nunca virar categoria inventada.

## 10. Autorização

A fronteira de mutação deve executar `resolveTripRouteAccess({ tripId, action: "trip:edit" })`.

Comportamento:

- `unauthenticated`: redirecionar para `/entrar` com `next` seguro da rota de Lugares;
- `not-found`: usar `notFound()` ou resultado equivalente sem revelar escopo/membership;
- `authorized`: seguir para revalidação externa.

Não ampliar `TripAction` neste incremento. Uma permissão específica de curadoria de catálogo seria uma decisão de domínio/segurança separada.

## 11. Estado de navegação permitido

A ação deve retornar somente à rota de Lugares da mesma Viagem.

É permitido preservar, após validação/canonicalização:

- `descoberta=externa`;
- `busca` limitada ao contrato atual;
- `categoria` somente se canônica;
- `distancia` somente se parseável pelo filtro atual;
- `preco` somente se canônico.

Não aceitar URL absoluta ou pathname arbitrário do browser como destino de redirect.

Feedback pode usar query params próprios e curtos, por exemplo:

- `promocao=criada`;
- `promocao=existente`;
- `promocao=bloqueada`;
- `erroPromocao=candidato-nao-encontrado|fonte-indisponivel|...`.

Query string é estado de apresentação, não domínio.

## 12. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/lugares/actions.ts
apps/web/app/viagens/[tripId]/lugares/actions.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/place-discovery.module.css
apps/web/lib/overture-place-search.ts
apps/web/lib/overture-place-search.test.ts
apps/web/e2e/external-place-promotion.spec.ts
docs/implementation/increments/rb-inc-148-external-place-promotion.md
docs/implementation/context-packs/rb-inc-148-external-place-promotion.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

A inclusão de `lugares/actions.test.ts` é uma extensão explícita da allowlist porque a nova fronteira de mutação precisa provar autorização, revalidação server-side, payload mínimo e ausência de write nos bloqueios sem depender da rede Overture real ou de Production.

## 13. Caminhos somente leitura

```text
modules/place-catalog/**
modules/identity-access/**
modules/trip-management/**
packages/database/**
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
```

O serviço de promoção e o domínio só podem ser alterados se uma impossibilidade concreta for encontrada e documentada antes; a expectativa é **zero mudança** nesses caminhos.

## 14. Caminhos proibidos

```text
packages/database/drizzle/**
.github/workflows/**
apps/web/public/place-images/**
```

Não criar migration, secret, Provider pago, asset, workflow permanente ou alteração de Production.

## 15. Mudanças esperadas por arquivo

### `lugares/actions.ts`

- nova Server Action;
- parse mínimo de input;
- autorização `trip:edit`;
- resolução do Destination/centro;
- reconsulta Overture;
- lookup exato de `externalId`;
- delegação ao serviço de promoção;
- mapping de resultado/erro para feedback seguro;
- redirect somente para a mesma rota de Lugares.

### `lugares/actions.test.ts`

- provar que `trip:edit` é exigido na fronteira;
- provar que a promoção recebe o candidato reobtido do adapter, não fatos arbitrários do formulário;
- provar ausência de write para candidato ausente e falha do Provider;
- provar mapping de `created`, `existing` e bloqueios conhecidos para redirect seguro;
- provar preservação/canonicalização dos filtros sem aceitar URL de retorno arbitrária.

### `lugares/page.tsx`

- importar a ação;
- interpretar feedback curto da query string;
- exibir status/alert acessível;
- renderizar formulário explícito somente em candidatos `new`;
- preservar os hidden inputs estritamente necessários;
- manter lista/mapa canônicos publicados-only.

### `place-discovery.module.css`

Somente se necessário para o bloco de ação/feedback. Preferir classes globais existentes quando suficientes.

### `overture-place-search.*`

Alterar somente se for indispensável introduzir helper testável para localizar candidato por `externalId` sem duplicar política de busca. Não mudar normalização, ranking, licença ou limites da descoberta existente.

### `external-place-promotion.spec.ts`

Cobrir a nova UX e ausência de publicação/efeitos colaterais. Usar fixture/injeção determinística; não depender de rede Overture real em E2E.

## 16. Saídas esperadas

- candidato `new` possui ação `Enviar para curadoria` ou copy equivalente;
- Server Action autorizada e revalidada;
- `created`/`existing` mapeados para feedback;
- bloqueios mapeados para feedback sem stack/segredo;
- catálogo publicado não muda na mesma interação;
- documentação/Registry/rastreabilidade atualizados;
- PR com CI verde no SHA final.

## 17. Critérios de aceite executáveis

- uma requisição de promoção sem `trip:edit` não chega ao serviço de write;
- o candidato passado ao serviço provém do resultado server-side do adapter;
- adulterar hidden inputs de nome/coordenadas/licença não altera o candidato persistido porque esses campos não são aceitos;
- `externalId` ausente ou não reencontrado não executa write;
- `created` preserva `publicationStatus=draft`;
- `existing` não cria segunda referência/Place;
- `possible-match` e `candidate-rejected` não criam Place;
- o redirect permanece em `/viagens/{tripId}/lugares`;
- filtros válidos permanecem após o redirect;
- lista/mapa usam somente `listPublishedPlaces`;
- E2E não depende de rede externa não determinística.

## 18. Testes obrigatórios

Executar primeiro os afetados e depois os gates integrais:

```bash
pnpm --filter @routebook/web test -- actions.test.ts
pnpm --filter @routebook/web test -- overture-place-search
pnpm --filter @routebook/web test:e2e -- external-place-promotion.spec.ts
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Se um comando filtrado não for suportado pelo workspace, registrar a limitação e usar o equivalente real; nunca inventar execução.

## 19. Dados e privacidade

- nenhum dado pessoal novo é enviado ao Overture;
- a consulta usa somente centro geográfico da descoberta, raio, categoria e limites;
- não versionar dados de sessão, credentials ou secrets;
- fixtures de teste devem usar IDs/nomes sintéticos;
- não usar Production para validar promoção.

## 20. Riscos

### Browser como fonte de verdade

Mitigação: aceitar identidade mínima e reobter todos os fatos do candidato no Provider.

### Escopo global do Place

Mitigação: somente candidato real do Destination/recorte suportado pode virar draft; publicação permanece separada.

### Permissão genérica `trip:edit`

Mitigação: é gate MVP já existente; não ampliar autorização sem novo incremento. Registrar como risco residual para evolução multiusuário/admin.

### Fonte instável

Mitigação: candidato que não puder ser revalidado não é promovido; o usuário pode refazer a descoberta.

### Duplicidade

Mitigação: serviço transacional e reconciliação existentes permanecem autoridade.

## 21. Quando interromper

Interromper e escalar se a implementação exigir:

- criar nova entidade de curadoria/review;
- ampliar `TripAction` ou modelo de roles;
- alterar taxonomia de Place;
- alterar deduplicação canônica;
- publicar draft automaticamente;
- migration/schema;
- Provider pago/secret;
- mudança de Production;
- write fora dos caminhos já governados;
- inventar dados externos.

Falhas de format, docs, lint, typecheck, tests, build e E2E devem ser corrigidas autonomamente.

## 22. Formato do relatório final

- resultado e comportamento entregue;
- arquivos alterados;
- testes executados/resultados;
- testes não executados;
- CI por SHA;
- riscos residuais;
- issue e PR;
- confirmação explícita de ausência de Production;
- merge pendente de autorização humana.

## 23. Definition of Done

Incremento e Context Pack registrados, código limitado aos caminhos autorizados, testes determinísticos e suíte integral com evidência real, Documentation Validation + Engineering Validation verdes no mesmo SHA e PR pronta para revisão. Merge permanece uma decisão humana separada.