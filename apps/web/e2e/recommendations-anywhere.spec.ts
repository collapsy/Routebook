import { expect, test } from "@playwright/test";

test.setTimeout(120_000);

test("destino zero-seed recebe sugestões de lugares sem expor lifecycle interno", async ({
  page,
}, testInfo) => {
  const suffix = `rb-inc-185-${testInfo.project.name}-${Date.now()}`;
  const tripName = `Floripa sugestões ${suffix}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
  await page.getByLabel("Para onde você vai?").fill("Florianópolis, SC");
  await page.getByLabel("Quando começa?").fill("2026-11-10");
  await page.getByLabel("Quando termina?").fill("2026-11-12");
  await page.getByRole("button", { name: "Criar meu guia" }).click();
  await expect(page).toHaveURL(/\/viagens\?created=1$/);

  const tripLink = page.getByRole("link", { name: tripName });
  const tripHref = await tripLink.getAttribute("href");
  expect(tripHref).toMatch(/^\/viagens\/[0-9a-f-]+$/);

  await page.goto(`${tripHref}/contexto`);
  await page.getByRole("checkbox", { name: "Natureza" }).check();
  await page.getByRole("button", { name: "Salvar contexto" }).click();
  await expect(page).toHaveURL(/\/viagens\/[^/]+\?contextUpdated=1$/);

  await page.goto(`${tripHref}/hospedagem`);
  await page.getByLabel("Nome da hospedagem").fill("Hotel RouteBook Floripa");
  await page.getByLabel("Endereço", { exact: true }).fill("Av. Beira-Mar Norte, Florianópolis");
  await page.getByText("Opções avançadas de localização", { exact: true }).click();
  await page.getByLabel("Latitude", { exact: true }).fill("-27,5949");
  await page.getByLabel("Longitude", { exact: true }).fill("-48,5482");
  await page.getByRole("button", { name: "Salvar hospedagem" }).click();
  await expect(page).toHaveURL(/\/hospedagem\?saved=1&located=1$/);

  await page.goto(`${tripHref}/recomendacoes`);
  await expect(page.getByRole("heading", { name: `Sugestões para ${tripName}` })).toBeVisible();
  await expect(page.getByText("Destino ainda não coberto", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Lugares para considerar agora", exact: true }),
  ).toBeVisible();

  const placesList = page.getByRole("list", { name: "Lugares sugeridos" });
  await expect(placesList).toBeVisible();
  await expect(placesList.getByRole("article")).toHaveCount(3);
  await expect(placesList.getByRole("article").first()).toHaveAccessibleName(
    "Parque descoberto próximo",
  );
  await expect(placesList.getByText(/interesse informado para esta Viagem/)).toBeVisible();
  await expect(placesList.getByText(/em linha reta/).first()).toBeVisible();
  await expect(placesList.getByText("RouteBook E2E", { exact: true }).first()).toBeVisible();
  await expect(placesList.getByRole("button", { name: /Salvar lugar/i })).toHaveCount(0);
  await expect(placesList.getByRole("button", { name: /Adicionar ao roteiro/i })).toHaveCount(0);
  await expect(placesList.getByRole("button", { name: /Ignorar/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Explorar todos os lugares" })).toBeVisible();
  await expect(page.getByText(/Descoberta externa/i)).toHaveCount(0);
  await expect(page.getByText(/Places publicados/i)).toHaveCount(0);
  await expect(page.getByText(/Candidato externo/i)).toHaveCount(0);

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Lugares para considerar agora", exact: true }),
  ).toBeVisible();

  await page.goto(`${tripHref}/lugares-salvos`);
  await expect(
    page.getByRole("heading", { name: "Você ainda não salvou nenhum lugar", exact: true }),
  ).toBeVisible();

  await page.goto(`${tripHref}/roteiro`);
  await expect(page.getByText(/3 dias · 0 atividades/)).toBeVisible();
});
