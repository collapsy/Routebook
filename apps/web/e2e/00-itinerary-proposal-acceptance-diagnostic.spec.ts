import { expect, test } from "@playwright/test";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
} from "@routebook/database";
import {
  completeItineraryProposalGeneration,
  requestItineraryProposal,
  startItineraryProposalGeneration,
} from "@routebook/proposal-management";
import { addActivity, createItinerary } from "@routebook/trip-management";

import { createAuthenticatedE2ETrip } from "./support/authenticated-trip";

test.setTimeout(30_000);

test("diagnostica o estado real retornado pelo aceite integral", async ({ page }, testInfo) => {
  const requestedAt = new Date(Date.now() - 10_000);
  const { trip } = await createAuthenticatedE2ETrip(
    {
      name: `Diagnóstico de aceite ${testInfo.project.name} ${Date.now()}`,
      startDate: "2026-08-22",
      endDate: "2026-08-23",
    },
    requestedAt,
  );
  let itinerary = createItinerary({ tripId: trip.id, period: trip.period }, requestedAt);
  itinerary = addActivity(
    itinerary,
    {
      dayDate: "2026-08-22",
      title: "Café já confirmado",
      startTime: "09:00",
      durationMinutes: 60,
    },
    requestedAt,
  );
  await new DrizzleItineraryRepository().save(itinerary);

  const repository = new DrizzleItineraryProposalRepository();
  const requested = requestItineraryProposal({
    tripId: trip.id,
    itineraryId: itinerary.id,
    baseTripContextVersion: 1,
    baseItineraryVersion: itinerary.version,
    contextSnapshotId: `diagnostic-${trip.id}`,
    requestedAt,
  });
  const generating = startItineraryProposalGeneration(
    requested,
    new Date(requestedAt.getTime() + 1_000),
  );
  const generatedAt = new Date(requestedAt.getTime() + 2_000);
  const ready = completeItineraryProposalGeneration(generating, {
    generationMethod: "e2e-diagnostic",
    generationVersion: "1",
    proposedActivities: [
      {
        proposedActivityId: crypto.randomUUID(),
        targetTripDayId: itinerary.days[0]!.id,
        title: "Mirante ao pôr do sol",
        description: "Uma pausa com vista antes do jantar.",
        proposedStartTime: "17:30",
        durationMinutes: 90,
        proposedOrder: 2,
        operationType: "add",
        flexibility: "flexível",
        estimatedCostAmount: 25,
        estimatedCostCurrency: "BRL",
        reason: "Aproveita o fim da tarde e reduz deslocamentos.",
      },
    ],
    criteria: ["Ritmo leve"],
    justifications: ["Reduz deslocamentos."],
    limitations: ["Horários externos não confirmados."],
    planningConflictIds: [],
    generatedAt,
    validUntil: new Date(generatedAt.getTime() + 86_400_000),
  });
  await repository.create(requested);
  await repository.save(generating);
  await repository.save(ready);

  const actionRequests: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") actionRequests.push(request.url());
  });

  await page.goto(`/viagens/${trip.id}/roteiro/proposta`);
  await page.getByText("Aceitar proposta", { exact: true }).click();
  const checkbox = page.getByRole("checkbox", { name: /atualizará o Roteiro/i });
  const button = page.getByRole("button", { name: "Confirmar e aceitar proposta" });
  const acceptForm = page.locator("form").filter({ has: button });
  await checkbox.check();

  const initialFormState = await acceptForm.evaluate((element) => {
    const form = element as HTMLFormElement;
    const diagnosticWindow = window as typeof window & { __acceptSubmitCount?: number };
    diagnosticWindow.__acceptSubmitCount = 0;
    form.addEventListener("submit", () => {
      diagnosticWindow.__acceptSubmitCount = (diagnosticWindow.__acceptSubmitCount ?? 0) + 1;
    });
    return {
      action: form.getAttribute("action"),
      method: form.method,
      valid: form.checkValidity(),
      invalidNames: Array.from(form.elements)
        .filter((field) => field instanceof HTMLInputElement && !field.checkValidity())
        .map((field) => (field as HTMLInputElement).name),
      confirmationChecked: (form.elements.namedItem("confirmation") as HTMLInputElement | null)
        ?.checked,
      buttonDisabled: (form.querySelector('button[type="submit"]') as HTMLButtonElement | null)
        ?.disabled,
    };
  });

  await button.click();

  const expectedPath = `/viagens/${trip.id}/roteiro?propostaAceita=applied`;
  await expect
    .poll(
      async () => {
        const currentUrl = new URL(page.url());
        if (`${currentUrl.pathname}${currentUrl.search}` === expectedPath) return expectedPath;

        const alert = page.getByRole("alert");
        if (await alert.isVisible().catch(() => false)) {
          return `alert:${await alert.textContent()}`;
        }

        const status = page.getByRole("status");
        if (await status.isVisible().catch(() => false)) {
          return `status:${await status.textContent()}`;
        }

        const submitCount = await page.evaluate(
          () =>
            (window as typeof window & { __acceptSubmitCount?: number }).__acceptSubmitCount ?? 0,
        );
        const currentFormState = await acceptForm.evaluate((element) => {
          const form = element as HTMLFormElement;
          return {
            valid: form.checkValidity(),
            confirmationChecked: (
              form.elements.namedItem("confirmation") as HTMLInputElement | null
            )?.checked,
            buttonDisabled: (
              form.querySelector('button[type="submit"]') as HTMLButtonElement | null
            )?.disabled,
          };
        });

        return JSON.stringify({
          url: `${currentUrl.pathname}${currentUrl.search}`,
          initialFormState,
          currentFormState,
          submitCount,
          actionRequests,
        });
      },
      { timeout: 12_000 },
    )
    .toBe(expectedPath);
});
