import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzleTripStageRepository } from "@routebook/database";

import { AccommodationForm } from "@/components/accommodation-form";

import { updateStageAccommodationAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hospedagem da etapa — RouteBook",
  description: "Informe onde ficará hospedado durante uma etapa da viagem.",
};

export default async function StageAccommodationPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string; stageId: string }>;
  searchParams: Promise<{ saved?: string; located?: string }>;
}) {
  const { tripId, stageId } = await params;
  const { saved, located } = await searchParams;
  const stage = await new DrizzleTripStageRepository().findById(tripId, stageId);
  if (!stage) notFound();

  return (
    <section className="app-page context-page accommodation-page">
      <Link className="back-link" href={`/viagens/${tripId}/etapas`}>
        ← Voltar aos destinos da viagem
      </Link>
      {saved === "1" && located === "1" ? (
        <p className="success-banner" role="status">
          Hospedagem da etapa salva. Mapa e distâncias de {stage.destination.name} usam esta
          localização.
        </p>
      ) : saved === "1" && located === "0" ? (
        <p className="form-error" role="status">
          Hospedagem salva, mas a localização não foi confirmada. Os lugares desta etapa continuam
          usando o destino como referência.
        </p>
      ) : saved === "1" ? (
        <p className="success-banner" role="status">
          Hospedagem da etapa atualizada.
        </p>
      ) : null}
      <header className="app-page-heading">
        <p className="product-eyebrow">Hospedagem da etapa</p>
        <h1>Hospedagem em {stage.destination.name}</h1>
        <p>
          Esta hospedagem vale para a visita de {stage.startDate} a {stage.endDate}. A hospedagem
          principal da viagem permanece separada.
        </p>
      </header>
      <AccommodationForm
        accommodation={stage.accommodation}
        destinationName={stage.destination.name}
        saveAction={updateStageAccommodationAction}
        stageId={stage.id}
        tripId={tripId}
      />
    </section>
  );
}
