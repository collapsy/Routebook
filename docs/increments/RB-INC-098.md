# RB-INC-098 — Adapter PostgreSQL do contexto autoritativo de Itinerary Proposal

## Status

Em desenvolvimento.

## Objetivo

Implementar o adapter PostgreSQL concreto da porta `AuthoritativeItineraryProposalGenerationContextPort`, preservando a autoridade dos dados, a identidade da Trip e a ordenação determinística exigida pelo Proposal Management.

## Escopo

- leitura autoritativa de Itinerary, Recommendations e Places por Trip;
- mapeamento para os contratos canônicos de geração;
- tratamento estável de ausência e inconsistência;
- testes de integração;
- atualização de exports e governança.

## Dependências

- RB-INC-096
- RB-INC-097

## Issue

- #221
