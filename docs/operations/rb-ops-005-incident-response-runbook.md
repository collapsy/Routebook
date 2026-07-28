---
id: RB-OPS-005

title: Runbook de Resposta a Incidentes
description: Procedimento operacional para declarar, conter, investigar, comunicar, recuperar e revisar incidentes do RouteBook.

document_type: operations-runbook
owner: Operations

status: Published
version: "0.1.0"

created: "2026-07-27"
last_updated: null

authors:
  - RouteBook Team

tags:
  - operations
  - incident-response
  - runbook
  - security
  - privacy
  - reliability

related_documents:
  - RB-ADR-020
  - RB-ADR-022
  - RB-ADR-023
  - RB-ADR-024
  - RB-ADR-025

prerequisites:
  - RB-ADR-024

next_documents: []

ai_context:
  priority: high
  index: true
---

# RB-OPS-005 — Runbook de Resposta a Incidentes

## 1. Ao receber um alerta

1. confirmar que o sinal é plausível;
2. abrir `INC-YYYY-NNN`;
3. registrar horário;
4. classificar severidade provisória;
5. designar Incident Commander;
6. iniciar timeline;
7. definir próxima atualização.

## 2. Registro inicial

```yaml
incident_id:
status: declared
severity:
detected_at:
declared_at:
incident_commander:
services:
capabilities:
known_impact:
unknowns:
next_update_at:
```

## 3. SEV-1

- bloquear mudanças não relacionadas;
- preservar evidências;
- avaliar somente leitura;
- verificar cross-account;
- verificar privacidade e segurança;
- avaliar kill switch;
- avaliar rotação;
- abrir canal dedicado;
- preparar comunicação;
- acionar recuperação quando necessário.

## 4. Triagem

Perguntas:

- usuários estão em risco?
- dados estão expostos ou incorretos?
- mutações continuam?
- custo continua crescendo?
- Provider está comprometido?
- impacto é global, por Account ou por capability?
- há workaround?
- qual última mudança?
- qual evidência falta?

## 5. Contenção por categoria

### Disponibilidade

- rollback;
- reduzir tráfego;
- desligar capability;
- usar fallback;
- modo somente leitura.

### Segurança

- revogar sessão ou token;
- rotacionar secret;
- isolar recurso;
- bloquear endpoint;
- preservar logs.

### Privacidade

- interromper coleta;
- bloquear export ou compartilhamento;
- identificar tratamentos;
- acionar adapters;
- preservar prazos.

### Dados

- interromper escrita;
- snapshot;
- validar corrupção;
- iniciar `RB-OPS-003`.

### IA

- desativar modelo ou Tool;
- selecionar fallback aprovado;
- reduzir contexto;
- preservar metadados necessários;
- revisar alcance.

### Custos

- hard limit;
- kill switch;
- revogar credencial;
- pausar workflow;
- bloquear loop.

## 6. Timeline

Registrar:

```text
HH:MM — sinal observado
HH:MM — hipótese
HH:MM — decisão
HH:MM — ação
HH:MM — resultado
```

Separar fato, hipótese e decisão.

## 7. Comunicação interna

```markdown
INC:
Severidade:
Estado:
Impacto conhecido:
Ações:
Riscos:
Próxima atualização:
```

## 8. Comunicação externa

```markdown
Estamos investigando uma indisponibilidade/degradação em [capacidade].
Impacto conhecido: [descrição objetiva].
Medidas em andamento: [ação segura].
Próxima atualização: [horário ou marco].
```

Não confirmar exposição, causa ou prazo antes de evidência suficiente.

## 9. Recuperação

- aplicar correção;
- validar em escopo controlado;
- liberar leitura;
- liberar escrita gradualmente;
- observar erros, latência e custo;
- reconciliar filas;
- confirmar privacidade;
- manter fallback até estabilidade.

## 10. Encerramento operacional

Pode marcar `resolved` quando:

- dano contido;
- serviço estável;
- integridade validada;
- comunicação feita;
- monitoramento ativo;
- risco residual registrado.

## 11. Postmortem

Abrir em até:

- SEV-1: 2 dias úteis;
- SEV-2: 5 dias úteis;
- demais: quando exigido.

## 12. Template de postmortem

```markdown
# Postmortem INC-YYYY-NNN

## Resumo
## Impacto
## Detecção
## Timeline
## Causa e fatores contribuintes
## Contenção
## Recuperação
## O que funcionou
## O que falhou
## Ações
## Riscos aceitos
## Evidências
```

## 13. Checklist de encerramento

- [ ] severidade final
- [ ] timeline
- [ ] impacto
- [ ] comunicação
- [ ] dados e privacidade
- [ ] custos
- [ ] Providers
- [ ] causa
- [ ] ações com owner
- [ ] postmortem
- [ ] runbook atualizado
