import path from "node:path";
import { mkdir } from "node:fs/promises";

import { expect, test as setup } from "@playwright/test";

const authFile = path.join(process.cwd(), "playwright/.auth/user.json");

setup("autentica o workspace legado", async ({ page }) => {
  await mkdir(path.dirname(authFile), { recursive: true });

  const email = `routebook-e2e-workspace-${Date.now()}@example.com`;
  await page.goto("/criar-conta?next=%2Fviagens");
  await page.getByLabel("Nome").fill("RouteBook E2E Workspace");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill("routebook-e2e-password");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/viagens$/);
  await page.context().storageState({ path: authFile });
});
