-- RB-INC-158 — expansão governada da cobertura visual dos Places publicados de Pipa.
--
-- Os três assets foram curados a partir do Wikimedia Commons, materializados localmente e
-- verificados offline antes desta persistência. sourceUrl permanece somente como Provenance;
-- o browser usa exclusivamente assetPath controlado pelo RouteBook.
--
-- Esta migration contém UPDATE e, por RB-INC-133, deve ser classificada como high-risk para
-- Production e exigir aprovação humana explícita do SHA exato antes da aplicação.

UPDATE "places"
SET
  "primary_image" = CASE "id"
    WHEN '10000000-0000-4000-8000-000000000006'::uuid THEN jsonb_build_object(
      'assetPath', '/place-images/pipa/praia-do-centro.jpg',
      'altText', 'Vista da região central da Praia de Pipa observada a partir da encosta próxima à Praia do Amor.',
      'sourceName', 'Wikimedia Commons',
      'sourceUrl', 'https://commons.wikimedia.org/wiki/File:PipaBeachView.JPG',
      'license', 'CC BY-SA 4.0',
      'attribution', 'Bjørn Christian Tørrissen'
    )
    WHEN '10000000-0000-4000-8000-000000000008'::uuid THEN jsonb_build_object(
      'assetPath', '/place-images/pipa/santuario-ecologico-de-pipa.jpg',
      'altText', 'Vista do Santuário Ecológico de Pipa, com vegetação e litoral da Praia de Pipa.',
      'sourceName', 'Wikimedia Commons',
      'sourceUrl', 'https://commons.wikimedia.org/wiki/File:Santu%C3%A1rio_Ecol%C3%B3gico_de_Pipa.jpg',
      'license', 'CC BY-SA 2.0',
      'attribution', 'Helder da Rocha'
    )
    WHEN '10000000-0000-4000-8000-000000000015'::uuid THEN jsonb_build_object(
      'assetPath', '/place-images/pipa/praia-de-cacimbinhas.jpg',
      'altText', 'Vista elevada da Praia de Cacimbinhas a partir das formações rochosas de Tibau do Sul.',
      'sourceName', 'Wikimedia Commons',
      'sourceUrl', 'https://commons.wikimedia.org/wiki/File:A_vista_da_Praia_Cacimbinhas_de_acima_das_rochas.JPG',
      'license', 'CC BY-SA 3.0',
      'attribution', 'Elisabeth Kirchmayr'
    )
    ELSE "primary_image"
  END,
  "updated_at" = TIMESTAMPTZ '2026-08-17T15:50:00Z'
WHERE
  "destination_id" = 'pipa-rn-br'
  AND "publication_status" = 'published'
  AND "id" IN (
    '10000000-0000-4000-8000-000000000006'::uuid,
    '10000000-0000-4000-8000-000000000008'::uuid,
    '10000000-0000-4000-8000-000000000015'::uuid
  );
