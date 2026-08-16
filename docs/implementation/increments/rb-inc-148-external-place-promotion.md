---
id: RB-INC-148
title: Promoção Governada de Candidatos Externos para Draft
description: Completa a jornada de descoberta externa com uma ação explícita, autorizada e revalidada server-side que promove candidatos novos para Places draft preservando Provenance, deduplicação e publicação separada.
document_type: implementation-increment
owner: Place Catalog and Integrations
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors:
  - RouteBook Team
tags:
  - implementation
  - place-catalog
  - integrations
  - overture
  - provenance
  - promotion
  - authorization
  - m8
related_documents:
  - RB-CORE-0004
  - RB-PRD-002
  - RB-DOM-001
  - RB-ARC-003
  - RB-INC-087
  - RB-INC-090
  - RB-INC-136
  - RB-INC-142
  - RB-CTX-148
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

# RB-INC-148 — Promoção Governada de Candidatos Externos para Draft

## 1. Resultado vertical

Na descoberta externa de Lugares, um usuário autenticado com permissão de edição da Viagem pode enviar explicitamente um candidato externo `new` para curadoria. O servidor reobtém o candidato na Fonte, reaplica os limites do destino e delega a promoção ao serviço transacional já existente.

O resultado canônico é um `Place` com `publicationStatus = draft` e sua referência externa/Provenance. A operação não publica o Place, não o salva na Viagem, não cria Recommendation, Decision ou atividade de Itinerary e não mistura o draft ao catálogo publicado.

## 2. Issue e branch

- Issue: `#345`.
- Branch: `codex/rb-inc-148-external-place-promotion`.
- Base: `main` em `17cacf3fb3dc6c042dfca515dfa2ca56b416f793`.
- Related: `#333` — RB-INC-142.
- Related: `#319` — validação real do MVP em Pipa.

## 3. Problema observado

O RB-INC-142 implementou:

- `ExternalPlaceCandidate` e `PlaceSearchPort`;
- ACL de categorias Overture;
- reconciliação `new | possible_match | linked | rejected`;
- `place_external_references`;
- `promoteExternalPlaceCandidate` transacional e idempotente;
- descoberta Overture server-side na experiência de Lugares.

A experiência atual, entretanto, termina na visualização de candidatos `new`. O usuário vê nome, categoria, endereço, distância, Fonte e licença, mas não existe ação na rota de Lugares que execute a etapa explícita de promoção prevista pela arquitetura.

O gap é de integração de aplicação/UX; não é falta de domínio, persistência ou migration.

## 4. Autoridade canônica

O RB-INC-142 e o RB-ARC-003 definem o fluxo:

```text
Provider
  -> ExternalPlaceCandidate
  -> ACL / normalização
  -> reconciliação
  -> promoção explícita
  -> Place draft + external reference + Provenance
```

Invariantes:

- resultado externo não é Place canônico antes da promoção;
- busca externa nunca escreve;
- `possible_match` não autoriza promoção automática;
- a identidade `provider + externalId` é o vínculo estável da Fonte;
- a promoção é idempotente e transacional;
- publicação é operação separada;
- dados externos preservam Provenance;
- o browser não possui autoridade sobre fatos externos que serão persistidos.

## 5. Hipótese

Completar a passagem explícita de candidato externo para draft reduz uma lacuna funcional da descoberta orgânica e permite ampliar o catálogo sem nova migration DML por Place, preservando curadoria e publicação governadas.

A implementação não prova melhora de Decision Quality. Essa evidência permanece pertencendo ao RB-INC-136/M8.

## 6. Modelo de confiança

### 6.1 Entrada do browser

O formulário pode informar somente identificadores e estado de navegação necessários para localizar novamente o candidato e preservar a experiência, incluindo:

- `tripId`;
- `externalId`;
- categoria canônica exibida, quando necessária para restringir a nova busca;
- filtros/query string de retorno.

Nome, coordenadas, endereço, licença, confidence e `collectedAt` vindos do browser não podem ser usados como autoridade de persistência.

### 6.2 Revalidação server-side

Antes de promover, a Server Action deve:

1. validar sessão e autorização `trip:edit`;
2. carregar a Viagem canônica;
3. resolver o Destination suportado;
4. determinar o centro de descoberta pela hospedagem geocodificada ou fallback delimitado de Pipa;
5. consultar novamente o adapter Overture no servidor, respeitando raio máximo de 8 km, limite estrito e categorias suportadas;
6. localizar o `externalId` solicitado no resultado revalidado;
7. usar somente o `ExternalPlaceCandidate` produzido pelo adapter atual;
8. chamar `promoteExternalPlaceCandidate`.

Se o candidato não for reencontrado, a operação falha fechado e solicita nova descoberta.

## 7. Autorização

O layout da Viagem protege leitura com `trip:view`, mas uma Server Action é uma fronteira de mutação e deve validar autorização novamente.

Enquanto não existe uma permissão canônica específica de curadoria de catálogo, o MVP usa `trip:edit` como gate mínimo para a ação contextual da Viagem:

- `owner` e `editor` podem acionar;
- `viewer` não pode promover;
- sessão ausente redireciona para autenticação;
- Viagem inexistente ou sem membership ativo não vaza existência e falha como recurso indisponível.

Esse uso não transforma o Place em entidade da Viagem. A promoção continua criando estado global do Destination apenas como `draft`.

## 8. Promoção e idempotência

`promoteExternalPlaceCandidate` permanece a única autoridade de persistência deste incremento.

A Server Action não replica:

- dedupe por proximidade/nome/endereço;
- validação de categoria;
- geração de slug;
- criação do Place;
- criação da referência externa;
- transação;
- política de `draft`.

Resultados:

- `created`: novo draft criado;
- `existing`: referência já vinculada; operação idempotente concluída sem duplicata;
- `possible-match`: bloqueio seguro;
- `candidate-rejected`: bloqueio seguro;
- `linked-place-not-found` ou `destination-conflict`: erro de consistência, sem fallback permissivo.

## 9. Experiência

Cada candidato externo `new` exibido pela descoberta possui uma ação explícita com linguagem orientada ao efeito real, por exemplo `Enviar para curadoria`.

A interface deve comunicar antes da ação que:

- o candidato ainda não é publicado;
- a ação cria um draft para revisão/curadoria;
- o draft não aparece imediatamente na lista/mapa publicados.

Após a ação, a página deve preservar `descoberta=externa` e os filtros válidos quando aplicável e exibir feedback textual acessível.

O candidato promovido deixa de reaparecer como `new` depois que a referência externa passa a ser reconhecida como `linked`.

## 10. Estados de feedback

Feedback de sucesso:

- draft criado para curadoria;
- candidato já havia sido promovido anteriormente.

Feedback de bloqueio/erro:

- possível duplicidade detectada;
- candidato inválido/rejeitado;
- candidato não reencontrado na Fonte atual;
- Destination não suportado;
- indisponibilidade/timeout do Provider;
- erro técnico de consistência.

Nenhum erro libera publicação ou cria Place parcial.

## 11. Escopo

- Server Action de promoção na rota de Lugares;
- revalidação Overture server-side por identidade externa dentro do recorte suportado;
- autorização explícita `trip:edit` na fronteira de mutação;
- reutilização de `promoteExternalPlaceCandidate`;
- ação e feedback acessíveis na seção de candidatos externos;
- preservação de filtros/descoberta após retorno;
- testes de resolução/revalidação, autorização, idempotência e UX;
- Increment, Context Pack, Registry e rastreabilidade.

## 12. Fora de escopo

- nova entidade de review/moderação;
- nova permissão de domínio para catálogo;
- publicação automática ou manual do draft neste incremento;
- migration/schema;
- alterar `place_external_references`;
- alterar política de deduplicação;
- permitir override de `possible_match`;
- salvar automaticamente na Viagem;
- criar Recommendation, Decision ou Itinerary Activity;
- preço, horário, rating, review ou imagem do candidato;
- Provider pago, secret novo ou scraping;
- write em Production;
- concluir M8.

## 13. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/lugares/actions.ts
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

Qualquer caminho adicional exige justificativa no Context Pack e no pull request antes da alteração.

## 14. Caminhos somente leitura

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

## 15. Caminhos proibidos

```text
packages/database/drizzle/**
.github/workflows/**
apps/web/public/place-images/**
```

Não criar migration, secret, asset, Provider pago, workflow permanente ou ação de Production.

## 16. Critérios de aceite

- [ ] carga normal de Lugares continua sem consulta externa ou write implícito;
- [ ] candidato `new` possui ação explícita para envio à curadoria;
- [ ] ação exige sessão e autorização `trip:edit`;
- [ ] viewer não consegue promover;
- [ ] fatos persistidos são reobtidos do adapter Overture server-side;
- [ ] revalidação fica limitada ao Destination/centro/raio/categoria suportados;
- [ ] candidato não reencontrado falha fechado;
- [ ] `promoteExternalPlaceCandidate` continua como única autoridade de persistência;
- [ ] `created` produz draft e referência externa atomicamente;
- [ ] repetição retorna estado idempotente sem duplicata;
- [ ] `possible_match` e `rejected` permanecem bloqueados;
- [ ] sucesso não publica o Place;
- [ ] draft não entra na lista/mapa publicados;
- [ ] promoção não cria Saved Place, Recommendation, Decision ou Itinerary Activity;
- [ ] filtros e descoberta externa são preservados no retorno;
- [ ] falha do Provider preserva o catálogo publicado;
- [ ] nenhuma migration, dependência, secret ou Production é alterada;
- [ ] Documentation Validation e Engineering Validation passam no mesmo SHA final.

## 17. Estratégia de testes

### Unidade / adapter

- revalidação localiza `externalId` correto com limite/categoria;
- identidade ausente retorna não encontrado;
- raio acima do limite continua rejeitado;
- adapter continua preservando licença, categoria e `collectedAt`.

### Server Action

- sessão ausente não executa write;
- viewer não executa write;
- owner/editor autorizado reobtém o candidato no servidor;
- formulário adulterado não injeta nome/coordenadas/licença;
- candidato não reencontrado falha fechado;
- serviço `created` gera feedback de draft;
- serviço `existing` gera feedback idempotente;
- `possible-match` e `candidate-rejected` geram feedback previsível;
- indisponibilidade externa não altera catálogo.

### E2E

- descoberta externa apresenta ação explícita nos candidatos `new`;
- copy informa que a ação não publica imediatamente;
- após promoção, feedback de draft é acessível e candidato deixa de aparecer como `new` quando a referência é reconhecida;
- catálogo/mapa publicados não ganham o draft;
- filtros ativos permanecem no retorno.

### Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 18. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Browser injeta dados no catálogo global | reobter o candidato pelo Provider server-side; persistir somente o contrato normalizado retornado |
| Usuário sem permissão muta catálogo | autorização `trip:edit` dentro da Server Action |
| Draft confundido com Place publicado | copy explícita e feedback de `draft`; lista/mapa continuam publicados-only |
| Candidato muda entre leitura e ação | revalidação no momento da promoção; falha fechado se não for reencontrado |
| Duplicata concorrente | serviço transacional + unique `provider/externalId` + reconciliação atual |
| Provider indisponível | erro previsível; nenhum write parcial; catálogo canônico permanece disponível |
| Spam de drafts | somente candidatos reais dentro do recorte suportado e ação autorizada; publicação continua governada |

## 19. Governança

- sem mudança de domínio;
- sem migration;
- sem novo Provider;
- sem novo secret;
- sem alteração de Production;
- sem publicação automática;
- sem push direto em `main`;
- CI deve validar o SHA final;
- merge exige autorização humana explícita.

## 20. Definition of Done

Incremento e Context Pack registrados, implementação limitada aos caminhos autorizados, testes afetados e suíte integral com resultados reais, CI verde no mesmo SHA e PR pronta para revisão. Integração na `main` permanece decisão humana separada.