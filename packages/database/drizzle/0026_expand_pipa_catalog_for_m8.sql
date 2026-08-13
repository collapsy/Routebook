-- RB-INC-135 — expansão aditiva do catálogo de Pipa para a validação M8.
--
-- Curadoria factual consultada em 2026-08-12. Fontes principais:
-- - Prefeitura de Tibau do Sul — Turismo e Lazer:
--   https://tibaudosul.rn.gov.br/o-municipio/turismo-e-lazer/
-- - Visit Brasil — Pipa:
--   https://visitbrasil.com/location/pipa-pt/
-- - Mirante Sunset Bar:
--   https://mirantesunsetbar.com.br/
-- - diretórios locais/estabelecimentos para endereço e localização de restaurantes e vida noturna.
--
-- A migration não altera nem arquiva os cinco Places históricos. Todos os novos registros
-- usam identidade estável e ON CONFLICT DO NOTHING para preservar execuções idempotentes.

INSERT INTO "places" (
  "id",
  "destination_id",
  "slug",
  "name",
  "summary",
  "category",
  "latitude",
  "longitude",
  "address_label",
  "price_range",
  "publication_status",
  "created_at",
  "updated_at"
) VALUES
  (
    '10000000-0000-4000-8000-000000000006',
    'pipa-rn-br',
    'praia-do-centro',
    'Praia do Centro',
    'Praia central de Pipa com acesso direto pela vila, piscinas naturais na maré baixa e saída de passeios náuticos.',
    'beach',
    -6.227351,
    -35.0458717,
    'Praia do Centro, Pipa, Tibau do Sul — RN',
    'free',
    'published',
    TIMESTAMPTZ '2026-08-12T15:40:00Z',
    TIMESTAMPTZ '2026-08-12T15:40:00Z'
  ),
  (
    '10000000-0000-4000-8000-000000000007',
    'pipa-rn-br',
    'praia-do-madeiro',
    'Praia do Madeiro',
    'Praia ao norte do centro de Pipa, cercada por falésias e vegetação nativa e acessada por escadaria a partir da via costeira.',
    'beach',
    -6.22271,
    -35.07068,
    'Praia do Madeiro, Tibau do Sul — RN',
    'free',
    'published',
    TIMESTAMPTZ '2026-08-12T15:40:00Z',
    TIMESTAMPTZ '2026-08-12T15:40:00Z'
  ),
  (
    '10000000-0000-4000-8000-000000000008',
    'pipa-rn-br',
    'santuario-ecologico-de-pipa',
    'Santuário Ecológico de Pipa',
    'Reserva de Mata Atlântica junto ao litoral de Pipa, com rede de trilhas, mirantes e observação da fauna e da vegetação local.',
    'nature',
    -6.226339,
    -35.065592,
    'Santuário Ecológico de Pipa, Tibau do Sul — RN',
    NULL,
    'published',
    TIMESTAMPTZ '2026-08-12T15:40:00Z',
    TIMESTAMPTZ '2026-08-12T15:40:00Z'
  ),
  (
    '10000000-0000-4000-8000-000000000009',
    'pipa-rn-br',
    'camarao-na-fazenda-pipa',
    'Camarão na Fazenda Pipa',
    'Restaurante em Pipa especializado em frutos do mar e pratos com camarão, com serviço à la carte no centro da vila.',
    'gastronomy',
    -6.229395,
    -35.04994,
    'Rua dos Bem-Te-Vis, 66, Praia da Pipa — RN',
    'moderate',
    'published',
    TIMESTAMPTZ '2026-08-12T15:40:00Z',
    TIMESTAMPTZ '2026-08-12T15:40:00Z'
  ),
  (
    '10000000-0000-4000-8000-000000000010',
    'pipa-rn-br',
    'atelier-de-massas',
    'Atelier de Massas',
    'Restaurante de pequeno porte no centro de Pipa, dedicado a massas artesanais e pratos de inspiração italiana.',
    'gastronomy',
    -6.229117,
    -35.04733,
    'Avenida Baía dos Golfinhos, 1008, Praia da Pipa — RN',
    'moderate',
    'published',
    TIMESTAMPTZ '2026-08-12T15:40:00Z',
    TIMESTAMPTZ '2026-08-12T15:40:00Z'
  ),
  (
    '10000000-0000-4000-8000-000000000011',
    'pipa-rn-br',
    'o-tal-do-escondidinho',
    'O Tal do Escondidinho',
    'Restaurante no centro de Pipa voltado à cozinha brasileira e nordestina, com pratos regionais e serviço de bar.',
    'gastronomy',
    -6.229046,
    -35.04913,
    'Avenida Baía dos Golfinhos, 774, Praia da Pipa — RN',
    'moderate',
    'published',
    TIMESTAMPTZ '2026-08-12T15:40:00Z',
    TIMESTAMPTZ '2026-08-12T15:40:00Z'
  ),
  (
    '10000000-0000-4000-8000-000000000012',
    'pipa-rn-br',
    'mirante-sunset-bar',
    'Mirante Sunset Bar',
    'Bar em área elevada do Mirante de Pipa, com vista para a costa, mesas ao ar livre e programação musical.',
    'nightlife',
    -6.22815514,
    -35.04529953,
    'Rua do Mirante, 01, Praia da Pipa — RN',
    'moderate',
    'published',
    TIMESTAMPTZ '2026-08-12T15:40:00Z',
    TIMESTAMPTZ '2026-08-12T15:40:00Z'
  ),
  (
    '10000000-0000-4000-8000-000000000013',
    'pipa-rn-br',
    'agora-club',
    'Agora Club',
    'Clube e lounge na Avenida Baía dos Golfinhos, no centro de Pipa, voltado a música, dança e programação noturna.',
    'nightlife',
    -6.2288875,
    -35.0488821,
    'Avenida Baía dos Golfinhos, 795, Praia da Pipa — RN',
    'moderate',
    'published',
    TIMESTAMPTZ '2026-08-12T15:40:00Z',
    TIMESTAMPTZ '2026-08-12T15:40:00Z'
  )
ON CONFLICT DO NOTHING;