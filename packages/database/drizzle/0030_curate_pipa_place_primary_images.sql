-- RB-INC-143 — imagens reais, licenciadas e controladas pelo RouteBook para landmarks de Pipa.
--
-- A curadoria usa arquivos do Wikimedia Commons verificados individualmente. O browser nunca usa
-- as URLs abaixo como src; `sourceUrl` existe somente como Provenance. Os assets correspondentes
-- são versionados em apps/web/public/place-images/pipa/ e verificados por hash no CI.
--
-- Esta migration contém UPDATE e, por RB-INC-133, deve ser classificada como high-risk para
-- Production e exigir aprovação humana explícita do SHA exato antes da aplicação.

UPDATE "places"
SET
  "primary_image" = CASE "id"
    WHEN '10000000-0000-4000-8000-000000000001'::uuid THEN jsonb_build_object(
      'assetPath', '/place-images/pipa/praia-do-amor.jpg',
      'altText', 'Vista da Praia do Amor em Pipa, cercada por falésias e vegetação costeira.',
      'sourceName', 'Wikimedia Commons',
      'sourceUrl', 'https://commons.wikimedia.org/wiki/File:Praia_do_Amor,_Pipa,_Brazil.jpg',
      'license', 'CC BY-SA 4.0',
      'attribution', 'Flaviohmg'
    )
    WHEN '10000000-0000-4000-8000-000000000002'::uuid THEN jsonb_build_object(
      'assetPath', '/place-images/pipa/baia-dos-golfinhos.jpg',
      'altText', 'Vista da Baía dos Golfinhos, em Pipa, com praia, mar e vegetação costeira.',
      'sourceName', 'Wikimedia Commons',
      'sourceUrl', 'https://commons.wikimedia.org/wiki/File:Baia_golfinhos.jpg',
      'license', 'CC BY-SA 2.0',
      'attribution', 'Helder da Rocha'
    )
    WHEN '10000000-0000-4000-8000-000000000003'::uuid THEN jsonb_build_object(
      'assetPath', '/place-images/pipa/chapadao-de-pipa.jpg',
      'altText', 'Falésias do Chapadão de Pipa vistas junto ao litoral do Rio Grande do Norte.',
      'sourceName', 'Wikimedia Commons',
      'sourceUrl', 'https://commons.wikimedia.org/wiki/File:Chapad%C3%A3o_-_Nome_das_fal%C3%A9sias_da_Praia_de_Pipa,_pr%C3%B3ximo_de_Natal,_Rio_Grande_do_Norte._01.jpg',
      'license', 'CC BY-SA 3.0',
      'attribution', 'Katbizz'
    )
    WHEN '10000000-0000-4000-8000-000000000007'::uuid THEN jsonb_build_object(
      'assetPath', '/place-images/pipa/praia-do-madeiro.jpg',
      'altText', 'Vista da Praia do Madeiro, em Tibau do Sul, com mar e faixa de areia junto à vegetação.',
      'sourceName', 'Wikimedia Commons',
      'sourceUrl', 'https://commons.wikimedia.org/wiki/File:Praia_Ponta_do_Madeiro.jpg',
      'license', 'CC BY-SA 2.0',
      'attribution', 'Helder da Rocha'
    )
    WHEN '10000000-0000-4000-8000-000000000017'::uuid THEN jsonb_build_object(
      'assetPath', '/place-images/pipa/praia-de-tibau-do-sul.jpg',
      'altText', 'Praia central de Tibau do Sul junto ao encontro com a Lagoa de Guaraíras.',
      'sourceName', 'Wikimedia Commons',
      'sourceUrl', 'https://commons.wikimedia.org/wiki/File:Praia_de_Tibau_do_Sul_e_Lagoa_Guara%C3%ADras.jpg',
      'license', 'CC BY-SA 4.0',
      'attribution', 'Leandro Amaro Richter'
    )
    WHEN '10000000-0000-4000-8000-000000000026'::uuid THEN jsonb_build_object(
      'assetPath', '/place-images/pipa/lagoa-de-guarairas.jpg',
      'altText', 'Pôr do sol sobre a Lagoa de Guaraíras visto a partir de Tibau do Sul.',
      'sourceName', 'Wikimedia Commons',
      'sourceUrl', 'https://commons.wikimedia.org/wiki/File:Lagoa_Guara%C3%ADras.jpg',
      'license', 'CC BY-SA 3.0',
      'attribution', 'Manoel188'
    )
    ELSE "primary_image"
  END,
  "updated_at" = TIMESTAMPTZ '2026-08-15T18:00:00Z'
WHERE
  "destination_id" = 'pipa-rn-br'
  AND "id" IN (
    '10000000-0000-4000-8000-000000000001'::uuid,
    '10000000-0000-4000-8000-000000000002'::uuid,
    '10000000-0000-4000-8000-000000000003'::uuid,
    '10000000-0000-4000-8000-000000000007'::uuid,
    '10000000-0000-4000-8000-000000000017'::uuid,
    '10000000-0000-4000-8000-000000000026'::uuid
  );
