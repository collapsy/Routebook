-- RB-INC-178 — Place possui identidade global; Destination permanece contexto de descoberta.
-- Conteúdo curado existente conserva destination_id como agrupamento editorial legado.
ALTER TABLE "places" ALTER COLUMN "destination_id" DROP NOT NULL;
