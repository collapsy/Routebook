# RB-INC-019 — Edição da Hospedagem e Coordenadas

## Objetivo

Permitir a atualização persistida da hospedagem da viagem, incluindo coordenadas geográficas opcionais usadas como origem para o cálculo de distância.

## Regras

- nome da hospedagem é obrigatório quando endereço ou coordenadas forem informados;
- latitude e longitude devem ser informadas em conjunto;
- coordenadas devem respeitar os limites geográficos canônicos;
- coordenadas podem ser removidas mantendo nome e endereço;
- cada atualização incrementa `contextVersion` e atualiza `updatedAt`;
- viagens existentes sem hospedagem ou coordenadas continuam válidas.

## Implementação

- contrato `TripRepository.update`;
- domínio `updateTripAccommodation`;
- serviço `updateAndPersistTripAccommodation`;
- persistência no `DrizzleTripRepository`;
- testes de atualização, remoção de coordenadas e validação parcial.

## Rastreabilidade

- Issue: #41
- Branch: `feature/rb-inc-019-accommodation-editing`
