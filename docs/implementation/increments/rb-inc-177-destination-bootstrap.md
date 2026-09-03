---
id: RB-INC-177
title: Destination Bootstrap progressivo, degradação e observabilidade
description: Orquestra Discovery, Quality e Media como bootstrap progressivo e degradável, mantendo Lugares seguros utilizáveis antes dos enriquecimentos opcionais.
document_type: implementation-increment
owner: Traveler Experience and Platform
status: Draft
version: "0.1.0"
created: "2026-09-02"
last_updated: "2026-09-02"
authors: [RouteBook Team]
tags: [implementation, bootstrap, observability, resilience, routebook-anywhere]
related_documents: [RB-CORE-0004, RB-ARC-001, RB-ADR-013, RB-ADR-015, RB-OBS-001, RB-INC-162, RB-INC-168, RB-INC-175, RB-INC-176, RB-CTX-177]
prerequisites: [RB-INC-175, RB-INC-176]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-177 — Destination Bootstrap progressivo, degradação e observabilidade

## 1. Contexto

- Epic: #411.
- Issue: #417.
- Branch: `codex/rb-inc-177-destination-bootstrap`.
- Base: `main@30bcae1a1574f14d48ba15995d7baf1097315bd5`.
- RB-INC-175 entrega Region + Discovery destination-agnostic.
- RB-INC-176 entrega Identity conservadora destination-agnostic.
- Discovery, Quality e Media já existem, porém sua política de degradação, retry, kill switch, orçamento e telemetria ainda está espalhada.

## 2. Decisão sobre Inngest

RB-ADR-015 está documentalmente publicado, mas a decisão interna permanece **Proposed**.

Portanto este incremento:

- não adota o SDK do Inngest;
- não cria Durable Workflow;
- não cria fila artesanal;
- não cria tabela de estado de bootstrap sem necessidade;
- mantém o PostgreSQL como fonte canônica;
- entrega bootstrap síncrono/progressivo com operações read-only e mídia lazy;
- deixa ativação de Inngest para gate humano/ADR aceito.

Essa escolha é reversível e não contradiz o ADR.

## 3. Bootstrap

Etapas conceituais:

```text
Destination resolvido
→ Region
→ Discovery
→ Identity
→ Quality
→ Media
→ Spatial Context
→ Guide
```

O estado de UX é derivado de fatos da execução, não persistido artificialmente:

- `preparing`: contexto espacial ainda não está disponível;
- `discovering`: navegação/Server Component ainda está resolvendo Discovery;
- `enriching`: Lugares seguros já estão utilizáveis e detalhes opcionais ainda podem chegar;
- `ready`: base segura está disponível e não existe enriquecimento pendente naquele recorte.

## 4. Partial success

Regras:

- falha de Discovery externa preserva catálogo curado;
- falha de Quality preserva Discovery e ordenação por distância;
- falha de Media preserva ilustração/foto controlada;
- Provider desabilitado por kill switch não é tratado como erro;
- nenhuma falha inventa rating, popularidade, foto, rota ou tempo;
- candidato seguro pode ser usado antes de Media terminar.

## 5. Política de execução

Nova política central de bootstrap controla:

| Etapa | Default | Limite |
| --- | --- | --- |
| Discovery Overture | enabled | 200 candidatos; 2 tentativas lógicas |
| Quality | enabled quando Provider já configurado | 60 targets; 2 tentativas lógicas |
| Media externa | enabled | 12 previews por render; 2 tentativas Wikimedia por preview |
| Retry | somente transitório | máximo 3 configurável |
| Backoff | curto e limitado | sem workflow durável |

Kill switches:

- `ROUTEBOOK_PLACE_DISCOVERY_ENABLED`;
- `ROUTEBOOK_PLACE_QUALITY_ENABLED`;
- `ROUTEBOOK_PLACE_MEDIA_ENABLED`.

Limites opcionais:

- `ROUTEBOOK_PLACE_DISCOVERY_MAX_ATTEMPTS`;
- `ROUTEBOOK_PLACE_QUALITY_MAX_ATTEMPTS`;
- `ROUTEBOOK_PLACE_MEDIA_MAX_ATTEMPTS`;
- `ROUTEBOOK_PLACE_QUALITY_TARGET_LIMIT`;
- `ROUTEBOOK_PLACE_MEDIA_PREVIEW_BUDGET`.

Valores inválidos caem no default governado; nenhum limite pode ampliar contratos dos adapters.

## 6. Idempotência

As operações com retry neste slice são read-only:

- busca Overture;
- consulta de Quality;
- busca de preview Wikimedia.

Repetir a chamada não altera estado canônico.

Promoção de Place continua fora do retry de bootstrap e mantém a idempotência própria via external identity.

## 7. Observabilidade

Eventos/logs técnicos agregados:

- bootstrap iniciado;
- Destination resolvido: boolean;
- Accommodation geocodificada: boolean;
- source da Region;
- etapa;
- status por Provider;
- tentativas lógicas;
- duração;
- quantidade de Places curados;
- candidatos;
- possible matches;
- linked;
- rejeitados;
- Quality matches;
- orçamento de Media;
- falhas/degradações;
- total de invocações lógicas de Provider.

Não registrar:

- coordenadas precisas;
- nome/endereço da hospedagem;
- secrets/tokens;
- payload integral do Provider;
- dados pessoais desnecessários.

## 8. Custo por viagem/render

O incremento documenta custo como **request units máximas**, não como preço monetário congelado:

- Overture: até 2 invocações lógicas; cada tentativa respeita raio de 8 km e teto de 100 tiles;
- Google Quality: até 4 categorias × (1 busca ampla + 4 fallbacks direcionados) × 2 tentativas = teto teórico de 40 requests;
- Foursquare Quality: até 4 categorias × 2 tentativas = teto teórico de 8 requests;
- Wikimedia Media: até 12 previews lazy × 2 tentativas = teto teórico de 24 buscas de metadata por render.

O custo monetário de Provider pago é:

```text
requests efetivas × preço unitário vigente do Provider/contrato
```

Nenhum preço externo é codificado como regra porque billing/Production continuam gates humanos e tabelas comerciais mudam fora do repositório.

## 9. Escopo

```text
.env.example
turbo.json
apps/web/lib/place-bootstrap.ts
apps/web/lib/place-bootstrap.test.ts
apps/web/lib/place-quality-provider.ts
apps/web/lib/place-quality-provider.test.ts
apps/web/app/viagens/[tripId]/lugares/loading.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/components/external-place-image-preview.tsx
apps/web/components/external-place-image-preview.test.tsx
apps/web/app/api/place-image-preview/route.ts
apps/web/app/api/place-image-preview/route.test.ts
apps/web/e2e/place-discovery-anywhere.spec.ts
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/external-place-images.spec.ts
docs/implementation/increments/rb-inc-177-destination-bootstrap.md
docs/implementation/context-packs/rb-inc-177-destination-bootstrap.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 10. Fora de escopo

- aceitar RB-ADR-015;
- instalar Inngest;
- criar filas/workers;
- migration;
- persistir estado derivável de bootstrap;
- cron/schedule;
- novo Provider;
- billing;
- Production;
- alterar taxonomia/Identity;
- tornar Wikimedia destination-agnostic neste slice.

## 11. Critérios de aceite

- [ ] falha de Quality/Media não invalida Discovery;
- [ ] usuário usa Lugares seguros antes de Media terminar;
- [ ] retries read-only são idempotentes e limitados;
- [ ] retry não ocorre em erro permanente conhecido;
- [ ] kill switch não produz falso erro;
- [ ] Provider failure é observável e degradável;
- [ ] nenhuma nota/foto/tempo é inventado;
- [ ] logs não carregam coordenadas/hospedagem/secrets;
- [ ] request budgets são governados;
- [ ] custo máximo por render é documentado por request units;
- [ ] UX usa linguagem preparando/descobrindo/enriquecendo/pronto;
- [ ] Pipa permanece regressão;
- [ ] Florianópolis zero-seed continua utilizável sem Media regional;
- [ ] Documentation/Engineering verdes no mesmo SHA;
- [ ] merge permanece gate humano.
