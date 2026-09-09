---
id: RB-INC-188
title: Fotos reais dos lugares, fallback compacto e qualidade do catálogo
description: Generaliza a resolução governada de imagens reais para qualquer Destination, reduz o fallback ilustrativo nos Place Cards e endurece a elegibilidade de POIs genéricos na Discovery.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-08"
last_updated: "2026-09-08"
authors: [RouteBook Team]
tags: [implementation, places, images, wikimedia-commons, discovery, quality, mobile, destination-agnostic]
related_documents: [RB-CORE-0004, RB-UX-006, RB-DOM-001, RB-DOM-002, RB-ARC-003, RB-INC-141, RB-INC-143, RB-INC-162, RB-INC-168, RB-INC-170, RB-INC-172, RB-INC-173, RB-INC-175, RB-INC-176, RB-INC-185, RB-INC-186, RB-INC-187, RB-CTX-188]
prerequisites: [RB-INC-187]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-188 — Fotos reais dos lugares, fallback compacto e qualidade do catálogo

## 1. Resultado vertical

A tela **Explorar Lugares** deve se comportar como um guia visual de qualquer Destination, e não como um catálogo que depende de Pipa para obter fotografias reais.

O viajante deve encontrar:

1. fotografia real do Lugar quando existir correspondência segura e licenciada;
2. um card compacto e honesto quando uma foto real não estiver disponível;
3. menos POIs genéricos ou de identidade fraca competindo com lugares úteis;
4. nome, categoria, distância e próxima ação acima de explicações de ranking, Provenance ou implementação.

A fotografia é contexto visual, não evidência suficiente para publicar, recomendar ou ranquear um Lugar.

## 2. Issue, branch e base

- Issue: `#446`.
- Branch: `codex/rb-inc-188-real-place-media-quality`.
- Base empilhada: `4ad856aeadeed25eff2f1670ee9015d2d8823824` do RB-INC-187 / PR `#445`.
- PR #445 permanece Draft e teve Documentation + Engineering Validation verdes nesse SHA, mas o aceite visual mobile reprovou a experiência atual dos Place Cards.
- `main`, Production, billing e Providers pagos permanecem intocados.

## 3. Evidência humana do Preview

A inspeção manual do Preview mobile da PR #445 em 2026-09-08 mostrou um card provider-first de Gastronomia com:

- ilustração genérica grande ocupando o hero;
- selo `Imagem ilustrativa` ainda muito dominante;
- nome genérico `Sobremesa` apresentado como Lugar;
- distância e badges excessivamente grandes;
- disclosure `Entender este ranking` com explicação da ordenação;
- Provenance Overture/licença competindo visualmente no card expandido;
- ação `Calcular rota real`, que descreve implementação em vez da intenção do viajante.

O usuário confirmou duas decisões de produto:

1. o catálogo **deve continuar visual**, portanto retirar mídia sem buscar fotos reais não é solução;
2. a prioridade deve ser **imagem real do Lugar**, e ilustração genérica não deve substituir uma fotografia como hero dominante.

## 4. Diagnóstico técnico confirmado

O problema de cobertura de imagens não é apenas editorial. A fronteira atual de mídia externa ainda é Pipa-specific:

### API de preview

`apps/web/app/api/place-image-preview/route.ts`:

- aceita apenas `destinationId = pipa-rn-br`;
- valida latitude/longitude contra bounds fixos de Pipa/Tibau do Sul;
- qualquer outro Destination recebe erro antes da busca de mídia.

### Adapter Wikimedia

`apps/web/lib/wikimedia-place-image.ts`:

- pesquisa sempre `"<nome do lugar>" Pipa Tibau do Sul`;
- classifica match `secure` exigindo tokens do Place + texto `Pipa|Tibau do Sul` na metadata;
- gera alt fallback citando Pipa/Tibau do Sul.

Consequência: Destinations zero-seed recém-generalizados pelos RB-INC-173–185 não conseguem usar a mesma capacidade de foto real e degradam sistematicamente para a ilustração de categoria.

## 5. Política de mídia destination-agnostic

A cadeia alvo é:

```text
Place.primaryImage governada
→ preview Wikimedia seguro com contexto real do Destination
→ fallback compacto sem hero fotográfico fictício
```

### 5.1 Foto canônica

Quando `Place.primaryImage` existir e for válida, continua sendo a primeira escolha. O browser usa apenas o asset RouteBook já governado e a Provenance existente permanece auditável.

### 5.2 Foto externa segura

Para um candidato provider-first sem foto canônica:

- o lookup continua read-only;
- Wikimedia Commons permanece a fonte gratuita inicial;
- a consulta recebe contexto dinâmico do Destination em vez de Pipa fixo;
- identidade do Place continua obrigatória para match `secure`;
- contexto local deve ser derivado de dados reais do Destination/endereço/coordenadas fornecidos pela viagem, nunca inventado;
- autor e licença reutilizável continuam obrigatórios;
- o browser continua carregando bytes somente pela fronteira RouteBook já controlada;
- `ambiguous`, `rejected`, erro ou ausência de mídia não produzem fotografia.

### 5.3 Fallback

Quando não existir fotografia real segura:

- não usar a ilustração genérica de categoria como hero dominante do Place Card;
- manter um estado visual compacto, estável e acessível;
- não preencher o espaço com fotografia sintética;
- não usar uma foto genérica do Destination para simular o estabelecimento/atração;
- conteúdo e ações continuam íntegros sem mídia.

Ilustrações de categoria podem continuar existindo em superfícies em que são claramente referência visual genérica, como experiências temporais do Guia. A mudança deste incremento é específica à representação de **Lugar** na Discovery e superfícies diretamente equivalentes.

## 6. Contexto dinâmico para Wikimedia

A resolução de mídia deve receber um contexto explícito, por exemplo:

```text
placeName
latitude / longitude
destinationName
countryCode opcional
addressLabel opcional
```

Regras:

- strings têm limites e normalização antes de compor consulta;
- o contexto textual de Destination é usado como sinal, não como prova isolada;
- coordenadas continuam validadas globalmente, sem bounds fixos de uma cidade;
- match seguro exige identidade suficiente do Place e coerência local na metadata quando disponível;
- um nome distintivo pode sustentar identidade, mas nome genérico não pode ficar `secure` apenas por estar perto;
- ausência de contexto suficiente deve falhar fechado.

A implementação pode evoluir o contrato exato durante o incremento, desde que preserve essas invariantes e atualize o Context Pack antes de ampliar caminhos.

## 7. Qualidade e elegibilidade dos POIs

A Discovery não deve tratar todo registro Overture tecnicamente válido como uma recomendação útil.

### 7.1 Nome útil

Adicionar política determinística para detectar candidatos de identidade fraca. Exemplos de sinais de risco:

- nome igual ou quase igual apenas à categoria (`Restaurante`, `Bar`, `Café`, `Sobremesa`, `Praia`);
- nome que representa produto/tipo de comida em vez de estabelecimento, sem outro token distintivo;
- nome extremamente curto ou composto apenas por termos genéricos;
- categoria conflitante com o nome ou hierarquia externa;
- ausência de qualquer token distintivo quando a categoria requer identidade de estabelecimento.

A política deve ser multilíngue apenas no conjunto mínimo necessário aos Destinations de teste e usar estrutura extensível, evitando heurísticas brasileiras/Pipa-specific.

### 7.2 Rebaixar vs. rejeitar

Preferir rejeição quando o registro claramente não representa um destino visitável identificável. Quando houver incerteza material, preservar o candidato fora de posições de destaque ou exigir evidência adicional em vez de inventar identidade.

Se o modelo atual não suportar um estado intermediário sem ampliar Domain, a primeira versão pode rejeitar somente padrões de alta confiança e deixar casos ambíguos inalterados.

### 7.3 Ranking

- proximidade não transforma identidade fraca em qualidade;
- rating/popularidade só entram quando os sinais existentes são reais e com Provenance;
- imagem não aumenta score;
- ausência de quality continua ausência;
- ranking detalhado continua acessível, mas não precisa ocupar o fluxo primário do card.

## 8. Anatomia do card mobile

### Com foto real

Ordem alvo:

```text
foto real
categoria curta
nome
resumo útil opcional
distância qualificada
sinal compacto de qualidade somente se real
[Ação principal]
[Salvar]
divulgação secundária quando necessária
```

### Sem foto real

```text
categoria curta + estado visual neutro discreto
nome
resumo útil opcional
distância qualificada
sinal compacto de qualidade somente se real
[Ação principal]
[Salvar]
divulgação secundária quando necessária
```

O card sem foto deve ser materialmente menor que o card atual com ilustração hero.

## 9. Microcopy e divulgação progressiva

- `Calcular rota real` → `Ver rota`, sem alterar o destino semântico nem a forma de cálculo;
- `em linha reta` permanece sempre que a distância não for rota;
- se a referência for hospedagem, dizer `da hospedagem`;
- se a referência for apenas Destination aproximado, usar linguagem de estimativa adequada sem esconder essa limitação;
- explicações como `A posição reflete apenas a ordenação selecionada nesta lista` não devem ser permanentes no card;
- Provenance/licença obrigatória permanece acessível em segundo nível ou detalhe;
- atribuição de imagem continua visível onde a licença exigir, com peso visual secundário.

## 10. Escopo

- tornar o preview Wikimedia destination-agnostic;
- remover bounds e consulta Pipa-specific da fronteira de preview;
- adaptar classificação de match para contexto dinâmico e seguro;
- ajustar alt text/fallback para não mencionar Pipa fora de contexto;
- manter proxy, cache, host/MIME/tamanho e regras de licença existentes;
- criar/ajustar política de nome/identidade útil para candidatos Overture;
- aplicar a elegibilidade antes de exibir candidatos provider-first;
- compactar o Place Card sem fotografia real;
- reduzir protagonismo do fallback ilustrativo na Discovery;
- simplificar disclosure de ranking e rota conforme feedback humano;
- testes unitários, componente e E2E multi-destino;
- documentação, Registry e rastreabilidade;
- Preview consolidado para novo aceite visual mobile.

## 11. Fora de escopo

- Google Places Photos, Foursquare Photos ou outro Provider pago sem gate humano separado;
- criação/provisionamento de API key, billing, quota ou secret;
- scraping de Google Images, Maps, Instagram, TripAdvisor ou sites comerciais;
- geração de fotografias sintéticas de Places;
- persistir automaticamente preview externo em `Place.primaryImage`;
- alterar score por causa da imagem;
- copiar reviews;
- schema/migration sem necessidade comprovada;
- Production;
- merge da cadeia antes de aceite humano.

Se a cobertura Wikimedia destination-agnostic continuar insuficiente para gastronomia/vida noturna, registrar métricas de cobertura no Preview e abrir decisão humana separada sobre Provider de fotos. Não ativar Provider pago silenciosamente.

## 12. Caminhos autorizados

```text
modules/place-catalog/src/external-place.ts
modules/place-catalog/src/external-place.test.ts
apps/web/lib/overture-place-search.ts
apps/web/lib/overture-place-search.test.ts
apps/web/lib/wikimedia-place-image.ts
apps/web/lib/wikimedia-place-image.test.ts
apps/web/app/api/place-image-preview/route.ts
apps/web/app/api/place-image-preview/route.test.ts
apps/web/components/place-primary-image.tsx
apps/web/components/place-primary-image.module.css
apps/web/components/place-primary-image.test.tsx
apps/web/components/external-place-image-preview.tsx
apps/web/components/external-place-image-preview.test.tsx
apps/web/components/category-illustration.tsx
apps/web/components/category-illustration.module.css
apps/web/components/category-illustration.test.tsx
apps/web/components/place-ranking-meta.tsx
apps/web/components/place-ranking-meta.module.css
apps/web/components/place-ranking-meta.test.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/place-discovery.module.css
apps/web/e2e/external-place-images.spec.ts
apps/web/e2e/place-discovery-anywhere.spec.ts
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/place-actions.spec.ts
apps/web/e2e/multi-destination-validation.spec.ts
apps/web/e2e/accommodation-proximity.spec.ts
apps/web/e2e/route-destination-reliability.spec.ts
docs/implementation/increments/rb-inc-188-real-place-media-quality.md
docs/implementation/context-packs/rb-inc-188-real-place-media-quality.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

`apps/web/e2e/place-actions.spec.ts` foi incluído após a Engineering Validation do SHA `0231cbf0aef91eb2b1169e1ceaaae1cd6d269152` revelar uma asserção legada que ainda exigia a ilustração de categoria removida pelo fallback compacto deste incremento. A alteração autorizada é restrita a alinhar o contrato E2E ao estado neutro `Sem foto`, sem alterar Salvos, persistência ou a jornada coberta.

Arquivo adicional indispensável deve ser registrado no incremento/Context Pack antes da alteração e justificado na PR.

## 13. Critérios de aceite

- [ ] `place-image-preview` não contém allowlist/bounds exclusivos de Pipa;
- [ ] Wikimedia recebe contexto real do Destination e não acrescenta `Pipa Tibau do Sul` globalmente;
- [ ] match seguro continua fail-closed para identidade e licença;
- [ ] Pipa mantém cobertura existente sem regressão;
- [ ] pelo menos dois Destinations zero-seed exercitam a resolução destination-agnostic;
- [ ] Place com foto real mostra fotografia correta e Provenance/licença auditável;
- [ ] candidato sem foto real não exibe ilustração genérica como hero dominante;
- [ ] card sem foto é materialmente mais compacto no mobile;
- [ ] nenhuma fotografia artificial ou regional genérica é apresentada como foto do Lugar;
- [ ] candidato claramente genérico/sem identidade suficiente é filtrado por política determinística coberta por testes;
- [ ] candidatos válidos não são removidos apenas por ausência de foto, rating ou review;
- [ ] imagem não altera score/ranking;
- [ ] `Ver rota` preserva o comportamento de rota existente;
- [ ] distância em linha reta continua explicitamente qualificada;
- [ ] Provenance e atribuição permanecem acessíveis sem dominar o card;
- [ ] `pnpm format:check`, `pnpm docs:validate`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e` passam;
- [ ] Documentation e Engineering Validation ficam verdes no mesmo SHA final;
- [ ] Vercel Preview do mesmo SHA fica READY;
- [ ] viewport mobile é revisado humanamente antes de qualquer merge.

## 14. Testes obrigatórios

### Wikimedia

- consulta usa Destination dinâmico;
- Pipa continua resolvendo com o contexto correto;
- outro Destination não recebe Pipa na query;
- metadata com identidade do Place + contexto local suficiente pode ficar `secure`;
- identidade parcial/contexto isolado permanece `ambiguous`;
- nome genérico não recebe match `secure` indevido;
- licença/autor/host inválidos continuam rejeitados;
- endpoint valida coordenadas globais e inputs de Destination;
- cache de sucesso/miss e proxy continuam inalterados semanticamente.

### Overture / qualidade

- nomes genéricos de alta confiança são rejeitados;
- estabelecimentos com token distintivo permanecem;
- praias continuam protegidas contra negócios mislabeled;
- política não depende de Pipa;
- deduplicação, categoria e limite continuam determinísticos.

### UI

- foto real mantém precedência;
- fallback sem foto não renderiza hero ilustrativo dominante;
- loading/miss não causa layout shift severo;
- `Ver rota` continua acessível;
- ranking sem signal não fabrica informação;
- disclosure secundário preserva Provenance quando necessária.

### E2E

- Pipa;
- Destination zero-seed A;
- Destination zero-seed B;
- foto segura interceptada;
- miss/erro de mídia;
- candidato genérico filtrado;
- candidato válido preservado;
- mobile sem overflow e com cards compactos.

## 15. Gate de Provider de fotos

O Google Places já foi escolhido anteriormente para **quality signals no Preview**, mas isso não autoriza automaticamente o uso de Google Places Photos.

Adicionar campo de fotos, endpoint de mídia, nova quota/custo ou qualquer expansão de uso do Provider é uma decisão material. Se a cobertura Wikimedia não atingir qualidade visual suficiente após este incremento:

1. medir cobertura real por categoria/Destination no Preview;
2. documentar lacunas;
3. apresentar opções e custo/termos;
4. solicitar autorização humana explícita antes de ativar qualquer Provider de fotos pago.

## 16. Rollback

As mudanças de mídia/eligibilidade devem ser reversíveis por código. Não há necessidade esperada de migration. Em rollback, o sistema pode voltar ao comportamento anterior sem alterar Places persistidos. Production não participa deste incremento.