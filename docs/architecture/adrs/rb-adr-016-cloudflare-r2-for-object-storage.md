---

id: RB-ADR-016

title: Adoção de Cloudflare R2 como Armazenamento de Objetos Compatível com S3
description: Registra a decisão de adotar Cloudflare R2 como armazenamento de objetos inicial do RouteBook, utilizando uma abstração compatível com S3 para arquivos privados, imagens próprias, exportações e artefatos temporários, com acesso controlado, lifecycle, validação e portabilidade.

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
- object-storage
- cloudflare-r2
- s3
- files
- uploads
- signed-urls
- images
- exports
- artifacts
- privacy
- security
- lifecycle
- portability

related_documents:

- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-002
- RB-PRD-005
- RB-PRD-006
- RB-PRD-007
- RB-PRD-008
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
- RB-AI-004
- RB-AI-005
- RB-AI-006
- RB-GOV-001
- RB-GOV-002
- RB-RISK-001
- RB-ADR-003
- RB-ADR-004
- RB-ADR-005
- RB-ADR-006
- RB-ADR-008
- RB-ADR-009
- RB-ADR-010
- RB-ADR-013
- RB-ADR-014
- RB-ADR-015

prerequisites:

- RB-FND-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-DATA-001
- RB-DATA-002
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
- RB-SRE-001
- RB-ADR-003
- RB-ADR-004
- RB-ADR-005
- RB-ADR-006
- RB-ADR-008
- RB-ADR-009
- RB-ADR-010
- RB-ADR-013
- RB-ADR-015

next_documents:

- RB-ADR-017

ai_context:
priority: high
index: true
---

# RB-ADR-016 — Adoção de Cloudflare R2 como Armazenamento de Objetos Compatível com S3

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo estabelecido no `RB-GOV-002`.

Após sua aprovação:

* Cloudflare R2 será o Provider inicial de armazenamento de objetos;
* a integração utilizará a interface compatível com S3;
* buckets privados serão o padrão;
* uploads e downloads privados utilizarão acesso temporário;
* metadados canônicos permanecerão no PostgreSQL;
* arquivos serão identificados por um `StoredObjectId` interno;
* chaves de objetos não utilizarão nomes enviados pelo usuário;
* todo objeto possuirá owner, classificação, finalidade e política de retenção;
* lifecycle rules serão utilizadas para objetos temporários;
* uploads permanecerão indisponíveis até validação;
* arquivos não serão tratados como confiáveis com base apenas no MIME type informado pelo cliente;
* imagens externas de Providers não serão copiadas automaticamente;
* o domínio não dependerá de tipos ou SDKs do Cloudflare R2.

---

## 2. Contexto

O RouteBook poderá precisar armazenar conteúdo que não pertence adequadamente a tabelas relacionais ou colunas JSONB.

Exemplos:

* imagem de perfil enviada pelo usuário;
* imagem própria de uma Trip;
* anexos permitidos;
* exportações de dados;
* documentos gerados;
* artefatos de avaliações de IA;
* datasets sintéticos;
* arquivos produzidos por jobs;
* evidências operacionais autorizadas;
* arquivos temporários de processamento.

PostgreSQL continuará sendo adequado para:

* entidades;
* relacionamentos;
* estados;
* permissões;
* auditoria;
* metadados;
* referências.

Arquivos binários, entretanto, exigem capacidades como:

* upload;
* download;
* streaming;
* expiração;
* URLs temporárias;
* limites de tamanho;
* lifecycle;
* distribuição;
* controle de acesso;
* armazenamento econômico.

---

## 3. Problema

Qual solução deverá ser utilizada para armazenar objetos e arquivos do RouteBook, garantindo:

* privacidade;
* autorização por Account;
* uploads seguros;
* downloads temporários;
* lifecycle;
* portabilidade;
* baixo custo inicial;
* integração com Next.js;
* compatibilidade com jobs;
* exclusão de dados;
* observabilidade;
* separação entre arquivo e metadado canônico?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. buckets privados por padrão;
2. compatibilidade com S3;
3. uploads diretos controlados;
4. URLs temporárias;
5. baixo custo de transferência;
6. lifecycle de objetos;
7. portabilidade;
8. criptografia;
9. integração com Node.js;
10. integração com Next.js;
11. isolamento por Account;
12. proteção de dados pessoais;
13. observabilidade;
14. desenvolvimento local;
15. suporte a jobs assíncronos;
16. exclusão e retenção;
17. validação de arquivos;
18. prevenção de conteúdo malicioso.

---

## 5. Restrições

A solução deverá:

* funcionar com Node.js e TypeScript;
* permitir integração server-side;
* suportar upload direto sem expor credenciais;
* suportar download privado temporário;
* utilizar TLS;
* manter buckets privados como baseline;
* separar arquivo de metadado canônico;
* permitir exclusão seletiva;
* permitir lifecycle;
* permitir testes locais;
* não expor secrets no navegador;
* não confiar no nome ou MIME type enviados pelo cliente;
* não armazenar arquivos diretamente no PostgreSQL como estratégia padrão;
* não tornar uma URL temporária um identificador permanente;
* não utilizar storage público para dados privados;
* não copiar conteúdo de Providers sem avaliar licença e termos.

---

## 6. Terminologia

### 6.1 Objeto

Conteúdo binário armazenado em um object storage e identificado por uma chave.

### 6.2 Object Key

Identificador técnico do objeto dentro de um bucket.

### 6.3 Stored Object

Registro canônico do RouteBook que descreve um objeto armazenado.

### 6.4 Bucket

Contêiner lógico de objetos e políticas.

### 6.5 Presigned URL

URL temporária que concede uma operação específica sobre um objeto.

### 6.6 Artefato temporário

Objeto reconstruível ou descartável com retenção limitada.

### 6.7 Arquivo canônico

Objeto cuja existência integra um processo permanente ou uma obrigação do produto.

### 6.8 Quarentena

Estado no qual um upload ainda não pode ser consumido ou disponibilizado.

---

## 7. Princípio central

O object storage armazenará o conteúdo binário.

O PostgreSQL armazenará a identidade, o ownership e o ciclo de vida do arquivo.

```text
PostgreSQL
→ StoredObject
→ objectKey
→ Cloudflare R2
```

O bucket não será a fonte canônica de:

* ownership;
* Account;
* autorização;
* finalidade;
* classificação;
* retenção;
* estado de processamento.

---

## 8. Opções consideradas

### 8.1 Armazenar arquivos no PostgreSQL

#### Benefícios

* consistência transacional;
* uma única infraestrutura;
* autorização próxima aos metadados;
* backups centralizados.

#### Limitações

* crescimento do banco principal;
* maior custo de backup e restore;
* menor adequação a streaming e CDN;
* pressão sobre conexões;
* mistura entre dados relacionais e binários;
* maior custo operacional em escala.

#### Avaliação

Poderá ser utilizado somente para objetos muito pequenos e estruturalmente inseparáveis do registro.

Foi rejeitado como estratégia principal.

---

### 8.2 Filesystem local

#### Benefícios

* implementação simples;
* custo inicial mínimo;
* adequado a desenvolvimento local.

#### Limitações

* não compartilhado entre instâncias;
* efêmero em plataformas serverless;
* difícil de escalar;
* sem distribuição;
* sem alta disponibilidade;
* inadequado para produção.

#### Avaliação

Será permitido somente como adapter local de desenvolvimento.

---

### 8.3 Vercel Blob

#### Benefícios

* integração direta com deployments Vercel;
* acesso público e privado;
* SDK simples;
* uploads adequados a aplicações Next.js;
* baixa carga operacional.

#### Limitações

* maior acoplamento à plataforma de deployment;
* menor portabilidade;
* modelo operacional específico;
* migração futura potencialmente mais custosa.

#### Avaliação

É uma alternativa válida quando integração máxima com Vercel for prioritária.

Não foi selecionada como primeira escolha.

---

### 8.4 Amazon S3

#### Benefícios

* padrão de mercado;
* ecossistema amplo;
* maturidade;
* políticas avançadas;
* lifecycle;
* versionamento;
* presigned URLs;
* múltiplas classes de armazenamento;
* capacidades avançadas de retenção.

#### Limitações

* configuração e IAM mais complexos;
* custos de transferência;
* maior superfície operacional;
* recursos avançados além da necessidade inicial.

#### Avaliação

É a principal alternativa e referência de compatibilidade.

Não foi selecionada inicialmente por simplicidade e perfil de custo.

---

### 8.5 Cloudflare R2

#### Benefícios

* API compatível com S3;
* integração com SDKs S3;
* URLs pré-assinadas;
* lifecycle rules;
* criptografia em repouso e trânsito;
* buckets privados;
* domínios públicos opcionais;
* ausência de cobrança de transferência de saída no modelo atual;
* menor dependência da plataforma de deployment;
* possibilidade de migração por compatibilidade S3.

#### Limitações

* compatibilidade S3 não é integral;
* determinadas capacidades avançadas do S3 podem não existir;
* dependência operacional do Cloudflare;
* cobrança por armazenamento e operações;
* recursos públicos exigem configuração específica;
* segurança e lifecycle continuam sob responsabilidade do RouteBook.

#### Avaliação

Oferece o melhor equilíbrio para o estágio inicial.

Foi selecionada.

---

## 9. Decisão

O RouteBook adotará:

* **Cloudflare R2** como Provider inicial;
* **API compatível com S3** como interface técnica;
* **AWS SDK for JavaScript compatível com S3** ou cliente equivalente aprovado;
* **buckets privados** como configuração padrão;
* **presigned URLs** para upload e download temporários;
* **PostgreSQL** para metadados e autorização;
* **lifecycle rules** para conteúdo temporário;
* **adapter próprio** para preservar portabilidade;
* **quarentena** para uploads que exijam validação;
* **object keys geradas pela aplicação**;
* **StoredObjectId canônico** independente da chave e do Provider.

---

## 10. Escopo da decisão

Esta decisão define:

* Provider inicial;
* modelo de integração;
* buckets;
* chaves;
* upload;
* download;
* metadados;
* quarentena;
* validação;
* lifecycle;
* privacidade;
* exclusão;
* observabilidade;
* testes;
* portabilidade.

Esta decisão não define completamente:

* biblioteca de processamento de imagens;
* serviço de malware scanning;
* CDN definitivo;
* formatos de exportação;
* política final de anexos;
* todos os tipos de arquivos permitidos;
* biblioteca de upload multipart;
* ingestão de vídeos;
* armazenamento de backups;
* repositório de documentos de compliance.

---

## 11. Port de armazenamento

A aplicação deverá depender de uma abstração interna.

```typescript
interface ObjectStorage {
  createUpload(input: CreateObjectUpload): Promise<ObjectUploadGrant>;

  createDownload(input: CreateObjectDownload): Promise<ObjectDownloadGrant>;

  getMetadata(reference: StoredObjectReference): Promise<ObjectMetadata | null>;

  delete(reference: StoredObjectReference): Promise<void>;
}
```

O domínio não deverá importar:

* `S3Client`;
* `PutObjectCommand`;
* tipos do R2;
* endpoints do Provider;
* credenciais;
* URLs específicas.

---

## 12. Stored Object

O PostgreSQL deverá manter um registro semelhante a:

```typescript
interface StoredObject {
  storedObjectId: StoredObjectId;
  accountId: AccountId;
  bucketPurpose: ObjectBucketPurpose;
  objectKey: string;
  provider: ObjectStorageProvider;
  status: StoredObjectStatus;
  classification: DataClassification;
  purpose: StoredObjectPurpose;
  originalFileName?: string;
  declaredContentType?: string;
  detectedContentType?: string;
  sizeBytes?: number;
  checksum?: string;
  createdBy: ActorReference;
  createdAt: Date;
  expiresAt?: Date;
  deletedAt?: Date;
}
```

A estrutura final deverá ser definida no modelo de dados.

---

## 13. Estados do objeto

Estados iniciais:

```text
pending-upload
uploaded
quarantined
processing
available
rejected
deletion-pending
deleted
expired
```

Somente objetos `available` poderão ser apresentados ao usuário comum.

---

## 14. Buckets

A separação inicial deverá ocorrer por finalidade e sensibilidade.

Possível composição:

```text
routebook-private
routebook-public
routebook-temporary
```

O bucket público somente deverá existir quando houver conteúdo legitimamente público.

A simples necessidade de exibir uma imagem não torna o objeto público.

---

## 15. Object keys

A aplicação deverá gerar chaves não previsíveis.

Formato conceitual:

```text
<environment>/<purpose>/<partition>/<generated-id>/<version>
```

Exemplo:

```text
prod/account-export/8f/01J.../export-v1.zip
```

A chave não deverá conter:

* e-mail;
* nome;
* endereço;
* destino;
* título da Trip;
* localização;
* nome original completo;
* dados pessoais;
* segredo.

---

## 16. Nome original

O nome original poderá ser armazenado como metadado canônico quando necessário para a experiência.

Ele deverá:

* ser sanitizado;
* possuir limite;
* não determinar a object key;
* não ser utilizado como tipo confiável;
* não ser incluído automaticamente em logs;
* ser tratado como input externo.

---

## 17. Upload direto

O fluxo preferencial será:

```text
cliente
→ solicitar autorização de upload
→ autenticar
→ autorizar Account e finalidade
→ criar StoredObject pendente
→ gerar URL temporária
→ upload direto ao R2
→ confirmar upload
→ validar metadados
→ processar
→ disponibilizar
```

A aplicação não deverá atuar como proxy de arquivos grandes sem necessidade.

---

## 18. Presigned URLs

URLs pré-assinadas deverão:

* permitir somente a operação necessária;
* apontar para uma única object key;
* possuir expiração curta;
* limitar Content-Type quando tecnicamente apropriado;
* ser geradas no servidor;
* não ser registradas integralmente;
* ser tratadas como bearer tokens;
* não ser persistidas como referência permanente.

A expiração inicial deverá ser proporcional ao tamanho permitido do arquivo.

---

## 19. Confirmação de upload

A conclusão informada pelo cliente não será suficiente.

A aplicação deverá verificar no storage:

* existência;
* object key;
* tamanho;
* metadados esperados;
* checksum quando disponível;
* Content-Type;
* estado do registro.

Objetos inesperados deverão permanecer em quarentena ou ser removidos.

---

## 20. Validação de arquivos

A validação deverá considerar:

* tamanho;
* extensão;
* MIME type declarado;
* MIME type detectado;
* assinatura ou magic bytes;
* estrutura;
* conteúdo;
* finalidade;
* dimensões de imagem;
* quantidade de páginas quando aplicável;
* presença de conteúdo ativo;
* resultado de malware scanning quando exigido.

Extensão e header `Content-Type` não são provas suficientes.

---

## 21. Limites iniciais

Cada finalidade deverá definir:

* formatos aceitos;
* tamanho máximo;
* quantidade;
* frequência;
* retenção;
* processamento;
* nível de risco.

Não deverá existir um limite global aplicado indiscriminadamente.

Exemplos de classes:

* avatar;
* imagem de Trip;
* exportação;
* artefato de avaliação;
* anexo futuro.

---

## 22. Malware scanning

Uploads fornecidos por usuários deverão passar por scanning quando:

* puderem ser baixados por outras pessoas;
* incluírem documentos;
* possuírem formatos ativos;
* forem processados por bibliotecas sensíveis;
* integrarem exportações ou anexos.

Até a aprovação:

```text
uploaded
→ quarantined
→ scanned
→ available ou rejected
```

A seleção do mecanismo de scanning poderá ser registrada separadamente.

---

## 23. Processamento de imagens

Imagens próprias poderão ser processadas para:

* validação;
* remoção de metadados desnecessários;
* correção de orientação;
* redimensionamento;
* geração de variantes;
* otimização;
* thumbnail.

O original somente deverá ser mantido quando houver finalidade.

Metadados EXIF, especialmente localização, deverão ser removidos quando não forem necessários.

---

## 24. Conteúdo externo de Providers

Imagens fornecidas por Google Maps Platform ou outros Providers não deverão ser copiadas automaticamente para o R2.

Antes de qualquer cópia deverão ser avaliados:

* termos;
* licença;
* atribuição;
* validade;
* URL temporária;
* finalidade;
* retenção;
* possibilidade de redistribuição.

Uma referência externa não deverá ser tratada como arquivo próprio.

---

## 25. Downloads privados

O fluxo esperado será:

```text
cliente
→ solicitar acesso
→ autenticar
→ autorizar Account e recurso
→ verificar StoredObject
→ gerar URL temporária de leitura
→ retornar acesso
```

A autorização deverá ocorrer antes da geração da URL.

Uma URL válida continuará concedendo acesso até expirar, portanto deverá possuir duração curta.

---

## 26. Conteúdo público

Objetos somente poderão ser públicos quando:

* a finalidade exigir;
* a classificação permitir;
* não houver dado pessoal;
* a licença permitir;
* a publicação for explícita;
* o owner estiver definido;
* existir processo de remoção.

O RouteBook deverá preferir private-by-default.

---

## 27. CORS

Buckets que aceitarem upload pelo navegador deverão possuir CORS restrito.

A configuração deverá limitar:

* origens;
* métodos;
* headers;
* exposição de headers;
* tempo de cache.

Wildcards amplos não deverão ser utilizados em produção sem justificativa.

---

## 28. Credenciais

Credenciais deverão:

* permanecer no servidor;
* ser separadas por ambiente;
* possuir escopo por bucket ou finalidade;
* permitir somente operações necessárias;
* ser rotacionáveis;
* permanecer fora do repositório;
* ser mascaradas;
* não ser incluídas em builds client-side.

A aplicação web não receberá credenciais permanentes do R2.

---

## 29. Criptografia

O armazenamento deverá utilizar:

* criptografia em trânsito;
* criptografia em repouso oferecida pelo Provider;
* gestão segura das credenciais;
* separação de ambientes;
* minimização de metadados.

Criptografia adicional no nível da aplicação somente deverá ser introduzida mediante requisito específico, pois aumenta a complexidade de busca, processamento, rotação e recuperação.

---

## 30. Lifecycle e retenção

Cada finalidade deverá possuir política de lifecycle.

Exemplos conceituais:

| Finalidade                | Retenção                         |
| ------------------------- | -------------------------------- |
| Upload incompleto         | curta                            |
| Arquivo rejeitado         | curta                            |
| Artefato temporário       | limitada                         |
| Exportação do usuário     | limitada                         |
| Imagem ativa              | enquanto houver finalidade       |
| Evidência de teste        | conforme política de QA          |
| Dados de Account excluída | conforme processo de privacidade |

Lifecycle rules deverão complementar, e não substituir, a exclusão dirigida pela aplicação.

---

## 31. Exclusão

A exclusão deverá seguir processo controlado:

```text
solicitação
→ autorização
→ marcar deletion-pending
→ remover objeto
→ confirmar resultado
→ marcar deleted
→ registrar evidência
```

Falhas deverão permanecer recuperáveis e observáveis.

Não deverá ser removido primeiro o registro canônico sem preservar referência para concluir a exclusão.

---

## 32. Account e privacidade

Todo objeto privado deverá possuir Account ou owner explícito.

Operações deverão validar:

* Account;
* User;
* membership;
* recurso relacionado;
* finalidade;
* status;
* ação.

Testes cross-account serão obrigatórios.

A enumeração de object keys não deverá conceder acesso.

---

## 33. Exportações de dados

Exportações deverão:

* ser geradas assincronamente;
* possuir status;
* utilizar arquivo privado;
* possuir expiração;
* utilizar URL temporária;
* registrar solicitante;
* possuir checksum;
* ser removidas após a retenção definida;
* evitar dados além do escopo autorizado.

O Inngest poderá coordenar a geração e a expiração.

---

## 34. Artefatos de IA e QA

Artefatos de IA ou testes somente poderão ser armazenados quando houver finalidade documentada.

Eles deverão utilizar:

* dados sintéticos ou autorizados;
* classificação;
* versão;
* datasetId ou evaluationId;
* retenção;
* acesso restrito;
* redaction;
* lifecycle.

Prompts e respostas reais de usuários não deverão ser armazenados automaticamente como artefatos.

---

## 35. Observabilidade

Operações de storage deverão produzir sinais sanitizados.

Atributos possíveis:

```text
storage.provider
storage.operation
storage.purpose
storage.status
storage.content_type_class
storage.size_class
storage.result
```

Não deverão ser registrados:

* URL pré-assinada;
* credencial;
* object key completa quando sensível;
* nome original;
* conteúdo;
* endereço;
* localização;
* dados pessoais.

Métricas iniciais:

* uploads iniciados;
* uploads concluídos;
* uploads rejeitados;
* bytes armazenados;
* bytes transferidos;
* objetos por finalidade;
* falhas de download;
* exclusões pendentes;
* objetos expirados;
* custo;
* latência.

---

## 36. Testes

### Testes unitários

Deverão cobrir:

* geração de object keys;
* validação de finalidade;
* seleção de bucket;
* lifecycle;
* transições de estado;
* sanitização;
* autorização;
* mapeamento de erros.

### Testes de integração

Deverão validar com storage compatível:

* upload;
* HEAD;
* download;
* exclusão;
* URL temporária;
* expiração;
* Content-Type;
* CORS;
* metadados;
* falha de credencial.

### Testes de segurança

Deverão cobrir:

* acesso cross-account;
* URL expirada;
* chave manipulada;
* arquivo excessivo;
* MIME inconsistente;
* extensão dupla;
* conteúdo malicioso de teste;
* upload sem autorização;
* download de objeto em quarentena;
* path traversal no nome original;
* secrets em logs.

---

## 37. Desenvolvimento local

O desenvolvimento local deverá utilizar um adapter compatível com S3, como:

* storage local controlado;
* MinIO;
* LocalStack;
* bucket de desenvolvimento do R2.

Testes unitários poderão utilizar fake em memória.

Testes de integração deverão validar pelo menos uma implementação real da interface S3 utilizada em produção.

---

## 38. Custos

Os custos deverão ser observados por:

* armazenamento;
* operações de escrita;
* operações de leitura;
* quantidade de objetos;
* processamento;
* ambientes;
* lifecycle;
* arquivos órfãos.

Mesmo sem cobrança de transferência de saída no modelo atual do R2, a aplicação deverá monitorar:

* operações;
* armazenamento acumulado;
* processamento;
* recursos adicionais;
* mudanças futuras de preço.

---

## 39. Portabilidade

A abstração deverá permitir migração para:

* Amazon S3;
* outro storage compatível com S3;
* Vercel Blob por adapter específico;
* storage local em desenvolvimento.

O RouteBook deverá preservar:

* StoredObjectId;
* metadados;
* ownership;
* checksums;
* estado;
* finalidade;
* object key lógica ou mapping;
* políticas de retenção.

Funcionalidades específicas do R2 não deverão entrar no domínio.

---

## 40. Riscos e mitigações

### Lock-in do Provider

Mitigações:

* API compatível com S3;
* adapter;
* StoredObjectId interno;
* ausência de tipos do Provider no domínio.

### Upload malicioso

Mitigações:

* quarentena;
* magic bytes;
* scanning;
* allowlist;
* limites;
* processamento isolado.

### Vazamento por URL temporária

Mitigações:

* duração curta;
* operação específica;
* autorização prévia;
* ausência de logs;
* HTTPS.

### Arquivos órfãos

Mitigações:

* estados;
* jobs de reconciliação;
* lifecycle;
* métricas;
* limpeza.

### Exclusão incompleta

Mitigações:

* deletion-pending;
* retries;
* workflow durável;
* evidência;
* alertas.

### Conteúdo externo armazenado indevidamente

Mitigações:

* classificação da origem;
* avaliação de termos;
* Provider Reference;
* proibição por padrão.

### Crescimento de custo

Mitigações:

* lifecycle;
* limites;
* quotas;
* alertas;
* relatórios por finalidade.

---

## 41. Estratégia de implementação

### Etapa 1 — Fundação

* criar buckets por ambiente;
* manter acesso privado;
* criar credenciais restritas;
* configurar CORS;
* configurar lifecycle inicial;
* configurar budgets e métricas.

### Etapa 2 — Contratos

* criar `ObjectStorage`;
* criar `StoredObject`;
* criar estados;
* criar `StoredObjectPurpose`;
* criar key builder;
* criar schemas Zod.

### Etapa 3 — Upload

* criar autorização de upload;
* gerar URL temporária;
* criar confirmação;
* validar metadados;
* implementar quarentena.

### Etapa 4 — Download

* validar autorização;
* gerar URL temporária;
* impedir objetos indisponíveis;
* registrar acesso operacional sanitizado.

### Etapa 5 — Processamento

* integrar Inngest;
* validar imagens;
* remover metadados;
* adicionar scanning quando necessário;
* gerar variantes.

### Etapa 6 — Lifecycle e privacidade

* implementar expiração;
* implementar exclusão;
* implementar reconciliação;
* testar encerramento de Account;
* testar exportações.

---

## 42. Critérios de implementação concluída

A decisão estará implementada quando:

* buckets estiverem criados;
* buckets privados forem o padrão;
* credenciais estiverem restritas;
* lifecycle inicial estiver configurado;
* adapter estiver implementado;
* StoredObject estiver persistido;
* object keys forem geradas internamente;
* upload temporário funcionar;
* confirmação de upload funcionar;
* objeto permanecer em quarentena até validação;
* download privado exigir autorização;
* exclusão for recuperável;
* testes cross-account passarem;
* observabilidade estiver ativa;
* secrets e URLs temporárias não aparecerem nos logs.

---

## 43. Gatilhos de revisão

Esta decisão deverá ser revisada quando:

* o R2 não atender requisito funcional;
* a compatibilidade S3 for insuficiente;
* requisitos de retenção imutável surgirem;
* processamento exigir integração nativa de outro Provider;
* residência de dados exigir nova configuração;
* custos se tornarem desproporcionais;
* o volume de vídeo ou arquivos grandes crescer materialmente;
* uma CDN específica se tornar necessária;
* requisitos regulatórios exigirem outro mecanismo;
* migração para infraestrutura integralmente AWS oferecer benefício comprovado;
* a plataforma de deployment justificar outro storage.

---

## 44. Estratégia de saída

A migração deverá:

1. interromper novos uploads no Provider antigo;
2. manter leitura temporária;
3. copiar objetos;
4. validar tamanho e checksum;
5. atualizar mappings;
6. testar downloads;
7. manter rollback;
8. remover objetos antigos após validação e retenção.

O banco canônico deverá permitir que `StoredObjectId` permaneça estável durante a migração.

---

## 45. Próxima decisão

O `RB-ADR-017` deverá definir a estratégia inicial de deployment e infraestrutura da aplicação.

A decisão deverá avaliar:

* Vercel;
* Cloudflare;
* AWS;
* container hosting;
* Next.js App Router;
* Node.js runtime;
* ambientes de preview;
* PostgreSQL;
* Redis;
* Inngest;
* Cloudflare R2;
* networking;
* regiões;
* secrets;
* CI/CD;
* custos;
* observabilidade;
* portabilidade.

A decisão deverá distinguir:

* build;
* deployment;
* runtime;
* hosting;
* edge;
* infraestrutura de dados;
* ambientes;
* infraestrutura como código.

---

## 46. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-016
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar o contexto histórico.

---

## 47. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* alternativas foram avaliadas;
* R2 está justificado;
* S3 foi avaliado;
* Vercel Blob foi avaliado;
* PostgreSQL foi corretamente posicionado;
* buckets privados são o padrão;
* StoredObject está definido;
* estados estão definidos;
* chaves estão governadas;
* uploads temporários estão definidos;
* confirmação está definida;
* validação está definida;
* quarentena está definida;
* scanning está contemplado;
* imagens externas estão governadas;
* downloads privados estão definidos;
* CORS está governado;
* credenciais estão protegidas;
* criptografia está contemplada;
* lifecycle está definido;
* exclusão está definida;
* Account está contemplada;
* privacidade está contemplada;
* exportações estão contempladas;
* IA e QA estão contempladas;
* observabilidade está definida;
* testes estão definidos;
* custos estão contemplados;
* portabilidade está definida;
* estratégia de saída está definida;
* não existem contradições com RB-ARC-003;
* não existem contradições com RB-ARC-004;
* não existem contradições com RB-SEC-001;
* não existem contradições com RB-PRIV-001;
* não existem contradições com RB-ADR-005;
* não existem contradições com RB-ADR-008;
* não existem contradições com RB-ADR-009;
* não existem contradições com RB-ADR-013;
* não existem contradições com RB-ADR-015.

---

## 48. Declaração final

O RouteBook adotará Cloudflare R2 como Provider inicial de armazenamento de objetos.

A integração utilizará uma interface compatível com S3 e permanecerá isolada por um adapter de infraestrutura.

O R2 será utilizado para:

* arquivos privados;
* imagens próprias;
* exportações;
* artefatos temporários;
* arquivos gerados por jobs;
* conteúdo binário autorizado.

PostgreSQL continuará sendo a fonte canônica de:

* StoredObjectId;
* ownership;
* Account;
* classificação;
* finalidade;
* autorização;
* estado;
* retenção;
* auditoria.

Buckets serão privados por padrão.

Uploads e downloads privados utilizarão URLs temporárias.

Todo upload deverá ser tratado como conteúdo não confiável até que:

* sua existência seja confirmada;
* seu tamanho seja validado;
* seu tipo seja detectado;
* suas restrições sejam verificadas;
* o processamento de segurança exigido seja concluído.

Object keys serão geradas pela aplicação e não conterão dados pessoais.

Lifecycle rules serão utilizadas para reduzir objetos temporários e incompletos, mas não substituirão os processos explícitos de exclusão e privacidade.

O RouteBook não copiará automaticamente imagens e arquivos de Providers externos sem avaliar termos, licença, atribuição e retenção.

A compatibilidade com S3, o StoredObjectId interno e a separação entre conteúdo e metadados deverão permitir que o Provider seja substituído futuramente sem redefinir o domínio.
