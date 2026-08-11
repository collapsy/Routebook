---
id: RB-INC-129
title: Validação Integrada do MVP em Production
description: Valida a jornada canônica do MVP em Production com dados sintéticos, evidência ponta a ponta e observação operacional.
document_type: implementation-increment
owner: Product and Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, mvp, production, validation, exploratory-testing]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-DEL-001, RB-QA-001, RB-OBS-001, RB-INC-124]
prerequisites: [RB-INC-124]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-129 — Validação Integrada do MVP em Production

## 1. Objetivo

Comprovar, em Production e pela interface real, que um Organizador consegue criar e
reencontrar uma Trip utilizável, percorrendo descoberta, decisão e planejamento sem
aplicação silenciosa de Recommendation ou Itinerary Proposal.

Issue: #298.

Branch: `codex/rb-inc-129-mvp-production-validation`.

## 2. História a provar

Um Organizador consegue criar a viagem canônica de Pipa, informar contexto, descobrir
e salvar Places, transformar opções em um Roteiro diário editável, revisar
Recommendations, Planning Conflicts e Itinerary Proposals e reencontrar o estado
persistido em uma nova sessão.

## 3. Cenário e dados

- Production: `https://routebook-rnd10.vercel.app`;
- Destino: Pipa (RN);
- Período: 22 a 29 de agosto de 2026;
- grupo: três adultos;
- hospedagem: referência sintética compatível com o cenário canônico;
- conta, nomes e observações exclusivamente sintéticos e isolados;
- sessão exploratória limitada à jornada crítica, desktop e viewport móvel.

## 4. Escopo

- estabelecer linha de base de liveness, readiness, console e logs;
- autenticar com conta sintética;
- criar Trip e informar contexto progressivo;
- comprovar primeiro valor em descoberta contextualizada;
- salvar Places sem adicioná-los silenciosamente ao Roteiro;
- adicionar, mover, reordenar e remover Activity, preservando Período livre;
- revisar Recommendation e registrar Decision explícita;
- detectar e revisar Planning Conflict;
- gerar, revisar e decidir explicitamente sobre Itinerary Proposal;
- encerrar e reabrir a sessão para comprovar persistência;
- executar smoke responsivo da navegação crítica;
- registrar falhas, dependências externas, latência percebida e evidências.

## 5. Fora de escopo

- reserva, pagamento, navegação curva a curva ou uso durante a viagem;
- dados pessoais reais, importação de Production ou seed destrutivo;
- carga, exclusão ou migração destrutiva;
- alteração de produto, domínio, arquitetura ou Provider;
- metas quantitativas de adoção, ainda não definidas no MVP;
- validação humana qualitativa de satisfação além da sessão interna.

## 6. Regra de investigação

A validação segue UI → request/Server Action → aplicação → persistência → resposta.
Na primeira fronteira quebrada, a jornada é interrompida, o defeito é registrado em
issue separada e este incremento permanece parcial até a correção ser integrada.

## 7. Critérios de aceite

- [ ] liveness e readiness verdes antes da jornada;
- [x] conta e Trip sintéticas criadas em Production;
- [x] primeiro valor comprovado por Places contextualizados pela hospedagem;
- [x] valor principal comprovado por Places transformados em Roteiro editável;
- [ ] Recommendation, Planning Conflict e Itinerary Proposal revisáveis sem aplicação silenciosa;
- [ ] alterações persistem e reaparecem em nova sessão;
- [ ] navegação crítica utilizável em viewport móvel;
- [x] console e logs de runtime inspecionados;
- [x] falhas, latência percebida e fontes externas necessárias registradas;
- [ ] documentação e CI verdes.

## 8. Testes obrigatórios

- jornada sintética pela interface real de Production;
- `GET /api/health/live` e `GET /api/health/ready`;
- inspeção de erros de console e runtime após a jornada;
- smoke responsivo com viewport móvel;
- `pnpm docs:validate`;
- Documentation Validation e Engineering Validation no PR.

## 9. Evidências

Resultado parcial em 2026-08-11:

- deployment `dpl_2KVxVFJCtpwxBnykRfidwDzkT2Mi`, commit `488ae57c`, estado `READY`;
- nenhum erro de runtime agregado nas 24 horas anteriores à sessão;
- o acesso interno exigiu URL temporária da Vercel porque o deployment está protegido;
- conta sintética e Trip `956badd7-b414-4606-96e6-ffc8025e5567` criadas;
- contexto persistido: Pipa, 22–29/08/2026, três viajantes, quatro interesses,
  ritmo equilibrado, combinação de transportes e orçamento estimado;
- hospedagem geocodificada após revisão humana do resultado;
- primeiro valor: cinco Places no mapa e no catálogo; Praia do Amor exibida a 268 m
  da hospedagem, explicitamente como distância geodésica estimada;
- três Places permaneceram salvos sem entrada automática no Roteiro;
- valor principal: três Activities distribuídas em dias, reordenação e movimentação
  persistidas, criação e remoção de Activity temporária e Período livre protegido;
- mapa diário, alternativa textual, deslocamentos geodésicos e links de rota externa
  foram exibidos sem abrir o Provider externo;
- conflito de sobreposição detectado como risco sem alterar o Roteiro;
- cinco Recommendations explicáveis foram exibidas; ignorar uma Recommendation não
  alterou Place, Preferências ou Activities;
- transições RSC do catálogo e Recommendations exibiram loading por cerca de 1,8 s
  antes do conteúdo final, sem erro de aplicação;
- bloqueio Major: a primeira Itinerary Proposal não é alcançável pela navegação do
  Roteiro sem Proposal preexistente; defeito #299 aberto e validação interrompida.

Nenhuma credencial, token, endereço de conexão ou dado pessoal foi registrado.

## 10. Rollback

Reverter apenas a documentação do incremento. Os registros sintéticos criados em
Production permanecem isolados; qualquer remoção é ação destrutiva e fica fora deste
incremento.
