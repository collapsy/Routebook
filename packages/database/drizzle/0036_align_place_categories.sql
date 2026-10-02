-- Issue #519 — alinhar a constraint persistida às categorias públicas do catálogo.
ALTER TABLE "places"
  DROP CONSTRAINT "places_category_check";
--> statement-breakpoint
ALTER TABLE "places"
  ADD CONSTRAINT "places_category_check"
  CHECK ("category" IN (
    'beach',
    'gastronomy',
    'nature',
    'nightlife',
    'attraction',
    'viewpoint',
    'tour',
    'shopping'
  ));
