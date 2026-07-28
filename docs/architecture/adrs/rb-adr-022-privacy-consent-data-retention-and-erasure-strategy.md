---

id: RB-ADR-022

title: Estratégia de Privacidade, Consentimento, Retenção e Exclusão de Dados
description: Define a estratégia oficial do RouteBook para privacidade por desenho, governança de tratamentos, bases legais, consentimentos, direitos dos titulares, retenção, anonimização, exclusão, localização, dados de crianças e adolescentes, fornecedores e transferências internacionais.

document_type: architecture-decision-record
owner: Architecture

status: Published
version: "0.1.0"

created: "2026-07-27"
last_updated: null

authors:

- RouteBook Team

tags:

- architecture
- adr
- privacy
- lgpd
- consent
- data-retention
- data-erasure
- data-subject-rights
- location
- children
- international-transfer
- ai-first

related_documents:

- RB-CORE-0004
- RB-DOM-001
- RB-DOM-004
- RB-ADR-008
- RB-ADR-009
- RB-ADR-013
- RB-ADR-014
- RB-ADR-015
- RB-ADR-017
- RB-ADR-018
- RB-ADR-019
- RB-ADR-020
- RB-ADR-021

prerequisites:

- RB-CORE-0004
- RB-DOM-001
- RB-ADR-008
- RB-ADR-009
- RB-ADR-013
- RB-ADR-014
- RB-ADR-021

next_documents:

- RB-ADR-023

ai_context:
  priority: high
  index: true

---

# RB-ADR-022 — Estratégia de Privacidade, Consentimento, Retenção e Exclusão de Dados

## 1. Status

**Draft**

---

## 2. Contexto

O RouteBook utiliza dados para ajudar viajantes a tomar decisões durante o planejamento e a execução de uma Viagem.

Esse contexto poderá incluir:

- identidade e Account;
- destino e período;
- Hospedagem;
- composição do grupo;
- Preferências e Restrições;
- orçamento;
- localização aproximada ou atual;
- Lugares, Atividades e Rotas;
- Recomendações, Justificativas e Decisões;
- interações com capacidades de IA;
- eventos comportamentais;
- dados operacionais e de auditoria.

Mesmo quando um atributo isolado parece comum, sua combinação poderá revelar rotina, deslocamento, capacidade econômica, relações pessoais, interesses ou presença em determinado local.

Privacidade não poderá ser tratada apenas como texto jurídico, banner de cookies ou tarefa posterior ao desenvolvimento.

Esta decisão define a arquitetura de governança necessária para que o RouteBook trate somente os dados necessários, para finalidades explícitas, pelo tempo adequado e com mecanismos verificáveis de transparência, controle e exclusão.

---

## 3. Problema

O RouteBook precisa de uma estratégia que:

1. aplique privacidade por desenho e por padrão;
2. registre finalidades, categorias de dados, bases legais e destinatários;
3. diferencie consentimento de outras hipóteses legais;
4. não condicione funcionalidades essenciais a consentimentos desnecessários;
5. permita revogação tão simples quanto a concessão;
6. atenda direitos dos titulares de forma autenticada e auditável;
7. defina retenção por categoria e finalidade;
8. propague exclusão para bancos, caches, objetos, índices e Providers;
9. trate corretamente backups e registros sujeitos a conservação;
10. proteja localização e contexto de viagem;
11. estabeleça limites para analytics e IA;
12. trate dados de crianças e adolescentes com salvaguardas superiores;
13. governe operadores e transferências internacionais;
14. permaneça implementável por um produto em estágio inicial.

---

## 4. Forças de decisão

São forças relevantes:

- LGPD e regulamentações vigentes da ANPD;
- ECA Digital quando o serviço for direcionado ou de acesso provável por crianças e adolescentes;
- natureza contextual e potencialmente sensível de uma Viagem;
- arquitetura web AI-First;
- existência de Account, User, Trip, Recommendation e Decision;
- Providers externos de mapas, IA, autenticação, analytics e infraestrutura;
- necessidade de aprender com o produto sem vigilância;
- baixo custo operacional inicial;
- necessidade de rastreabilidade;
- direito de mudança futura de fornecedores;
- impossibilidade de garantir exclusão física instantânea de todos os backups;
- necessidade de distinguir obrigação jurídica de preferência do produto.

---

## 5. Objetivos

Esta decisão objetiva:

- estabelecer princípios arquiteturais de privacidade;
- criar um registro canônico de tratamentos;
- governar consentimentos e preferências;
- classificar dados;
- definir minimização e limitação de finalidade;
- definir direitos dos titulares;
- definir retenção, anonimização e exclusão;
- proteger localização, menores, analytics e IA;
- governar terceiros e transferências internacionais;
- criar controles, testes, métricas e evidências.

---

## 6. Não objetivos

Esta decisão não:

- substitui aconselhamento jurídico;
- escolhe definitivamente a base legal de cada tratamento;
- publica o Aviso de Privacidade final;
- define contratos comerciais finais;
- define tributação ou retenção fiscal completa;
- define a política corporativa de segurança inteira;
- define integralmente backup e disaster recovery;
- cria uma plataforma de consent management de marketing;
- autoriza publicidade comportamental;
- autoriza venda de dados;
- autoriza treinamento de modelos com dados do usuário;
- determina que todo tratamento dependa de consentimento.

As bases legais, prazos jurídicos e textos destinados ao público deverão ser validados por responsável jurídico ou de privacidade antes da operação real.

---

## 7. Decisão

O RouteBook adotará:

1. privacidade por desenho e por padrão;
2. inventário e registro canônico de tratamentos;
3. classificação de dados e finalidade obrigatória;
4. consentimento granular somente quando essa for a hipótese adequada;
5. ledger imutável de evidências de consentimento;
6. preferências atuais separadas do histórico;
7. políticas de retenção versionadas e executáveis;
8. workflows auditáveis para direitos dos titulares;
9. exclusão lógica imediata seguida de purga física coordenada;
10. adaptadores de privacidade para Providers;
11. PostgreSQL como fonte canônica dos registros de governança;
12. processamento assíncrono idempotente para exportação, retenção e exclusão;
13. bloqueio de novos tratamentos sem registro, owner e revisão;
14. proteção superior para localização, conteúdo livre, IA e menores.

---

## 8. Princípios obrigatórios

Toda decisão deverá observar:

- finalidade;
- adequação;
- necessidade;
- livre acesso;
- qualidade dos dados;
- transparência;
- segurança;
- prevenção;
- não discriminação;
- responsabilização e prestação de contas.

No RouteBook, esses princípios deverão existir como requisitos verificáveis, não apenas declarações.

---

## 9. Privacidade por padrão

O comportamento padrão deverá:

- coletar o mínimo;
- desabilitar analytics não essencial sem decisão aplicável;
- desabilitar localização precisa até ação explícita;
- não utilizar session replay;
- não utilizar autocapture indiscriminado;
- não tornar Trips públicas;
- não expor dados entre Accounts;
- não reutilizar dados para treinamento;
- não preservar conteúdo livre indefinidamente;
- não enviar contexto completo a Providers.

---

## 10. Privacy Gate

Toda nova capability que trate dados pessoais deverá passar por um Privacy Gate antes da implementação.

O gate deverá responder:

- qual problema exige o dado;
- qual finalidade;
- qual categoria;
- qual titular;
- qual fonte;
- qual hipótese legal proposta;
- quais destinatários;
- em quais regiões;
- por quanto tempo;
- como exercer direitos;
- como excluir;
- quais riscos;
- quais alternativas menos invasivas;
- se RIPD é necessário;
- quem é o owner.

---

## 11. Registro de Atividades de Tratamento

O RouteBook manterá um registro versionado de tratamentos.

```typescript
interface ProcessingActivity {
  processingActivityId: ProcessingActivityId;
  key: string;
  name: string;
  purpose: string;
  dataSubjectCategories: DataSubjectCategory[];
  dataCategories: DataCategory[];
  proposedLegalBasis: LegalBasis;
  systems: SystemReference[];
  recipients: RecipientReference[];
  internationalTransfers: TransferReference[];
  retentionPolicyKey: string;
  owner: string;
  riskLevel: PrivacyRiskLevel;
  status: "draft" | "approved" | "paused" | "retired";
  version: number;
  reviewedAt?: Date;
  reviewAt: Date;
}
```

Um tratamento `draft` não deverá ser ativado em produção.

---

## 12. Autoridade do registro

O registro de tratamentos será a autoridade sobre:

- finalidade declarada;
- categorias de dados;
- sistemas envolvidos;
- Providers destinatários;
- política de retenção;
- owner;
- revisão;
- classificação de risco.

Ele não substituirá:

- o domínio;
- a autorização;
- o audit trail;
- o Aviso de Privacidade;
- o contrato com operador;
- o RIPD.

---

## 13. Hipóteses legais

Cada tratamento deverá registrar a hipótese legal proposta e sua aprovação.

O sistema deverá reconhecer, sem presumir equivalência:

- consentimento;
- execução de contrato ou procedimentos preliminares;
- cumprimento de obrigação legal ou regulatória;
- exercício regular de direitos;
- legítimo interesse, quando aplicável;
- proteção da vida ou incolumidade;
- demais hipóteses legalmente aplicáveis.

Consentimento não será utilizado como resposta automática para todo tratamento.

---

## 14. Legítimo interesse

Tratamentos baseados em legítimo interesse deverão possuir:

- finalidade concreta;
- análise de necessidade;
- avaliação de expectativas legítimas;
- balanceamento entre benefício e impacto;
- salvaguardas;
- mecanismo de oposição quando aplicável;
- revisão;
- evidência documental.

Dados pessoais sensíveis não deverão ser tratados com fundamento em legítimo interesse.

---

## 15. Consentimento

Consentimento deverá ser:

- livre;
- informado;
- inequívoco;
- específico;
- granular;
- demonstrável;
- revogável.

Consentimentos agrupados para finalidades materialmente distintas serão proibidos.

---

## 16. Consentimento não necessário

O RouteBook não deverá solicitar consentimento quando:

- outra hipótese legal apropriada e documentada sustentar o tratamento;
- a solicitação induzir falsa escolha;
- a recusa tornar impossível um tratamento estritamente necessário à funcionalidade contratada;
- o usuário não puder realmente recusar sem prejuízo indevido.

Preferência de interface não deverá ser apresentada como consentimento jurídico.

---

## 17. Propósitos de consentimento

Cada propósito deverá possuir chave estável.

```text
analytics.product.non-essential
location.current.precise
marketing.email
personalization.behavioral.future
ai.training.future
```

As chaves:

- não conterão e-mail ou ID do usuário;
- não serão reutilizadas;
- não incorporarão versão no significado;
- serão associadas a um texto versionado.

---

## 18. Catálogo de propósitos

```typescript
interface ConsentPurpose {
  key: string;
  title: string;
  description: string;
  required: boolean;
  processingActivityKeys: string[];
  currentNoticeVersion: string;
  withdrawalEffect: WithdrawalEffect;
  status: "draft" | "active" | "retired";
}
```

Um propósito `required: true` não deverá ser apresentado como opcional.

---

## 19. Estado atual e evidência histórica

O RouteBook separará:

- estado atual da escolha;
- evidência histórica de concessão, recusa ou revogação.

```typescript
interface ConsentPreference {
  subjectKey: string;
  purposeKey: string;
  state: "granted" | "denied" | "withdrawn" | "not-requested";
  effectiveAt: Date;
  noticeVersion: string;
}

interface ConsentEvidence {
  consentEvidenceId: ConsentEvidenceId;
  subjectKey: string;
  purposeKey: string;
  action: "granted" | "denied" | "withdrawn";
  noticeVersion: string;
  occurredAt: Date;
  source: string;
  actorType: "subject" | "guardian" | "authorized-agent" | "system";
  correlationId: string;
}
```

---

## 20. Ledger de consentimento

Evidências não deverão ser atualizadas destrutivamente.

Correções deverão produzir novo evento relacionado ao anterior.

O ledger deverá evitar:

- IP completo salvo sem necessidade;
- user agent completo;
- fingerprint;
- conteúdo de tela;
- localização;
- dados adicionais não necessários à prova.

---

## 21. Revogação

A revogação deverá:

1. ser acessível;
2. produzir efeito para novos tratamentos;
3. atualizar a preferência canônica;
4. registrar evidência;
5. interromper pipelines aplicáveis;
6. invalidar caches;
7. sinalizar Providers;
8. iniciar exclusão quando exigida;
9. preservar somente evidência legalmente necessária.

A revogação não tornará ilícito o tratamento realizado anteriormente sob consentimento válido.

---

## 22. Consentimento no cliente

O navegador poderá exibir e coletar a escolha.

O servidor será responsável por:

- validar o propósito;
- resolver a versão do aviso;
- registrar a evidência;
- aplicar a preferência;
- impedir tratamento incompatível.

Um valor apenas em cookie ou `localStorage` não será evidência canônica para usuários autenticados.

---

## 23. Usuário anônimo

Antes da autenticação, preferências estritamente necessárias poderão ser armazenadas localmente.

Consentimentos anônimos deverão utilizar identificador opaco e de curta finalidade.

Após autenticação:

- a associação não será automática quando gerar ampliação indevida do histórico;
- preferências poderão ser reconciliadas;
- eventos anteriores não deverão ser retroativamente identificados sem fundamento e transparência.

---

## 24. Classificação de dados

Categorias iniciais:

| Classe | Exemplos | Postura |
| --- | --- | --- |
| Pública | conteúdo editorial destinado à publicação | integridade e origem |
| Interna | configuração não sensível, IDs técnicos | acesso por necessidade |
| Confidencial | identidade, Trips, Preferências | criptografia e acesso restrito |
| Altamente restrita | localização precisa, tokens, conteúdo sensível | minimização e controles reforçados |
| Secret | credenciais, chaves, signing secrets | mecanismo de secrets; nunca domínio ou analytics |

Classificação deverá acompanhar o dado em contratos, logs e pipelines.

---

## 25. Dados pessoais sensíveis

O RouteBook não buscará coletar dados pessoais sensíveis no MVP.

Texto livre poderá conter espontaneamente:

- saúde;
- religião;
- origem racial ou étnica;
- opinião política;
- vida sexual;
- dado biométrico;
- outras informações protegidas.

Campos livres deverão:

- ser evitados quando um campo estruturado resolver;
- informar o usuário sobre o que não inserir;
- não ser enviados a analytics;
- possuir retenção definida;
- ser protegidos como altamente restritos quando o conteúdo não puder ser classificado com segurança.

---

## 26. Minimização

Cada campo deverá possuir:

- finalidade;
- necessidade;
- owner;
- origem;
- consumidores;
- retenção;
- classificação.

Campos sem finalidade atual comprovável deverão ser removidos ou não coletados.

“Poderá ser útil futuramente” não é justificativa suficiente.

---

## 27. Limitação de finalidade

Dados de uma Trip não poderão ser reutilizados automaticamente para:

- marketing;
- publicidade;
- perfilamento comercial;
- treinamento de modelos;
- enriquecimento de terceiros;
- venda;
- comparação entre usuários;
- avaliação de capacidade econômica.

Uma finalidade nova exigirá novo registro, análise e comunicação adequada.

---

## 28. Qualidade e correção

O titular deverá poder corrigir dados inexatos quando aplicável.

Correções deverão:

- atualizar a fonte canônica;
- propagar para projeções;
- preservar auditoria mínima quando necessária;
- não reescrever Eventos de Domínio históricos;
- distinguir correção de fato atual e retificação histórica.

---

## 29. Identificadores

Providers externos receberão identificadores opacos e específicos por finalidade quando viável.

O RouteBook evitará enviar:

- e-mail;
- nome;
- telefone;
- ID sequencial;
- AccountId canônico;
- TripId canônico.

Correlação entre Providers deverá ser evitada.

---

## 30. Localização

Localização precisa será tratada como altamente restrita, ainda que sua classificação jurídica dependa do contexto.

O padrão será:

- sem coleta contínua;
- sem histórico de percurso;
- sem background tracking;
- sem analytics de coordenadas;
- sem persistência quando cálculo efêmero for suficiente;
- sem inclusão automática em prompts.

---

## 31. Granularidade de localização

O RouteBook deverá preferir, nesta ordem:

1. Place escolhido pelo usuário;
2. região ou cidade;
3. coordenada aproximada;
4. coordenada precisa somente quando necessária.

Distância e rota não justificam, por si, armazenamento permanente da posição atual.

---

## 32. Permissão do dispositivo

Permissão do navegador ou sistema operacional não será considerada, isoladamente, consentimento para qualquer finalidade posterior.

O RouteBook deverá explicar:

- por que a localização é necessária;
- se será persistida;
- por quanto tempo;
- com quais Providers será compartilhada;
- qual fallback existe.

Negar localização não deverá impedir planejamento manual.

---

## 33. Hospedagem

Hospedagem poderá revelar presença futura ou atual.

O sistema deverá:

- restringir acesso à Account e aos membros autorizados;
- preferir PlaceId e dados necessários à rota;
- não exibir endereço em logs;
- não enviar hospedagem a analytics;
- não indexar publicamente;
- remover coordenadas de exports destinados a suporte quando não necessárias.

---

## 34. Crianças e adolescentes

O MVP não oferecerá Accounts independentes para crianças.

Quando uma Viagem incluir menores:

- o adulto registrará apenas atributos necessários ao planejamento;
- nomes completos, documentos e contatos não serão solicitados;
- não haverá perfilamento comportamental do menor;
- não haverá publicidade direcionada;
- não haverá analytics individual do menor;
- o melhor interesse prevalecerá;
- dados de idade serão representados pela menor granularidade útil.

---

## 35. Faixa etária

Quando necessária para Recomendações, deverá ser preferida uma faixa:

```text
infant
child
teen
adult
older-adult
```

Data de nascimento não deverá ser coletada apenas para determinar adequação geral de uma Atividade.

O catálogo deverá evitar inferir vulnerabilidades ou capacidades individuais.

---

## 36. Acesso provável por menores

Antes de disponibilizar acesso direto a menores, o RouteBook deverá realizar revisão específica considerando:

- ECA Digital;
- aferição de idade proporcional ao risco;
- supervisão parental;
- design apropriado à idade;
- transparência compreensível;
- publicidade;
- recommender systems;
- proteção por padrão;
- resposta a denúncias;
- direitos do menor e do responsável.

Esta decisão não autoriza o lançamento direto para esse público.

---

## 37. IA

Capacidades de IA deverão receber o menor contexto suficiente.

É proibido enviar por padrão:

- Account completa;
- User completo;
- e-mail;
- telefone;
- documento;
- coordenada precisa;
- histórico integral;
- consentimentos;
- audit trail;
- secrets;
- dados de outros membros não necessários;
- conteúdo identificado de menores.

---

## 38. Prompts e respostas

Prompts e respostas completas:

- não serão enviados a product analytics;
- não serão registrados em logs comuns;
- possuirão retenção específica quando persistidos como conteúdo do produto;
- serão redigidos ou omitidos em observabilidade;
- não serão usados para treinamento sem decisão futura independente;
- serão incluídos em exportação ou exclusão conforme sua natureza e vínculo.

---

## 39. Treinamento e melhoria de modelos

Dados do usuário não serão utilizados para treinamento, fine-tuning, avaliação humana externa ou construção de dataset sem:

- ADR específico;
- finalidade;
- hipótese legal;
- Privacy Gate;
- RIPD quando aplicável;
- contrato e garantias do Provider;
- mecanismo de oposição ou consentimento quando exigido;
- anonimização ou minimização;
- retenção e exclusão;
- aprovação humana responsável.

---

## 40. Analytics

O `RB-ADR-021` permanece autoridade sobre product analytics.

Antes de qualquer emissão, o pipeline deverá verificar:

- propósito;
- preferência aplicável;
- schema aprovado;
- propriedades permitidas;
- classificação;
- retenção do Provider.

Revogação deverá interromper novos eventos não essenciais.

---

## 41. Observabilidade

Logs, métricas, traces e Sentry não serão exceção à privacidade.

Observabilidade deverá excluir:

- PII;
- conteúdo livre;
- coordenadas;
- prompts;
- respostas completas;
- tokens;
- URLs assinadas;
- payloads integrais;
- headers de autenticação.

Erros deverão usar IDs opacos, códigos e correlationId.

---

## 42. Auditoria

Auditoria poderá exigir retenção diferente do dado operacional.

O audit trail deverá registrar:

- ação;
- tipo de recurso;
- identificador opaco;
- actor;
- instante;
- motivo;
- correlationId;
- resultado.

Não deverá copiar o conteúdo completo alterado quando um diff mínimo ou referência for suficiente.

---

## 43. Cache, busca e projeções

Dados pessoais poderão existir em:

- Redis;
- índices de busca;
- materialized views;
- caches locais;
- CDN;
- filas;
- snapshots.

Todo sistema derivado deverá declarar:

- fonte;
- TTL;
- estratégia de invalidação;
- participação em exportação;
- participação em exclusão;
- comportamento em falha.

---

## 44. Dados canônicos e derivados

A exclusão deverá distinguir:

- dado canônico;
- dado derivado reversível;
- dado agregado;
- dado anonimizado;
- evidência de auditoria;
- registro sujeito a retenção.

Apagar apenas a linha principal sem tratar derivados não concluirá a solicitação.

---

## 45. Anonimização

Um dado somente será considerado anonimizado quando a reversão ou associação não for razoavelmente possível considerando meios próprios ou disponíveis.

Hash simples de e-mail, UserId ou AccountId não será considerado anonimização.

Pseudonimização será tratada como medida de segurança, não como saída automática do escopo de proteção.

---

## 46. Agregação

Métricas agregadas poderão permanecer após exclusão quando:

- não permitirem reidentificação;
- não mantiverem chave individual;
- não preservarem segmento excessivamente pequeno;
- não puderem ser decompostas até o titular;
- a finalidade e o prazo estiverem registrados.

---

## 47. Política de retenção

Cada categoria persistida deverá apontar para uma política versionada.

```typescript
interface RetentionPolicy {
  key: string;
  version: number;
  scope: DataScope;
  trigger: RetentionTrigger;
  activePeriod: Duration;
  gracePeriod?: Duration;
  terminalAction: "delete" | "anonymize" | "archive-restricted";
  legalHoldBehavior: "pause" | "exclude";
  owner: string;
  justification: string;
  reviewAt: Date;
}
```

---

## 48. Gatilhos de retenção

Gatilhos possíveis:

- criação;
- última atualização;
- encerramento da Trip;
- encerramento da Account;
- revogação;
- expiração;
- término contratual;
- conclusão de suporte;
- obrigação legal;
- resolução de incidente.

“Indefinido” será proibido sem obrigação e aprovação explícitas.

---

## 49. Matriz inicial de retenção

A implementação deverá definir valores exatos após validação jurídica e operacional.

| Categoria | Gatilho | Postura inicial |
| --- | --- | --- |
| Sessões e tokens | expiração ou revogação | menor prazo técnico possível |
| Localização atual efêmera | conclusão do cálculo | não persistir |
| Trip ativa | estado da Account e escolha do usuário | enquanto necessária ao serviço |
| Trip excluída | confirmação e grace period | purga coordenada |
| Analytics não essencial | consentimento e política do Provider | prazo curto e revisável |
| Logs de aplicação | criação | retenção operacional curta |
| Auditoria de segurança | criação | prazo proporcional ao risco |
| Consent evidence | evento | prazo necessário à demonstração |
| Export temporário | geração ou download | expiração automática curta |
| Backup | criação | rotação definida no ADR de continuidade |

Nenhum número desta tabela deverá ser inferido como requisito legal universal.

---

## 50. Retenção no código

Prazos não deverão ficar dispersos como números mágicos.

```typescript
const retentionPolicies = {
  ephemeralCurrentLocation: {
    key: "location.current.ephemeral",
    terminalAction: "delete",
  },
  temporaryDataExport: {
    key: "privacy.data-export.temporary",
    terminalAction: "delete",
  },
} as const;
```

O valor efetivo deverá vir de configuração versionada e validada.

---

## 51. Legal hold

Legal hold poderá suspender exclusão apenas quando houver fundamento documentado.

Deverá registrar:

- escopo;
- autoridade;
- motivo;
- início;
- revisão;
- owner;
- término;
- acessos.

Legal hold não poderá ser aplicado genericamente a toda a Account por conveniência.

---

## 52. Direitos dos titulares

O RouteBook deverá suportar, conforme aplicabilidade:

- confirmação de tratamento;
- acesso;
- correção;
- anonimização, bloqueio ou eliminação;
- portabilidade;
- informação sobre compartilhamento;
- informação sobre consentimento;
- revogação;
- oposição;
- revisão de decisões automatizadas nos termos aplicáveis;
- peticionamento e comunicação.

O produto não deverá prometer automaticamente resultado que dependa de análise jurídica.

---

## 53. Portal de privacidade

A evolução preferencial será um portal autenticado para:

- visualizar escolhas;
- revogar consentimentos;
- solicitar acesso;
- solicitar exportação;
- corrigir dados;
- solicitar exclusão;
- acompanhar status;
- obter informações de contato.

Na primeira versão, um fluxo interno protegido poderá atender solicitações.

---

## 54. Verificação de identidade

Antes de entregar ou excluir dados, o RouteBook deverá verificar a identidade de forma proporcional ao risco.

É proibido:

- pedir cópia de documento por padrão;
- coletar mais dados que os já necessários;
- responder com dados para e-mail não verificado;
- revelar existência de Account a terceiro;
- utilizar perguntas inseguras baseadas em dados públicos.

---

## 55. Representantes

Solicitações de responsável legal ou representante deverão:

- registrar a alegação de representação;
- verificar autoridade de forma proporcional;
- limitar o acesso ao escopo;
- proteger dados de outros membros;
- receber revisão humana quando houver dúvida.

---

## 56. Exportação

Exports deverão:

- ser gerados server-side;
- utilizar snapshot consistente;
- excluir secrets e dados de terceiros;
- separar dados fornecidos, observados e inferidos quando útil;
- possuir manifesto;
- utilizar formato legível e estruturado;
- ser criptografados em repouso;
- utilizar URL temporária;
- expirar automaticamente;
- registrar acesso;
- ser excluídos após o prazo.

---

## 57. Exportação de Account compartilhada

Um membro não deverá exportar automaticamente dados privados de outros membros.

O export deverá respeitar:

- ownership;
- papel;
- escopo da Account;
- autoria;
- conteúdo compartilhado;
- dados individuais;
- autorização definida no `RB-ADR-008`.

---

## 58. Solicitação de exclusão

Fluxo conceitual:

```text
solicitação
→ autenticação e confirmação
→ análise de escopo e impedimentos
→ bloqueio de novos tratamentos
→ tombstone
→ revogação de sessões e acessos
→ purga canônica
→ purga de derivados
→ solicitação aos Providers
→ verificação
→ conclusão auditada
```

---

## 59. Grace period

Uma exclusão iniciada pelo próprio usuário poderá possuir período curto de recuperação quando:

- isso for informado;
- o dado ficar bloqueado para uso normal;
- nenhuma nova finalidade for executada;
- o usuário puder exigir conclusão imediata quando aplicável;
- o prazo estiver definido.

O grace period não será utilizado para prolongar retenção silenciosamente.

---

## 60. Tombstones

Tombstones mínimos poderão impedir ressurreição por eventos atrasados ou restauração.

Eles deverão conter apenas:

- chave opaca;
- tipo de escopo;
- instante;
- versão do workflow;
- estado da purga;
- razão técnica mínima.

Não deverão preservar conteúdo excluído.

---

## 61. Orquestração da exclusão

O workflow deverá ser:

- idempotente;
- retomável;
- observável;
- versionado;
- seguro contra concorrência;
- capaz de registrar progresso por sistema;
- capaz de distinguir falha temporária de impedimento jurídico.

```typescript
interface ErasureStepResult {
  systemKey: string;
  status: "pending" | "completed" | "not-applicable" | "blocked" | "failed";
  completedAt?: Date;
  retryAt?: Date;
  evidenceReference?: string;
}
```

---

## 62. Outbox e eventos

Eventos de exclusão deverão utilizar outbox transacional quando cruzarem módulos.

```text
transação canônica
→ privacy.erasure.requested
→ consumidores idempotentes
→ privacy.erasure.step-completed
→ verificação
→ privacy.erasure.completed
```

O evento não deverá conter o conteúdo a ser excluído.

---

## 63. Falhas parciais

Se uma etapa falhar:

- a solicitação permanecerá aberta;
- o dado já excluído não será recriado;
- retries utilizarão backoff;
- falha persistente gerará alerta;
- o usuário não receberá confirmação falsa;
- um operador autorizado poderá intervir;
- cada intervenção será auditada.

---

## 64. Providers

Cada Provider que receba dados pessoais deverá possuir adaptador de privacidade.

```typescript
interface PrivacyProviderAdapter {
  exportSubjectData?(scope: PrivacyScope): Promise<ProviderExportResult>;
  eraseSubjectData(scope: PrivacyScope): Promise<ProviderErasureResult>;
  restrictProcessing?(scope: PrivacyScope): Promise<void>;
  verifyErasure?(reference: string): Promise<VerificationResult>;
}
```

Ausência de API de exclusão deverá ser registrada como risco antes da contratação.

---

## 65. Inventário de Providers

Para cada Provider:

- papel de controlador ou operador;
- dados enviados;
- finalidade;
- região;
- suboperadores;
- retenção;
- segurança;
- exclusão;
- exportação;
- transferência internacional;
- canal de incidente;
- contrato;
- owner;
- plano de saída.

---

## 66. Transferências internacionais

Transferências internacionais deverão possuir mecanismo válido e evidência documental.

Antes da ativação deverão ser avaliados:

- país e região;
- importador;
- suboperadores;
- mecanismo previsto na regulamentação;
- cláusulas aplicáveis;
- transferências subsequentes;
- medidas técnicas;
- direitos dos titulares;
- resposta a incidentes;
- exclusão;
- transparência.

Escolher região europeia de um SaaS não elimina automaticamente a transferência internacional nem todas as obrigações.

---

## 67. Contratos e suboperadores

Contratos deverão abordar:

- instruções documentadas;
- confidencialidade;
- segurança;
- subcontratação;
- localização;
- notificação de incidente;
- apoio a direitos;
- retorno ou eliminação;
- auditoria e evidências;
- término;
- mudanças materiais.

Mudança de suboperador crítico deverá acionar revisão.

---

## 68. Segurança

Privacidade depende de controles de segurança.

Deverão existir:

- criptografia em trânsito;
- criptografia em repouso;
- menor privilégio;
- segregação por Account;
- gestão de secrets;
- rotação de credenciais;
- trilhas de auditoria;
- backups protegidos;
- gestão de vulnerabilidades;
- resposta a incidentes;
- secure deletion compatível com a tecnologia.

---

## 69. Incidentes

Incidentes envolvendo dados pessoais deverão seguir runbook específico.

O processo deverá:

- conter;
- preservar evidências;
- identificar categorias e titulares;
- avaliar risco ou dano relevante;
- registrar decisões;
- envolver responsáveis;
- comunicar dentro dos prazos aplicáveis;
- documentar medidas;
- realizar retrospectiva.

O produto deverá apoiar a extração rápida do inventário afetado.

---

## 70. Prazo de comunicação

A regulamentação vigente da ANPD estabelece prazo de três dias úteis para comunicação pelo controlador à ANPD e aos titulares quando o incidente puder acarretar risco ou dano relevante, ressalvadas regras específicas.

Esse prazo deverá ser tratado como limite externo de um processo interno mais rápido.

A contagem, aplicabilidade e conteúdo da comunicação deverão receber validação jurídica e do encarregado.

---

## 71. Backups

Backups não serão restaurados apenas para apagar uma linha.

Em exclusões:

- o dado será removido dos sistemas ativos;
- tombstones impedirão reintrodução;
- backups terão acesso restrito e rotação;
- restauração exigirá reaplicação de exclusões;
- nenhuma utilização operacional do dado excluído será permitida;
- a política exata será definida no `RB-ADR-023`.

---

## 72. Restauração

Após restauração:

```text
restaurar snapshot
→ bloquear tráfego mutável
→ aplicar migrations
→ reaplicar tombstones e erasures
→ validar isolamento
→ liberar tráfego
```

Testes de disaster recovery deverão comprovar que dados excluídos não ressuscitam.

---

## 73. Ambientes não produtivos

Produção não deverá ser copiada integralmente para:

- development;
- Preview;
- staging;
- testes;
- demos;
- notebooks.

Quando dados realistas forem necessários, deverão ser sintéticos ou devidamente anonimizados.

Mascaramento superficial não será suficiente quando houver possibilidade de reversão.

---

## 74. Suporte

Ferramentas de suporte deverão:

- usar acesso just-in-time quando possível;
- registrar motivo;
- limitar escopo;
- mascarar dados;
- impedir download amplo;
- não permitir personificação silenciosa;
- auditar visualização de dados altamente restritos.

Screenshots e exports de suporte terão retenção própria.

---

## 75. Desenvolvimento assistido por IA

Agentes poderão apoiar:

- inventário;
- geração de schemas;
- testes;
- identificação de PII em código;
- revisão de retenção;
- documentação;
- análise de impacto;
- detecção de Providers sem adaptador.

Agentes não poderão autonomamente:

- escolher base legal;
- aprovar tratamento;
- alterar consentimento;
- negar direito;
- liberar export;
- concluir exclusão com falhas;
- criar legal hold;
- enviar comunicação regulatória;
- autorizar transferência internacional;
- usar dados reais em teste;
- ativar treinamento.

---

## 76. Autorização

O `RB-ADR-008` permanece autoridade sobre permissões.

Privacidade não substitui autorização, e autorização não substitui finalidade.

Fluxo correto:

```text
autenticar
→ autorizar
→ validar finalidade e estado de privacidade
→ executar tratamento
→ auditar quando aplicável
```

---

## 77. Feature flags

O `RB-ADR-020` permanece autoridade sobre feature flags.

Flags poderão:

- liberar o portal de privacidade;
- controlar migração;
- acionar kill switch de coleta;
- ativar novo workflow.

Flags não poderão:

- conceder consentimento;
- ignorar revogação;
- alterar base legal;
- prolongar retenção;
- desativar exclusão obrigatória.

---

## 78. Modelo de persistência

PostgreSQL armazenará:

- Processing Activities;
- catálogo de propósitos;
- preferências;
- consent evidence;
- políticas de retenção;
- solicitações;
- etapas;
- legal holds;
- inventário de Providers;
- revisões;
- referências de evidência.

Conteúdo volumoso temporário, como exports, deverá permanecer em object storage com expiração.

---

## 79. Fronteiras de módulo

Módulos iniciais:

```text
privacy-governance
consent-management
data-subject-requests
retention-enforcement
provider-privacy
privacy-assurance
```

Módulos de domínio não deverão consultar tabelas de consentimento diretamente.

Deverão utilizar ports semânticos.

---

## 80. Ports internos

```typescript
interface PrivacyDecisionService {
  canProcess(
    activity: ProcessingActivityKey,
    subject: PrivacySubject,
    context: ProcessingContext,
  ): Promise<PrivacyDecision>;
}

interface DataSubjectRequestService {
  requestAccess(input: AccessRequestInput): Promise<RequestId>;
  requestExport(input: ExportRequestInput): Promise<RequestId>;
  requestCorrection(input: CorrectionRequestInput): Promise<RequestId>;
  requestErasure(input: ErasureRequestInput): Promise<RequestId>;
}
```

O resultado deverá incluir decisão e reason code, sem expor raciocínio jurídico sensível ao cliente.

---

## 81. Reason codes

Exemplos:

```text
allowed.required-service
allowed.consent-granted
allowed.documented-legal-basis
denied.consent-missing
denied.consent-withdrawn
denied.purpose-inactive
denied.activity-unapproved
denied.privacy-hold
denied.subject-restricted
```

Reason codes deverão ser estáveis, observáveis e livres de PII.

---

## 82. Testes unitários

Deverão validar:

- propósito ativo e inativo;
- consentimento concedido, negado e revogado;
- tratamento necessário;
- aviso versionado;
- ausência de registro;
- política expirada;
- legal hold;
- Account compartilhada;
- localização;
- menor;
- export;
- exclusão idempotente.

---

## 83. Testes de integração

Deverão validar:

- PostgreSQL;
- outbox;
- workflow assíncrono;
- object storage;
- Redis;
- índices;
- Providers;
- retry;
- expiração;
- tombstones;
- auditoria;
- falhas parciais;
- restauração.

---

## 84. Testes end-to-end

Jornadas críticas:

- primeira escolha de consentimento;
- recusa sem dark pattern;
- revogação;
- localização negada com fallback;
- exportação autenticada;
- correção;
- exclusão de Trip;
- exclusão de Account;
- Account com múltiplos membros;
- Provider indisponível;
- restauração sem ressurreição;
- acesso provável por menor bloqueado ou tratado conforme política.

---

## 85. Testes de privacidade

Deverão comprovar que:

- PII não chega a logs;
- coordenadas não chegam a analytics;
- prompts não chegam a observabilidade;
- cliente não recebe regras internas;
- export não inclui dados de outro membro;
- exclusão alcança derivados;
- dados de produção não chegam a Preview;
- revogação interrompe emissão;
- Provider recebe somente contexto mínimo.

---

## 86. CI/CD

O pipeline deverá detectar progressivamente:

- schema com campo pessoal sem classificação;
- evento analítico não registrado;
- nova tabela sem política de retenção;
- Provider sem inventário;
- log de payload;
- uso de e-mail como identificador analítico;
- finalidade inexistente;
- política vencida;
- export sem TTL;
- workflow sem idempotência;
- migration que recria dado excluído.

---

## 87. Observabilidade da privacidade

Métricas permitidas:

- solicitações por tipo;
- prazo de atendimento;
- falhas de workflow;
- etapas pendentes;
- Providers pendentes;
- políticas expiradas;
- tratamentos sem revisão;
- consentimentos por estado agregado;
- revogações agregadas;
- exports expirados;
- legal holds ativos;
- dados além da retenção;
- falhas de propagação.

Métricas não deverão conter identificação do titular.

---

## 88. Alertas

Alertas deverão existir para:

- exclusão bloqueada;
- Provider sem resposta;
- dado além do prazo;
- export acessível após expiração;
- atividade sem aprovação;
- aumento inesperado de coleta;
- falha de revogação;
- restauração sem reaplicação de tombstones;
- acesso indevido;
- incidente potencial.

---

## 89. Evidências

Evidências de conformidade poderão incluir:

- versões de políticas;
- aprovações;
- diffs;
- testes;
- execução de jobs;
- relatórios de Provider;
- contratos;
- registros de solicitação;
- comprovantes de exclusão;
- revisões;
- RIPDs.

Evidências deverão ter acesso restrito e retenção própria.

---

## 90. RIPD

Um Relatório de Impacto à Proteção de Dados Pessoais deverá ser considerado quando o tratamento puder gerar alto risco.

Gatilhos internos incluem:

- localização precisa em escala;
- monitoramento sistemático;
- dados de menores;
- perfilamento;
- decisões automatizadas com impacto relevante;
- combinação de múltiplas fontes;
- dados sensíveis;
- nova finalidade material;
- IA com contexto amplo;
- transferência ou Provider de risco elevado.

---

## 91. Ownership

Papéis mínimos:

- Product define necessidade e experiência;
- Architecture define fronteiras técnicas;
- Privacy ou responsável designado valida tratamento;
- Security define controles;
- Engineering implementa;
- Data governa schemas analíticos;
- Provider Owner governa terceiros;
- Support executa fluxos autorizados;
- Legal valida interpretações e obrigações.

Nenhuma área aprovará isoladamente tratamentos de alto risco.

---

## 92. Consequências positivas

A decisão proporciona:

- minimização sistemática;
- evidência de consentimento;
- revogação efetiva;
- retenção executável;
- direitos auditáveis;
- exclusão coordenada;
- proteção de localização;
- limites para IA e analytics;
- governança de Providers;
- maior portabilidade;
- redução de dívida regulatória;
- coerência entre produto e arquitetura.

---

## 93. Consequências negativas

A decisão introduz:

- novos módulos;
- metadados obrigatórios;
- workflows assíncronos;
- custo de integração com Providers;
- complexidade de Account compartilhada;
- necessidade de revisão humana;
- testes adicionais;
- retenções distintas;
- operação de solicitações;
- risco de bloqueio de entregas sem owner de privacidade.

---

## 94. Riscos e mitigações

### Consentimento como solução universal

Mitigações:

- registro da hipótese;
- revisão;
- separação entre requerido e opcional.

### Exclusão incompleta

Mitigações:

- inventário;
- adapters;
- etapas verificáveis;
- tombstones;
- alertas.

### Ressurreição por backup

Mitigações:

- reaplicação de exclusões;
- testes de restore;
- rotação.

### Coleta excessiva por IA

Mitigações:

- context builders;
- allowlists;
- redaction;
- testes.

### Dados de menores

Mitigações:

- ausência de Account infantil no MVP;
- mínima granularidade;
- revisão específica;
- melhor interesse.

### Transferência internacional não governada

Mitigações:

- inventário;
- mecanismo documentado;
- contratos;
- revisão de suboperadores.

---

## 95. Controles obrigatórios

Deverão ser implementados:

- Privacy Gate;
- Processing Activity Registry;
- classificação;
- catálogo de propósitos;
- ledger de consentimento;
- preferências atuais;
- retenção versionada;
- workflow de direitos;
- tombstones;
- provider adapters;
- inventário de terceiros;
- controles de localização;
- filtros de analytics;
- redaction de observabilidade;
- testes;
- métricas;
- alertas;
- revisão.

---

## 96. Estratégia de implementação

### Etapa 1 — Fundação

- criar classificação;
- criar registro de tratamentos;
- criar catálogo de propósitos;
- definir owners;
- mapear Providers.

### Etapa 2 — Consentimento

- criar preferência canônica;
- criar evidence ledger;
- implementar concessão e revogação;
- integrar analytics.

### Etapa 3 — Retenção

- criar catálogo;
- mapear tabelas e objetos;
- implementar jobs;
- criar métricas.

### Etapa 4 — Direitos

- criar requests;
- autenticar;
- exportar;
- corrigir;
- excluir;
- auditar.

### Etapa 5 — Providers

- criar adapters;
- testar exclusão;
- registrar transferências;
- validar contratos.

### Etapa 6 — Assurance

- CI;
- dashboards;
- alertas;
- RIPD;
- exercícios de incidente;
- testes de restauração.

---

## 97. Primeira implementação recomendada

O primeiro corte deverá abranger:

- product analytics não essencial;
- consent purpose correspondente;
- ledger;
- revogação;
- bloqueio server-side;
- exclusão de identificador no PostHog;
- teste end-to-end;
- métricas de falha.

Esse caso conecta diretamente o `RB-ADR-021` a uma capacidade concreta de privacidade.

---

## 98. Critérios de implementação concluída

A decisão estará inicialmente implementada quando:

- tratamentos críticos estiverem inventariados;
- analytics possuir propósito e controle;
- consentimento for versionado;
- revogação interromper coleta;
- políticas cobrirem dados pessoais persistidos;
- export temporário funcionar;
- exclusão de Trip funcionar;
- exclusão de Account funcionar;
- Providers críticos participarem do workflow;
- tombstones sobreviverem à restauração;
- localização não for persistida indevidamente;
- logs estiverem redigidos;
- testes de cross-account passarem;
- owners e revisões existirem.

---

## 99. Verificação

A verificação deverá incluir:

- usuário autenticado e anônimo;
- consentimento ausente;
- recusa;
- concessão;
- revogação;
- aviso novo;
- Account compartilhada;
- Trip encerrada;
- localização atual;
- menor representado no grupo;
- export;
- exclusão;
- legal hold;
- Provider indisponível;
- Redis indisponível;
- evento atrasado;
- backup restaurado;
- dados agregados;
- transferência internacional;
- cross-account.

---

## 100. Métricas de adoção

Poderão ser acompanhadas:

- cobertura do inventário;
- campos classificados;
- sistemas com retenção;
- Providers com adapter;
- tempo de revogação;
- tempo de exportação;
- tempo de exclusão;
- falhas por etapa;
- dados vencidos;
- revisões atrasadas;
- atividades de alto risco;
- RIPDs pendentes;
- incidentes;
- restaurações validadas.

---

## 101. Gatilhos de revisão

Esta decisão deverá ser revisada quando:

- o modelo de negócio mudar;
- publicidade for considerada;
- acesso direto por menores for permitido;
- mobile tracking for introduzido;
- localização contínua for proposta;
- novo Provider de IA for adotado;
- treinamento com dados for proposto;
- nova regulamentação entrar em vigor;
- houver incidente relevante;
- houver mudança de região;
- warehouse ou CDP for adotado;
- exclusões não puderem cumprir o objetivo;
- o volume operacional exigir ferramenta especializada.

---

## 102. Fontes consultadas

Foram consultadas, em 2026-07-27, fontes oficiais:

- [Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais, texto compilado](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm);
- [ANPD — Regulamentações vigentes](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd);
- [ANPD — Direitos dos titulares e perguntas frequentes](https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes/perguntas-frequentes);
- [ANPD — Relatório de Impacto à Proteção de Dados Pessoais](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd);
- [ANPD — Hipóteses legais e legítimo interesse](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_hipoteses_legais_tratamento_de_dados_pessoais_legitimo_interesse);
- [ANPD — Transferência Internacional de Dados](https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados);
- [ANPD — Comunicação de Incidentes de Segurança](https://www.gov.br/anpd/pt-br/assuntos/comunicacao-de-incidentes-de-seguranca-cis);
- [Lei nº 15.211/2025 — Estatuto Digital da Criança e do Adolescente](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm);
- [ANPD — ECA Digital](https://www.gov.br/anpd/pt-br/assuntos/eca-digital);
- [Decreto nº 12.880/2026 — Regulamentação do ECA Digital](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/decreto/d12880.htm).

Requisitos e interpretações deverão ser confirmados novamente antes da implementação e da aprovação do ADR.

---

## 103. Próxima decisão

O `RB-ADR-023` deverá definir a estratégia de backup, recuperação de desastres e continuidade.

A decisão deverá tratar:

- objetivos de recuperação;
- classificação de workloads;
- PostgreSQL;
- Redis;
- object storage;
- secrets;
- backups criptografados;
- rotação;
- imutabilidade;
- restauração;
- testes;
- região;
- Providers;
- exclusões e tombstones;
- ransomware;
- runbooks;
- comunicação;
- custos.

---

## 104. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-022
```

O presente documento deverá:

- receber estado `Superseded`;
- apontar para o substituto;
- permanecer disponível;
- preservar o contexto histórico.

---

## 105. Checklist da decisão

Antes da aprovação:

- contexto está completo;
- problema está definido;
- limites jurídicos estão explícitos;
- privacidade por padrão está definida;
- Privacy Gate está definido;
- registro de tratamentos está definido;
- bases legais estão separadas;
- legítimo interesse está governado;
- consentimento está definido;
- revogação está definida;
- ledger está definido;
- classificação está definida;
- minimização está definida;
- finalidade está definida;
- dados sensíveis estão contemplados;
- localização está protegida;
- Hospedagem está protegida;
- menores estão contemplados;
- ECA Digital está contemplado;
- IA está limitada;
- treinamento está proibido sem nova decisão;
- analytics está integrado;
- observabilidade está limitada;
- auditoria está separada;
- caches e índices estão contemplados;
- anonimização está definida;
- retenção está definida;
- legal hold está definido;
- direitos estão definidos;
- identidade está protegida;
- export está definido;
- Account compartilhada está contemplada;
- exclusão está definida;
- tombstones estão definidos;
- falhas parciais estão definidas;
- Providers estão contemplados;
- transferências internacionais estão definidas;
- contratos estão contemplados;
- incidentes estão definidos;
- backups estão contemplados;
- ambientes não produtivos estão protegidos;
- suporte está limitado;
- agentes estão limitados;
- autorização está preservada;
- feature flags estão limitadas;
- modelo de persistência está definido;
- ports estão definidos;
- testes estão definidos;
- CI/CD está definido;
- métricas estão definidas;
- RIPD está definido;
- ownership está definido;
- riscos estão registrados;
- controles estão definidos;
- implementação está definida;
- verificação está definida;
- próxima decisão está definida;
- não existem contradições com RB-DOM-001;
- não existem contradições com RB-ADR-008;
- não existem contradições com RB-ADR-009;
- não existem contradições com RB-ADR-013;
- não existem contradições com RB-ADR-014;
- não existem contradições com RB-ADR-020;
- não existem contradições com RB-ADR-021.

---

## 106. Declaração final

O RouteBook adotará privacidade por desenho e por padrão.

Todo tratamento de dados pessoais deverá possuir finalidade, categoria, hipótese legal proposta, owner, destinatários, política de retenção, riscos e mecanismo de atendimento aos direitos aplicáveis.

PostgreSQL será a fonte canônica do registro de tratamentos, propósitos, preferências, evidências de consentimento, políticas de retenção e solicitações de titulares.

Consentimento será utilizado somente quando apropriado, de forma granular, informada, demonstrável e revogável.

O estado atual da preferência será separado do ledger histórico.

Revogação interromperá novos tratamentos dependentes do consentimento e será propagada aos pipelines e Providers aplicáveis.

Localização precisa, conteúdo livre, contexto de IA e informações relativas a menores receberão proteção superior.

O MVP não oferecerá Accounts independentes para crianças nem realizará perfilamento comportamental de menores.

O RouteBook não utilizará dados do usuário para treinamento de modelos sem nova decisão arquitetural, avaliação de privacidade e fundamento aplicável.

Cada categoria persistida possuirá retenção versionada.

Exclusões serão executadas por workflow idempotente e auditável, cobrindo fonte canônica, derivados, caches, índices, objetos e Providers.

Tombstones mínimos impedirão ressurreição por eventos atrasados e restaurações.

Backups serão protegidos, rotacionados e obrigados a reaplicar exclusões após restauração; sua estratégia completa será definida no `RB-ADR-023`.

Providers e transferências internacionais deverão possuir inventário, contratos, mecanismo aplicável, exclusão, resposta a incidentes e plano de saída.

Product analytics, observabilidade, auditoria, autorização e feature flags continuarão com responsabilidades distintas.

Esta decisão estabelece uma arquitetura verificável para que o RouteBook aprenda e opere com dados sem transformar a intimidade de uma Viagem em coleta irrestrita.

---

## 107. Entrada para o registro

```markdown
| RB-ADR-022 | Estratégia de Privacidade, Consentimento, Retenção e Exclusão de Dados | Architecture Decision Record | Published | 0.1.0 | [rb-adr-022-privacy-consent-data-retention-and-erasure-strategy.md](./architecture/adrs/rb-adr-022-privacy-consent-data-retention-and-erasure-strategy.md) |
```
