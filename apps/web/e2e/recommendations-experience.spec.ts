import { expect, test, type Page } from "@playwright/test";

test.setTimeout(60_000);

async function createTripWithRecommendationContext(page: Page) {
  const tripName = `Recommendations ${test.info().project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Responsável pela viagem").fill("RouteBook E2E");
  await page.getByLabel("Data de início").fill("2026-08-22");
  await page.getByLabel("Data de término").fill("2026-08-24");
  await Promise.all([
    page.waitForURL(/\/viagens\?created=1$/),
    page.getByRole("button", { name: "Criar viagem" }).click(),
  ]);
  await Promise.all([
    page.waitForURL(/\/viagens\/[^/?]+$/),
    page.getByRole("link", { name: tripName }).click(),
  ]);
  await expect(page.getByRole("heading", { name: tripName })).toBeVisible();
  const tripUrl = new URL(page.url()).pathname;

  await Promise.all([
    page.waitForURL(/\/contexto$/),
    page.getByRole("link", { name: "Configurar contexto" }).click(),
  ]);
  await page.getByRole("checkbox", { name: "Praias" }).check();
  await page.getByRole("checkbox", { name: "Natureza" }).check();
  await Promise.all([
    page.waitForURL(/\/viagens\/[^/]+\?contextUpdated=1$/),
    page.getByRole("button", { name: "Salvar contexto" }).click(),
  ]);

  await page.goto(`${tripUrl}/hospedagem`);
  await page.getByLabel("Nome da hospedagem").fill("Condomínio Solar Água");
  await page.getByLabel("Endereço", { exact: true }).fill("Pipa, Tibau do Sul — RN");
  await page.getByLabel("Latitude", { exact: true }).fill("-6,2302");
  await page.getByLabel("Longitude", { exact: true }).fill("-35,0503");
  await Promise.all([
    page.waitForURL(/\/hospedagem\?saved=1$/),
    page.getByRole("button", { name: "Salvar hospedagem" }).click(),
  ]);

  return { tripName, tripUrl };
}

async function openRecommendations(page: Page, tripUrl: string, tripName: string) {
  await page.goto(`${tripUrl}/recomendacoes`);
  await expect(
    page.getByRole("heading", { name: `Sugestões para ${tripName}`, exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/cada mudança exige uma ação explícita/i)).toBeVisible();
}

test("salva uma Recommendation sem criar Activity e preserva a Decision após recarga", async ({
  page,
}) => {
  const { tripName, tripUrl } = await createTripWithRecommendationContext(page);
  await openRecommendations(page, tripUrl, tripName);

  const recommendation = page.getByRole("article", {
    name: "Baía dos Golfinhos",
    exact: true,
  });
  await Promise.all([
    page.waitForURL(/salva=1/),
    recommendation.getByRole("button", { name: "Salvar lugar" }).click(),
  ]);
  await expect(page.getByRole("status").first()).toContainText("Lugar salvo");

  await page.reload();
  await expect(
    page
      .getByRole("article", { name: "Baía dos Golfinhos", exact: true })
      .getByText("Escolha confirmada"),
  ).toBeVisible();

  await page.goto(`${tripUrl}/lugares-salvos`);
  await expect(
    page.getByRole("heading", { level: 2, name: "Baía dos Golfinhos", exact: true }),
  ).toBeVisible();

  await page.goto(`${tripUrl}/roteiro`);
  await expect(page.getByLabel("Resumo do roteiro")).toContainText("0atividades");
});

test("adiciona uma Recommendation ao Dia escolhido e preserva a Decision após recarga", async ({
  page,
}) => {
  const { tripName, tripUrl } = await createTripWithRecommendationContext(page);
  await openRecommendations(page, tripUrl, tripName);

  const recommendation = page.getByRole("article", {
    name: "Chapadão de Pipa",
    exact: true,
  });
  await expect(recommendation).toBeVisible();
  await recommendation.getByRole("combobox", { name: "Dia" }).selectOption({ index: 1 });
  await recommendation.getByLabel("Horário opcional").fill("10:30");
  await recommendation.getByLabel("Duração opcional").fill("90");
  await Promise.all([
    page.waitForURL(/adicionada=1/),
    recommendation.getByRole("button", { name: "Adicionar ao roteiro" }).click(),
  ]);
  await expect(page.getByRole("status").first()).toContainText("Lugar adicionado");

  await page.reload();
  await expect(
    page
      .getByRole("article", { name: "Chapadão de Pipa", exact: true })
      .getByText("Escolha confirmada"),
  ).toBeVisible();

  await page.goto(`${tripUrl}/roteiro`);
  await expect(
    page.locator(".itinerary-activity-copy strong").filter({ hasText: "Chapadão de Pipa" }),
  ).toBeVisible();
});

test("ignora uma Recommendation sem alterar Lugares salvos ou Roteiro", async ({ page }) => {
  const { tripName, tripUrl } = await createTripWithRecommendationContext(page);
  await openRecommendations(page, tripUrl, tripName);

  const list = page.getByRole("list", { name: "Recommendations de Lugares" });
  await expect(list.getByRole("heading", { level: 2 })).toHaveText([
    "Baía dos Golfinhos",
    "Chapadão de Pipa",
    "Praia do Amor",
    "Vida Noturna na Avenida Baía dos Golfinhos",
    "Centro Gastronômico de Pipa",
  ]);

  const recommendation = page.getByRole("article", { name: "Praia do Amor", exact: true });
  await expect(
    recommendation.getByText(/categoria do Lugar corresponde a um interesse/i),
  ).toBeVisible();
  await expect(recommendation.getByText(/^Distância da hospedagem:/)).toBeVisible();
  await expect(recommendation.getByRole("heading", { name: /Confiança/ })).toBeVisible();
  await expect(page.getByText(/score/i)).toHaveCount(0);
  await expect(page.getByText(/\d+%/)).toHaveCount(0);
  await expect(page.getByText(/estrela/i)).toHaveCount(0);

  await Promise.all([
    page.waitForURL(/ignorada=1/),
    recommendation
      .getByRole("button", { name: "Ignorar recomendação de Praia do Amor" })
      .click(),
  ]);
  await expect(page.getByRole("status").first()).toContainText("Recommendation ignorada");

  await page.reload();
  const ignoredRecommendation = page.getByRole("article", {
    name: "Praia do Amor",
    exact: true,
  });
  await expect(ignoredRecommendation.getByText("Recomendação ignorada")).toBeVisible();
  await expect(
    ignoredRecommendation.getByRole("button", {
      name: "Ignorar recomendação de Praia do Amor",
    }),
  ).toHaveCount(0);

  await page.goto(`${tripUrl}/lugares-salvos`);
  await expect(
    page.getByRole("heading", { name: "Você ainda não salvou nenhum lugar", exact: true }),
  ).toBeVisible();

  await page.goto(`${tripUrl}/roteiro`);
  await expect(page.getByLabel("Resumo do roteiro")).toContainText("0atividades");
});
