---
id: RB-ADR-023

title: Estratégia de Backup, Recuperação de Desastres e Continuidade
description: Define a estratégia oficial do RouteBook para proteção de dados, backups, restauração, recuperação de desastres, continuidade, RPO, RTO, testes e retorno seguro à operação.

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
  - backup
  - disaster-recovery
  - business-continuity
  - resilience
  - postgresql
  - object-storage
  - privacy

related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-ADR-009
  - RB-ADR-013
  - RB-ADR-014
  - RB-ADR-015
  - RB-ADR-017
  - RB-ADR-019
  - RB-ADR-022

prerequisites:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-ADR-009
  - RB-ADR-014
  - RB-ADR-022

next_documents:
  - RB-ADR-024
  - RB-OPS-003
  - RB-OPS-004

ai_context:
  priority: high
  index: true
---

# RB-ADR-023 — Estratégia de Backup, Recuperação de Desastres e Continuidade

## 1. Status

**Draft**

## 2. Contexto

O RouteBook manterá dados necessários para apoiar decisões de viagem, incluindo Accounts, Users, Trips, Preferências, Recomendações, Decisões, Roteiros, Propostas, auditoria, consentimentos e políticas de privacidade.

A perda, corrupção, indisponibilidade ou restauração incorreta desses dados poderá:

- interromper o planejamento e a execução de uma Viagem;
- produzir Recomendações com contexto obsoleto;
- restaurar dados já excluídos;
- quebrar isolamento entre Accounts;
- comprometer auditoria, consentimento e privacidade;
- provocar efeitos duplicados em workflows;
- reduzir a confiança do usuário.

Backup não é sinônimo de alta disponibilidade. Réplica não é sinônimo de backup. Continuidade não é apenas restaurar o banco. A estratégia precisa cobrir dados canônicos, objetos, configuração, código, secrets, integrações, eventos, caches reconstruíveis e procedimentos humanos.

## 3. Problema

O RouteBook precisa definir:

- quais ativos devem ser recuperáveis;
- qual perda de dados é tolerável;
- em quanto tempo cada capacidade deve retornar;
- como evitar que o mesmo incidente destrua dados primários e cópias;
- como restaurar sem reintroduzir dados apagados;
- como verificar integridade, autorização e isolamento;
- quando operar de forma degradada;
- como provar que o plano funciona.

## 4. Drivers

- projeto inicialmente pessoal e de baixo custo;
- PostgreSQL como fonte canônica de dados estruturados;
- Redis como cache e coordenação, não como fonte definitiva;
- objetos e derivados potencialmente mantidos fora do banco;
- workflows assíncronos e integrações externas;
- requisitos de privacidade definidos no `RB-ADR-022`;
- necessidade de crescimento sem adoção prematura de infraestrutura complexa;
- recuperação verificável, não apenas backups declarados.

## 5. Decisão

O RouteBook adotará uma estratégia em camadas:

1. **prevenção e alta disponibilidade do Provider**, quando disponível;
2. **PITR do PostgreSQL**, com backups base e arquivamento contínuo de WAL ou capacidade gerenciada equivalente;
3. **backup lógico periódico**, independente do caminho primário de recuperação;
4. **versionamento e proteção de objetos**, com cópia fora do domínio de falha principal quando o risco justificar;
5. **infraestrutura e configuração reproduzíveis** a partir de código, manifests e registros protegidos;
6. **runbooks versionados** de restauração e recuperação;
7. **testes regulares de restore e exercícios de desastre**;
8. **reconciliação obrigatória de privacidade, auditoria e efeitos assíncronos** após restauração.

## 6. Objetivos de recuperação

As classes iniciais serão:

| Classe | Exemplos | RPO alvo | RTO alvo |
| --- | --- | ---: | ---: |
| A — canônico crítico | Accounts, Users, Trips, Roteiros, Decisões, consentimentos, auditoria | até 15 min | até 4 h |
| B — operacional importante | outbox, jobs, catálogo de flags, configurações não secretas | até 1 h | até 8 h |
| C — derivável | caches, índices de busca, materializações, analytics reenviável | até 24 h ou reconstrução | até 24 h |
| D — descartável | cache efêmero, previews, fixtures, temporários | sem garantia | sob demanda |

Esses valores são objetivos iniciais do produto, não promessas contratuais. Qualquer SLA externo exigirá decisão própria.

## 7. Escopo de proteção

O inventário deverá cobrir:

- PostgreSQL;
- armazenamento de objetos;
- migrations e schemas;
- configuração por ambiente;
- catálogo de feature flags;
- registro de Providers;
- políticas de privacidade e retenção;
- logs de auditoria;
- chaves públicas e metadados criptográficos recuperáveis;
- código, documentação e pipelines;
- dependências externas essenciais.

Secrets não deverão ser copiados para arquivos comuns de backup. Eles deverão permanecer no mecanismo de secrets, com estratégia própria de rotação e recuperação de acesso.

## 8. PostgreSQL

PostgreSQL deverá possuir:

- backup base;
- arquivamento contínuo ou solução gerenciada equivalente;
- recuperação point-in-time;
- criptografia em trânsito e em repouso;
- retenção conhecida;
- região e domínio de falha conhecidos;
- alerta para falha de backup;
- teste de restauração.

Um backup não será considerado válido apenas porque o job terminou. A validação exigirá restauração em ambiente isolado e verificações funcionais.

## 9. Backup lógico

Backups lógicos periódicos serão mantidos como camada complementar para:

- inspeção;
- portabilidade;
- recuperação seletiva controlada;
- migração entre Providers;
- proteção contra falhas específicas do mecanismo físico.

O dump lógico:

- será criptografado;
- terá checksum;
- não será restaurado diretamente sobre produção;
- respeitará retenção;
- terá acesso restrito;
- será testado.

## 10. Objetos

Objetos persistentes deverão usar:

- versionamento;
- checksum;
- identificação do owner e da Account;
- política de retenção;
- lifecycle;
- proteção contra exclusão acidental;
- cópia independente quando o impacto justificar.

Imutabilidade poderá ser aplicada a backups, mas não deverá impedir o cumprimento das políticas de retenção e exclusão. A duração de qualquer lock deverá ser compatível com o `RB-ADR-022`.

## 11. Redis e caches

Redis não será restaurado como fonte canônica.

Após desastre, o padrão será:

```text
restaurar fontes canônicas
→ iniciar Redis vazio ou limpo
→ reconstruir snapshots e caches
→ validar versões
→ liberar tráfego
```

Filas ou estruturas que representem trabalho pendente deverão possuir origem recuperável no PostgreSQL, outbox ou Provider de workflow.

## 12. Workflows e idempotência

Após uma restauração, eventos poderão:

- reaparecer;
- chegar fora de ordem;
- ter sido processados depois do ponto restaurado;
- já ter provocado efeito externo.

Consumidores deverão usar:

- idempotency key;
- inbox/outbox quando aplicável;
- registro de efeitos externos;
- reconciliação;
- política explícita de replay.

Nenhum replay deverá reenviar e-mail, chamada paga, exclusão, publicação ou Tool mutável sem verificar o efeito anterior.

## 13. Privacidade após restore

Toda restauração deverá reaplicar:

- tombstones de exclusão;
- revogações de consentimento;
- legal holds;
- políticas de retenção;
- solicitações concluídas após o ponto restaurado;
- lista de identificadores cuja ressurreição é proibida.

O ledger mínimo necessário para essa reconciliação deverá ser protegido em domínio de falha separado ou possuir export independente.

## 14. Estratégia 3-2-1 adaptada

Para ativos Classe A, o objetivo será aproximar:

- três cópias ou representações recuperáveis;
- duas tecnologias ou domínios de falha;
- uma cópia logicamente isolada do acesso operacional principal.

O princípio será aplicado proporcionalmente ao risco e ao custo do projeto.

## 15. Ambientes

- produção terá backups reais e restauração exercitada;
- staging poderá receber dados sintéticos ou anonimizados;
- development não será fonte de recuperação;
- Preview será descartável;
- dados produtivos não serão copiados para ambientes inferiores sem processo aprovado.

## 16. Recuperação degradada

Quando a restauração completa não for imediata, o produto poderá operar em:

- página de status;
- leitura de conteúdo público estático;
- modo somente leitura;
- consulta de dados previamente materializados e validados;
- indisponibilidade seletiva de IA, mapas ou edição;
- bloqueio de mutações.

O modo degradado não deverá apresentar dados possivelmente inconsistentes como atuais.

## 17. Critérios de declaração de desastre

Um desastre poderá ser declarado quando houver:

- perda ou corrupção material de dados;
- indisponibilidade além do limiar operacional;
- comprometimento de credenciais ou ambiente;
- falha regional do Provider;
- erro de migration com recuperação complexa;
- exclusão massiva;
- restauração acidental de estado inválido;
- impossibilidade de confiar na integridade da produção.

## 18. Autoridade e papéis

| Papel | Responsabilidade |
| --- | --- |
| Incident Commander | coordena decisões e comunicação |
| Recovery Lead | executa e registra a recuperação |
| Data Owner | valida integridade de domínio |
| Privacy Owner | valida exclusões, consentimentos e retenção |
| Security Owner | avalia comprometimento e rotação |
| Product Owner | define prioridades e modo degradado |

Uma pessoa poderá acumular papéis no estágio pessoal do projeto, mas as responsabilidades continuarão separadas no checklist.

## 19. Processo de recuperação

```text
detectar
→ conter
→ preservar evidências
→ declarar incidente ou desastre
→ escolher ponto de recuperação
→ restaurar isoladamente
→ validar tecnicamente
→ reconciliar privacidade e efeitos
→ validar domínio
→ promover
→ observar
→ encerrar
→ aprender
```

## 20. Validação de restore

A validação mínima deverá comprovar:

- migrations compatíveis;
- checksums;
- integridade referencial;
- contagens e amostras;
- isolamento entre Accounts;
- autenticação e autorização;
- leitura de Trips e Roteiros;
- ausência de dados tombstonados;
- outbox e jobs conciliados;
- objetos acessíveis;
- métricas e alertas;
- capacidade de rollback do restore.

## 21. Testes

- restore automatizado mensal em ambiente isolado;
- teste lógico trimestral;
- exercício de mesa trimestral;
- exercício de desastre semestral;
- teste extraordinário após mudança material de Provider, schema ou estratégia;
- evidência retida com duração, resultado, desvios e ações.

## 22. Monitoramento

Métricas mínimas:

- idade do último backup válido;
- atraso de WAL ou mecanismo equivalente;
- duração;
- tamanho;
- checksum;
- falhas consecutivas;
- último restore bem-sucedido;
- RPO observado;
- RTO observado;
- itens de reconciliação pendentes.

## 23. Segurança

- credenciais de backup separadas das credenciais da aplicação;
- menor privilégio;
- criptografia;
- rotação;
- MFA para operações críticas;
- logs imutáveis de acesso quando possível;
- restauração somente por processo autorizado;
- proteção contra exclusão simultânea do primário e dos backups.

## 24. Retenção

A retenção inicial deverá equilibrar recuperação, custo e privacidade:

- PITR: 7 a 30 dias, conforme capacidade e custo do Provider;
- backups lógicos diários: 7 dias;
- backups lógicos semanais: 8 semanas;
- backups mensais: somente quando houver finalidade definida;
- evidências de restore: 12 meses;
- dados temporários: menor prazo tecnicamente viável.

Prazos finais deverão constar no catálogo de retenção, não apenas neste ADR.

## 25. Consequências positivas

- recuperação verificável;
- menor dependência de um único Provider;
- melhor portabilidade;
- privacidade preservada após restore;
- operação degradada planejada;
- critérios claros de RPO e RTO;
- disciplina de testes.

## 26. Consequências negativas

- custo de armazenamento;
- complexidade operacional;
- manutenção de runbooks;
- necessidade de testes recorrentes;
- reconciliação pós-restore;
- possibilidade de RTO superior ao desejado no estágio inicial.

## 27. Riscos e controles

| Risco | Controle |
| --- | --- |
| backup corrompido | checksum e restore real |
| credencial comprometida | segregação e rotação |
| exclusão dos backups | isolamento e proteção contra deleção |
| ressurreição de dados | tombstones e reconciliação |
| replay duplicado | idempotência e registro de efeitos |
| dependência do Provider | backup lógico e plano de saída |
| runbook desatualizado | teste e revisão periódica |
| custo excessivo | classes, lifecycle e revisão |

## 28. Implementação

### Etapa 1 — Inventário e objetivos

- classificar ativos;
- confirmar RPO e RTO;
- registrar owners;
- mapear capacidades dos Providers.

### Etapa 2 — PostgreSQL

- habilitar PITR ou equivalente;
- configurar alertas;
- criar backup lógico;
- gerar checksum;
- restringir credenciais.

### Etapa 3 — Objetos e configuração

- habilitar versionamento;
- definir lifecycle;
- proteger manifests;
- documentar recuperação de secrets.

### Etapa 4 — Runbooks

- criar `RB-OPS-003`;
- criar `RB-OPS-004`;
- definir comunicação;
- definir evidências.

### Etapa 5 — Exercícios

- restaurar;
- medir;
- reconciliar;
- corrigir;
- repetir.

## 29. Critérios de conclusão

A decisão estará implementada quando:

- inventário existir;
- classes A a D estiverem atribuídas;
- RPO e RTO estiverem aprovados;
- PostgreSQL possuir recuperação point-in-time;
- backup lógico independente funcionar;
- objetos críticos estiverem versionados;
- credenciais estiverem segregadas;
- restore isolado tiver sido concluído;
- tombstones tiverem sido reaplicados;
- workflows tiverem sido reconciliados;
- runbooks estiverem disponíveis;
- alertas estiverem ativos;
- primeiro exercício possuir evidência e ações fechadas.

## 30. Referências

- PostgreSQL, [Backup and Restore](https://www.postgresql.org/docs/current/backup.html).
- PostgreSQL, [Continuous Archiving and Point-in-Time Recovery](https://www.postgresql.org/docs/current/continuous-archiving.html).
- NIST SP 800-34 Rev. 1, [Contingency Planning Guide](https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final).
- Amazon Web Services, [Amazon S3 Object Lock](https://aws.amazon.com/s3/features/object-lock/).

## 31. Próxima decisão

O `RB-ADR-024` definirá gestão de incidentes, severidade, comando, comunicação, resposta, recuperação e aprendizado.

## 32. Declaração final

O RouteBook adotará proteção em camadas, recuperação point-in-time para dados canônicos, backup lógico independente, versionamento de objetos, runbooks e testes regulares.

Backups serão considerados válidos somente após restauração e verificação.

Redis e caches serão reconstruídos, não tratados como fonte canônica.

Toda restauração deverá reconciliar privacidade, tombstones, consentimentos, auditoria e efeitos assíncronos antes da liberação.

## 33. Entrada para o registro

```markdown
| RB-ADR-023 | Estratégia de Backup, Recuperação de Desastres e Continuidade | Architecture Decision Record | Published | 0.1.0 | [rb-adr-023-backup-disaster-recovery-and-business-continuity.md](./architecture/adrs/rb-adr-023-backup-disaster-recovery-and-business-continuity.md) |
```
