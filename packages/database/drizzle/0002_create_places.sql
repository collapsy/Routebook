CREATE TABLE IF NOT EXISTS "places" (
  "id" uuid PRIMARY KEY,
  "destination_id" varchar(120) NOT NULL,
  "slug" varchar(160) NOT NULL,
  "name" varchar(180) NOT NULL,
  "summary" text NOT NULL,
  "category" varchar(32) NOT NULL,
  "latitude" double precision NOT NULL,
  "longitude" double precision NOT NULL,
  "address_label" text,
  "publication_status" varchar(24) NOT NULL,
  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  CONSTRAINT "places_category_check" CHECK ("category" IN ('beach', 'gastronomy', 'nature', 'nightlife')),
  CONSTRAINT "places_publication_status_check" CHECK ("publication_status" IN ('draft', 'published', 'archived')),
  CONSTRAINT "places_latitude_check" CHECK ("latitude" BETWEEN -90 AND 90),
  CONSTRAINT "places_longitude_check" CHECK ("longitude" BETWEEN -180 AND 180)
);

CREATE UNIQUE INDEX IF NOT EXISTS "places_destination_slug_unique"
  ON "places" ("destination_id", "slug");

INSERT INTO "places" (
  "id", "destination_id", "slug", "name", "summary", "category", "latitude", "longitude",
  "address_label", "publication_status", "created_at", "updated_at"
) VALUES
  ('10000000-0000-4000-8000-000000000001', 'pipa-rn-br', 'praia-do-amor', 'Praia do Amor', 'Praia cercada por falésias, conhecida pelo visual marcante e pelas condições de mar que exigem atenção.', 'beach', -6.2366, -35.0465, 'Pipa, Tibau do Sul — RN', 'published', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000002', 'pipa-rn-br', 'baia-dos-golfinhos', 'Baía dos Golfinhos', 'Trecho de praia acessível conforme a maré, conhecido pela possibilidade de observar golfinhos no ambiente natural.', 'nature', -6.2218, -35.0606, 'Pipa, Tibau do Sul — RN', 'published', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000003', 'pipa-rn-br', 'chapadao-de-pipa', 'Chapadão de Pipa', 'Mirante natural sobre as falésias com vista ampla do litoral e acesso terrestre próximo à Praia do Amor.', 'nature', -6.2445, -35.0407, 'Pipa, Tibau do Sul — RN', 'published', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000004', 'pipa-rn-br', 'centro-gastronomico-de-pipa', 'Centro Gastronômico de Pipa', 'Área central com concentração de restaurantes e opções variadas para refeições durante o dia e à noite.', 'gastronomy', -6.2297, -35.0536, 'Avenida Baía dos Golfinhos, Pipa — RN', 'published', NOW(), NOW()),
  ('10000000-0000-4000-8000-000000000005', 'pipa-rn-br', 'avenida-baia-dos-golfinhos-noite', 'Vida Noturna na Avenida Baía dos Golfinhos', 'Eixo central com bares e estabelecimentos noturnos, permitindo explorar opções a pé conforme o perfil do grupo.', 'nightlife', -6.2302, -35.0532, 'Avenida Baía dos Golfinhos, Pipa — RN', 'published', NOW(), NOW())
ON CONFLICT ("destination_id", "slug") DO NOTHING;
