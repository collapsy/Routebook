ALTER TABLE "places"
  ADD COLUMN IF NOT EXISTS "price_range" varchar(24);

ALTER TABLE "places"
  DROP CONSTRAINT IF EXISTS "places_price_range_check";

ALTER TABLE "places"
  ADD CONSTRAINT "places_price_range_check"
  CHECK ("price_range" IS NULL OR "price_range" IN ('free', 'budget', 'moderate', 'premium'));

-- Curadoria qualitativa inicial do catálogo publicado. A classificação descreve o
-- acesso ao Place e não inclui transporte, consumo opcional ou preço confirmado.
UPDATE "places"
SET "price_range" = 'free'
WHERE "destination_id" = 'pipa-rn-br'
  AND "slug" IN ('praia-do-amor', 'baia-dos-golfinhos', 'chapadao-de-pipa')
  AND "price_range" IS NULL;

UPDATE "places"
SET "price_range" = 'moderate'
WHERE "destination_id" = 'pipa-rn-br'
  AND "slug" IN ('centro-gastronomico-de-pipa', 'avenida-baia-dos-golfinhos-noite')
  AND "price_range" IS NULL;
