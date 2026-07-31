import { expect, test } from "@playwright/test";

async function createTripWithRecommendationContext(page: import("@playwright/test").Page) {
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
  await page.goto(tripUrl);

  return { tripName, tripUrl };
}

test("persiste ignorar, salvar e adicionar Recommendations após recarga", async ({ page }) => {
  const { tripName, tripUrl } = await createTripWithRecommendationContext(page);

  await Promise.all([
    page.waitForURL(/\/recomendacoes$/),
    page.getByRole("link", { name: "Ver sugestões contextualizadas" }).click(),
  ]);
  await expect(page.getByRole("heading", { name: `Sugestões para ${tripName}` })).toBeVisible();
  await expect(page.getByText(/cada mudança exige uma ação explícita/i)).toBeVisible();

  const list = page.getByRole("list", { name: "Recommendations de Lugares" });
  await expect(list).toBeVisible();
  await expect(list.getByRole("heading", { level: 2 })).toHaveText([
    "Baía dos Golfinhos",
    "Chapadão de Pipa",
    "Praia do Amor",
    "Vida Noturna na Avenida Baía dos Golfinhos",
    "Centro Gastronômico de Pipa",
  ]);

  const praiaDoAmor = page.getByRole("article", { name: "Praia do Amor" });
  await expect(
    praiaDoAmor.getByText(/categoria do Lugar corresponde a um interesse/i),
  ).toBeVisible();
  await expect(praiaDoAmor.getByText(/^Distância da hospedagem:/)).toBeVisible();
  await expect(praiaDoAmor.getByRole("heading", { name: /Confiança/ })).toBeVisible();
  await expect(page.getByText(/score/i)).toHaveCount(0);
  await expect(page.getByText(/\d+%/)).toHaveCount(0);
  await expect(page.getByText(/estrela/i)).toHaveCount(0);

  const baiaDosGolfinhos = page.getByRole("article", { name: "Baía dos Golfinhos" });
  await Promise.all([
    page.waitForURL(/salva=1/),
    baiaDosGolfinhos.getByRole("button", { name: "Salvar lugar" }).click(),
  ]);
  await expect(page.getByRole("status").first()).toContainText("Lugar salvo");
  await page.reload();
  await expect(
    page.getByRole("article", { name: "Baía dos Golfinhos" }).getByText("Escolha confirmada"),
  ).toBeVisible();
  await page.goto(`${tripUrl}/lugares-salvos`);
  await expect(page.getByText("Baía dos Golfinhos", { exact: true }).first()).toBeVisible();

  await page.goto(`${tripUrl}/recomendacoes`);
  const chapadao = page.getByRole("article", { name: "Chapadão de Pipa" });
  await chapadao.getByRole("combobox", { name: "Dia" }).selectOption({ index: 1 });
  await chapadao.getByLabel("Horário opcional").fill("10:30");
  await chapadao.getByLabel("Duração opcional").fill("90");
  await Promise.all([
    page.waitForURL(/adicionada=1/),
    chapadao.getByRole("button", { name: "Adicionar ao roteiro" }).click(),
  ]);
  await expect(page.getByRole("status").first()).toContainText("Lugar adicionado");
  await page.reload();
  await expect(
    page.getByRole("article", { name: "Chapadão de Pipa" }).getByText("Escolha confirmada"),
  ).toBeVisible();
  await page.goto(`${tripUrl}/roteiro`);
  await expect(page.getByText("Chapadão de Pipa", { exact: true }).first()).toBeVisible();

  await page.goto(`${tripUrl}/recomendacoes`);
  const recommendationToIgnore = page.getByRole("article", { name: "Praia do Amor" });
  await Promise.all([
    page.waitForURL(/ignorada=1/),
    recommendationToIgnore
      .getByRole("button", { name: "Ignorar recomendação de Praia do Amor" })
      .click(),
  ]);
  await expect(page.getByRole("status").first()).toContainText("Recommendation ignorada");

  await page.reload();
  const ignoredPraia = page.getByRole("article", { name: "Praia do Amor" });
  await expect(ignoredPraia.getByText("Recomendação ignorada")).toBeVisible();
  await expect(
    ignoredPraia.getByRole("button", { name: "Ignorar recomendação de Praia do Amor" }),
  ).toHaveCount(0);

  await page.goto(`${tripUrl}/lugares-salvos`);
  await expect(page.getByText("Baía dos Golfinhos", { exact: true }).first()).toBeVisible();
  await page.goto(`${tripUrl}/roteiro`);
  await expect(page.getByText("Chapadão de Pipa", { exact: true }).first()).toBeVisible();
});
