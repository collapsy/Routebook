---

id: RB-ADR-012

title: Adoção da Google Maps Platform como Provider Geoespacial Inicial
description: Registra a decisão de adotar a Google Maps Platform como Provider inicial para mapas, descoberta de locais, geocoding, rotas, distâncias e tempos de deslocamento, preservando adapters, contratos internos, PostGIS e portabilidade entre Providers.

document_type: architecture_decision_record
owner: Architecture

status: Published
version: "0.1.0"

created: "2026-07-24"
last_updated: null

authors:

- RouteBook Team

tags:

- architecture
- adr
- google-maps-platform
- maps
- places
- routes
- geocoding
- mobility
- geospatial
- postgis
- provider
- distance-matrix
- travel-time
- place-catalog
- cost-governance

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-002
- RB-PRD-003
- RB-PRD-004
- RB-PRD-005
- RB-PRD-006
- RB-PRD-007
- RB-PRD-008
- RB-UX-001
- RB-UX-002
- RB-UX-003
- RB-UX-004
- RB-UX-005
- RB-UX-006
- RB-DS-001
- RB-DS-002
- RB-DS-003
- RB-DS-004
- RB-DOM-001
- RB-DOM-002
- RB-DOM-003
- RB-DOM-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-ARC-005
- RB-DATA-001
- RB-DATA-002
- RB-API-001
- RB-SEC-001
- RB-SEC-002
- RB-SEC-003
- RB-PRIV-001
- RB-PRIV-002
- RB-PRIV-003
- RB-OBS-001
- RB-QA-001
- RB-QA-002
- RB-OPS-001
- RB-OPS-002
- RB-SRE-001
- RB-AI-001
- RB-AI-002
- RB-AI-003
- RB-AI-004
- RB-AI-005
- RB-AI-006
- RB-GOV-001
- RB-GOV-002
- RB-RISK-001
- RB-DEL-001
- RB-DEV-001
- RB-CICD-001
- RB-INFRA-001
- RB-ADR-001
- RB-ADR-002
- RB-ADR-003
- RB-ADR-004
- RB-ADR-005
- RB-ADR-006
- RB-ADR-007
- RB-ADR-008
- RB-ADR-009
- RB-ADR-010
- RB-ADR-011

prerequisites:

- RB-FND-004
- RB-PRD-002
- RB-PRD-003
- RB-PRD-004
- RB-PRD-005
- RB-PRD-006
- RB-UX-001
- RB-UX-002
- RB-UX-003
- RB-UX-004
- RB-DS-001
- RB-DS-002
- RB-DOM-001
- RB-DOM-002
- RB-DOM-003
- RB-DOM-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-DATA-001
- RB-DATA-002
- RB-SEC-001
- RB-SEC-002
- RB-PRIV-001
- RB-PRIV-002
- RB-QA-001
- RB-QA-002
- RB-DEV-001
- RB-CICD-001
- RB-INFRA-001
- RB-ADR-001
- RB-ADR-002
- RB-ADR-003
- RB-ADR-004
- RB-ADR-005
- RB-ADR-006
- RB-ADR-008
- RB-ADR-009
- RB-ADR-010
- RB-ADR-011

next_documents:

- RB-ADR-013

ai_context:
priority: critical
index: true
---

# RB-ADR-012 — Adoção da Google Maps Platform como Provider Geoespacial Inicial

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* Google Maps Platform será o Provider geoespacial inicial;
* Google Maps JavaScript API será a base inicial do mapa interativo;
* Places API será o Provider inicial de busca e detalhes de locais;
* Geocoding API será utilizada para conversão controlada entre endereços e coordenadas;
* Routes API será utilizada para rotas, distâncias e tempos de deslocamento;
* PostGIS continuará responsável pelos dados geográficos canônicos e consultas próprias;
* todo acesso ao Provider deverá ocorrer por ports e adapters;
* dados do Provider deverão possuir Provenance;
* cache e persistência deverão respeitar os termos aplicáveis;
* custo e quotas deverão possuir limites e observabilidade;
* versões de SDKs e contratos deverão ser fixadas.

---

## 2. Contexto

O RouteBook é um produto de apoio à decisão durante viagens.

A primeira experiência real será direcionada a uma viagem para Pipa, no Rio Grande do Norte.

O produto deverá ajudar o usuário a responder perguntas como:

* quais praias visitar;
* quais restaurantes estão próximos;
* onde vale a pena ir à noite;
* quanto tempo o deslocamento levará;
* qual local está mais próximo da hospedagem;
* quais Activities cabem no mesmo período;
* qual rota é mais adequada;
* quais alternativas existem nas proximidades;
* quais Places possuem dados suficientes para recomendação.

Essas capacidades exigem diferentes tipos de informação:

* mapa visual;
* pontos geográficos;
* endereços;
* categorias;
* nomes;
* horários;
* fotografias;
* avaliações;
* coordenadas;
* rotas;
* distâncias;
* duração por modo de deslocamento;
* condições de tráfego;
* Provenance;
* data de atualização.

O RouteBook também adotou:

* PostgreSQL;
* PostGIS;
* Place Catalog;
* Mobility;
* Decision Intelligence;
* arquitetura baseada em ports e adapters;
* políticas de privacidade e custos;
* aplicação web Next.js.

É necessário selecionar um Provider inicial sem tornar o modelo canônico dependente dos contratos externos.

---

## 3. Problema

Qual estratégia e Provider deverão ser utilizados inicialmente para:

* renderizar mapas;
* localizar endereços;
* descobrir Places;
* obter detalhes de Places;
* calcular rotas;
* calcular distâncias;
* calcular tempos de deslocamento;
* oferecer boa cobertura em Pipa e no Brasil;
* suportar diferentes modos de viagem;
* controlar custos;
* preservar portabilidade;
* integrar dados externos ao Place Catalog e ao módulo Mobility?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. qualidade dos dados de Places;
2. cobertura no Brasil;
3. qualidade de endereços;
4. disponibilidade de fotografias e avaliações;
5. rotas;
6. matrizes de distância;
7. múltiplos modos de deslocamento;
8. informação de tráfego quando aplicável;
9. experiência de mapa;
10. integração web;
11. documentação;
12. estabilidade do Provider;
13. suporte a TypeScript;
14. segurança de credenciais;
15. controle de custo;
16. observabilidade;
17. licenciamento;
18. atribuição;
19. portabilidade;
20. integração com PostGIS;
21. desenvolvimento AI-First;
22. precisão suficiente para decisões de viagem.

---

## 5. Restrições

A solução deverá:

* funcionar com Next.js;
* funcionar em navegadores modernos;
* funcionar com TypeScript;
* funcionar com adapters server-side;
* preservar PostGIS como base geográfica própria;
* permitir mapa responsivo;
* permitir lista alternativa ao mapa;
* suportar localização da hospedagem;
* suportar Places próximos;
* suportar distância e duração;
* possuir quotas configuráveis;
* possuir billing alerts;
* não expor chaves server-side;
* respeitar atribuição;
* respeitar regras de armazenamento;
* não tornar contratos externos modelos de domínio;
* não depender de chamadas ao Provider em toda leitura;
* permitir substituição futura.

---

## 6. Terminologia

### 6.1 Map Renderer

Tecnologia responsável por apresentar visualmente o mapa.

### 6.2 Map Tile

Unidade visual ou vetorial utilizada para compor o mapa.

### 6.3 Place Provider

Fonte externa de busca e dados sobre estabelecimentos, praias, atrações e pontos de interesse.

### 6.4 Geocoding

Conversão de texto ou endereço em coordenadas.

### 6.5 Reverse Geocoding

Conversão de coordenadas em endereço ou descrição de localização.

### 6.6 Route

Caminho calculado entre origem e destino.

### 6.7 Route Matrix

Conjunto de distâncias e durações calculadas entre várias origens e destinos.

### 6.8 Geographic Distance

Distância espacial direta entre coordenadas.

### 6.9 Route Distance

Distância percorrida por uma rota calculada.

### 6.10 Travel Duration

Tempo estimado para percorrer uma rota em determinado modo.

### 6.11 Place ID

Identificador atribuído pelo Provider a um local.

### 6.12 Provenance

Registro da origem, Provider, instante e método pelo qual um dado foi obtido.

---

## 7. Princípio central

Mapa, Place, geocoding, rota e distância são capacidades distintas.

```text
Map Renderer
≠
Place Provider
≠
Geocoder
≠
Routing Provider
≠
PostGIS
```

A adoção de um único fornecedor inicial não permitirá misturar essas responsabilidades no domínio.

---

## 8. Opções consideradas

### 8.1 Opção A — Google Maps Platform

Utilizar serviços da Google Maps Platform para mapa, Places, geocoding e rotas.

#### Benefícios

* ampla cobertura;
* grande catálogo de Places;
* avaliações e fotografias;
* busca textual;
* Nearby Search;
* detalhes de locais;
* geocoding;
* rotas;
* matrizes;
* tráfego em capacidades compatíveis;
* diferentes modos;
* documentação;
* integração web consolidada;
* experiência reconhecida pelos usuários.

#### Limitações

* cobrança por uso;
* necessidade de billing;
* restrições de armazenamento;
* requisitos de atribuição;
* dependência de termos do Provider;
* risco de lock-in;
* necessidade de restringir API keys;
* determinados resultados devem ser exibidos em mapas compatíveis com as políticas;
* custo pode crescer com uso descontrolado.

#### Avaliação

Oferece a melhor cobertura funcional para o MVP e para a experiência inicial em Pipa.

Foi selecionada.

---

### 8.2 Opção B — Mapbox

Utilizar Mapbox para mapas, busca, geocoding e directions.

#### Benefícios

* mapas altamente customizáveis;
* Mapbox GL;
* geocoding;
* Search Box;
* directions;
* boa documentação;
* integração web;
* experiência visual flexível.

#### Limitações

* cobrança e quotas;
* termos próprios;
* qualidade de Places pode variar por região;
* menor confiança inicial no catálogo de estabelecimentos para o caso específico;
* ainda existe dependência de Provider;
* seria necessário validar cobertura detalhada em Pipa.

#### Avaliação

É a principal alternativa comercial.

Não foi selecionada como Provider inicial, mas permanece candidata para revisão futura.

---

### 8.3 Opção C — MapLibre com OpenStreetMap e serviços separados

Utilizar MapLibre para renderização e combinar:

* OpenStreetMap;
* Nominatim ou geocoder equivalente;
* motor de routing;
* serviço de tiles;
* Place Provider adicional.

#### Benefícios

* renderer open source;
* maior portabilidade;
* controle visual;
* múltiplos fornecedores;
* possibilidade de self-hosting;
* menor dependência de uma plataforma única;
* ecossistema geoespacial aberto.

#### Limitações

* MapLibre é principalmente renderer;
* geocoding não faz parte automaticamente do núcleo;
* routing exige serviço adicional;
* tiles exigem origem e infraestrutura;
* POIs podem exigir tratamento e enriquecimento;
* maior complexidade operacional;
* termos de OpenStreetMap e serviços públicos precisam ser respeitados;
* qualidade de Places comerciais pode exigir outra fonte.

#### Avaliação

É uma estratégia relevante para redução futura de lock-in, mas introduz complexidade excessiva para o MVP.

Foi rejeitada como composição inicial.

---

### 8.4 Opção D — OpenStreetMap com infraestrutura própria

Operar:

* tiles;
* geocoder;
* routing;
* importação de dados;
* atualização;
* infraestrutura.

#### Benefícios

* alto controle;
* independência de Provider comercial;
* customização;
* dados abertos conforme licenças aplicáveis;
* possibilidade de otimização regional.

#### Limitações

* alta complexidade;
* operação especializada;
* atualização de dados;
* storage;
* processamento;
* monitoramento;
* qualidade de dados comerciais variável;
* custo técnico desproporcional ao MVP.

#### Avaliação

Foi rejeitada para o estágio inicial.

---

### 8.5 Opção E — Providers separados desde o início

Selecionar:

* um renderer;
* um Place Provider;
* um geocoder;
* um routing Provider;
* um tile Provider.

#### Benefícios

* melhor ferramenta por capacidade;
* redução de dependência única;
* possibilidade de otimização de preço;
* substituição parcial.

#### Limitações

* múltiplos contratos;
* múltiplas chaves;
* múltiplas políticas;
* reconciliação de identificadores;
* divergência de coordenadas;
* maior complexidade;
* maior carga operacional;
* debugging mais difícil.

#### Avaliação

A arquitetura deverá permitir essa evolução, mas o MVP começará com um Provider principal.

---

### 8.6 Opção F — Apenas PostGIS

Utilizar somente dados próprios e PostGIS para mapas, Places e mobilidade.

#### Benefícios

* controle total dos dados próprios;
* consultas rápidas;
* ausência de chamadas externas;
* alta consistência interna.

#### Limitações

* PostGIS não fornece catálogo de Places;
* não fornece fotografias ou avaliações;
* não fornece rotas por vias;
* não fornece tráfego;
* não fornece mapa visual;
* não fornece geocoding completo;
* exigiria aquisição e atualização de datasets.

#### Avaliação

PostGIS continuará essencial, mas não substitui Providers externos.

---

## 9. Decisão

O RouteBook adotará inicialmente:

* **Google Maps JavaScript API** para o mapa interativo;
* **Places API** para busca, descoberta e detalhes de locais;
* **Geocoding API** para geocoding e reverse geocoding;
* **Routes API** para rotas e matrizes de distância e duração;
* **PostGIS** para persistência canônica de coordenadas e consultas espaciais próprias;
* **Browser Geolocation API** para localização do usuário, mediante consentimento;
* **ports e adapters próprios** para todas as capacidades externas.

---

## 10. Escopo da decisão

Esta decisão define:

* Provider geoespacial inicial;
* capacidades iniciais utilizadas;
* separação entre mapa e dados;
* integração com Place Catalog;
* integração com Mobility;
* papel do PostGIS;
* política de adapters;
* cache;
* custos;
* quotas;
* atribuição;
* testes;
* fallback;
* portabilidade.

Esta decisão não define integralmente:

* biblioteca React final para o mapa;
* estilo visual final;
* todos os campos de Place;
* ranking de Recommendations;
* algoritmo final de itinerário;
* navegação turn-by-turn;
* tracking contínuo de localização;
* mapas offline;
* Provider secundário;
* estratégia de self-hosting;
* termos comerciais negociados.

---

## 11. Arquitetura de capacidades

A arquitetura deverá separar:

```text
Map Rendering
Place Discovery
Place Details
Geocoding
Reverse Geocoding
Route Computation
Route Matrix
Geographic Queries
```

Cada capacidade deverá possuir contrato próprio.

---

## 12. Ports principais

Estrutura conceitual:

```typescript
interface MapConfigurationProvider {
  getPublicMapConfiguration(): Promise<PublicMapConfiguration>;
}

interface PlaceSearchProvider {
  searchPlaces(
    input: PlaceSearchInput,
  ): Promise<PlaceSearchResult>;
}

interface PlaceDetailsProvider {
  getPlaceDetails(
    input: PlaceDetailsInput,
  ): Promise<ProviderPlaceDetails | null>;
}

interface GeocodingProvider {
  geocode(
    input: GeocodingInput,
  ): Promise<GeocodingResult[]>;

  reverseGeocode(
    input: ReverseGeocodingInput,
  ): Promise<ReverseGeocodingResult[]>;
}

interface RoutingProvider {
  computeRoute(
    input: ComputeRouteInput,
  ): Promise<ComputedRoute>;

  computeRouteMatrix(
    input: ComputeRouteMatrixInput,
  ): Promise<RouteMatrix>;
}
```

---

## 13. Adapters

Adapters iniciais poderão incluir:

```text
GoogleMapsRendererAdapter
GooglePlacesSearchAdapter
GooglePlaceDetailsAdapter
GoogleGeocodingAdapter
GoogleRoutesAdapter
```

Os nomes internos poderão variar, mas a responsabilidade deverá permanecer separada.

---

## 14. Contratos internos

Contratos internos não deverão reproduzir integralmente as respostas da Google.

Eles deverão conter apenas dados necessários ao RouteBook.

Exemplo conceitual:

```typescript
interface PlaceSearchCandidate {
  providerReference: ProviderPlaceReference;
  name: string;
  location: GeographicPoint;
  categories: PlaceCategoryCandidate[];
  formattedAddress?: string;
  ratingSummary?: RatingSummary;
  photoReferences?: ProviderPhotoReference[];
  provenance: Provenance;
}
```

---

## 15. Provider Reference

Referências externas deverão ser representadas explicitamente.

```typescript
interface ProviderPlaceReference {
  provider: "google-maps";
  externalId: string;
}
```

O `externalId` não deverá substituir o `PlaceId` canônico do RouteBook.

---

## 16. PlaceId canônico

O Place Catalog deverá criar e manter seu próprio `PlaceId`.

Relação conceitual:

```text
PlaceId
→ ProviderPlaceReference
→ Google Place ID
```

Isso permite:

* múltiplos Providers;
* reconciliação;
* mudança de fornecedor;
* Places criados internamente;
* histórico;
* deduplicação.

---

## 17. Place Catalog

O Place Catalog será owner dos Places canônicos.

A Google Maps Platform será fonte externa de candidatos e atributos.

O adapter não deverá criar diretamente entidades finais sem:

* validação;
* normalização;
* deduplicação;
* Provenance;
* policy;
* mapeamento de categorias.

---

## 18. Categorias

Categorias externas deverão ser traduzidas para categorias canônicas.

Exemplo:

```text
Google Place Type
→ Provider Category Mapping
→ RouteBook Place Category
```

Categorias do Provider não deverão se tornar automaticamente a taxonomia oficial.

---

## 19. Dados canônicos e derivados

Deverão ser diferenciados:

### Dados canônicos próprios

* PlaceId;
* categorias RouteBook;
* curadoria;
* status;
* notas internas;
* relação com Trips;
* relações com Activities;
* Provenance;
* coordenada canônica validada.

### Dados externos ou derivados

* rating externo;
* quantidade de avaliações;
* fotografia externa;
* horário externo;
* preço estimado externo;
* status de funcionamento;
* rota;
* distância;
* duração;
* resultado de busca.

---

## 20. Provenance

Todo dado externo relevante deverá registrar:

```text
provider
providerReference
capability
retrievedAt
sourceVersion
requestContext
expiresAt quando aplicável
```

Dados sem Provenance não deverão ser tratados como atuais ou verificáveis.

---

## 21. Freshness

A aplicação deverá distinguir:

* dado persistente permitido;
* dado cacheável;
* dado temporário;
* dado que precisa ser atualizado;
* dado derivado.

A validade deverá variar conforme a natureza.

Exemplos:

* coordenada tende a ser estável;
* horário de funcionamento pode mudar;
* rating pode mudar;
* rota depende da origem, destino, modo e instante;
* tráfego possui alta volatilidade.

---

## 22. Políticas de armazenamento

Antes de persistir ou cachear qualquer campo proveniente do Provider, a implementação deverá verificar:

* termos aplicáveis;
* política da API;
* finalidade;
* duração permitida;
* atribuição;
* possibilidade de atualização;
* obrigação de exclusão;
* uso em mapa;
* uso fora do mapa.

Não deverá ser presumido que toda resposta pode ser armazenada indefinidamente.

---

## 23. Place IDs

Place IDs poderão ser armazenados como referências externas, conforme as políticas aplicáveis.

Eles deverão ser atualizados ou reconciliados quando o Provider indicar substituição, expiração ou mudança.

O RouteBook deverá continuar utilizando `PlaceId` próprio.

---

## 24. Fotografias

Fotografias deverão ser tratadas como conteúdo externo sujeito a:

* atribuição;
* referência do Provider;
* tamanho;
* validade;
* regras de exibição;
* licença;
* disponibilidade;
* remoção.

URLs temporárias não deverão ser armazenadas como se fossem permanentes.

---

## 25. Avaliações e ratings

Ratings e quantidade de avaliações deverão possuir:

* Provider;
* instante de coleta;
* escala;
* quantidade;
* Provenance;
* validade.

O RouteBook não deverá combinar ratings de múltiplos Providers sem metodologia explícita.

---

## 26. Horários de funcionamento

Horários externos deverão ser tratados como informação sujeita a mudança.

A interface deverá poder informar:

* fonte;
* data de atualização;
* incerteza;
* recomendação de confirmação.

Eles não deverão ser usados como única garantia de que um local estará aberto.

---

## 27. Mapa visual

O mapa deverá ser implementado como Client Component localizado.

Ele deverá receber somente:

* configuração pública necessária;
* markers;
* viewport;
* polylines;
* estado de seleção;
* callbacks controlados.

O mapa não deverá receber:

* secrets server-side;
* entidades completas;
* repositories;
* tokens privados;
* contratos internos desnecessários.

---

## 28. Lista alternativa

Toda experiência baseada em mapa deverá possuir alternativa equivalente em lista.

A lista deverá permitir:

* leitura;
* navegação;
* seleção;
* ordenação;
* detalhes;
* ações principais.

O acesso aos Places não poderá depender exclusivamente de interação visual com o mapa.

---

## 29. Responsividade

Em dispositivos móveis, a experiência poderá utilizar:

* alternância entre mapa e lista;
* bottom sheet;
* cards;
* filtros compactos;
* mapa em tela dedicada;
* detalhes em painel.

A implementação deverá evitar mapa excessivamente pequeno e controles sobrepostos.

---

## 30. Acessibilidade

O mapa deverá possuir:

* nome acessível;
* controles identificáveis;
* alternativa em lista;
* foco controlado;
* mensagens de atualização quando necessárias;
* contrastes adequados;
* suporte a redução de movimento.

Informações críticas não deverão existir apenas como cor ou posição visual.

---

## 31. Geolocalização do navegador

A Browser Geolocation API poderá ser utilizada somente mediante ação ou consentimento compatível.

O sistema deverá tratar:

* permissão concedida;
* permissão negada;
* indisponibilidade;
* timeout;
* baixa precisão;
* localização desatualizada;
* ausência de suporte.

---

## 32. Localização precisa

Localização precisa é um dado sensível.

Ela deverá:

* ser solicitada somente quando necessária;
* possuir finalidade clara;
* permanecer pelo menor tempo possível;
* não ser registrada em logs;
* não ser persistida automaticamente;
* não ser enviada a modelos de IA sem necessidade;
* não ser compartilhada sem consentimento.

---

## 33. Hospedagem como origem

A hospedagem será uma origem relevante para o planejamento.

Ela poderá possuir:

* endereço informado;
* coordenada;
* Provider Reference;
* nível de precisão;
* confirmação do usuário;
* Provenance.

O usuário deverá poder corrigir a localização quando o geocoding estiver impreciso.

---

## 34. Geocoding

Geocoding deverá ser utilizado para:

* hospedagens;
* endereços;
* destinos;
* pontos informados pelo usuário.

O resultado deverá possuir:

* endereço normalizado;
* coordenada;
* nível de precisão;
* componentes;
* Provider Reference;
* Provenance.

---

## 35. Geocoding não determinístico

O mesmo texto poderá retornar resultados diferentes conforme:

* região;
* idioma;
* contexto;
* bias;
* atualização da base;
* Provider.

A aplicação deverá utilizar:

* contexto geográfico;
* país;
* região;
* idioma;
* confirmação do usuário;
* alternativas quando necessário.

---

## 36. Reverse geocoding

Reverse geocoding poderá ser utilizado para:

* exibir endereço aproximado;
* confirmar posição;
* contextualizar localização do usuário;
* identificar área.

O endereço resultante não deverá ser tratado como prova absoluta de localização administrativa.

---

## 37. Geographic Distance

PostGIS será utilizado preferencialmente para distância espacial direta entre coordenadas persistidas.

Essa distância poderá apoiar:

* filtro inicial;
* ordenação aproximada;
* raio;
* fallback;
* pré-seleção de candidatos.

---

## 38. Route Distance

Routes API será utilizada quando for necessário calcular:

* distância real por vias;
* duração estimada;
* caminho;
* instruções;
* efeito do modo de deslocamento;
* condições de tráfego quando disponíveis.

A distância espacial não deverá substituir a distância de rota.

---

## 39. Travel Modes

Modos iniciais poderão incluir, conforme suporte e contexto:

* walking;
* driving;
* bicycling;
* transit;
* two-wheeler, quando disponível e adequado.

O contrato interno deverá utilizar modos canônicos e mapear para o Provider.

---

## 40. Route Matrix

Route Matrix será utilizada para comparar múltiplos destinos.

Casos:

* Places próximos da hospedagem;
* restaurantes candidatos;
* Activities de um período;
* ordenação por tempo;
* avaliação de viabilidade.

A quantidade de elementos deverá ser limitada para controlar custo.

---

## 41. Pré-filtragem com PostGIS

Antes de enviar muitos destinos ao Provider, a aplicação deverá poder:

1. filtrar candidatos com PostGIS;
2. limitar por raio;
3. ordenar por distância geográfica;
4. selecionar os candidatos mais relevantes;
5. calcular matriz somente para o conjunto reduzido.

Isso deverá reduzir custo e latência.

---

## 42. Estratégia híbrida de distância

Fluxo recomendado:

```text
Place candidates
→ filtro por PostGIS
→ ranking inicial
→ Route Matrix para candidatos selecionados
→ ranking por distância e duração reais
```

---

## 43. Rotas e tráfego

Rotas dependentes de tráfego deverão registrar:

* instante de cálculo;
* modo;
* origem;
* destino;
* parâmetros;
* duração;
* duração sem tráfego quando disponível;
* Provenance.

Não deverão ser reutilizadas indefinidamente.

---

## 44. Duração estimada

A interface deverá comunicar que a duração é estimada.

Ela poderá variar por:

* trânsito;
* clima;
* obras;
* modo;
* horário;
* disponibilidade;
* condições locais;
* acesso a praias e trilhas.

---

## 45. Rotas para praias

Praias e atrações naturais podem possuir:

* acesso indireto;
* estacionamento distante;
* trechos a pé;
* entrada por trilha;
* coordenada do ponto de acesso diferente do ponto visual.

O Place Catalog deverá poder diferenciar:

* localização do Place;
* ponto de acesso;
* estacionamento;
* ponto de encontro;
* entrada.

---

## 46. Rotas compostas

Futuramente, uma Activity poderá exigir trechos compostos:

```text
carro
→ estacionamento
→ caminhada
→ destino
```

A primeira implementação poderá trabalhar com um único modo por cálculo, mas o contrato não deverá impedir evolução.

---

## 47. Polyline

Polylines poderão ser utilizadas para visualização da rota.

Elas deverão ser tratadas como resultado derivado do Provider.

Sua persistência e exibição deverão respeitar as políticas aplicáveis.

---

## 48. Navegação turn-by-turn

O RouteBook não implementará navegação turn-by-turn no primeiro incremento.

A aplicação poderá:

* mostrar rota;
* mostrar resumo;
* abrir navegação externa;
* oferecer deep link para aplicativo compatível.

---

## 49. Deep links

Links para navegação externa deverão:

* ser construídos com parâmetros seguros;
* possuir fallback;
* não incluir dados privados desnecessários;
* ser compatíveis com dispositivos;
* ser testados.

---

## 50. Chaves públicas e privadas

Deverão existir chaves ou credenciais separadas conforme capacidade.

### Chaves client-side

Poderão ser utilizadas somente para APIs necessárias ao navegador e deverão possuir:

* restrição por origem;
* restrição por API;
* quotas;
* monitoramento.

### Chaves server-side

Deverão permanecer em secrets e possuir:

* restrição por API;
* restrição de rede quando aplicável;
* rotação;
* acesso mínimo.

---

## 51. Restrições de chave

Toda chave deverá possuir:

* ambiente;
* owner;
* APIs permitidas;
* origem ou workload permitido;
* quota;
* alertas;
* rotação;
* data de criação;
* finalidade.

Chaves irrestritas não deverão ser utilizadas em produção.

---

## 52. Ambientes

Deverão existir configurações separadas para:

* desenvolvimento;
* teste;
* preview;
* staging;
* produção.

Produção não deverá compartilhar chaves com pull requests ou ambientes não confiáveis.

---

## 53. Preview environments

Ambientes de preview deverão:

* utilizar chave restrita;
* possuir quota baixa;
* não acessar dados reais;
* não expor credenciais server-side;
* usar fakes quando necessário.

---

## 54. Custos

A Google Maps Platform utiliza cobrança por consumo e SKUs específicos.

O RouteBook deverá tratar custo como requisito arquitetural.

Toda chamada deverá possuir:

* capability;
* SKU esperado quando conhecido;
* volume;
* Account;
* ambiente;
* cache policy;
* fallback;
* limite.

---

## 55. Budgets

Deverão ser configurados:

* orçamento mensal;
* alertas progressivos;
* quota por API;
* limites por ambiente;
* proteção contra abuso;
* acompanhamento por capability.

---

## 56. Quotas

Quotas deverão limitar:

* autocomplete;
* Place Search;
* Place Details;
* geocoding;
* Routes;
* Route Matrix;
* Maps loads;
* fotografias.

Limites não deverão ser deixados no maior valor disponível sem necessidade.

---

## 57. Cost Attribution

Quando viável, o sistema deverá atribuir uso a:

* capability;
* request;
* Account;
* Trip;
* ambiente;
* Provider;
* operação.

Isso deverá permitir descobrir quais experiências geram custo.

---

## 58. Autocomplete

Autocomplete deverá utilizar sessões ou mecanismo recomendado pelo Provider quando isso alterar custo e qualidade.

A implementação deverá:

* limitar chamadas;
* usar debounce;
* exigir caracteres mínimos;
* cancelar requests obsoletos;
* aplicar bias geográfico;
* finalizar corretamente a sessão;
* evitar busca em cada alteração desnecessária.

---

## 59. Place Details

A aplicação deverá solicitar somente os campos necessários.

Field masks ou mecanismos equivalentes deverão ser utilizados quando suportados.

Solicitar todos os campos por conveniência deverá ser evitado.

---

## 60. Field minimization

Os campos solicitados deverão depender do caso de uso.

Exemplos:

### Card resumido

* nome;
* coordenada;
* categoria;
* rating resumido;
* fotografia de referência.

### Detalhes

* endereço;
* horário;
* website;
* telefone;
* acessibilidade quando disponível;
* outras informações necessárias.

---

## 61. Cache

O cache deverá respeitar:

* termos;
* validade;
* Provider;
* operação;
* Account;
* origem;
* destino;
* modo;
* instante;
* sensibilidade.

Não deverá existir um TTL universal para todas as capacidades.

---

## 62. Cache de Route Matrix

A chave deverá considerar, no mínimo:

```text
provider
origin
destinations
travelMode
routingPreference
departureTime bucket
language
region
```

Dados de tráfego deverão possuir validade curta.

---

## 63. Cache de geocoding

Resultados poderão utilizar cache controlado quando permitido e adequado.

A aplicação deverá preservar:

* texto original;
* resultado selecionado;
* Provider Reference;
* coordenada;
* precisão;
* Provenance.

---

## 64. Cache stampede

Capacidades de alto custo deverão evitar múltiplas chamadas idênticas simultâneas.

Estratégias:

* request coalescing;
* locks curtos;
* cache;
* deduplicação;
* idempotência.

---

## 65. Fallbacks

Quando o Provider estiver indisponível, o sistema deverá degradar de forma controlada.

Possíveis fallbacks:

* dados canônicos do Place Catalog;
* distância geográfica do PostGIS;
* lista sem mapa;
* último valor permitido e ainda válido;
* abertura em mapa externo;
* mensagem de indisponibilidade.

---

## 66. Fallback de rota

Quando a rota não puder ser calculada, a aplicação poderá mostrar:

* distância geográfica;
* aviso de indisponibilidade;
* recomendação para abrir mapa externo;
* ausência de duração.

Não deverá inventar duração.

---

## 67. Circuit breaker

Adapters poderão utilizar circuit breaker quando:

* falhas forem recorrentes;
* retries ampliarem impacto;
* o Provider estiver degradado.

A estratégia deverá possuir:

* threshold;
* duração;
* métricas;
* fallback;
* recuperação.

---

## 68. Retry

Retries somente deverão ocorrer para falhas transitórias elegíveis.

Deverão utilizar:

* limite;
* backoff;
* jitter;
* timeout;
* idempotência;
* respeito a rate limits.

Erros de input e quota não deverão ser repetidos indiscriminadamente.

---

## 69. Timeout

Toda chamada deverá possuir timeout.

Tempos diferentes poderão ser utilizados para:

* autocomplete;
* Place Details;
* geocoding;
* Route;
* Route Matrix;
* imagens.

---

## 70. Rate limiting interno

O RouteBook deverá limitar chamadas por:

* IP;
* User;
* Account;
* sessão;
* capability;
* endpoint;
* período.

Isso deverá reduzir abuso e custo.

---

## 71. Dados do usuário

Queries enviadas ao Provider poderão revelar:

* destinos;
* hospedagem;
* coordenadas;
* interesses;
* rotas.

A aplicação deverá minimizar os dados enviados e documentar a finalidade.

---

## 72. Localização e IA

Localização precisa não deverá ser enviada automaticamente a modelos de IA.

Quando necessária para uma capability, deverá ser:

* minimizada;
* aproximada quando suficiente;
* justificada;
* protegida;
* registrada por Provenance;
* excluída conforme retenção.

---

## 73. Conteúdo para IA

Dados de Places fornecidos a modelos deverão ser transformados em contexto interno autorizado.

O modelo não deverá receber a resposta completa do Provider quando apenas alguns campos forem necessários.

---

## 74. Grounding

Recommendations baseadas em Places deverão preservar:

* PlaceId;
* Provider Reference;
* data da informação;
* campos utilizados;
* origem;
* incerteza.

Uma Recommendation não deverá apresentar como fato atual um dado antigo sem indicação.

---

## 75. Structured Outputs

Outputs de IA relacionados a Places deverão utilizar identificadores canônicos.

Exemplo:

```text
PlaceId
RecommendationId
ItineraryProposalId
```

O modelo não deverá criar um novo Place apenas com nome textual sem processo de resolução.

---

## 76. Tool contracts

Tools geoespaciais poderão incluir:

```text
SearchPlaces
GetPlaceDetails
GeocodeAddress
ReverseGeocode
ComputeRoute
ComputeRouteMatrix
FindNearbyPlaces
```

Cada Tool deverá possuir:

* schema;
* autorização;
* limite;
* custo;
* timeout;
* Provider;
* output validado;
* Provenance.

---

## 77. Tools read-only

As Tools geoespaciais iniciais serão predominantemente read-only.

Elas não deverão alterar automaticamente:

* Trip;
* Activity;
* Place canônico;
* Itinerary;
* Recommendation;
* Itinerary Proposal.

A persistência deverá ocorrer por caso de uso explícito.

---

## 78. Observabilidade

Cada chamada deverá registrar, de forma sanitizada:

```text
provider
capability
operation
result
duration
requestId
correlationId
accountId quando permitido
tripId quando permitido
cacheStatus
retryCount
quotaOutcome
estimatedCostClass
errorCode
```

---

## 79. Logs

Logs não deverão conter:

* API keys;
* coordenada precisa sem necessidade;
* endereço completo sem finalidade;
* resposta integral;
* tokens;
* URLs assinadas;
* dados pessoais;
* query sensível completa.

---

## 80. Métricas

Poderão ser acompanhadas:

* chamadas por API;
* chamadas por capability;
* cache hit;
* latência;
* erros;
* timeouts;
* retries;
* quota;
* custo;
* resultados vazios;
* Places resolvidos;
* geocoding ambíguo;
* matriz por quantidade de elementos;
* chamadas por Account.

---

## 81. Alertas

Alertas deverão cobrir:

* aumento de custo;
* quota próxima do limite;
* chave inválida;
* origem não autorizada;
* aumento de erros;
* latência elevada;
* falhas de billing;
* crescimento anormal de autocomplete;
* Route Matrix excessiva;
* uso em ambiente inesperado.

---

## 82. Qualidade de dados

A qualidade deverá ser avaliada para:

* cobertura em Pipa;
* praias;
* restaurantes;
* bares;
* atrações;
* horários;
* coordenadas;
* duplicidades;
* nomes locais;
* categorias;
* acessos;
* vias.

O Provider não deverá ser considerado infalível.

---

## 83. Curadoria

O RouteBook deverá permitir curadoria de dados relevantes.

Curadoria poderá:

* corrigir categoria;
* corrigir ponto de acesso;
* selecionar fotografia;
* adicionar observação;
* marcar local duplicado;
* marcar local fechado;
* definir prioridade.

Dados curados deverão preservar a origem da alteração.

---

## 84. Deduplicação

Places poderão aparecer:

* com IDs diferentes;
* com nomes variantes;
* em Providers distintos;
* em pontos próximos;
* com filial e matriz;
* com entrada e destino.

A deduplicação deverá considerar:

* Provider Reference;
* nome normalizado;
* coordenada;
* endereço;
* telefone;
* website;
* categoria;
* revisão manual quando necessário.

---

## 85. Reconciliação

Mudanças externas poderão exigir reconciliação.

Casos:

* Place fechado;
* Place movido;
* ID substituído;
* duplicação;
* mudança de nome;
* alteração de coordenada.

O Place canônico não deverá ser removido automaticamente sem policy.

---

## 86. Atribuição

A aplicação deverá exibir atribuições exigidas pelo Provider.

Atribuições não deverão:

* ser removidas;
* ser ocultadas;
* ser cortadas;
* receber contraste inadequado;
* ser cobertas por controles.

---

## 87. Termos e política de privacidade

Antes de produção, a aplicação deverá possuir documentos públicos compatíveis com os requisitos do Provider, incluindo:

* termos de uso;
* política de privacidade;
* referências exigidas;
* explicação do uso de localização;
* Providers envolvidos.

---

## 88. Portabilidade

Ports internos deverão evitar tipos da Google.

Exemplos proibidos fora do adapter:

```text
google.maps.LatLng
google.maps.places.PlaceResult
GoogleRoutesResponse
```

Exemplos internos:

```text
GeographicPoint
PlaceSearchCandidate
ComputedRoute
RouteMatrix
ProviderPlaceReference
```

---

## 89. Multi-provider readiness

Os contratos deverão permitir Providers alternativos.

Exemplo:

```typescript
type GeospatialProviderId =
  | "google-maps"
  | "mapbox"
  | "openstreetmap"
  | "internal";
```

A existência do tipo não exige implementar todos os Providers.

---

## 90. Provider selection

A seleção inicial poderá ser estática.

Futuramente poderá considerar:

* capability;
* região;
* custo;
* qualidade;
* disponibilidade;
* Account;
* fallback;
* política.

A escolha dinâmica somente deverá ser implementada quando houver segundo Provider real.

---

## 91. PostGIS

PostGIS continuará responsável por:

* coordenadas canônicas;
* pontos de acesso;
* filtros por raio;
* ordenação espacial;
* áreas;
* regiões;
* bounding boxes;
* pré-seleção;
* fallback geográfico.

---

## 92. O que PostGIS não fará inicialmente

PostGIS não substituirá:

* mapa visual;
* catálogo externo;
* geocoding completo;
* routing por vias;
* tráfego;
* fotografias;
* avaliações;
* horários externos.

---

## 93. Segurança client-side

A chave pública do mapa deverá possuir restrições fortes.

Ela não deverá permitir APIs server-side desnecessárias.

O bundle não deverá conter:

* server key;
* secret;
* credencial de Places server-side;
* credencial de Routes;
* configuração administrativa.

---

## 94. Content Security Policy

A CSP deverá permitir apenas domínios necessários para:

* scripts;
* tiles;
* imagens;
* fontes;
* requests;
* frames quando aplicáveis.

Permissões amplas deverão ser evitadas.

---

## 95. Service workers

Service workers não deverão armazenar respostas do Provider sem avaliação das políticas.

O funcionamento offline não será habilitado automaticamente para mapas ou dados externos.

---

## 96. Testes unitários

Deverão cobrir:

* mapeamento de contratos;
* categorias;
* travel modes;
* normalização;
* custos;
* cache keys;
* fallback;
* Provenance;
* validação de campos.

---

## 97. Testes de adapter

Adapters deverão ser testados com respostas controladas para:

* sucesso;
* nenhum resultado;
* erro de autenticação;
* quota;
* timeout;
* rate limit;
* campo ausente;
* contrato alterado;
* rota inexistente;
* modo não suportado.

---

## 98. Contract tests

Deverão validar:

* request enviado;
* field mask;
* idioma;
* região;
* coordenadas;
* resposta;
* mapping;
* erros;
* versões.

Chamadas reais poderão ocorrer em execução controlada e com custo limitado.

---

## 99. Testes de mapa

Playwright deverá validar:

* carregamento;
* marker;
* seleção;
* viewport;
* lista sincronizada;
* geolocalização permitida;
* geolocalização negada;
* mobile;
* acessibilidade básica;
* erro de script;
* fallback.

---

## 100. Testes de Route Matrix

Deverão cobrir:

* uma origem e vários destinos;
* múltiplas origens;
* elementos ausentes;
* rota impossível;
* modos;
* ordenação;
* custo por quantidade;
* cache;
* timeout;
* resultado parcial.

---

## 101. Testes PostGIS

Deverão validar:

* pré-filtragem;
* raio;
* distância geográfica;
* ordenação;
* ponto de hospedagem;
* pontos de acesso;
* candidatos enviados ao Provider.

---

## 102. Testes de custo

Deverão existir verificações para impedir:

* matriz sem limite;
* Place Details com campos desnecessários;
* autocomplete sem debounce;
* retry ilimitado;
* chamadas duplicadas;
* Provider real em testes unitários;
* chave de produção em CI.

---

## 103. Desenvolvimento local

O ambiente local deverá suportar:

* mapas com chave de desenvolvimento;
* adapters fake;
* fixtures;
* modo sem Provider;
* quotas reduzidas;
* PostGIS local.

A interface deverá poder ser desenvolvida sem consumir continuamente APIs pagas.

---

## 104. Fixtures

Fixtures deverão representar Places sintéticos ou dados permitidos.

Elas não deverão copiar respostas externas integralmente sem necessidade ou autorização.

---

## 105. CI/CD

Pull requests deverão utilizar principalmente:

* adapters fake;
* contract fixtures;
* PostGIS real;
* testes de componentes;
* testes de mapa controlado.

Testes reais do Provider deverão possuir:

* execução separada;
* secret protegido;
* quota;
* custo;
* ambiente autorizado;
* owner.

---

## 106. Agentes de IA

Agentes poderão apoiar:

* criação de adapters;
* schemas;
* mappings;
* testes;
* análise de custos;
* fixtures;
* documentação.

Agentes não poderão autonomamente:

* habilitar nova API;
* criar chave;
* remover restrição;
* ampliar quota;
* persistir resposta externa;
* remover atribuição;
* alterar política de cache;
* introduzir Provider;
* enviar localização precisa a modelo;
* registrar credencial;
* executar matriz sem limite.

---

## 107. Revisão de código geoespacial

A revisão deverá avaliar:

* capability correta;
* adapter;
* Provenance;
* termos;
* cache;
* custo;
* quota;
* segurança;
* precisão;
* fallback;
* observabilidade;
* testes;
* Account;
* privacidade.

---

## 108. Consequências positivas

A decisão proporciona:

* mapa consolidado;
* catálogo amplo de Places;
* geocoding;
* rotas;
* matrizes;
* diferentes modos;
* boa cobertura inicial;
* menor complexidade do MVP;
* documentação;
* integração com Next.js;
* base para experiência em Pipa;
* capacidade de enriquecer Recommendations.

---

## 109. Consequências negativas

A decisão introduz:

* dependência da Google Maps Platform;
* cobrança por uso;
* billing;
* quotas;
* restrições de armazenamento;
* atribuições;
* risco de lock-in;
* necessidade de gerenciar chaves;
* necessidade de revisar termos;
* possível custo crescente;
* necessidade de adapters e reconciliação.

---

## 110. Riscos

### 110.1 Custo inesperado

Mitigações:

* quotas;
* budgets;
* alerts;
* cache;
* PostGIS;
* limites;
* field masks;
* rate limiting.

### 110.2 Chave exposta

Mitigações:

* restrições;
* chaves separadas;
* scanning;
* rotação;
* monitoramento.

### 110.3 Lock-in

Mitigações:

* ports;
* contratos internos;
* PlaceId próprio;
* Provider References;
* PostGIS;
* plano de saída.

### 110.4 Persistência incompatível com termos

Mitigações:

* classificação de campos;
* política de cache;
* revisão jurídica;
* Provenance;
* retenção.

### 110.5 Dados incorretos

Mitigações:

* curadoria;
* confirmação;
* timestamp;
* fallback;
* múltiplas fontes futuras.

### 110.6 Route Matrix excessiva

Mitigações:

* pré-filtro PostGIS;
* limites;
* batching;
* observabilidade;
* quotas.

### 110.7 Dependência total do Provider

Mitigações:

* dados canônicos;
* cache permitido;
* lista sem mapa;
* fallback geográfico;
* deep links.

### 110.8 Localização precisa exposta

Mitigações:

* consentimento;
* minimização;
* redaction;
* retenção curta;
* acesso server-side controlado.

---

## 111. Controles

Deverão ser implementados:

* API keys restritas;
* secrets separados;
* budgets;
* quotas;
* rate limiting;
* field masks;
* cache policy;
* Provenance;
* PlaceId canônico;
* Provider References;
* adapters;
* PostGIS;
* atribuição;
* política de privacidade;
* logs sanitizados;
* testes de custo;
* fallbacks;
* circuit breaker;
* timeouts.

---

## 112. Estratégia de implementação

### Etapa 1 — Projeto e segurança

* criar projeto de desenvolvimento;
* habilitar somente APIs necessárias;
* criar chaves separadas;
* aplicar restrições;
* configurar budgets e alertas.

### Etapa 2 — Contratos

* criar ports;
* criar contratos internos;
* criar Provider Reference;
* criar Provenance;
* criar schemas Zod.

### Etapa 3 — Mapa

* integrar mapa como Client Component;
* adicionar marcador da hospedagem;
* adicionar markers de Places;
* criar lista alternativa;
* validar responsividade.

### Etapa 4 — Geocoding

* geocodificar hospedagem;
* permitir correção;
* persistir coordenada canônica permitida;
* registrar Provenance.

### Etapa 5 — Place Search

* implementar busca;
* utilizar bias em Pipa;
* mapear categorias;
* limitar campos;
* criar Place candidate.

### Etapa 6 — Place Details

* carregar detalhes sob demanda;
* aplicar field masks;
* tratar fotografias;
* tratar horários;
* aplicar cache permitido.

### Etapa 7 — Mobility

* implementar rota;
* implementar Route Matrix;
* limitar candidatos;
* combinar com PostGIS;
* registrar duração e Provenance.

### Etapa 8 — Observabilidade

* métricas;
* logs;
* custo;
* quota;
* alertas;
* dashboards.

### Etapa 9 — Qualidade

* testes de adapters;
* testes de mapa;
* testes PostGIS;
* testes de custo;
* validação em Pipa.

---

## 113. Critérios de implementação concluída

A decisão estará implementada quando:

* projeto do Provider estiver configurado;
* chaves estiverem restritas;
* budgets estiverem configurados;
* mapa carregar;
* lista alternativa existir;
* hospedagem puder ser geocodificada;
* Place Search funcionar;
* Place Details funcionar;
* PlaceId canônico existir;
* Provider Reference existir;
* PostGIS armazenar coordenada;
* rota funcionar;
* Route Matrix funcionar;
* cache respeitar política;
* custos forem observáveis;
* fallbacks existirem;
* atribuições estiverem visíveis.

---

## 114. Verificação

A verificação deverá incluir:

* mapa desktop;
* mapa mobile;
* marker;
* lista;
* geolocalização negada;
* geocoding válido;
* geocoding ambíguo;
* Place Search;
* Place Details;
* fotografia;
* horário;
* rota caminhando;
* rota dirigindo;
* matriz;
* candidato sem rota;
* quota;
* timeout;
* chave inválida;
* fallback PostGIS;
* atribuição;
* logs sanitizados.

---

## 115. Métricas

Poderão ser acompanhadas:

* map loads;
* searches;
* Place Details;
* geocoding;
* Routes;
* matrix elements;
* cache hit;
* custo;
* quota;
* latência;
* erros;
* resultados vazios;
* Places importados;
* duplicidades;
* coordenadas corrigidas;
* fallback;
* chamadas por Trip;
* chamadas por Account.

---

## 116. Gatilhos de revisão

A decisão deverá ser revisada quando:

* custos se tornarem desproporcionais;
* qualidade de Places for insuficiente;
* cobertura regional apresentar problemas;
* termos impedirem capacidades essenciais;
* requisitos de mapas offline surgirem;
* MapLibre ou Mapbox oferecerem benefício comprovado;
* self-hosting tornar-se economicamente viável;
* múltiplos Providers forem necessários;
* lock-in impedir evolução;
* requisitos de privacidade exigirem alternativa;
* a aplicação expandir para regiões com cobertura diferente.

---

## 117. Estratégia de rollback

A substituição do Provider deverá ser registrada em novo ADR.

A migração deverá preservar:

* PlaceId canônico;
* coordenadas;
* categorias;
* curadoria;
* Provider References;
* Provenance;
* contratos internos;
* PostGIS;
* testes;
* histórico permitido.

Dados externos não portáveis deverão ser removidos ou atualizados conforme os termos aplicáveis.

---

## 118. Estratégia de saída

O RouteBook deverá preservar a capacidade de:

* trocar o renderer;
* adicionar novo geocoder;
* adicionar novo Place Provider;
* adicionar novo Routing Provider;
* manter PlaceIds próprios;
* reconciliar referências;
* utilizar PostGIS;
* manter experiência em lista.

---

## 119. Alternativas futuras permitidas

Esta decisão não impede:

* MapLibre como renderer;
* Mapbox;
* OpenStreetMap;
* GraphHopper;
* Valhalla;
* openrouteservice;
* Provider regional;
* tiles próprios;
* Provider secundário;
* mapas estáticos;
* dados curados.

Cada adoção deverá possuir escopo, licenciamento, custos e adapter próprios.

---

## 120. Decisões derivadas

Deverão ser avaliadas decisões sobre:

* biblioteca React para mapas;
* Provider secundário;
* estratégia de cache geoespacial;
* política de Place enrichment;
* matching e deduplicação;
* mapas offline;
* route optimization;
* tracking de localização;
* pontos de acesso;
* biblioteca de ícones de mapa;
* deep links de navegação.

---

## 121. Próxima decisão

O `RB-ADR-013` deverá definir a estratégia de observabilidade da aplicação.

A decisão deverá avaliar:

* OpenTelemetry;
* logs estruturados;
* traces;
* métricas;
* error tracking;
* frontend monitoring;
* correlation IDs;
* instrumentação do Next.js;
* PostgreSQL;
* Providers;
* IA;
* custos;
* privacidade;
* Provider gerenciado de observabilidade.

A decisão deverá preservar instrumentação portável e impedir a inclusão de dados pessoais, secrets, prompts integrais e localização precisa em telemetria.

---

## 122. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-012
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o novo ADR;
* permanecer disponível;
* preservar o contexto histórico.

---

## 123. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* Google Maps Platform está justificada;
* Mapbox foi avaliado;
* MapLibre foi avaliado;
* OpenStreetMap foi avaliado;
* mapa está separado de Places;
* Places está separado de geocoding;
* geocoding está separado de routing;
* PostGIS está corretamente posicionado;
* PlaceId canônico está definido;
* Provider Reference está definida;
* Provenance está definida;
* categorias estão governadas;
* fotografias estão governadas;
* horários estão governados;
* distância geográfica está diferenciada;
* distância de rota está diferenciada;
* duração está definida;
* Route Matrix está governada;
* cache está governado;
* políticas de armazenamento estão contempladas;
* atribuição está contemplada;
* localização precisa está protegida;
* custos estão governados;
* quotas estão definidas;
* chaves estão protegidas;
* observabilidade está definida;
* fallback está definido;
* testes estão definidos;
* IA está contemplada;
* Tools estão contempladas;
* agentes estão contemplados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* gatilhos de revisão estão definidos;
* estratégia de saída está definida;
* supersessão está definida;
* não existem contradições com RB-DOM-003;
* não existem contradições com RB-ARC-002;
* não existem contradições com RB-DATA-002;
* não existem contradições com RB-PRIV-002;
* não existem contradições com RB-AI-004;
* não existem contradições com RB-ADR-005;
* não existem contradições com RB-ADR-009;
* não existem contradições com RB-ADR-011.

---

## 124. Declaração final

O RouteBook adotará a Google Maps Platform como Provider geoespacial inicial.

A plataforma será utilizada para:

* renderização de mapas;
* descoberta de Places;
* detalhes de Places;
* geocoding;
* reverse geocoding;
* cálculo de rotas;
* matrizes de distância e duração.

PostGIS continuará sendo a base geográfica própria do RouteBook para:

* coordenadas canônicas;
* consultas espaciais;
* pré-filtragem;
* ordenação geográfica;
* fallback;
* áreas e regiões.

O RouteBook manterá seus próprios:

* PlaceId;
* categorias;
* curadoria;
* Provenance;
* contratos;
* policies;
* dados canônicos.

Os identificadores e modelos do Provider não deverão substituir os conceitos internos.

Toda integração deverá ocorrer por ports e adapters.

Custos, quotas, chaves, armazenamento, cache, atribuição e privacidade serão tratados como requisitos arquiteturais.

A arquitetura deverá permitir que o RouteBook adicione ou substitua Providers futuramente sem reescrever:

* Place Catalog;
* Mobility;
* Decision Intelligence;
* Itinerary Planning;
* interface principal.

A escolha da Google Maps Platform atende ao MVP por oferecer uma composição integrada e madura de mapa, Places e rotas, reduzindo a complexidade inicial enquanto o RouteBook valida sua proposta de valor em uma viagem real.
