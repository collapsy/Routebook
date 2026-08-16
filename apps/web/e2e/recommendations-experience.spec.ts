import { expect, test, type Page } from "@playwright/test";

test.setTimeout(120_000);

async function submitAndExpectRedirect(
  page: Page,
  submit: () => Promise<void>,
  expectedUrl: RegExp,
) {
  const currentUrl = page.url();
  await Promise.all([page.waitForURL((url) => url.href !== currentUrl), submit()]);
  await expect(page).toHaveURL(expectedUrl);
}

async function createTripWithoutContext(page: Page) {
  const tripName = `Contexto insuficiente ${test.info().project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
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

  return { tripName, tripUrl: new URL(page.url()).pathname };
}

async function createTripWithRecommendationContext(page: Page) {
  const tripName = `Recommendations ${test.info().project.name} ${Date.now()}`;

  await page.goto("/viagens/nova");
  await page.getByLabel("Nome da viagem").fill(tripName);
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

async function openRecommendations(
  page: Page,
  tripUrl: string,
  tripName: string,
  view: "focused" | "all" = "focused",
) {
  const recommendationUrl =
    view === "all" ? `${tripUrl}/recomendacoes?view=all` : `${tripUrl}/recomendacoes`;
  await page.goto(recommendationUrl);
  await expect(page).toHaveURL(view === "all" ? /\/recomendacoes\?view=all$/ : /\/recomendacoes$/);
  await expect(
    page.getByRole("heading", {
      name: `Sugestões para ${tripName}`,
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(/cada mudança exige uma ação explícita/i)).toBeVisible();

  if (view === "all") {
    await expect(
      page.getByRole("heading", { name: "Lista completa e explicável", exact: true }),
    ).toBeVisible();
  }
}

function consideredRecommendationItem(page: Page, placeName: string) {
  return page
    .getByRole("list", { name: "Recommendations já consideradas" })
    .getByRole("listitem")
    .filter({ hasText: placeName });
}

test("permanece neutra quando o contexto é insuficiente", async ({ page }) => {
  const { tripUrl } = await createTripWithoutContext(page);

  await page.goto(tripUrl);
  await expect(
    page.getByRole("heading", { name: "O que vale a pena considerar?", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Ainda não há contexto suficiente para uma seleção confiável",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("list", { name: "Sugestões contextuais de lugares" })).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Configurar dados para recomendações", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Informar hospedagem" })).toBeVisible();
});

test("mostra decisão contextual sem aplicar uma escolha", async ({ page }) => {
  const { tripUrl } = await createTripWithRecommendationContext(page);

  await page.goto(tripUrl);
  await expect(
    page.getByRole("heading", { name: "O que vale a pena considerar?", exact: true }),
  ).toBeVisible();

  const contextualList = page.getByRole("list", {
    name: "Sugestões contextuais de lugares",
  });
  await expect(contextualList).toBeVisible();
  await expect(contextualList.getByRole("listitem")).toHaveCount(3);
  await expect(contextualList.getByRole("img").first()).toBeVisible();
  await expect(
    contextualList.getByText(/Faixa de preço do catálogo|Faixa de preço: indisponível/).first(),
  ).toBeVisible();
  await expect(page.getByText(/não mede custo real, risco ou impacto de esperar/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver todas as sugestões" })).toBeVisible();
  await expect(
    contextualList.getByRole("link", { name: /Comparar detalhes/ }).first(),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "O que vale a pena considerar?", exact: true }),
  ).toBeVisible();

  await page.goto(`${tripUrl}/lugares-salvos`);
  await expect(
    page.getByRole("heading", {
      name: "Você ainda não salvou nenhum lugar",
      exact: true,
    }),
  ).toBeVisible();

  await page.goto(`${tripUrl}/roteiro`);
  await expect(page.getByLabel("Resumo do roteiro")).toContainText("0atividades");
});

test("foca a lista inicial e preserva a ordem na divulgação completa", async ({ page }) => {
  const { tripName, tripUrl } = await createTripWithRecommendationContext(page);
  await openRecommendations(page, tripUrl, tripName);

  await expect(
    page.getByRole("heading", { name: "Sugestões para decidir agora", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/Exibindo 6 de 30 Recommendations como seleção inicial/i),
  ).toBeVisible();

  const focusedList = page.getByRole("list", { name: "Recommendations de Lugares" });
  const focusedHeadings = focusedList.getByRole("heading", { level: 2 });
  await expect(focusedHeadings).toHaveCount(6);
  const focusedNames = await focusedHeadings.allTextContents();
  const showAllLink = page.getByRole("link", { name: "Ver todas as sugestões", exact: true });
  await expect(showAllLink).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);

  await showAllLink.click();
  await expect(page).toHaveURL(/\/recomendacoes\?view=all$/);
  await expect(
    page.getByRole("heading", { name: "Lista completa e explicável", exact: true }),
  ).toBeVisible();
  const fullList = page.getByRole("list", { name: "Recommendations de Lugares" });
  const fullHeadings = fullList.getByRole("heading", { level: 2 });
  await expect(fullHeadings).toHaveCount(30);
  expect((await fullHeadings.allTextContents()).slice(0, 6)).toEqual(focusedNames);
  await expect(fullList.getByRole("img", { name: /^Imagem não disponível para / })).toHaveCount(24);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);

  const focusLink = page.getByRole("link", { name: "Voltar às sugestões focadas", exact: true });
  await focusLink.click();
  await expect(page).toHaveURL(/\/recomendacoes$/);
  await expect(
    page
      .getByRole("list", { name: "Recommendations de Lugares" })
      .getByRole("heading", { level: 2 }),
  ).toHaveCount(6);
});

test("salva Recommendation sem criar Activity", async ({ page }) => {
  const { tripName, tripUrl } = await createTripWithRecommendationContext(page);
  await openRecommendations(page, tripUrl, tripName, "all");

  const recommendation = page.getByRole("article", {
    name: "Baía dos Golfinhos",
    exact: true,
  });
  await submitAndExpectRedirect(
    page,
    () => recommendation.getByRole("button", { name: "Salvar lugar" }).click(),
    /salva=1/,
  );
  await expect(page.getByRole("status").first()).toContainText("Lugar salvo");

  await page.reload();
  const considered = consideredRecommendationItem(page, "Baía dos Golfinhos");
  await expect(considered).toContainText("Escolha confirmada");
  await expect(considered).toContainText("Lugar salvo");

  await page.goto(`${tripUrl}/lugares-salvos`);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Baía dos Golfinhos",
      exact: true,
    }),
  ).toBeVisible();

  await page.goto(`${tripUrl}/roteiro`);
  await expect(page.getByLabel("Resumo do roteiro")).toContainText("0atividades");
});

test("adiciona Recommendation ao Dia escolhido", async ({ page }) => {
  const { tripName, tripUrl } = await createTripWithRecommendationContext(page);
  await openRecommendations(page, tripUrl, tripName, "all");

  const recommendation = page.getByRole("article", {
    name: "Chapadão de Pipa",
    exact: true,
  });
  await expect(recommendation).toBeVisible();
  await recommendation.getByRole("combobox", { name: "Dia" }).selectOption({ index: 1 });
  await recommendation.getByLabel("Horário opcional").fill("10:30");
  await recommendation.getByLabel("Duração opcional").fill("90");
  await submitAndExpectRedirect(
    page,
    () => recommendation.getByRole("button", { name: "Adicionar ao roteiro" }).click(),
    /adicionada=1/,
  );
  await expect(page.getByRole("status").first()).toContainText("Lugar adicionado");

  await page.reload();
  const considered = consideredRecommendationItem(page, "Chapadão de Pipa");
  await expect(considered).toContainText("Já está no roteiro");

  await page.goto(`${tripUrl}/roteiro`);
  await expect(
    page.locator(".itinerary-activity-copy strong").filter({ hasText: "Chapadão de Pipa" }),
  ).toBeVisible();
});

test("ignora Recommendation sem efeitos colaterais", async ({ page }) => {
  const { tripName, tripUrl } = await createTripWithRecommendationContext(page);
  await openRecommendations(page, tripUrl, tripName, "all");

  const list = page.getByRole("list", { name: "Recommendations de Lugares" });
  await expect(list.getByRole("heading", { level: 2 })).toHaveCount(30);
  await expect(list.getByRole("img", { name: /^Imagem não disponível para / })).toHaveCount(24);

  const newRecommendation = page.getByRole("article", {
    name: "Praia das Minas",
    exact: true,
  });
  await expect(newRecommendation).toBeVisible();
  await expect(
    newRecommendation.getByRole("img", { name: "Imagem não disponível para Praia das Minas" }),
  ).toBeVisible();
  await expect(
    newRecommendation.getByText(/categoria do Lugar corresponde a um interesse/i),
  ).toBeVisible();
  await expect(newRecommendation.getByText(/^Distância da hospedagem:/)).toBeVisible();

  const recommendation = page.getByRole("article", {
    name: "Praia do Amor",
    exact: true,
  });
  await expect(
    recommendation.getByRole("img", {
      name: "Vista da Praia do Amor em Pipa, cercada por falésias e vegetação costeira.",
    }),
  ).toBeVisible();
  await expect(
    recommendation.getByText(/categoria do Lugar corresponde a um interesse/i),
  ).toBeVisible();
  await expect(recommendation.getByText(/^Distância da hospedagem:/)).toBeVisible();
  await expect(recommendation.getByRole("heading", { name: /Confiança/ })).toBeVisible();
  await expect(page.getByText(/score/i)).toHaveCount(0);
  await expect(page.getByText(/\d+%/)).toHaveCount(0);
  await expect(page.getByText(/estrela/i)).toHaveCount(0);

  await submitAndExpectRedirect(
    page,
    () =>
      recommendation
        .getByRole("button", {
          name: "Ignorar recomendação de Praia do Amor",
        })
        .click(),
    /ignorada=1/,
  );
  await expect(page.getByRole("status").first()).toContainText("Recommendation ignorada");

  await page.reload();
  const ignoredRecommendation = consideredRecommendationItem(page, "Praia do Amor");
  await expect(ignoredRecommendation).toContainText("Recomendação ignorada");
  await expect(
    page.getByRole("button", {
      name: "Ignorar recomendação de Praia do Amor",
    }),
  ).toHaveCount(0);

  await page.goto(`${tripUrl}/lugares-salvos`);
  await expect(
    page.getByRole("heading", {
      name: "Você ainda não salvou nenhum lugar",
      exact: true,
    }),
  ).toBeVisible();

  await page.goto(`${tripUrl}/roteiro`);
  await expect(page.getByLabel("Resumo do roteiro")).toContainText("0atividades");
});
