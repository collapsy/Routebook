import { expect, test } from "@playwright/test";

async function createTripWithRecommendationContext(page: import("@playwright/test").Page) {
  const tripName = `Recommendations ${test.info().project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Data de início").fill("2026-08-22");
  await page.getByLabel("Data de término").fill("2026-08-24");
  await Promise.all([
    page.waitForURL(/\/viagens\/[^/?]+$/),
    page.getByRole("button", { name: "Criar viagem" }).click(),
  ]);
  await expect(page.getByRole("heading", { name: tripName })).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/contexto$/),
    page.getByRole("link", { name: "Configurar contexto da viagem" }).click(),
  ]);
  await page.getByRole("checkbox", { name: "Praias" }).check();
  await page.getByRole("checkbox", { name: "Natureza" }).check();
  await Promise.all([
    page.waitForURL(/\/viagens\/[^/]+\?contextoSalvo=1$/),
    page.getByRole("button", { name: "Salvar contexto" }).click(),
  ]);

  await Promise.all([
    page.waitForURL(/\/hospedagem$/),
    page.getByRole("link", { name: "Editar hospedagem" }).click(),
  ]);
  await page.getByLabel("Nome da hospedagem").fill("Condomínio Solar Água");
  await page.getByLabel("Endereço").fill("Pipa, Tibau do Sul — RN");
  await page.getByLabel("Latitude").fill("-6,2302");
  await page.getByLabel("Longitude").fill("-35,0503");
  await Promise.all([
    page.waitForURL(/\/viagens\/[^/]+\?hospedagemSalva=1$/),
    page.getByRole("button", { name: "Salvar hospedagem" }).click(),
  ]);

  return { tripName, tripUrl: new URL(page.url()).pathname };
}

test("apresenta Recommendations explicáveis e preserva a rejeição após recarga", async ({
  page,
}) => {
  const { tripName, tripUrl } = await createTripWithRecommendationContext(page);

  await Promise.all([
    page.waitForURL(/\/recomendacoes$/),
    page.getByRole("link", { name: "Ver sugestões contextualizadas" }).click(),
  ]);
  await expect(page.getByRole("heading", { name: `Sugestões para ${tripName}` })).toBeVisible();
  await expect(page.getByText(/você continua no controle de cada escolha/i)).toBeVisible();

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
  await expect(praiaDoAmor.getByText(/em linha reta/i)).toBeVisible();
  await expect(praiaDoAmor.getByRole("heading", { name: /Confiança/ })).toBeVisible();
  await expect(page.getByText(/score/i)).toHaveCount(0);
  await expect(page.getByText(/\d+%/)).toHaveCount(0);
  await expect(page.getByText(/estrela/i)).toHaveCount(0);

  await Promise.all([
    page.waitForURL(/ignorada=1/),
    praiaDoAmor.getByRole("button", { name: "Ignorar recomendação de Praia do Amor" }).click(),
  ]);
  await expect(page.getByRole("status").first()).toContainText("Recommendation ignorada");

  await page.reload();
  const ignoredPraia = page.getByRole("article", { name: "Praia do Amor" });
  await expect(ignoredPraia.getByText("Recomendação ignorada")).toBeVisible();
  await expect(
    ignoredPraia.getByRole("button", { name: "Ignorar recomendação de Praia do Amor" }),
  ).toHaveCount(0);

  await page.goto(`${tripUrl}/lugares-salvos`);
  await expect(
    page.getByRole("heading", { name: "Você ainda não salvou nenhum lugar" }),
  ).toBeVisible();

  await page.goto(`${tripUrl}/roteiro`);
  await expect(page.getByLabel("Resumo do roteiro")).toContainText("0atividades");
});
